import { NextRequest, NextResponse } from 'next/server';
import { getRecentTradeHistory } from '@/lib/api-trading';

export async function GET(request: NextRequest) {
  console.log('[API /api/trades] GET request received. Processing...');
  try {
    console.log('[API] Trades route called');
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const timeframe = searchParams.get('timeframe') || '1d';
    
    // Parse filtering parameters
    const walletType = searchParams.get('walletType') || 'all';
    const searchQuery = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'trade_count';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minTradeCount = parseInt(searchParams.get('minTradeCount') || '0', 10);
    const minVolume = parseInt(searchParams.get('minVolume') || '0', 10);
    const market = searchParams.get('market') || 'all';
    
    console.log(`[API] Using timeframe: ${timeframe}, page: ${page}, pageSize: ${pageSize}`);
    console.log(`[API] Filters: walletType=${walletType}, search=${searchQuery}, sortBy=${sortBy}, sortOrder=${sortOrder}`);

    // Use the new API client to fetch all trades
    const allTrades = await getRecentTradeHistory(timeframe);
    
    // Ensure trades is an array
    const tradesArray = Array.isArray(allTrades) ? allTrades : [];
    
    // Apply filters
    let filteredTrades = tradesArray.filter(trade => {
      // Filter by wallet type
      if (walletType !== 'all' && trade.wallet_details?.type !== walletType) {
        return false;
      }
      
      // Filter by search query (wallet address, name, or discord name)
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const walletMatch = trade.wallet.toLowerCase().includes(searchLower);
        const nameMatch = trade.wallet_details?.name?.toLowerCase().includes(searchLower) || false;
        const discordMatch = trade.wallet_details?.discord_name?.toLowerCase().includes(searchLower) || false;
        if (!walletMatch && !nameMatch && !discordMatch) {
          return false;
        }
      }
      
      // Filter by minimum trade count
      if (trade.trade_count < minTradeCount) {
        return false;
      }
      
      // Filter by minimum volume
      if (trade.total_size < minVolume) {
        return false;
      }
      
      // Filter by market
      if (market !== 'all' && trade.favorite_market !== market) {
        return false;
      }
      
      return true;
    });
    
    // Apply sorting
    filteredTrades.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'trade_count':
          comparison = a.trade_count - b.trade_count;
          break;
        case 'volume':
          comparison = a.total_size - b.total_size;
          break;
        case 'pnl':
          comparison = a.total_pnl - b.total_pnl;
          break;
        case 'win_rate':
          comparison = a.win_rate - b.win_rate;
          break;
        case 'fees':
          comparison = a.total_fees - b.total_fees;
          break;
        case 'last_trade':
          comparison = a.last_trade_time - b.last_trade_time;
          break;
        case 'leverage':
          comparison = (a.avg_leverage || 0) - (b.avg_leverage || 0);
          break;
        case 'funding':
          const aNetFunding = (a.funding_received || 0) - (a.funding_paid || 0);
          const bNetFunding = (b.funding_received || 0) - (b.funding_paid || 0);
          comparison = aNetFunding - bNetFunding;
          break;
        default:
          comparison = a.trade_count - b.trade_count;
      }
      
      // Apply sort order
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    // Calculate total count and pages
    const totalCount = filteredTrades.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTrades = filteredTrades.slice(startIndex, endIndex);
    
    // Calculate stats for the filtered trades
    const stats = {
      total_count: totalCount,
      total_volume: filteredTrades.reduce((sum, trade) => sum + trade.total_size, 0),
      total_pnl: filteredTrades.reduce((sum, trade) => sum + trade.total_pnl, 0),
      total_fees: filteredTrades.reduce((sum, trade) => sum + trade.total_fees, 0),
      avg_win_rate: filteredTrades.length > 0 ? 
        filteredTrades.reduce((sum, trade) => sum + trade.win_rate, 0) / filteredTrades.length : 0,
      total_funding_paid: filteredTrades.reduce((sum, trade) => sum + (trade.funding_paid || 0), 0),
      total_funding_received: filteredTrades.reduce((sum, trade) => sum + (trade.funding_received || 0), 0),
      avg_leverage: filteredTrades.length > 0 ? 
        filteredTrades.reduce((sum, trade) => sum + (trade.avg_leverage || 0), 0) / filteredTrades.length : 0,
      market_distribution: filteredTrades.reduce((acc, trade) => {
        const market = trade.favorite_market || 'unknown';
        acc[market] = (acc[market] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    
    console.log(`[API] Filtered trades: ${filteredTrades.length}, Paginated: ${paginatedTrades.length}`);
    console.log(`[API] Page ${page} of ${totalPages}`);
    console.log('[API] Content of paginatedTrades being sent:', JSON.stringify(paginatedTrades, null, 2)); // Detailed log

    return NextResponse.json({
      trades: paginatedTrades,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages
      },
      stats
    });
  } catch (error) {
    console.error('[API] Error fetching trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades', details: String(error) },
      { status: 500 }
    );
  }
}
