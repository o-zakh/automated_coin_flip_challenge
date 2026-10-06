import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Maximize2, ShieldAlert } from 'lucide-react';
import { FlipResult } from '../types';

interface EquityChartProps {
  history: FlipResult[];
  currentBalance: number;
  initialBalance: number;
}

export const EquityChart: React.FC<EquityChartProps> = ({
  history,
  currentBalance,
  initialBalance,
}) => {
  const [scaleMode, setScaleMode] = useState<'linear' | 'log'>('linear');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Extract balances series: starts with initialBalance at flip 0
  const points = [
    { flip: 0, balance: initialBalance, won: null, stake: 0, pnl: 0, choice: '' },
    ...history.map((h) => ({
      flip: h.flipNumber,
      balance: h.bankrollAfter,
      won: h.won,
      stake: h.stake,
      pnl: h.pnl,
      choice: h.choice,
    })),
  ];

  // Calculate statistics
  const balances = points.map((p) => p.balance);
  const peakBalance = Math.max(...balances);
  const minBalance = Math.min(...balances);
  
  // Calculate max drawdown
  let maxDrawdownPct = 0;
  let runningPeak = points[0].balance;
  for (const pt of points) {
    if (pt.balance > runningPeak) runningPeak = pt.balance;
    const dd = runningPeak > 0 ? ((runningPeak - pt.balance) / runningPeak) * 100 : 0;
    if (dd > maxDrawdownPct) maxDrawdownPct = dd;
  }

  const roiPct = ((currentBalance - initialBalance) / initialBalance) * 100;
  const winsCount = history.filter((h) => h.won).length;
  const winRate = history.length > 0 ? (winsCount / history.length) * 100 : 0;

  // Chart dimensions
  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 50 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Calculate scales
  const maxVal = Math.max(260, peakBalance * 1.1);
  const minVal = 0;

  const getX = (idx: number) => {
    if (points.length <= 1) return padding.left;
    return padding.left + (idx / (points.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    if (scaleMode === 'log') {
      const safeVal = Math.max(0.1, val);
      const safeMin = 0.1;
      const safeMax = Math.max(260, peakBalance * 1.1);
      const logMin = Math.log10(safeMin);
      const logMax = Math.log10(safeMax);
      const ratio = (Math.log10(safeVal) - logMin) / (logMax - logMin);
      return padding.top + chartH - ratio * chartH;
    }
    const ratio = Math.max(0, val - minVal) / (maxVal - minVal);
    return padding.top + chartH - ratio * chartH;
  };

  // Build SVG polyline points
  const svgPath = points.map((pt, i) => `${getX(i)},${getY(pt.balance)}`).join(' ');

  // Reference lines Y
  const yStart = getY(initialBalance);
  const yCap = getY(250);
  const yZero = getY(0);

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="flex flex-col bg-slate-900/60 rounded-xl border border-slate-800 p-4 shadow-xl">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Кривая капитала (Equity Curve)
          </h3>
          <span className="text-[11px] text-slate-400">· {points.length - 1} бросков</span>
        </div>

        {/* Scale Switch */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
          <button
            type="button"
            onClick={() => setScaleMode('linear')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              scaleMode === 'linear' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Линейная
          </button>
          <button
            type="button"
            onClick={() => setScaleMode('log')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              scaleMode === 'log' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Лог (Log10)
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] bg-[#070b13] rounded-lg border border-slate-800/90 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="equityStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={yZero}
            x2={width - padding.right}
            y2={yZero}
            stroke="#ef4444"
            strokeDasharray="3 3"
            strokeWidth="1"
            opacity="0.4"
          />
          <text
            x={padding.left + 5}
            y={yZero - 4}
            fill="#ef4444"
            fontSize="9"
            className="font-mono-numbers"
            opacity="0.7"
          >
            Банкрот ($0)
          </text>

          {/* $25 baseline */}
          <line
            x1={padding.left}
            y1={yStart}
            x2={width - padding.right}
            y2={yStart}
            stroke="#64748b"
            strokeDasharray="4 4"
            strokeWidth="1"
            opacity="0.6"
          />
          <text
            x={width - padding.right - 5}
            y={yStart - 4}
            textAnchor="end"
            fill="#94a3b8"
            fontSize="9"
            className="font-mono-numbers"
          >
            Старт ($25.00)
          </text>

          {/* $250 cap line */}
          <line
            x1={padding.left}
            y1={yCap}
            x2={width - padding.right}
            y2={yCap}
            stroke="#10b981"
            strokeDasharray="4 4"
            strokeWidth="1"
            opacity="0.6"
          />
          <text
            x={width - padding.right - 5}
            y={yCap - 4}
            textAnchor="end"
            fill="#10b981"
            fontSize="9"
            className="font-mono-numbers"
          >
            Цель Elm ($250.00)
          </text>

          {/* Equity Area Fill */}
          {points.length > 1 && (
            <polygon
              points={`${getX(0)},${chartH + padding.top} ${svgPath} ${getX(points.length - 1)},${
                chartH + padding.top
              }`}
              fill="url(#equityFill)"
            />
          )}

          {/* Equity Line */}
          {points.length > 1 ? (
            <polyline
              points={svgPath}
              fill="none"
              stroke="url(#equityStroke)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <circle cx={getX(0)} cy={getY(initialBalance)} r="4" fill="#fbbf24" />
          )}

          {/* Hover / Interactive Nodes */}
          {points.map((pt, i) => {
            const cx = getX(i);
            const cy = getY(pt.balance);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={hoveredIndex === i ? 5 : i === points.length - 1 ? 4 : 2}
                fill={hoveredIndex === i ? '#ffffff' : i === points.length - 1 ? '#fbbf24' : '#d97706'}
                stroke="#0f172a"
                strokeWidth="1.5"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIndex(i)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-2 left-3 bg-slate-900/90 backdrop-blur border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-[11px] shadow-lg pointer-events-none flex items-center gap-3">
            <span className="text-slate-400">
              Бросок #{hoveredPoint.flip}
            </span>
            <span className="font-mono-numbers font-bold text-amber-300">
              Баланс: ${hoveredPoint.balance.toFixed(2)}
            </span>
            {hoveredPoint.flip > 0 && (
              <span
                className={`font-mono-numbers ${
                  hoveredPoint.won ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {hoveredPoint.won ? `+$${hoveredPoint.pnl.toFixed(2)}` : `-$${Math.abs(hoveredPoint.pnl).toFixed(2)}`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quantitative Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-1 border-t border-slate-800/80 text-xs">
        <div className="flex flex-col">
          <span className="text-slate-400 text-[11px]">Пик капитала (ATH):</span>
          <span className="font-mono-numbers font-semibold text-emerald-400">
            ${peakBalance.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-400 text-[11px]">Макс. просадка:</span>
          <span className="font-mono-numbers font-semibold text-rose-400">
            -{maxDrawdownPct.toFixed(1)}%
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-400 text-[11px]">Доходность (ROI):</span>
          <span
            className={`font-mono-numbers font-semibold ${
              roiPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {roiPct >= 0 ? `+${roiPct.toFixed(1)}%` : `${roiPct.toFixed(1)}%`}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-400 text-[11px]">Винрейт (Побед):</span>
          <span className="font-mono-numbers font-semibold text-amber-300">
            {winRate.toFixed(1)}% ({winsCount}/{history.length})
          </span>
        </div>
      </div>
    </div>
  );
};
