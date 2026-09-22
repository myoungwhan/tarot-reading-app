import React, { useState, useEffect } from 'react';
import { useDeleteDeckMutation } from '@/services/api';
import type { TarotDeck } from '@/data/sampledecks';

const BUILT_IN_DECKS = ['Universal Waite', 'Marseille', 'Thoth', 'Wild Unknown', 'Shadowscapes'];

interface DeleteDeckModalProps {
  isOpen: boolean;
  deck: TarotDeck | null;
  onClose: () => void;
}

const DeleteDeckModal: React.FC<DeleteDeckModalProps> = ({ isOpen, deck, onClose }) => {
  const [deleteDeck, { isLoading }] = useDeleteDeckMutation();
  const [errorMessage, setErrorMessage] = useState('');

  const isBuiltIn = deck?.name
    ? BUILT_IN_DECKS.some(b => b.toLowerCase() === deck.name.trim().toLowerCase())
    : false;

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const handleDelete = async () => {
    if (!deck || isBuiltIn) return;
    setErrorMessage('');

    try {
      await deleteDeck(deck.id).unwrap();
      onClose();
    } catch (err: any) {
      console.error('Failed to delete deck:', err);
      setErrorMessage(err?.data?.error || err?.message || 'Failed to delete deck. Please try again.');
    }
  };

  if (!isOpen || !deck) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Deck</h3>
              <p className="text-xs text-gray-500">Confirm permanent deck removal</p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {errorMessage}
            </div>
          )}

          {isBuiltIn ? (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg mb-4">
              <strong>{deck.name}</strong> is a protected built-in deck and cannot be deleted.
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <strong className="text-gray-900 font-semibold">{deck.name}</strong>?
              </p>
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-800 space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <span>⚠️</span> Warning: This action cannot be undone
                </p>
                <p>
                  All cards associated with this deck and its uploaded cover image will be permanently removed from the system.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            {!isBuiltIn && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete Deck'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDeckModal;
