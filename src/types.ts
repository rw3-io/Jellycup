export type Snack = {
  id: string;
  name: string;
  image?: string;
  description?: string;
  category?: string;
};

export type Match = {
  id: string;
  a: string;       // snackId
  b: string;       // snackId
  scoreA?: number;
  scoreB?: number;
  winnerId?: string;
  stage: "group" | "knockout";
  round?: string;  // e.g. "QF", "SF", "F", "3rd"
};

export type Group = {
  id: string;
  name: string;   // "Group A", "Group B" etc
  snackIds: string[];
  matches: Match[];
};

export type TournamentStage = "setup" | "group" | "knockout" | "complete";

export type Tournament = {
  id: string;
  name: string;
  snacks: Snack[];
  groups: Group[];
  knockoutMatches: Match[];
  rankings: string[];  // snackIds ordered 1st..last
  stage: TournamentStage;
  advancementCount: number; // top N per group, default 2
};
