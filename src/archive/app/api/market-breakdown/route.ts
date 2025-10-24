import { NextRequest, NextResponse } from 'next/server';
import { query as dbQuery } from '@/lib/db';

function timeframeToMs(tf: string): number {
  const now = Date.now();
  switch (tf) {
    case '1h': return now - 1 * 60 * 60 * 1000;
    case '4h': return now - 4 * 60 * 60 * 1000;
    case '6h': return now - 6 * 60 * 60 * 1000;
    case '12h': return now - 12 * 60 * 60 * 1000;
    case '24h':
    case '1d': return now - 24 * 60 * 60 * 1000;
    case '2d': return now - 2 * 24 * 60 * 60 * 1000;
    case '7d': return now - 7 * 24 * 60 * 60 * 1000;
    case '14d': return now - 14 * 24 * 60 * 60 * 1000;
    case '30d': return now - 30 * 24 * 60 * 60 * 1000;
    default: return now - 24 * 60 * 60 * 1000;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const marketId = searchParams.get('marketId'); // optional filter
    const walletAddress = searchParams.get('walletAddress'); // optional wallet scope
    const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '50', 10), 200));

    const startTimeMs = timeframeToMs(timeframe);

    const where: string[] = [];
    const params: any[] = [];
    let idx = 1;

    const startEpochSec = Math.floor(startTimeMs / 1000);
    where.push(`block_timestamp >= $${idx++}`);
    params.push(startEpochSec);
    where.push(`type IN ('order','liquidation')`);
    if (marketId) { where.push(`market_id = $${idx++}`); params.push(marketId); }

    // Optional wallet scope via latest owner snapshot (filter after join)
    let walletCTE = '';
    let walletJoin = '';
    let outerWhere = '';
    if (walletAddress) {
      walletCTE = `,
      latest_owners AS (
        SELECT DISTINCT ON (account_id)
          account_id,
          new_owner AS wallet
        FROM public.account_owner_updated_snapshot
        ORDER BY account_id, block_timestamp DESC
      )`;
      walletJoin = `JOIN latest_owners lo ON f.account_id = lo.account_id`;
      outerWhere = `WHERE lo.wallet = $${idx++}`;
      params.push(walletAddress);
    }

    const sql = `
      WITH filtered AS (
        SELECT market_id, account_id, block_timestamp, order_base, price
        FROM public.order_history
        WHERE ${where.join(' AND ')}
      )${walletCTE},
      volumes_by_market AS (
        SELECT 
          market_id,
          COALESCE(SUM(ABS((order_base::numeric / 1e18) * (price::numeric / 1e18))), 0) AS volume_tf,
          COUNT(*) AS number_of_trades_tf
        FROM filtered f
        ${walletJoin}
        ${outerWhere}
        GROUP BY market_id
      ),
      latest_trackers AS (
        SELECT DISTINCT ON (market_data_id)
          market_data_id,
          open_interest,
          last_funding_rate,
          block_timestamp
        FROM public.market_trackers
        ORDER BY market_data_id, block_timestamp DESC
      )
      SELECT 
        v.market_id,
        v.volume_tf,
        v.number_of_trades_tf,
        COALESCE(lt.open_interest::numeric / 1e18, 0) AS open_interest,
        COALESCE(lt.last_funding_rate::numeric / 1e18, 0) AS current_funding_rate
      FROM volumes_by_market v
      LEFT JOIN latest_trackers lt ON lt.market_data_id = v.market_id
      ORDER BY v.volume_tf DESC
      LIMIT ${limit}
    `;

    const result = await dbQuery(sql, params);
    const rows = result.rows.map((r: any) => ({
      market_id: String(r.market_id),
      volume_tf: Number(r.volume_tf) || 0,
      number_of_trades_tf: Number(r.number_of_trades_tf) || 0,
      open_interest: Number(r.open_interest) || 0,
      current_funding_rate: Number(r.current_funding_rate) || 0,
    }));

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('[API /market-breakdown] Error:', error);
    return NextResponse.json({ error: error?.message ?? 'Internal Server Error' }, { status: 500 });
  }
}
