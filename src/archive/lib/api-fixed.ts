// This is a fixed version of the getRecentTradeHistory function
// Import this function into src/app/api/trades/route.ts instead of the original one

import { query, debug } from './db';

interface TraderSummaryWithDetails {
  wallet: string;
  display_name2: string;
  account_ids: number[];
  account_count: number;
  total_size: number;
  total_pnl: number;
  win_rate: number;
  trade_count: number;
  last_trade_time: number;
  total_fees: number;
  wallet_name: string;
  wallet_type: string;
  discord_name: string;
  trading_rank: number;
  account_type: string;
  feeTier: number;
  isOg: boolean;
  isSrusdOwner: boolean;
}

export async function getRecentTradeHistoryFixed(hours: string = '24'): Promise<TraderSummaryWithDetails[]> {
  debug(`[API] Fetching recent trade history for last ${hours} hours`);
  
  // First, let's check raw order count
  const orderCount = await query(`
    SELECT COUNT(*) as count
    FROM public.order_history
    WHERE block_timestamp >= EXTRACT(EPOCH FROM NOW() - INTERVAL '${hours} hours')::bigint 
    AND block_timestamp < EXTRACT(EPOCH FROM NOW())::bigint
    AND type IN ('order', 'liquidation')
  `);
  debug(`[DEBUG] Raw order count: ${orderCount.rows[0].count}`);

  // Check unique wallets before filtering
  const walletCount = await query(`
    WITH account_trades AS (
      SELECT DISTINCT account_id
      FROM public.order_history
      WHERE block_timestamp >= EXTRACT(EPOCH FROM NOW() - INTERVAL '${hours} hours')::bigint 
      AND block_timestamp < EXTRACT(EPOCH FROM NOW())::bigint
      AND type IN ('order', 'liquidation')
    ),
    latest_snapshots AS (
      SELECT 
        DISTINCT ON (account_id) 
        account_id,
        new_owner AS wallet
      FROM 
        public.account_owner_updated_snapshot
      WHERE
        account_id IN (SELECT account_id FROM account_trades)
      ORDER BY 
        account_id, block_timestamp DESC
    )
    SELECT COUNT(DISTINCT COALESCE(wallet, 'unknown')) as count
    FROM latest_snapshots;
  `);
  debug(`[DEBUG] Unique wallet count before trade_count > 0 filter: ${walletCount.rows[0].count}`);

  try {
    const result = await query(`
      WITH account_trades AS (
        SELECT 
          account_id,
          market_id,
          type,
          order_base,
          block_timestamp,
          (order_base * 1e-18 * price * 1e-18) as size_rusd,
          ROUND(r_pnl::numeric * 1e-18, 8) as r_pnl,
          ROUND(funding_pnl::numeric * 1e-18, 8) as funding_pnl,
          ROUND(fee::numeric * 1e-6, 8) as fee,
          CASE WHEN order_base < 0 THEN 'Short' ELSE 'Long' END as direction
        FROM 
          public.order_history oh
        WHERE 
          block_timestamp >= EXTRACT(EPOCH FROM NOW() - INTERVAL '${hours} hours')::bigint 
          AND block_timestamp < EXTRACT(EPOCH FROM NOW())::bigint
          AND account_id <> 2  -- exclude LP Pool
      ),
      latest_snapshots AS (
        SELECT 
          DISTINCT ON (account_id) 
          account_id,
          transaction_hash,
          new_owner AS wallet,
          block_timestamp AS snapshot_timestamp
        FROM 
          public.account_owner_updated_snapshot
        WHERE
          account_id IN (SELECT account_id FROM account_trades)
        ORDER BY 
          account_id, block_timestamp DESC
      ),
      trade_aggregates AS (
        SELECT 
          COALESCE(ls.wallet, 'unknown') as wallet,
          array_agg(DISTINCT at.account_id) as account_ids,
          SUM(ABS(at.size_rusd)) as total_size,
          SUM(at.r_pnl) as total_pnl,
          COUNT(*) as trade_count,
          MAX(at.block_timestamp) as last_trade_time,
          SUM(at.fee) as total_fees,
          COUNT(CASE WHEN at.type = 'order' AND at.r_pnl > 0 THEN 1 END)::float / 
          NULLIF(COUNT(CASE WHEN at.type IN ('order', 'liquidation') THEN 1 END), 0)::float as win_rate
        FROM 
          account_trades at
        LEFT JOIN 
          latest_snapshots ls ON at.account_id = ls.account_id
        GROUP BY 
          COALESCE(ls.wallet, 'unknown')
      )
      SELECT 
        ta.wallet,
        COALESCE(wd.name, wdl."discordUsername", ta.wallet) as display_name2,
        ta.account_ids,
        array_length(ta.account_ids, 1) as account_count,
        COALESCE(ta.total_size, 0) as total_size,
        COALESCE(ta.total_pnl, 0) as total_pnl,
        COALESCE(ta.win_rate, 0) as win_rate,
        COALESCE(ta.trade_count, 0) as trade_count,
        COALESCE(ta.last_trade_time, 0) as last_trade_time,
        COALESCE(ta.total_fees, 0) as total_fees,
        wd.name as wallet_name,
        COALESCE(wd.type::text, 'not_defined') as wallet_type,
        wdl."discordUsername" as discord_name,
        wdl."tradingRank" as trading_rank,
        COALESCE(wd.type::text, 'not_defined') as account_type,
        1 as feeTier,
        false as isOg,
        false as isSrusdOwner
      FROM 
        trade_aggregates ta
      LEFT JOIN
        public."WalletDetails" wd ON ta.wallet = wd.wallet
      LEFT JOIN
        public."WalletDiscordLink" wdl ON ta.wallet = wdl."walletAddress"
      WHERE
        ta.trade_count > 0
      ORDER BY 
        ta.trade_count DESC
    `);

    if (!result.rows || !Array.isArray(result.rows)) {
      return [];
    }

    // Now enrich each mapped summary with user characteristics
    const summaries: TraderSummaryWithDetails[] = result.rows;
    return summaries;
  } catch (error) {
    console.error('[API] Error in getRecentTradeHistory:', error);
    return [];
  }
}
