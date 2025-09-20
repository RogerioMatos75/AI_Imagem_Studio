import React, { useRef } from 'react';
import { CreateFunction, OrthoView, ImageFile } from '../types';
import { ErrorDisplay } from './ErrorDisplay';

interface RightPanelProps {
    isLoading: boolean;
    loadingMessage: string;
    generatedImage: string | null;
    generatedVideo: string[];
    createFunction: CreateFunction;
    error: string | null;
    onEditCurrentImage: () => void;
    onUseAsReference: () => void;
    lastCreateFunction: CreateFunction | null;
    lastPrompt: string;
    onGenerateOrthoView: (view: OrthoView) => void;
    onGenerateSkeletonFromPrompt: () => void;
    onDismissError: () => void;
    onRegenerate: () => void;
    onGenerateNextSegment: (lastFrame: ImageFile) => void;
}

const downloadAsset = (assetUrl: string, isVideo: boolean, index?: number) => {
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

export const RightPanel: React.FC<RightPanelProps> = ({ isLoading, loadingMessage, generatedImage, generatedVideo, createFunction, error, onEditCurrentImage, onUseAsReference, lastCreateFunction, lastPrompt, onGenerateOrthoView, onGenerateSkeletonFromPrompt, onDismissError, onRegenerate, onGenerateNextSegment }) => {
    const latestVideoRef = useRef<HTMLVideoElement>(null);

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
        
        onGenerateNextSegment(imageFile);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div id="loadingContainer" className="loading-container flex flex-col items-center justify-center text-center text-gray-400 p-4 h-full">
                    <div className="loading-spinner w-16 h-16 border-8 border-t-blue-500 border-gray-600 rounded-full animate-spin mb-4"></div>
                    <div className="loading-text text-xl whitespace-pre-wrap">{loadingMessage}</div>
                </div>
            );
        }

        if (error) {
            return <ErrorDisplay message={error} onDismiss={onDismissError} />
        }
        
        if (generatedVideo && generatedVideo.length > 0) {
            const isMosaicInProgress = generatedVideo.length < 3;
            const isMosaicComplete = generatedVideo.length === 3;
            const title = isMosaicComplete ? "Mosaico de Vídeos Gerado" : `Mosaico de Vídeos em Andamento (${generatedVideo.length}/3)`;

            return (
               <div id="videoContainer" className="w-full h-full flex flex-col items-center justify-center p-4">
                   <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
                       {generatedVideo.map((videoUrl, index) => (
                           <div key={index} className="flex flex-col items-center gap-2 bg-gray-800 p-2 rounded-lg shadow-lg">
                               <p className="text-white font-semibold">Segmento {index + 1}/3</p>
                               <video
                                    ref={index === generatedVideo.length - 1 ? latestVideoRef : null}
                                    src={videoUrl}
                                    controls
                                    muted
                                    loop={isMosaicComplete}
                                    className="w-full rounded-md"
                                />
                               <button onClick={() => downloadAsset(videoUrl, true, index)} className="action-btn bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg w-full transition-transform transform hover:scale-105">💾 Salvar Vídeo</button>
                           </div>
                       ))}
                   </div>
                   {isMosaicInProgress && !isLoading && (
                       <div className="mt-6">
                           <button onClick={handleCaptureFrame} className="action-btn bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105 text-lg">
                               📸 Usar último frame como referência
                           </button>
                       </div>
                   )}
               </div>
           );
       }

        if (generatedImage) {
            const canGenerateSkeleton = lastCreateFunction && [
                CreateFunction.Free, 
                CreateFunction.Text, 
                CreateFunction.Comic, 
                CreateFunction.Sticker, 
                CreateFunction.Miniature
            ].includes(lastCreateFunction) && lastPrompt;

            const isSkeletonResult = lastCreateFunction === CreateFunction.Skeleton;
            const canRegenerate = lastCreateFunction && ![CreateFunction.Skeleton, CreateFunction.Animate].includes(lastCreateFunction);


            return (
                <div id="imageContainer" className="image-container relative w-full h-full flex flex-col items-center justify-center">
                    <img src={generatedImage} alt="Generated Art" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg" />
                    
                    <div className="actions-bar absolute bottom-4 w-full flex justify-center items-center flex-wrap gap-2 px-4">
                        <button onClick={onUseAsReference} className="action-btn bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105">🔄 Usar como Referência</button>
                        <button onClick={onEditCurrentImage} className="action-btn bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105">✏️ Editar</button>
                        {canRegenerate && (
                             <button onClick={onRegenerate} className="action-btn bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105">🔄 Regenerar</button>
                        )}
                        <button onClick={() => downloadAsset(generatedImage, false)} className="action-btn bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105">💾 Salvar</button>
                        {canGenerateSkeleton && (
                            <button onClick={onGenerateSkeletonFromPrompt} className="action-btn bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105">💀 Gerar Esqueleto 3D</button>
                        )}
                    </div>

                    {isSkeletonResult && (
                        <div className="ortho-views-controls absolute top-4 w-full flex justify-center items-center gap-2 px-4 bg-gray-800/70 p-2 rounded-lg backdrop-blur-sm">
                            <span className="text-white font-semibold mr-2">Vistas Ortrogonais:</span>
                            <button onClick={() => onGenerateOrthoView('front')} className="ortho-btn bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors">Frente</button>
                            <button onClick={() => onGenerateOrthoView('back')} className="ortho-btn bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors">Costas</button>
                            <button onClick={() => onGenerateOrthoView('side_left')} className="ortho-btn bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors">Esquerda</button>
                            <button onClick={() => onGenerateOrthoView('side_right')} className="ortho-btn bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors">Direita</button>
                        </div>
                    )}
                </div>
            );
        }

        return (
             <div className="placeholder-container flex flex-col items-center justify-center text-center text-gray-500 p-8 h-full">
                <div className="text-6xl mb-4">🖼️</div>
                <h2 className="text-2xl font-bold text-gray-300">Seu estúdio criativo</h2>
                <p className="mt-2 max-w-sm">Descreva sua ideia, escolha uma função e clique em "Gerar" para ver a mágica acontecer.</p>
            </div>
        );
    };

    return (
        <div className="right-panel w-full md:w-2/3 bg-gray-900 flex flex-grow items-center justify-center p-6 relative">
            {renderContent()}
        </div>
    );
};