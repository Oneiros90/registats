export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank = 'jack' | 'queen' | 'king';

export interface Noble {
  id: number;
  rank: Rank;
  tierIndex: number;
  maxHealth: number;
  health: number;
  maxAttack: number;
  attack: number;
  suit: Suit | null;
}

export interface FloatingDelta {
  id: number;
  value: number;
  type: 'health' | 'attack';
  xOffset: number;
}

export interface SuitTheme {
  id: Suit | 'default' | 'dead';
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  bgDark: string;
  bgMid: string;
  bgLight: string;
  cardBg: string;
  border: string;
  swirlA: [number, number, number];
  swirlB: [number, number, number];
  swirlC: [number, number, number];
}

