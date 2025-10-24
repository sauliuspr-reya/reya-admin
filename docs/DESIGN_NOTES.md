# Reya Dashboard - Designer Notes

This document contains detailed design specifications and wireframe guides to assist in the UI/UX design process for the Reya Dashboard.

## Section 1: Detailed Design Specification for Figma - Single Asset Trading Screen

**Screen Name:** Single Asset Trading / Market View
**Primary Goal:** Allow users to analyze a specific trading pair, view market data, manage their orders/positions for that pair, and execute trades.
**Inspiration:** Professional trading terminals (e.g., HyperDash, Binance, Kraken Pro). Dark theme is assumed for this spec, but light theme equivalents should be considered.

**I. Global Application Shell (Consistent Across All Screens)**

    **A. Top Navigation Bar (Global Header)**
        *   **Height:** Approx. 60-70px.
        *   **Background:** Dark grey (e.g., `#1A1E2B`).
        *   **Border:** Subtle bottom border (e.g., 1px solid `#2C3140`).
        *   **Elements (Left to Right):**
            1.  **Logo/Brand:**
                *   Content: "ReyaDash" text logo or a dedicated Reya logo.
                *   Styling: White or light accent color. Clickable, links to "Market Overview" or a default landing page.
                *   Padding: Approx. 20px left.
            2.  **Main Navigation Links:**
                *   Items: `Market Overview`, `Markets` (leads to a list of all tradable pairs), `Trade` (this current screen, shows selected pair), `Portfolio` (user-specific, enabled if logged in), `Staking`, `Leaderboard`.
                *   Styling:
                    *   Default: Semi-transparent white text (e.g., `#A0A3AD`).
                    *   Hover: Brighter white text (e.g., `#FFFFFF`).
                    *   Active (Current Screen): Brighter white text, potentially with a subtle underline or background highlight.
                *   Spacing: Approx. 20-30px between links.
            3.  **Spacer Element:** (To push right-side elements to the far right).
            4.  **Connect Wallet Button:**
                *   Default State (Logged Out):
                    *   Text: "Connect Wallet".
                    *   Styling: Primary action button style (e.g., blue background `#3B82F6`, white text). Rounded corners.
                    *   On Click: Opens wallet connection modal (e.g., RainbowKit/Web3Modal).
                *   Connected State:
                    *   Displays: Truncated wallet address (e.g., `0x123...abcd`) or ENS name.
                    *   Optional: Small avatar/icon.
                    *   Styling: Less prominent than "Connect Wallet" button, perhaps just text with an icon.
                    *   On Click: Opens a small dropdown/modal with "Copy Address," "View Portfolio," "Disconnect."
            5.  **Google Auth Button / User Profile:**
                *   Default State (Not logged in via Google):
                    *   Text: "Login" or an icon (e.g., user silhouette).
                    *   Styling: Secondary button style or subtle icon button.
                    *   On Click: Initiates Google OAuth flow.
                *   Logged In State (Google):
                    *   Displays: User's Google profile picture (small circle) or initial.
                    *   On Click: Opens dropdown with "Account Settings," "Preferences," "Logout."
            6.  **Theme Switcher:**
                *   Icon: Sun/Moon icon.
                *   On Click: Toggles between light and dark themes for the entire application.
            7.  **Settings Icon (Optional):**
                *   Icon: Gear icon.
                *   On Click: Opens global application settings modal (notifications, language, etc.).
                *   Padding: Approx. 20px right.

