'use client';

import React, { useState, useEffect } from 'react';
import { WyckoffSignal, FilterResult, EngineLog, MarketData } from '../types/wyckoff';
import { wyckoffEngine } from '../lib/wyckoffEngine';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface WyckoffSignalPanelProps {
  marketData: MarketData;
  onAnalyze?: (signal: WyckoffSignal) => void;
}

export function WyckoffSignalPanel({ marketData, onAnalyze }: WyckoffSignalPanelProps) {
  const [signal, setSignal] = useState<WyckoffSignal | null>(null);
  const [logsExpanded, setLogsExpanded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    runAnalysis();
  }, [marketData]);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    wyckoffEngine.clearLogs();
    
    // Simulate slight delay for UX
    setTimeout(() => {
      const result = wyckoffEngine.analyze(marketData);
      setSignal(result);
      onAnalyze?.(result);
      setIsAnalyzing(false);
    }, 300);
  };

  const getSignalColor = (sig: string) => {
    if (sig.includes('LONG')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (sig.includes('SHORT')) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (sig.includes('WAIT')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'accumulation': return 'text-emerald-400';
      case 'distribution': return 'text-red-400';
      case 'markup': return 'text-blue-400';
      case 'markdown': return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

  if (!signal) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Activity className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Wyckoff+ Signal Engine</h2>
          </div>
          <span className="text-xs text-slate-400">{signal.asset}</span>
        </div>
      </div>

      {/* Main Signal Display */}
      <div className="p-4">
        <div className={`inline-flex items-center px-4 py-2 rounded-md border font-semibold text-sm mb-4 ${getSignalColor(signal.signal)}`}>
          {signal.signal === 'LONG ENTRY' && <TrendingUp className="w-4 h-4 mr-2" />}
          {signal.signal === 'SHORT ENTRY' && <TrendingDown className="w-4 h-4 mr-2" />}
          {signal.signal.includes('WAIT') && <AlertCircle className="w-4 h-4 mr-2" />}
          {signal.signal}
        </div>

        {/* Phase & Confidence */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-800/50 rounded-md p-3">
            <div className="text-xs text-slate-400 mb-1">Detected Phase</div>
            <div className={`text-lg font-semibold capitalize ${getPhaseColor(signal.phase.type)}`}>
              {signal.phase.type}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-md p-3">
            <div className="text-xs text-slate-400 mb-1">Confidence</div>
            <div className="text-lg font-semibold text-white">
              {signal.phase.confidence.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Historical Win Rate */}
        <div className="bg-slate-800/30 rounded-md p-3 mb-4">
          <div className="text-xs text-slate-400 mb-1">Historical Performance</div>
          <div className="text-sm text-white">
            <span className="font-semibold text-blue-400">{signal.historicalWinRate.toFixed(0)}%</span>
            <span className="text-slate-400 ml-2">historical win rate under these conditions</span>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Validation Filters</div>
          <div className="space-y-2">
            {signal.filters.map((filter, index) => (
              <FilterItem key={index} filter={filter} />
            ))}
          </div>
        </div>

        {/* Position Sizing & Levels */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-800/50 rounded-md p-3">
            <div className="text-xs text-slate-400 mb-1">Position Size</div>
            <div className="text-sm font-semibold text-white">
              {(signal.positionSize * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-slate-500">of portfolio</div>
          </div>
          <div className="bg-slate-800/50 rounded-md p-3">
            <div className="text-xs text-slate-400 mb-1">Stop Loss</div>
            <div className="text-sm font-semibold text-red-400">
              ${signal.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500">
              {((signal.entryPrice - signal.stopLoss) / signal.entryPrice * 100).toFixed(2)}% below
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-md p-3">
            <div className="text-xs text-slate-400 mb-1">Take Profit</div>
            <div className="text-sm font-semibold text-emerald-400">
              ${signal.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500">
              {((signal.takeProfit - signal.entryPrice) / signal.entryPrice * 100).toFixed(2)}% above
            </div>
          </div>
        </div>

        {/* Risk/Reward */}
        <div className="bg-slate-800/30 rounded-md p-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Risk/Reward Ratio</span>
            <span className="text-sm font-semibold text-white">
              1:{((signal.takeProfit - signal.entryPrice) / (signal.entryPrice - signal.stopLoss)).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Entry Price */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 mb-4">
          <div className="text-xs text-blue-400 mb-1">Current Entry Price</div>
          <div className="text-xl font-bold text-white">
            ${signal.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Engine Log (Expandable) */}
      <div className="border-t border-slate-700/50">
        <button
          onClick={() => setLogsExpanded(!logsExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-sm text-slate-400 hover:text-white hover:bg-slate-800/30 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Engine Log
          </span>
          {logsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {logsExpanded && (
          <div className="px-4 pb-4 max-h-64 overflow-y-auto">
            <div className="space-y-1">
              {wyckoffEngine.getLogs().map((log, index) => (
                <EngineLogEntry key={index} log={log} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterItem({ filter }: { filter: FilterResult }) {
  return (
    <div className={`flex items-start gap-3 p-2 rounded-md ${filter.passed ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
      {filter.passed ? (
        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{filter.name}</span>
          <span className={`text-xs font-mono ${filter.passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {filter.value}
          </span>
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          Threshold: {filter.threshold} — {filter.description}
        </div>
      </div>
    </div>
  );
}

function EngineLogEntry({ log }: { log: EngineLog }) {
  return (
    <div className="text-xs font-mono text-slate-500 py-1 border-b border-slate-800/50 last:border-0">
      <span className="text-slate-600">[{log.timestamp.toLocaleTimeString()}]</span>
      <span className="text-blue-400 ml-2">{log.action}:</span>
      <span className="ml-2">{log.details}</span>
    </div>
  );
}
