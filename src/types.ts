export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  dateTime: string;
  stage: string; // Vòng bảng, Vòng 32, Vòng 16, v.v.
  scoreA: number | null; // null if match is not played yet
  scoreB: number | null;
  handicap: number; // e.g. 0.5 (Team A chấp B 0.5), -1.5 (Team B chấp A 1.5), v.v.
}

export interface Participant {
  id: string;
  name: string;
  avatarColor: string;
  role?: string; // Sếp, Kế toán, Dev, v.v.
}

export interface Prediction {
  participantId: string;
  matchId: string;
  choice: 'A' | 'B'; // 'A' for Team A, 'B' for Team B
}

export interface ScoringConfig {
  exactScore: number;       // e.g., 3 points
  correctOutcome: number;   // correct win/draw/loss but wrong score (e.g., 1 point)
  wrongOutcome: number;     // 0 points
}

export interface StandingRow {
  participant: Participant;
  points: number;
  exactCount: number;
  outcomeCount: number;
  wrongCount: number;
  predictedCount: number;
  fines: number;
}

export type ActiveTab = 'leaderboard' | 'spreadsheet' | 'matches' | 'participants' | 'fines' | 'rules';
