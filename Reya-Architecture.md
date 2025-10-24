# Reya Architecture Documentation

## Overview

Reya is a decentralized exchange (DEX) platform operating primarily on the Arbitrum blockchain with a comprehensive off-chain component for analytics, administration, and enhanced user experience. The platform handles approximately 500 trades per hour with around 1,000 active traders who may have multiple wallets.

## System Architecture Components

### 1. Data Storage Systems

#### 1.1 Primary Database (AWS RDS PostgreSQL)
- Stores most off-chain data including user information, trades, positions, and market data
- Schema defined in `schema.prisma` using Prisma ORM
- Connected via Node.js server-side components

#### 1.2 Redis Pub/Sub
- Used for real-time messaging and event broadcasting
- Likely handles price updates and trade events

#### 1.3 Blockchain (Arbitrum)
- Primary source of truth for all on-chain data
- Stores actual trades, positions, and token transfers
- Core smart contracts handle trading logic, liquidations, and settlement

### 2. Data Models

#### 2.1 User Data Models
- **Account System**: No traditional registration; users connect via wallet addresses
- **Account Owner**: Tracked in `account_owner_updated_snapshot` and history tables
- **Identity Linking**: Discord handlers mapped to wallets via `WalletDiscordLink` model
- **Multiple Wallets**: A single user may have multiple wallet addresses
- **Account Tiers/Ranks**: Based on trading volume and staking metrics

#### 2.2 Market Data Models
- **Markets**: Defined in `Market` model with relationships to assets
- **Assets**: Tokens tracked in `Asset` model with price feeds
- **Price Data**: 
  - Stored in `asset_price` tables
  - Candles stored in `Candle`, `SpotCandle`, and `StorkPriceCandle` models
  - Oracle updates ~60 assets every 0.5 seconds (more frequent during volatility)

#### 2.3 Trading Data Models
- **Orders**: Stored in `orders` and `order_history` tables
- **Positions**: Current position data in `position_raw` table
- **Trades**: Historical trading data with volume, price impact
- **Statistics**: Account and market-specific trading statistics

#### 2.4 Financial Data Models
- **Collateral**: Asset balances in user accounts
- **Fee System**: Including rebates and referral tracking
- **Margin Accounts**: For leveraged trading

### 3. Application Architecture

#### 3.1 Web Application (Next.js)
- **Frontend**: React-based with server-side rendering
- **API Routes**: REST endpoints under `/api` directory
- **Authentication**: Using NextAuth.js with wallet-based authentication
- **Middleware**: Handles request processing and authentication

#### 3.2 Data Flow

1. **User Authentication Flow**:
   - User connects wallet (no traditional registration)
   - Wallet address becomes primary identifier
   - Optional Discord linking for social features and rank claiming

2. **Trading Data Flow**:
   - On-chain transactions recorded on Arbitrum blockchain
   - Events from blockchain indexed into PostgreSQL database
   - Analytics and user interface read from PostgreSQL database
   - Real-time updates likely propagated via Redis pub/sub

3. **Price Oracle Flow**:
   - External price feeds update asset prices
   - Updates processed approximately every 0.5 seconds
   - Higher update frequency during market volatility
   - Price data stored in candle models for different timeframes

4. **Analytics Collection Flow**:
   - Trading activity tracked in database
   - User IP addresses collected via API middleware
   - User session data potentially stored for analytics
   - Wallet-to-user mapping established through behavioral analysis and Discord linking

## Current Limitations and Challenges

1. **User Identification**: 
   - Same user can have multiple wallets
   - Difficult to consolidate user activity across wallets without Discord linking

2. **Data Volume**:
   - High frequency of price updates (60 assets every 0.5 seconds)
   - ~500 trades per hour creating significant data

3. **Analytics Performance**:
   - Current schema not optimized for analytical queries
   - No dedicated data warehouse or analytics-specific schema

## Recommendations for Analytics Architecture

### 1. Data Warehouse Implementation

#### 1.1 Proposed Structure
- Implement a dedicated data warehouse separate from transactional database
- Use columnar storage format optimized for analytics (e.g., Amazon Redshift, Snowflake, or BigQuery)
- Create ETL/ELT pipelines to move data from PostgreSQL to data warehouse

#### 1.2 Data Transformation Layer
- Implement dbt (data build tool) for transformations
- Create denormalized views optimized for common queries
- Implement user identity resolution across wallets
- Create aggregated tables for time-series analysis

### 2. Real-time Analytics with MCP Protocol

#### 2.1 MCP Protocol Integration
- Implement MCP protocol adapter to standardize data formats
- Use MCP for cross-chain data synchronization
- Leverage MCP's indexing capabilities for efficient querying

#### 2.2 Streaming Data Architecture
- Use Kafka or similar streaming platform to handle real-time data flows
- Implement real-time processing with Spark Streaming or Flink
- Create materialized views for real-time dashboards

### 3. Machine Learning Infrastructure

#### 3.1 Feature Store
- Implement a feature store for ML features
- Create derived features for user behavior, market conditions, and trading patterns
- Store historical feature values for model training

#### 3.2 ML Model Serving
- Design a model serving infrastructure
- Enable A/B testing framework for model evaluation
- Create feedback loops to continuously improve models

## Implementation Priorities

1. **Short-term**:
   - Implement user identity resolution across wallets
   - Create data warehouse with basic ETL pipelines
   - Develop key performance indicators and dashboards

2. **Medium-term**:
   - Implement MCP protocol integration
   - Develop streaming analytics capabilities
   - Create initial ML models for user behavior prediction

3. **Long-term**:
   - Build comprehensive ML infrastructure
   - Implement advanced anomaly detection and fraud prevention
   - Develop predictive models for market analysis

## Data Security and Compliance Considerations

1. **Data Privacy**:
   - Implement proper anonymization for analytics data
   - Ensure compliance with relevant regulations

2. **Security**:
   - Implement proper access controls for analytics infrastructure
   - Encrypt sensitive data in transit and at rest

3. **Audit Trail**:
   - Maintain comprehensive logs of data access and modifications
   - Create immutable audit records for compliance purposes

## Conclusion

The Reya platform has a solid foundation with its existing data architecture but requires enhancements to support advanced analytics and machine learning capabilities. By implementing a dedicated data warehouse, integrating with MCP protocol, and building ML infrastructure, Reya can leverage its rich data to create more value for users and gain deeper insights into platform usage and market dynamics.
