import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Tournament, type Snack, type Match } from './types';
import {
  allocateGroups,
  buildKnockoutBracket,
  getGroupQualifiers,
} from './utils/tournament';

interface TournamentStore {
  tournament: Tournament | null;
  createTournament: (
    name: string,
    snacks: Snack[],
    groupCount: number,
    advancementCount: number
  ) => void;
  addSnack: (snack: Snack) => void;
  updateSnack: (snack: Snack) => void;
  removeSnack: (id: string) => void;
  recordMatchResult: (
    matchId: string,
    winnerId: string,
    scoreA: number,
    scoreB: number
  ) => void;
  advanceToKnockout: () => void;
  completeKnockout: () => void;
  resetTournament: () => void;
  pendingSnacks: Snack[];
  setPendingSnacks: (snacks: Snack[]) => void;
  addPendingSnack: (snack: Snack) => void;
  updatePendingSnack: (snack: Snack) => void;
  removePendingSnack: (id: string) => void;
}

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set, _get) => ({
      tournament: null,
      pendingSnacks: [],

      setPendingSnacks: (snacks) => set({ pendingSnacks: snacks }),

      addPendingSnack: (snack) =>
        set((s) => ({ pendingSnacks: [...s.pendingSnacks, snack] })),

      updatePendingSnack: (snack) =>
        set((s) => ({
          pendingSnacks: s.pendingSnacks.map((ps) =>
            ps.id === snack.id ? snack : ps
          ),
        })),

      removePendingSnack: (id) =>
        set((s) => ({
          pendingSnacks: s.pendingSnacks.filter((ps) => ps.id !== id),
        })),

      createTournament: (name, snacks, groupCount, advancementCount) => {
        const groups = allocateGroups(snacks, groupCount);
        const tournament: Tournament = {
          id: `tournament-${Date.now()}`,
          name,
          snacks,
          groups,
          knockoutMatches: [],
          rankings: [],
          stage: 'group',
          advancementCount,
        };
        set({ tournament });
      },

      addSnack: (snack) =>
        set((s) => {
          if (!s.tournament) return s;
          return {
            tournament: {
              ...s.tournament,
              snacks: [...s.tournament.snacks, snack],
            },
          };
        }),

      updateSnack: (snack) =>
        set((s) => {
          if (!s.tournament) return s;
          return {
            tournament: {
              ...s.tournament,
              snacks: s.tournament.snacks.map((sn) =>
                sn.id === snack.id ? snack : sn
              ),
            },
          };
        }),

      removeSnack: (id) =>
        set((s) => {
          if (!s.tournament) return s;
          return {
            tournament: {
              ...s.tournament,
              snacks: s.tournament.snacks.filter((sn) => sn.id !== id),
            },
          };
        }),

      recordMatchResult: (matchId, winnerId, scoreA, scoreB) =>
        set((s) => {
          if (!s.tournament) return s;
          const t = s.tournament;

          // Check group matches
          const groups = t.groups.map((g) => ({
            ...g,
            matches: g.matches.map((m) =>
              m.id === matchId
                ? { ...m, winnerId, scoreA, scoreB }
                : m
            ),
          }));

          // Check knockout matches
          let knockoutMatches = t.knockoutMatches.map((m) =>
            m.id === matchId ? { ...m, winnerId, scoreA, scoreB } : m
          );

          // Propagate winner into the next-round match that references this match's ID
          knockoutMatches = knockoutMatches.map((m) => {
            if (m.a === matchId) return { ...m, a: winnerId };
            if (m.b === matchId) return { ...m, b: winnerId };
            return m;
          });

          // When both semis are done, fill in the real loser IDs on the 3rd place match
          const recordedMatch = knockoutMatches.find((m) => m.id === matchId);
          if (recordedMatch?.round === 'SF') {
            const semis = knockoutMatches.filter((m) => m.round === 'SF');
            if (semis.every((m) => m.winnerId)) {
              const losers = semis.map((m) => (m.winnerId === m.a ? m.b : m.a));
              knockoutMatches = knockoutMatches.map((m) =>
                m.round === '3rd' ? { ...m, a: losers[0], b: losers[1] } : m
              );
            }
          }

          return {
            tournament: {
              ...t,
              groups,
              knockoutMatches,
            },
          };
        }),

      advanceToKnockout: () =>
        set((s) => {
          if (!s.tournament) return s;
          const t = s.tournament;

          // Gather qualifiers from all groups
          const qualifiers: string[] = [];
          t.groups.forEach((group) => {
            const groupQualifiers = getGroupQualifiers(
              group,
              t.advancementCount,
              t.snacks
            );
            qualifiers.push(...groupQualifiers);
          });

          const knockoutMatches = buildKnockoutBracket(qualifiers);

          return {
            tournament: {
              ...t,
              knockoutMatches,
              stage: 'knockout',
            },
          };
        }),

      completeKnockout: () =>
        set((s) => {
          if (!s.tournament) return s;
          const t = s.tournament;

          // Build rankings from knockout results
          const rankings: string[] = [];

          // Find the final
          const finalMatch = t.knockoutMatches.find((m) => m.round === 'F');
          if (finalMatch?.winnerId) {
            const goldId = finalMatch.winnerId;
            const silverId =
              finalMatch.a === goldId ? finalMatch.b : finalMatch.a;
            rankings.push(goldId, silverId);
          }

          // Find third place
          const thirdMatch = t.knockoutMatches.find((m) => m.round === '3rd');
          if (thirdMatch?.winnerId) {
            rankings.push(thirdMatch.winnerId);
            const fourthId =
              thirdMatch.a === thirdMatch.winnerId
                ? thirdMatch.b
                : thirdMatch.a;
            if (!fourthId.startsWith('__')) rankings.push(fourthId);
          }

          // Add remaining qualifiers by group standings
          const qualifiers = t.knockoutMatches
            .filter((m) => m.stage === 'knockout' && !m.id.startsWith('ko-3rd'))
            .flatMap((m) => [m.a, m.b])
            .filter((id) => !id.startsWith('ko-') && !id.startsWith('__'));

          const uniqueQualifiers = [...new Set(qualifiers)];
          uniqueQualifiers.forEach((id) => {
            if (!rankings.includes(id)) {
              rankings.push(id);
            }
          });

          // Add group stage eliminated snacks
          t.snacks.forEach((snack) => {
            if (!rankings.includes(snack.id)) {
              rankings.push(snack.id);
            }
          });

          return {
            tournament: {
              ...t,
              rankings,
              stage: 'complete',
            },
          };
        }),

      resetTournament: () => set({ tournament: null, pendingSnacks: [] }),
    }),
    {
      name: 'snacks-tournament',
    }
  )
);

