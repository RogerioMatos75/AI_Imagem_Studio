import React, { useRef } from 'react';
import { ImageFile } from '../types';

interface MobileModalProps {
    isOpen: boolean;
    generatedImage: string | null;
    generatedVideo: string[];
    onEdit: () => void;
    onUseAsReference: () => void;
    onNew: () => void;
    onClose: () => void;
    onGenerateNextSegment: (lastFrame: ImageFile) => void;
}

const downloadAsset = (assetUrl: string | null, isVideo: boolean, index?: number) => {
    if (!assetUrl) return;
    const link = document.createElement('a');
    link.href = assetUrl;
    const name = `ai-asset-${Date.now()}`;
    const extension = isVideo ? 'mp4' : 'png';
    const segment = index !== undefined ? `-segment-${index + 1}` : '';
    link.download = `${name}${segment}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


export const MobileModal: React.FC<MobileModalProps> = ({ isOpen, generatedImage, generatedVideo, onEdit, onUseAsReference, onNew, onClose, onGenerateNextSegment }) => {
    if (!isOpen) return null;

    const latestVideoRef = useRef<HTMLVideoElement>(null);

    const isVideo = generatedVideo && generatedVideo.length > 0;
    const isMosaicInProgress = isVideo && generatedVideo.length < 3;
    const isMosaicComplete = isVideo && generatedVideo.length === 3;

    const handleCaptureFrame = () => {
        const video = latestVideoRef.current;
        if (!video) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        const imageFile: ImageFile = { base64, mimeType: 'image/png' };
        
        onClose();
        onGenerateNextSegment(imageFile);
    };

    return (
        <div id="mobileModal" className="mobile-modal fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4 md:hidden" onClick={onClose}>
            <div className="modal-content bg-gray-800 rounded-lg w-full max-w-sm flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 flex-grow overflow-y-auto">
                     {generatedImage && !isVideo && <img id="modalImage" src={generatedImage} alt="Generated Art" className="modal-image w-full h-auto object-contain rounded-md" />}
                     {isVideo && (
                        <>
                            <h3 className="text-xl font-bold text-center mb-4 text-white">
                                {isMosaicComplete ? "Mosaico Completo" : `Mosaico (${generatedVideo.length}/3)`}
                            </h3>
                            {generatedVideo.map((videoUrl, index) => (
                                 <div key={index} className="mb-4">
                                     <p className="text-white font-semibold text-center mb-2">Segmento {index + 1}/3</p>
                                     <video 
                                        ref={index === generatedVideo.length - 1 ? latestVideoRef : null}
                                        src={videoUrl}
                                        controls
                                        autoPlay={index === 0}
                                        loop={isMosaicComplete}
                                        muted
                                        className="modal-video w-full h-auto object-contain rounded-md" />
                                     <button 
                                        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg" 
                                        onClick={() => downloadAsset(videoUrl, true, index)}
                                    >💾 Salvar Segmento {index + 1}</button>
                                 </div>
                            ))}
                        </>
                    )}
                </div>

                {isMosaicInProgress ? (
                    <div className="p-4 border-t border-gray-700">
                        <button
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg flex items-center justify-center"
                            onClick={handleCaptureFrame}
                        >
                            📸 Usar último frame
                        </button>
                    </div>
                ) : (
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
                        {!isVideo &&
                            <button 
                                className="modal-btn download bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center" 
                                onClick={() => downloadAsset(generatedImage, false)}
                            >💾 Salvar</button>
                        }
                        <button className={`modal-btn new bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center ${isVideo ? 'col-span-2' : ''}`} onClick={onNew}>✨ Nova</button>
                    </div>
                )}
            </div>
        </div>
    );
};