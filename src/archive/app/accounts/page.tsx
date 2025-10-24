'use client';

import { useEffect, useState } from 'react';
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

interface Position {
  account_id: string;
  wallet: string;
  market: string;
  size: number;
  price: number;
  liquidation_price: number;
  unrealized_pnl: number;
  margin_ratio: number;
  discordUsername?: string;
  discordGlobalName?: string;
}

const sortOptions = [
  { value: 'pnl', label: 'PnL' },
  { value: 'size', label: 'Position Size' },
  { value: 'marginRatio', label: 'Margin Ratio' },
];

const marketOptions = [
  { value: 'all', label: 'All Markets' },
  { value: 'ETH-USD', label: 'ETH-USD' },
  { value: 'BTC-USD', label: 'BTC-USD' },
];

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('pnl');
  const [market, setMarket] = useState('all');

  useEffect(() => {
    async function fetchPositions() {
      try {
        const params = new URLSearchParams();
        if (market !== 'all') {
          params.append('market', market);
        }
        params.append('sortBy', sortBy);
        
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
  }, [market, sortBy]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Open Positions</h2>
        <div className="flex space-x-2">
          <Select value={market} onValueChange={setMarket}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Market" />
            </SelectTrigger>
            <SelectContent>
              {marketOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Positions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Discord</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Entry Price</TableHead>
                  <TableHead className="text-right">Liquidation Price</TableHead>
                  <TableHead className="text-right">Unrealized PnL</TableHead>
                  <TableHead className="text-right">Margin Ratio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      No open positions found
                    </TableCell>
                  </TableRow>
                ) : (
                  positions.map((position) => (
                    <TableRow key={`${position.account_id}-${position.market}`}>
                      <TableCell>#{position.account_id}</TableCell>
                      <TableCell>
                        <Link href={`/accounts/${position.wallet}`} className="text-blue-500 hover:underline">
                          {position.wallet?.slice(0, 6)}...{position.wallet?.slice(-4)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {position.discordUsername || position.discordGlobalName || 'N/A'}
                      </TableCell>
                      <TableCell>{position.market}</TableCell>
                      <TableCell className="text-right">{formatNumber(position.size)}</TableCell>
                      <TableCell className="text-right">{formatUSD(position.price)}</TableCell>
                      <TableCell className="text-right">{formatUSD(position.liquidation_price)}</TableCell>
                      <TableCell className="text-right">{formatUSD(position.unrealized_pnl)}</TableCell>
                      <TableCell className="text-right">{formatNumber(position.margin_ratio, 4)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
