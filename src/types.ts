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
