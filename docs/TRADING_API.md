# Reya Trading API Documentation

This document provides comprehensive information about the trading API endpoints in the Reya platform.

## Base URL

```
https://api.reya.xyz
```

All endpoints are prefixed with `/api/trading/`.

## Table of Contents

- [Market Information](#market-information)
  - [Get Markets](#get-markets)
  - [Get Market by ID](#get-market-by-id)
  - [Get Markets Data](#get-markets-data)
  - [Get Market Data](#get-market-data)
  - [Get Market Orders](#get-market-orders)
  - [Get Markets Configuration](#get-markets-configuration)
  - [Get Markets Storage](#get-markets-storage)
  - [Get Markets Trackers](#get-markets-trackers)
- [Account and Wallet Information](#account-and-wallet-information)
  - [Get Wallet Positions](#get-wallet-positions)
  - [Get Wallet Conditional Orders](#get-wallet-conditional-orders)
  - [Get Wallet Accounts](#get-wallet-accounts)
  - [Get Wallet Account Balances](#get-wallet-account-balances)
  - [Get Wallet Orders](#get-wallet-orders)
  - [Get Wallet Orders by Type](#get-wallet-orders-by-type)
  - [Export Wallet Orders](#export-wallet-orders)
  - [Get Wallet Configuration](#get-wallet-configuration)
  - [Get Wallet Leverages](#get-wallet-leverages)
  - [Get Wallet Auto Exchange](#get-wallet-auto-exchange)
  - [Get Wallet Balance History](#get-wallet-balance-history)
  - [Get Wallet Stats](#get-wallet-stats)
- [Asset and Price Information](#asset-and-price-information)
  - [Get Assets](#get-assets)
  - [Get Prices](#get-prices)
  - [Get Price by Asset Pair ID](#get-price-by-asset-pair-id)
  - [Get Risk Matrices](#get-risk-matrices)
  - [Get Pool Balance](#get-pool-balance)
- [Fee Configuration](#fee-configuration)
  - [Get Collateral Configuration](#get-collateral-configuration)
  - [Get Fee Tier Parameters](#get-fee-tier-parameters)
  - [Get Global Fee Parameters](#get-global-fee-parameters)
- [Candle Data](#candle-data)
  - [Get Current Candle](#get-current-candle)
- [WebSocket API](#websocket-api)
  - [WebSocket Base URL](#websocket-base-url)
  - [Connection and Subscription](#connection-and-subscription)
  - [Message Types](#message-types)
  - [Response Types](#response-types)
  - [Available Channels](#available-channels)
  - [Examples](#examples)
  - [Sample Response Formats](#sample-response-formats)
  - [Message Fields](#message-fields)
  - [Usage Notes](#usage-notes)

## Market Information

### Get Markets

Returns information about all available markets.

**Endpoint:** `GET /api/trading/markets`

**Parameters:** None

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the market |
| ticker | string | Trading pair symbol (e.g., "BTC-rUSD") |
| markPrice | number | Current mark price of the asset |
| isActive | boolean | Whether the market is currently active |
| maxLeverage | number | Maximum leverage allowed for this market |
| description | string | Description of the market |
| name | string | Name of the market |
| tickSizeDecimals | number | Number of decimal places for the tick size |
| priority | number | Display priority for the market |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/markets
```

**Example Response:**
```json
[
  {
    "id": "2",
    "ticker": "BTC-rUSD",
    "markPrice": 43000,
    "isActive": true,
    "maxLeverage": 40,
    "description": "Perpetual LP Pool",
    "name": "Market",
    "tickSizeDecimals": 2,
    "priority": 0
  },
  {
    "id": "1",
    "ticker": "ETH-rUSD",
    "markPrice": 2000,
    "isActive": true,
    "maxLeverage": 25,
    "description": "Perpetual LP Pool",
    "name": "Market",
    "tickSizeDecimals": 2,
    "priority": 0
  },
  ...
]
```

### Get Market by ID

Returns information about a specific market by its ID.

**Endpoint:** `GET /api/trading/market/:marketId`

**Parameters:**
- `marketId` (path): The ID of the market

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the market |
| ticker | string | Trading pair symbol (e.g., "BTC-rUSD") |
| markPrice | number | Current mark price of the asset |
| isActive | boolean | Whether the market is currently active |
| maxLeverage | number | Maximum leverage allowed for this market |
| description | string | Description of the market |
| name | string | Name of the market |
| tickSizeDecimals | number | Number of decimal places for the tick size |
| priority | number | Display priority for the market |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/market/2
```

**Example Response:**
```json
{
  "id": "2",
  "ticker": "BTC-rUSD",
  "markPrice": 43000,
  "isActive": true,
  "maxLeverage": 40,
  "description": "Perpetual LP Pool",
  "name": "Market",
  "tickSizeDecimals": 2,
  "priority": 0
}
```

### Get Markets Data

Returns data for all markets.

**Endpoint:** `GET /api/trading/marketsData`

**Parameters:** None

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| marketId | string | Unique identifier for the market |
| updatedAt | number | Timestamp of the last update (in milliseconds) |
| longOI | number | Long open interest |
| shortOI | number | Short open interest |
| oiLong24Change | number | 24-hour change in long open interest |
| oiShort24Change | number | 24-hour change in short open interest |
| fundingRate | number | Current funding rate |
| lastPrice | number | Last traded price |
| lastPrice24Change | number | 24-hour change in price |
| lastPrice24High | number | 24-hour high price |
| lastPrice24Low | number | 24-hour low price |
| volume24 | number | 24-hour trading volume |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/marketsData
```

**Example Response:**
```json
[
  {
    "marketId": "2",
    "updatedAt": 1747825738305,
    "longOI": 2182.2,
    "shortOI": 0,
    "oiLong24Change": 0,
    "oiShort24Change": 0,
    "fundingRate": 0,
    "lastPrice": 43000,
    "lastPrice24Change": 0,
    "lastPrice24High": 43000,
    "lastPrice24Low": 43000,
    "volume24": 0
  },
  {
    "marketId": "1",
    "updatedAt": 1747825738177,
    "longOI": 0,
    "shortOI": 0,
    "oiLong24Change": 0,
    "oiShort24Change": 0,
    "fundingRate": 0,
    "lastPrice": 2000,
    "lastPrice24Change": 0,
    "lastPrice24High": 2000,
    "lastPrice24Low": 2000,
    "volume24": 0
  }
]
```

### Get Market Data

Returns data for a specific market.

**Endpoint:** `GET /api/trading/market/:marketId/data`

**Parameters:**
- `marketId` (path): The ID of the market

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| marketId | string | Unique identifier for the market |
| updatedAt | number | Timestamp of the last update (in milliseconds) |
| longOI | number | Long open interest |
| shortOI | number | Short open interest |
| oiLong24Change | number | 24-hour change in long open interest |
| oiShort24Change | number | 24-hour change in short open interest |
| fundingRate | number | Current funding rate |
| lastPrice | number | Last traded price |
| lastPrice24Change | number | 24-hour change in price |
| lastPrice24High | number | 24-hour high price |
| lastPrice24Low | number | 24-hour low price |
| volume24 | number | 24-hour trading volume |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/market/2/data
```

**Example Response:**
```json
{
  "marketId": "2",
  "updatedAt": 1747825738305,
  "longOI": 2182.2,
  "shortOI": 0,
  "oiLong24Change": 0,
  "oiShort24Change": 0,
  "fundingRate": 0,
  "lastPrice": 43000,
  "lastPrice24Change": 0,
  "lastPrice24High": 43000,
  "lastPrice24Low": 43000,
  "volume24": 0
}
```

### Get Market Orders

Returns orders for a specific market.

**Endpoint:** `GET /api/trading/market/:marketId/orders`

**Parameters:**
- `marketId` (path): The ID of the market
- `before` (query, optional): Pagination parameter, unique ID to fetch orders before
- `after` (query, optional): Pagination parameter, unique ID to fetch orders after
- `direction` (query, optional): Sorting direction, either 'asc' or 'desc'
- `limit` (query, optional): Number of orders to return (default: 100, max: 100)

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of order objects |
| » unique_id | string | Unique identifier for the order |
| » id | string | Identifier for the order |
| » account_id | string | Identifier for the account |
| » market_id | string | Identifier for the market |
| » order_base | string | Base amount of the order |
| » order_quote | string | Quote amount of the order |
| » execution_price | string | Execution price of the order |
| » fill_amount | string | Fill amount of the order |
| » fee | string | Fee for the order |
| » is_long | boolean | Whether the position is long |
| » order_type | string | Type of order (e.g., "Market") |
| » liquidation_type | string | Type of liquidation (e.g., null) |
| » created_at | string | Creation timestamp |
| » block_timestamp | string | Timestamp of the block |
| » transaction_hash | string | Hash of the transaction |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/market/2/orders?limit=10
```

**Example Response:**
```json
{
  "data": [
    {
      "unique_id": "6770773900001",
      "id": "67707739-00001",
      "account_id": "95681",
      "market_id": "2",
      "order_base": "5200000000000000",
      "order_quote": "5528298906000000000",
      "execution_price": "45234000000000000000000",
      "fill_amount": "5200000000000000",
      "fee": "4145724179500000000",
      "is_long": true,
      "order_type": "Market",
      "liquidation_type": null,
      "created_at": "2025-05-01T16:16:55.000Z",
      "block_timestamp": "1747821015",
      "transaction_hash": "0xb43ca160170fe590c42415750345c597e1cb6682da0fc6a014921e589b4143d4"
    },
    {
      "unique_id": "6770789700001",
      "id": "67707897-00001",
      "account_id": "95681",
      "market_id": "1",
      "order_base": "110000000000000000",
      "order_quote": "23064680834000000000",
      "execution_price": "2350450000000000000000",
      "fill_amount": "110000000000000000",
      "fee": "17298510625500000000",
      "is_long": true,
      "order_type": "Market",
      "liquidation_type": null,
      "created_at": "2025-05-01T16:14:50.000Z",
      "block_timestamp": "1747821290",
      "transaction_hash": "0x8ab3df9d7f7c3940fef41e2d2a4c8b8902be53a8ef05c26cc32d03e787ffde6b"
    }
  ],
  "meta": {
    "limit": 10,
    "count": 2,
    "before": null,
    "after": null
  }
}
```

### Get Markets Configuration

Returns configuration information for all markets.

**Endpoint:** `GET /api/trading/markets/configuration`

**Parameters:** None

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier for the market |
| ticker | string | Trading pair symbol (e.g., "BTC-rUSD") |
| quote_asset_id | number | ID of the quote asset |
| base_asset_id | number | ID of the base asset |
| collateral_pool_id | number | ID of the collateral pool |
| fixed_fee_rate_bp | number | Fixed fee rate in basis points |
| liquidator_fee_rate_bp | number | Liquidator fee rate in basis points |
| insurance_fee_rate_bp | number | Insurance fee rate in basis points |
| max_leverage | number | Maximum leverage allowed for this market |
| tick_size_in_cents | number | Tick size in cents |
| min_order_size_in_base | string | Minimum order size in base units |
| min_position_size_in_order_size_multiple | number | Minimum position size in order size multiples |
| price_impact_base_unit | string | Price impact base unit |
| max_order_size_in_base | string | Maximum order size in base units |
| allow_market_flip | boolean | Whether market flip is allowed |
| default_skew_impact_factor | string | Default skew impact factor |
| min_skew_impact_factor | string | Minimum skew impact factor |
| funding_rate_multiplier_per_period | string | Funding rate multiplier per period |
| oracle_lookup_address | string | Oracle lookup address |
| is_active | boolean | Whether the market is active |
| type | string | Type of market (e.g., "perpetual") |
| created_timestamp_ms | string | Creation timestamp in milliseconds |
| updated_timestamp_ms | string | Last update timestamp in milliseconds |
| name | string | Name of the market |
| description | string | Description of the market |
| priority | number | Display priority for the market |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/markets/configuration
```

**Example Response:**
```json
[
  {
    "id": 1,
    "ticker": "ETH-rUSD",
    "quote_asset_id": 1,
    "base_asset_id": 2,
    "collateral_pool_id": 1,
    "fixed_fee_rate_bp": 5000000000000000,
    "liquidator_fee_rate_bp": 20000000000000000,
    "insurance_fee_rate_bp": 40000000000000000,
    "max_leverage": 25,
    "tick_size_in_cents": 100000000000000000,
    "min_order_size_in_base": "1000000000000000000",
    "min_position_size_in_order_size_multiple": 1,
    "price_impact_base_unit": "1000000000000000000",
    "max_order_size_in_base": "1000000000000000000000",
    "allow_market_flip": true,
    "default_skew_impact_factor": "1000000000000000000",
    "min_skew_impact_factor": "1000000000000000000",
    "funding_rate_multiplier_per_period": "1000000000000000000",
    "oracle_lookup_address": "0x0000000000000000000000000000000000000021",
    "is_active": true,
    "type": "perpetual",
    "created_timestamp_ms": "1746883726000",
    "updated_timestamp_ms": "1746883726000",
    "name": "Market",
    "description": "Perpetual LP Pool",
    "priority": 0
  },
  {
    "id": 2,
    "ticker": "BTC-rUSD",
    "quote_asset_id": 1,
    "base_asset_id": 3,
    "collateral_pool_id": 1,
    "fixed_fee_rate_bp": 5000000000000000,
    "liquidator_fee_rate_bp": 20000000000000000,
    "insurance_fee_rate_bp": 40000000000000000,
    "max_leverage": 40,
    "tick_size_in_cents": 100000000000000000,
    "min_order_size_in_base": "1000000000000000000",
    "min_position_size_in_order_size_multiple": 1,
    "price_impact_base_unit": "1000000000000000000",
    "max_order_size_in_base": "1000000000000000000000",
    "allow_market_flip": true,
    "default_skew_impact_factor": "1000000000000000000",
    "min_skew_impact_factor": "1000000000000000000",
    "funding_rate_multiplier_per_period": "1000000000000000000",
    "oracle_lookup_address": "0x0000000000000000000000000000000000000022",
    "is_active": true,
    "type": "perpetual",
    "created_timestamp_ms": "1746883726000",
    "updated_timestamp_ms": "1746883726000",
    "name": "Market",
    "description": "Perpetual LP Pool",
    "priority": 0
  }
]
```

### Get Markets Storage

Returns storage information for all markets.

**Endpoint:** `GET /api/trading/markets/storage`

**Parameters:** None

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| market_id | string | Unique identifier for the market |
| quote_collateral | string | Address of the quote collateral |
| instrument_address | string | Address of the instrument |
| name | string | Name of the market |
| risk_block_id | string | ID of the risk block |
| collateral_pool_id | string | ID of the collateral pool |
| block_timestamp | string | Timestamp of the block |
| block_number | string | Block number |
| unique_id | number | Unique identifier for the market storage |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/markets/storage
```

**Example Response:**
```json
[
  {
    "market_id": "1",
    "quote_collateral": "0x162b78e827a8db8173d13735c08c8d40cb5ccdab",
    "instrument_address": "0x611a80cd843fd90c4e3d161baa5d3a98f1d1b61b",
    "name": "ETH-rUSD",
    "risk_block_id": "1",
    "collateral_pool_id": "1",
    "block_timestamp": "1746883726",
    "block_number": "67102951",
    "unique_id": 6710295100078
  },
  {
    "market_id": "2",
    "quote_collateral": "0x162b78e827a8db8173d13735c08c8d40cb5ccdab",
    "instrument_address": "0x611a80cd843fd90c4e3d161baa5d3a98f1d1b61b",
    "name": "BTC-rUSD",
    "risk_block_id": "2",
    "collateral_pool_id": "1",
    "block_timestamp": "1746883726",
    "block_number": "67102951",
    "unique_id": 6710295100082
  }
]
```

### Get Markets Trackers

Returns tracker information for all markets.

**Endpoint:** `GET /api/trading/markets/trackers`

**Parameters:** None

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| market_data_id | string | Unique identifier for the market data |
| passive_pool_id | string | ID of the passive pool |
| pool_account_id | string | ID of the pool account |
| quote_token | string | Address of the quote token |
| quote_token_decimals | string | Number of decimal places for the quote token |
| last_funding_velocity | string | Last funding velocity |
| last_funding_timestamp | string | Timestamp of the last funding |
| last_mtm_price | string | Last mark-to-market price |
| last_mtm_timestamp | string | Timestamp of the last mark-to-market update |
| long_trackers_funding_value | string | Funding value for long trackers |
| last_funding_rate | string | Last funding rate |
| long_trackers_base_multiplier | string | Base multiplier for long trackers |
| long_trackers_adl_unwind_price | string | ADL unwind price for long trackers |
| short_trackers_funding_value | string | Funding value for short trackers |
| short_trackers_base_multiplier | string | Base multiplier for short trackers |
| short_trackers_adl_unwind_price | string | ADL unwind price for short trackers |
| open_interest | string | Open interest |
| block_timestamp | string | Timestamp of the block |
| block_number | string | Block number |
| unique_id | number | Unique identifier for the market tracker |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/markets/trackers
```

**Example Response:**
```json
[
  {
    "market_data_id": "1",
    "passive_pool_id": "1",
    "pool_account_id": "2",
    "quote_token": "0x162b78e827a8db8173d13735c08c8d40cb5ccdab",
    "quote_token_decimals": "30",
    "last_funding_velocity": "177784389397175",
    "last_funding_timestamp": "1747819424",
    "last_mtm_price": "2527588661417322834645000000000000000000",
    "last_mtm_timestamp": "1747821004",
    "long_trackers_funding_value": "412155840911455307850",
    "last_funding_rate": "126517264241225",
    "long_trackers_base_multiplier": "1000000000000000000",
    "long_trackers_adl_unwind_price": "0",
    "short_trackers_funding_value": "412155840911455307850",
    "short_trackers_base_multiplier": "1000000000000000000",
    "short_trackers_adl_unwind_price": "0",
    "open_interest": "440000000000000000",
    "block_timestamp": "1747819424",
    "block_number": "67706957",
    "unique_id": 6770695700001
  },
  {
    "market_data_id": "2",
    "passive_pool_id": "1",
    "pool_account_id": "2",
    "quote_token": "0x162b78e827a8db8173d13735c08c8d40cb5ccdab",
    "quote_token_decimals": "30",
    "last_funding_velocity": "6875701489375",
    "last_funding_timestamp": "1747821015",
    "last_mtm_price": "106578376718749990000000",
    "last_mtm_timestamp": "1747821015",
    "long_trackers_funding_value": "5679204743297116945993",
    "last_funding_rate": "16871183217875",
    "long_trackers_base_multiplier": "1000000000000000000",
    "long_trackers_adl_unwind_price": "0",
    "short_trackers_funding_value": "5679204743297116945993",
    "short_trackers_base_multiplier": "1000000000000000000",
    "short_trackers_adl_unwind_price": "0",
    "open_interest": "5200000000000000",
    "block_timestamp": "1747821015",
    "block_number": "67707739",
    "unique_id": 6770773900003
  }
]
```

### Get Events

Returns trading events with pagination support.

**Endpoint:** `GET /api/trading/events`

**Parameters:**
- `limit` (query, optional): Number of events to return (default: 100)
- `before` (query, optional): Return events before this ID for pagination
- `after` (query, optional): Return events after this ID for pagination

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of event objects |
| » market_id | string | Identifier for the market |
| » account_id | string | Identifier for the account |
| » type | string | Type of event (e.g., "trade", "funding") |
| » base | string | Base amount of the event |
| » quote | string | Quote amount of the event |
| » price | string | Price of the event |
| » transaction_hash | string | Hash of the transaction |
| » block_timestamp | string | Timestamp of the block |
| » block_number | string | Block number |
| » unique_id | number | Unique identifier for the event |
| » created_at | string | Creation timestamp |
| meta | object | Metadata for pagination |
| » limit | number | Number of results returned |
| » count | number | Total count of results in this batch |
| » before | number | ID to use for fetching previous page |
| » after | number | ID to use for fetching next page |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/events
```

**Example Response:**
```json
{
  "data": [
    {
      "market_id": "1",
      "account_id": "97281",
      "type": "trade",
      "base": "100000000000000000",
      "quote": "255129390112500000000",
      "price": "2551293901125000000000",
      "transaction_hash": "0x43b0e29272e16bc73f9b141c7a7b56183d31a581f99e966cc1f2441ca7a0e2ea",
      "block_timestamp": "1747826712",
      "block_number": "67708941",
      "unique_id": 6770894100005,
      "created_at": "2025-05-20T21:11:53.232Z"
    },
    {
      "market_id": "2",
      "account_id": "95681",
      "type": "funding",
      "base": "0",
      "quote": "3567942357",
      "price": "106578376718749990000000",
      "transaction_hash": "0x1a2a4ca4e4b2fa91e978f1f629809405b845e4ce4de1f96a87f76a32e9af1bb0",
      "block_timestamp": "1747826712",
      "block_number": "67708941",
      "unique_id": 6770894100006,
      "created_at": "2025-05-20T21:11:53.232Z"
    }
  ],
  "meta": {
    "limit": 100,
    "count": 100,
    "before": 6770894100007,
    "after": 6547724300001
  }
}
```

## Asset and Price Information

### Get Assets

Returns all assets supported by the platform.

**Endpoint:** `GET /api/trading/assets`

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier for the asset |
| address | string | Contract address of the asset |
| name | string | Full name of the asset |
| short | string | Short symbol for the asset |
| createdAt | string | Timestamp when the asset was created |
| updatedAt | string | Timestamp when the asset was last updated |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/assets
```

**Example Response:**
```json
[
  {
    "id": 1,
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "name": "Reya USD",
    "short": "rUSD",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Get Prices

Returns prices for all asset pairs.

**Endpoint:** `GET /api/trading/prices`

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| marketId | number | ID of the market |
| oraclePrice | string | Price from oracle |
| poolPrice | string | Price from pool |
| price | string | Current price |
| updatedAt | number | Timestamp of the last update |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/prices
```

**Example Response:**
```json
[
  {
    "marketId": 1,
    "oraclePrice": "2531144014809193496986",
    "poolPrice": "2531142939673207966023",
    "price": "2530789301549999000000",
    "updatedAt": 1747834146575
  }
]
```

### Get Price by Asset Pair ID

Returns price information for a specific asset pair.

**Endpoint:** `GET /api/trading/prices/:assetPairId`

**Parameters:**
- `assetPairId` (path): Identifier of the asset pair (e.g., ETHUSDMARK)

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| marketId | number | ID of the market |
| oraclePrice | string | Price from oracle |
| poolPrice | string | Price from pool |
| price | string | Current price |
| updatedAt | number | Timestamp of the last update |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/prices/ETHUSDMARK
```

**Example Response:**
```json
{
  "marketId": 1,
  "oraclePrice": "2531144014809193496986",
  "poolPrice": "2531142939673207966023",
  "price": "2530789301549999000000",
  "updatedAt": 1747834146575
}
```

### Get Risk Matrices

Returns risk matrices for all asset pairs.

**Endpoint:** `GET /api/trading/riskMatrices`

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier for the risk matrix |
| marketId | number | ID of the associated market |
| leverageMax | string | Maximum allowed leverage |
| leverageMin | string | Minimum allowed leverage |
| interest | string | Interest rate |
| insurance | string | Insurance rate |
| createdAt | string | Timestamp when the risk matrix was created |
| updatedAt | string | Timestamp when the risk matrix was last updated |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/riskMatrices
```

**Example Response:**
```json
[
  {
    "id": 1,
    "marketId": 1,
    "leverageMax": "100",
    "leverageMin": "1",
    "interest": "0.05",
    "insurance": "0.01",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Get Pool Balance

Returns the balance information for a specific pool.

**Endpoint:** `GET /api/trading/poolBalance/:poolId`

**Parameters:**
- `poolId` (path): Identifier of the pool

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier for the pool balance entry |
| pool_id | number | ID of the pool |
| timestamp | number | Timestamp of the balance record |
| value | string | Current value of the pool |
| apy | string | Annual percentage yield |
| share_price | string | Price per share |
| share_price_index | string | Share price index |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/poolBalance/1
```

**Example Response:**
```json
{
  "id": 547606,
  "pool_id": 1,
  "timestamp": 1747834105656,
  "value": "17989265.69244052",
  "apy": "0.03072078779167425",
  "share_price": "1.041881093786799",
  "share_price_index": "33729011020.257646868833137"
}
```

## Fee Configuration

### Get Collateral Configuration

Returns configuration for all supported collateral assets.

**Endpoint:** `GET /api/trading/collateralConfiguration`

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| collateral_pool_id | string | ID of the collateral pool |
| collateral_address | string | Address of the collateral token contract |
| price_haircut | string | Haircut applied to the price |
| auto_exchange_discount | string | Discount applied for auto exchange |
| oracle_node_id | string | ID of the oracle node |
| block_timestamp | string | Timestamp of the block |
| block_number | string | Number of the block |
| unique_id | number | Unique identifier for the configuration |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/collateralConfiguration
```

**Example Response:**
```json
[
  {
    "collateral_pool_id": "1",
    "collateral_address": "0xa9f32a851b1800742e47725da54a09a7ef2556a3",
    "price_haircut": "0",
    "auto_exchange_discount": "0",
    "oracle_node_id": "0xee1b130d36fb70e69aafd49dcf1a2d45d85927fb6ffbe7b83751df0190a95857",
    "block_timestamp": "1729066629",
    "block_number": "48099784",
    "unique_id": 4809978400193
  },
  {
    "collateral_pool_id": "1",
    "collateral_address": "0x6b48c2e6a32077ec17e8ba0d98ffc676dfab1a30",
    "price_haircut": "100000000000000000",
    "auto_exchange_discount": "20000000000000000",
    "oracle_node_id": "0x5b964bee06e9f94df6484d38dea687e67ec10326208bec16f89dfdb6cd95c6fc",
    "block_timestamp": "1727179822",
    "block_number": "46200880",
    "unique_id": 4620088000027
  }
]
```

### Get Fee Tier Parameters

Returns parameters for all fee tiers.

**Endpoint:** `GET /api/trading/feeTierParameters`

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| tier_id | string | ID of the fee tier |
| taker_fee | string | Fee applied to takers |
| maker_fee | string | Fee applied to makers |
| volume | string | Volume threshold for the tier |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/feeTierParameters
```

**Example Response:**
```json
[
  {
    "tier_id": "100",
    "taker_fee": "100000000000000",
    "maker_fee": "100000000000000",
    "volume": "0"
  },
  {
    "tier_id": "3",
    "taker_fee": "270000000000000",
    "maker_fee": "270000000000000",
    "volume": "10000000"
  }
]
```

### Get Global Fee Parameters

Returns global fee parameters for the platform.

**Endpoint:** `GET /api/trading/globalFeeParameters`

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| og_discount | string | Discount for OG users |
| referee_discount | string | Discount for referees |
| referrer_rebate | string | Rebate for referrers |
| affiliate_referrer_rebate | string | Rebate for affiliate referrers |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/globalFeeParameters
```

**Example Response:**
```json
{
  "og_discount": "300000000000000000",
  "referee_discount": "100000000000000000",
  "referrer_rebate": "100000000000000000",
  "affiliate_referrer_rebate": "150000000000000000"
}
```

## User-specific Information

### Get Wallet Configuration

Returns configuration for a specific account owner.

**Endpoint:** `GET /api/trading/wallet/:address/configuration`

**Parameters:**
- `address` (path): Wallet address

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| address | string | Wallet address |
| configuration | object | Configuration settings for the wallet |
| block_timestamp | string | Timestamp of the block |
| block_number | string | Number of the block |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/wallet/{:address}/configuration
```

**Example Response:**
```json
{
  "address": "0x1234567890abcdef1234567890abcdef12345678",
  "configuration": {
    "tier_id": "3",
    "referrer": "0x0000000000000000000000000000000000000000",
    "is_og": false
  },
  "block_timestamp": "1747830000",
  "block_number": "62100000"
}
```

### Get Wallet Leverages

Returns leverage settings for a specific wallet.

**Endpoint:** `GET /api/trading/wallet/:address/leverages`

**Parameters:**
- `address` (path): Wallet address

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| wallet_address | string | Address of the wallet |
| market_id | string | ID of the market |
| account_id | string | ID of the account |
| leverage_hi | string | High leverage setting |
| leverage_lo | string | Low leverage setting |
| block_timestamp | string | Timestamp of the block |
| block_number | string | Number of the block |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/wallet/{:address}/leverages
```

**Example Response:**
```json
[
  {
    "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
    "market_id": "1",
    "account_id": "95681",
    "leverage_hi": "50000000000000000000",
    "leverage_lo": "10000000000000000000",
    "block_timestamp": "1747830000",
    "block_number": "62100000"
  }
]
```

### Get Wallet Auto Exchange

Returns auto exchange settings for a specific wallet.

**Endpoint:** `GET /api/trading/wallet/:address/autoExchange`

**Parameters:**
- `address` (path): Wallet address

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| wallet_address | string | Address of the wallet |
| market_id | string | ID of the market |
| account_id | string | ID of the account |
| is_auto_exchange | boolean | Whether auto exchange is enabled |
| block_timestamp | string | Timestamp of the block |
| block_number | string | Number of the block |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/wallet/{:address}/autoExchange
```

**Example Response:**
```json
[
  {
    "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
    "market_id": "1",
    "account_id": "95681",
    "is_auto_exchange": true,
    "block_timestamp": "1747830000",
    "block_number": "62100000"
  }
]
```

### Get Wallet Balance History

Returns balance history for a specific wallet at a given timestamp.

**Endpoint:** `GET /api/trading/wallet/:address/balanceHistory/:timestamp`

**Parameters:**
- `address` (path): Wallet address
- `timestamp` (path): Timestamp to retrieve balance history for

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| address | string | Wallet address |
| timestamp | number | Timestamp of the balance history |
| account_pnl | object | Profit and loss information per account |
| balances | object | Balance information per asset |
| total_balance_usd | string | Total balance in USD |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/wallet/{:address}/balanceHistory/1747830000
```

**Example Response:**
```json
{
  "address": "0x1234567890abcdef1234567890abcdef12345678",
  "timestamp": 1747830000,
  "account_pnl": {
    "95681": {
      "pnl": "250.5",
      "pnl_perc": "0.025"
    }
  },
  "balances": {
    "rUSD": "10000.50",
    "ETH": "5.25"
  },
  "total_balance_usd": "25000.75"
}
```

### Get Wallet Stats

Returns trading statistics for a specific wallet.

**Endpoint:** `GET /api/trading/wallet/:address/stats`

**Parameters:**
- `address` (path): Wallet address

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| address | string | Wallet address |
| volume_24h | string | Trading volume in the last 24 hours |
| volume_7d | string | Trading volume in the last 7 days |
| volume_30d | string | Trading volume in the last 30 days |
| volume_total | string | Total trading volume |
| pnl_24h | string | Profit and loss in the last 24 hours |
| pnl_7d | string | Profit and loss in the last 7 days |
| pnl_30d | string | Profit and loss in the last 30 days |
| pnl_total | string | Total profit and loss |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/wallet/{:address}/stats
```

**Example Response:**
```json
{
  "address": "0x1234567890abcdef1234567890abcdef12345678",
  "volume_24h": "25000.5",
  "volume_7d": "150000.75",
  "volume_30d": "500000.25",
  "volume_total": "2500000.5",
  "pnl_24h": "125.5",
  "pnl_7d": "750.25",
  "pnl_30d": "2500.75",
  "pnl_total": "12500.5"
}
```

## Candle Data

### Get Current Candle

Returns the current (incomplete) candle for a specific asset pair and resolution.

**Endpoint:** `GET /api/trading/candle/:assetPairId/:resolution`

**Parameters:**
- `assetPairId` (path): Identifier of the asset pair (e.g., ETHUSDMARK)
- `resolution` (path): Time resolution of the candle ('1' | '5' | '15' | '30' | '60' | '240' | '1D'), equivalent to 1 minute, 5 minutes, 15 minutes, 30 minutes, 1 hour, 4 hours, and 1 day, respectively. 

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| t | number | Timestamp of the candle |
| o | number | Opening price |
| h | number | Highest price |
| l | number | Lowest price |
| c | number | Closing price |
| v | number | Volume |

**Example Request:**
```bash
curl https://api.reya.xyz/api/trading/candle/ETHUSDMARK/1
```

**Example Response:**
```json
{
  "time": 1747839600,
  "open": 2580.9854019,
  "high": 2582.21006435,
  "low": 2526.3936819,
  "close": 2527.2939879,
  "assetPairId": "ETHUSDMARK",
  "resolution": "60"
}
```

## WebSocket API

The Reya platform offers real-time data updates via WebSocket connections. This allows you to receive immediate updates for market data, positions, orders, and more without polling the HTTP endpoints.

### WebSocket Base URL

```
wss://websocket.reya.xyz/
```

### Connection and Subscription

To connect to the WebSocket server and subscribe to updates, follow these steps:

1. Connect to the WebSocket endpoint
2. Send a subscription message in the following format:

```json
{
  "type": "subscribe",
  "channel": "CHANNEL_NAME"
}
```

Where `CHANNEL_NAME` is one of the channels listed below.

### Message Types

The following message types are supported:

| Type | Description |
|------|-------------|
| `subscribe` | Subscribe to a channel |
| `unsubscribe` | Unsubscribe from a channel |
| `ping` | Send a ping message to maintain the connection |

### Response Types

The server will respond with messages of the following types:

| Type | Description |
|------|-------------|
| `connected` | Connection established |
| `subscribed` | Successfully subscribed to a channel |
| `unsubscribed` | Successfully unsubscribed from a channel |
| `channel_data` | Data update for a subscribed channel |
| `channel_batch_data` | Batch data update for a subscribed channel |
| `error` | Error message |
| `pong` | Response to ping message |

### Available Channels

#### Standard Channels

These channels provide market-wide information:

| Channel | Description |
|---------|-------------|
| `prices` | Real-time price updates for all asset pairs |
| `candles` | Real-time candle data updates |
| `funding-rates` | Funding rate updates |
| `markets-updates` | Market data updates |

#### Trading API Channels

These channels follow the same path structure as the REST API endpoints but provide real-time updates:

| Channel | Description |
|---------|-------------|
| `/api/trading/markets/data` | Real-time updates for all markets data |
| `/api/trading/market/:marketId/data` | Real-time updates for a specific market's data |
| `/api/trading/market/:marketId/orders` | Real-time updates for orders in a specific market |
| `/api/trading/candle/:assetPairId/:resolution` | Real-time candle data for a specific asset pair and time resolution |
| `/api/trading/wallet/:address/positions` | Real-time updates for a wallet's positions |
| `/api/trading/wallet/:address/conditionalOrders` | Real-time updates for a wallet's conditional orders |
| `/api/trading/wallet/:address/accounts` | Real-time updates for a wallet's accounts |
| `/api/trading/wallet/:address/accounts/balances` | Real-time updates for a wallet's account balances |
| `/api/trading/wallet/:address/orders` | Real-time updates for all of a wallet's orders |
| `/api/trading/wallet/:address/orders/:type` | Real-time updates for a wallet's orders of a specific type |

### Examples

#### Connecting to WebSocket

```javascript
const ws = new WebSocket('wss://websocket.reya.xyz/');

ws.onopen = function() {
  console.log('Connected to WebSocket server');
};
```

#### Subscribing to a Channel

```javascript
// Subscribe to wallet positions
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: '/api/trading/wallet/0x6c51275fd01d5dbd2da194e92f920f8598306df2/positions'
}));
```

#### Subscribing to Market Data

```javascript
// Subscribe to market data for all markets
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: '/api/trading/markets/data'
}));
```

#### Handling Messages

```javascript
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'connected':
      console.log('Connection established');
      break;
    case 'subscribed':
      console.log(`Subscribed to ${data.channel}`);
      break;
    case 'channel_data':
      console.log(`Received data update for ${data.channel}`, data.contents);
      break;
    case 'error':
      console.error(`Error: ${data.message}`);
      break;
  }
};
```

#### Sending a Ping

To keep the connection alive, send periodic ping messages:

```javascript
setInterval(() => {
  ws.send(JSON.stringify({ type: 'ping' }));
}, 30000); // Send ping every 30 seconds
```

#### Unsubscribing from a Channel

```javascript
ws.send(JSON.stringify({
  type: 'unsubscribe',
  channel: '/api/trading/wallet/0x6c51275fd01d5dbd2da194e92f920f8598306df2/positions'
}));
```

### Sample Response Formats

#### Conditional Orders Channel

When subscribing to wallet conditional orders, you'll receive a response like this:

```json
{
  "type": "subscribed",
  "connection_id": "4908b1c8-31d6-4901-91b8-55d523c3e085",
  "message_id": 11,
  "channel": "/api/trading/wallet/0x6c51275fd01d5dbd2da194e92f920f8598306df2/conditionalOrders",
  "id": "",
  "contents": [
    {
      "id": "7c64a534-8ba9-4783-ad0f-29da9756078b",
      "account_id": "95681",
      "market_id": "2",
      "order_type": "Stop Loss",
      "is_long": false,
      "trigger_price": 101000,
      "order_base": "0",
      "status": "pending",
      "creation_timestamp_ms": 1747862324116,
      "last_update_timestamp_ms": 1747862324116,
      "transaction_hash": null
    }
  ]
}
```

#### Markets Data Channel

When subscribing to the markets data channel, you'll receive detailed information about all markets. Here's a partial example showing one market's data:

```json
{
  "type": "channel_data",
  "connection_id": "4908b1c8-31d6-4901-91b8-55d523c3e085",
  "message_id": 9,
  "channel": "/api/trading/markets/data",
  "contents": {
    "model": "marketData",
    "operation": "updateMany",
    "result": [
      {
        "marketId": "62",
        "updatedAt": 1747864993271,
        "longOI": 770.3,
        "shortOI": 770.3,
        "longSkewPercentage": 50,
        "shortSkewPercentage": 50,
        "openInterest": 770.3,
        "fundingRate": 0.00205486315480895,
        "last24hVolume": 233.98173,
        "maxAmountBaseLong": 37373959.90135237,
        "maxAmountBaseShort": 37373959.90135237,
        "maxAmountSizeLong": 35945346.034107,
        "maxAmountSizeShort": 35945346.034107,
        "priceChange24H": 0.013243624000999987,
        "priceChange24HPercentage": 1.3958236580966672,
        "poolPrice": 0.9622254465402512,
        "oraclePrice": 0.9622254465402512,
        "pricesUpdatedAt": 1747864993063
      }
    ]
  },
  "version": "1.0"
}
```

#### Wallet Positions Channel

When subscribing to a wallet's positions, you'll receive data like:

```json
{
  "type": "channel_data",
  "channel": "/api/trading/wallet/0x6c51275fd01d5dbd2da194e92f920f8598306df2/positions",
  "contents": {
    "model": "position",
    "operation": "updateMany",
    "result": [
      {
        "id": "11731",
        "accountId": "13535",
        "marketId": "2",
        "baseValue": "-64300000000000000",
        "baseMultiplier": "1000000000000000000",
        "position": "Short",
        "lastPrice": "1.07722385e+23",
        "entryPrice": "1.07514829443919203950413e+23",
        "liquidationPrice": "0",
        "unrealizedPnl": "1.333333333333333333333e+22",
        "realizedPnl": "-245697740374892691166",
        "fundingValue": "5.700057500964239256881e+21",
        "createdAt": "2025-05-21T18:38:05.562Z",
        "updatedAt": "2025-05-21T18:38:05.622Z"
      }
    ]
  }
}
```

#### Wallet Orders Channel

When subscribing to a wallet's orders, you'll receive data like:

```json
{
  "type": "channel_data",
  "channel": "/api/trading/wallet/0x6c51275fd01d5dbd2da194e92f920f8598306df2/orders",
  "contents": {
    "model": "order",
    "operation": "updateMany",
    "result": [
      {
        "id": "0xd5a89629e945de581d9d682525c0550ea2f6098936e2c6292fe6f41f8e7c11f8-8",
        "market_id": "2",
        "account_id": "13535",
        "executed_base": "-1000000000000000",
        "fee": "43224",
        "price": "1.08020997e+23",
        "is_match_order": true,
        "liquidation_type": "-1",
        "position_base": "2000000000000000",
        "transaction_hash": "0xd5a89629e945de581d9d682525c0550ea2f6098936e2c6292fe6f41f8e7c11f8",
        "block_timestamp": "1747856243",
        "block_number": "67734517",
        "unique_id": 6773451700007,
        "created_at": "2025-05-21T19:37:38.417Z"
      }
    ]
  }
}
```

#### Wallet Accounts Channel

When subscribing to a wallet's accounts, you'll receive data like:

```json
{
  "type": "channel_data",
  "channel": "/api/trading/wallet/0x6c51275fd01d5dbd2da194e92f920f8598306df2/accounts",
  "contents": {
    "model": "account",
    "operation": "updateMany",
    "result": [
      {
        "id": "13535",
        "walletAddress": "0x6c51275fd01d5dbd2da194e92f920f8598306df2",
        "subAccountId": "0",
        "collateralValue": "9.999e+22",
        "allocatedCollateralValue": "0",
        "pendingDepositCollateralValue": "0",
        "pendingWithdrawCollateralValue": "0",
        "availableCollateralValue": "9.999e+22",
        "totalPnl": "1.333333333333333333333e+22",
        "accountValue": "1.13323333333333333333e+23",
        "maintenanceMargin": "1.234e+21",
        "initialMargin": "3.702e+21",
        "freeCollateral": "1.09621333333333333333e+23",
        "freeInitialMargin": "1.09621333333333333333e+23",
        "liquidationStatus": false,
        "marginRatio": "30.61",
        "lastUpdatedBlockNumber": "67734555",
        "lastUpdatedBlockTimestamp": "1747856284",
        "lastUpdatedAt": "2025-05-21T19:38:05.562Z"
      }
    ]
  }
}
```

#### Wallet Account Balances Channel

When subscribing to a wallet's account balances, you'll receive data like:

```json
{
  "type": "channel_data",
  "channel": "/api/trading/wallet/0x6c51275fd01d5dbd2da194e92f920f8598306df2/accounts/balances",
  "contents": {
    "model": "accountBalance",
    "operation": "updateMany",
    "result": [
      {
        "id": "12345",
        "accountId": "13535",
        "assetId": "1",
        "balance": "9.999e+22",
        "lastUpdatedBlockNumber": "67734555",
        "lastUpdatedBlockTimestamp": "1747856284",
        "lastUpdatedAt": "2025-05-21T19:38:05.562Z"
      }
    ]
  }
}
```

#### Market-Specific Data Channel

When subscribing to a specific market's data, you'll receive data like:

```json
{
  "type": "channel_data",
  "channel": "/api/trading/market/2/data",
  "contents": {
    "model": "marketData",
    "operation": "update",
    "result": {
      "marketId": "2",
      "updatedAt": 1747863993271,
      "longOI": 6342.88,
      "shortOI": 6342.88,
      "longSkewPercentage": 50,
      "shortSkewPercentage": 50,
      "openInterest": 6342.88,
      "fundingRate": 0.00098752315480895,
      "last24hVolume": 1532.21456,
      "maxAmountBaseLong": 78324959.90135237,
      "maxAmountBaseShort": 78324959.90135237,
      "maxAmountSizeLong": 71923346.034107,
      "maxAmountSizeShort": 71923346.034107,
      "priceChange24H": -0.0253624000999987,
      "priceChange24HPercentage": -2.3958236580966672,
      "poolPrice": "1.07514829443919203950413e+23",
      "oraclePrice": "1.07514829443919203950413e+23",
      "pricesUpdatedAt": 1747863993063
    }
  }
}
```

#### Market Orders Channel

When subscribing to a specific market's orders, you'll receive data like:

```json
{
  "type": "channel_data",
  "channel": "/api/trading/market/2/orders",
  "contents": [
    {
      "id": "0xa43dca8223d0383d1efb318026983650f3ffb5e950a9ba9464e89194a3cdc2f2-7",
      "market_id": "2",
      "account_id": "18073",
      "executed_base": "4000000000000000",
      "fee": "43208",
      "price": "1.08020997e+23",
      "is_match_order": true,
      "liquidation_type": "-1",
      "position_base": "-407500000000000000",
      "transaction_hash": "0xa43dca8223d0383d1efb318026983650f3ffb5e950a9ba9464e89194a3cdc2f2",
      "block_timestamp": "1747856243",
      "block_number": "67734517",
      "unique_id": 6773451700007,
      "created_at": "2025-05-21T19:37:38.417Z"
    }
  ]
}
```

#### Prices Channel

When subscribing to the prices channel, you'll receive data like:

```json
{
  "type": "channel_data",
  "channel": "prices",
  "contents": {
    "ETH": 2527.29,
    "BTC": 61456.23,
    "EVMOS": 0.06421,
    "ARB": 0.7894,
    "MATIC": 0.5321,
    "SOL": 124.98,
    "AVAX": 24.75,
    "DOGE": 0.1123,
    "timestamp": 1747863993063
  }
}
```

#### Candles Channel

When subscribing to the candles channel, you'll receive data like:

```json
{
  "type": "channel_data",
  "channel": "candles",
  "contents": {
    "ETH": {
      "1": {
        "t": 1747839600,
        "o": 2580.99,
        "h": 2582.21,
        "l": 2526.39,
        "c": 2527.29,
        "v": 1254.78
      },
      "5": {
        "t": 1747839300,
        "o": 2579.45,
        "h": 2584.76,
        "l": 2525.21,
        "c": 2527.29,
        "v": 5467.32
      }
    },
    "BTC": {
      "1": {
        "t": 1747839600,
        "o": 61502.34,
        "h": 61789.65,
        "l": 61345.89,
        "c": 61456.23,
        "v": 432.67
      }
    }
  }
}
```

#### Funding Rates Channel

When subscribing to the funding rates channel, you'll receive data like:

```json
{
  "type": "channel_data",
  "channel": "funding-rates",
  "contents": {
    "ETH": 0.00205486315480895,
    "BTC": 0.00098752315480895,
    "SOL": 0.00352416315480895,
    "AVAX": 0.00124863315480895,
    "timestamp": 1747863993063
  }
}
```

### Message Fields

#### Subscription Response

| Field | Description |
|-------|-------------|
| `type` | Message type (e.g., "subscribed", "channel_data") |
| `connection_id` | Unique identifier for the WebSocket connection |
| `message_id` | Sequential message ID for the connection |
| `channel` | The channel the message pertains to |
| `id` | Optional channel ID (often empty string) |
| `contents` | The channel data contents |
| `version` | API version (for channel_data messages) |

#### Market Data Fields

| Field | Description |
|-------|-------------|
| `marketId` | Unique identifier for the market |
| `updatedAt` | Timestamp when the data was last updated (milliseconds) |
| `longOI` | Long open interest |
| `shortOI` | Short open interest |
| `longSkewPercentage` | Percentage of open interest that is long |
| `shortSkewPercentage` | Percentage of open interest that is short |
| `openInterest` | Total open interest |
| `fundingRate` | Current funding rate |
| `last24hVolume` | 24-hour trading volume |
| `priceChange24H` | Absolute price change in the last 24 hours |
| `priceChange24HPercentage` | Percentage price change in the last 24 hours |
| `poolPrice` | Current pool price |
| `oraclePrice` | Current oracle price |
| `pricesUpdatedAt` | Timestamp when prices were last updated (milliseconds) |

#### Conditional Order Fields

| Field | Description |
|-------|-------------|
| `id` | Unique identifier for the conditional order |
| `account_id` | ID of the account that placed the order |
| `market_id` | ID of the market the order is for |
| `order_type` | Type of conditional order (e.g., "Stop Loss") |
| `is_long` | Whether the order is long (true) or short (false) |
| `trigger_price` | Price at which the order will be triggered |
| `order_base` | Base amount for the order |
| `status` | Current status of the order (e.g., "pending") |
| `creation_timestamp_ms` | Timestamp when the order was created (milliseconds) |
| `last_update_timestamp_ms` | Timestamp when the order was last updated (milliseconds) |
| `transaction_hash` | Blockchain transaction hash (if available) |

### Usage Notes

1. Keep your WebSocket connection alive by sending ping messages at regular intervals (approximately every 30 seconds).
2. Error handling is important - if you receive an error message, check the error and reconnect if necessary.
3. For high-volume data channels, consider using the `batched` parameter in your subscription request to receive updates in batches rather than individually.
4. The WebSocket server may disconnect inactive connections after a period of inactivity.