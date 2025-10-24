// src/lib/api.ts
export interface Account {
  id: number;
  address: string;
  network: string;
  totalBalance: number;
  totalBalanceChange24HPercentage: number;
  realizedPnlHistoryTotal: number;
  livePnL: number;
  totalPositionsCount: number;
  marginRatioHealth: string;
  positions: Position[];
}

export interface Transaction {
  id: number;
  type: string;
  token: string;
  amount: number;
  transactionLink: string;
  status: string;
  timestamp: number;
}

export interface TradeHistoryResult {
  wallet: string;
  account_ids: number[];
  total_size: number;
  total_pnl: number;
  trade_count: number;
  last_trade_time: number;
  win_rate: number;
  wallet_name: string | null;
  wallet_type: string | null;
  discord_name: string | null;
  trading_rank: number | null;
  account_type: string | null;
  display_name2: string;
  account_count: number;
}

export interface TraderSummaryWithDetails {
  feeTier?: number;
  isOg?: boolean;
  wallet: string;
  account_ids: number[];
  total_size: number;
  total_pnl: number;
  trade_count: number;
  last_trade_time: number;
  win_rate: number;
  volume_color: string;
  wallet_details: {
    name: string | null;
    type: string;
    discord_name: string | null;
    trading_rank: number | null;
    account_type: string;
  } | null;
}

export interface TradeDetails {
  account_id: number;
  account_name: string | null;
  wallet: string;
  type: string;
  order_base: number;
  price: number;
  r_pnl: number;
  block_timestamp: number;
}

export interface WalletDetails {
  walletAddress: string;
  discordId: string | null;
  discordUsername: string | null;
  discordDiscriminator: string | null;
  discordGlobalName: string | null;
  discordAvatar: string | null;
  discordLocale: string | null;
  discordEmail: string | null;
  rank: string | null;
  createdAt: Date;
  updatedAt: Date;
  rankClaimedAt: Date | null;
  tradingRank: string | null;
}

export interface AccountDetails {
  id: number;
  name: string;
  marginRatioHealth: string;
  marginRatioPercentage: number;
  totalBalance: number;
  liquidationMarginRequirement: number;
  totalBalanceUnderlyingAsset: string;
  totalBalanceWithHaircut: number;
  marginRatioHealthDangerThreshold: number;
  marginRatioHealthWarningThreshold: number;
  collaterals: Collateral[];
  totalBalanceChange24HPercentage: number;
  livePnL: number;
  livePnLUnderlyingAsset: string;
  realizedPnL: number;
  realizedPnlHistoryTotal: number;
  realizedPnLUnderlyingAsset: string;
  totalPositionsCount: number;
  positions: Position[];
  isApproachingLiquidation: boolean;
  isLiquidationImminent: boolean;
}

export interface Collateral {
  token: string;
  percentage: number;
  balance: number;
  balanceRUSD: number;
  balanceWithHaircutRUSD: number;
  exchangeRate: number;
  exchangeRateChange24HPercentage: number;
}

export interface Position {
  // User characteristics enrichment
  feeTier?: number;
  isOg?: boolean;
  isSrusdOwner?: boolean;
  id: number;
  timestamp: number;
  action: string;
  executionPrice: number;
  fees: number;
  openingFees: number;
  market: string;
  orderType: string;
  realisedPnl: number;
  priceVariationPnl: number;
  fundingPnl: number;
  base: number;
  xpEarned: number;
  side: string;
  size: number;
  price: number;
  value: number;
  displaySize: string;
}

export interface RawTransaction {
  id: number;
  type: string;
  token: string;
  amount: number;
  transactionLink: string;
  status: string;
  timestamp: number;
}

export interface Market {
  id: number;
  name: string;
  symbol: string;
  price: number;
  priceChange24H: number;
  liquidity: number;
}

export type ApiError = {
  message: string;
  status: number;
};

import { query } from './db';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.reya.xyz/api';

export const api = {
  getAccounts,
  getTransactions,
  getWalletByAccountId,
  getPositions,
  getDiscordDetails,
  getAccountDetails,
  getRecentTradeHistory,
  getAccountTradeHistory,
  getWalletDetails,
  getTraderSummary,
  getTraderHistory,
  getMarkets,
};

// Debug utility function
const debug = (message: string, enabled?: boolean, ...args: unknown[]) => {
  if (process.env.DEBUG === 'true' || enabled === true) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
};

export async function getAccounts(address: string): Promise<Account[]> {
  try {
    const url = `${API_BASE_URL}/accounts/${address}`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }

    const text = await res.text();
    if (!text) {
      return [];
    }

    try {
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : [];
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError);
      return [];
    }
  } catch (error) {
    console.error('[API] Error fetching accounts:', error);
    return [];
  }
}

