

import React, { useState, useEffect, useRef } from 'react';
import { CardInstance, Role } from '../types';
import { TarotCard } from './TarotCard';

interface SelectionScreenProps {
  deck: CardInstance[];
  onCardsSelected: (cards: CardInstance[]) => void;
  count: number;
  role: Role;
  deckBackClass: string;
  prompt?: string;
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({ deck, onCardsSelected, count, role, deckBackClass, prompt }) => {
  const [selected, setSelected] = useState<CardInstance[]>([]);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isQuerent = role === 'querent';
  const pinchDistanceRef = useRef<number | null>(null);
  const lastTouchPointRef = useRef<{ x: number, y: number } | null>(null);
  const hoverClearTimerRef = useRef<number | null>(null);

  const unselectedDeck = deck.filter(d => !selected.some(s => s.id === d.id));

  const handleSelectCard = (card: CardInstance) => {
    if (isQuerent && selected.length < count && !selected.find(c => c.id === card.id)) {
      const newCardWithIndex: CardInstance = {
        ...card,
        selectionIndex: selected.length + 1,
      };
      setSelected(prev => [...prev, newCardWithIndex]);
    }
  };
  
  useEffect(() => {
    if (selected.length === count) {
      setTimeout(() => onCardsSelected(selected), 500);
    }
  }, [selected, count, onCardsSelected]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hoverClearTimerRef.current) {
        clearTimeout(hoverClearTimerRef.current);
      }
    };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setView(prevView => {
      const oldScale = prevView.scale;
      const newScale = Math.max(0.5, Math.min(2.5, oldScale + e.deltaY * -0.001));
      
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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Pan only when clicking the background
    if (e.target === e.currentTarget) {
      setIsPanning(true);
      e.currentTarget.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setView(prev => ({ ...prev, x: prev.x + e.movementX, y: prev.y + e.movementY }));
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      e.currentTarget.style.cursor = 'default';
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // When a new touch begins, cancel any pending timer that would clear the hover state.
    // This allows a user to tap on a card that is temporarily hovered.
    if (hoverClearTimerRef.current) {
      clearTimeout(hoverClearTimerRef.current);
      hoverClearTimerRef.current = null;
    }

    if (e.touches.length === 2 && containerRef.current) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
        pinchDistanceRef.current = dist;
        setIsPanning(false);
        if (hoveredCardId) setHoveredCardId(null);
    } else if (e.touches.length === 1) {
        const cardWrapper = (e.target as HTMLElement).closest<HTMLElement>('[data-card-id]');
        
        if (isQuerent) {
            const cardId = cardWrapper?.dataset.cardId || null;
            setHoveredCardId(cardId);
        }

        if (!cardWrapper) {
            e.preventDefault();
            setIsPanning(true);
            lastTouchPointRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 2 && pinchDistanceRef.current && containerRef.current) {
          e.preventDefault();
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const newDist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
          const scaleChange = newDist / pinchDistanceRef.current;
          pinchDistanceRef.current = newDist;

          const rect = containerRef.current.getBoundingClientRect();
          const pinchCenterX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
          const pinchCenterY = (touch1.clientY + touch2.clientY) / 2 - rect.top;

          setView(prevView => {
              const oldScale = prevView.scale;
              const newScale = Math.max(0.5, Math.min(2.5, oldScale * scaleChange));
              
              const mouseFromOriginX = pinchCenterX - (rect.width / 2);
              const mouseFromOriginY = pinchCenterY - (rect.height / 2);
              
              const contentMouseX = (mouseFromOriginX - prevView.x) / oldScale;
              const contentMouseY = (mouseFromOriginY - prevView.y) / oldScale;
              
              const newX = mouseFromOriginX - (contentMouseX * newScale);
              const newY = mouseFromOriginY - (contentMouseY * newScale);
              return { scale: newScale, x: newX, y: newY };
          });
          return;
      }
      
      if (e.touches.length === 1) {
          const touch = e.touches[0];
          
          if (isQuerent) {
              const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
              const cardWrapper = elementUnderTouch?.closest<HTMLElement>('[data-card-id]');
              const cardId = cardWrapper?.dataset.cardId || null;
              if (hoveredCardId !== cardId) {
                  setHoveredCardId(cardId);
              }
          }

          if (isPanning && lastTouchPointRef.current) {
              e.preventDefault();
              const deltaX = touch.clientX - lastTouchPointRef.current.x;
              const deltaY = touch.clientY - lastTouchPointRef.current.y;
              lastTouchPointRef.current = { x: touch.clientX, y: touch.clientY };
              setView(prev => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
          }
      }
  };
  
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
      // If a card was being hovered when the user lifted their finger,
      // keep it hovered for a short duration to allow for a selection tap.
      if (hoveredCardId) {
        if (hoverClearTimerRef.current) {
          clearTimeout(hoverClearTimerRef.current);
        }
        hoverClearTimerRef.current = window.setTimeout(() => {
          setHoveredCardId(null);
          hoverClearTimerRef.current = null;
        }, 1000); // Keep hovered for 1 second.
      }
      
      if (e.touches.length < 2) {
          pinchDistanceRef.current = null;
      }
      if (e.touches.length < 1) {
          if (isPanning) {
              setIsPanning(false);
              lastTouchPointRef.current = null;
          }
      }
  };


  const fanAngle = Math.min(120, unselectedDeck.length * 4);
  const anglePerCard = unselectedDeck.length > 1 ? fanAngle / (unselectedDeck.length - 1) : 0;
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-start">
      <div className="flex-shrink-0 py-4 text-center">
        <h2 className="text-3xl font-bold text-amber-300 mb-2 font-serif">
          {prompt || (isQuerent ? `Please Select ${count} Card(s)` : 'Waiting for Querent to Select Cards')}
        </h2>
        <p className="text-slate-400">Selected: <span className="text-amber-300 text-xl">{selected.length} / {count}</span>. Use mouse wheel or pinch to zoom.</p>
      </div>
      
      {/* Fan Area */}
      <div 
        ref={containerRef}
        className="flex-grow w-full flex items-center justify-center overflow-hidden touch-none" 
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="relative w-full h-full flex items-center justify-center" 
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        >
           <div className="relative w-[800px] h-[400px]">
              {unselectedDeck.map((card, i) => {
                const rotation = (i - (unselectedDeck.length - 1) / 2) * anglePerCard;
                const isHovered = isQuerent && card.id === hoveredCardId;
                
                const transform = `rotate(${rotation}deg) translateY(${isHovered ? -170 : -150}px)`;

                return (
                    <div
                        key={card.id}
                        data-is-card-wrapper="true"
                        data-card-id={card.id}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"
                        style={{
                          transform: transform,
                          transformOrigin: 'bottom center',
                          zIndex: isHovered ? 100 : i,
                          transition: 'transform 0.2s ease-out',
                          cursor: isQuerent ? 'pointer' : 'default',
                        }}
                        onMouseEnter={() => isQuerent && setHoveredCardId(card.id)}
                        onMouseLeave={() => isQuerent && setHoveredCardId(null)}
                        onClick={() => handleSelectCard(card)}
                    >
                        <TarotCard
                            card={card}
                            isFlipped={false}
                            deckBackClass={deckBackClass}
                        />
                    </div>
                );
              })}
           </div>
        </div>
      </div>

      {/* Selected Cards Area */}
      <div className="flex-shrink-0 w-full h-[140px] flex items-center justify-center p-4 bg-slate-900/40 border-t-2 border-slate-700">
        <div className="relative h-[100px]" style={{ width: `${selected.length > 0 ? 60 + (selected.length - 1) * 6 : 300}px`, transition: 'width 0.3s ease' }}>
          {selected.length === 0 && (
            <div className="flex items-center justify-center h-full w-full border-2 border-dashed border-slate-600 rounded-xl">
              <p className="text-slate-500">Your selected cards appear here</p>
            </div>
          )}
          {selected.map((card, index) => (
            <div
              key={card.id}
              className="absolute transition-all duration-500 ease-out"
              style={{
                top: 0,
                left: `${index * 6}px`, 
                zIndex: index,
                transform: 'scale(0.5)',
                transformOrigin: 'top left',
              }}
            >
              <TarotCard
                card={card}
                isFlipped={false}
                deckBackClass={deckBackClass}
                showNumber={card.selectionIndex}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectionScreen;