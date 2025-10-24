// Trading API client for Reya API
// This file provides simplified methods to fetch data from Reya's Trading API

import { ASSET_TO_ASSET_PRICE_MAPPER } from './consts';

// Types for the Trading API responses
export interface TraderSummary {
  wallet: string;
  account_ids: number[];
  total_size: number;
  total_pnl: number;
  win_rate: number;
  trade_count: number;
  last_trade_time: number;
  total_fees: number;
  feeTier?: number;
  isOg?: boolean;
  funding_paid?: number;
  funding_received?: number;
  avg_leverage?: number;
  favorite_market?: string;
  longest_trade_duration?: number; // in seconds
  shortest_trade_duration?: number; // in seconds
  discord_id?: string;
  twitter_handle?: string;
  wallet_details?: {
    name?: string;
    type?: string;
    discord_name?: string;
    discord_rank?: number;
    avatar?: string;
    joined_date?: number;
    tier_id?: number;
    tier_name?: string;
  };
}

// Base URL for the Reya API
const API_BASE_URL = 'https://api.reya.xyz';

/**
 * Fetches wallet orders from the Reya Trading API
 * @param address Wallet address to fetch orders for
 * @param timeframe Timeframe for the orders (e.g., '1h', '1d', '7d')
 * @returns Promise with the orders data
 */
export async function getWalletOrders(address: string, timeframe: string = '1d') {
  try {
    // Convert timeframe to milliseconds for API
    const timeframeMs = convertTimeframeToMs(timeframe);
    const startTime = Date.now() - timeframeMs;
    
    const response = await fetch(
      `${API_BASE_URL}/api/trading/wallet/${address}/orders?startTime=${startTime}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch wallet orders: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching wallet orders:', error);
    return null;
  }
}

/**
 * Fetches recent trade history from multiple wallets
 * @param timeframe Timeframe for the trades (e.g., '1h', '1d', '7d')
 * @returns Promise with trader summaries
 */
// fetchMarketOrders and convertTimeframeToMs are no longer needed as /api/trades-sql handles this.

/**
 * Processes an individual order and updates the trader's summary in the traderMap.
 * This is a helper function for getRecentTradeHistory.
 * @param order Order data from the API
 * @param traderMap Map of traders to update
 */
// Renamed from processOrder and updated to handle data from /api/trades-sql
function processTradeData(trade: any, traderMap: Map<string, TraderSummary>) {
  const wallet = trade.wallet;
  if (!wallet) {
    console.warn('No trader_wallet found in trade data:', trade);
    return; // Skip if no wallet identifier
  }

  let trader = traderMap.get(wallet);
  if (!trader) {
    trader = {
      wallet,
      account_ids: [],
      total_size: 0, // This will represent total volume in USD
      total_pnl: 0,
      win_rate: 0,
      trade_count: 0,
      last_trade_time: 0,
      total_fees: 0,
      funding_paid: 0, // Initialize new field
      funding_received: 0, // Initialize new field
      wallet_details: {
        name: undefined, // trade.wallet_name is no longer available
        discord_name: trade.discord_username, // Use discord_username from SQL query
        discord_rank: trade.discord_rank,
        avatar: undefined, // trade.wallet_avatar is no longer available
        tier_id: trade.tier_id,
          tier_name: undefined, // trade.wallet_tier_name is no longer available
        type: 'not_defined'
      }
    };
    traderMap.set(wallet, trader);
  }

  const accountId = trade.account_id;
  if (accountId && !trader.account_ids.includes(accountId)) {
    trader.account_ids.push(accountId);
  }

  const tradeVolumeUsd = parseFloat(trade.trade_volume_usd || '0');
  const realizedPnl = parseFloat(trade.realized_pnl || '0');
  const tradeFee = parseFloat(trade.trade_fee || '0');
  const fundingPnl = parseFloat(trade.funding_pnl || '0');
  const timestamp = parseInt(trade.trade_timestamp_unix_ms || '0', 10);

  trader.total_size += tradeVolumeUsd; // Accumulate USD volume
  trader.total_pnl += realizedPnl;
  trader.total_fees += tradeFee;
  trader.trade_count += 1;

  if (fundingPnl > 0) {
    trader.funding_received = (trader.funding_received || 0) + fundingPnl;
  } else if (fundingPnl < 0) {
    trader.funding_paid = (trader.funding_paid || 0) + Math.abs(fundingPnl);
  }

  if (timestamp > trader.last_trade_time) {
    trader.last_trade_time = timestamp;
  }

  // Win rate calculation based on realized PnL
  if (trader.trade_count > 0) {
    const currentWins = Math.round(trader.win_rate * (trader.trade_count - 1)); // Get current number of wins
    let newWinCount = currentWins;
    if (realizedPnl > 0) {
      newWinCount += 1;
    }
    trader.win_rate = newWinCount / trader.trade_count;
    if (isNaN(trader.win_rate)) {
      trader.win_rate = 0; // Reset if calculation results in NaN
    }
  } else {
    trader.win_rate = 0;
  }
  
  // Update last trade time
  if (timestamp > trader.last_trade_time) {
    trader.last_trade_time = timestamp;
  }
  
  // Potentially update other fields like favorite_market, avg_leverage etc. if data is available in `order`
  // For example, if order has 'market_id':
  // if (order.market_id) { trader.favorite_market = order.market_id; } 
  // This part would require knowing the structure of the 'order' object in more detail.
}

/**
 * Fetches and processes recent trade history by aggregating orders from multiple markets.
 * @param timeframe Timeframe for the trades (e.g., '1h', '1d', '7d')
 * @returns Promise with an array of TraderSummary objects
 */
export async function getRecentTradeHistory(timeframe: string = '1d'): Promise<TraderSummary[]> {
  console.log(`[api-trading] getRecentTradeHistory (SQL) called for timeframe: ${timeframe}`);
  try {
    // Fetch aggregated trader summaries for the timeframe from the SQL endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    const response = await fetch(`${baseUrl}/api/trades-sql?timeframe=${timeframe}&pageSize=-1`);
    if (!response.ok) {
      console.error(`[api-trading] Failed to fetch trades from /api/trades-sql: ${response.statusText} (${response.status})`);
      return [];
    }

    const rows = await response.json();
    console.log(`[api-trading] Fetched ${rows.length} aggregated trader rows from /api/trades-sql`);

    // Ensure numeric fields are numbers and conform to TraderSummary
    const summaries: TraderSummary[] = rows.map((r: any) => ({
      wallet: r.wallet,
      account_ids: Array.isArray(r.account_ids) ? r.account_ids : [],
      total_size: Number(r.total_size) || 0,
      total_pnl: Number(r.total_pnl) || 0,
      win_rate: Number(r.win_rate) || 0,
      trade_count: Number(r.trade_count) || 0,
      last_trade_time: Number(r.last_trade_time) || 0,
      total_fees: Number(r.total_fees) || 0,
      funding_paid: Number(r.funding_paid) || 0,
      funding_received: Number(r.funding_received) || 0,
      avg_leverage: Number(r.avg_leverage) || 0,
      favorite_market: r.favorite_market,
      wallet_details: r.wallet_details || undefined,
    }));

    return summaries;
  } catch (error) {
    console.error('[api-trading] Error in getRecentTradeHistory (SQL):', error);
    return [];
  }
}
