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
    case '90d': return now - 90 * 24 * 60 * 60 * 1000;
    default: return now - 7 * 24 * 60 * 60 * 1000;
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
    const timeframe = searchParams.get('timeframe') || '7d';
    const bucketParam = searchParams.get('bucket'); // 'hour' | 'day'
    const marketId = searchParams.get('marketId'); // optional: limit to a market

    const startMs = timeframeToMs(timeframe);
    const startEpochSec = Math.floor(startMs / 1000);
    const { unit, fmt } = resolveBucket(timeframe, bucketParam);

    const where: string[] = [
      `block_timestamp >= $1`
    ];
    const params: any[] = [startEpochSec];

    if (marketId) { where.push(`market_data_id = $${params.length + 1}`); params.push(marketId); }

    const bucketExpr = unit === 'hour'
      ? `date_trunc('hour', to_timestamp(block_timestamp::bigint))`
      : `date_trunc('day', to_timestamp(block_timestamp::bigint))`;

    const sql = `
      WITH base AS (
        SELECT 
          ${bucketExpr} AS bucket_ts,
          block_timestamp,
          open_interest
        FROM public.market_trackers_history
        WHERE ${where.join(' AND ')}
      ), ranked AS (
        SELECT 
          bucket_ts,
          open_interest,
          ROW_NUMBER() OVER (PARTITION BY bucket_ts ORDER BY block_timestamp DESC) AS rn
        FROM base
      )
      SELECT 
        to_char(bucket_ts, '${fmt}') AS bucket,
        COALESCE((open_interest::numeric) / 1e18, 0) AS open_interest
      FROM ranked
      WHERE rn = 1
      ORDER BY bucket_ts
    `;

    const result = await dbQuery(sql, params);
    const rows = result.rows.map((r: any) => ({
      bucket: r.bucket as string,
      open_interest: Number(r.open_interest) || 0,
    }));

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('[API /open-interest] Error:', error);
    return NextResponse.json({ error: error?.message ?? 'Internal Server Error' }, { status: 500 });
  }
}
