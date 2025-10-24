export interface Market {
  id: number;
  ticker: string;
  underlyingAsset: string;
  quoteToken: string;
  markPrice: number;
  isActive: boolean;
  maxLeverage: number;
  volume24H: number;
  priceChange24H: number;
  priceChange24HPercentage: number;
  openInterest: number;
  fundingRate: number;
  fundingRateAnnualized: number;
  description: string;
  tickSizeDecimals: number;
  minOrderSizeBase: number;
  minOrderSize: number;
  baseSpacing: number;
  orderInfo: {
    minLeverage: number;
    maxLeverage: number;
    minOrderSize: number;
    maxOrderSize: number;
    stepSize: number;
    tickSize: number;
  };
}

export interface PositionHistory {
  id: number;
  timestamp: number;
  action: 'long-trade' | 'short-trade' | 'long-liquidation' | 'short-liquidation';
  size: number; // Signed amount (negative for shorts)
  displaySize: string; // Formatted amount with coin symbol (e.g., "1.5 ETH")
  price: number; // Price at execution
  value: number; // Signed value (negative for shorts)
  fees: number;
  openingFees: number;
  market: Market;
  orderType: 'market';
  realisedPnl: number;
  priceVariationPnl: number;
  fundingPnl: number;
  xpEarned: number;
  side: 'long' | 'short';
}

export interface FormattedPositionHistory extends Omit<PositionHistory, 'timestamp' | 'fees'> {
  formattedTimestamp: string;
  timestamp: number;
  formattedFees: string;
  fees: number;
}

// Helper function to format the position history data
export const formatPositionHistory = (position: PositionHistory): FormattedPositionHistory => {
  const date = new Date(position.timestamp);
  
  return {
    ...position,
    formattedTimestamp: date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }),
    formattedFees: `$${position.fees.toFixed(2)}`
  };
};

// Example usage:
export const examplePosition: PositionHistory = {
  id: 1234,
  timestamp: Date.now(),
  action: 'long-trade',
  size: 1.5, // Positive for long position
  displaySize: "1.5 ETH", // Amount with coin symbol
  price: 2000.00,
  value: 3000.00, // 1.5 * 2000
  fees: 0.1,
  openingFees: 0.05,
  market: {
    id: 1,
    ticker: 'ETH-USD',
    underlyingAsset: 'ETH',
    quoteToken: 'USD',
    markPrice: 2000.00,
    isActive: true,
    maxLeverage: 100,
    volume24H: 1000000,
    priceChange24H: 1000,
    priceChange24HPercentage: 2,
    openInterest: 500000,
    fundingRate: 0.0001,
    fundingRateAnnualized: 0.0365,
    description: 'Ethereum/USD Perpetual Future',
    tickSizeDecimals: 2,
    minOrderSizeBase: 0.01,
    minOrderSize: 50,
    baseSpacing: 0.0001,
    orderInfo: {
      minLeverage: 1,
      maxLeverage: 100,
      minOrderSize: 50,
      maxOrderSize: 1000000,
      stepSize: 0.001,
      tickSize: 0.01
    }
  },
  orderType: 'market',
  realisedPnl: 100,
  priceVariationPnl: 90,
  fundingPnl: 10,
  xpEarned: 50,
  side: 'long'
};
