import React, { useState } from 'react';

interface ChoiceScreenProps {
  onStartCounselor: () => void;
  onJoinQuerent: (code: string) => void;
  errorMessage: string;
}

const ChoiceScreen: React.FC<ChoiceScreenProps> = ({ onChoiceSelect, errorMessage }) => {

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
            onClick={() => onChoiceSelect("counselor")}
            className="px-8 py-3 bg-amber-500 text-slate-900 font-bold text-lg rounded-lg shadow-lg hover:bg-amber-400 transition-all transform hover:scale-105"
          >
            Start As Counselor
          </button>
        </div>

        {/* Querent Panel */}
        <div className="bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center">
          <h3 className="text-2xl font-serif text-amber-200 mb-4">For Querents</h3>
          <p className="text-center text-slate-400 mb-6">Enter the 4-digit code provided by your counselor to join the session.</p>
            <button
            onClick={() => onChoiceSelect("querent")}
            className="px-8 py-3 bg-amber-500 text-slate-900 font-bold text-lg rounded-lg shadow-lg hover:bg-amber-400 transition-all transform hover:scale-105"
          >
            Start As Querent
          </button>
        </div>
      </div>
      
      {errorMessage && (
        <p className="mt-8 text-red-400 bg-red-900/50 px-4 py-2 rounded-md">{errorMessage}</p>
      )}

      <div className="mt-12 text-center text-slate-500 max-w-2xl">
          <h4 className="font-bold mb-2">How it works:</h4>
          <p className="text-sm">
            This application uses a real-time socket connection to sync the session between the counselor and the querent. The counselor starts a session, shares the session code, and the querent enters that code to connect. Once connected, both users can view the reading and interact in real-time, even from different devices and locations.
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

export default ChoiceScreen;
