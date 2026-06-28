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

- React 18 + TypeScript
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

## Decimal Precision Approach

Financial calculations require careful handling of floating-point numbers. This project uses:

1. **String-based storage**: All monetary values stored as strings internally
2. **Decimal utility class**: Custom `Decimal` class for arithmetic operations
3. **Display-time rounding**: Numbers are rounded only when displayed, not during calculations
4. **8 decimal places**: Cryptocurrency amounts support up to 8 decimal places

Example:
```typescript
const amount = new Decimal('0.00000001');
const price = new Decimal('65000.12345678');
const total = amount.multiply(price); // No floating-point errors
```

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
