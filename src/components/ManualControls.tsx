import React from 'react';
import { CoinSide } from '../types';
import { AlertTriangle } from 'lucide-react';

interface ManualControlsProps {
  balance: number;
  choice: CoinSide;
  onChoiceChange: (c: CoinSide) => void;
  stake: number;
  onStakeChange: (s: number) => void;
  onFlip: () => void;
  isFlipping: boolean;
  isBankrupt: boolean;
  timeLeft: number;
  isAutoRunning: boolean;
}

export const ManualControls: React.FC<ManualControlsProps> = ({
  balance,
  choice,
  onChoiceChange,
  stake,
  onStakeChange,
  onFlip,
  isFlipping,
  isBankrupt,
  timeLeft,
  isAutoRunning,
}) => {
  const isTimeUp = timeLeft <= 0;
  const canFlip = !isFlipping && !isBankrupt && !isTimeUp && !isAutoRunning && balance > 0 && stake > 0 && stake <= balance;

  const setPercent = (pct: number) => {
    const calculated = Math.min(balance, Math.max(0.01, Math.round(balance * pct * 100) / 100));
    onStakeChange(calculated);
  };

  const addAmount = (amt: number) => {
    const updated = Math.min(balance, Math.round((stake + amt) * 100) / 100);
    onStakeChange(updated);
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
      {/* 1. Choice Selector (Heads 60% vs Tails 40%) */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Выберите сторону монеты:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChoiceChange('heads')}
            disabled={isFlipping || isAutoRunning}
            className={`p-3 rounded-lg border text-left transition-all relative ${
              choice === 'heads'
                ? 'bg-amber-500/15 border-amber-500/70 text-white shadow-lg shadow-amber-500/10'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Орёл (Heads)</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono-numbers font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                60% шанс
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Выплата х2 при победе
            </p>
            {choice === 'heads' && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-[#0d1322]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onChoiceChange('tails')}
            disabled={isFlipping || isAutoRunning}
            className={`p-3 rounded-lg border text-left transition-all relative ${
              choice === 'tails'
                ? 'bg-rose-500/15 border-rose-500/70 text-white shadow-lg shadow-rose-500/10'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Решка (Tails)</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono-numbers font-semibold bg-slate-700 text-slate-300">
                40% шанс
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Выплата х2 при победе
            </p>
            {choice === 'tails' && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 ring-4 ring-[#0d1322]" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Stake Input & Controls */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Размер ставки ($):
          </label>
          <span className="text-xs text-slate-400">
            Доступно: <strong className="text-amber-400 font-mono-numbers">${balance.toFixed(2)}</strong>
          </span>
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
            $
          </span>
          <input
            type="number"
            min="0.01"
            max={balance}
            step="0.10"
            value={stake || ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onStakeChange(Number.isNaN(val) ? 0 : val);
            }}
            disabled={isFlipping || isAutoRunning || isBankrupt}
            className="w-full pl-8 pr-20 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 font-mono-numbers font-bold text-base focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            placeholder="0.00"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => onStakeChange(balance)}
              disabled={isFlipping || isAutoRunning || isBankrupt}
              className="text-[11px] font-semibold px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded transition-colors"
            >
              Макс
            </button>
          </div>
        </div>

        {/* Quick Percentages and increments (Clean, zero spoilers) */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          <button
            type="button"
            onClick={() => setPercent(0.10)}
            disabled={isFlipping || isAutoRunning || isBankrupt}
            className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 font-mono-numbers transition-colors"
          >
            10%
          </button>
          <button
            type="button"
            onClick={() => setPercent(0.20)}
            disabled={isFlipping || isAutoRunning || isBankrupt}
            className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 font-mono-numbers transition-colors"
          >
            20%
          </button>
          <button
            type="button"
            onClick={() => setPercent(0.25)}
            disabled={isFlipping || isAutoRunning || isBankrupt}
            className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 font-mono-numbers transition-colors"
          >
            25%
          </button>
          <button
            type="button"
            onClick={() => setPercent(0.50)}
            disabled={isFlipping || isAutoRunning || isBankrupt}
            className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 font-mono-numbers transition-colors"
          >
            50%
          </button>
          <button
            type="button"
            onClick={() => setPercent(1.0)}
            disabled={isFlipping || isAutoRunning || isBankrupt}
            className="text-xs px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 rounded border border-rose-800/50 font-mono-numbers transition-colors"
          >
            All-In
          </button>
          <span className="text-slate-600 px-1">|</span>
          <button
            type="button"
            onClick={() => addAmount(1)}
            disabled={isFlipping || isAutoRunning || isBankrupt}
            className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded border border-slate-700/60 font-mono-numbers transition-colors"
          >
            +$1
          </button>
          <button
            type="button"
            onClick={() => addAmount(5)}
            disabled={isFlipping || isAutoRunning || isBankrupt}
            className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded border border-slate-700/60 font-mono-numbers transition-colors"
          >
            +$5
          </button>
        </div>
      </div>

      {/* Warning if stake > balance */}
      {stake > balance && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 p-2.5 rounded-lg border border-rose-800/40">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Размер ставки превышает текущий капитал!</span>
        </div>
      )}

      {/* 3. Primary Button: Flip Coin */}
      <button
        type="button"
        onClick={onFlip}
        disabled={!canFlip}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
          canFlip
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 active:scale-[0.98]'
            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
        }`}
      >
        {isFlipping ? (
          <span>Монета бросается...</span>
        ) : isBankrupt ? (
          <span>Банкрот!</span>
        ) : isTimeUp ? (
          <span>Время вышло (30 мин)</span>
        ) : isAutoRunning ? (
          <span>Идёт автобросок (5 сек)...</span>
        ) : (
          <span>Бросить монету (Поставить ${stake.toFixed(2)})</span>
        )}
      </button>

      <div className="text-[11px] text-center text-slate-400">
        Горячая клавиша: <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">Пробел</kbd> или <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">Enter</kbd>
      </div>
    </div>
  );
};
