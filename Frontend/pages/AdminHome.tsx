import DeckCard from "@/components/DeckCard";
import Header from "@/components/Header";
import React, { useState, useEffect } from "react";
import SystemStats from "@/components/SystemStats";
import AddDeckModal from "@/components/AddDeckModal";
import EditDeckModal from "@/components/EditDeckModal";
import DeleteDeckModal from "@/components/DeleteDeckModal";
import {
    useGetDecksQuery,
    useGetHowToUseSettingsQuery,
    useUpdateHowToUseSettingsMutation,
} from "@/services/api";
import type { TarotDeck } from "@/data/sampledecks";

const AdminHome: React.FC = () => {
    const { data: decks = [], isLoading, isError } = useGetDecksQuery();
    const { data: youtubeSettings, isLoading: youtubeSettingsLoading } = useGetHowToUseSettingsQuery();
    const [updateHowToUseSettings, { isLoading: isSavingYoutubeSettings }] = useUpdateHowToUseSettingsMutation();
    const [localDecks, setLocalDecks] = useState(decks);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingDeck, setEditingDeck] = useState<TarotDeck | null>(null);
    const [deletingDeck, setDeletingDeck] = useState<TarotDeck | null>(null);
    const [youtubeForm, setYoutubeForm] = useState({
        consultant_youtube_url: '',
        consultant_youtube_enabled: false,
        querent_youtube_url: '',
        querent_youtube_enabled: false,
    });
    const [youtubeSaveMessage, setYoutubeSaveMessage] = useState('');
    const [youtubeSaveError, setYoutubeSaveError] = useState('');

    useEffect(() => {
        setLocalDecks(decks);
    }, [decks]);

    useEffect(() => {
        if (youtubeSettings) {
            setYoutubeForm({
                consultant_youtube_url: youtubeSettings.consultant.url,
                consultant_youtube_enabled: youtubeSettings.consultant.enabled,
                querent_youtube_url: youtubeSettings.querent.url,
                querent_youtube_enabled: youtubeSettings.querent.enabled,
            });
        }
    }, [youtubeSettings]);

    const handleYoutubeSettingsSave = async (event: React.FormEvent) => {
        event.preventDefault();
        setYoutubeSaveMessage('');
        setYoutubeSaveError('');

        try {
            await updateHowToUseSettings({
                ...youtubeForm,
                consultant_youtube_url: youtubeForm.consultant_youtube_url.trim(),
                querent_youtube_url: youtubeForm.querent_youtube_url.trim(),
            }).unwrap();
            setYoutubeSaveMessage('YouTube settings saved.');
        } catch (error: any) {
            setYoutubeSaveError(error?.data?.error || 'Failed to save YouTube settings.');
        }
    };

    return (
        <main className="px-6 py-8 bg-white">
            <section className="w-full">
                <section className="max-w-[90vw] ml-auto mb-10 rounded-xl border border-gray-200 bg-gray-50 p-6">
                    <div className="mb-5">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">How to Use Links</h2>
                        <p className="text-gray-600">Configure the optional links shown in the public How to Use section.</p>
                    </div>
                    {youtubeSettingsLoading ? (
                        <div className="text-gray-600">Loading YouTube settings...</div>
                    ) : (
                        <form onSubmit={handleYoutubeSettingsSave} className="space-y-5">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="block">
                                    <span className="block text-sm font-medium text-gray-700 mb-2">
                                        Consultant YouTube URL
                                    </span>

                                    <input
                                        type="url"
                                        value={youtubeForm.consultant_youtube_url}
                                        onChange={(event) =>
                                            setYoutubeForm((current) => ({
                                                ...current,
                                                consultant_youtube_url: event.target.value,
                                            }))
                                        }
                                        placeholder="https://..."
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />

                                    <label
                                        htmlFor="consultant-youtube-enabled"
                                        className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-gray-600"
                                    >
                                        <input
                                            id="consultant-youtube-enabled"
                                            type="checkbox"
                                            checked={youtubeForm.consultant_youtube_enabled}
                                            onChange={(event) =>
                                                setYoutubeForm((current) => ({
                                                    ...current,
                                                    consultant_youtube_enabled: event.target.checked,
                                                }))
                                            }
                                        />
                                        Enable consultant link
                                    </label>
                                </div>
                                <div className="block">
                                    <span className="block text-sm font-medium text-gray-700 mb-2">
                                        Querent YouTube URL
                                    </span>

                                    <input
                                        type="url"
                                        value={youtubeForm.querent_youtube_url}
                                        onChange={(event) =>
                                            setYoutubeForm((current) => ({
                                                ...current,
                                                querent_youtube_url: event.target.value,
                                            }))
                                        }
                                        placeholder="https://..."
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />

                                    <label
                                        htmlFor="querent-youtube-enabled"
                                        className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-gray-600"
                                    >
                                        <input
                                            id="querent-youtube-enabled"
                                            type="checkbox"
                                            checked={youtubeForm.querent_youtube_enabled}
                                            onChange={(event) =>
                                                setYoutubeForm((current) => ({
                                                    ...current,
                                                    querent_youtube_enabled: event.target.checked,
                                                }))
                                            }
                                        />
                                        Enable querent link
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={isSavingYoutubeSettings}
                                    className="rounded-lg px-4 py-2 bg-[#246596] text-white hover:bg-[#1d527a] disabled:opacity-60 transition-colors font-medium"
                                >
                                    {isSavingYoutubeSettings ? 'Saving...' : 'Save YouTube Settings'}
                                </button>
                                {youtubeSaveMessage && <span className="text-sm text-green-700">{youtubeSaveMessage}</span>}
                                {youtubeSaveError && <span className="text-sm text-red-600">{youtubeSaveError}</span>}
                            </div>
                        </form>
                    )}
                </section>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 mt-10 max-w-[90vw] ml-auto">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Deck Management</h2>
                        <p className="text-gray-600">Manage the activation status and card information of the tarot decks.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="rounded-lg self-start sm:self-auto px-4 py-2 bg-[#246596] text-white hover:bg-[#1d527a] transition-colors flex items-center gap-2 font-medium shadow-sm"
                    >
                        <span className="text-lg leading-none">+</span> Add New Deck
                    </button>
                </div>
                {isLoading ? (
                    <div className="text-center py-8">Loading decks...</div>
                ) : isError ? (
                    <div className="text-center py-8 text-red-500">Failed to load decks.</div>
                ) : (
                    <div className="max-w-[90vw] grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ml-auto">
                        {localDecks.map((deck, idx) => (
                            <div className="w-[400px]" key={deck.id}>
                                <DeckCard
                                    deck={deck}
                                    onStatusChange={(newActive) => {
                                        setLocalDecks((prev) => prev.map((d, i) => i === idx ? { ...d, active: newActive } : d));
                                    }}
                                    onEdit={(d) => setEditingDeck(d)}
                                    onDelete={(d) => setDeletingDeck(d)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
            <SystemStats decks={localDecks} />

            <AddDeckModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <EditDeckModal
                isOpen={!!editingDeck}
                deck={editingDeck}
                onClose={() => setEditingDeck(null)}
            />

            <DeleteDeckModal
                isOpen={!!deletingDeck}
                deck={deletingDeck}
                onClose={() => setDeletingDeck(null)}
            />
        </main>
    );
}

export default AdminHome;
