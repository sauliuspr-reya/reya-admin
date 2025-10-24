'use client';

import React, { useEffect, useState, useMemo, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { formatUSD, formatNumber } from '@/lib/utils';
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';

interface Position {
  account_id: string;
  wallet: string;
  market: string;
  size: number;
  size_rusd: number;
  price: number;
  liquidation_price: number;
  unrealized_pnl: number;
  margin_ratio: number;
  discordUsername?: string;
  discordGlobalName?: string;
}

interface Market {
  id: number;
  ticker: string;
  underlyingAsset: string;
  quoteToken: string;
  markPrice: number;
  isActive: boolean;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState('all');
  const [minMarginRatio, setMinMarginRatio] = useState('0');
  const [sortBy, setSortBy] = useState('pnl');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const response = await fetch('/api/markets');
        if (!response.ok) {
          throw new Error('Failed to fetch markets');
        }
        const data = await response.json();
        setMarkets(data.filter((m: Market) => m.isActive));
      } catch (error) {
        console.error('Error fetching markets:', error);
      }
    }

    fetchMarkets();
  }, []);

  useEffect(() => {
    async function fetchPositions() {
      try {
        const params = new URLSearchParams();
        if (market !== 'all') {
          params.append('market', market);
        }
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
        
        const response = await fetch(`/api/positions?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch positions');
        }
        const data = await response.json();
        setPositions(data);
      } catch (error) {
        console.error('Error fetching positions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPositions();
  }, [market, sortBy, sortOrder]);

  const filteredPositions = positions.filter(position => {
    const marginRatioFilter = parseFloat(minMarginRatio) || 0;
    return position.margin_ratio >= marginRatioFilter;
  });

  const sortOptions = [
    { value: 'pnl', label: 'PnL' },
    { value: 'size', label: 'Position Size' },
    { value: 'marginRatio', label: 'Margin Ratio' },
  ];

  const getMarketToken = (marketId: string) => {
    const market = markets.find(m => m.id.toString() === marketId);
    return market ? market.quoteToken : marketId;
  };

  const getMarketDisplay = (marketId: string) => {
    const market = markets.find(m => m.id.toString() === marketId);
    if (!market) return marketId;
    // Prefer human-friendly symbol over numeric ID
    if (market.ticker) return market.ticker;
    if (market.underlyingAsset && market.quoteToken) return `${market.underlyingAsset}/${market.quoteToken}`;
    return market.quoteToken || marketId;
  };

  const formatSize = (size: number, price: number) => {
    const sizeInUSD = Math.abs(size * price);
    return `${formatNumber(size, 3)} (${formatUSD(sizeInUSD)})`;
  };

  // Stats calculations for unique accounts and wallets
  const uniqueAccounts = new Set(filteredPositions.map(p => p.account_id)).size;
  const uniqueWallets = new Set(filteredPositions.map(p => p.wallet)).size;
  const walletGroups = filteredPositions.reduce<Record<string, { sizeUSD: number; pnl: number; accounts: Set<string>; discords: Set<string>; }>>(
    (acc, p) => {
      if (!acc[p.wallet]) acc[p.wallet] = { sizeUSD: 0, pnl: 0, accounts: new Set(), discords: new Set() };
      acc[p.wallet].sizeUSD += p.size_rusd;
      acc[p.wallet].pnl += p.unrealized_pnl;
      acc[p.wallet].accounts.add(p.account_id);
      const discordName = p.discordUsername || p.discordGlobalName || 'N/A';
      acc[p.wallet].discords.add(discordName);
      return acc;
    },
    {}
  );

  const topWalletEntries = Object.entries(walletGroups)
    .sort(([, a], [, b]) => Math.abs(b.sizeUSD) - Math.abs(a.sizeUSD))
    .slice(0, 20);

  // Memoize treemap data processing
  const treemapData = useMemo(() => {
    const groups = filteredPositions.reduce<Record<string, { 
      name: string; 
      wallet: string; 
      displayLabel: string; 
      size: number; 
      accounts: { accountId: string; discordName: string; }[]; 
    }>>((acc, p) => {
      const wallet = p.wallet || 'Unknown Wallet';
      const currentDiscordName = p.discordUsername || p.discordGlobalName || 'N/A';
      if (!acc[wallet]) {
        acc[wallet] = { 
          name: `${wallet.slice(0, 6)}...${wallet.slice(-4)}`,
          wallet: wallet, 
          displayLabel: '', 
          size: 0, 
          accounts: [] 
        };
      }
      acc[wallet].size += Math.abs(p.size_rusd);
      if (!acc[wallet].accounts.some(a => a.accountId === p.account_id)) {
        acc[wallet].accounts.push({ accountId: p.account_id, discordName: currentDiscordName });
      }
      return acc;
    }, {});

    Object.values(groups).forEach(walletData => {
      const discordNames = new Set(walletData.accounts.map(a => a.discordName).filter(name => name !== 'N/A'));
      if (discordNames.size === 1) {
        const uniqueDiscordName = discordNames.values().next().value;
        if (uniqueDiscordName) { 
          walletData.displayLabel = uniqueDiscordName;
          walletData.name = `${walletData.name} (${uniqueDiscordName})`;
        } else {
          walletData.displayLabel = walletData.name;
        }
      } else {
        walletData.displayLabel = walletData.name;
      }
    });

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#ffbbd8'];

    return Object.values(groups)
      .filter(d => d.size > 0) 
      .sort((a, b) => b.size - a.size) 
      .map((d, index) => ({ 
        ...d,
        fill: COLORS[index % COLORS.length],
      }));
  }, [filteredPositions]); 

  // Calculate total size of filtered positions
  const totalFilteredSizeUSD = useMemo(() => {
    return filteredPositions.reduce((sum, p) => sum + Math.abs(p.size_rusd), 0);
  }, [filteredPositions]);

  const CustomTreemapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; 
      return (
        <div className="bg-white p-2 border rounded shadow text-sm max-w-xs break-words">
          <p className="font-bold">Wallet: {data.name}</p>          
          <p>Full Address: {data.wallet}</p> 
          <p>Total Size (rUSD): {formatUSD(data.size)}</p>
          <p>Accounts ({data.accounts.length}):</p>
          <ul className="list-disc list-inside text-xs">
            {data.accounts.map((acc: any) => (
              <li key={acc.accountId}>{acc.accountId} ({acc.discordName})</li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  const CustomizedContent = (props: any) => {
    const { depth, x, y, width, height, index, displayLabel, size, fill } = props; 

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: fill, 
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {width * height > 1500 && width > 60 && (
          <text 
            x={x + width / 2} 
            y={y + height / 2} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="#fff" 
            fontSize={14} 
            fontWeight="bold"
          >
            {displayLabel}
          </text>
        )}
      </g>
    );
  };

  // Calculate summary per wallet for Top 20
  const walletSummary = Object.entries(
    filteredPositions.reduce<Record<string, { wallet: string, sizeUSD: number, pnlUSD: number, discord: string | null, positionCount: number, accountIds: Set<string> }>>((acc, p) => {
      const wallet = p.wallet || 'Unknown Wallet';
      const currentDiscord = p.discordUsername || p.discordGlobalName || null;
      if (!acc[wallet]) {
        acc[wallet] = { wallet, sizeUSD: 0, pnlUSD: 0, discord: currentDiscord, positionCount: 0, accountIds: new Set() };
      }
      acc[wallet].sizeUSD += Math.abs(p.size_rusd);
      acc[wallet].pnlUSD += p.unrealized_pnl;
      acc[wallet].positionCount += 1;
      acc[wallet].accountIds.add(p.account_id);
      if (!acc[wallet].discord && currentDiscord) {
        acc[wallet].discord = currentDiscord;
      }
      return acc;
    }, {})
  ).sort(([, aValue], [, bValue]) => Math.abs(bValue.sizeUSD) - Math.abs(aValue.sizeUSD)).slice(0, 20);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Card>
        <CardHeader><CardTitle></CardTitle></CardHeader>
        <CardContent className="h-[400px]"> 
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner size="lg" />
            </div>
           ) : treemapData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                isAnimationActive={false} 
                content={<CustomizedContent />}
              >
                <Tooltip content={<CustomTreemapTooltip />} />
              </Treemap>
            </ResponsiveContainer>
           ) : (
             <div className="flex justify-center items-center h-full">
               <p>No data available for treemap.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Open Positions - Wallets ({uniqueWallets}) - Total size: {formatUSD(totalFilteredSizeUSD).replace('$', '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} rUSD
        </h2>
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-2">
            <Label>Market</Label>
            <Select value={market} onValueChange={setMarket}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {markets.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {getMarketDisplay(m.id.toString())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Min Margin Ratio</Label>
            <Input
              type="number"
              value={minMarginRatio}
              onChange={(e) => setMinMarginRatio(e.target.value)}
              className="w-[180px]"
              placeholder="0"
              step="0.1"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Sort Order</Label>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Wallet Summary (Top 20)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallet</TableHead>
                <TableHead>Discord</TableHead>
                <TableHead>Accounts</TableHead>
                <TableHead className="text-right">Positions</TableHead>
                <TableHead className="text-right">Total Size (Abs rUSD)</TableHead>
                <TableHead className="text-right">Total PnL (rUSD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {walletSummary.map(([wallet, data]) => (
                <TableRow key={wallet}>
                  <TableCell>
                    <Link href={`https://polygonscan.com/address/${wallet}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {`${wallet.slice(0,6)}...${wallet.slice(-4)}`}
                    </Link>
                  </TableCell>
                  <TableCell>{data.discord || 'N/A'}</TableCell>
                  <TableCell className="text-xs max-w-[200px] break-words">
                    {Array.from(data.accountIds).map((accountId, index) => (
                      <React.Fragment key={accountId}>
                        <Link href={`https://app.reya.xyz/account/${accountId}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {accountId}
                        </Link>
                        {index < data.accountIds.size - 1 ? ', ' : ''}
                      </React.Fragment>
                    ))}
                  </TableCell>
                  <TableCell className="text-right">{data.positionCount}</TableCell>
                  <TableCell className="text-right">{formatUSD(data.sizeUSD)}</TableCell>
                  <TableCell className={`text-right ${data.pnlUSD >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatUSD(data.pnlUSD)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Positions ({filteredPositions.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner size="lg" />
            </div>
          ) : filteredPositions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Size (rUSD)</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Liq. Price</TableHead>
                  <TableHead className="text-right">Unrealized PnL</TableHead>
                  <TableHead className="text-right">Margin Ratio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.map((pos) => (
                  <TableRow key={`${pos.account_id}-${pos.market}`}>
                    <TableCell>
                      <Link href={`https://app.reya.xyz/account/${pos.account_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {pos.account_id}
                      </Link>
                      {pos.discordUsername && <span className="text-xs text-gray-500 block">({pos.discordUsername})</span>}
                    </TableCell>
                    <TableCell>
                      {pos.wallet ? (
                        <Link href={`https://polygonscan.com/address/${pos.wallet}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {`${pos.wallet.slice(0, 6)}...${pos.wallet.slice(-4)}`}
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{getMarketDisplay(pos.market)}</TableCell>
                    <TableCell className="text-right">{formatNumber(pos.size)}</TableCell>
                    <TableCell className="text-right">{formatUSD(pos.size_rusd)}</TableCell>
                    <TableCell className="text-right">{formatUSD(pos.price)}</TableCell>
                    <TableCell className="text-right">{formatUSD(pos.liquidation_price)}</TableCell>
                    <TableCell className={`text-right ${pos.unrealized_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatUSD(pos.unrealized_pnl)}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(pos.margin_ratio, 2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No positions match the current filters.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
