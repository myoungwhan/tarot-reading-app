import { translations } from '@/translations';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { HowToUseSettings } from '@/services/api';

interface LobbyScreenProps {
  onStartCounselor: () => void;
  onJoinQuerent: (code: string) => void;
  errorMessage: string;
  language: 'ko' | 'en';
  youtubeSettings?: HowToUseSettings;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onStartCounselor, onJoinQuerent, errorMessage, language, youtubeSettings }) => {
  const location = useLocation();
  const [code, setCode] = useState('');
  const t = translations[language];
  const isQuerent = location.pathname === '/querents';
  const youtubeLink = isQuerent ? youtubeSettings?.querent : youtubeSettings?.consultant;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 4) {
      onJoinQuerent(code);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 flex flex-col items-center justify-center animate-fade-in">
      <div className="relative mb-6 flex justify-center w-full">
        <div className="relative inline-block text-center max-w-[320px]">
          <img
            src="/logo.png"
            alt="Tarot Logo"
            className="absolute z-0 pointer-events-none"
            style={{ width: '190px', height: '200px', top: '-60px', left: '-20px' }}
          />
          <h2 className="text-4xl font-bold text-center text-amber-300 mb-6 font-serif">
            {t.lobbyWelcome}
          </h2>
        </div>
      </div>
      <p className="text-center text-slate-400 mb-12">{t.lobbyDescription}</p>

      <div className="w-full grid md:grid-cols-2 gap-8">
        {/* Counselor Panel */}
        <div className="bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center">
          <h3 className={`text-2xl font-serif  ${!isQuerent ? 'text-amber-200' : 'text-slate-400'} mb-4`}>{t.counselorTitle}</h3>
          <p className="text-center text-slate-400 mb-6">{t.counselorDescription}</p>
          <button
            disabled={location.pathname === "/querents"}
            onClick={onStartCounselor}
            className="px-8 py-3 bg-amber-500 text-slate-900 font-bold text-lg rounded-lg shadow-lg hover:bg-amber-400 transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
          >
            {t.counselorButton}
          </button>
        </div>

        {/* Querent Panel */}
        <div className="bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center">
          <h3 className={`text-2xl ${isQuerent ? 'text-amber-200' : 'text-slate-400'} font-serif mb-4`}>{t.querentTitle}</h3>
         <p className={`text-center mb-6  text-slate-400`}>{t.querentDescription}</p>
          <form onSubmit={handleJoin} className="w-full flex flex-col items-center">
            <input
              type="text"
              value={code}
              disabled={location.pathname === "/"}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              maxLength={4}
              placeholder="1234"
              className="w-48 text-center text-3xl tracking-[0.3em] font-mono p-3 rounded-lg bg-slate-900 border border-slate-600 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none mb-4"
            />
            <button
              type="submit"
              disabled={code.length !== 4 || location.pathname === "/"}
              className="px-8 py-3 bg-teal-500 text-slate-900 font-bold text-lg rounded-lg shadow-lg hover:bg-teal-400 transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
            >
              {t.querentButton}
            </button>
          </form>
        </div>
      </div>
      
      {errorMessage && (
        <p className="mt-8 text-red-400 bg-red-900/50 px-4 py-2 rounded-md">{errorMessage}</p>
      )}

      <div className="mt-12 text-center text-slate-500 max-w-2xl">
          <h4 className="font-bold mb-2">{t.howItWorksTitle}</h4>
          <p className="text-sm whitespace-pre-line">
           {t.howItWorksDescription}
          </p>
          {youtubeLink?.enabled && youtubeLink.url && (
            <a
              href={youtubeLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-amber-400/70 bg-slate-800/90 px-4 py-2 font-semibold text-amber-300 shadow-lg shadow-black/20 transition-colors hover:bg-amber-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a2e]"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0 text-red-500" aria-hidden="true">
                <path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8Z" />
                <path fill="white" d="m9.5 15.5 6-3.5-6-3.5v7Z" />
              </svg>
              <span>{t.youtubeButtonLabel}</span>
            </a>
          )}
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

export default LobbyScreen;
