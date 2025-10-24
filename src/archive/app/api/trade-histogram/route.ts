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

function resolveBucket(tf: string | null, bucket: string | null): { unit: 'hour' | 'day'; fmt: string } {
  if (bucket === 'hour' || (!bucket && (tf === '1h' || tf === '4h' || tf === '6h' || tf === '12h' || tf === '24h' || tf === '1d'))) {
    return { unit: 'hour', fmt: "YYYY-MM-DD HH24:00" };
  }
  return { unit: 'day', fmt: 'YYYY-MM-DD' };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const bucketParam = searchParams.get('bucket'); // 'hour' | 'day' | null
    const marketId = searchParams.get('marketId'); // optional
    const accountId = searchParams.get('accountId'); // optional
    const walletAddress = searchParams.get('walletAddress'); // optional

    const startTimeMs = timeframeToMs(timeframe);
    const { unit, fmt } = resolveBucket(timeframe, bucketParam);

    const whereClauses: string[] = [];
    const params: any[] = [];
    let idx = 1;

    const startEpochSec = Math.floor(startTimeMs / 1000);
    whereClauses.push(`block_timestamp >= $${idx++}`);
    params.push(startEpochSec);
    whereClauses.push(`type IN ('order', 'liquidation')`);

    if (marketId) { whereClauses.push(`market_id = $${idx++}`); params.push(marketId); }
    if (accountId) { whereClauses.push(`account_id = $${idx++}`); params.push(accountId); }

    // Optional wallet filter via latest owner snapshots (apply after join)
    let walletCTE = '';
    let joinWallet = '';
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
      joinWallet = `JOIN latest_owners lo ON f.account_id = lo.account_id`;
      outerWhere = `WHERE lo.wallet = $${idx++}`;
      params.push(walletAddress);
    }

    const bucketExpr = unit === 'hour'
      ? `date_trunc('hour', to_timestamp(f.block_timestamp::bigint))`
      : `date_trunc('day', to_timestamp(f.block_timestamp::bigint))`;

    const sql = `
      WITH filtered AS (
        SELECT block_timestamp, account_id, market_id, order_base, price
        FROM public.order_history
        WHERE ${whereClauses.join(' AND ')}
      )${walletCTE}
      SELECT
        to_char(${bucketExpr}, '${fmt}') AS bucket,
        COALESCE(SUM(ABS((order_base::numeric / 1e18) * (price::numeric / 1e18))), 0) AS total
      FROM filtered f
      ${joinWallet}
      ${outerWhere}
      GROUP BY 1
      ORDER BY 1
    `;

    const result = await dbQuery(sql, params);
    const rows = result.rows.map((r: any) => ({
      bucket: r.bucket as string,
      total: Number(r.total) || 0,
    }));

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('[API /trade-histogram] Error:', error);
    return NextResponse.json({ error: error?.message ?? 'Internal Server Error' }, { status: 500 });
  }
}
