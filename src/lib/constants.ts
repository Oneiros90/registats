import type { Noble, Rank, Suit } from '../types';

export const STORAGE_KEY = 'registats_game_state_v1';
export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANK_TIERS: Rank[] = ['jack', 'queen', 'king'];

export const RANK_LETTERS: Record<Rank, string> = {
  jack: 'J',
  queen: 'Q',
  king: 'K'
};

export const RANK_STATS: Record<Rank, { health: number; attack: number }> = {
  jack: { health: 20, attack: 10 },
  queen: { health: 30, attack: 15 },
  king: { health: 40, attack: 20 }
};

export interface FogParticle {
  id: number;
  left: string;
  top: string;
  tx: string;
  ty: string;
  delay: string;
  duration: string;
  size: string;
}

// Zero-gravity omnidirectional black fog particles expanding in all 360° directions
export const FOG_PARTICLES: FogParticle[] = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * Math.PI * 2 + (i % 3) * 0.18;
  const dist = 24 + (i % 4) * 9;
  const startX = 50 + Math.cos(angle) * (16 + (i % 3) * 10);
  const startY = 50 + Math.sin(angle) * (16 + (i % 3) * 10);
  const tx = Math.cos(angle) * dist;
  const ty = Math.sin(angle) * dist;
  return {
    id: i,
    left: `${startX.toFixed(1)}%`,
    top: `${startY.toFixed(1)}%`,
    tx: `${tx.toFixed(1)}px`,
    ty: `${ty.toFixed(1)}px`,
    delay: `${(i * 0.11).toFixed(2)}s`,
    duration: `${1.5 + (i % 5) * 0.32}s`,
    size: `${18 + (i % 4) * 7}px`
  };
});

// Reusable SVG path centered at (0, 0) within a ~32x32 box for the chosen suit
export const SUIT_PATHS: Record<Suit, string> = {
  hearts:
    'M 0 13 C 0 13 -13 4 -13 -5.5 C -13 -10.5 -9 -13.5 -5 -13.5 C -2.2 -13.5 -0.6 -11.8 0 -9.8 C 0.6 -11.8 2.2 -13.5 5 -13.5 C 9 -13.5 13 -10.5 13 -5.5 C 13 4 0 13 0 13 Z',
  diamonds:
    'M 0 -14 C 3 -8 7.5 -3.5 13 0 C 7.5 3.5 3 8 0 14 C -3 8 -7.5 3.5 -13 0 C -7.5 -3.5 -3 -8 0 -14 Z',
  clubs:
    'M 0 -14 C -3.8 -14 -6.8 -11 -6.8 -7.2 C -6.8 -5.4 -6 -3.8 -4.8 -2.7 C -5.9 -3.1 -7.1 -3.4 -8.4 -3.4 C -12.2 -3.4 -15.2 -0.4 -15.2 3.4 C -15.2 7.2 -12.2 10.2 -8.4 10.2 C -5.5 10.2 -3 8.4 -2 5.8 L -5 14.5 H 5 L 2 5.8 C 3 8.4 5.5 10.2 8.4 10.2 C 12.2 10.2 15.2 7.2 15.2 3.4 C 15.2 -0.4 12.2 -3.4 8.4 -3.4 C 7.1 -3.4 5.9 -3.1 4.8 -2.7 C 6 -3.8 6.8 -5.4 6.8 -7.2 C 6.8 -11 3.8 -14 0 -14 Z',
  spades:
    'M 0 -14 C 0 -14 -13 -3.5 -13 4.5 C -13 8.6 -9.8 11.5 -6 11.5 C -3.8 11.5 -2 10.3 -1.2 8.7 L -4.8 15 H 4.8 L 1.2 8.7 C 2 10.3 3.8 11.5 6 11.5 C 9.8 11.5 13 8.6 13 4.5 C 13 -3.5 0 -14 0 -14 Z'
};

export function createInitialNobles(): Noble[] {
  const list: Noble[] = [];
  let id = 0;
  for (const rank of RANK_TIERS) {
    const { health, attack } = RANK_STATS[rank];
    for (let tierIndex = 0; tierIndex < 4; tierIndex++) {
      list.push({
        id,
        rank,
        tierIndex,
        maxHealth: health,
        health,
        maxAttack: attack,
        attack,
        suit: null
      });
      id++;
    }
  }
  return list;
}

export function loadInitialState(): { nobles: Noble[]; selectedId: number } {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          Array.isArray(parsed.nobles) &&
          parsed.nobles.length === 12 &&
          typeof parsed.selectedId === 'number' &&
          parsed.selectedId >= 0 &&
          parsed.selectedId < 12
        ) {
          return {
            nobles: parsed.nobles,
            selectedId: parsed.selectedId
          };
        }
      }
    } catch {
      // Fallback to default state
    }
  }
  return {
    nobles: createInitialNobles(),
    selectedId: 0
  };
}

export function saveGameState(nobles: Noble[], selectedId: number): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ nobles, selectedId }));
    } catch {
      // Ignore quota errors
    }
  }
}

export function clearGameState(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
}

export function isSuitUsedByOther(suit: Suit, activeNoble: Noble, allNobles: Noble[]): boolean {
  return allNobles.some(
    (n) => n.rank === activeNoble.rank && n.id !== activeNoble.id && n.suit === suit
  );
}
