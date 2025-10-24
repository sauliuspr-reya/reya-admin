import { NextResponse } from 'next/server';
import { query as dbQuery } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get('market');
    const sortBy = searchParams.get('sortBy') || 'pnl';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let orderByClause = '';
    switch (sortBy) {
      case 'pnl':
        orderByClause = 'ORDER BY realized_pnl';
        break;
      case 'size':
        orderByClause = 'ORDER BY size_rusd';
        break;
      case 'marginRatio':
        orderByClause = 'ORDER BY margin_ratio';
        break;
      default:
        orderByClause = 'ORDER BY realized_pnl';
    }
    orderByClause += sortOrder === 'asc' ? ' ASC' : ' DESC';

    const marketFilter = market && market !== 'all' ? 'AND pr.market_id = $1' : '';

    const query = `
      WITH latest_owners AS (
        SELECT DISTINCT ON (account_id) 
          account_id,
          new_owner as wallet
        FROM public.account_owner_updated_snapshot
        ORDER BY account_id, block_timestamp DESC
      )
      SELECT 
        pr.account_id,
        lo.wallet,
        pr.market_id as market,
        pr.base::numeric / 1e18 as size,
        ABS(pr.base::numeric / 1e18 * pr.last_price::numeric / 1e18) as size_rusd,
        pr.last_price::numeric / 1e18 as price,
        pr.adl_unwind_price::numeric / 1e18 as liquidation_price,
        pr.realized_pnl_latest_snapshot::numeric / 1e21 as unrealized_pnl,
        CASE 
          WHEN ABS(pr.base) > 0 
          THEN (ABS(pr.base::numeric / 1e18 * pr.last_price::numeric / 1e21)) / (pr.base_multiplier::numeric / 1e18)
          ELSE 0 
        END as margin_ratio,
        wd."discordUsername",
        wd."discordGlobalName"
      FROM public.position_raw pr
      LEFT JOIN latest_owners lo ON pr.account_id = lo.account_id
      LEFT JOIN public."WalletDiscordLink" wd ON lo.wallet = wd."walletAddress"
      WHERE pr.base != 0
      ${marketFilter}
      ${orderByClause}
    `;

    const params = market && market !== 'all' ? [market] : [];
    const result = await dbQuery(query, params);

    // parse numeric fields and default to 0 to prevent NaN
    const rows = result.rows.map((r: any) => ({
      ...r,
      size: Number(r.size) || 0,
      size_rusd: Number(r.size_rusd) || 0,
      price: Number(r.price) || 0,
      liquidation_price: Number(r.liquidation_price) || 0,
      unrealized_pnl: Number(r.unrealized_pnl) || 0,
      margin_ratio: Number(r.margin_ratio) || 0,
    }));
    // debug any rows that might have NaN
    const bad = rows.filter(r => [r.size, r.size_rusd, r.price, r.liquidation_price, r.unrealized_pnl, r.margin_ratio].some(v => isNaN(v)));
    if (bad.length) console.debug('Positions with NaN values:', bad);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json([]);
  }
}
