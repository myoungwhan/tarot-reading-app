export interface TarotDeck {
  id: string;
  name: string;
  active: boolean;
  totalCards: number;
  majorArcana: number;
  minorArcana: number;
  image: string;
  gradient: string;
  backClass?:string;
}

export const sampleDecks: TarotDeck[] = [
  {
    id: 'universal-waite',
    name: 'Universal Waite',
    active: true,
    totalCards: 78,
    majorArcana: 22,
    minorArcana: 56,
    image:
      'https://public.readdy.ai/ai/img_res/5eedc65e87160fe8ab81e4d82033b26c.jpg',
    gradient: 'from-purple-100 to-blue-100',
  },
  {
    id: 'marseille',
    name: 'Marseille',
    active: true,
    totalCards: 78,
    majorArcana: 22,
    minorArcana: 56,
    image:
      'https://public.readdy.ai/ai/img_res/7b77f6bc04e77c3f0575b2e506a6c6fa.jpg',
    gradient: 'from-red-100 to-yellow-100',
  },
  {
    id: 'thoth',
    name: 'Thoth',
    active: false,
    totalCards: 78,
    majorArcana: 22,
    minorArcana: 56,
    image:
      'https://public.readdy.ai/ai/img_res/5c07d03b91bdecd840569702b9af05c6.jpg',
    gradient: 'from-indigo-100 to-purple-100',
  },
  {
    id: 'wild-unknown',
    name: 'Wild Unknown',
    active: true,
    totalCards: 78,
    majorArcana: 22,
    minorArcana: 56,
    image:
      'https://public.readdy.ai/ai/img_res/f51160b90219fc8f572c4d326334485b.jpg',
    gradient: 'from-green-100 to-teal-100',
  },
  {
    id: 'shadowscapes',
    name: 'Shadowscapes',
    active: false,
    totalCards: 78,
    majorArcana: 22,
    minorArcana: 56,
    image:
      'https://public.readdy.ai/ai/img_res/882d0b06137a663690203c3a645bba5e.jpg',
    gradient: 'from-pink-100 to-purple-100',
  },
];
