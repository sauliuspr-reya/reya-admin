# Reya Dashboard (reyadash) - Vision & Scope

## 1. Project Overview

**Project Name:** Reya Dashboard (Internal Codename: reyadash)
**Future Hosting:** reyadash.ring29.com

**Core Purpose:**
To provide a comprehensive, analytical, and user-centric dashboard for the Reya DEX. This platform aims to offer insights beyond a standard trading interface, catering to advanced/institutional traders, liquidity providers, internal Reya teams, and the general public interested in DEX performance and statistics. It will allow users to monitor market dynamics, track top performers, analyze liquidity, view detailed charts, and (for authenticated users) manage their personal trading activity and preferences.

## 2. Target Audience

*   **Advanced/Institutional Traders:** Seeking in-depth analytics, performance tracking, and comparative data.
*   **Retail Traders & Reya Users:** Looking for a richer understanding of market activity, their own performance, and opportunities.
*   **Liquidity Providers:** Interested in collateral and staking metrics, TVL, and overall DEX health.
*   **Internal Reya Teams:** For monitoring, analytics, and operational insights.
*   **General Public:** Interested in transparent DEX statistics.

## 3. Core Features (Phased Approach)

### Phase 1: Foundational Views & User Authentication

*   **Market Overview:**
    *   Key 24-hour market stats (e.g., Total Volume, Number of Trades).
    *   Global DEX positioning (e.g., Long/Short ratios if applicable).
    *   Snapshot of overall DEX health and activity.
*   **Top Traders Leaderboard:**
    *   Display key performance metrics (e.g., Realized PnL, Total Volume, ROI, Win Rate).
    *   Filterable by timeframes (24hr, 7-day, 30-day, All-time).
    *   Sortable by different metrics.
    *   Display trader identities (e.g., truncated addresses, ENS, or anonymized IDs).
*   **Trade History:**
    *   For authenticated users: Detailed personal trade history.
    *   For public view: Aggregated or anonymized recent trades on the DEX.
    *   Filterable by asset, date range, etc.
*   **Open Positions:**
    *   For authenticated users: Live view of personal open positions (Notional, Entry, Liq. Price, Unrealized PNL, Funding Paid, Account Value).
    *   For public view: Aggregated open interest or anonymized significant positions.
*   **Collateral & Staking Insights:**
    *   Total Collateral Value (USD) on DEX, with breakdown by asset.
    *   Number of collateral providers.
    *   Total Staked Value (USD), with breakdown by asset (if applicable).
    *   Number of stakers, average APY (if applicable).
    *   Visualizations to show liquidity depth and health.
*   **Dedicated TradingView Chart Screen:**
    *   Interactive TradingView chart integration.
    *   Ability to select any trading pair available on Reya DEX.
    *   Standard chart tools, indicators, and timeframes.
*   **User Authentication & Wallet Integration:**
    *   **Google OAuth:** For easy sign-up/login.
    *   **Dynamic Wallet Connection:** Integration with popular web3 wallets (e.g., MetaMask, WalletConnect via libraries like RainbowKit, wagmi, Web3Modal).
        *   Fetch user-specific stats (portfolio, trade history).
        *   Save user preferences (chart layouts, favorite pairs, notification settings).

### Phase 2 & Beyond (Future Considerations)

*   **Direct Trade Execution:** From the dashboard for authenticated users.
*   **Advanced Analytics & "Quantized Information":**
    *   Comparative analysis: Reya Funding Rates vs. other venues.
    *   Collateral risk analysis.
    *   Customizable alerts and notifications.
*   **Social Features:** (e.g., sharing trade setups, following top traders - with privacy controls).
*   **Mobile-Responsive Design Enhancements.**

## 4. Technology Stack (Initial)

*   **Frontend:** Next.js (React)
*   **Charting:** TradingView Lightweight Charts or similar integration.
*   **Styling:** Tailwind CSS (or user preference).
*   **State Management:** Zustand, Recoil, or React Context (to be decided).
*   **Authentication:** NextAuth.js (for Google OAuth and credential handling).
*   **Wallet Connection:** wagmi/RainbowKit or Web3Modal.

