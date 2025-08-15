import React, { useState, useEffect } from 'react';
import { Settings, Role, DeckStyle } from '../types';
import { addBackClassToDecks, DECK_STYLES, SPREADS } from '../constants';
import { useGetDecksQuery } from '@/services/api';

interface SetupScreenProps {
  onComplete: (settings: Settings) => void;
  currentSettings: Settings;
  role: Role;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onComplete, currentSettings, role }) => {
  const [settings, setSettings] = useState<Settings>(currentSettings);
  const isCounselor = role === 'counselor';
  const { data: decks = [], isLoading, isError } = useGetDecksQuery();
    const [customCountValue, setCustomCountValue] = useState<string>(currentSettings.customCardCount.toString());

  console.log('SetupScreen initialized with settings',decks);

  const updatedDecks = addBackClassToDecks(decks).filter(deck => deck.active);

  //By Default the selected Deck will be Universal Waite
  const defaultDeck = updatedDecks?.find((deck) => deck.name === "Universal Waite");

  const handleStart = () => {
    // Ensure the final settings are based on the input's current value.
    const finalCount = parseInt(settings.customCardCount, 10);
    const validCount = !isNaN(finalCount) && finalCount > 0 ? finalCount : 1;
    onComplete({ ...settings, customCardCount: validCount });
  };

   const handleCustomCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isCounselor) return;
      const value = e.target.value;
      
      // Allow empty string or numbers
      setCustomCountValue(value);
  
      const num = parseInt(value, 10);
      if (!isNaN(num) && num > 0) {
        setSettings(s => ({...s, customCardCount: num}));
      }
    };

    const handleCustomCountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!isCounselor) return;
    const num = parseInt(e.target.value, 10);
    if (isNaN(num) || num < 1) {
      setCustomCountValue('1');
      setSettings(s => ({...s, customCardCount: 1}));
    }
  };

  useEffect(() => {
    setSettings((prevSettings) => ({...prevSettings, deckStyle:defaultDeck.id, deckBackClass: defaultDeck.backClass}))
  },[])

  const handleDeckStyleChange = (deck: {id: DeckStyle, name: string, backClass: string}) => {
    if (!isCounselor) return;
    setSettings(s => ({ ...s, deckStyle: deck.id, deckBackClass: deck.backClass }));
  };

  const setSpread = (spreadId: string) => {
    if (!isCounselor) return;
    const newSpread = SPREADS[spreadId];
    setSettings(prev => ({...prev, spread: newSpread}));
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-slate-800/50 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-amber-300 mb-6 font-serif">Session Setup</h2>
      <p className="text-center text-slate-400 mb-8">Counselor, please configure the reading session.</p>

      <div className="space-y-8">
        {/* Deck Style */}
        <div>
          <label className="block text-lg font-medium text-amber-200 mb-3">1. Choose Your Deck Style</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {updatedDecks.map(deck => (
              <button
                key={deck.id}
                onClick={() => handleDeckStyleChange(deck)}
                disabled={!isCounselor}
                className={`p-4 rounded-lg text-white font-semibold transition-all duration-200 border-2 flex flex-col items-center justify-center space-y-2 ${settings.deckStyle === deck.id ? 'border-amber-400 scale-105 shadow-lg' : 'border-transparent hover:border-amber-400/50'} bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span>{deck.name}</span>
                <div className={`w-12 h-20 rounded ${deck.backClass} border border-amber-200/20`}></div>
              </button>
            ))}
          </div>
        </div>

        {/* Card Set & Reversals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <label className="block text-lg font-medium text-amber-200 mb-3">2. Choose Card Set</label>
                <div className="flex space-x-4">
                    <button onClick={() => isCounselor && setSettings(s => ({...s, cardSet: 'major'}))} disabled={!isCounselor} className={`flex-1 p-3 rounded-lg transition-colors ${settings.cardSet === 'major' ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600'} disabled:opacity-50`}>22 Major Arcana</button>
                    <button onClick={() => isCounselor && setSettings(s => ({...s, cardSet: 'full'}))} disabled={!isCounselor} className={`flex-1 p-3 rounded-lg transition-colors ${settings.cardSet === 'full' ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600'} disabled:opacity-50`}>78 Full Deck</button>
                </div>
            </div>
            <div>
                <label className="block text-lg font-medium text-amber-200 mb-3">Include Reversed Cards?</label>
                <button onClick={() => isCounselor && setSettings(s => ({ ...s, useReversals: !s.useReversals }))} disabled={!isCounselor} className="w-full p-3 rounded-lg bg-slate-700 flex items-center justify-between disabled:opacity-50">
                    <span>{settings.useReversals ? 'Yes, include reversals' : 'No, only upright'}</span>
                    <div className={`w-12 h-6 rounded-full flex items-center transition-colors ${settings.useReversals ? 'bg-amber-400' : 'bg-slate-600'}`}>
                        <span className={`block w-5 h-5 bg-white rounded-full transition-transform transform ${settings.useReversals ? 'translate-x-6' : 'translate-x-1'}`}></span>
                    </div>
                </button>
            </div>
        </div>

        {/* Spread Selection */}
        <div>
          <label className="block text-lg font-medium text-amber-200 mb-3">3. Choose Your Spread</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(SPREADS).map(spread => (
              <button
                key={spread.id}
                onClick={() => setSpread(spread.id)}
                disabled={!isCounselor}
                className={`p-3 rounded-lg text-center transition-colors ${settings.spread.id === spread.id ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600'} disabled:opacity-50`}
              >
                <p className="font-semibold">{spread.name}</p>
                <p className="text-xs">{spread.id !== 'custom' ? `${spread.cardCount} cards` : 'User defined'}</p>
              </button>
            ))}
          </div>
        </div>

        {settings.spread.id === 'custom' && (
            <div className="bg-slate-700/50 p-4 rounded-lg">
                <label htmlFor="custom-count" className="block text-lg font-medium text-amber-200 mb-2">Custom Spread Card Count</label>
                 <input
                    type="number"
                    id="custom-count"
                    value={customCountValue}
                    onChange={handleCustomCountChange}
                    onBlur={handleCustomCountBlur}
                    disabled={!isCounselor}
                    min="1"
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-600 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none disabled:opacity-50"
                 />
            </div>
        )}

      </div>
        <div className="mt-12 text-center">
            <button
                onClick={handleStart}
                disabled={!isCounselor}
                className="px-12 py-4 bg-amber-500 text-slate-900 font-bold text-lg rounded-lg shadow-lg hover:bg-amber-400 transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
            >
                Start Session
            </button>
        </div>

       <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default SetupScreen;