import React, { useState, useEffect } from "react";

const AdminCard = ({ cardDetails }) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editCardDetails, setEditCardDetails] = useState(null);
    const [currentCardDetails, setCurrentCardDetails] = useState(cardDetails);

    useEffect(() => {
        setCurrentCardDetails(cardDetails);
    }, [cardDetails]);

    const onEditButtonClick = (cardData) => {
        setEditCardDetails(cardData);
        setIsEditDialogOpen(true);
    };

    const onEditModalClose = (updatedCard) => {
        setIsEditDialogOpen(false);
        if (updatedCard && updatedCard.id === currentCardDetails.id) {
            setCurrentCardDetails(updatedCard);
        }
    };

    return (
        <>
            <section className="w-fit bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-2">
                    <img
                        className="w-[300px] h-[500px] object-cover"
                        src={currentCardDetails.image_url || currentCardDetails.image}
                        alt=""
                    />
                </div>
                <div className="p-5">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{currentCardDetails.name}</h5>
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {currentCardDetails.description}
                    </p>
                    <button
                        onClick={() => onEditButtonClick(currentCardDetails)}
                        className="!rounded-button whitespace-nowrap mt-3 w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        Edit
                    </button>
                </div>
            </section>

            {isEditDialogOpen && (
                <CardEditModal
                    open={isEditDialogOpen}
                    cardData={editCardDetails}
                    onClose={onEditModalClose}
                />
            )}
        </>
    );
};

// ---------------- Modal Component ----------------

import { useUpdateCardMutation } from "@/services/api";


const CardEditModal = ({ open, cardData, onClose }) => {
    const [editCardData, setEditCardData] = useState({ ...cardData });
    const [updateCard, { isLoading }] = useUpdateCardMutation();
    const [imageError, setImageError] = useState("");

    useEffect(() => {
        if (cardData) setEditCardData(cardData);
    }, [cardData]);

    const onEditCardChangeHandler = (e) => {
        const { name, value } = e.target;
        setEditCardData((prev) => ({ ...prev, [name]: value }));
    };

    const validateImage = (file) => {
        // File type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            return "Supported formats: JPG, PNG, GIF";
        }
        // File size
        if (file.size > 5 * 1024 * 1024) {
            return "Maximum file size: 5MB";
        }
        return null;
    };

    const onImageChange = async (e) => {
        setImageError("");
        const file = e.target.files?.[0];
        if (file) {
            const validationError = validateImage(file);
            if (validationError) {
                setImageError(validationError);
                return;
            }
            // Check dimensions
            const img = new window.Image();
            img.onload = () => {
                if (img.width > 300 || img.height > 500) {
                    setImageError("Recommended size should be less than: 300 x 500px");
                } else {
                    setEditCardData((prev) => ({ ...prev, image_file: file, image_url: URL.createObjectURL(file) }));
                }
            };
            img.onerror = () => {
                setImageError("Invalid image file.");
            };
            img.src = URL.createObjectURL(file);
        }
    };

    const onSaveHandler = async () => {
        if (imageError) return;
        try {
            const payload = { ...editCardData };
            if (editCardData.image_file) {
                payload.image_file = editCardData.image_file;
            }
            console.log("Saving card data:", editCardData);
            const result = await updateCard({ id: editCardData.id, ...payload }).unwrap();
            console.log("Card updated:", result);
            onClose(result); // Pass updated card back to parent
        } catch (err) {
            console.error("Error updating card:", err);
            alert("Failed to save card.");
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50 flex">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Card Editing</h2>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                            ✕
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-[300px] h-[500px] bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center relative group overflow-hidden">
                                <img
                                    src={editCardData?.image_url}
                                    alt={editCardData?.name}
                                    className="w-full h-full object-cover object-top rounded-lg"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="card-image-upload"
                                    className="hidden"
                                    onChange={onImageChange}
                                />
                                <label
                                    htmlFor="card-image-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition group cursor-pointer"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Change Image</span>
                                </label>
                            </div>
                            <div className="text-sm text-gray-500 text-center">
                                <p>Recommended size: 300 x 500px</p>
                                <p>Maximum file size: 5MB</p>
                                <p>Supported formats: JPG, PNG, GIF</p>
                                {imageError && <p className="text-red-500 mt-2">{imageError}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Card Name</label>
                            <input
                                name="name"
                                onChange={onEditCardChangeHandler}
                                value={editCardData?.name || ""}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Card Description</label>
                            <textarea
                                name="description"
                                onChange={onEditCardChangeHandler}
                                value={editCardData?.description || ""}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Explain the meaning and symbol of the card..."
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={onSaveHandler}
                                className="rounded-lg whitespace-nowrap flex-1 px-4 py-2 text-white bg-green-500 font-medium hover:bg-green-800 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={onClose}
                                className="rounded-lg flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCard;
