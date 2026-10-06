import React from 'react';
import { X, BookOpen, AlertTriangle, Target, Lock } from 'lucide-react';

interface ElmInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ElmInfoModal: React.FC<ElmInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0e1422] border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-slate-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Правила испытания Elm Wealth
            </h2>
            <p className="text-xs text-slate-400">
              Эксперимент по принятию решений в условиях неопределенности
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <div>
            <h3 className="text-sm font-semibold text-amber-300 mb-1">
              Условия игры
            </h3>
            <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-300">
              <li>Стартовый капитал: <strong>$25.00</strong>.</li>
              <li>Вероятность орла: <strong>60%</strong> (решка — 40%).</li>
              <li>Выплата при победе: <strong>х2 от ставки</strong> (удвоение). При поражении ставка теряется.</li>
              <li>Лимит времени: <strong>30 минут</strong> (при автоматизации бросок каждые 5 сек, до 360 бросков).</li>
              <li>Главная цель: <strong>набрать как можно больший капитал</strong>.</li>
            </ul>
          </div>

          <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs mb-1">
              <AlertTriangle className="w-4 h-4" />
              Парадокс реального эксперимента 2016 года:
            </div>
            <p className="text-slate-300">
              В оригинальном исследовании ученые Виктор Хагани и Ричард Дьюи предложили эту игру 61 профессионалу финансов и экономики. Несмотря на очевидное преимущество в 60%:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-300">
              <li><strong>28% участников полностью обанкротились ($0.00)</strong> из-за неверного размера ставок.</li>
              <li>Средний выигрыш составил всего $75 вместо возможных сотен долларов.</li>
              <li>Большинство участников действовали эмоционально и хаотично меняли размер ставки.</li>
            </ul>
          </div>

          <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <Target className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-300 mb-0.5">
                Ваша задача: выработать стратегию самостоятельно!
              </h4>
              <p className="text-slate-300">
                Какую долю баланса ставить? Фиксированную сумму или процент? Увеличивать ли ставку после потерь? Исследуйте управление капиталом вручную или с помощью Python-скрипта.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2.5 text-slate-400 text-[11px]">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Преумножьте стартовый капитал за одну партию минимум на <strong>+200% (достигните $75.00+)</strong>, чтобы победить и разблокировать оптимальный алгоритм!
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
          >
            Принять вызов
          </button>
        </div>
      </div>
    </div>
  );
};
