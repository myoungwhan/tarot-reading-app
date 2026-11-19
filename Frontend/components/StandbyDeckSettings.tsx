import React, { useEffect, useState } from 'react';
import {
  useGetDecksQuery,
  useGetStandbyDeckSettingsQuery,
  useUpdateStandbyDeckSettingsMutation,
} from '@/services/api';

const StandbyDeckSettings: React.FC = () => {
  const { data: decks, isLoading: decksLoading, isError: decksError } = useGetDecksQuery();
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useGetStandbyDeckSettingsQuery();
  const [saveSettings, { isLoading: isSaving }] = useUpdateStandbyDeckSettingsMutation();
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const savedDeckId = settings?.deckId == null ? '' : String(settings.deckId);
  const endpointMissing = settingsError && 'status' in settingsError && (
    settingsError.status === 404 ||
    (settingsError.status === 'PARSING_ERROR' && settingsError.originalStatus === 404)
  );

  useEffect(() => {
    setSelectedDeckId(savedDeckId);
  }, [savedDeckId]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(false);
    setError('');
    try {
      await saveSettings({ deckId: selectedDeckId ? Number(selectedDeckId) : null }).unwrap();
      setSaved(true);
    } catch (error: any) {
      setError(error?.status === 401
        ? 'Sign in as an admin to save this setting.'
        : error?.data?.error || 'Failed to save the standby deck setting.');
    }
  };

  return (
    <section aria-labelledby="standby-deck-heading" className="max-w-[90vw] ml-auto mb-10 rounded-xl border border-gray-200 bg-gray-50 p-6">
      <h2 id="standby-deck-heading" className="text-xl font-semibold text-gray-900 mb-2">Standby Screen</h2>
      <p id="standby-deck-description" className="mb-4 text-gray-600">
        Choose the card back shown on “Preparing the Session” while the querent waits.
      </p>
      {settingsLoading || decksLoading ? (
        <p role="status" className="text-gray-600">Loading standby deck setting…</p>
      ) : settingsError || decksError ? (
        <p role="alert" className="text-sm text-red-700">
          {endpointMissing
            ? 'The connected server needs the standby screen update before you can save a deck.'
            : 'Could not load the standby deck setting or deck list.'}
        </p>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="standby-deck" className="mb-2 block text-sm font-medium text-gray-700">Standby card back</label>
            <select
              id="standby-deck"
              aria-describedby="standby-deck-description"
              value={selectedDeckId}
              onChange={(event) => {
                setSelectedDeckId(event.target.value);
                setSaved(false);
                setError('');
              }}
              disabled={isSaving}
              className="min-h-11 w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#246596]"
            >
              <option value="">Use the session deck</option>
              {decks?.map((deck) => <option key={deck.id} value={deck.id}>{deck.name}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={isSaving || selectedDeckId === savedDeckId}
              className="min-h-11 rounded-lg bg-[#246596] px-4 py-2 font-medium text-white transition-colors hover:bg-[#1d527a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246596] disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Save Standby Deck'}
            </button>
            {saved && <p role="status" className="text-sm text-green-700">Standby deck saved.</p>}
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          </div>
        </form>
      )}
    </section>
  );
};

export default StandbyDeckSettings;
