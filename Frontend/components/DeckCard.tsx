
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateDeckMutation } from '@/services/api';

const BUILT_IN_DECKS = ['Universal Waite', 'Marseille', 'Thoth', 'Wild Unknown', 'Shadowscapes'];

interface DeckCardProps {
  deck: any;
  onStatusChange?: (newActive: boolean) => void;
  onEdit?: (deck: any) => void;
  onDelete?: (deck: any) => void;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, onStatusChange, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [updateDeck, { isLoading }] = useUpdateDeckMutation();
  const [active, setActive] = useState(deck.active);

  const isBuiltIn = deck?.name
    ? BUILT_IN_DECKS.some(b => b.toLowerCase() === deck.name.trim().toLowerCase())
    : false;

  useEffect(() => {
    setActive(deck.active);
  }, [deck.active]);

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

  const onManageCardsClick = (e: React.MouseEvent, deck_id: string | number) => {
    navigate(`/admin/${deck_id}`, {
      viewTransition: true
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate mr-2" title={deck.name}>{deck.name}</h3>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              className={`sr-only peer`}
              checked={active}
              onChange={onSwitchChange}
              disabled={isLoading}
            />
            <div className={`w-11 h-6 ${active ? 'bg-green-500' : 'bg-gray-300'} rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>
        <div className="mb-4">
          <div className="w-full h-32 rounded-lg flex items-center justify-center">
            <img
              src={deck.image_url || deck.image}
              alt={`${deck.name} Deck`}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
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

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={(e) => onManageCardsClick(e, deck.id)}
            className="!rounded-button flex-1 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            Manage Cards
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(deck)}
              title="Edit Deck"
              className="p-2 border border-gray-300 text-gray-600 hover:text-[#246596] hover:border-[#246596] hover:bg-blue-50 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => !isBuiltIn && onDelete(deck)}
              disabled={isBuiltIn}
              title={isBuiltIn ? "Protected built-in deck cannot be deleted" : "Delete Deck"}
              className={`p-2 border rounded transition-colors ${
                isBuiltIn
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-600 hover:bg-red-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeckCard;
