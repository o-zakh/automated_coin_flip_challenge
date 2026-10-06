import React from 'react';
import { X, Award, CheckCircle2, AlertTriangle, Code, ArrowRight } from 'lucide-react';
import { KELLY_STRATEGY_CODE } from '../utils/pythonEngine';

interface KellyExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyKellyCode: (code: string) => void;
}

export const KellyExplanationModal: React.FC<KellyExplanationModalProps> = ({
  isOpen,
  onClose,
  onApplyKellyCode,
}) => {
  if (!isOpen) return null;

  const handleApply = () => {
    onApplyKellyCode(KELLY_STRATEGY_CODE);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0e1422] border border-amber-500/60 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-slate-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Visual */}
        <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Секрет разблокирован (Победа: капитал &ge; $75.00 / +200%)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Математический оптимум: Оптимальный алгоритм (20%)
            </h2>
          </div>
        </div>

        {/* Educational Content */}
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <div>
            <p>
              Поздравляем! Вы преумножили баланс более чем на 200% (достигли $75+) на собственном опыте! В теории вероятностей существует математически строгая формула размера ставки, максимизирующая скорость геометрического роста капитала при повторяющихся играх с известным перевесом.
            </p>
          </div>

          {/* Formula Card */}
          <div className="p-4 bg-slate-950/90 rounded-xl border border-amber-500/30 flex flex-col items-center gap-2 text-center">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
              Формула оптимальной доли капитала (f*)
            </span>
            <div className="font-mono text-base sm:text-lg text-amber-300 font-bold bg-[#070b13] px-5 py-2.5 rounded-lg border border-slate-800">
              f* = (b × p - q) / b
            </div>
            <div className="text-[11px] text-slate-400 max-w-md">
              где <strong className="text-slate-200">p = 0.60</strong> (вероятность орла), <strong className="text-slate-200">q = 0.40</strong> (вероятность решки), <strong className="text-slate-200">b = 1</strong> (выплата 1:1 при х2 возврате).
            </div>
            <div className="font-mono text-sm text-emerald-400 font-bold mt-1">
              f* = (1 × 0.60 - 0.40) / 1 = 0.20 = 20%
            </div>
          </div>

          <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
            <h4 className="font-bold text-emerald-300 text-xs mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Идеальный алгоритм: ровно 20% на Орла
            </h4>
            <p className="text-slate-300">
              Если ставить строго <strong>20% от текущего баланса на Орла</strong> на каждом шаге:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-300">
              <li>Средний логарифмический рост капитала: <strong>+2.01% за каждый бросок</strong>.</li>
              <li>Вероятность разорения стремится к <strong>0%</strong> (капитал никогда не падает до нуля при фракционных ставках).</li>
              <li>Шанс достичь цели $250.00 за 30 минут превышает <strong>95%</strong>!</li>
            </ul>
          </div>

          <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-xl">
            <h4 className="font-bold text-rose-300 text-xs mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Почему ставка 50% (из примера) разоряет капитал?
            </h4>
            <p className="text-slate-300">
              Если ставить 50%: при победе капитал умножается на <strong>1.5</strong>, при поражении — на <strong>0.5</strong>.
              За один выигрыш и один проигрыш баланс становится:
              <br />
              <code className="text-amber-300 font-mono text-[11px] bg-slate-950 px-1 py-0.5 rounded">1.5 × 0.5 = 0.75 (-25%)</code>!
              <br />
              Средняя скорость роста отрицательна: <strong>-3.4% за бросок</strong>. Поэтому 50% неминуемо ведет к разорению даже при шансе победы 60%.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Закрыть
          </button>

          <button
            onClick={handleApply}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Code className="w-4 h-4" />
            <span>Вставить оптимальный алгоритм в скрипт</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
