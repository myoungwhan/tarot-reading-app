import React, { useState, useEffect } from 'react';
import { useCreateDeckMutation } from '@/services/api';

interface AddDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddDeckModal: React.FC<AddDeckModalProps> = ({ isOpen, onClose }) => {
  const [createDeck, { isLoading }] = useCreateDeckMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [initializeCards, setInitializeCards] = useState(true);

  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState('');

  // Reset form when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setActive(true);
      setInitializeCards(true);
      setImageSource('upload');
      setImageFile(null);
      setImageUrl('');
      setImagePreview('');
      setErrorMessage('');
    }
  }, [isOpen]);

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
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Deck name is required.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('active', String(active));
      formData.append('initialize_cards', String(initializeCards));

      if (imageSource === 'upload' && imageFile) {
        formData.append('image_file', imageFile);
      } else if (imageUrl.trim()) {
        formData.append('image_url', imageUrl.trim());
      }

      await createDeck(formData).unwrap();
      onClose();
    } catch (err: any) {
      console.error('Failed to create deck:', err);
      setErrorMessage(err?.data?.error || err?.message || 'Failed to create deck. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-5">
            <h2 className="text-xl font-semibold text-gray-900">Add New Deck</h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
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
                  onClick={() => setImageSource('upload')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    imageSource === 'upload'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource('url')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    imageSource === 'url'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Image URL
                </button>
              </div>

              {imageSource === 'upload' ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="deck-cover-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="deck-cover-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <span className="text-sm text-gray-600">
                      {imageFile ? imageFile.name : 'Click to select an image from your device'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</span>
                  </label>
                </div>
              ) : (
                <input
                  type="url"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3 flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded"
                    onError={() => setErrorMessage('Failed to load image from provided preview')}
                  />
                  <div className="text-xs text-gray-500">Cover preview</div>
                </div>
              )}
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <span className="text-sm font-medium text-gray-800 block">Active Status</span>
                <span className="text-xs text-gray-500">Enable this deck for readings immediately</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Initialize Cards Checkbox */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={initializeCards}
                  onChange={(e) => setInitializeCards(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 block">
                    Initialize with standard 78 cards
                  </span>
                  <span className="text-xs text-gray-600 block mt-0.5">
                    Automatically generates 22 Major Arcana and 56 Minor Arcana (Wands, Cups, Swords, Pentacles) cards so they are immediately accessible in the Manage Cards view.
                  </span>
                </div>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating Deck...
                  </>
                ) : (
                  'Create Deck'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDeckModal;
