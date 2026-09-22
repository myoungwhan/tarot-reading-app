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
    name: { ko: '오늘의 운세', en: "Today's Fortune" },
    cardCount: 1,
    layout: [{ position: 1, label: { ko: '오늘', en: 'Today' }, x: 50, y: 50, rotation: 0 }],
  },
  'past-present-future': {
    id: 'past-present-future',
    name: { ko: '과거 현재 미래', en: 'Past, Present, Future' },
    cardCount: 3,
    layout: [
      { position: 1, label: { ko: '과거', en: 'Past' }, x: 25, y: 50, rotation: 0 },
      { position: 2, label: { ko: '현재', en: 'Present' }, x: 50, y: 50, rotation: 0 },
      { position: 3, label: { ko: '미래', en: 'Future' }, x: 75, y: 50, rotation: 0 },
    ],
  },
  'career': {
    id: 'career',
    name: { ko: '경력 스프레드', en: 'Career Spread' },
    cardCount: 4,
    layout: [
        { position: 1, label: { ko: '현재 역할', en: 'Current Role' }, x: 15, y: 50, rotation: 0 },
        { position: 2, label: { ko: '도전 과제', en: 'Challenges' }, x: 38, y: 50, rotation: 0 },
        { position: 3, label: { ko: '기회', en: 'Opportunities' }, x: 61, y: 50, rotation: 0 },
        { position: 4, label: { ko: '미래 경로', en: 'Future Path' }, x: 84, y: 50, rotation: 0 },
    ],
  },
  'relationship': {
    id: 'relationship',
    name: { ko: '관계 스프레드', en: 'Relationship Spread' },
    cardCount: 5,
    layout: [
        { position: 1, label: { ko: '당신', en: 'You' }, x: 15, y: 60, rotation: 0 },
        { position: 2, label: { ko: '상대방', en: 'Them' }, x: 35, y: 45, rotation: 0 },
        { position: 3, label: { ko: '연결', en: 'Connection' }, x: 55, y: 30, rotation: 0 },
        { position: 4, label: { ko: '도전 과제', en: 'Challenges' }, x: 75, y: 45, rotation: 0 },
        { position: 5, label: { ko: '잠재력', en: 'Potential' }, x: 95, y: 60, rotation: 0 },
    ],
  },
   'full-moon': {
    id: 'full-moon',
    name: { ko: '보름달 스프레드', en: 'Full Moon Spread' },
    cardCount: 7,
    layout: [
      { position: 1, label: { ko: '놓아줄 것', en: 'Release' }, x: 50, y: 15, rotation: 0 },
      { position: 2, label: { ko: '유지할 것', en: 'Keep' }, x: 25, y: 35, rotation: 0 },
      { position: 3, label: { ko: '배울 것', en: 'Learn' }, x: 75, y: 35, rotation: 0 },
      { position: 4, label: { ko: '과거의 나', en: 'Past Self' }, x: 25, y: 65, rotation: 0 },
      { position: 5, label: { ko: '미래의 나', en: 'Future Self' }, x: 75, y: 65, rotation: 0 },
      { position: 6, label: { ko: '지침', en: 'Guidance' }, x: 50, y: 85, rotation: 0 },
      { position: 7, label: { ko: '핵심 문제', en: 'Core Issue' }, x: 50, y: 50, rotation: 0 },
    ],
  },
  'celtic-cross': {
    id: 'celtic-cross',
    name: { ko: '켈틱 크로스', en: 'Celtic Cross' },
    cardCount: 10,
    layout: [
      { position: 1, label: { ko: '현재', en: 'Present' }, x: 35, y: 50, rotation: 0 },
      { position: 2, label: { ko: '도전', en: 'Challenge' }, x: 35, y: 50, rotation: 90 },
      { position: 3, label: { ko: '과거', en: 'Past' }, x: 35, y: 75, rotation: 0 },
      { position: 4, label: { ko: '잠재의식', en: 'Subconscious' }, x: 15, y: 50, rotation: 0 },
      { position: 5, label: { ko: '의식', en: 'Conscious' }, x: 35, y: 25, rotation: 0 },
      { position: 6, label: { ko: '미래', en: 'Future' }, x: 55, y: 50, rotation: 0 },
      { position: 7, label: { ko: '자신', en: 'Self' }, x: 80, y: 88, rotation: 0 },
      { position: 8, label: { ko: '환경', en: 'Environment' }, x: 80, y: 66, rotation: 0 },
      { position: 9, label: { ko: '희망/두려움', en: 'Hopes/Fears' }, x: 80, y: 44, rotation: 0 },
      { position: 10, label: { ko: '결과', en: 'Outcome' }, x: 80, y: 22, rotation: 0 },
    ],
  },
  'kabbalah': {
    id: 'kabbalah',
    name: { ko: '카발라 스프레드', en: 'Kabbalah Spread' },
    cardCount: 10,
    layout: [
        { position: 1, label: { ko: '케테르', en: 'Kether' }, x: 50, y: 10, rotation: 0 },
        { position: 2, label: { ko: '호크마', en: 'Chokmah' }, x: 75, y: 25, rotation: 0 },
        { position: 3, label: { ko: '비나', en: 'Binah' }, x: 25, y: 25, rotation: 0 },
        { position: 4, label: { ko: '헤세드', en: 'Chesed' }, x: 75, y: 45, rotation: 0 },
        { position: 5, label: { ko: '게부라', en: 'Geburah' }, x: 25, y: 45, rotation: 0 },
        { position: 6, label: { ko: '티페레트', en: 'Tiphareth' }, x: 50, y: 55, rotation: 0 },
        { position: 7, label: { ko: '네짜흐', en: 'Netzach' }, x: 75, y: 65, rotation: 0 },
        { position: 8, label: { ko: '호드', en: 'Hod' }, x: 25, y: 65, rotation: 0 },
        { position: 9, label: { ko: '예소드', en: 'Yesod' }, x: 50, y: 75, rotation: 0 },
        { position: 10, label: { ko: '말쿠트', en: 'Malkuth' }, x: 50, y: 90, rotation: 0 },
    ],
  },
  'custom': {
    id: 'custom',
    name: { ko: '커스텀 스프레드', en: 'Custom Spread' },
    cardCount: 1, // Placeholder, will be updated by user
    layout: [],
  },
};