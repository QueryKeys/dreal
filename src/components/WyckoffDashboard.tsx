'use client';

import React, { useState, useCallback } from 'react';
import { MarketData, WyckoffSignal, PricePoint, LiquidityCluster } from '../types/wyckoff';
import { WyckoffSignalPanel } from './WyckoffSignalPanel';
import { WyckoffChartOverlay } from './WyckoffChartOverlay';

// Mock data generator for demonstration
function generateMockMarketData(symbol: string = 'BTC'): MarketData {
  const basePrice = symbol === 'BTC' ? 43250 : symbol === 'ETH' ? 2280 : 1;
  const now = new Date();
  
  const historicalPrices: PricePoint[] = [];
  let price = basePrice;
  
  // Generate 30 days of historical data
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simulate price movement with some volatility
    const change = (Math.random() - 0.48) * 0.04; // Slight upward bias
    const open = price;
    const close = price * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = 15000 + Math.random() * 10000;
    
    historicalPrices.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume,
    });
    
    price = close;
  }

  // Create a spring pattern in recent data (for accumulation scenario)
  if (symbol === 'BTC') {
    const lastIdx = historicalPrices.length - 1;
    const supportLevel = Math.min(...historicalPrices.slice(0, -3).map(p => p.low));
    
    // Modify second-to-last candle to show spring
    historicalPrices[lastIdx - 1].low = supportLevel * 0.96;
    historicalPrices[lastIdx - 1].close = supportLevel * 1.005;
    
    // Last candle continues upward
    historicalPrices[lastIdx].open = historicalPrices[lastIdx - 1].close;
    historicalPrices[lastIdx].close = historicalPrices[lastIdx].open * 1.015;
    historicalPrices[lastIdx].high = historicalPrices[lastIdx].close * 1.01;
    historicalPrices[lastIdx].low = historicalPrices[lastIdx].open * 0.995;
  }

  const currentPrice = historicalPrices[historicalPrices.length - 1].close;

  // Generate liquidity clusters
  const liquidityClusters: LiquidityCluster[] = [
    { priceLevel: currentPrice * 0.95, liquidity: 250, type: 'support' },
    { priceLevel: currentPrice * 0.92, liquidity: 400, type: 'support' },
    { priceLevel: currentPrice * 0.88, liquidity: 600, type: 'support' },
    { priceLevel: currentPrice * 1.03, liquidity: 300, type: 'resistance' },
    { priceLevel: currentPrice * 1.07, liquidity: 450, type: 'resistance' },
    { priceLevel: currentPrice * 1.12, liquidity: 550, type: 'resistance' },
  ];

  return {
    symbol,
    price: currentPrice,
    volume: 22000 + Math.random() * 8000,
    high24h: currentPrice * 1.025,
    low24h: currentPrice * 0.975,
    exchangeNetflow7d: symbol === 'BTC' ? -1250 : 500, // Negative for BTC (accumulation)
    nupl: symbol === 'BTC' ? 0.25 : 0.65, // Lower for BTC (fear zone)
    volumeMA20: 18000,
    liquidityClusters,
    historicalPrices,
  };
}

interface WyckoffDashboardProps {
  defaultAsset?: string;
}

