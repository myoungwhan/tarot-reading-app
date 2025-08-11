
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateDeckMutation } from '@/services/api';

const DeckCard = ({ deck, onStatusChange }) => {
  const navigate = useNavigate();
  const [updateDeck, { isLoading }] = useUpdateDeckMutation();
  const [active, setActive] = useState(deck.active);

  const onSwitchChange = async () => {
    const newActive = !active;
    setActive(newActive);
    try {
      await updateDeck({ id: deck.id, active: newActive }).unwrap();
      if (onStatusChange) onStatusChange(newActive);
    } catch (err) {
      setActive(!newActive); // revert on error
      alert('Failed to update deck status.');
    }
  };

  const onManageCardsClick = (e, deck_id) => {
    navigate(`/admin/${deck_id}`, {
      viewTransition: true
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{deck.name}</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className={`sr-only peer`}
              checked={active}
              onChange={onSwitchChange}
              disabled={isLoading}
            />
            <div className={`w-11 h-6 ${active ? 'bg-green-500' : 'bg-gray-300'} rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary`}></div>
          </label>
        </div>
        <div className="mb-4">
          <div className="w-full h-32 rounded-lg flex items-center justify-center">
            <img
              src={deck.image_url}
              alt={`${deck.name} Deck`}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Cards</span>
            <span className="font-medium">{deck.total_cards} cards</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Major Arcana</span>
            <span className="font-medium">{deck.major_arcana} cards</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Minor Arcana</span>
            <span className="font-medium">{deck.minor_arcana} cards</span>
          </div>
        </div>
        <button onClick={(e) => onManageCardsClick(e, deck.id)} className="!rounded-button w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50">
          Manage Cards
        </button>
      </div>
    </div>
  )
}

export default DeckCard