**II. Screen-Specific Content (Below Global Header)**

    **A. Market Information Bar**
        *   **Height:** Approx. 50-60px.
        *   **Background:** Slightly lighter dark grey than header (e.g., `#202534`).
        *   **Layout:** Horizontal, elements spaced appropriately.
        *   **Elements (Left to Right):**
            1.  **Market Selector Dropdown:**
                *   Displays: Currently selected pair (e.g., "REYA/USD"). Arrow icon indicating dropdown.
                *   Styling: Clear text, perhaps with base/quote assets styled slightly differently.
                *   On Click: Opens a modal or large dropdown.
                    *   **Modal Content:** Search bar at the top. List of available markets (e.g., "BTC/USD", "ETH/USD"). Each list item shows: Pair Name, Last Price, 24h Change %. Favorites tab.
            2.  **Selected Market - Last Price:**
                *   Styling: Large font, e.g., 20-24px. Color changes based on last tick (green for up, red for down).
            3.  **Selected Market - 24h Change:**
                *   Format: `+$X.XX (+Y.YY%)` or `-$X.XX (-Y.YY%)`.
                *   Styling: Smaller font than price. Color-coded green/red.
            4.  **Selected Market - 24h High:**
                *   Label: "24h High". Value: Price.
            5.  **Selected Market - 24h Low:**
                *   Label: "24h Low". Value: Price.
            6.  **Selected Market - 24h Volume (Asset & Quote):**
                *   Label: "24h Vol". Value: `X REYA / Y USD`.
            7.  **Selected Market - Funding Rate (If Applicable):**
                *   Label: "Funding". Value: `Z.ZZZZ% (in H hours)`. Color-coded.
            8.  **Selected Market - Open Interest (If Applicable):**
                *   Label: "Open Interest". Value: `X REYA / Y USD`.

    **B. Main Multi-Panel Layout (Flexbox/Grid based)**
        *   This area should fill the remaining vertical space.
        *   Composed of resizable panels (optional, for advanced users) or fixed-proportion panels.

        **1. Center/Left Panel Group (Largest Area):**
            *   **TradingView Chart:**
                *   Integration: Lightweight Charts or full TradingView library.
                *   Takes up majority of this group's space.
                *   Controls (usually part of the chart library but ensure they are styled consistently):
                    *   Timeframe selectors (1m, 5m, 15m, 1H, 4H, 1D, etc.).
                    *   Chart type (Candles, Line, Area).
                    *   Indicators button.
                    *   Drawing tools palette.
                    *   Fullscreen toggle.

        **2. Right Panel Group (Trade Execution & Market Depth):**
            *   **Panel Width:** Approx. 300-350px.
            *   **a. Order Form (Top Section of Right Panel):**
                *   **Tabs:** `Buy/Long`, `Sell/Short`. Active tab highlighted.
                *   **Sub-Tabs (Order Type):** `Market`, `Limit`, `Stop`. Active type highlighted.
                *   **Inputs:**
                    *   `Price` (USD): Visible for Limit/Stop. Pre-fills on Order Book click.
                    *   `Amount` (REYA): Input field.
                    *   `Total` (USD): Input field (either Amount or Total can be primary, other calculates).
                    *   `Leverage Slider/Input`: If perpetuals. Displays current leverage.
                    *   `Percentage Buttons`: (25%, 50%, 75%, 100%) of available balance for collateral.
                *   **Information Display:**
                    *   `Available Balance`: (e.g., "Avbl: 1,250.50 USD").
                    *   `Est. Cost/Proceeds`: (e.g., "Cost: ~500 USD").
                    *   `Est. Liquidation Price`: If leverage is used.
                    *   `Fees`: (e.g., "Fee: ~0.50 USD (0.1%)").
                *   **Action Button:**
                    *   Text: `Buy REYA` or `Sell REYA` (changes with selected side/type).
                    *   Styling: Green for Buy, Red for Sell. Full width. Disabled if form is incomplete or insufficient funds.
                    *   Confirmation: On click, modal for order confirmation (optional, user preference).
            *   **b. Order Book (Middle Section of Right Panel):**
                *   **Height:** Significant portion, e.g., 300-400px or dynamic.
                *   **Layout:** Two columns (Bids on left, Asks on right) separated by a spread display.
                *   **Columns:** `Total` (Cumulative Size), `Size` (Individual Order Size), `Price`.
                    *   Bids: Price descending. Green text/background highlights for size.
                    *   Asks: Price ascending. Red text/background highlights for size.
                *   **Spread Display:** Current bid-ask spread value shown between the two columns.
                *   **Interactivity:** Clicking a price/size pre-fills the Order Form.
                *   **Controls:** Grouping dropdown (e.g., 0.01, 0.1, 1.0 decimal places). Depth visualization toggle (show/hide background depth bars).
            *   **c. Recent Trades (Market-Wide) (Bottom Section of Right Panel):**
                *   **Height:** E.g., 200-250px or dynamic.
                *   **Title:** "Market Trades".
                *   **Table Columns:** `Time` (HH:MM:SS), `Price` (USD), `Amount` (REYA).
                *   **Styling:** Rows color-coded (green for buys, red for sells). Real-time updates.

        **3. Bottom Panel Group (User-Specific Data & More Market Info - Tabbed Interface):**
            *   **Height:** E.g., 250-350px. Can be resizable or fixed.
            *   **Tab Buttons:** Clear tab navigation. Active tab highlighted.
            *   **a. Tab: My Positions (for current market)**
                *   Table Columns: `Asset`, `Side`, `Size`, `Entry Price`, `Mark Price`, `Liq. Price`, `Margin` (value & +/- button), `Unrealized PNL (%)`, `Realized PNL`.
                *   Actions per row: `Close Position` button (market/limit options), `Add/Remove Margin` button.
                *   Summary: Total PNL for positions in this market.
            *   **b. Tab: My Orders (for current market)**
                *   Sub-Tabs: `Open Orders`, `Order History`, `Trade History`.
                *   `Open Orders`: Table like Positions, but with `Type` (Limit/Stop), `Cancel Order` button.
                *   `Order History`: Includes cancelled, filled orders.
                *   `Trade History`: Individual fills.
            *   **c. Tab: Liquidations (Market-wide for this asset)**
                *   Title: "Recent Liquidations".
                *   Table Columns: `Time`, `Side`, `Price`, `Amount Liquidated`.
            *   **d. Tab: Asset Details / Contract Specs**
                *   Static info: Full Asset Name, Project Link, Contract Address (if applicable), Max Leverage, Min Order Size, Tick Size, Funding Interval Details, Insurance Fund Balance, etc.