export function WyckoffDashboard({ defaultAsset = 'BTC' }: WyckoffDashboardProps) {
  const [selectedAsset, setSelectedAsset] = useState(defaultAsset);
  const [marketData, setMarketData] = useState<MarketData>(() => generateMockMarketData(defaultAsset));
  const [currentSignal, setCurrentSignal] = useState<WyckoffSignal | null>(null);

  const handleAssetChange = useCallback((asset: string) => {
    setSelectedAsset(asset);
    setMarketData(generateMockMarketData(asset));
  }, []);

  const handleRefresh = useCallback(() => {
    setMarketData(generateMockMarketData(selectedAsset));
  }, [selectedAsset]);

  const assets = ['BTC', 'ETH', 'SOL'];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Crypto Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Wyckoff+ Signal Engine Integration</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Asset Selector */}
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
              {assets.map((asset) => (
                <button
                  key={asset}
                  onClick={() => handleAssetChange(asset)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedAsset === asset
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {asset}
                </button>
              ))}
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-sm font-medium transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{selectedAsset}/USD Price Chart</h2>
                <div className="text-sm text-slate-400">
                  Current: <span className="text-white font-mono">${marketData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              {/* Chart Container with Overlay */}
              <div className="relative h-[400px] bg-slate-800/30 rounded-lg overflow-hidden">
                {/* Simple candlestick visualization */}
                <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none">
                  {(() => {
                    const prices = marketData.historicalPrices;
                    const allPrices = prices.flatMap(p => [p.high, p.low]);
                    const minPrice = Math.min(...allPrices) * 0.98;
                    const maxPrice = Math.max(...allPrices) * 1.02;
                    const priceRange = maxPrice - minPrice;
                    
                    const scaleY = (price: number) => {
                      return 400 - ((price - minPrice) / priceRange) * 400;
                    };
                    
                    const candleWidth = 800 / prices.length * 0.7;
                    const spacing = 800 / prices.length;
                    
                    return prices.map((candle, i) => {
                      const x = i * spacing + (spacing - candleWidth) / 2;
                      const isGreen = candle.close >= candle.open;
                      const color = isGreen ? '#10b981' : '#ef4444';
                      
                      return (
                        <g key={i}>
                          {/* Wick */}
                          <line
                            x1={x + candleWidth / 2}
                            y1={scaleY(candle.high)}
                            x2={x + candleWidth / 2}
                            y2={scaleY(candle.low)}
                            stroke={color}
                            strokeWidth={1}
                          />
                          {/* Body */}
                          <rect
                            x={x}
                            y={scaleY(Math.max(candle.open, candle.close))}
                            width={candleWidth}
                            height={Math.abs(scaleY(candle.close) - scaleY(candle.open)) || 1}
                            fill={color}
                          />
                        </g>
                      );
                    });
                  })()}
                </svg>
                
                {/* Wyckoff Overlay */}
                <WyckoffChartOverlay
                  marketData={marketData}
                  signal={currentSignal}
                  width={800}
                  height={400}
                />
              </div>
              
              {/* Chart Legend */}
              <div className="mt-4 flex items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500"></div>
                  <span>Spring Pattern</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500"></div>
                  <span>Upthrust Pattern</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500/20"></div>
                  <span>Support Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500/20"></div>
                  <span>Resistance Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-blue-500" style={{ backgroundImage: 'linear-gradient(to right, #3b82f6 50%, transparent 50%)', backgroundSize: '10px 100%' }}></div>
                  <span>Entry Level</span>
                </div>
              </div>
            </div>
            
            {/* Market Data Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">24h Volume</div>
                <div className="text-lg font-semibold">{marketData.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">7D Netflow</div>
                <div className={`text-lg font-semibold ${marketData.exchangeNetflow7d < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {marketData.exchangeNetflow7d > 0 ? '+' : ''}{marketData.exchangeNetflow7d.toFixed(0)} BTC
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">NUPL</div>
                <div className={`text-lg font-semibold ${
                  marketData.nupl < 0.3 ? 'text-emerald-400' : 
                  marketData.nupl > 0.75 ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {marketData.nupl.toFixed(3)}
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-1">Vol vs MA20</div>
                <div className={`text-lg font-semibold ${marketData.volume > marketData.volumeMA20 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {((marketData.volume / marketData.volumeMA20 - 1) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
          
          {/* Signal Panel */}
          <div className="lg:col-span-1">
            <WyckoffSignalPanel
              marketData={marketData}
              onAnalyze={(signal) => setCurrentSignal(signal)}
            />
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-800">
          Wyckoff+ Signal Engine — For educational and research purposes only. Not financial advice.
          <br />
          Historical win rates are based on simulated backtesting and do not guarantee future performance.
        </div>
      </div>
    </div>
  );
}
