'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatUSD, formatNumber } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { VolumeHistogram } from '@/components/charts/volume-histogram';
import { SimpleLineChart } from '@/components/charts/line-chart';

async function getStats() {
  const res = await fetch(`/api/stats`, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }
  return res.json();
}

const timeframeOptions = [
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1d' },
  { value: '7d', label: '7d' },
  { value: '14d', label: '14d' },
  { value: '30d', label: '30d' },
];

export default function Home() {
  const [stats, setStats] = useState<any>({
    wallet_count: 0,
    active_wallets_tf: 0,
    new_wallets_tf: 0,
    volume: 0,
    number_of_trades_tf: 0,
    open_interest: 0,
    tvl: 0,
    total_pnl_sum: 0,
    average_win_rate: 0,
    long_short_ratio_volume_tf: { long: 0, short: 0 },
    total_fees_sum: 0,
    net_funding: 0,
    top_markets: [
      { market_id: 'BTC-USD', volume_tf: 0, open_interest: 0, current_funding_rate: 0, number_of_trades_tf: 0 },
      { market_id: 'ETH-USD', volume_tf: 0, open_interest: 0, current_funding_rate: 0, number_of_trades_tf: 0 },
    ],
    position_count: 0,
    top_market_by_volume: '',
    average_leverage: 0,
    total_funding_paid: 0,
    total_funding_received: 0,
  });

  const [volumeHist, setVolumeHist] = useState<{ bucket: string; total: number }[]>([]);
  const [oiSeries, setOiSeries] = useState<{ bucket: string; open_interest: number }[]>([]);
  const [topMarkets, setTopMarkets] = useState<any[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  const [timeframe, setTimeframe] = useState('1d');

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/stats?timeframe=${timeframe}`, { next: { revalidate: 60 } });
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        const newStats = {
          volume: data.volume,
          trades: data.trades,
          activeWallets: data.activewallets,
          totalWallets: data.totalwallets,
          openInterest: data.openinterest,
        };
        setStats(prevStats => ({ ...prevStats, ...newStats }));
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    fetchStats();
  }, [timeframe]);

  useEffect(() => {
    let abort = false;
    async function fetchCharts() {
      try {
        setChartsLoading(true);
        const volRes = await fetch(`/api/trade-histogram?timeframe=${timeframe}`);
        const volData = volRes.ok ? await volRes.json() : [];
        const oiRes = await fetch(`/api/open-interest?timeframe=${timeframe}`);
        const oiData = oiRes.ok ? await oiRes.json() : [];
        const mbRes = await fetch(`/api/market-breakdown?timeframe=${timeframe}&limit=10`);
        const mbData = mbRes.ok ? await mbRes.json() : [];
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
    }
    fetchCharts();
    return () => { abort = true; };
  }, [timeframe]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Panel Row 1: Key Stats */}
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
          {chartsLoading && topMarkets.length === 0 ? (
             <div className="h-[200px] flex items-center justify-center"><Spinner size="small" /></div>
          ) : topMarkets.length > 0 ? (
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
                  {topMarkets.map((market: any) => (
                    <TableRow key={market.market_id}>
                      <TableCell className="font-medium">{market.market_id}</TableCell>
                      <TableCell className="text-right">{formatUSD(market.volume_tf)}</TableCell>
                      <TableCell className="text-right">{formatNumber(market.number_of_trades_tf, 0)}</TableCell>
                      <TableCell className="text-right">{formatUSD(market.open_interest)}</TableCell>
                      <TableCell className="text-right">{`${(market.current_funding_rate * 100).toFixed(4)}%`}</TableCell>
                    </TableRow>
                  ))}
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