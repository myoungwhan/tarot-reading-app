import { CardData, SpreadDefinition, DeckStyle } from './types';

export const MAJOR_ARCANA: CardData[] = [
  { name: 'The Fool', type: 'major' }, { name: 'The Magician', type: 'major' }, { name: 'The High Priestess', type: 'major' },
  { name: 'The Empress', type: 'major' }, { name: 'The Emperor', type: 'major' }, { name: 'The Hierophant', type: 'major' },
  { name: 'The Lovers', type: 'major' }, { name: 'The Chariot', type: 'major' }, { name: 'Strength', type: 'major' },
  { name: 'The Hermit', type: 'major' }, { name: 'Wheel of Fortune', type: 'major' }, { name: 'Justice', type: 'major' },
  { name: 'The Hanged Man', type: 'major' }, { name: 'Death', type: 'major' }, { name: 'Temperance', type: 'major' },
  { name: 'The Devil', type: 'major' }, { name: 'The Tower', type: 'major' }, { name: 'The Star', type: 'major' },
  { name: 'The Moon', type: 'major' }, { name: 'The Sun', type: 'major' }, { name: 'Judgement', type: 'major' }, { name: 'The World', type: 'major' }
];

const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];

export const MINOR_ARCANA: CardData[] = SUITS.flatMap(suit =>
  RANKS.map(rank => ({ name: `${rank} of ${suit}`, type: 'minor' }))
);

export const FULL_DECK: CardData[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

export const DECK_STYLES: { id: DeckStyle; name: string; backClass: string }[] = [
  { id: 'universal-waite', name: 'Universal Waite', backClass: 'card-back-waite' },
  { id: 'marseille', name: 'Marseille', backClass: 'card-back-marseille' },
  { id: 'thoth', name: 'Thoth', backClass: 'card-back-thoth' },
  { id: 'wild-unknown', name: 'Wild Unknown', backClass: 'card-back-wild-unknown' },
  { id: 'shadowscapes', name: 'Shadowscapes', backClass: 'card-back-shadowscapes' },
];
    
// Utility to add backClass to deck data
export function addBackClassToDecks(decks: any[]): any[] {
  return decks.map(deck => {
    const style = DECK_STYLES.find(s => s.name === deck.name);
    return style ? { ...deck, backClass: style.backClass} : deck;
  });
}

export const SPREADS: { [key: string]: SpreadDefinition } = {
  'todays-fortune': {
    id: 'todays-fortune',
    name: '오늘의 운세 (Today\'s Fortune)',
    cardCount: 1,
    layout: [{ position: 1, label: 'Today', x: 50, y: 50, rotation: 0 }],
  },
  'past-present-future': {
    id: 'past-present-future',
    name: '과거 현재 미래 (Past, Present, Future)',
    cardCount: 3,
    layout: [
      { position: 1, label: 'Past', x: 25, y: 50, rotation: 0 },
      { position: 2, label: 'Present', x: 50, y: 50, rotation: 0 },
      { position: 3, label: 'Future', x: 75, y: 50, rotation: 0 },
    ],
  },
  'career': {
    id: 'career',
    name: '경력 스프레드 (Career Spread)',
    cardCount: 4,
    layout: [
        { position: 1, label: 'Current Role', x: 15, y: 50, rotation: 0 },
        { position: 2, label: 'Challenges', x: 38, y: 50, rotation: 0 },
        { position: 3, label: 'Opportunities', x: 61, y: 50, rotation: 0 },
        { position: 4, label: 'Future Path', x: 84, y: 50, rotation: 0 },
    ],
  },
  'relationship': {
    id: 'relationship',
    name: '관계 스프레드 (Relationship Spread)',
    cardCount: 5,
    layout: [
        { position: 1, label: 'You', x: 15, y: 60, rotation: 0 },
        { position: 2, label: 'Them', x: 35, y: 45, rotation: 0 },
        { position: 3, label: 'Connection', x: 55, y: 30, rotation: 0 },
        { position: 4, label: 'Challenges', x: 75, y: 45, rotation: 0 },
        { position: 5, label: 'Potential', x: 95, y: 60, rotation: 0 },
    ],
  },
   'full-moon': {
    id: 'full-moon',
    name: '보름달 스프레드 (Full Moon Spread)',
    cardCount: 7,
    layout: [
      { position: 1, label: 'Release', x: 50, y: 15, rotation: 0 },
      { position: 2, label: 'Keep', x: 25, y: 35, rotation: 0 },
      { position: 3, label: 'Learn', x: 75, y: 35, rotation: 0 },
      { position: 4, label: 'Past Self', x: 25, y: 65, rotation: 0 },
      { position: 5, label: 'Future Self', x: 75, y: 65, rotation: 0 },
      { position: 6, label: 'Guidance', x: 50, y: 85, rotation: 0 },
      { position: 7, label: 'Core Issue', x: 50, y: 50, rotation: 0 },
    ],
  },
  'celtic-cross': {
    id: 'celtic-cross',
    name: '켈틱 크로스 (Celtic Cross)',
    cardCount: 10,
    layout: [
      { position: 1, label: 'Present', x: 35, y: 50, rotation: 0 },
      { position: 2, label: 'Challenge', x: 35, y: 50, rotation: 90 },
      { position: 3, label: 'Past', x: 35, y: 75, rotation: 0 },
      { position: 4, label: 'Subconscious', x: 15, y: 50, rotation: 0 },
      { position: 5, label: 'Conscious', x: 35, y: 25, rotation: 0 },
      { position: 6, label: 'Future', x: 55, y: 50, rotation: 0 },
      { position: 7, label: 'Self', x: 80, y: 88, rotation: 0 },
      { position: 8, label: 'Environment', x: 80, y: 66, rotation: 0 },
      { position: 9, label: 'Hopes/Fears', x: 80, y: 44, rotation: 0 },
      { position: 10, label: 'Outcome', x: 80, y: 22, rotation: 0 },
    ],
  },
  'kabbalah': {
    id: 'kabbalah',
    name: '카발라 스프레드 (Kabbalah Spread)',
    cardCount: 10,
    layout: [
        { position: 1, label: 'Kether', x: 50, y: 10, rotation: 0 },
        { position: 2, label: 'Chokmah', x: 75, y: 25, rotation: 0 },
        { position: 3, label: 'Binah', x: 25, y: 25, rotation: 0 },
        { position: 4, label: 'Chesed', x: 75, y: 45, rotation: 0 },
        { position: 5, label: 'Geburah', x: 25, y: 45, rotation: 0 },
        { position: 6, label: 'Tiphareth', x: 50, y: 55, rotation: 0 },
        { position: 7, label: 'Netzach', x: 75, y: 65, rotation: 0 },
        { position: 8, label: 'Hod', x: 25, y: 65, rotation: 0 },
        { position: 9, label: 'Yesod', x: 50, y: 75, rotation: 0 },
        { position: 10, label: 'Malkuth', x: 50, y: 90, rotation: 0 },
    ],
  },
  'custom': {
    id: 'custom',
    name: '커스텀 스프레드 (Custom Spread)',
    cardCount: 1, // Placeholder, will be updated by user
    layout: [],
  },
};