## 5. Design Philosophy (Inspired by HyperDash where applicable)

*   **Data-Dense but Clear:** Present a wealth of information without overwhelming the user.
*   **Intuitive Navigation:** Easy to find different sections and data points.
*   **Performant:** Fast loading and responsive, especially with real-time data.
*   **Customizable:** Allow users to tailor views and information to their needs (especially when logged in).
*   **Modern & Professional Aesthetic.**

## 6. Key Questions & Next Steps

*   Confirm backend API availability/specs for fetching DEX data (trades, positions, liquidity, etc.).
*   Define specific data points and sources for each metric in Phase 1.
*   Start UI mockups/wireframes based on these features.

---

This document will be updated as the project progresses.

## 7. Proposed Page Map and Layout (v2.0)

### 7.1 Pages

- Overview (`/overview`)
- Leaderboard (`/leaderboard`) — current root `page.tsx` content will move here
- Trades (`/trades`) — detailed order history with filters
- Positions (`/positions`) — open positions view with risk/margin context
- Markets (`/markets`) — per-market dashboards (select market)

### 7.2 Overview Page

- KPIs: Total Volume, Trades, Open Interest, Fees, Net Funding (24h/7d/30d)
- Charts:
  - Daily/Hourly Volume Histogram with breakdown toggle: Discord / Wallet / Account / None
  - Markets Breakdown: totals (treemap or bars) and time-bucketed series
  - Open Interest Line (by market)
- Tables: Top Markets (Vol/Trades/OI), Top Wallets (Vol/PnL/WinRate)

### 7.3 Leaderboard Page

- Existing `TradeTable` enhanced: Wallet, Account IDs, Discord Name/Rank, Tier, Trades, Volume, PnL, Win Rate, Fees, Funding, Last Trade
- Timeframe selector; sorting and search
- Click-through to wallet page (future)

### 7.4 Trades Page (Order History)

- Advanced filter bar: Time range, Market, Wallet/Account, Side, Type
- Paginated table (order_history) with columns: Time, Market, Account, Wallet/Discord, Side, Size, Price, Fee, rPnL, FundingPnL
- Context histogram above table (volume over selected range)

### 7.5 Positions Page (Open Positions)

- Current open positions enriched with wallet/discord and margin stats
- Columns: Market, Side, Size, Notional (RUSD), Entry, Mark, Liq Price, Margin Ratio, Unrealized PnL, Discord/Wallet
- Risk buckets and filters; per-market grouping

### 7.6 Markets Page

- Market selector; for selected market show:
  - KPIs: 24h Vol, Trades, OI, Funding Rate
  - Charts: Volume/Trades histogram, OI line, Funding rate series
  - Tables: Top Traders in market, Recent Trades

## 8. Initial Backend Endpoints (Incremental)

- GET `/api/trade-histogram`
  - Params: `start`, `end` (ms); `bucket` (hour|day); `breakdown` (discord|account|wallet|none); `marketId?`
  - Output: time buckets with USD volume; stacked by series key when breakdown selected

- GET `/api/market-breakdown`
  - Params: `start`, `end`; `bucket` (none|hour|day); `metrics` (volume|trades|pnl|fees|funding); `marketId?`
  - Output: totals per market and/or bucketed series

- GET `/api/open-interest`
  - Params: `start`, `end`; `bucket` (hour|day); `marketId?`
  - Source: `public."MarketOpenInterest"` or `public."PointsXpOpenInterestSnapshots"`

- GET `/api/margins`
  - Params: `start`, `end`; `bucket` (hour|day); `groupBy` (account|wallet)
  - Source: `AccountTotalBalanceSeries` / `AccountBalanceSeries` / `margin_accounts_balance_entries`

Notes:
- Standardize joins via `latest_owners` CTE to map `account_id` → wallet, then enrich with `"WalletDiscordLink"` and `"WalletDetails"`, `account_owner_configuration`.
- Use `date_trunc(bucket, timestamp)` for bucketing; whitelist params to prevent injection.
