import DeckCard from "@/components/DeckCard";
import Header from "@/components/Header";
import React, { useState, useEffect } from "react";
import SystemStats from "@/components/SystemStats";
import AddDeckModal from "@/components/AddDeckModal";
import { useGetDecksQuery } from "@/services/api";

const AdminHome: React.FC = () => {
    const { data: decks = [], isLoading, isError } = useGetDecksQuery();
    const [localDecks, setLocalDecks] = useState(decks);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        setLocalDecks(decks);
    }, [decks]);

    return (
        <main className="px-6 py-8 bg-white">
            <section className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 mt-10 max-w-[90vw] ml-auto">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Deck Management</h2>
                        <p className="text-gray-600">Manage the activation status and card information of the tarot decks.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="!rounded-button self-start sm:self-auto px-4 py-2 bg-[#246596] text-white hover:bg-[#1d527a] transition-colors flex items-center gap-2 font-medium shadow-sm"
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
        </main>
    );
}

export default AdminHome;