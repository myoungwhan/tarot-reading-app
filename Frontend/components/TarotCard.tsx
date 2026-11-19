
import React, { useLayoutEffect, useRef } from 'react';
import { CardInstance, PlacedCard } from '../types';

interface TarotCardProps {
  card: CardInstance | PlacedCard;
  isFlipped: boolean;
  deckBackClass: string;
  deckImage?: string;
  onFlip?: () => void;
  style?: React.CSSProperties;
  showNumber?: number;
}

export const TarotCard: React.FC<TarotCardProps> = ({ card, isFlipped, deckBackClass, deckImage, onFlip, style, showNumber }) => {
  const nameRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const name = nameRef.current;
    if (!isFlipped || !name) return;

    const fitName = () => {
      name.style.removeProperty('font-size');
      const width = name.clientWidth;
      const textWidth = name.scrollWidth;
      if (width > 0 && textWidth > width) {
        const fontSize = parseFloat(getComputedStyle(name).fontSize);
        const fittedSize = Math.max(8, fontSize * (width - 1) / textWidth);
        name.style.fontSize = `${fittedSize}px`;
      }
    };

    fitName();

    // Refit after the web font replaces its fallback.
    let active = true;
    void document.fonts.ready.then(() => {
      if (active) fitName();
    });
    return () => { active = false; };
  }, [card.data.name, isFlipped]);

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
          style={deckImage ? { backgroundImage: `url(${deckImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
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
          className="card-face card-face-front bg-slate-900 shadow-lg border-2 border-amber-300 p-0.5"
        >
          <div className={`grid h-full grid-rows-[minmax(0,1fr)_14px] rounded-lg bg-slate-800 text-center transition-transform duration-300 ${card.isReversed ? 'rotate-180' : ''}`}>
            <img src={card.data.image_url} alt={card.data.name} className="h-full w-full rounded-md object-cover" />
            <p
              ref={nameRef}
              title={card.data.name}
              className="mx-0.5 truncate font-serif text-[11px] leading-[14px] text-amber-100"
            >
              {card.data.name}
            </p>
          </div>
           {/* Render button on the front face */}
          {onFlip && <FlipButton />}
        </div>
      </div>
    </div>
  );
};
