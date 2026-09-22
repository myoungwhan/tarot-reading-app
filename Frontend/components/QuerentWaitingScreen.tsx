import React from 'react';
import { translations } from '../translations';

interface QuerentWaitingScreenProps {
  deckBackClass: string;
  deckImage?: string;
  language: 'ko' | 'en';
}

const QuerentWaitingScreen: React.FC<QuerentWaitingScreenProps> = ({ deckBackClass, deckImage, language }) => {
  const t = translations[language];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-amber-300 mb-6 font-serif">
        {t.waitingForSessionSetupTitle}
      </h2>
      <p className="text-slate-400 mb-12">
        {t.waitingForSessionSetupDescription}
      </p>

      {/* Static card stack visualization */}
      <div className="relative w-48 h-64">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-40 h-56 ${deckBackClass} rounded-xl shadow-lg border-2 border-amber-200/50`}
            style={{
              left: 'calc(50% - 80px)',
              top: 'calc(50% - 112px)',
              transform: `translateX(${(i - 3) * 2}px) translateY(${(i - 3) * -2}px) rotate(${(i - 3) * 1.5}deg)`,
              zIndex: i,
              ...(deckImage ? { backgroundImage: `url(${deckImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {})
            }}
          ></div>
        ))}
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

export default QuerentWaitingScreen;
