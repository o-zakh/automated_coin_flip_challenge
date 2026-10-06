import React from 'react';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Flag } from 'lucide-react';

interface HeaderProps {
  balance: number;
  timeLeft: number;
  flipCount: number;
  headsCount: number;
  tailsCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset: () => void;
  onOpenInfo: () => void;
  onFinishGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  timeLeft,
  flipCount,
  headsCount,
  tailsCount,
  soundEnabled,
  onToggleSound,
  onReset,
  onOpenInfo,
  onFinishGame,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const headsPct = flipCount > 0 ? Math.round((headsCount / flipCount) * 100) : 60;

  return (
    <header className="border-b border-slate-800 bg-[#0d1322]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Zone 1: Wordmark / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 font-bold text-slate-950 text-base">
              ¢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white font-display">
                  Elm Wealth
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-sm font-medium text-slate-300">
                  Coin Toss Challenge
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Старт $25.00 · 60% Орёл · 40% Решка · Лимит 30 минут · Автоматизация Python
              </p>
            </div>
          </div>

          {/* Zone 2: Essential Metrics */}
          <div className="flex items-center flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Капитал</span>
              <span className={`font-mono-numbers font-bold text-lg ${
                balance <= 0 ? 'text-rose-400' : balance >= 250 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                ${balance.toFixed(2)}
              </span>
            </div>

            <div className="h-7 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Время</span>
              <span className={`font-mono-numbers font-semibold text-base ${
                timeLeft < 180 ? 'text-rose-400 animate-pulse' : 'text-slate-200'
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="h-7 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Броски</span>
              <span className="font-mono-numbers font-medium text-slate-300 text-base">
                #{flipCount}
              </span>
            </div>

            <div className="h-7 w-[1px] bg-slate-800 hidden md:block" />

            <div className="hidden md:flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Орёл / Решка</span>
              <span className="font-mono-numbers text-xs text-slate-300">
                {headsCount} ({headsPct}%) / {tailsCount}
              </span>
            </div>
          </div>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Complete game / cash out button */}
            {flipCount > 0 && balance > 0 && (
              <button
                onClick={onFinishGame}
                className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-lg transition-colors flex items-center gap-1.5"
                title="Завершить партию и посмотреть итоги"
              >
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                <span>Завершить партию</span>
              </button>
            )}

            <button
              onClick={onOpenInfo}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700/60 transition-colors flex items-center gap-1.5"
              title="Правила и условия эксперимента"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Правила</span>
            </button>

            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-slate-800/80 text-amber-400 border-slate-700'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onReset}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800/50 rounded-lg border border-slate-700/60 transition-colors flex items-center gap-1.5"
              title="Начать новую партию с $25"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сброс</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