export async function getTransactions(accountId: number): Promise<Transaction[]> {
  try {
    const url = `${API_BASE_URL}/accounts/${accountId}/transaction-history`;
    debug(`[API] Fetching transactions from URL: ${url}`);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }

    const data = await res.json();
    debug(`[API] Raw transaction data:`, data);

    const transactions: Transaction[] = data.map((tx: RawTransaction) => ({
      id: tx.id,
      type: tx.type,
      token: tx.token,
      amount: tx.amount,
      transactionLink: tx.transactionLink,
      status: tx.status,
      timestamp: tx.timestamp
    }));

    return transactions;
  } catch (error) {
    console.error('[API] Error fetching transactions:', error);
    throw error;
  }
}

export async function getWalletByAccountId(accountId: number): Promise<string | null> {
  try {
    const result = await query(`
      SELECT 
        DISTINCT ON (account_id) account_id,
        new_owner AS wallet
      FROM 
        public.account_owner_updated_snapshot
      WHERE
        account_id = $1
      ORDER BY 
        account_id, block_timestamp DESC
      LIMIT 1
    `, [accountId]);

    return result.rows[0]?.wallet || null;
  } catch (error) {
    console.error('Error fetching wallet by account ID:', error);
    return null;
  }
}

// Fetch user characteristics for a given wallet address from the DB
async function getUserCharacteristics(address: string): Promise<{ feeTier: number, isOg: boolean, isSrusdOwner: boolean }> {
  // Compose the same logic as in the trade queries
  const result = await query(`
    WITH srUSD_owners AS (
      SELECT action_metadata_on_behalf_of AS user
      FROM lp_unified_account_balance_entries
      WHERE action_metadata_action = 6 OR action_metadata_action = 8
      GROUP BY action_metadata_on_behalf_of
    )
    SELECT
      fees.tier_id AS "feeTier",
      CASE WHEN fees.og_status = TRUE THEN TRUE ELSE FALSE END AS "isOg",
      CASE WHEN srusd.user IS NOT NULL THEN TRUE ELSE FALSE END AS "isSrusdOwner"
    FROM public.account_owner_configuration fees
    LEFT JOIN srUSD_owners srusd ON srusd.user = fees.owner_address
    WHERE fees.owner_address = $1
    LIMIT 1
  `, [address]);

  if (result.rows.length > 0) {
    return {
      feeTier: result.rows[0].feeTier ?? 1,
      isOg: result.rows[0].isOg ?? false,
      isSrusdOwner: result.rows[0].isSrusdOwner ?? false
    };
  }
  // Fallback/defaults if not found
  return {
    feeTier: 1,
    isOg: false,
    isSrusdOwner: false
  };
}

export async function getPositions(
  address: string, 
  accountId: string, 
  page = 1, 
  perPage = 300
): Promise<Position[]> {
  debug(`Fetching positions for account: ${address}/${accountId} with page ${page} and perPage ${perPage}`);
  try {
    const url = `https://api.reya.xyz/api/accounts/${address}/marginAccount/${accountId}/positions/history/paginated?page=${page}&perPage=${perPage}`;
    debug(`Fetching from URL: ${url}`);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }

    const data = await res.json();
    // Check if data is in the expected format
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.error('[API] Unexpected data format:', data);
      return [];
    }

    // Fetch user characteristics for enrichment
    const userCharacteristics = await getUserCharacteristics(address);

    // Map API response to UI model with field transformations
    const positions: Position[] = data.data.map((position: any) => {
      // Determine if it's a short position based on the action
      const isShort = position.action?.includes('short');
      
      // Calculate size with sign (negative for shorts)
      const signedSize = isShort ? -position.base : position.base;
      
      // Calculate value with sign (negative for shorts)
      const signedValue = isShort ? -(position.base * position.executionPrice) : (position.base * position.executionPrice);
      
      return {
        id: position.id,
        timestamp: position.timestamp,
        action: position.action,
        size: signedSize,
        displaySize: `${signedSize} ${position.underlyingAsset || ''}`,
        price: position.executionPrice,
        value: signedValue,
        fees: position.fees,
        openingFees: position.openingFees,
        market: position.marketId,
        orderType: position.orderType,
        realisedPnl: position.realisedPnl,
        priceVariationPnl: position.priceVariationPnl,
        fundingPnl: position.fundingPnl,
        xpEarned: position.xpEarned,
        side: isShort ? 'short' : 'long',
        // Enrich with user characteristics
        feeTier: userCharacteristics?.feeTier,
        isOg: userCharacteristics?.isOg,
        isSrusdOwner: userCharacteristics?.isSrusdOwner
      };
    });

    return positions;
  } catch (error) {
    console.error('[API] Error fetching positions:', error);
    throw error;
  }
}

