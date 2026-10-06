import React from 'react';
import { CoinSide } from '../types';

interface CoinVisualProps {
  isFlipping: boolean;
  outcome: CoinSide | null;
  lastWon: boolean | null;
  lastPnl: number | null;
}

export const CoinVisual: React.FC<CoinVisualProps> = ({
  isFlipping,
  outcome,
  lastWon,
  lastPnl,
}) => {
  const currentSide = outcome || 'heads';

  return (
    <div className="flex flex-col items-center justify-center p-6 select-none">
      {/* 3D Coin Stage */}
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 perspective-1000 flex items-center justify-center">
        {/* Glow backdrop behind coin */}
        <div
          className={`absolute inset-4 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
            isFlipping
              ? 'bg-amber-500/25 scale-110'
              : lastWon === true
              ? 'bg-emerald-500/35 scale-125'
              : lastWon === false
              ? 'bg-rose-500/25 scale-110'
              : 'bg-amber-500/15'
          }`}
        />

        {/* The rotating coin */}
        <div
          className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-full preserve-3d transition-transform ${
            isFlipping
              ? outcome === 'tails'
                ? 'animate-flip-tails'
                : 'animate-flip-heads'
              : currentSide === 'tails'
              ? 'rotate-y-180'
              : 'rotate-y-0'
          }`}
          style={{
            transform: !isFlipping
              ? currentSide === 'tails'
                ? 'rotateY(180deg)'
                : 'rotateY(0deg)'
              : undefined,
          }}
        >
          {/* HEADS FACE (ОРЁЛ - 60%) */}
          <div className="absolute inset-0 rounded-full backface-hidden bg-gradient-to-br from-amber-100 via-amber-400 to-amber-700 border-[5px] border-amber-300 shadow-[0_10px_28px_rgba(245,158,11,0.4),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-4px_8px_rgba(120,53,15,0.7)] flex flex-col items-center justify-between p-3 select-none">
            {/* Inner Minted Beaded Rim */}
            <div className="w-full h-full rounded-full border border-amber-800/40 border-dashed flex flex-col items-center justify-between py-2 px-1 relative">
              {/* Top Arch Label */}
              <div className="text-[10px] font-bold text-amber-950 tracking-widest uppercase">
                ★ ELM WEALTH · 2016 ★
              </div>

              {/* Majestic Heraldic Eagle SVG Emblem */}
              <div className="my-auto flex items-center justify-center">
                <svg
                  className="w-16 h-16 sm:w-20 sm:h-20 text-amber-950 fill-amber-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  {/* Eagle Crown / Halo */}
                  <path d="M47 11 L50 7 L53 11 L57 8 L55 14 L45 14 L43 8 Z" opacity="0.9" />

                  {/* Left Wing (Feathers spreading upwards and left) */}
                  <path d="M46 28 C38 20 25 18 12 24 C14 30 20 34 26 36 C18 36 12 40 8 46 C12 49 19 50 25 50 C18 52 14 56 12 62 C18 64 24 62 29 59 C24 64 21 69 20 74 C25 74 31 71 35 66 C32 72 30 78 30 81 C36 78 40 72 44 65 L46 54 Z" />

                  {/* Right Wing (Feathers spreading upwards and right) */}
                  <path d="M54 28 C62 20 75 18 88 24 C86 30 80 34 74 36 C82 36 88 40 92 46 C88 49 81 50 75 50 C82 52 86 56 88 62 C82 64 76 62 71 59 C76 64 79 69 80 74 C75 74 69 71 65 66 C68 72 70 78 70 81 C64 78 60 72 56 65 L54 54 Z" />

                  {/* Eagle Head & Beak turned in profile */}
                  <path d="M50 16 C46 16 43 19 43 23 C43 25 41 26 38 26 C41 28 44 28 46 27 C46 30 48 32 50 32 C52 32 54 30 54 27 C56 28 59 28 62 26 C59 26 57 25 57 23 C57 19 54 16 50 16 Z" />
                  <circle cx="47" cy="21" r="1.5" fill="#fef08a" />
                  <circle cx="53" cy="21" r="1.5" fill="#fef08a" />

                  {/* Central Heraldic Shield on Breast */}
                  <path
                    d="M44 34 L56 34 L56 46 C56 52 50 56 50 56 C50 56 44 52 44 46 Z"
                    fill="#78350f"
                    stroke="#451a03"
                    strokeWidth="1.5"
                  />
                  {/* Star / 60 on Shield */}
                  <path
                    d="M50 38 L51.5 42 L55.5 42 L52 44.5 L53.5 48.5 L50 46 L46.5 48.5 L48 44.5 L44.5 42 L48.5 42 Z"
                    fill="#fef08a"
                  />

                  {/* Fan Tail Feathers */}
                  <path d="M44 64 L42 81 C46 83 54 83 58 81 L56 64 Z" />
                  <path d="M47 66 L47 82 L53 82 L53 66 Z" opacity="0.4" />

                  {/* Talons grasping Olive Branch / Laurel Stems */}
                  <path d="M41 58 C38 60 36 62 39 64 C41 64 43 62 44 59 Z" fill="#451a03" />
                  <path d="M59 58 C62 60 64 62 61 64 C59 64 57 62 56 59 Z" fill="#451a03" />
                  <path
                    d="M34 65 C44 62 56 62 66 65"
                    stroke="#451a03"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Bottom Labels: Typography & Odds */}
              <div className="text-center w-full">
                <div className="text-[12px] sm:text-xs font-black text-amber-950 tracking-wider">
                  ОРЁЛ · HEADS
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-amber-900 font-mono-numbers">
                  Шанс: 60%
                </div>
              </div>
            </div>
          </div>

          {/* TAILS FACE (РЕШКА - 40%) */}
          <div
            className="absolute inset-0 rounded-full backface-hidden bg-gradient-to-br from-amber-100 via-amber-400 to-amber-700 border-[5px] border-amber-300 shadow-[0_10px_28px_rgba(245,158,11,0.4),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-4px_8px_rgba(120,53,15,0.7)] flex flex-col items-center justify-between p-3 select-none"
            style={{ transform: 'rotateY(180deg)' }}
          >
            {/* Inner Minted Beaded Rim */}
            <div className="w-full h-full rounded-full border border-amber-800/40 border-dashed flex flex-col items-center justify-between py-2 px-1 relative">
              {/* Top Arch Label */}
              <div className="text-[10px] font-bold text-amber-950 tracking-widest uppercase">
                ★ ELM WEALTH · 2016 ★
              </div>

              {/* Laurel Wreath with 40% in identical scale */}
              <div className="my-auto flex items-center justify-center relative">
                <svg
                  className="w-16 h-16 sm:w-20 sm:h-20 text-amber-950 fill-amber-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  {/* Left Laurel Branch */}
                  <path
                    d="M48 82 C34 78 20 66 20 48 C20 32 30 18 45 14"
                    fill="none"
                    stroke="#451a03"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Left Leaves */}
                  <path d="M22 66 C16 64 15 58 19 56 C23 58 24 64 22 66 Z" />
                  <path d="M19 54 C13 51 13 45 18 43 C22 46 22 52 19 54 Z" />
                  <path d="M20 42 C15 38 17 32 22 31 C25 35 24 41 20 42 Z" />
                  <path d="M26 30 C22 25 25 19 31 19 C33 24 31 29 26 30 Z" />
                  <path d="M35 20 C32 15 37 10 43 11 C43 16 40 20 35 20 Z" />

                  {/* Right Laurel Branch */}
                  <path
                    d="M52 82 C66 78 80 66 80 48 C80 32 70 18 55 14"
                    fill="none"
                    stroke="#451a03"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Right Leaves */}
                  <path d="M78 66 C84 64 85 58 81 56 C77 58 76 64 78 66 Z" />
                  <path d="M81 54 C87 51 87 45 82 43 C78 46 78 52 81 54 Z" />
                  <path d="M80 42 C85 38 83 32 78 31 C75 35 76 41 80 42 Z" />
                  <path d="M74 30 C78 25 75 19 69 19 C67 24 69 29 74 30 Z" />
                  <path d="M65 20 C68 15 63 10 57 11 C57 16 60 20 65 20 Z" />

                  {/* Ribbon Bow Knot at base */}
                  <path d="M46 80 C44 77 40 76 38 78 C36 80 38 84 41 84 C44 84 46 82 46 80 Z" />
                  <path d="M54 80 C56 77 60 76 62 78 C64 80 62 84 59 84 C56 84 54 82 54 80 Z" />
                  <circle cx="50" cy="80.5" r="2.5" />
                  <path d="M47 82 L42 90" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
                  <path d="M53 82 L58 90" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />

                  {/* Small decorative star on top */}
                  <path
                    d="M50 20 L51.5 24 L55.5 24 L52 26.5 L53.5 30.5 L50 28 L46.5 30.5 L48 26.5 L44.5 24 L48.5 24 Z"
                    fill="#78350f"
                  />
                </svg>

                {/* Central Crisp Denomination Value "40%" */}
                <div className="absolute inset-0 flex items-center justify-center pt-2">
                  <span className="text-2xl sm:text-3xl font-black text-amber-950 font-display tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
                    40%
                  </span>
                </div>
              </div>

              {/* Bottom Labels: Typography & Odds */}
              <div className="text-center w-full">
                <div className="text-[12px] sm:text-xs font-black text-amber-950 tracking-wider">
                  РЕШКА · TAILS
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-amber-900 font-mono-numbers">
                  Шанс: 40%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outcome announcement banner */}
      <div className="h-10 mt-3 flex items-center justify-center">
        {isFlipping ? (
          <span className="text-xs font-medium text-amber-300/80 tracking-wide animate-pulse">
            Монета в воздухе...
          </span>
        ) : lastPnl !== null ? (
          <div
            className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
              lastWon
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            <span>Выпало: {currentSide === 'heads' ? 'Орёл (60%)' : 'Решка (40%)'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">
              {lastWon ? `+$${lastPnl.toFixed(2)} (Победа)` : `-$${Math.abs(lastPnl).toFixed(2)} (Проигрыш)`}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">
            Сделайте ставку и бросьте монету
          </span>
        )}
      </div>
    </div>
  );
};
