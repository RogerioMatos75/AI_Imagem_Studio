
import React from 'react';
import { Mode, CreateFunction, EditFunction, ImageFile, AspectRatio } from '../types';
import { FunctionCard } from './FunctionCard';
import { UploadArea } from './UploadArea';

interface LeftPanelProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    mode: Mode;
    setMode: (mode: Mode) => void;
    createFunction: CreateFunction;
    setCreateFunction: (func: CreateFunction) => void;
    editFunction: EditFunction;
    setEditFunction: (func: EditFunction) => void;
    image1: ImageFile | null;
    setImage1: (file: ImageFile | null) => void;
    image2: ImageFile | null;
    setImage2: (file: ImageFile | null) => void;
    isLoading: boolean;
    onGenerate: () => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    onReset: () => void;
}

const createFunctions = [
    { key: CreateFunction.Free, icon: "✨", name: "Prompt" },
    { key: CreateFunction.Sticker, icon: "🏷️", name: "Adesivos" },
    { key: CreateFunction.Text, icon: "📝", name: "Logo" },
    { key: CreateFunction.Comic, icon: "💭", name: "HQ" },
    { key: CreateFunction.Skeleton, icon: "💀", name: "Esqueleto 3D" },
    { key: CreateFunction.Miniature, icon: "🧸", name: "Miniatura" },
];

const editFunctions = [
    { key: EditFunction.AddRemove, icon: "➕", name: "Adicionar" },
    { key: EditFunction.Retouch, icon: "🎯", name: "Retoque" },
    { key: EditFunction.Style, icon: "🎨", name: "Estilo" },
    { key: EditFunction.Compose, icon: "🖼️", name: "Unir" },
];

const aspectRatios: { key: AspectRatio; name: string }[] = [
    { key: '1:1', name: 'Quadrado' },
    { key: '16:9', name: 'Widescreen' },
    { key: '9:16', name: 'Vertical' },
    { key: '4:3', name: 'Paisagem' },
    { key: '3:4', name: 'Retrato' },
];


