import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Zap,
  Code2,
  Terminal,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  DEFAULT_PYTHON_SCRIPT,
  PRESET_STRATEGIES,
  executePythonStrategy,
} from '../utils/pythonEngine';
import { ScriptOutput } from '../types';

interface PythonEditorProps {
  code: string;
  onCodeChange: (c: string) => void;
  balance: number;
  timeLeft: number;
  flipCount: number;
  history: Array<{
    flip: number;
    choice: string;
    stake: number;
    outcome: string;
    won: boolean;
    balance: number;
    pnl: number;
  }>;
  isAutoRunning: boolean;
  onToggleAutoRun: () => void;
  onSimulateToEnd: () => void;
  autoSpeed: number;
  onSpeedChange: (speed: number) => void;
  nextFlipCountdown: number; // in seconds (0..5)
  isBankrupt: boolean;
}

export const PythonEditor: React.FC<PythonEditorProps> = ({
  code,
  onCodeChange,
  balance,
  timeLeft,
  flipCount,
  history,
  isAutoRunning,
  onToggleAutoRun,
  onSimulateToEnd,
  autoSpeed,
  onSpeedChange,
  nextFlipCountdown,
  isBankrupt,
}) => {
  const [testOutput, setTestOutput] = useState<ScriptOutput | null>(null);

  // Auto-run single dry-run test whenever code changes
  useEffect(() => {
    const res = executePythonStrategy(code, {
      balance,
      time_left: timeLeft,
      flip_count: flipCount + 1,
      history,
    });
    setTestOutput(res);
  }, [code, balance, timeLeft, flipCount, history]);

  const handleResetToExample = () => {
    onCodeChange(DEFAULT_PYTHON_SCRIPT);
  };

  const handleTestRun = () => {
    const res = executePythonStrategy(code, {
      balance,
      time_left: timeLeft,
      flip_count: flipCount + 1,
      history,
    });
    setTestOutput(res);
  };

  // Line numbers calculation
  const lines = code.split('\n');

  return (
    <div className="flex flex-col bg-slate-900/70 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Top Bar: Title & Reset Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#0d1322] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Python-скрипт автоматизации
          </span>
          <span className="text-[11px] text-slate-400">· бросок каждые 5 сек</span>
        </div>

        {/* Action: Reset to Starter Example */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToExample}
            className="text-xs px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 flex items-center gap-1.5 transition-colors shadow-sm"
            title="Восстановить исходный пример кода (50% на орла)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Сбросить к примеру</span>
          </button>
        </div>
      </div>

      {/* Editor Description / Code Example Note */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          Пример синтаксиса: функция вызывается каждые 5 секунд. Принимает параметры игры и возвращает ставку и сторону (<code className="text-amber-300 font-mono">stake, choice</code>). Разработайте собственный алгоритм!
        </div>
      </div>

      {/* Code Editor Window with Line Numbers */}
      <div className="relative flex bg-[#070b13] font-mono-numbers text-xs min-h-[220px] max-h-[340px] overflow-auto">
        {/* Line Numbers */}
        <div className="select-none py-3 px-3 bg-[#0a0f1a] text-slate-400 text-right font-mono border-r border-slate-800/80 shrink-0 text-[11px]">
          {lines.map((_, idx) => (
            <div key={idx} className="leading-5">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Editable Textarea with syntax feel */}
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          spellCheck={false}
          className="flex-1 w-full p-3 bg-transparent text-emerald-300 font-mono text-[12px] leading-5 resize-none focus:outline-none focus:ring-0 selection:bg-amber-500/20"
          placeholder="def get_bet(balance, time_left, flip_count, history): ..."
          rows={Math.max(12, lines.length)}
        />
      </div>

      {/* Bottom Action Controls & Automation Runner */}
      <div className="p-4 bg-[#0d1322] border-t border-slate-800 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Real-time toggle & countdown */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleAutoRun}
              disabled={isBankrupt || timeLeft <= 0}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md ${
                isAutoRunning
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-rose-500/10'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isAutoRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Остановить автобросок</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Автобросок (каждые 5с)</span>
                </>
              )}
            </button>

            {/* Speed Multiplier */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
              <span className="text-slate-400 px-1 text-[11px]">Скорость:</span>
              {[1, 2, 5, 10].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSpeedChange(s)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    autoSpeed === s
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Instant Complete Simulation (30 min) button */}
          <button
            type="button"
            onClick={onSimulateToEnd}
            disabled={isBankrupt || timeLeft <= 0}
            className="px-3.5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Мгновенно выполнить все оставшиеся броски до истечения 30 минут"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Сгенерировать итог 30 минут</span>
          </button>
        </div>

        {/* Real-time countdown progress bar when running */}
        {isAutoRunning && (
          <div className="flex flex-col gap-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Автобросок активен
              </span>
              <span className="text-slate-300 font-mono-numbers">
                Следующий бросок через: <strong className="text-amber-400">{nextFlipCountdown.toFixed(1)}с</strong>
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-100 ease-linear"
                style={{
                  width: `${Math.max(0, Math.min(100, ((5 / autoSpeed - nextFlipCountdown) / (5 / autoSpeed)) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Console / Dry Run Status */}
        <div className="bg-[#080d17] rounded-lg border border-slate-800/90 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px]">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-3 h-3 text-slate-400" />
              <span>Диагностика и вывод скрипта</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestRun}
                className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
              >
                Протестировать 1 шаг
              </button>
            </div>
          </div>

          <div className="p-2.5 text-xs font-mono space-y-1 max-h-24 overflow-y-auto">
            {testOutput?.error ? (
              <div className="text-rose-400 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{testOutput.error}</span>
              </div>
            ) : testOutput ? (
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Решение: ставка <strong className="text-amber-300">${testOutput.stake.toFixed(2)}</strong> (
                    {balance > 0 ? Math.round((testOutput.stake / balance) * 100) : 0}% капитала) на{' '}
                    <strong className={testOutput.choice === 'heads' ? 'text-amber-300' : 'text-rose-300'}>
                      {testOutput.choice === 'heads' ? 'Орла (heads)' : 'Решку (tails)'}
                    </strong>
                  </span>
                  <span className="text-slate-400 text-[10px]">({testOutput.executionTimeMs}мс)</span>
                </div>

                {testOutput.logs.length > 0 && (
                  <div className="text-[11px] text-slate-400 pl-5 border-l border-slate-800 space-y-0.5">
                    {testOutput.logs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-400 text-[11px]">
                Ожидание ввода скрипта...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