export async function getDiscordDetails(address: string): Promise<WalletDetails | null> {
  try {
    const result = await query(`
      SELECT "walletAddress", "discordId", "discordUsername", "discordDiscriminator", 
             "discordGlobalName", "discordAvatar", "discordLocale", "discordEmail", 
             rank, "createdAt", "updatedAt", "rankClaimedAt", "tradingRank"
      FROM public."WalletDiscordLink"
      WHERE LOWER("walletAddress") = LOWER($1)
      LIMIT 1
    `, [address]);

    if (result.rows.length === 0) {
      return null;
    }

    // Parse dates
    const details = result.rows[0];
    details.createdAt = new Date(details.createdAt);
    details.updatedAt = new Date(details.updatedAt);
    details.rankClaimedAt = details.rankClaimedAt ? new Date(details.rankClaimedAt) : null;

    return details;
  } catch (error) {
    console.error('[API] Error fetching Discord details:', error);
    return null;
  }
}

export async function getAccountDetails(address: string, accountId: number): Promise<AccountDetails> {
  try {
    const url = `${API_BASE_URL}/accounts/${address}/marginAccount/${accountId}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('[API] Error fetching account details:', error);
    throw error;
  }
}

export async function getRecentTradeHistory(hours: string = '24'): Promise<TraderSummaryWithDetails[]> {
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
        COALESCE(uc.feeTier, 1) as feeTier,
        COALESCE(uc.isOg, false) as isOg,
        COALESCE(uc.isSrusdOwner, false) as isSrusdOwner
      FROM 
        trade_aggregates ta
      LEFT JOIN
        public."WalletDetails" wd ON ta.wallet = wd.wallet
      LEFT JOIN
        public."WalletDiscordLink" wdl ON ta.wallet = wdl."walletAddress"
      -- UserCharacteristics table doesn't exist, using default values instead
      WHERE
        ta.trade_count > 0
      ORDER BY 
        ta.trade_count DESC
    `);

    if (!result.rows || !Array.isArray(result.rows)) {
      return [];
    }

    // Now enrich each mapped summary with user characteristics
    const summaries: TraderSummaryWithDetails[] = await Promise.all(
      result.rows
        .filter((row): row is NonNullable<typeof row> => {
          if (!row) {
            console.error('[API] Row is null');
            return false;
          }
          return true;
        })
        .map(async (row) => {
          const winRate = Number(row.win_rate ?? 0);
          const totalSize = Number(row.total_size ?? 0);
          const tradeCount = Number(row.trade_count ?? 0);
          const totalPnl = Number(row.total_pnl ?? 0);
          const lastTradeTime = Number(row.last_trade_time ?? 0);
          const tradingRank = row.trading_rank ? Number(row.trading_rank) : null;

          // Determine volume color based on win rate
          const volumeColor = !winRate || winRate === 0 ? 'black' 
            : winRate < 0.5 ? 'red' 
            : 'green';

          // Only create wallet details if we have either name or discord info
          const walletDetails = (row.wallet_name || row.discord_name) ? {
            name: row.wallet_name || null,
            type: row.wallet_type,
            discord_name: row.discord_name || null,
            trading_rank: tradingRank,
            account_type: row.account_type
          } : null;

          // Enrich with user characteristics
          let feeTier: number | undefined = undefined;
          let isOg: boolean | undefined = undefined;
          if (row.wallet) {
            try {
              const userChar = await getUserCharacteristics(row.wallet);
              feeTier = userChar.feeTier;
              isOg = userChar.isOg;
            } catch (e) {
              // leave as undefined
            }
          }

          return {
            wallet: row.wallet || '',
            account_ids: row.account_ids?.map(String) || [],
            total_size: totalSize,
            total_pnl: totalPnl,
            trade_count: tradeCount,
            last_trade_time: lastTradeTime,
            win_rate: winRate,
            volume_color: volumeColor,
            wallet_details: walletDetails,
            feeTier,
            isOg
          } satisfies TraderSummaryWithDetails;
        })
    );
    // Return only the async-enriched summaries
    return summaries;
  } catch (error) {
    console.error('[API] Error in getRecentTradeHistory:', error);
    throw error;
  }
}

export interface TradeDetailsWithCharacteristics extends TradeDetails {
  feeTier?: number;
  isOg?: boolean;
  isSrusdOwner?: boolean;
}

