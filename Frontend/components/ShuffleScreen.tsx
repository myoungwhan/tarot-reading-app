import React from 'react';
import Confetti from './Confetti';
import { Role } from '../types';
import { translations } from '@/translations';

interface ShuffleScreenProps {
  onShuffleComplete: () => void;
  showConfetti: boolean;
  role: Role;
  deckBackClass: string;
  deckImage?: string;
  language: 'ko' | 'en';
}

const ShuffleScreen: React.FC<ShuffleScreenProps> = ({ onShuffleComplete, showConfetti, role, deckBackClass, deckImage, language }) => {
  const isCounselor = role === 'counselor';
  const isShuffling = !showConfetti;
    const t = translations[language];

  const handleStopShuffle = () => {
    if (isCounselor && isShuffling) {
      onShuffleComplete();
    }
  };
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {showConfetti && <Confetti />}
    <h2 className="text-2xl sm:text-3xl font-bold text-amber-300 mb-8 font-serif">
        {isShuffling ? t.shufflingTitle : t.shuffleCompleteTitle}
      </h2>
      
     <div className="relative w-48 h-64 mb-12">
        {isShuffling && Array.from({length: 5}).map((_, i) => (
          <div
            key={i}
            className={`absolute w-40 h-56 ${deckBackClass} rounded-xl shadow-lg border-2 border-amber-200/50 animate-shuffle`}
            style={{
              animationDelay: `${i * 0.1}s`,
              ...(deckImage ? { backgroundImage: `url(${deckImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {})
            }}
          ></div>
        ))}
        {!isShuffling && (
          <div
            className={`w-40 h-56 ${deckBackClass} rounded-xl shadow-xl border-2 border-amber-300 transform transition-transform duration-500 scale-110`}
            style={deckImage ? { backgroundImage: `url(${deckImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          ></div>
        )}
      </div>

      <button
        onClick={handleStopShuffle}
        disabled={!isShuffling || !isCounselor}
        className="px-8 py-3 bg-amber-500 text-slate-900 font-bold rounded-lg shadow-lg hover:bg-amber-400 transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
      >
         {t.stopShuffleButton}
      </button>
      {!isCounselor && isShuffling && <p className="mt-4 text-slate-400">{t.waitingForCounselorShuffle}</p>}

      <style>{`
        @keyframes shuffle {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(100px, -50px) rotate(20deg); }
          50% { transform: translate(-100px, 50px) rotate(-20deg); }
          75% { transform: translate(50px, 100px) rotate(10deg); }
        }
        .animate-shuffle {
          animation: shuffle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ShuffleScreen;