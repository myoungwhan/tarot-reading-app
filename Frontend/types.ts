export interface CardData {
  name: string;
  type: 'major' | 'minor';
}

export interface CardInstance {
  id: string;
  data: CardData;
  isReversed: boolean;
  selectionIndex?: number;
}

export interface PlacedCard extends CardInstance {
  x: number;
  y: number;
  rotation: number; // 0 for vertical, 90 for horizontal
  isFlipped: boolean;
}

export interface SpreadLayoutPoint {
  position: number;
  label: string;
  x: number;
  y: number;
  rotation: number;
}

export interface SpreadDefinition {
  id: string;
  name: string;
  cardCount: number;
  layout: SpreadLayoutPoint[];
}

export type DeckStyle = 'universal-waite' | 'marseille' | 'thoth' | 'wild-unknown' | 'shadowscapes';

export type Role = 'counselor' | 'querent';

export type GameStep = 'lobby' | 'setup' | 'shuffling' | 'selecting' | 'reading';

export interface Settings {
  deckStyle: DeckStyle;
  deckBackClass: string;
  cardSet: 'major' | 'full';
  useReversals: boolean;
  spread: SpreadDefinition;
  customCardCount: number;
}

export interface SessionState {
  step: GameStep;
  settings: Settings;
  deck: CardInstance[];
  selectedCards: CardInstance[];
  placedCards: PlacedCard[];
  isAddingMore: boolean;
  showConfetti: boolean;
}