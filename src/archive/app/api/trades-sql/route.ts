import { NextResponse } from 'next/server';
import { query as dbQuery } from '@/lib/db'; // Assuming your db helper is in src/lib/db.ts

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_TIMEFRAME_HOURS = 24; // Default to last 24 hours

function getTimeframeStartMs(timeframe: string | null): number {
  const now = Date.now();
  switch (timeframe) {
    case '1h':
      return now - 1 * 60 * 60 * 1000;
    case '6h':
      return now - 6 * 60 * 60 * 1000;
    case '1d':
      return now - 24 * 60 * 60 * 1000;
    case '7d':
      return now - 7 * 24 * 60 * 60 * 1000;
    case '30d':
      return now - 30 * 24 * 60 * 60 * 1000;
    default:
      return now - DEFAULT_TIMEFRAME_HOURS * 60 * 60 * 1000;
  }
}

export async function GET(request: Request) {
  console.log('[API /trades-sql] GET request received');
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe');
    const marketId = searchParams.get('marketId'); // Specific market ID (numeric)
    const accountId = searchParams.get('accountId'); // Specific account ID (numeric)
    const walletAddress = searchParams.get('walletAddress'); // Specific wallet address (string)
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE.toString(), 10);

    const startTimeMs = getTimeframeStartMs(timeframe);
    const offset = (page - 1) * pageSize;

    const queryParams: any[] = [];
    let paramIndex = 1;

    // Filters for order_history table
    let orderHistoryWhereClauses: string[] = [];
    orderHistoryWhereClauses.push(`created_at >= to_timestamp($${paramIndex++} / 1000.0)`);
    queryParams.push(startTimeMs);

    if (marketId) {
      orderHistoryWhereClauses.push(`market_id = $${paramIndex++}`);
      queryParams.push(marketId);
    }
    if (accountId) { // Filter order_history directly if accountId is provided
      orderHistoryWhereClauses.push(`account_id = $${paramIndex++}`);
      queryParams.push(accountId);
    }

    let sqlQuery = `
      WITH latest_owners AS (
        SELECT DISTINCT ON (account_id)
            account_id,
            new_owner AS wallet
        FROM public.account_owner_updated_snapshot
        ORDER BY account_id, block_timestamp DESC
      ),
      order_history_filtered AS (
        SELECT *
        FROM public.order_history
        WHERE ${orderHistoryWhereClauses.join(' AND ')}
      )
      SELECT
          lo.wallet AS trader_wallet,
          array_agg(DISTINCT ohf.account_id) AS account_ids,
          wdl."discordUsername" AS discord_username,
          wdl.rank AS discord_rank,
          aoc.tier_id AS tier_id,
          COALESCE(SUM(ohf.order_base::numeric * ohf.price::numeric), 0) AS total_size,
          COUNT(ohf.id) AS trade_count,
          EXTRACT(EPOCH FROM MAX(ohf.created_at)) * 1000 AS last_trade_time,
          0 AS total_pnl, -- Placeholder
          0 AS win_rate, -- Placeholder
          0 AS total_fees, -- Placeholder
          0 AS funding_paid, -- Placeholder
          0 AS funding_received -- Placeholder
      FROM order_history_filtered ohf
      JOIN latest_owners lo ON ohf.account_id = lo.account_id
      LEFT JOIN public."WalletDiscordLink" wdl ON lo.wallet = wdl."walletAddress"
      LEFT JOIN public.account_owner_configuration aoc ON lo.wallet = aoc.owner_address
    `;

    // WHERE clause for the main query (e.g., filtering by walletAddress)
    let mainQueryWhereClauses: string[] = [];
    if (walletAddress) {
      mainQueryWhereClauses.push(`lo.wallet = $${paramIndex++}`);
      queryParams.push(walletAddress);
    }

    if (mainQueryWhereClauses.length > 0) {
      sqlQuery += ` WHERE ${mainQueryWhereClauses.join(' AND ')}`;
    }

    // GROUP BY clause
    sqlQuery += `
      GROUP BY
          lo.wallet,
          wdl."discordUsername",
          wdl.rank,
          aoc.tier_id
    `;

    // ORDER BY clause - TODO: Make this dynamic based on searchParams.get('sortBy') and searchParams.get('sortOrder')
    const sortBy = searchParams.get('sortBy') || 'trade_count';
    const sortOrder = (searchParams.get('sortOrder') || 'desc').toUpperCase();
    // Basic validation for sortBy to prevent SQL injection, allow only specific column names
    const allowedSortBy = ['trader_wallet', 'total_size', 'trade_count', 'last_trade_time', 'discord_username', 'discord_rank', 'tier_id'];
    const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'trade_count';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'DESC';
    sqlQuery += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;
    
    // LIMIT and OFFSET
    if (pageSize !== -1) {
      sqlQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      queryParams.push(pageSize, offset);
    } else {
      console.log('[API /trades-sql] Fetching all aggregated trader data for the timeframe (pageSize === -1).');
    }

    console.log(`[API /trades-sql] Executing query: ${sqlQuery.replace(/\n/g, ' ').substring(0, 1000)}...`);
    console.log(`[API /trades-sql] Query params: ${JSON.stringify(queryParams)}`);

    const result = await dbQuery(sqlQuery, queryParams);

    const rows = result.rows.map((r: any) => ({
      wallet: r.trader_wallet,
      account_ids: r.account_ids, // This is already an array from array_agg
      total_size: parseFloat(r.total_size) || 0,
      trade_count: parseInt(r.trade_count, 10) || 0,
      last_trade_time: r.last_trade_time ? Number(r.last_trade_time) : 0,
      wallet_details: {
        discord_name: r.discord_username,
        discord_rank: r.discord_rank !== null && r.discord_rank !== undefined ? parseInt(r.discord_rank, 10) : null,
        tier_id: r.tier_id,
      },
      // Placeholders from query, will be processed by frontend's processTradeData
      total_pnl: parseFloat(r.total_pnl) || 0,
      win_rate: parseFloat(r.win_rate) || 0,
      total_fees: parseFloat(r.total_fees) || 0,
      funding_paid: parseFloat(r.funding_paid) || 0,
      funding_received: parseFloat(r.funding_received) || 0,
    }));

    console.log(`[API /trades-sql] Fetched ${rows.length} trades.`);

    return NextResponse.json(rows);

  } catch (error) {
    console.error('[API /trades-sql] Error fetching trades:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
        console.error(error.stack);
    }
    return NextResponse.json({ message: errorMessage, details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
