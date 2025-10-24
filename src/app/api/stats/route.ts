import { dbQuery } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const interval = searchParams.get('timeframe') || '1d';

  try {
    const query = `
      WITH TimeFrame AS (
        SELECT EXTRACT(EPOCH FROM NOW() - $1::interval) AS start_epoch
      ),
      OrderStats AS (
        SELECT
          COALESCE(SUM(ABS(order_base) / 1e18 * price / 1e18), 0) AS volume,
          COUNT(*) AS trades,
          COUNT(DISTINCT account_id) AS active_wallets
        FROM public.order_history, TimeFrame
        WHERE block_timestamp >= start_epoch AND type IN ('order', 'liquidation')
      ),
      WalletStats AS (
        SELECT COUNT(DISTINCT new_owner) AS total_wallets
        FROM public.account_owner_updated_snapshot
      ),
      OpenInterestStats AS (
        SELECT COALESCE(SUM(open_interest) / 1e18, 0) AS open_interest
        FROM (
          SELECT DISTINCT ON (market_data_id) open_interest
          FROM public.market_trackers
          ORDER BY market_data_id, block_timestamp DESC
        ) AS latest_market_trackers
      )
      SELECT
        (SELECT volume FROM OrderStats) AS volume,
        (SELECT trades FROM OrderStats) AS trades,
        (SELECT active_wallets FROM OrderStats) AS active_wallets,
        (SELECT total_wallets FROM WalletStats) AS total_wallets,
        (SELECT open_interest FROM OpenInterestStats) AS open_interest;
    `;

    const data = await dbQuery(query, [interval]);
    return NextResponse.json(data[0]);

  } catch (error) {
    console.error('API Stats Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
