
import React, { useState, useEffect, useRef } from 'react';
import { SpreadDefinition, CardInstance, PlacedCard, Role } from '../types';
import { TarotCard } from './TarotCard';

interface ReadingScreenProps {
  spread: SpreadDefinition;
  initialSelectedCards: CardInstance[];
  placedCards: PlacedCard[];
  onPlacedCardsChange: (cards: PlacedCard[]) => void;
  onReset: () => void;
  role: Role;
  deckBackClass: string;
  onRequestAddMoreCards: () => void;
  remainingDeckSize: number;
}

const ReadingScreen: React.FC<ReadingScreenProps> = ({
  spread,
  initialSelectedCards,
  placedCards,
  onPlacedCardsChange,
  onReset,
  role,
  deckBackClass,
  onRequestAddMoreCards,
  remainingDeckSize,
}) => {
  const [unplacedCards, setUnplacedCards] = useState<CardInstance[]>([]);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const isCounselor = role === 'counselor';
  const processedCardIds = useRef(new Set<string>());
  const isCustomSpread = spread.id === 'custom';

  const pinchDistanceRef = useRef<number | null>(null);
  const lastTouchPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // This effect runs to segregate initial cards into placed and unplaced piles.
    const allKnownCardIds = new Set([...placedCards.map(c => c.id), ...unplacedCards.map(c => c.id)]);
    const newCardsToAdd = initialSelectedCards.filter(c => !allKnownCardIds.has(c.id));

    if (newCardsToAdd.length === 0) return;
    
    // On first load for a non-custom spread, auto-place cards.
    if (placedCards.length === 0 && spread.id !== 'custom' && boardRef.current) {
        const boardRect = boardRef.current.getBoundingClientRect();
        const cardsForBoard: PlacedCard[] = [];
        const cardsForTray: CardInstance[] = [];

        newCardsToAdd.forEach((card) => {
            const layoutPoint = spread.layout.find(p => p.position === card.selectionIndex);
            if (layoutPoint) {
                cardsForBoard.push({
                    ...card,
                    x: (layoutPoint.x / 100) * boardRect.width - 60,
                    y: (layoutPoint.y / 100) * boardRect.height - 100,
                    rotation: layoutPoint.rotation,
                    isFlipped: false,
                });
            } else {
                cardsForTray.push(card);
            }
        });
        onPlacedCardsChange(cardsForBoard);
        setUnplacedCards(prev => [...prev, ...cardsForTray].sort((a,b) => (a.selectionIndex || 0) - (b.selectionIndex || 0)));
    } else {
        // For custom spreads or when adding more cards, they go to the unplaced tray.
        setUnplacedCards(prev => [...prev, ...newCardsToAdd].sort((a,b) => (a.selectionIndex || 0) - (b.selectionIndex || 0)));
    }
  }, [initialSelectedCards, spread.id]);
  
   // Sync unplaced cards if initialSelectedCards changes from parent
   useEffect(() => {
    const placedIds = new Set(placedCards.map(c => c.id));
    const currentUnplaced = initialSelectedCards.filter(c => !placedIds.has(c.id));
    setUnplacedCards(currentUnplaced.sort((a,b) => (a.selectionIndex || 0) - (b.selectionIndex || 0)));
  }, [initialSelectedCards, placedCards]);


  const handleWheel = (e: React.WheelEvent) => {
    if (!boardRef.current?.contains(e.target as Node)) return;
    e.preventDefault();

    const rect = boardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setView(prevView => {
      const oldScale = prevView.scale;
      const newScale = Math.max(0.3, Math.min(2, oldScale + e.deltaY * -0.001));
      
      const originX = rect.width / 2;
      const originY = rect.height / 2;
      
      const mouseFromOriginX = mouseX - originX;
      const mouseFromOriginY = mouseY - originY;
      
      const contentMouseX = (mouseFromOriginX - prevView.x) / oldScale;
      const contentMouseY = (mouseFromOriginY - prevView.y) / oldScale;
      
      const newX = mouseFromOriginX - (contentMouseX * newScale);
      const newY = mouseFromOriginY - (contentMouseY * newScale);

      return { scale: newScale, x: newX, y: newY };
    });
  };

  const handleBoardMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && isCounselor) {
      setIsPanning(true);
      document.body.style.cursor = 'grabbing';
    }
  };

  const handleCardMouseDown = (e: React.MouseEvent, cardId: string) => {
    if (!isCounselor) return;
    e.preventDefault();
    document.body.style.cursor = 'grabbing';
    setDraggingCardId(cardId);
    
    // Move card to the top of the render stack
    const cardToMove = placedCards.find(c => c.id === cardId);
    if (cardToMove && placedCards[placedCards.length - 1].id !== cardId) {
        const otherCards = placedCards.filter(c => c.id !== cardId);
        onPlacedCardsChange([...otherCards, cardToMove]);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingCardId && isCounselor) {
      const deltaX = e.movementX / view.scale;
      const deltaY = e.movementY / view.scale;
      const newPlacedCards = placedCards.map(c => 
          c.id === draggingCardId ? { ...c, x: c.x + deltaX, y: c.y + deltaY } : c
      );
      onPlacedCardsChange(newPlacedCards);
    } else if (isPanning) {
      setView(prev => ({ ...prev, x: prev.x + e.movementX, y: prev.y + e.movementY }));
    }
  };
  
  const handleMouseUp = () => {
    if (draggingCardId) {
      document.body.style.cursor = 'default';
      setDraggingCardId(null);
    }
    if (isPanning) {
      setIsPanning(false);
      document.body.style.cursor = 'default';
    }
  };

  const handleBoardTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && boardRef.current) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      pinchDistanceRef.current = dist;
      setIsPanning(false);
      setDraggingCardId(null); // Cancel drag on pinch
    } else if (e.touches.length === 1) {
      const cardElement = (e.target as HTMLElement).closest<HTMLElement>('[data-card-id]');
      const cardId = cardElement?.dataset.cardId;

      if (cardId && isCounselor) {
        // Start card drag for counselor
        e.preventDefault();
        setDraggingCardId(cardId);
        lastTouchPointRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        // Move card to top of render stack
        const cardToMove = placedCards.find(c => c.id === cardId);
        if (cardToMove && placedCards[placedCards.length - 1]?.id !== cardId) {
            const otherCards = placedCards.filter(c => c.id !== cardId);
            onPlacedCardsChange([...otherCards, cardToMove]);
        }
      } else {
        // Start board pan for both roles
        e.preventDefault();
        setIsPanning(true);
        lastTouchPointRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }
  };

  const handleBoardTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDistanceRef.current && boardRef.current) {
      // Handle pinch-to-zoom for both roles
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const newDist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const scaleChange = newDist / pinchDistanceRef.current;
      pinchDistanceRef.current = newDist;

      const rect = boardRef.current.getBoundingClientRect();
      const pinchCenterX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
      const pinchCenterY = (touch1.clientY + touch2.clientY) / 2 - rect.top;

      setView((prevView) => {
        const newScale = Math.max(0.3, Math.min(2, prevView.scale * scaleChange));
        const oldScale = prevView.scale;
        const mouseFromOriginX = pinchCenterX - rect.width / 2;
        const mouseFromOriginY = pinchCenterY - rect.height / 2;
        const contentMouseX = (mouseFromOriginX - prevView.x) / oldScale;
        const contentMouseY = (mouseFromOriginY - prevView.y) / oldScale;
        const newX = mouseFromOriginX - contentMouseX * newScale;
        const newY = mouseFromOriginY - contentMouseY * newScale;
        return { scale: newScale, x: newX, y: newY };
      });
    } else if (e.touches.length === 1 && lastTouchPointRef.current) {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouchPointRef.current.x;
        const deltaY = touch.clientY - lastTouchPointRef.current.y;
        
        if (draggingCardId && isCounselor) { // Card drag is counselor-only
            onPlacedCardsChange(placedCards.map(c => 
                c.id === draggingCardId ? { ...c, x: c.x + (deltaX / view.scale), y: c.y + (deltaY / view.scale) } : c
            ));
        } else if (isPanning) { // Panning is for both roles
            setView((prev) => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
        }

        lastTouchPointRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleBoardTouchEnd = (e: React.TouchEvent) => {
    if (draggingCardId) {
        setDraggingCardId(null);
    }
    if (e.touches.length < 2) {
      pinchDistanceRef.current = null;
    }
    if (e.touches.length < 1) {
      setIsPanning(false);
      lastTouchPointRef.current = null;
    }
  };

  const placeNextCard = (cardToPlace: CardInstance) => {
     if(!isCounselor || !boardRef.current) return;
     const boardRect = boardRef.current.getBoundingClientRect();
     const centerX = (boardRect.width / 2 - view.x) / view.scale - 60;
     const centerY = (boardRect.height / 2 - view.y) / view.scale - 100;
     
     const newPlacedCard: PlacedCard = {
         ...cardToPlace,
         x: centerX,
         y: centerY,
         rotation: 0,
         isFlipped: false,
     };
     onPlacedCardsChange([...placedCards, newPlacedCard]);
  };
  
  const flipCard = (id: string) => {
    if (!isCounselor) return;
    onPlacedCardsChange(placedCards.map(c => c.id === id ? { ...c, isFlipped: !c.isFlipped } : c));
  };
  
  const flipAll = () => {
    if (!isCounselor) return;
    onPlacedCardsChange(placedCards.map(c => ({...c, isFlipped: true})));
  };
  
  const toggleRotation = (id: string) => {
    if (!isCounselor) return;
    onPlacedCardsChange(placedCards.map(c => {
      if (c.id === id) {
        // Cycle rotation: 0 -> 90 -> 180 -> 0
        const newRotation = c.rotation === 0 ? 90 : c.rotation === 90 ? 180 : 0;
        return { ...c, rotation: newRotation };
      }
      return c;
    }));
  };
  
  return (
    <div className="w-full h-[85vh] flex flex-col" onWheel={handleWheel}>
      <div className="flex-shrink-0 p-3 bg-slate-900/70 rounded-t-lg flex items-center justify-between z-10">
        <div>
          <h3 className="text-xl font-bold text-amber-300 font-serif">{spread.name}</h3>
          <p className="text-sm text-slate-400">{isCounselor ? 'You are in control. Use mouse/touch to interact.' : 'The counselor is conducting the reading.'}</p>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={() => isCounselor && onRequestAddMoreCards()} disabled={!isCounselor || remainingDeckSize < 1} className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Add 1 Card</button>
            <button onClick={flipAll} disabled={!isCounselor} className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-md disabled:opacity-50">Flip All</button>
            <button onClick={() => isCounselor && onReset()} disabled={!isCounselor} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-md disabled:opacity-50">Reset Session</button>
        </div>
      </div>
      
      <div 
        ref={boardRef} 
        className="flex-grow bg-slate-800/60 border-x-2 border-b-2 border-slate-700 rounded-b-lg overflow-hidden relative touch-none"
        onMouseDown={handleBoardMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleBoardTouchStart}
        onTouchMove={handleBoardTouchMove}
        onTouchEnd={handleBoardTouchEnd}
      >
        <div 
            className="absolute top-0 left-0 w-full h-full" 
            style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transformOrigin: 'center center' }}
        >
          {!isCustomSpread && spread.layout.map(p => (
            <div key={p.position} className="absolute border-2 border-dashed border-slate-600 rounded-xl" style={{
              left: `${p.x}%`, 
              top: `${p.y}%`,
              width: p.rotation === 90 ? '200px' : '120px',
              height: p.rotation === 90 ? '120px' : '200px',
              transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
              pointerEvents: 'none',
            }}>
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-slate-500 text-sm whitespace-nowrap">{p.position}. {p.label}</span>
            </div>
          ))}

          {placedCards.map((card, index) => (
            <div
                key={card.id}
                data-is-placed-card="true"
                data-card-id={card.id}
                className={`absolute ${isCounselor ? (draggingCardId === card.id ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
                style={{
                  left: `${card.x}px`,
                  top: `${card.y}px`,
                  zIndex: draggingCardId === card.id ? placedCards.length + 10 : index + 10,
                  width: '120px',
                  height: '200px',
                  transform: `rotate(${card.rotation}deg)`,
                  transformOrigin: 'center center',
                }}
                onMouseDown={(e) => handleCardMouseDown(e, card.id)}
                onContextMenu={(e) => { e.preventDefault(); isCounselor && toggleRotation(card.id); }}
            >
                <TarotCard
                    card={card}
                    isFlipped={card.isFlipped}
                    deckBackClass={deckBackClass}
                    showNumber={card.selectionIndex}
                    onFlip={isCounselor ? () => flipCard(card.id) : undefined}
                />
            </div>
          ))}
        </div>
      </div>
      
      {unplacedCards.length > 0 && isCounselor && (
         <div className="flex-shrink-0 mt-4 p-3 bg-slate-900/70 rounded-lg">
            <h4 className="text-lg font-semibold text-amber-200 mb-2">Unplaced Cards (Click to place on board)</h4>
            <div className="flex items-center justify-center min-h-[120px]">
                <div className="relative h-[100px]" style={{ width: `${unplacedCards.length > 0 ? 60 + (unplacedCards.length - 1) * 30 : 0}px`, transition: 'width 0.3s ease' }}>
                    {unplacedCards.map((card, index) => (
                        <div
                            key={card.id}
                            className={`absolute transition-all duration-500 ease-out cursor-pointer`}
                            style={{
                                top: 0,
                                left: `${index * 30}px`,
                                zIndex: index,
                                transform: isCustomSpread ? 'scale(0.5)' : 'scale(0.5)',
                                transformOrigin: 'top left',
                            }}
                            onClick={() => placeNextCard(card)}
                        >
                            <div className="transition-transform hover:scale-105">
                                <TarotCard
                                    card={card}
                                    isFlipped={false}
                                    deckBackClass={deckBackClass}
                                    showNumber={card.selectionIndex}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default ReadingScreen;