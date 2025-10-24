'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { formatUSD, formatNumber } from '@/lib/utils';
import { VolumeHistogram } from '@/components/charts/volume-histogram';
import { SimpleLineChart } from '@/components/charts/line-chart';

const timeframeOptions = [
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1d' },
  { value: '7d', label: '7d' },
  { value: '14d', label: '14d' },
  { value: '30d', label: '30d' },
];

interface MarketInfo {
  id: number;
  ticker?: string;
  underlyingAsset?: string;
  quoteToken?: string;
  isActive?: boolean;
}

interface TopMarketRow {
  market_id: string;
  volume_tf: number;
  number_of_trades_tf: number;
  open_interest: number;
  current_funding_rate: number;
}

export default function OverviewPage() {
  const [timeframe, setTimeframe] = useState('1d');
  const [stats, setStats] = useState<any | null>(null);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [volumeHist, setVolumeHist] = useState<{ bucket: string; total: number }[]>([]);
  const [oiSeries, setOiSeries] = useState<{ bucket: string; open_interest: number }[]>([]);
  const [topMarkets, setTopMarkets] = useState<TopMarketRow[]>([]);
  const [marketIdToTicker, setMarketIdToTicker] = useState<Record<string, string>>({});

  // Load markets map once
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/markets');
        const data: MarketInfo[] = res.ok ? await res.json() : [];
        if (!alive) return;
        const map: Record<string, string> = {};
        for (const m of data) {
          const display = m.ticker || (m.underlyingAsset && m.quoteToken ? `${m.underlyingAsset}/${m.quoteToken}` : undefined);
          if (display) {
            map[String(m.id)] = display;
          }
        }
        setMarketIdToTicker(map);
      } catch (e) {
        console.error('Failed to load markets map', e);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Load stats
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/stats?timeframe=${timeframe}`, { next: { revalidate: 60 } });
        const data = res.ok ? await res.json() : null;
        if (!alive) return;
        setStats(data);
      } catch (e) {
        console.error('Failed to fetch stats', e);
        if (!alive) return;
        setStats(null);
      }
    })();
    return () => { alive = false; };
  }, [timeframe]);

  // Load charts + market breakdown
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setChartsLoading(true);
        const [volRes, oiRes, mbRes] = await Promise.all([
          fetch(`/api/trade-histogram?timeframe=${timeframe}`),
          fetch(`/api/open-interest?timeframe=${timeframe}`),
          fetch(`/api/market-breakdown?timeframe=${timeframe}&limit=10`),
        ]);
        const [volData, oiData, mbData] = await Promise.all([
          volRes.ok ? volRes.json() : [],
          oiRes.ok ? oiRes.json() : [],
          mbRes.ok ? mbRes.json() : [],
        ]);
        if (!abort) {
          setVolumeHist(volData || []);
          setOiSeries(oiData || []);
          setTopMarkets(mbData || []);
        }
      } catch (e) {
        if (!abort) {
          setVolumeHist([]);
          setOiSeries([]);
          setTopMarkets([]);
        }
        console.error('Error fetching chart data:', e);
      } finally {
        if (!abort) setChartsLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [timeframe]);

  return (
    <div className="flex-1 space-y-2 p-4 pt-2">
      <div className="w-full mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Panel Row 1: Platform Health & Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">User Base</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div>Total Wallets: <span className="font-bold float-right">{stats ? formatNumber(stats.wallet_count, 0) : <Spinner size="small" />}</span></div>
            <div>Active (TF): <span className="font-bold float-right">{stats ? formatNumber(stats.active_wallets_tf, 0) : <Spinner size="small" />}</span></div>
            <div>New (TF): <span className="font-bold float-right">{stats ? formatNumber(stats.new_wallets_tf, 0) : <Spinner size="small" />}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Trading Activity (TF)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div>Volume: <span className="font-bold float-right">{stats ? formatUSD(stats.volume) : <Spinner size="small" />}</span></div>
            <div>Trades: <span className="font-bold float-right">{stats ? formatNumber(stats.number_of_trades_tf, 0) : <Spinner size="small" />}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Market State (Current)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div>Open Interest: <span className="font-bold float-right">{stats ? formatUSD(stats.open_interest) : <Spinner size="small" />}</span></div>
            <div>TVL: <span className="font-bold float-right">{stats ? formatUSD(stats.tvl) : <Spinner size="small" />}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Panel Row 1b: Charts (TF) */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Trading Volume Over Time (TF)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartsLoading && volumeHist.length === 0 ? (
              <div className="h-[320px] flex items-center justify-center"><Spinner size="small" /></div>
            ) : volumeHist.length > 0 ? (
              <VolumeHistogram data={volumeHist} seriesKeys={["total"]} height={320} />
            ) : (
              <p className="text-sm text-muted-foreground">No data.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Open Interest Over Time (TF)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartsLoading && oiSeries.length === 0 ? (
              <div className="h-[320px] flex items-center justify-center"><Spinner size="small" /></div>
            ) : oiSeries.length > 0 ? (
              <SimpleLineChart data={oiSeries} seriesKeys={["open_interest"]} height={320} />
            ) : (
              <p className="text-sm text-muted-foreground">No data.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Panel Row 2: Aggregate Performance & DEX Financials (TF) */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Trader Performance (TF)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div>Platform P&L: <span className={`font-bold float-right ${stats && stats.total_pnl_sum >= 0 ? 'text-green-600' : 'text-red-600'}`}>{stats ? formatUSD(stats.total_pnl_sum) : <Spinner size="small" />}</span></div>
            <div>Avg. Win Rate: <span className="font-bold float-right">{stats ? `${(stats.average_win_rate * 100).toFixed(1)}%` : <Spinner size="small" />}</span></div>
            <div>Long/Short Ratio (Vol): <span className="font-bold float-right">{stats && stats.long_short_ratio_volume_tf ? `${formatUSD(stats.long_short_ratio_volume_tf.long)} / ${formatUSD(stats.long_short_ratio_volume_tf.short)}` : <Spinner size="small" />}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">DEX Financials (TF)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div>Total Fees: <span className="font-bold float-right">{stats ? formatUSD(stats.total_fees_sum) : <Spinner size="small" />}</span></div>
            <div>Net Funding: <span className={`font-bold float-right ${stats && stats.net_funding >= 0 ? 'text-green-600' : 'text-red-600'}`}>{stats ? formatUSD(stats.net_funding) : <Spinner size="small" />}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Panel Row 3: Top Markets Insights (TF) */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Top Markets (TF)</CardTitle>
        </CardHeader>
        <CardContent>
          {topMarkets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Market</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">Open Interest</TableHead>
                    <TableHead className="text-right">Funding Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMarkets.map((market) => {
                    const mapped = marketIdToTicker[market.market_id];
                    const display = mapped ? `${mapped} (${market.market_id})` : market.market_id;
                    return (
                      <TableRow key={market.market_id}>
                        <TableCell className="font-medium">{display}</TableCell>
                        <TableCell className="text-right">{formatUSD(market.volume_tf)}</TableCell>
                        <TableCell className="text-right">{formatNumber(market.number_of_trades_tf, 0)}</TableCell>
                        <TableCell className="text-right">{formatUSD(market.open_interest)}</TableCell>
                        <TableCell className="text-right">{`${(market.current_funding_rate * 100).toFixed(4)}%`}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No market data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
