import React, { useState, useEffect } from 'react';
import { useUpdateDeckMutation } from '@/services/api';
import type { TarotDeck } from '@/data/sampledecks';

interface EditDeckModalProps {
  isOpen: boolean;
  deck: TarotDeck | null;
  onClose: () => void;
}

const EditDeckModal: React.FC<EditDeckModalProps> = ({ isOpen, deck, onClose }) => {
  const [updateDeck, { isLoading }] = useUpdateDeckMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  const [imageOption, setImageOption] = useState<'current' | 'upload' | 'url'>('current');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState('');

  // Populate form when deck changes or modal opens
  useEffect(() => {
    if (isOpen && deck) {
      setName(deck.name || '');
      setDescription(deck.description || '');
      setActive(deck.active ?? true);
      setImageOption('current');
      setImageFile(null);
      setImageUrl('');
      setImagePreview(deck.image_url || deck.image || '');
      setErrorMessage('');
    } else if (!isOpen) {
      setErrorMessage('');
    }
  }, [isOpen, deck]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file (JPG, PNG, WebP, etc.)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImagePreview(url);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deck) return;
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Deck name cannot be empty.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('active', String(active));

      if (imageOption === 'upload' && imageFile) {
        formData.append('image_file', imageFile);
      } else if (imageOption === 'url' && imageUrl.trim()) {
        formData.append('image_url', imageUrl.trim());
      }

      await updateDeck({ id: deck.id, formData }).unwrap();
      onClose();
    } catch (err: any) {
      console.error('Failed to update deck:', err);
      setErrorMessage(err?.data?.error || err?.message || 'Failed to update deck. Please try again.');
    }
  };

  if (!isOpen || !deck) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Deck</h2>
            <p className="text-xs text-gray-500">Update deck settings, details, and cover image</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {errorMessage}
              </div>
            )}

            {/* Deck Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deck Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Celestial Tarot"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#246596] focus:border-transparent text-sm"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Brief description of the deck's theme, symbolism, or artwork..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#246596] focus:border-transparent text-sm resize-none"
              />
            </div>

            {/* Cover Image Source Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="flex space-x-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setImageOption('current');
                    setImagePreview(deck.image_url || deck.image || '');
                    setImageFile(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    imageOption === 'current'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Current Image
                </button>
                <button
                  type="button"
                  onClick={() => setImageOption('upload')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    imageOption === 'upload'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Upload New File
                </button>
                <button
                  type="button"
                  onClick={() => setImageOption('url')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    imageOption === 'url'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  New Image URL
                </button>
              </div>

              {imageOption === 'upload' && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="edit-deck-cover-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-deck-cover-upload"
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">
                      {imageFile ? imageFile.name : 'Choose a replacement image file'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</span>
                  </label>
                </div>
              )}

              {imageOption === 'url' && (
                <div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/images/deck-cover.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#246596] focus:border-transparent text-sm"
                  />
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3 flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="w-14 h-20 object-cover rounded shadow-sm border border-gray-200"
                    onError={() => setErrorMessage('Unable to load preview for this image URL.')}
                  />
                  <div className="text-xs text-gray-500">
                    <p className="font-medium text-gray-700">Preview</p>
                    <p className="line-clamp-2">{imageOption === 'current' ? 'Using currently assigned cover' : (imageFile ? imageFile.name : imagePreview)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Active Status
                </label>
                <p className="text-xs text-gray-500">
                  Active decks are selectable by counselors and visible in readings.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </label>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-[#246596] text-white rounded-lg hover:bg-[#1d527a] transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeckModal;
