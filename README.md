# Crypto Paper Trader

A cryptocurrency paper trading simulator built with React and TypeScript. Practice trading with virtual money using live market data from CoinGecko.

## Features

- **Live Market Data**: Real-time cryptocurrency prices updated every 10 seconds
- **Portfolio Management**: Track your virtual holdings with average buy prices
- **Buy/Sell Trading**: Two-way input (by amount or dollars) with adjustable fees
- **Price Charts**: 7-day price history charts for any cryptocurrency
- **Transaction History**: Sortable and filterable history of all trades
- **Persistent Data**: Portfolio and transactions saved to localStorage
- **Dark Theme**: Modern dark UI with purple primary color

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- Chart.js + React Chart.js 2 (charts)
- CSS Modules (styling)
- CoinGecko API (market data)

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd crypto-paper-trader

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
pnpm build
```

## How It Works

### Starting Balance
You start with $10,000 in virtual cash. Use this to buy cryptocurrencies at live market prices.

### Trading
1. Click on any cryptocurrency in the market list
2. Choose to buy or sell
3. Enter amount by crypto quantity or dollar value
4. Adjust the fee percentage (default 0.5%)
5. Confirm the trade

### Portfolio Tracking
- View all your holdings in the Wallet section
- See average buy price for each asset
- Track profit/loss in real-time as prices change
- Review complete transaction history

## Calculations

All financial math lives in `core/utils/calculations.ts` and is consumed by the trading reducer in `core/contexts/TradingContext.tsx`.

### Arithmetic Helpers

| Function | Formula |
|----------|---------|
| `dAdd(a, b)` | `a + b` |
| `dSubtract(a, b)` | `a - b` |
| `dMultiply(a, b)` | `a * b` |
| `dDivide(a, b)` | `a / b` (throws on zero) |
| `dRound(v, n)` | Round `v` to `n` decimal places |

All accept `string | number` — strings are parsed internally so values can be stored as strings in state/localStorage.

### Fee Calculation

```
fee = amount × (feePercentage / 100)
totalCost = amount × pricePerUnit + fee        (buy)
totalRevenue = amount × pricePerUnit − fee     (sell)
```

### Average Buy Price (Weighted)

When buying the same coin multiple times, the average buy price is recalculated as:

```
avgBuyPrice = (existingAmount × existingAvgPrice + newAmount × newPrice)
              / (existingAmount + newAmount)
```

Selling does **not** change the average buy price — only the held amount decreases.

### Profit & Loss

Updated on every price refresh (`UPDATE_PRICES` action):

```
profitLoss = (currentPrice − avgBuyPrice) × heldAmount
profitLoss% = ((currentPrice − avgBuyPrice) / avgBuyPrice) × 100
```

### Portfolio Value

```
portfolioValue = cashBalance + Σ(asset.heldAmount × asset.currentPrice)
totalPnL = portfolioValue − initialBalance ($10,000)
```

### Decimal Precision

- All monetary values stored as strings internally
- Arithmetic goes through `dAdd`/`dSubtract`/`dMultiply`/`dDivide` helpers
- Numbers are rounded only at display time (`formatCurrency`, `toFixed`)
- Crypto amounts support up to 8 decimal places

## Design Decisions

### State Management
- React Context + useReducer for global state
- localStorage persistence for wallet and transactions
- No external state library needed for this scale

### API Strategy
- CoinGecko free API (no key required)
- Rate limiting built-in (1 second between requests)
- Race condition handling for stale responses
- Polling every 10 seconds for live prices

### Styling
- CSS Modules for component-level scoping
- CSS variables for theme tokens
- Responsive design with mobile-first approach

## Known Limitations

1. **No real-time WebSocket**: Using polling instead of WebSocket for price updates
2. **Limited historical data**: Only 7-day chart history
3. **No authentication**: All data is local to the browser
4. **Single user**: No multi-user support

## Future Improvements

- [ ] Add WebSocket for real-time price streaming
- [ ] Implement more technical indicators
- [ ] Add portfolio analytics and charts
- [ ] Support multiple currencies
- [ ] Add price alerts
- [ ] Implement stop-loss orders

## License

MIT
