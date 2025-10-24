import { NextResponse } from 'next/server';
import { query as dbQuery } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '1d';

    function timeframeToInterval(tf: string): string {
      switch (tf) {
        case '1h': return '1 hour';
        case '4h': return '4 hours';
        case '12h': return '12 hours';
        case '1d': return '1 day';
        case '2d': return '2 days';
        case '7d': return '7 days';
        case '14d': return '14 days';
        case '30d': return '30 days';
        default: return '1 day';
      }
    }
    const interval = timeframeToInterval(timeframe);

    const query = `
      WITH TimeFrame AS (
          SELECT EXTRACT(EPOCH FROM NOW() - '${interval}'::interval) AS start_epoch
      ),
      OrderStats AS (
          SELECT
              COALESCE(SUM(ABS(order_base) / 1e18 * price / 1e18), 0) AS volume,
              COUNT(*) AS trades,
              COUNT(DISTINCT account_id) AS activeWallets
          FROM public.order_history, TimeFrame
          WHERE block_timestamp >= start_epoch AND type IN ('order', 'liquidation')
      ),
      WalletStats AS (
          SELECT COUNT(DISTINCT new_owner) AS totalWallets
          FROM public.account_owner_updated_snapshot
      ),
      OpenInterestStats AS (
          SELECT COALESCE(SUM(open_interest) / 1e18, 0) AS openInterest
          FROM (
              SELECT DISTINCT ON (market_data_id) open_interest
              FROM public.market_trackers
              ORDER BY market_data_id, block_timestamp DESC
          ) AS latest_market_trackers
      )
      SELECT
          (SELECT volume FROM OrderStats) AS volume,
          (SELECT trades FROM OrderStats) AS trades,
          (SELECT activeWallets FROM OrderStats) AS activewallets,
          (SELECT totalWallets FROM WalletStats) AS totalwallets,
          (SELECT openInterest FROM OpenInterestStats) AS openinterest;
    `;

    const result = await dbQuery(query);
    const stats = result.rows[0];

    return NextResponse.json(stats);

  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

