import React, { useState, useEffect, useMemo } from 'react';
import { GameStep, Settings, CardInstance, Role, PlacedCard, CardData, SessionState } from './types';
import { SPREADS, FULL_DECK, MAJOR_ARCANA } from './constants';
import LobbyScreen from './components/LobbyScreen';
import SetupScreen from './components/SetupScreen';
import ShuffleScreen from './components/ShuffleScreen';
import SelectionScreen from './components/SelectionScreen';
import ReadingScreen from './components/ReadingScreen';
import { socket } from './services/socket';
import { useGetDecksQuery, useGetCardsQuery } from './services/api';
import _ from 'lodash';

const App: React.FC = () => {

  const [sessionState, setSessionState] = useState<SessionState>({
    step: 'lobby',
    settings: {
      deckStyle: 'universal-waite',
      deckBackClass: 'card-back-waite',
      cardSet: 'major',
      useReversals: false,
      spread: SPREADS['past-present-future'],
      customCardCount: 3,
    },
    deck: [],
    selectedCards: [],
    placedCards: [],
    isAddingMore: false,
    showConfetti: false,
  });

  const [role, setRole] = useState<Role | null>(null);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { data: decks = [], isLoading: decksLoading } = useGetDecksQuery();
  // Get the selected deck id from settings
  const selectedDeckId = sessionState.settings.deckStyle;
  // Fetch cards for the selected deck and cardSet (major/full)
  const { data: cardsFromBackend = [], isLoading: cardsLoading } = useGetCardsQuery({
    deck_id: selectedDeckId,
    category: sessionState.settings.cardSet === 'major' ? 'major' : undefined,
  }, { skip: !selectedDeckId });

  // Helper to map backend TarotCard to CardData
  const mapTarotCardToCardData = (card) => ({
    name: card.name,
    type: card.category,
    image_url: card.image_url,
    ...card,
  });
  // Socket connect/disconnect
  useEffect(() => {
    if (sessionCode && role) {
      socket.connect();
      return () => socket.disconnect();
    }
  }, [sessionCode, role]);

  // Handle incoming session and state updates
  useEffect(() => {
    socket.on('sessionJoined', ({ success, state, message }) => {
      if (success) {
        setSessionState(state);
        setErrorMessage('');
      } else {
        setErrorMessage(message || 'Failed to join session.');
      }
    });

    // Use a more robust deep equality check to prevent unnecessary state updates
    socket.on('stateUpdate', (newState) => {
      setSessionState(current => {
        if (!_.isEqual(current,newState)) {
          return newState;
        }
        return current;
      });
    });

    return () => {
      socket.off('sessionJoined');
      socket.off('stateUpdate');
    };
  }, []);


  // Only the counselor emits state updates for global transitions
  const prevSessionStateRef = React.useRef<SessionState | null>(null);
  useEffect(() => {
    if (role === 'counselor' && sessionCode) {
      const prevState = prevSessionStateRef.current;
      if (!_.isEqual(prevState, sessionState)) {
        socket.emit("stateUpdate", { sessionCode, newState: sessionState });
        prevSessionStateRef.current = sessionState;
      }
    }
  }, [sessionState, role, sessionCode, sessionState.isAddingMore]);

  useEffect(() => {
    console.log("sessionState.step",sessionState.step)
    if(sessionState.step === "reading" || sessionState.isAddingMore) {
      //If the session is in reading step then we need to update the counsellor's view
      socket.emit('stateUpdate', {sessionCode: sessionCode, newState: sessionState});
    }
  }, [role, sessionCode, sessionState.step, sessionState.isAddingMore]);

  // Confetti transition
  useEffect(() => {
    if (role === 'counselor' && sessionState.showConfetti) {
      const timer = setTimeout(() => {
        setSessionState(prev => ({ ...prev, step: 'selecting', showConfetti: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionState.showConfetti, role]);

  const handleStartCounselorSession = () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newSessionState: SessionState = {
      ...sessionState,
      step: 'setup',
    };

    setSessionCode(newCode);
    setRole('counselor');
    setSessionState(newSessionState);
    setErrorMessage('');

    socket.connect();
    socket.emit('join-session', {
      sessionCode: newCode,
      role: 'counselor',
      state: newSessionState
    });
  };

  const handleJoinQuerentSession = (inputCode: string) => {
    setSessionCode(inputCode);
    setRole('querent');
    setErrorMessage('');

    socket.connect();
    socket.emit("join-session", {
      sessionCode: inputCode,
      role: 'querent'
    });
  };

  const handleSetupComplete = (newSettings: Settings) => {
    setSessionState(prev => ({ ...prev, settings: newSettings, step: 'shuffling' }));

  };

  const handleShuffleComplete = () => {
    // Use cards fetched from backend for the selected deck
    if (!cardsFromBackend || cardsFromBackend.length === 0) {
      alert('No cards found for the selected deck.');
      return;
    }
    // Map backend cards to CardData
    const sourceDeck = cardsFromBackend.map(mapTarotCardToCardData);
    let tempDeck = [...sourceDeck];
    for (let i = tempDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tempDeck[i], tempDeck[j]] = [tempDeck[j], tempDeck[i]];
    }
    const newDeck = tempDeck.map(cardData => ({
      id: `${cardData.name}-${Math.random()}`,
      data: cardData,
      isReversed: sessionState.settings.useReversals && Math.random() > 0.5,
    }));
    setSessionState(prev => ({
      ...prev,
      deck: newDeck,
      showConfetti: true
    }));
  };

  const handleCardsSelected = (cards: CardInstance[]) => {
    const remainingDeck = sessionState.deck.filter(d => !cards.some(sc => sc.id === d.id));
    setSessionState(prev => ({
      ...prev,
      selectedCards: cards,
      deck: remainingDeck,
      step: 'reading'
    }));
  };

  const handleRequestAddMoreCards = () => {
    if (sessionState.deck.length > 0) {
      setSessionState(prev => ({ ...prev, isAddingMore: true }));
    }
  };

  const handleMoreCardsSelected = (newCards: CardInstance[]) => {
    if (newCards.length > 0) {
      const totalSelectedCount = sessionState.selectedCards.length;
      const newCardsWithIndex = newCards.map((card, i) => ({
        ...card,
        selectionIndex: totalSelectedCount + i + 1,
      }));
      const newSelectedCards = [...sessionState.selectedCards, ...newCardsWithIndex];
      const remainingDeck = sessionState.deck.filter(d => !newCards.some(sc => sc.id === d.id));
      setSessionState(prev => ({
        ...prev,
        selectedCards: newSelectedCards,
        deck: remainingDeck,
        isAddingMore: false,
      }));
    } else {
      setSessionState(prev => ({ ...prev, isAddingMore: false }));
    }
  };

  const handleReset = () => {
    if (role !== 'counselor') return;
    setSessionState(prev => ({
      ...prev,
      step: 'setup',
      deck: [],
      selectedCards: [],
      placedCards: [],
      isAddingMore: false,
      showConfetti: false,
    }));
  };

  const renderStep = () => {
    const { step, settings, deck, selectedCards, isAddingMore, placedCards, showConfetti } = sessionState;

    switch (step) {
      case 'lobby':
        return <LobbyScreen onStartCounselor={handleStartCounselorSession} onJoinQuerent={handleJoinQuerentSession} errorMessage={errorMessage} />;
      case 'setup':
        return <SetupScreen onComplete={handleSetupComplete} currentSettings={settings} role={role!} />;
      case 'shuffling':
        return <ShuffleScreen onShuffleComplete={handleShuffleComplete} showConfetti={showConfetti} role={role!} deckBackClass={settings.deckBackClass} />;
      case 'selecting':
        return <SelectionScreen deck={deck} onCardsSelected={handleCardsSelected} count={settings.spread.id === 'custom' ? settings.customCardCount : settings.spread.cardCount} role={role!} deckBackClass={settings.deckBackClass} />;
      case 'reading':
        return (
          <div className="relative w-full h-full">
            <ReadingScreen
              spread={settings.spread}
              initialSelectedCards={selectedCards}
              placedCards={placedCards}
              onPlacedCardsChange={(newPlacedCards) => setSessionState(prev => ({ ...prev, placedCards: newPlacedCards }))}
              onReset={handleReset}
              role={role!}
              deckBackClass={settings.deckBackClass}
              onRequestAddMoreCards={handleRequestAddMoreCards}
              remainingDeckSize={deck.length}
            />
            {isAddingMore && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col">
                <SelectionScreen
                  deck={deck}
                  onCardsSelected={handleMoreCardsSelected}
                  count={1}
                  role={role!}
                  deckBackClass={settings.deckBackClass}
                  prompt={role === 'querent' ? "Querent, please select 1 additional card." : "Waiting for querent to select a card..."}
                />
              </div>
            )}
          </div>
        );
      default:
        return <div>Invalid Step</div>;
    }
  };

  return (
    <div className="bg-[#1a1a2e] text-gray-200 min-h-screen w-full flex flex-col items-center p-4 selection:bg-amber-500/50">
      <div className="w-full max-w-7xl flex justify-between items-center mb-4 min-h-[52px]">
        <h1 className="text-3xl font-bold text-amber-300 font-serif">Interactive Tarot Reading</h1>
        {role === 'counselor' && sessionCode && sessionState.step !== 'lobby' && (
          <div className="flex items-center space-x-4 bg-slate-800/50 p-2 rounded-lg">
            <span className="text-sm font-medium">Session Code:</span>
            <span className="px-3 py-1 text-lg font-bold tracking-widest bg-slate-700 text-amber-300 rounded-md">{sessionCode}</span>
          </div>
        )}
        {role === 'querent' && sessionState.step !== 'lobby' && (
          <div className="flex items-center space-x-4 bg-slate-800/50 p-2 rounded-lg">
            <span className="text-sm font-medium">Joined as Querent</span>
          </div>
        )}
      </div>
      <div className="w-full flex-grow">
        {renderStep()}
      </div>
    </div>
  );
};

export default App;
