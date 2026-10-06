import React, { useState } from 'react';
import { FlipResult } from '../types';
import { Download, Filter, History, Check, X } from 'lucide-react';

interface HistoryTableProps {
  history: FlipResult[];
  onClearHistory: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history, onClearHistory }) => {
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses'>('all');

  const filteredHistory = history.filter((item) => {
    if (filter === 'wins') return item.won;
    if (filter === 'losses') return !item.won;
    return true;
  });

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Flip', 'Choice', 'Stake', 'Outcome', 'Won', 'PnL', 'Bankroll', 'TimeLeftSec', 'Source'];
    const rows = history.map((h) => [
      h.flipNumber,
      h.choice,
      h.stake.toFixed(2),
      h.outcome,
      h.won ? 'YES' : 'NO',
      h.pnl.toFixed(2),
      h.bankrollAfter.toFixed(2),
      h.timeLeftSeconds,
      h.source,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `elm_wealth_coin_flips_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col bg-slate-900/60 rounded-xl border border-slate-800 p-4 shadow-xl">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            История бросков (Journal)
          </h3>
          <span className="text-[11px] text-slate-400">· {history.length} записей</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                filter === 'all' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Все ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('wins')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                filter === 'wins' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Победы ({history.filter((h) => h.won).length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('losses')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                filter === 'losses' ? 'bg-rose-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Потери ({history.filter((h) => !h.won).length})
            </button>
          </div>

          {/* Export button */}
          <button
            type="button"
            onClick={exportCSV}
            disabled={history.length === 0}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Экспорт в CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto max-h-[320px] rounded-lg border border-slate-800/90 bg-[#070b13]">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#0b101c] text-slate-400 text-[11px] uppercase tracking-wider sticky top-0 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3 font-semibold">#</th>
              <th className="py-2.5 px-3 font-semibold">Выбор</th>
              <th className="py-2.5 px-3 font-semibold text-right">Ставка</th>
              <th className="py-2.5 px-3 font-semibold text-center">Выпало</th>
              <th className="py-2.5 px-3 font-semibold text-right">P&L</th>
              <th className="py-2.5 px-3 font-semibold text-right">Баланс</th>
              <th className="py-2.5 px-3 font-semibold text-center">Режим</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 text-xs font-sans">
                  Бросков пока нет. Сделайте ставку или запустите скрипт.
                </td>
              </tr>
            ) : (
              [...filteredHistory].reverse().map((h) => (
                <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2 px-3 text-slate-400">#{h.flipNumber}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        h.choice === 'heads' ? 'text-amber-300' : 'text-slate-300'
                      }`}
                    >
                      {h.choice === 'heads' ? 'Орёл (60%)' : 'Решка (40%)'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-slate-200">
                    ${h.stake.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        h.outcome === 'heads'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      {h.outcome === 'heads' ? 'Орёл' : 'Решка'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-bold">
                    <span
                      className={`inline-flex items-center gap-0.5 ${
                        h.won ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {h.won ? `+$${h.pnl.toFixed(2)}` : `-$${Math.abs(h.pnl).toFixed(2)}`}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-100">
                    ${h.bankrollAfter.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-center font-sans text-[11px] text-slate-400">
                    {h.source === 'script' ? (
                      <span className="text-amber-400 font-mono text-[10px]">Python</span>
                    ) : (
                      <span className="text-slate-400">Вручную</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
