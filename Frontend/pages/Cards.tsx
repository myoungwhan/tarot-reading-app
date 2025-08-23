import AdminCard from "@/components/AdminCard";
import React, { useState } from "react";
import { useGetCardsQuery } from "@/services/api";
import { useParams } from "react-router-dom";
const Cards: React.FC = () => {
    const params = useParams<{ deck_id: string }>();
    const deck_id = params.deck_id; // Default to universal
    console.log('Deck ID:', deck_id);
    // State to manage active tab and suit
    const [activeTab, setActiveTab] = useState<"major" | "minor">("major");
    const [activeSuit, setActiveSuit] = useState<"minor.arcana.wands" | "minor.arcana.cups" | "minor.arcana.swords" | "minor.arcana.pentacles">("minor.arcana.wands");

    const getCardsQuery: { deck_id: string; category?: string } = {
        deck_id
    };

    if(activeTab === "minor") {
        getCardsQuery.category = activeSuit;
    } else {
        getCardsQuery.category = "major";
    }
    const {data: cards = [], isLoading, isError} = useGetCardsQuery(getCardsQuery);

    return (
        <main className="px-6 py-8 bg-white">
            <div className="max-w-[90rem] mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between ">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage Universal Waite deck cards</h2>
                            <p className="text-gray-600">
                                Seventy-eight tarot cards are divided into Major Arcana and Minor Arcana.
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
                            <div className="text-sm text-gray-600">Total number of cards</div>
                            <div className="text-2xl font-bold text-primary">Chapter 78</div>
                        </div>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="mb-6">
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === "major"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                            onClick={() => setActiveTab("major")}
                        >
                            Major Arcana
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === "minor"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                            onClick={() => setActiveTab("minor")}
                        >
                            Minor Arcana (56th ed.)
                        </button>
                    </div>
                </div>

                {/* Major Arcana Content */}
                {activeTab === "major" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
                        {cards.map((card) => (
                            <React.Fragment key={card.id}>
                                <AdminCard cardDetails={card} />
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Minor Arcana Content */}
                {activeTab === "minor" && (
                    <div>
                        {/* Suit Tabs */}
                        <div className="mb-6">
                            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                                {(["minor.arcana.wands", "minor.arcana.cups", "minor.arcana.swords", "minor.arcana.pentacles"] as const).map((suit) => (
                                    <button
                                        key={suit}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            activeSuit === suit
                                                ? "bg-white text-primary shadow-sm"
                                                : "text-gray-600 hover:text-gray-900"
                                        }`}
                                        onClick={() => setActiveSuit(suit)}
                                    >
                                        {suit === "minor.arcana.wands" && "Wands (14pieces)"}
                                        {suit === "minor.arcana.cups" && "Cup (14pieces)"}
                                        {suit === "minor.arcana.swords" && "Swords (14th Chapter)"}
                                        {suit === "minor.arcana.pentacles" && "Pentacle"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Suit Content */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
                            {cards.map((card) => (
                                <React.Fragment key={card.id}>
                                    <AdminCard cardDetails={card} />
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Cards;
