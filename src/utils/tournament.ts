import { type Group, type Match, type Snack } from '../types';

// Fisher-Yates shuffle
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function allocateGroups(snacks: Snack[], groupCount: number): Group[] {
  const shuffled = shuffleArray(snacks);
  const groups: Group[] = Array.from({ length: groupCount }, (_, i) => ({
    id: `group-${i}`,
    name: `Group ${String.fromCharCode(65 + i)}`,
    snackIds: [],
    matches: [],
  }));

  shuffled.forEach((snack, idx) => {
    groups[idx % groupCount].snackIds.push(snack.id);
  });

  groups.forEach((group) => {
    group.matches = generateGroupMatches(group);
  });

  return groups;
}

export function generateGroupMatches(group: Group): Match[] {
  const matches: Match[] = [];
  const ids = group.snackIds;
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      matches.push({
        id: `${group.id}-match-${i}-${j}`,
        a: ids[i],
        b: ids[j],
        stage: 'group',
      });
    }
  }
  return matches;
}

export type StandingRow = {
  snackId: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  scoredFor: number;
  scoredAgainst: number;
  diff: number;
};

export function calculateGroupStandings(group: Group, _snacks: Snack[]): StandingRow[] {
  const rows: Record<string, StandingRow> = {};

  group.snackIds.forEach((id) => {
    rows[id] = {
      snackId: id,
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      scoredFor: 0,
      scoredAgainst: 0,
      diff: 0,
    };
  });

  group.matches.forEach((match) => {
    if (match.winnerId === undefined) return;
    const sA = match.scoreA ?? 0;
    const sB = match.scoreB ?? 0;

    rows[match.a].played++;
    rows[match.b].played++;
    rows[match.a].scoredFor += sA;
    rows[match.a].scoredAgainst += sB;
    rows[match.b].scoredFor += sB;
    rows[match.b].scoredAgainst += sA;

    if (match.winnerId === match.a) {
      rows[match.a].won++;
      rows[match.a].points += 3;
      rows[match.b].lost++;
    } else {
      rows[match.b].won++;
      rows[match.b].points += 3;
      rows[match.a].lost++;
    }
  });

  const rowList = Object.values(rows).map((r) => ({
    ...r,
    diff: r.scoredFor - r.scoredAgainst,
  }));

  rowList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.diff !== a.diff) return b.diff - a.diff;
    if (b.scoredFor !== a.scoredFor) return b.scoredFor - a.scoredFor;
    return Math.random() - 0.5;
  });

  return rowList;
}

export function getGroupQualifiers(group: Group, count: number, snacks: Snack[]): string[] {
  const standings = calculateGroupStandings(group, snacks);
  return standings.slice(0, count).map((r) => r.snackId);
}

export function buildKnockoutBracket(qualifierIds: string[]): Match[] {
  if (qualifierIds.length === 0) return [];

  // Pad to next power of 2
  let size = 1;
  while (size < qualifierIds.length) size *= 2;

  const padded: (string | null)[] = [...qualifierIds];
  while (padded.length < size) padded.push(null);

  const matches: Match[] = [];
  let round = 1;
  let currentSlots: (string | null)[] = padded;

  // Build initial round matches
  while (currentSlots.length > 1) {
    const roundLabel = getRoundLabel(currentSlots.length, size);
    const nextSlots: (string | null)[] = [];

    for (let i = 0; i < currentSlots.length; i += 2) {
      const aId = currentSlots[i];
      const bId = currentSlots[i + 1];

      if (aId === null && bId === null) {
        nextSlots.push(null);
        continue;
      }

      if (aId !== null && bId === null) {
        // bye - a advances automatically
        nextSlots.push(aId);
        continue;
      }

      if (aId === null && bId !== null) {
        nextSlots.push(bId);
        continue;
      }

      const matchId = `ko-r${round}-m${i / 2}`;
      matches.push({
        id: matchId,
        a: aId!,
        b: bId!,
        stage: 'knockout',
        round: roundLabel,
      });
      // placeholder for winner
      nextSlots.push(matchId);
    }

    currentSlots = nextSlots;
    round++;
  }

  // Add third place match if there are semifinals
  const semis = matches.filter((m) => m.round === 'SF');
  if (semis.length >= 2) {
    matches.push({
      id: 'ko-3rd',
      a: `__sf-loser-0`,
      b: `__sf-loser-1`,
      stage: 'knockout',
      round: '3rd',
    });
  }

  return matches;
}

function getRoundLabel(slots: number, totalSize: number): string {
  if (slots === 2) return 'F';
  if (slots === 4) return 'SF';
  if (slots === 8) return 'QF';
  if (slots === 16) return 'R16';
  if (slots === 32) return 'R32';
  const roundNum = Math.log2(totalSize) - Math.log2(slots) + 1;
  return `R${roundNum}`;
}

export function simulateMatch(
  a: string,
  b: string
): { winnerId: string; scoreA: number; scoreB: number } {
  const scoreA = Math.floor(Math.random() * 5) + 1;
  const scoreB = Math.floor(Math.random() * 5) + 1;
  if (scoreA > scoreB) {
    return { winnerId: a, scoreA, scoreB };
  } else if (scoreB > scoreA) {
    return { winnerId: b, scoreA, scoreB };
  } else {
    // Tie - flip coin
    const winner = Math.random() < 0.5 ? a : b;
    return { winnerId: winner, scoreA, scoreB };
  }
}
