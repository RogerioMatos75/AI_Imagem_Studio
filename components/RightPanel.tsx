import React from 'react';
import { CreateFunction, OrthoView } from '../types';
import { ErrorDisplay } from './ErrorDisplay';

interface RightPanelProps {
    isLoading: boolean;
    loadingMessage: string;
    generatedImage: string | null;
    generatedVideo: string | null;
    createFunction: CreateFunction;
    error: string | null;
    onEditCurrentImage: () => void;
    lastCreateFunction: CreateFunction | null;
    lastPrompt: string;
    onGenerateOrthoView: (view: OrthoView) => void;
    onGenerateSkeletonFromPrompt: () => void;
    onDismissError: () => void;
    onRegenerate: () => void;
}

const downloadAsset = (assetUrl: string, isVideo: boolean) => {
    const link = document.createElement('a');
    link.href = assetUrl;
    link.download = `ai-asset-${Date.now()}.${isVideo ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const RightPanel: React.FC<RightPanelProps> = ({ isLoading, loadingMessage, generatedImage, generatedVideo, createFunction, error, onEditCurrentImage, lastCreateFunction, lastPrompt, onGenerateOrthoView, onGenerateSkeletonFromPrompt, onDismissError, onRegenerate }) => {
    const renderContent = () => {
        if (isLoading) {
            return (
                <div id="loadingContainer" className="loading-container flex flex-col items-center justify-center text-center text-gray-400 p-4 h-full">
                    <div className="loading-spinner w-16 h-16 border-8 border-t-blue-500 border-gray-600 rounded-full animate-spin mb-4"></div>
                    <div className="loading-text text-xl">{loadingMessage}</div>
                </div>
            );
        }

        if (error) {
            return <ErrorDisplay message={error} onDismiss={onDismissError} />
        }
        
        if (generatedVideo) {
             return (
                <div id="videoContainer" className="video-container relative w-full h-full flex flex-col items-center justify-center">
                    <video 
                        src={generatedVideo} 
                        controls 
                        autoPlay 
                        loop 
                        muted
                        className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
                    />
                    <div className="actions-bar absolute bottom-4 w-full flex justify-center items-center gap-2 px-4">
                        <button onClick={() => downloadAsset(generatedVideo, true)} className="action-btn bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105">💾 Salvar Vídeo</button>
                    </div>
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
                    
                    <div className="actions-bar absolute bottom-4 w-full flex justify-center items-center gap-2 px-4">
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