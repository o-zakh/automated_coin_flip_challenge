import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CoinSide, FlipResult, GameSessionSummary } from './types';
import { Header } from './components/Header';
import { CoinVisual } from './components/CoinVisual';
import { ManualControls } from './components/ManualControls';
import { PythonEditor } from './components/PythonEditor';
import { EquityChart } from './components/EquityChart';
import { HistoryTable } from './components/HistoryTable';
import { GameOverModal } from './components/GameOverModal';
import { KellyExplanationModal } from './components/KellyExplanationModal';
import { ElmInfoModal } from './components/ElmInfoModal';
import { DEFAULT_PYTHON_SCRIPT, executePythonStrategy } from './utils/pythonEngine';
import { sounds } from './utils/soundEffects';

const INITIAL_CAPITAL = 25.0;
const SESSION_DURATION_SECONDS = 1800; // 30 minutes
const FLIP_INTERVAL_BASE_SECONDS = 5.0; // 5 seconds per flip

export default function App() {
  // Game state
  const [balance, setBalance] = useState<number>(INITIAL_CAPITAL);
  const [timeLeft, setTimeLeft] = useState<number>(SESSION_DURATION_SECONDS);
  const [history, setHistory] = useState<FlipResult[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Manual betting controls
  const [choice, setChoice] = useState<CoinSide>('heads');
  const [stake, setStake] = useState<number>(5.0); // start at $5

  // Flipping animation state
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [lastOutcome, setLastOutcome] = useState<CoinSide | null>(null);
  const [lastWon, setLastWon] = useState<boolean | null>(null);
  const [lastPnl, setLastPnl] = useState<number | null>(null);

  // Python Script & Automation
  const [pythonCode, setPythonCode] = useState<string>(DEFAULT_PYTHON_SCRIPT);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(1);
  const [nextFlipCountdown, setNextFlipCountdown] = useState<number>(FLIP_INTERVAL_BASE_SECONDS);

  // Modals & End-of-game summary
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sessionSummary, setSessionSummary] = useState<GameSessionSummary | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [isKellyModalOpen, setIsKellyModalOpen] = useState<boolean>(false);

  // Refs for auto-running loop to always access latest state
  const stateRef = useRef({
    balance,
    timeLeft,
    history,
    pythonCode,
    isAutoRunning,
    autoSpeed,
    isFlipping,
  });

  useEffect(() => {
    stateRef.current = {
      balance,
      timeLeft,
      history,
      pythonCode,
      isAutoRunning,
      autoSpeed,
      isFlipping,
    };
  }, [balance, timeLeft, history, pythonCode, isAutoRunning, autoSpeed, isFlipping]);

  const isBankrupt = balance < 0.01;

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  // Helper to construct session summary
  const createSummary = useCallback(
    (
      finalBal: number,
      reason: 'bankrupt' | 'time_up' | 'simulated' | 'manual_finish',
      sessionFlips: FlipResult[]
    ): GameSessionSummary => {
      const starting = INITIAL_CAPITAL;
      const profit = finalBal - starting;
      const growthPct = ((finalBal - starting) / starting) * 100;
      const wins = sessionFlips.filter((f) => f.won).length;
      const losses = sessionFlips.filter((f) => !f.won).length;
      const balances = [starting, ...sessionFlips.map((f) => f.bankrollAfter)];
      const peak = Math.max(...balances);
      const lowest = Math.min(...balances);

      return {
        startingBalance: starting,
        finalBalance: finalBal,
        profitAmount: profit,
        growthPct,
        flipsExecuted: sessionFlips.length,
        wins,
        losses,
        winRate: sessionFlips.length > 0 ? (wins / sessionFlips.length) * 100 : 0,
        peakBalance: peak,
        lowestBalance: lowest,
        isBankrupt: finalBal < 0.01,
        reachedCap: finalBal >= 250,
        isTimeUp: reason === 'time_up' || reason === 'simulated',
        reason,
        unlockedKelly: growthPct >= 200.0 || finalBal >= 75.0,
        history: sessionFlips,
      };
    },
    []
  );

  // Complete game manually
  const handleFinishGame = () => {
    setIsAutoRunning(false);
    setIsTimerRunning(false);
    const summary = createSummary(balance, 'manual_finish', history);
    setSessionSummary(summary);
  };

  // Reset entire game
  const handleReset = () => {
    setIsAutoRunning(false);
    setIsTimerRunning(false);
    setIsFlipping(false);
    setBalance(INITIAL_CAPITAL);
    setTimeLeft(SESSION_DURATION_SECONDS);
    setHistory([]);
    setLastOutcome(null);
    setLastWon(null);
    setLastPnl(null);
    setStake(5.0);
    setChoice('heads');
    setNextFlipCountdown(FLIP_INTERVAL_BASE_SECONDS / autoSpeed);
    setSessionSummary(null);
    setIsKellyModalOpen(false);
  };

  // Timer countdown: ticks down 1 second every 1000ms if session is active
  useEffect(() => {
    if (!isTimerRunning && !isAutoRunning) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          setIsAutoRunning(false);
          // Show party end modal when time is up
          setTimeout(() => {
            setSessionSummary(createSummary(stateRef.current.balance, 'time_up', stateRef.current.history));
          }, 400);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, isAutoRunning, timeLeft, createSummary]);

  // Execute a single coin flip
  const executeFlip = useCallback(
    (betChoice: CoinSide, betStake: number, source: 'manual' | 'script'): boolean => {
      const currentBal = stateRef.current.balance;
      if (currentBal < 0.01 || betStake <= 0) return false;

      // Ensure stake does not exceed current balance
      const actualStake = Math.min(currentBal, Math.round(betStake * 100) / 100);
      if (actualStake <= 0) return false;

      // Start timer if not running
      setIsTimerRunning(true);
      setIsFlipping(true);
      sounds.playFlip();

      // Coin outcome: Elm Wealth coin has EXACT 60% probability for Heads, 40% for Tails
      const isHeads = Math.random() < 0.6;
      const flipOutcome: CoinSide = isHeads ? 'heads' : 'tails';
      const playerWon = betChoice === flipOutcome;
      const pnl = playerWon ? actualStake : -actualStake;
      const newBal = Math.max(0, Math.round((currentBal + pnl) * 100) / 100);

      // Animation duration: 600ms for fast feedback or 900ms
      const animDuration = source === 'script' && stateRef.current.autoSpeed > 2 ? 300 : 700;

      setTimeout(() => {
        sounds.playLand();
        if (playerWon) {
          sounds.playWin();
        } else {
          sounds.playLoss();
        }

        setLastOutcome(flipOutcome);
        setLastWon(playerWon);
        setLastPnl(pnl);
        setBalance(newBal);
        setIsFlipping(false);

        const newRecord: FlipResult = {
          id: Date.now() + Math.random(),
          flipNumber: stateRef.current.history.length + 1,
          timestamp: Date.now(),
          timeLeftSeconds: stateRef.current.timeLeft,
          choice: betChoice,
          stake: actualStake,
          outcome: flipOutcome,
          won: playerWon,
          pnl,
          bankrollBefore: currentBal,
          bankrollAfter: newBal,
          source,
        };

        const updatedHistory = [...stateRef.current.history, newRecord];
        setHistory(updatedHistory);

        // Auto adjust manual stake if it now exceeds new balance
        if (source === 'manual') {
          setStake((prev) => Math.min(newBal, prev));
        }

        // Bankruptcy check: immediately end session and show party results modal!
        if (newBal < 0.01) {
          setIsAutoRunning(false);
          setIsTimerRunning(false);
          setTimeout(() => {
            setSessionSummary(createSummary(newBal, 'bankrupt', updatedHistory));
          }, 500);
        }
      }, animDuration);

      return true;
    },
    [createSummary]
  );

  // Manual Flip Handler
  const handleManualFlip = () => {
    if (isFlipping || isAutoRunning || isBankrupt || timeLeft <= 0) return;
    executeFlip(choice, stake, 'manual');
  };

  // Keyboard shortcut (Space / Enter to flip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleManualFlip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [choice, stake, isFlipping, isAutoRunning, isBankrupt, timeLeft]);

  // Real-time automation tick: runs every 5 seconds (divided by autoSpeed)
  useEffect(() => {
    if (!isAutoRunning) {
      setNextFlipCountdown(FLIP_INTERVAL_BASE_SECONDS / autoSpeed);
      return;
    }

    const intervalMs = 100;
    const intervalSec = intervalMs / 1000;
    const targetInterval = FLIP_INTERVAL_BASE_SECONDS / autoSpeed;

    const timer = setInterval(() => {
      setNextFlipCountdown((prev) => {
        const next = prev - intervalSec;
        if (next <= 0) {
          // Time to execute next flip using Python script!
          const { balance: curBal, timeLeft: curTime, history: curHist, pythonCode: code, isFlipping: flipping } =
            stateRef.current;

          if (curBal >= 0.01 && curTime > 0 && !flipping) {
            const scriptRes = executePythonStrategy(code, {
              balance: curBal,
              time_left: curTime,
              flip_count: curHist.length + 1,
              history: curHist.map((h) => ({
                flip: h.flipNumber,
                choice: h.choice,
                stake: h.stake,
                outcome: h.outcome,
                won: h.won,
                balance: h.bankrollAfter,
                pnl: h.pnl,
              })),
            });

            if (!scriptRes.error && scriptRes.stake > 0) {
              executeFlip(scriptRes.choice, scriptRes.stake, 'script');
            } else if (scriptRes.error) {
              setIsAutoRunning(false);
            }
          }

          return targetInterval;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isAutoRunning, autoSpeed, executeFlip]);

  // Instant simulation of remaining 30 minutes
  const handleSimulateToEnd = () => {
    if (isBankrupt || timeLeft <= 0) return;

    setIsAutoRunning(false);

    // Calculate how many flips remain for the remaining time (at 5 sec per flip)
    const remainingSeconds = timeLeft;
    const flipsToRun = Math.max(1, Math.floor(remainingSeconds / FLIP_INTERVAL_BASE_SECONDS));

    let simBal = balance;
    let simTime = timeLeft;
    const simHistory = [...history];

    for (let i = 0; i < flipsToRun; i++) {
      if (simBal < 0.01) break;

      // Evaluate python script
      const scriptRes = executePythonStrategy(pythonCode, {
        balance: simBal,
        time_left: simTime,
        flip_count: simHistory.length + 1,
        history: simHistory.map((h) => ({
          flip: h.flipNumber,
          choice: h.choice,
          stake: h.stake,
          outcome: h.outcome,
          won: h.won,
          balance: h.bankrollAfter,
          pnl: h.pnl,
        })),
      });

      if (scriptRes.error) {
        break;
      }

      const betStake = Math.min(simBal, Math.max(0, scriptRes.stake));
      if (betStake <= 0) {
        simTime = Math.max(0, simTime - FLIP_INTERVAL_BASE_SECONDS);
        continue;
      }

      // Coin flip 60% heads, 40% tails
      const isHeads = Math.random() < 0.6;
      const flipOutcome: CoinSide = isHeads ? 'heads' : 'tails';
      const won = scriptRes.choice === flipOutcome;
      const pnl = won ? betStake : -betStake;
      const oldBal = simBal;
      simBal = Math.max(0, Math.round((simBal + pnl) * 100) / 100);

      simTime = Math.max(0, simTime - FLIP_INTERVAL_BASE_SECONDS);

      simHistory.push({
        id: Date.now() + i,
        flipNumber: simHistory.length + 1,
        timestamp: Date.now() + i * 5000,
        timeLeftSeconds: simTime,
        choice: scriptRes.choice,
        stake: betStake,
        outcome: flipOutcome,
        won,
        pnl,
        bankrollBefore: oldBal,
        bankrollAfter: simBal,
        source: 'script',
      });
    }

    setBalance(simBal);
    setTimeLeft(0);
    setHistory(simHistory);
    setIsTimerRunning(false);

    if (simHistory.length > 0) {
      const last = simHistory[simHistory.length - 1];
      setLastOutcome(last.outcome);
      setLastWon(last.won);
      setLastPnl(last.pnl);
    }

    // Trigger end-of-game summary modal
    const summary = createSummary(simBal, 'simulated', simHistory);
    setSessionSummary(summary);
  };

  const headsCount = history.filter((h) => h.outcome === 'heads').length;
  const tailsCount = history.filter((h) => h.outcome === 'tails').length;

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        balance={balance}
        timeLeft={timeLeft}
        flipCount={history.length}
        headsCount={headsCount}
        tailsCount={tailsCount}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onReset={handleReset}
        onOpenInfo={() => setIsInfoModalOpen(true)}
        onFinishGame={handleFinishGame}
      />

      {/* Main 2-Zone Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Zone 1: Coin Flip Stage, Manual Controls & Equity Curve) */}
        <section className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6">
          {/* Coin Stage Container */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-2 shadow-xl flex flex-col items-center">
            <CoinVisual
              isFlipping={isFlipping}
              outcome={lastOutcome}
              lastWon={lastWon}
              lastPnl={lastPnl}
            />

            {/* Manual Controls Deck */}
            <div className="w-full">
              <ManualControls
                balance={balance}
                choice={choice}
                onChoiceChange={setChoice}
                stake={stake}
                onStakeChange={setStake}
                onFlip={handleManualFlip}
                isFlipping={isFlipping}
                isBankrupt={isBankrupt}
                timeLeft={timeLeft}
                isAutoRunning={isAutoRunning}
              />
            </div>
          </div>

          {/* Real-time Interactive Equity Curve Chart */}
          <EquityChart
            history={history}
            currentBalance={balance}
            initialBalance={INITIAL_CAPITAL}
          />
        </section>

        {/* Right Column (Zone 2: Python Script Automation & Flips History Journal) */}
        <section className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6">
          {/* Python Script Automation Workspace */}
          <PythonEditor
            code={pythonCode}
            onCodeChange={setPythonCode}
            balance={balance}
            timeLeft={timeLeft}
            flipCount={history.length}
            history={history.map((h) => ({
              flip: h.flipNumber,
              choice: h.choice,
              stake: h.stake,
              outcome: h.outcome,
              won: h.won,
              balance: h.bankrollAfter,
              pnl: h.pnl,
            }))}
            isAutoRunning={isAutoRunning}
            onToggleAutoRun={() => setIsAutoRunning(!isAutoRunning)}
            onSimulateToEnd={handleSimulateToEnd}
            autoSpeed={autoSpeed}
            onSpeedChange={setAutoSpeed}
            nextFlipCountdown={nextFlipCountdown}
            isBankrupt={isBankrupt}
          />

          {/* History of Past Flips Journal */}
          <HistoryTable
            history={history}
            onClearHistory={() => setHistory([])}
          />
        </section>
      </main>

      {/* Footer without spoilers */}
      <footer className="border-t border-slate-800/80 bg-[#090e18] py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Основано на эксперименте <em>Victor Haghani & Richard Dewey (Elm Wealth, 2016)</em>
          </div>
          <div className="flex items-center gap-4">
            <span>Шанс орла: 60%</span>
            <span>·</span>
            <span>Шанс решки: 40%</span>
            <span>·</span>
            <span>Выплата: х2.0</span>
          </div>
        </div>
      </footer>

      {/* Post-Session Game Over & Results Modal (With Growth Scale & Kelly Unlock Button) */}
      <GameOverModal
        summary={sessionSummary}
        onClose={() => setSessionSummary(null)}
        onReset={handleReset}
        onOpenKelly={() => {
          setSessionSummary(null);
          setIsKellyModalOpen(true);
        }}
      />

      {/* Unlocked Kelly Explanation Modal (Revealed when growth >= 50%) */}
      <KellyExplanationModal
        isOpen={isKellyModalOpen}
        onClose={() => setIsKellyModalOpen(false)}
        onApplyKellyCode={(code) => setPythonCode(code)}
      />

      {/* Game Rules Modal (Zero Spoilers) */}
      <ElmInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