export const LeftPanel: React.FC<LeftPanelProps> = ({
    prompt, setPrompt, mode, setMode, createFunction, setCreateFunction,
    editFunction, setEditFunction, image1, setImage1, image2, setImage2,
    isLoading, onGenerate, aspectRatio, setAspectRatio, onReset
}) => {
    const isComposeSelected = mode === Mode.Edit && editFunction === EditFunction.Compose;

    const handleImageUpload = (file: File | null, setter: (img: ImageFile | null) => void) => {
        if (!file) {
            setter(null);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            setter({ base64: base64String, mimeType: file.type });
        };
        reader.readAsDataURL(file);
    };

    const handleCreateFunctionClick = (func: CreateFunction) => {
        setCreateFunction(func);
        if (func === CreateFunction.Miniature) {
            setAspectRatio('16:9');
        } else {
            // Reset aspect ratio if switching away from Miniature to a default
            if(createFunction === CreateFunction.Miniature) {
                setAspectRatio('1:1');
            }
        }
    };

    const isMiniature = mode === Mode.Create && createFunction === CreateFunction.Miniature;
    const placeholderText = isMiniature
        ? "O modelo será identificado automaticamente. Adicione detalhes opcionais (ex: cores específicas, marcas)..."
        : "Descreva a imagem ou modelo que você deseja criar...";

    return (
        <div className="left-panel w-full md:w-1/3 bg-gray-800 p-6 flex flex-col space-y-4 md:overflow-y-auto md:h-screen">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="panel-title text-3xl font-bold text-white">🎨 AI Image Studio</h1>
                    <p className="panel-subtitle text-gray-400">Gerador profissional de imagens e modelos 3D</p>
                </div>
                <button
                    onClick={onReset}
                    title="Reiniciar Aplicativo"
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors"
                    aria-label="Reiniciar aplicativo"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.182-3.182m0-4.991v4.99" />
                    </svg>
                </button>
            </header>
            
            <div className="prompt-section">
                <div className="section-title font-semibold text-gray-300 mb-2">💭 Descreva sua ideia</div>
                <textarea
                    id="prompt"
                    className="prompt-input w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 h-28 resize-none"
                    placeholder={placeholderText}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

             <div className="reference-image-section">
                <div className="section-title font-semibold text-gray-300 mb-2">📸 Imagem de Referência (Opcional)</div>
                <UploadArea
                    id="primary"
                    title="Clique ou arraste uma imagem"
                    subtext="PNG, JPG, WebP (máx. 10MB)"
                    imageFile={image1}
                    onImageSelect={(file) => handleImageUpload(file, setImage1)}
                    isDual={false}
                />
            </div>
            
            <div className="mode-toggle grid grid-cols-2 gap-2 bg-gray-700 p-1 rounded-lg">
                <button
                    className={`mode-btn py-2 rounded-md transition duration-200 font-semibold ${mode === 'create' ? 'bg-blue-600 text-white' : 'hover:bg-gray-600 text-gray-300'}`}
                    data-mode="create"
                    onClick={() => setMode(Mode.Create)}
                >
                    Criar
                </button>
                <button
                    className={`mode-btn py-2 rounded-md transition duration-200 font-semibold ${mode === 'edit' ? 'bg-blue-600 text-white' : 'hover:bg-gray-600 text-gray-300'}`}
                    data-mode="edit"
                    onClick={() => setMode(Mode.Edit)}
                >
                    Editar
                </button>
            </div>
            
            {mode === Mode.Create && (
                <>
                    <div id="createFunctions" className="functions-section">
                         <div className="section-title font-semibold text-gray-300 mb-2">✨ Funções de Criação</div>
                        <div className="functions-grid grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {createFunctions.map(fn => (
                                <FunctionCard
                                    key={fn.key}
                                    icon={fn.icon}
                                    name={fn.name}
                                    isActive={createFunction === fn.key}
                                    onClick={() => handleCreateFunctionClick(fn.key)}
                                />
                            ))}
                        </div>
                    </div>
                    {createFunction !== CreateFunction.Miniature && createFunction !== CreateFunction.Skeleton && !image1 && (
                        <div className="aspect-ratio-section">
                            <div className="section-title font-semibold text-gray-300 mb-2">📐 Proporção da Imagem</div>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {aspectRatios.map(ratio => (
                                    <button
                                        key={ratio.key}
                                        onClick={() => setAspectRatio(ratio.key)}
                                        className={`py-2 px-1 text-xs sm:text-sm rounded-md transition duration-200 font-semibold ${aspectRatio === ratio.key ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                                    >
                                        {ratio.name} ({ratio.key})
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
            
            {mode === Mode.Edit && (
                 <div id="editFunctions" className="functions-section">
                    <div className="section-title font-semibold text-gray-300 mb-2">🛠️ Funções de Edição</div>
                     <div className="functions-grid grid grid-cols-2 sm:grid-cols-4 gap-3">
                         {editFunctions.map(fn => (
                            <FunctionCard
                                key={fn.key}
                                icon={fn.icon}
                                name={fn.name}
                                isActive={editFunction === fn.key}
                                onClick={() => setEditFunction(fn.key)}
                            />
                        ))}
                     </div>
                 </div>
            )}

            {isComposeSelected && (
                <div id="composeSection" className="functions-section flex flex-col space-y-2">
                     <div className="section-title font-semibold text-gray-300">🖼️ Imagem Secundária (para Unir)</div>
                     <UploadArea
                        id="2"
                        title="Segunda Imagem"
                        subtext="Arraste ou clique aqui"
                        imageFile={image2}
                        onImageSelect={(file) => handleImageUpload(file, setImage2)}
                        isDual={true}
                     />
                </div>
            )}
            
            <div className="mt-auto pt-4">
                 <button 
                    id="generateBtn"
                    className="generate-btn w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onGenerate}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="spinner w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                    ) : (
                        <span className="btn-text">🚀 Gerar</span>
                    )}
                </button>
            </div>
        </div>
    );
};
