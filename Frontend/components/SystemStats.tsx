import React from 'react';

const SystemStats = ({ decks }) => {
  const activeCount = decks.filter(deck => deck.active).length;
  console.log('Active Decks Count:', activeCount);

  console.log('Total Decks:', decks);
  return (
    <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-2xl font-bold text-primary mb-1">{activeCount}</div>
          <div className="text-sm text-gray-600">Active Decks</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600 mb-1">234</div>
          <div className="text-sm text-gray-600">Total Card Images</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-600 mb-1">390</div>
          <div className="text-sm text-gray-600">Total Text Entries</div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;
