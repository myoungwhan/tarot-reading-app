import React, { useState } from 'react';

interface LobbyScreenProps {
  onStartCounselor: () => void;
  onJoinQuerent: (code: string) => void;
  errorMessage: string;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onStartCounselor, onJoinQuerent, errorMessage }) => {
  const [code, setCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 4) {
      onJoinQuerent(code);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 flex flex-col items-center justify-center animate-fade-in">
      <h2 className="text-4xl font-bold text-center text-amber-300 mb-6 font-serif">Welcome to Interactive Tarot</h2>
      <p className="text-center text-slate-400 mb-12">Choose your role to begin the session.</p>

      <div className="w-full grid md:grid-cols-2 gap-8">
        {/* Counselor Panel */}
        <div className="bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center">
          <h3 className="text-2xl font-serif text-amber-200 mb-4">For Counselors</h3>
          <p className="text-center text-slate-400 mb-6">Start a new session to generate a unique 4-digit code for your querent.</p>
          <button
            onClick={onStartCounselor}
            className="px-8 py-3 bg-amber-500 text-slate-900 font-bold text-lg rounded-lg shadow-lg hover:bg-amber-400 transition-all transform hover:scale-105"
          >
            Start New Session
          </button>
        </div>

        {/* Querent Panel */}
        <div className="bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center">
          <h3 className="text-2xl font-serif text-amber-200 mb-4">For Querents</h3>
          <p className="text-center text-slate-400 mb-6">Enter the 4-digit code provided by your counselor to join the session.</p>
          <form onSubmit={handleJoin} className="w-full flex flex-col items-center">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              maxLength={4}
              placeholder="1234"
              className="w-48 text-center text-3xl tracking-[0.3em] font-mono p-3 rounded-lg bg-slate-900 border border-slate-600 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none mb-4"
            />
            <button
              type="submit"
              disabled={code.length !== 4}
              className="px-8 py-3 bg-teal-500 text-slate-900 font-bold text-lg rounded-lg shadow-lg hover:bg-teal-400 transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
            >
              Join Session
            </button>
          </form>
        </div>
      </div>
      
      {errorMessage && (
        <p className="mt-8 text-red-400 bg-red-900/50 px-4 py-2 rounded-md">{errorMessage}</p>
      )}

      <div className="mt-12 text-center text-slate-500 max-w-2xl">
          <h4 className="font-bold mb-2">How it works:</h4>
          <p className="text-sm">
            This application uses browser storage to sync the session between the counselor and querent. For this to work, both users must be on the same computer, but in different browser tabs or windows. The counselor starts a session, shares the code, and the querent uses that code to connect and view the reading in real-time.
          </p>
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