export async function getAccountTradeHistory(address: string): Promise<TradeDetailsWithCharacteristics[]> {
  debug(`Fetching trade history for address: ${address}`);
  try {
    const result = await query(`
      WITH latest_snapshots AS (
        SELECT DISTINCT ON (account_id)
          account_id,
          transaction_hash,
          new_owner AS wallet,
          block_timestamp AS snapshot_timestamp
        FROM public.account_owner_updated_snapshot
        ORDER BY account_id, block_timestamp DESC
      ),
      srUSD_owners AS (
        SELECT action_metadata_on_behalf_of AS user
        FROM lp_unified_account_balance_entries
        WHERE action_metadata_action = 6 OR action_metadata_action = 8
        GROUP BY action_metadata_on_behalf_of
      ),
      user_characteristics AS (
        SELECT
          a.new_owner AS user,
          fees.tier_id AS feeTier,
          CASE WHEN fees.og_status = TRUE THEN TRUE ELSE FALSE END AS isOg,
          CASE WHEN srusd.user IS NOT NULL THEN TRUE ELSE FALSE END AS isSrusdOwner
        FROM public.account_owner_updated_snapshot a
        LEFT JOIN public.account_owner_configuration fees ON fees.owner_address = a.new_owner
        LEFT JOIN srUSD_owners srusd ON srusd.user = a.new_owner
      )
      SELECT 
        oh.account_id,
        wd.name as account_name,
        ls.wallet,
        oh.type,
        oh.order_base::numeric / 1e18 as order_base,
        oh.price::numeric / 1e18 as price,
        oh.r_pnl::numeric / 1e18 as r_pnl,
        oh.block_timestamp,
        COALESCE(uc.feeTier, 1) as feeTier,
        COALESCE(uc.isOg, false) as isOg,
        COALESCE(uc.isSrusdOwner, false) as isSrusdOwner
      FROM public.order_history oh
      LEFT JOIN latest_snapshots ls ON oh.account_id = ls.account_id
      LEFT JOIN public."WalletDetails" wd ON ls.wallet = wd.wallet
      LEFT JOIN user_characteristics uc ON ls.wallet = uc.user
      WHERE ls.wallet = $1
      ORDER BY oh.block_timestamp DESC
      LIMIT 100
    `, [address]);

    debug(`Found ${result.rows.length} trades for address ${address}`);
    return result.rows;
  } catch (error) {
    console.error('[API] Error fetching trade history:', error);
    return [];
  }
}

export async function getWalletDetails(wallet: string): Promise<WalletDetails | null> {
  debug(`Fetching wallet details for: ${wallet}`);
  try {
    const result = await query(`
      SELECT "walletAddress", "discordId", "discordUsername", "discordDiscriminator", 
             "discordGlobalName", "discordAvatar", "discordLocale", "discordEmail", 
             rank, "createdAt", "updatedAt", "rankClaimedAt", "tradingRank"
      FROM public."WalletDiscordLink"
      WHERE "walletAddress" = $1
      LIMIT 1
    `, [wallet]);

    if (result.rows.length === 0) {
      return null;
    }

    // Parse dates
    const details = result.rows[0];
    details.createdAt = new Date(details.createdAt);
    details.updatedAt = new Date(details.updatedAt);
    details.rankClaimedAt = details.rankClaimedAt ? new Date(details.rankClaimedAt) : null;

    return details;
  } catch (error) {
    console.error('[API] Error fetching wallet details:', error);
    return null;
  }
}

export async function getTraderSummary(address: string): Promise<Record<string, unknown> | ApiError> {
  debug(`Fetching trader summary for: ${address}`);
  try {
    const url = `${API_BASE_URL}/traders/${address}/summary`;
    const res = await fetch(url);
    if (!res.ok) {
      return { status: res.status, message: 'Failed to fetch trader summary' };
    }
    const data = await res.json();
    debug(`Trader summary data:`, data);
    return data;
  } catch (error) {
    console.error('[API] Error fetching trader summary:', error);
    return { status: 500, message: 'Internal server error' };
  }
}

export async function getTraderHistory(address: string): Promise<Record<string, unknown> | ApiError> {
  debug(`Fetching trader history for: ${address}`);
  try {
    const url = `${API_BASE_URL}/traders/${address}/history`;
    const res = await fetch(url);
    if (!res.ok) {
      return { status: res.status, message: 'Failed to fetch trader history' };
    }
    const data = await res.json();
    debug(`Trader history data:`, data);
    return data;
  } catch (error) {
    console.error('[API] Error fetching trader history:', error);
    return { status: 500, message: 'Internal server error' };
  }
}

export async function getMarkets(): Promise<Market[]> {
  try {
    const res = await fetch('https://api.reya.xyz/api/markets');
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[API] Error fetching markets:', error);
    return [];
  }
}