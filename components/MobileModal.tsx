import React from 'react';

interface MobileModalProps {
    isOpen: boolean;
    generatedImage: string | null;
    generatedVideo: string | null;
    onEdit: () => void;
    onUseAsReference: () => void;
    onNew: () => void;
    onClose: () => void;
}

const downloadAsset = (assetUrl: string | null, isVideo: boolean) => {
    if (!assetUrl) return;
    const link = document.createElement('a');
    link.href = assetUrl;
    link.download = `ai-asset-${Date.now()}.${isVideo ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


export const MobileModal: React.FC<MobileModalProps> = ({ isOpen, generatedImage, generatedVideo, onEdit, onUseAsReference, onNew, onClose }) => {
    if (!isOpen) return null;

    const isVideo = !!generatedVideo;

    return (
        <div id="mobileModal" className="mobile-modal fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4 md:hidden" onClick={onClose}>
            <div className="modal-content bg-gray-800 rounded-lg w-full max-w-sm flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 flex-grow">
                     {generatedImage && !isVideo && <img id="modalImage" src={generatedImage} alt="Generated Art" className="modal-image w-full h-auto object-contain rounded-md" />}
                     {generatedVideo && isVideo && <video id="modalVideo" src={generatedVideo} controls autoPlay loop muted className="modal-video w-full h-auto object-contain rounded-md" />}
                </div>
                <div className="modal-actions grid grid-cols-2 gap-2 p-4 border-t border-gray-700">
                    <button 
                        className="modal-btn ref bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" 
                        onClick={onUseAsReference}
                        disabled={isVideo}
                    >🔄 Referência</button>
                    <button 
                        className="modal-btn edit bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" 
                        onClick={onEdit}
                        disabled={isVideo}
                    >✏️ Editar</button>
                    <button 
                        className="modal-btn download bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center" 
                        onClick={() => downloadAsset(isVideo ? generatedVideo : generatedImage, isVideo)}
                    >💾 Salvar</button>
                    <button className="modal-btn new bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center" onClick={onNew}>✨ Nova</button>
                </div>
            </div>
        </div>
    );
};