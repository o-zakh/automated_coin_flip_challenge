export type CoinSide = 'heads' | 'tails';

export interface FlipResult {
  id: number;
  flipNumber: number;
  timestamp: number;
  timeLeftSeconds: number;
  choice: CoinSide;
  stake: number;
  outcome: CoinSide;
  won: boolean;
  pnl: number;
  bankrollBefore: number;
  bankrollAfter: number;
  source: 'manual' | 'script';
}

export interface ScriptOutput {
  stake: number;
  choice: CoinSide;
  logs: string[];
  executionTimeMs: number;
  error?: string;
}

export interface GameSessionSummary {
  startingBalance: number;
  finalBalance: number;
  profitAmount: number;
  growthPct: number;
  flipsExecuted: number;
  wins: number;
  losses: number;
  winRate: number;
  peakBalance: number;
  lowestBalance: number;
  isBankrupt: boolean;
  reachedCap: boolean;
  isTimeUp: boolean;
  reason: 'bankrupt' | 'time_up' | 'simulated' | 'manual_finish';
  unlockedKelly: boolean;
  history: FlipResult[];
}
