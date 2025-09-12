
import React from 'react';

interface MobileModalProps {
    isOpen: boolean;
    generatedImage: string | null;
    onEdit: () => void;
    onNew: () => void;
    onClose: () => void;
}

const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


export const MobileModal: React.FC<MobileModalProps> = ({ isOpen, generatedImage, onEdit, onNew, onClose }) => {
    if (!isOpen) return null;

    return (
        <div id="mobileModal" className="mobile-modal fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4 md:hidden" onClick={onClose}>
            <div className="modal-content bg-gray-800 rounded-lg w-full max-w-sm flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 flex-grow">
                     {generatedImage && <img id="modalImage" src={generatedImage} alt="Generated Art" className="modal-image w-full h-auto object-contain rounded-md" />}
                </div>
                <div className="modal-actions grid grid-cols-3 gap-2 p-4 border-t border-gray-700">
                    <button className="modal-btn edit bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center" onClick={onEdit}>✏️ Editar</button>
                    <button className="modal-btn download bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center" onClick={() => generatedImage && downloadImage(generatedImage)}>💾 Salvar</button>
                    <button className="modal-btn new bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center" onClick={onNew}>✨ Nova</button>
                </div>
            </div>
        </div>
    );
};
