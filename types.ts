// Name Your Price — Shared Types
// v1.0

export type Screen =
  | "landing"
  | "lobby"
  | "voting"        // covers voting_1, voting_2, voting_3
  | "judging"       // AI calculating screen
  | "results"
  | "rejoin"
  | "leaderboard";

export type Verdict = "FAIR" | "OVERPRICED" | "STEAL";

export interface Product {
  id: number;
  cat: string;
  name: string;
  price: number;
  currency: string;
  context: string;
}

export interface Player {
  name: string;
  address: string;
  ready: boolean;
  score: number;
  is_bot?: boolean;
}

export interface VerdictSubmission {
  player: string;
  name: string;
  verdict: Verdict;
  comment?: string;
  is_bot?: boolean;
}

export interface RankEntry {
  player: string;
  name: string;
  total_score: number;
  round_scores: number[];
  correct_verdicts: number;
}

export interface Room {
  code: string;
  host: string;
  status: "lobby" | "voting_1" | "voting_2" | "voting_3" | "judging" | "completed";
  is_solo: boolean;
  game_id: number;
  players: Record<string, Player>;
  products: Product[];
  submissions_1: Record<string, VerdictSubmission>;
  submissions_2: Record<string, VerdictSubmission>;
  submissions_3: Record<string, VerdictSubmission>;
  bot_submissions_1: Record<string, VerdictSubmission>;
  bot_submissions_2: Record<string, VerdictSubmission>;
  bot_submissions_3: Record<string, VerdictSubmission>;
  rankings: RankEntry[];
  bots_ready?: boolean;
}

export interface PlayerStats {
  games_played: number;
  total_score: number;
  wins: number;
  best_round_score: number;
  display_name: string;
}

export interface LeaderboardEntry {
  address: string;
  name: string;
  games_played: number;
  total_score: number;
  wins: number;
  avg_score: number;
}

export interface AppState {
  screen: Screen;
  playerAddress: string;
  playerName: string;
  roomCode: string;
  room: Room | null;
  isHost: boolean;
  isSolo: boolean;
  error: string;
  loading: string;
}
