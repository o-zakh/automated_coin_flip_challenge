import React from 'react';
import { GameSessionSummary } from '../types';
import {
  Trophy,
  AlertOctagon,
  TrendingUp,
  TrendingDown,
  X,
  Sparkles,
  Lock,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface GameOverModalProps {
  summary: GameSessionSummary | null;
  onClose: () => void;
  onReset: () => void;
  onOpenKelly: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  summary,
  onClose,
  onReset,
  onOpenKelly,
}) => {
  if (!summary) return null;

  const isBust = summary.isBankrupt || summary.finalBalance < 0.01;
  const isProfit = summary.profitAmount > 0;
  const hasKellyUnlocked = summary.unlockedKelly;

  // Milestone points on scale ($0 -> $250)
  // Max scale value for visualization
  const scaleMax = Math.max(250, summary.peakBalance * 1.05);
  const getScalePct = (val: number) => {
    return Math.min(100, Math.max(0, (val / scaleMax) * 100));
  };

  const finalPct = getScalePct(summary.finalBalance);
  const startPct = getScalePct(25);
  const unlockThresholdPct = getScalePct(75); // +200% of $25 is $75.00

  // Mini equity curve points
  const historyPoints = summary.history.map((h) => h.bankrollAfter);
  const allPoints = [summary.startingBalance, ...historyPoints];
  const miniMax = Math.max(scaleMax, ...allPoints);
  const miniMin = 0;
  const svgWidth = 440;
  const svgHeight = 70;

  const getSvgX = (i: number) => (i / Math.max(1, allPoints.length - 1)) * svgWidth;
  const getSvgY = (val: number) =>
    svgHeight - 6 - (Math.max(0, val - miniMin) / Math.max(1, miniMax - miniMin)) * (svgHeight - 12);

  const polylineStr = allPoints.map((v, i) => `${getSvgX(i)},${getSvgY(v)}`).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0e1422] border border-slate-700/90 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Status & Visual */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
              isBust
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : hasKellyUnlocked
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isBust ? (
              <AlertOctagon className="w-6 h-6" />
            ) : hasKellyUnlocked ? (
              <Trophy className="w-6 h-6" />
            ) : (
              <TrendingUp className="w-6 h-6" />
            )}
          </div>

          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              {summary.reason === 'bankrupt'
                ? 'Партия прервана · Разорение'
                : summary.reason === 'time_up'
                ? 'Партия завершена · Время 30:00 вышло'
                : summary.reason === 'simulated'
                ? 'Симуляция 30 минут завершена'
                : 'Партия завершена игроком'}
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {hasKellyUnlocked ? 'Победа в испытании!' : 'Итоги сессии'}
            </h2>
          </div>
        </div>

        {/* Cards: Final Balance & Growth Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card 1: Final Balance */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              Итоговый баланс
            </span>
            <div
              className={`font-mono-numbers font-black text-3xl my-1 ${
                isBust
                  ? 'text-rose-400'
                  : summary.finalBalance >= 75
                  ? 'text-emerald-400'
                  : 'text-amber-300'
              }`}
            >
              ${summary.finalBalance.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400">
              Стартовый капитал: <strong className="text-slate-300 font-mono-numbers">${summary.startingBalance.toFixed(2)}</strong>
            </div>
          </div>

          {/* Card 2: Growth Rate */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              Прирост капитала
            </span>
            <div className="flex items-baseline gap-2 my-1">
              <span
                className={`font-mono-numbers font-black text-3xl ${
                  summary.growthPct > 0
                    ? 'text-emerald-400'
                    : summary.growthPct < 0
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
              >
                {summary.growthPct > 0 ? `+${summary.growthPct.toFixed(1)}%` : `${summary.growthPct.toFixed(1)}%`}
              </span>
              <span
                className={`text-xs font-semibold font-mono-numbers ${
                  isProfit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                ({summary.profitAmount >= 0 ? `+$${summary.profitAmount.toFixed(2)}` : `-$${Math.abs(summary.profitAmount).toFixed(2)}`})
              </span>
            </div>
            <div className="text-[11px]">
              {summary.growthPct >= 200 ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Победа: цель $75 (+200%) достигнута!
                </span>
              ) : summary.growthPct > 0 ? (
                <span className="text-slate-400">
                  Положительная динамика
                </span>
              ) : (
                <span className="text-rose-400/90">
                  Капитал сократился
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ШКАЛА РОСТА БАЛАНСА (Balance Growth Scale) */}
        <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              Шкала роста баланса (Цель победы: $75)
            </span>
            <span className="text-slate-400 font-mono-numbers text-[11px]">
              Результат: <strong className="text-amber-300 font-bold">${summary.finalBalance.toFixed(2)}</strong>
            </span>
          </div>

          {/* Scale Track */}
          <div className="relative pt-6 pb-2">
            {/* Background track */}
            <div className="w-full h-3 bg-slate-800 rounded-full relative overflow-hidden">
              {/* Progress fill */}
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isBust
                    ? 'bg-rose-500 w-1'
                    : summary.finalBalance >= 75
                    ? 'bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-300'
                    : 'bg-gradient-to-r from-amber-500 to-amber-300'
                }`}
                style={{ width: `${Math.max(2, finalPct)}%` }}
              />
            </div>

            {/* Marker 1: Start ($25.00) */}
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none"
              style={{ left: `${startPct}%` }}
            >
              <span className="text-[10px] font-mono-numbers text-slate-400">Старт ($25)</span>
              <div className="w-0.5 h-3 bg-slate-500 mt-0.5" />
            </div>

            {/* Marker 2: +200% Victory Threshold ($75.00) */}
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none"
              style={{ left: `${unlockThresholdPct}%` }}
            >
              <span className="text-[10px] font-mono-numbers text-amber-400 font-semibold">+200% ($75)</span>
              <div className="w-0.5 h-3 bg-amber-400 mt-0.5" />
            </div>

            {/* Pointer for Final Balance */}
            <div
              className="absolute top-5 -translate-x-1/2 flex flex-col items-center transition-all duration-700 pointer-events-none"
              style={{ left: `${finalPct}%` }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white ring-4 ring-amber-500 shadow-md" />
            </div>
          </div>

          {/* Milestones footer labels */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers pt-1 border-t border-slate-900">
            <span>$0 (Банкрот)</span>
            <span>$25 (База)</span>
            <span className="text-amber-400 font-medium">$75 (+200% Победа)</span>
            <span>$150 (+500%)</span>
            <span>$250 (Максимум)</span>
          </div>

          {/* Mini Equity Curve trajectory */}
          {allPoints.length > 2 && (
            <div className="mt-2 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Траектория сессии ({summary.flipsExecuted} бросков):
              </span>
              <div className="w-full h-16 bg-[#070b13] rounded border border-slate-800/80 overflow-hidden relative">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points={polylineStr}
                    fill="none"
                    stroke={summary.growthPct >= 0 ? '#10b981' : '#f43f5e'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* SPECIAL SECTION: UNLOCKED OPTIMAL ALGORITHM (if growth >= 200% / balance >= $75) */}
        {hasKellyUnlocked ? (
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-slate-950 border border-amber-500/50 flex flex-col gap-2.5 shadow-lg shadow-amber-500/10">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Победа! Секрет стратегии разблокирован!</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Поздравляем с победой! Вы преумножили баланс более чем на <strong>200%</strong> (с $25 до ${summary.finalBalance.toFixed(2)}, цель $75+ достигнута). Теперь вам доступно математическое обоснование оптимального алгоритма управления ставками.
            </p>
            <button
              onClick={onOpenKelly}
              className="mt-1 w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Открыть оптимальный алгоритм</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs flex items-start gap-3 text-slate-400">
            <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-300 block mb-0.5">Оптимальный алгоритм скрыт</strong>
              Чтобы победить и открыть оптимальный алгоритм управления ставками, преумножьте стартовый капитал за одну партию минимум на <strong>+200% (достигните $75.00+)</strong>.
            </div>
          </div>
        )}

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px]">Бросков:</span>
            <div className="font-mono-numbers font-bold text-slate-200 text-sm mt-0.5">
              {summary.flipsExecuted}
            </div>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px]">Винрейт:</span>
            <div className="font-mono-numbers font-bold text-amber-300 text-sm mt-0.5">
              {summary.winRate.toFixed(1)}%
            </div>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px]">Пик (ATH):</span>
            <div className="font-mono-numbers font-bold text-emerald-400 text-sm mt-0.5">
              ${summary.peakBalance.toFixed(2)}
            </div>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px]">Минимум:</span>
            <div className="font-mono-numbers font-bold text-rose-400 text-sm mt-0.5">
              ${summary.lowestBalance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Actions Bottom Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Новая партия ($25)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
          >
            Просмотреть журнал и график
          </button>
        </div>
      </div>
    </div>
  );
};
