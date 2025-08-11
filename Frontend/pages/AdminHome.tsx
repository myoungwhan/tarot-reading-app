import DeckCard from "@/components/DeckCard";
import Header from "@/components/Header";
import React from "react";
import SystemStats from "@/components/SystemStats";
import { useGetDecksQuery } from "@/services/api";
import { useState, useEffect } from "react";

const AdminHome: React.FC = () => {
    const { data: decks = [], isLoading, isError } = useGetDecksQuery();
    const [localDecks, setLocalDecks] = useState(decks);

    useEffect(() => {
        setLocalDecks(decks);
    }, [decks]);

    return (
        <main className="px-6 py-8 bg-white">
            <section className="w-full">
                <div className="mb-8 mt-10 max-w-[90vw] ml-auto">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Deck Management</h2>
                    <p className="text-gray-600">Manage the activation status and card information of the five tarot decks.</p>
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
        </main>
    );
}

export default AdminHome;