---

## Section 2: Excalidraw Wireframe Guide - Single Asset Trading Screen

This guide describes elements to draw in Excalidraw for a low-fidelity wireframe.

**1. Global Application Header (Topmost Strip)**
    *   **Shape:** A wide rectangle across the top.
        *   `[Rectangle: x=0, y=0, width=canvas_width, height=60, label="Global Header BG"]`
    *   **Text (Left):** "ReyaDash"
        *   `[Text: "ReyaDash", x=20, y=20]`
    *   **Text (Center):** "Market Overview | Markets | **Trade** | Portfolio | Staking | Leaderboard" (underline "Trade" or make it bold)
        *   `[Text: "Market Overview", x=150, y=20]`
        *   `[Text: "Markets", x=280, y=20]`
        *   `[Text: "Trade (Active)", x=380, y=20, bold=true]`
        *   *(...and so on for other nav links)*
    *   **Text (Right):** "Connect Wallet" (Button-like appearance)
        *   `[Rectangle: x=canvas_width-280, y=15, width=120, height=30, label="Connect Wallet Btn"]`
        *   `[Text: "Connect Wallet", within_previous_rectangle]`
    *   **Text (Far Right):** "Login" (Button-like) / User Icon
        *   `[Rectangle: x=canvas_width-150, y=15, width=80, height=30, label="Login Btn"]`
        *   `[Text: "Login", within_previous_rectangle]`
    *   **Icons (Far Right, if desired):** Small circles or squares for Theme, Settings.
        *   `[Circle: x=canvas_width-60, y=25, radius=10, label="Theme Icon"]`
        *   `[Square: x=canvas_width-30, y=25, size=20, label="Settings Icon"]`

**2. Market Information Bar (Strip below Global Header)**
    *   **Shape:** Another wide rectangle.
        *   `[Rectangle: x=0, y=60, width=canvas_width, height=50, label="Market Info BG"]`
    *   **Text (Left):** "REYA/USD [v]" (The [v] indicates a dropdown arrow)
        *   `[Text: "REYA/USD [v]", x=20, y=75]`
    *   **Text (Spaced across the Market Info Bar):**
        *   `[Text: "Price: $105.50 (green)", x=150, y=75]`
        *   `[Text: "24h Chg: +$2.10 (+2.03%) (green)", x=280, y=75]`
        *   `[Text: "24h H: $106.00", x=480, y=75]`
        *   `[Text: "24h L: $103.00", x=600, y=75]`
        *   `[Text: "24h Vol: 1.2M REYA / 126M USD", x=720, y=75]`
        *   `[Text: "Funding: 0.01% (1h)", x=950, y=75]`

