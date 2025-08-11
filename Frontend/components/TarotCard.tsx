
import React from 'react';
import { CardInstance, PlacedCard } from '../types';

interface TarotCardProps {
  card: CardInstance | PlacedCard;
  isFlipped: boolean;
  deckBackClass: string;
  onFlip?: () => void;
  style?: React.CSSProperties;
  showNumber?: number;
}

export const TarotCard: React.FC<TarotCardProps> = ({ card, isFlipped, deckBackClass, onFlip, style, showNumber }) => {
  // Use onMouseDown and stop propagation to prevent triggering drag events on the parent.
  const handleFlipClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onFlip?.();
  };

  const FlipButton = () => (
    <div
      // Use onMouseDown to ensure this event fires before the parent's drag handler.
      onMouseDown={handleFlipClick} 
      className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900/70 rounded-full cursor-pointer flex items-center justify-center border border-white/30 hover:bg-slate-900/90 transition-colors z-20"
      title="Flip Card"
    >
       <svg className="h-5 w-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    </div>
  );

  return (
    <div
      className={`relative w-[120px] h-[200px] card-container ${isFlipped ? 'is-flipped' : ''}`}
      style={style}
    >
      <div className="card-flipper">
        {/* Card Back */}
        <div 
          className={`card-face shadow-lg border-2 border-amber-200/50 flex items-center justify-center p-2 ${deckBackClass}`}
        >
          <div className="w-full h-full border-2 border-amber-200/50 rounded-lg flex items-center justify-center">
             {showNumber && !isFlipped && (
              <span className="text-4xl font-bold text-amber-100 drop-shadow-lg" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>{showNumber}</span>
            )}
          </div>
          {/* Render button on the back face */}
          {onFlip && <FlipButton />}
        </div>
        
        {/* Card Front */}
        <div 
          className="card-face card-face-front bg-slate-900 shadow-lg border-2 border-amber-300 p-2" 
        >
          <div className={`w-full h-full bg-slate-800 rounded-lg flex flex-col items-center justify-center p-2 text-center transition-transform duration-300 ${card.isReversed ? 'rotate-180' : ''}`}>
             <img src={card.data.image_url} alt={card.data.name} className="w-[90px] h-[130px] object-cover rounded-md mb-2"/>
            <p className="text-amber-100 text-xs font-serif">{card.data.name}</p>
          </div>
           {/* Render button on the front face */}
          {onFlip && <FlipButton />}
        </div>
      </div>
    </div>
  );
};
