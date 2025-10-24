'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatUSD } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { TraderSummary } from '@/lib/api-trading';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { DataGrid as MuiXDataGrid, GridColDef, GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const timeframeOptions = [
    { value: '1h', label: '1h' },
    { value: '6h', label: '6h' },
    { value: '1d', label: '1d' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
];

function TradeTable({ trades, loading }: { trades: TraderSummary[]; loading: boolean }) {
    const columns: GridColDef[] = [
      {
        field: 'wallet',
        headerName: 'Wallet',
        minWidth: 180,
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
          const trade = params.row;
          const displayName = trade.wallet_details?.name || (trade.wallet ? trade.wallet.substring(0, 8) + '...' + trade.wallet.substring(trade.wallet.length - 6) : '');
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar style={{ width: 32, height: 32 }}>
                <AvatarImage src={trade.wallet_details?.avatar} />
                <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Box>
                <Link href={`/accounts/${trade.wallet}`}>{displayName}</Link>
              </Box>
            </Box>
          );
        }
      },
      { 
        field: 'account_ids',
        headerName: 'Account ID(s)',
        minWidth: 150,
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
            const cell = params.row.account_ids?.join(', ') || '-';
            return <div>{cell}</div>;
        }
      },
      {
        field: 'discord_name',
        headerName: 'Discord Name',
        minWidth: 150,
        flex: 1,
        valueGetter: (params?: GridValueGetterParams) => params?.row?.wallet_details?.discord_name || '-'
      },
      {
        field: 'discord_rank',
        headerName: 'Discord Rank',
        minWidth: 120,
        flex: 1,
        valueGetter: (params?: GridValueGetterParams) => params?.row?.wallet_details?.discord_rank ?? '-'
      },
      {
        field: 'tier',
        headerName: 'Tier',
        minWidth: 80,
        flex: 1,
        valueGetter: (params?: GridValueGetterParams) => params?.row?.wallet_details?.tier_id ?? '-'
      },
      {
        field: 'favorite_market',
        headerName: 'Market',
        minWidth: 100,
        flex: 1,
        valueGetter: (params?: GridValueGetterParams) => params?.row?.favorite_market || '-'
      },
      {
        field: 'trade_count',
        headerName: 'Trades',
        minWidth: 100,
        flex: 1,
        valueGetter: (params?: GridValueGetterParams) => params?.row?.trade_count || 0
      },
      {
        field: 'total_size',
        headerName: 'Volume',
        minWidth: 150,
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
            const value = params.row?.total_size || 0;
            return <div>{formatUSD(value)}</div>;
        }
      },
      {
        field: 'total_pnl',
        headerName: 'PnL',
        minWidth: 120,
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
            const value = params.row?.total_pnl || 0;
            const color = value >= 0 ? 'text-green-600' : 'text-red-600';
            return <div className={color}>{formatUSD(value)}</div>;
        }
      },
      {
        field: 'win_rate',
        headerName: 'Win Rate',
        minWidth: 100,
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
            const value = params.row?.win_rate || 0;
            return <div>{`${(value * 100).toFixed(1)}%`}</div>;
        }
      },
      {
        field: 'total_fees',
        headerName: 'Fees',
        minWidth: 120,
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
            const value = params.row?.total_fees || 0;
            return <div>{formatUSD(value)}</div>;
        }
      },
      {
        field: 'avg_leverage',
        headerName: 'Leverage',
        minWidth: 100,
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
            const leverage = params.row?.avg_leverage;
            return <div>{`${Number(leverage).toFixed(1)}x`}</div>;
        }
      },
      {
        field: 'funding',
        headerName: 'Funding',
        minWidth: 120,
        flex: 1,
        valueGetter: (params?: GridValueGetterParams) => {
            const received = Number(params?.row?.funding_received ?? 0);
            const paid = Number(params?.row?.funding_paid ?? 0);
            return received - paid;
        },
        renderCell: (params: GridRenderCellParams) => {
            if (params.value !== null && params.value !== undefined) {
                return <div>{formatUSD(params.value)}</div>;
            }
            return <div>{formatUSD(0)}</div>;
        }
      },
      {
        field: 'last_trade_time',
        headerName: 'Last Trade',
        minWidth: 160,
        flex: 1,
        renderCell: (params: GridRenderCellParams) => {
            const timestamp = params.row?.last_trade_time || 0;
            if (timestamp) {
                try {
                    return <div>{new Date(Number(timestamp)).toLocaleString()}</div>;
                } catch (e) {
                    return <div>-</div>;
                }
            }
            return <div>-</div>;
        }
      },
    ];
  
    const rows = trades.map((trade, index) => ({ id: index, ...trade }));
  
    return (
        <div style={{ height: 'calc(100vh - 220px)', width: '100%' }}>
            <MuiXDataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 100, page: 0 },
                    },
                }}
                disableRowSelectionOnClick
                autoHeight
            />
        </div>
    );
}

export default function LeaderboardPage() {
    const [trades, setTrades] = useState<TraderSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('1d');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchTrades = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                timeframe,
                pageSize: '-1',
            });

            if (debouncedSearchTerm) {
                params.append('walletAddress', debouncedSearchTerm);
            }

            const response = await fetch(`/api/trades-sql?${params.toString()}`);
            const data = await response.json();
            setTrades(data);
        } catch (error) {
            console.error('Failed to fetch trades:', error);
            setTrades([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, [timeframe, debouncedSearchTerm]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <div className="flex items-center space-x-2 pt-4">
                    <Input
                        placeholder="Search by wallet address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
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
                    <Button onClick={fetchTrades} variant="outline">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <TradeTable trades={trades} loading={loading} />
            </CardContent>
        </Card>
    );
}
