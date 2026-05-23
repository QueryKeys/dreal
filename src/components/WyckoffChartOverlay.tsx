'use client';

import React from 'react';
import { MarketData, WyckoffSignal } from '../types/wyckoff';
import { wyckoffEngine } from '../lib/wyckoffEngine';

interface WyckoffChartOverlayProps {
  marketData: MarketData;
  signal: WyckoffSignal | null;
  width?: number;
  height?: number;
}

export function WyckoffChartOverlay({ marketData, signal, width = 800, height = 400 }: WyckoffChartOverlayProps) {
  const markers = wyckoffEngine.identifyChartMarkers(marketData);
  const heatZones = wyckoffEngine.getLiquidityHeatZones(marketData);

  // Calculate price range for scaling
  const prices = marketData.historicalPrices;
  if (prices.length === 0) return null;

  const allPrices = prices.flatMap(p => [p.high, p.low]);
  const minPrice = Math.min(...allPrices) * 0.98;
  const maxPrice = Math.max(...allPrices) * 1.02;
  const priceRange = maxPrice - minPrice;

  const scaleY = (price: number) => {
    return height - ((price - minPrice) / priceRange) * height;
  };

  const scaleX = (index: number) => {
    return (index / (prices.length - 1)) * width;
  };

  // Get phase background color
  const getPhaseBackground = () => {
    if (!signal) return 'transparent';
    switch (signal.phase.type) {
      case 'accumulation': return 'rgba(16, 185, 129, 0.08)';
      case 'distribution': return 'rgba(239, 68, 68, 0.08)';
      case 'markup': return 'rgba(59, 130, 246, 0.08)';
      case 'markdown': return 'rgba(249, 115, 22, 0.08)';
      default: return 'transparent';
    }
  };

  return (
    <svg width={width} height={height} className="absolute inset-0 pointer-events-none">
      {/* Phase Background */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={getPhaseBackground()}
      />

      {/* Liquidity Heat Zones */}
      {heatZones.map((zone, index) => (
        <rect
          key={`zone-${index}`}
          x={0}
          y={scaleY(zone.priceEnd)}
          width={width}
          height={scaleY(zone.priceStart) - scaleY(zone.priceEnd)}
          fill={zone.type === 'support' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
          opacity={zone.intensity * 0.5}
        />
      ))}

      {/* Entry, SL, TP Lines */}
      {signal && (
        <>
          {/* Entry Line */}
          <line
            x1={0}
            y1={scaleY(signal.entryPrice)}
            x2={width}
            y2={scaleY(signal.entryPrice)}
            stroke="rgba(59, 130, 246, 0.8)"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
          <text
            x={width - 5}
            y={scaleY(signal.entryPrice) - 5}
            textAnchor="end"
            className="fill-blue-400 text-xs font-semibold"
            fontSize="11"
          >
            Entry ${signal.entryPrice.toFixed(2)}
          </text>

          {/* Stop Loss Line */}
          <line
            x1={0}
            y1={scaleY(signal.stopLoss)}
            x2={width}
            y2={scaleY(signal.stopLoss)}
            stroke="rgba(239, 68, 68, 0.8)"
            strokeWidth={2}
            strokeDasharray="3,3"
          />
          <text
            x={width - 5}
            y={scaleY(signal.stopLoss) - 5}
            textAnchor="end"
            className="fill-red-400 text-xs font-semibold"
            fontSize="11"
          >
            SL ${signal.stopLoss.toFixed(2)}
          </text>

          {/* Take Profit Line */}
          <line
            x1={0}
            y1={scaleY(signal.takeProfit)}
            x2={width}
            y2={scaleY(signal.takeProfit)}
            stroke="rgba(16, 185, 129, 0.8)"
            strokeWidth={2}
            strokeDasharray="3,3"
          />
          <text
            x={width - 5}
            y={scaleY(signal.takeProfit) - 5}
            textAnchor="end"
            className="fill-emerald-400 text-xs font-semibold"
            fontSize="11"
          >
            TP ${signal.takeProfit.toFixed(2)}
          </text>
        </>
      )}

      {/* Spring/Upthrust Markers */}
      {markers.map((marker, index) => (
        <g key={`marker-${index}`}>
          {marker.type === 'spring' ? (
            <>
              <circle
                cx={scaleX(prices.findIndex(p => p.date === marker.date))}
                cy={scaleY(marker.price)}
                r={8}
                fill="rgba(16, 185, 129, 0.3)"
                stroke="rgb(16, 185, 129)"
                strokeWidth={2}
              />
              <text
                x={scaleX(prices.findIndex(p => p.date === marker.date))}
                y={scaleY(marker.price) + 25}
                textAnchor="middle"
                className="fill-emerald-400 text-xs font-semibold"
                fontSize="10"
              >
                SPRING
              </text>
            </>
          ) : (
            <>
              <circle
                cx={scaleX(prices.findIndex(p => p.date === marker.date))}
                cy={scaleY(marker.price)}
                r={8}
                fill="rgba(239, 68, 68, 0.3)"
                stroke="rgb(239, 68, 68)"
                strokeWidth={2}
              />
              <text
                x={scaleX(prices.findIndex(p => p.date === marker.date))}
                y={scaleY(marker.price) - 15}
                textAnchor="middle"
                className="fill-red-400 text-xs font-semibold"
                fontSize="10"
              >
                UPTHRUST
              </text>
            </>
          )}
        </g>
      ))}

      {/* Confidence Indicator */}
      {signal && (
        <g>
          <rect
            x={10}
            y={10}
            width={140}
            height={24}
            rx={4}
            fill="rgba(30, 41, 59, 0.9)"
            stroke="rgba(59, 130, 246, 0.3)"
          />
          <text
            x={20}
            y={27}
            className="fill-slate-300 text-xs"
            fontSize="11"
          >
            Confidence: {signal.phase.confidence.toFixed(0)}%
          </text>
        </g>
      )}
    </svg>
  );
}