// Helper selectors
export function getSnackById(tournament: Tournament | null, id: string): Snack | undefined {
  return tournament?.snacks.find((s) => s.id === id);
}

export function getMatchById(tournament: Tournament | null, matchId: string): Match | undefined {
  if (!tournament) return undefined;
  for (const group of tournament.groups) {
    const m = group.matches.find((m) => m.id === matchId);
    if (m) return m;
  }
  return tournament.knockoutMatches.find((m) => m.id === matchId);
}

export function getNextUnplayedGroupMatch(tournament: Tournament | null): Match | undefined {
  if (!tournament) return undefined;
  for (const group of tournament.groups) {
    const match = group.matches.find((m) => !m.winnerId);
    if (match) return match;
  }
  return undefined;
}

export function getNextUnplayedKnockoutMatch(tournament: Tournament | null): Match | undefined {
  if (!tournament) return undefined;
  // Get matches in order: R32 > R16 > QF > SF > F, and 3rd place after SF
  const order = ['R32', 'R16', 'QF', 'SF', 'F', '3rd'];
  for (const round of order) {
    const match = tournament.knockoutMatches.find(
      (m) => m.round === round && !m.winnerId && isMatchPlayable(tournament, m)
    );
    if (match) return match;
  }
  return undefined;
}

function isMatchPlayable(tournament: Tournament, match: Match): boolean {
  // Check if both participants are real snack IDs (not placeholder match IDs)
  const isRealSnack = (id: string) =>
    !id.startsWith('ko-') && !id.startsWith('__') && tournament.snacks.some((s) => s.id === id);

  if (match.round === '3rd') {
    // Check if both semis are played
    const semis = tournament.knockoutMatches.filter((m) => m.round === 'SF');
    return semis.length >= 2 && semis.every((m) => m.winnerId);
  }

  return isRealSnack(match.a) && isRealSnack(match.b);
}

export function isGroupStageComplete(tournament: Tournament | null): boolean {
  if (!tournament) return false;
  return tournament.groups.every((g) => g.matches.every((m) => m.winnerId));
}

export function isKnockoutComplete(tournament: Tournament | null): boolean {
  if (!tournament) return false;
  const finalMatch = tournament.knockoutMatches.find((m) => m.round === 'F');
  const thirdMatch = tournament.knockoutMatches.find((m) => m.round === '3rd');
  if (thirdMatch) return !!finalMatch?.winnerId && !!thirdMatch.winnerId;
  return !!finalMatch?.winnerId;
}

export function getTotalGroupMatches(tournament: Tournament | null): number {
  if (!tournament) return 0;
  return tournament.groups.reduce((sum, g) => sum + g.matches.length, 0);
}

export function getPlayedGroupMatches(tournament: Tournament | null): number {
  if (!tournament) return 0;
  return tournament.groups.reduce(
    (sum, g) => sum + g.matches.filter((m) => m.winnerId).length,
    0
  );
}
