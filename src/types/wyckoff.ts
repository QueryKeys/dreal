export interface WyckoffPhase {
  type: 'accumulation' | 'distribution' | 'markup' | 'markdown' | 'unknown';
  confidence: number;
  detectedAt: Date;
}

export interface FilterResult {
  name: string;
  passed: boolean;
  value: number | string;
  threshold: number | string;
  description: string;
}

export interface WyckoffSignal {
  asset: string;
  signal: 'LONG ENTRY' | 'SHORT ENTRY' | 'WAIT – FALSE ACCUMULATION' | 'WAIT – FALSE DISTRIBUTION' | 'NEUTRAL';
  phase: WyckoffPhase;
  filters: FilterResult[];
  positionSize: number;
  stopLoss: number;
  takeProfit: number;
  entryPrice: number;
  historicalWinRate: number;
  timestamp: Date;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  high24h: number;
  low24h: number;
  exchangeNetflow7d: number;
  nupl: number;
  volumeMA20: number;
  liquidityClusters: LiquidityCluster[];
  historicalPrices: PricePoint[];
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface LiquidityCluster {
  priceLevel: number;
  liquidity: number;
  type: 'support' | 'resistance';
}

export interface EngineLog {
  timestamp: Date;
  action: string;
  details: string;
  data?: Record<string, unknown>;
}
