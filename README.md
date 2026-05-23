# Wyckoff+ Signal Engine

A professional-grade Wyckoff analysis module for crypto trading dashboards.

## Features

### Detection Logic
- **Wyckoff Phase Identification**: Automatically detects accumulation, distribution, markup, and markdown phases
- **Pattern Recognition**: Identifies Spring and Upthrust patterns with high confidence
- **4-Filter Validation System**:
  1. Exchange Netflow (7-day net flow analysis)
  2. NUPL Sentiment Indicator
  3. Volume vs 20-day Moving Average
  4. HTF Liquidity Cluster Position

### Output Display
- Clear signal labels: "LONG ENTRY", "SHORT ENTRY", "WAIT – FALSE ACCUMULATION", etc.
- Justification panel showing:
  - Detected phase with confidence percentage
  - Filter pass/fail status with thresholds
  - Suggested position size (ATR-based risk model)
  - Stop-loss and take-profit levels

### Interactive Chart Overlay
- Wyckoff phase shaded background
- Spring/Upthrust pattern markers
- Liquidity heat zones
- Entry, SL, TP horizontal lines

### Professional UX
- Institutional-grade UI design
- Expandable "Engine Log" for full transparency
- Factual, probabilistic language (e.g., "62% historical win rate")
- Asset switching capability (BTC, ETH, SOL default)

## Architecture

```
src/
├── components/
│   ├── WyckoffDashboard.tsx      # Main dashboard component
│   ├── WyckoffSignalPanel.tsx    # Signal display panel
│   └── WyckoffChartOverlay.tsx   # Chart overlay component
├── lib/
│   └── wyckoffEngine.ts          # Core analysis engine
└── types/
    └── wyckoff.ts                # TypeScript interfaces
```

## Usage

```tsx
import { WyckoffDashboard } from './components/WyckoffDashboard';

export default function Page() {
  return <WyckoffDashboard defaultAsset="BTC" />;
}
```

## API Integration

To connect real data sources, modify the `generateMockMarketData` function in `WyckoffDashboard.tsx` to fetch from:
- Glassnode API (on-chain metrics, NUPL, exchange flows)
- CoinMetrics API (price, volume, liquidity data)
- Exchange APIs (order book data for liquidity clusters)

## Risk Disclaimer

This tool is for educational and research purposes only. Not financial advice.
Historical win rates are based on backtesting and do not guarantee future performance.