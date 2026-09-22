import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Settings, Role, DeckStyle } from '../types';
import { addBackClassToDecks, DECK_STYLES, SPREADS } from '../constants';
import { useGetDecksQuery } from '@/services/api';
import { translations } from '../translations';

interface SetupScreenProps {
  onComplete: (settings: Settings) => void;
  currentSettings: Settings;
  role: Role;
  language: 'ko' | 'en';
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onComplete, currentSettings, role, language }) => {
  const t = translations[language];
  const [settings, setSettings] = useState<Settings>(currentSettings);
  const isCounselor = role === 'counselor';
  const { data: decks = [], isLoading, isError } = useGetDecksQuery();
  const [customCountValue, setCustomCountValue] = useState<string>(currentSettings.customCardCount.toString());

  const maxAllowedCards = settings.cardSet === 'major' ? 22 : 78;
  const parsedCustomCount = parseInt(customCountValue, 10);
  const isCountExceeded = !isNaN(parsedCustomCount) && parsedCustomCount > maxAllowedCards;
  const isCountTooLow = !isNaN(parsedCustomCount) && parsedCustomCount < 1;
  const isCustomCountInvalid = isNaN(parsedCustomCount) || isCountExceeded || isCountTooLow;

  console.log('SetupScreen initialized with settings',decks);

  const updatedDecks = useMemo(
    () => addBackClassToDecks(decks).filter(deck => deck.active),
    [decks]
  );

  // By Default the selected Deck will be Universal Waite or first active deck
  const defaultDeck = useMemo(
    () => updatedDecks?.find((deck) => deck.name === "Universal Waite") || updatedDecks?.[0],
    [updatedDecks]
  );

  const handleStart = () => {
    // Ensure the final settings are based on the input's current value.
    const finalCount = parseInt(customCountValue, 10);
    const maxAllowed = settings.cardSet === 'major' ? 22 : 78;
    if (settings.spread.id === 'custom') {
      if (isNaN(finalCount) || finalCount < 1 || finalCount > maxAllowed) {
        return;
      }
    }
    const validCount = !isNaN(finalCount) && finalCount > 0 ? Math.min(finalCount, maxAllowed) : 1;
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
    if (defaultDeck) {
      setSettings((prev) => {
        const hasValidSelection = updatedDecks.some(
          (d) => String(d.id) === String(prev.deckStyle)
        );
        if (hasValidSelection) return prev;
        const isBuiltIn = DECK_STYLES.some(s => s.name.toLowerCase() === defaultDeck.name?.toLowerCase());
        return {
          ...prev,
          deckStyle: defaultDeck.id,
          deckBackClass: defaultDeck.backClass || 'card-back-waite',
          deckImage: isBuiltIn ? undefined : (defaultDeck.image_url || defaultDeck.image || undefined),
        };
      });
    }
  }, [defaultDeck?.id, updatedDecks]);

  const handleDeckStyleChange = (deck: { id: any; name: string; backClass?: string; image_url?: string; image?: string }) => {
    if (!isCounselor) return;
    const isBuiltIn = DECK_STYLES.some(s => s.name.toLowerCase() === deck.name?.toLowerCase());
    setSettings(s => ({
      ...s,
      deckStyle: deck.id,
      deckBackClass: deck.backClass || 'card-back-waite',
      deckImage: isBuiltIn ? undefined : (deck.image_url || deck.image || undefined),
    }));
  };

  const setSpread = (spreadId: string) => {
    if (!isCounselor) return;
    const newSpread = SPREADS[spreadId];
    setSettings(prev => ({...prev, spread: newSpread}));
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-slate-800/50 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-amber-300 mb-6 font-serif">{t.setupTitle}</h2>
      <p className="text-center text-slate-400 mb-8">{t.setupDescription}</p>

      <div className="space-y-8">
        {/* Deck Style */}
        <div>
          <label className="block text-lg font-medium text-amber-200 mb-3">{t.deckStyleLabel}</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {updatedDecks.map(deck => (
              <button
                key={deck.id}
                onClick={() => handleDeckStyleChange(deck)}
                disabled={!isCounselor}
                className={`p-4 rounded-lg text-white font-semibold transition-all duration-200 border-2 flex flex-col items-center justify-center space-y-2 ${settings.deckStyle === deck.id ? 'border-amber-400 scale-105 shadow-lg' : 'border-transparent hover:border-amber-400/50'} bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span >{deck.name}</span>
                <div 
                  className={`w-12 h-20 rounded ${deck.backClass || ''} border border-amber-200/20`}
                  style={!deck.backClass && (deck.image_url || deck.image) ? { backgroundImage: `url(${deck.image_url || deck.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                ></div>
              </button>
            ))}
          </div>
        </div>

        {/* Card Set & Reversals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <label className="block text-lg font-medium text-amber-200 mb-3">{t.cardSetLabel}</label>
                <div className="flex space-x-4">
                    <button onClick={() => isCounselor && setSettings(s => ({...s, cardSet: 'major'}))} disabled={!isCounselor} className={`flex-1 p-3 rounded-lg transition-colors ${settings.cardSet === 'major' ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600'} disabled:opacity-50`}>{t.majorArcana}</button>
                    <button onClick={() => isCounselor && setSettings(s => ({...s, cardSet: 'full'}))} disabled={!isCounselor} className={`flex-1 p-3 rounded-lg transition-colors ${settings.cardSet === 'full' ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600'} disabled:opacity-50`}>{t.fullDeck}</button>
                </div>
            </div>
            <div>
                <label className="block text-lg font-medium text-amber-200 mb-3">{t.reversalsLabel}</label>
                <button onClick={() => isCounselor && setSettings(s => ({ ...s, useReversals: !s.useReversals }))} disabled={!isCounselor} className="w-full p-3 rounded-lg bg-slate-700 flex items-center justify-between disabled:opacity-50">
                    <span>{settings.useReversals ? t.reversalsYes : t.reversalsNo}</span>
                    <div className={`w-12 h-6 rounded-full flex items-center transition-colors ${settings.useReversals ? 'bg-amber-400' : 'bg-slate-600'}`}>
                        <span className={`block w-5 h-5 bg-white rounded-full transition-transform transform ${settings.useReversals ? 'translate-x-6' : 'translate-x-1'}`}></span>
                    </div>
                </button>
            </div>
        </div>

        {/* Spread Selection */}
        <div>
          <label className="block text-lg font-medium text-amber-200 mb-3">{t.spreadLabel}</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(SPREADS).map(spread => (
              <button
                key={spread.id}
                onClick={() => setSpread(spread.id)}
                disabled={!isCounselor}
                className={`p-3 rounded-lg text-center transition-colors ${settings.spread.id === spread.id ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600'} disabled:opacity-50`}
              >
                <p className="font-semibold">{spread.name[language]}</p>
                <p className="text-xs">{spread.id !== 'custom' ? `${spread.cardCount} ${t.cardsUnit}` : t.userDefined}</p>
              </button>
            ))}
          </div>
        </div>

        {settings.spread.id === 'custom' && (
            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600/50 transition-all">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="custom-count" className="block text-lg font-medium text-amber-200">
                    {t.customSpreadLabel}
                  </label>
                  <span className="text-xs sm:text-sm font-semibold text-amber-300/90 bg-slate-800 px-2.5 py-1 rounded-full border border-amber-300/30">
                    {t.customSpreadMaxNotice(maxAllowedCards)}
                  </span>
                </div>
                <input
                    type="number"
                    id="custom-count"
                    value={customCountValue}
                    onChange={handleCustomCountChange}
                    onBlur={handleCustomCountBlur}
                    disabled={!isCounselor}
                    min="1"
                    max={maxAllowedCards}
                    placeholder={`1 ~ ${maxAllowedCards}`}
                    className={`w-full p-3 rounded-lg bg-slate-900 border outline-none disabled:opacity-50 transition-colors ${
                      isCountExceeded || isCountTooLow
                        ? 'border-red-500 focus:ring-2 focus:ring-red-400 text-red-100'
                        : 'border-slate-600 focus:ring-2 focus:ring-amber-400 focus:border-amber-400'
                    }`}
                />
                {isCountExceeded && (
                  <div className="mt-3 p-3 rounded-lg bg-red-950/70 border border-red-500/60 flex items-center justify-between gap-2 text-red-200 text-sm animate-fade-in shadow-inner">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                      <span className="font-medium">
                        {settings.cardSet === 'major'
                          ? t.customCountMaxExceededMajor
                          : t.customCountMaxExceededFull}
                      </span>
                    </div>
                    {isCounselor && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCountValue(maxAllowedCards.toString());
                          setSettings(s => ({ ...s, customCardCount: maxAllowedCards }));
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-red-800/80 hover:bg-red-700 text-white rounded border border-red-400/50 transition-colors whitespace-nowrap shadow-sm"
                      >
                        {language === 'ko' ? `${maxAllowedCards}장으로 맞추기` : `Set to ${maxAllowedCards}`}
                      </button>
                    )}
                  </div>
                )}
                {isCountTooLow && (
                  <div className="mt-3 p-3 rounded-lg bg-red-950/70 border border-red-500/60 flex items-center gap-2 text-red-200 text-sm animate-fade-in shadow-inner">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                    <span className="font-medium">{t.customCountMinNotice}</span>
                  </div>
                )}
            </div>
        )}

      </div>
        <div className="mt-12 text-center">
            <button
                onClick={handleStart}
                disabled={!isCounselor || (settings.spread.id === 'custom' && isCustomCountInvalid)}
                className="px-12 py-4 bg-amber-500 text-slate-900 font-bold text-lg rounded-lg shadow-lg hover:bg-amber-400 transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
            >
                {t.startButton}
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