**3. Main Content Area (Below Market Info Bar)**

    *   **Zone 1: Chart Area (Largest, Center/Left)**
        *   `[Rectangle: x=20, y=120, width=canvas_width * 0.6, height=canvas_height * 0.5, label="TradingView Chart Area"]`
        *   `[Text: "[TradingView Chart]", centered_in_previous_rectangle]`
        *   `[Text: "Controls: 1m 5m 1H 1D | Indicators | Draw", x=30, y=130 (above chart area)]`

    *   **Zone 2: Order Panel (Right Sidebar)**
        *   `[Rectangle: x=canvas_width*0.6 + 30, y=120, width=canvas_width*0.35, height=canvas_height*0.7, label="Right Panel BG"]`

        *   **Inside Right Panel - Order Form (Top part):**
            *   `[Text: "Buy | Sell", x=Zone2.x+10, y=Zone2.y+10 (as tabs)]`
            *   `[Text: "Market | Limit | Stop", x=Zone2.x+10, y=Zone2.y+40 (as sub-tabs)]`
            *   `[Text: "Price:", x=Zone2.x+10, y=Zone2.y+70]`
            *   `[Rectangle: (input field for Price), x=Zone2.x+60, y=Zone2.y+65, width=100, height=25]`
            *   `[Text: "Amount:", x=Zone2.x+10, y=Zone2.y+100]`
            *   `[Rectangle: (input field for Amount), x=Zone2.x+70, y=Zone2.y+95, width=100, height=25]`
            *   `[Text: "Leverage: [Slider]", x=Zone2.x+10, y=Zone2.y+130]`
            *   `[Rectangle: "Place Buy Order" (Button), x=Zone2.x+10, y=Zone2.y+160, width=Zone2.width-20, height=30, label="Buy Button"]`

        *   **Inside Right Panel - Order Book (Middle part):**
            *   `[Text: "Order Book", x=Zone2.x+10, y=Zone2.y+200]`
            *   `[Rectangle: (Asks section), x=Zone2.x+10, y=Zone2.y+220, width=Zone2.width/2-15, height=150, label="Asks"]`
            *   `[Text: "Price | Size | Total (Red text)", inside_asks_rectangle, at_top]`
            *   `[Rectangle: (Bids section), x=Zone2.x+Zone2.width/2, y=Zone2.y+220, width=Zone2.width/2-15, height=150, label="Bids"]`
            *   `[Text: "Price | Size | Total (Green text)", inside_bids_rectangle, at_top]`

        *   **Inside Right Panel - Market Trades (Bottom part):**
            *   `[Text: "Market Trades", x=Zone2.x+10, y=Zone2.y+380]`
            *   `[Rectangle: (Trades list area), x=Zone2.x+10, y=Zone2.y+400, width=Zone2.width-20, height=100, label="Trades List"]`
            *   `[Text: "Time | Price | Amount (color coded rows)", inside_trades_list_rectangle, at_top]`

    *   **Zone 3: User Info Panel (Bottom Strip/Area)**
        *   `[Rectangle: x=20, y=canvas_height*0.5 + 130, width=canvas_width*0.6, height=canvas_height*0.2, label="Bottom Panel BG"]`
        *   **Tabs:**
            *   `[Text: "My Positions | My Orders | Liquidations | Asset Details", x=30, y=Zone3.y+10 (as tabs)]`
        *   **(Content area for active tab - e.g., My Positions):**
            *   `[Text: "Table: Asset | Side | Size | Entry | PNL...", x=30, y=Zone3.y+40]`

---
End of Designer Notes.

---

## Section 3: Dashboard Pages Outline (v2.0)

This section complements `docs/VISION.md#7` and specifies high-level UI blocks for each dashboard page.

### 3.1 Overview (`/overview`)

- KPIs row: Total Volume, Trades, Open Interest, Fees, Net Funding (timeframe toggle)
- Chart 1: Volume Histogram (stacked)
  - Controls: Time range (1d/7d/30d/custom), Bucket (auto/hour/day), Breakdown [Discord | Wallet | Account | None]
- Chart 2: Markets Breakdown
  - Modes: Totals (treemap/bars) and Time Series (stacked bars by market)
- Chart 3: Open Interest Line
  - By market (multi-select), same time controls
- Tables: Top Markets (Vol/Trades/OI), Top Wallets (Vol/PnL/WinRate)

### 3.2 Leaderboard (`/leaderboard`)

- Main component: `TradeTable` from `src/app/page.tsx` (MUI X DataGrid)
- Filters: Timeframe, search; columns include Wallet, Account IDs, Discord Name/Rank, Tier, Trades, Volume, PnL, Win Rate, Fees, Funding, Last Trade
- Actions: Row click → wallet/accounts detail (future)

### 3.3 Trades (`/trades`)

- Filter Bar: Time range, Market, Wallet/Account, Side, Order Type
- Context Chart: Mini volume histogram for selected filters
- Table: Order History (from `public.order_history`)
  - Columns: Time, Market, Account, Wallet/Discord, Side, Size, Price, Fee, rPnL, FundingPnL, Tx Hash

### 3.4 Positions (`/positions`)

- Filter Bar: Market, Risk buckets (by margin ratio), Wallet/Discord
- Table: Open Positions (`public.position_raw` + enrichments)
  - Columns: Market, Side, Size, Notional (RUSD), Entry, Mark, Liq Price, Margin Ratio, Unrealized PnL, Discord/Wallet
- Panels: Risk distribution (histogram by margin ratio), per-market exposure

### 3.5 Markets (`/markets`)

- Left: Market selector (searchable)
- Right: Market dashboard
  - KPIs: 24h Vol, Trades, OI, Funding Rate
  - Charts: Volume/Trades histogram, OI line, Funding rate series
  - Tables: Top Traders in market, Recent Trades

### 3.6 Shared Components

- HistogramChart (stacked bars), MarketsBreakdownChart, OILineChart, MiniStat, StackedBreakdownLegend
- Consistent control group: timeframe, bucket, breakdown, market selector

