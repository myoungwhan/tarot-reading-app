import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { TarotDeck } from '@/data/sampledecks';

export interface TarotCard {
  id: string;
  deck_id: string;
  name: string;
  category: 'major' | 'minor';
  image: string;
  // Add other card fields as needed
}

console.log('Tarot API initialized',import.meta.env.VITE_BACKEND_URL);
export const tarotApi = createApi({
  reducerPath: 'tarotApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api' }),
  tagTypes: ['Card', 'Deck'], // 👈 declare tags
  endpoints: (builder) => ({
    getDecks: builder.query<TarotDeck[], void>({
      query: () => 'decks/',
      providesTags: ['Deck'],
    }),
    getCards: builder.query<TarotCard[], { deck_id: string; category?: string }>({
      query: ({ deck_id, category }) => {
        let url = `cards?deck_id=${deck_id}`;
        if (category) url += `&category=${category}`;
        return url;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Card' as const, id })),
              { type: 'Card', id: 'LIST' },
            ]
          : [{ type: 'Card', id: 'LIST' }],
    }),
    updateCard: builder.mutation<TarotCard, Partial<TarotCard> & { id: string; image_file?: File }>({
      query: (data) => {
        const { id, image_file, ...put } = data;
        const formData = new FormData();
        Object.entries(put).forEach(([key, value]) => {
          if (value !== undefined) formData.append(key, value as string);
        });
        if (image_file) formData.append('image_file', image_file);
        return {
          url: `cards/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Card', id }, // invalidate this card
        { type: 'Card', id: 'LIST' }, // invalidate the list
      ],
    }),
    updateDeck: builder.mutation<TarotDeck, Partial<TarotDeck> & { id: string }>({
      query: (data) => {
        const { id, ...put } = data;
        return {
          url: `decks/${id}`,
          method: 'PUT',
          body: put,
        };
      },
      invalidatesTags: ['Deck'],
    }),
  }),
});

export const { useGetDecksQuery, useGetCardsQuery, useUpdateCardMutation, useUpdateDeckMutation } = tarotApi;
