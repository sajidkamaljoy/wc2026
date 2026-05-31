export type StageType =
  | "GROUP"
  | "ROUND_OF_32"
  | "ROUND_OF_16"
  | "QUARTER_FINAL"
  | "SEMI_FINAL"
  | "THIRD_PLACE"
  | "FINAL";

export type MatchStatusType =
  | "SCHEDULED"
  | "LIVE"
  | "HALF_TIME"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";

export interface TeamStanding {
  id: string;
  name: string;
  flagUrl: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  groupId: string;
  position?: number; // 1-4 within the group
}

export interface MatchWithTeams {
  id: string;
  matchNumber: number;
  stage: StageType;
  groupId: string | null;
  kickoffUtc: string; // ISO string
  homeTeam: { id: string; name: string; flagUrl: string | null } | null;
  awayTeam: { id: string; name: string; flagUrl: string | null } | null;
  homePlaceholder: string | null;
  awayPlaceholder: string | null;
  venue: { name: string; city: string; country: string };
  status: MatchStatusType;
  homeScore: number | null;
  awayScore: number | null;
}

export interface PathwayRound {
  round: StageType;
  label: string; // "Round of 32", "Round of 16", etc.
  possibleOpponents: string[]; // Team names or placeholder descriptions
  bracketSlot: string; // e.g. "R32-Match-17"
}

export interface TeamPathway {
  team: { id: string; name: string; groupId: string; flagUrl: string | null };
  currentGroupPosition: number | "TBD";
  rounds: PathwayRound[];
}

export interface GroupWithStandings {
  id: string;
  name: string;
  teams: TeamStanding[];
}

export interface LiveScore {
  matchId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatusType;
  minute?: number;
}

export type PositionType = "GK" | "DEF" | "MID" | "FWD";
export type SquadStatusType = "CONFIRMED" | "PRELIMINARY" | "TBD";

export interface Player {
  id: string;
  teamId: string;
  name: string;
  position: PositionType;
  shirtNumber: number | null;
  club: string | null;
  age: number | null;
  caps: number | null;
  isPlaceholder: boolean;
  squadStatus: SquadStatusType;
}

export interface SquadResponse {
  teamId: string;
  squadStatus: SquadStatusType;
  players: Player[];
}

export interface GroupPickState {
  // groupId -> ordered array of teamIds (index 0 is 1st, 1 is 2nd, 2 is 3rd, 3 is 4th)
  groupRankings: Record<string, string[]>;
  // array of exactly 8 groupIds whose 3rd-place team is selected to advance
  thirdPlaces: string[];
}

export interface BracketPick {
  matchNumber: number;
  winnerId: string;
  winnerName: string;
  winnerFlagUrl: string | null;
}

export interface BracketPredictionState {
  groupRankings: Record<string, string[]>; // groupId -> teamId[]
  thirdPlaces: string[]; // groupId[] (the 8 chosen groups for 3rd place advancement)
  knockoutPicks: Record<number, string>; // matchNumber -> winnerId
  isSubmitted: boolean;
}
