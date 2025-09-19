
import React, { useState, useCallback, useEffect } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { MobileModal } from './components/MobileModal';
import { generateImageApi, editImageApi, transformImageToSkeletonApi } from './services/geminiService';
import { Mode, CreateFunction, EditFunction, ImageFile, OrthoView, AspectRatio } from './types';

const STORAGE_KEY = 'ai-image-studio-settings';

interface StoredSettings {
    prompt: string;
    mode: Mode;
    createFunction: CreateFunction;
    editFunction: EditFunction;
    image1: ImageFile | null;
    image2: ImageFile | null;
    aspectRatio: AspectRatio;
}


const App: React.FC = () => {
    const [initialState] = useState(() => {
        try {
            const savedSettings = localStorage.getItem(STORAGE_KEY);
            if (savedSettings) {
                return JSON.parse(savedSettings) as StoredSettings;
            }
        } catch (e) {
            console.error("Failed to parse saved settings:", e);
        }
        // Default state if nothing is saved or parsing fails
        return {
            prompt: '',
            mode: Mode.Create,
            createFunction: CreateFunction.Free,
            editFunction: EditFunction.AddRemove,
            image1: null,
            image2: null,
            aspectRatio: '1:1' as AspectRatio,
        };
    });


    const [prompt, setPrompt] = useState<string>(initialState.prompt);
    const [mode, setMode] = useState<Mode>(initialState.mode);
    const [createFunction, setCreateFunction] = useState<CreateFunction>(initialState.createFunction);
    const [editFunction, setEditFunction] = useState<EditFunction>(initialState.editFunction);
    const [image1, setImage1] = useState<ImageFile | null>(initialState.image1);
    const [image2, setImage2] = useState<ImageFile | null>(initialState.image2);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialState.aspectRatio);
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [lastCreateFunction, setLastCreateFunction] = useState<CreateFunction | null>(null);
    const [lastSuccessfulPrompt, setLastSuccessfulPrompt] = useState<string>('');
    const [skeletonSourceImage, setSkeletonSourceImage] = useState<ImageFile | null>(null);

    useEffect(() => {
        const settingsToSave: StoredSettings = {
            prompt,
            mode,
            createFunction,
            editFunction,
            image1,
            image2,
            aspectRatio,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
    }, [prompt, mode, createFunction, editFunction, image1, image2, aspectRatio]);


    const resetToDefaults = () => {
        if (window.confirm("Você tem certeza que deseja reiniciar o aplicativo? Todas as configurações e imagens atuais serão perdidas.")) {
            setPrompt('');
            setMode(Mode.Create);
            setCreateFunction(CreateFunction.Free);
            setEditFunction(EditFunction.AddRemove);
            setImage1(null);
            setImage2(null);
            setGeneratedImage(null);
            setError(null);
            setIsLoading(false);
            setLastCreateFunction(null);
            setLastSuccessfulPrompt('');
            setSkeletonSourceImage(null);
            setAspectRatio('1:1');
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (isLoading) return;
        
        setError(null);
        setIsLoading(true);
        setGeneratedImage(null);
        setSkeletonSourceImage(null);

        try {
            if (mode === Mode.Create) {
                if (!prompt && !image1) {
                    throw new Error('Por favor, insira um prompt ou uma imagem de referência para criar.');
                }
                
                const resultImage = await generateImageApi(prompt, createFunction, undefined, aspectRatio, image1);
                if (resultImage) {
                    setGeneratedImage(resultImage);
                    setLastCreateFunction(createFunction);
                    setLastSuccessfulPrompt(prompt); // Always save prompt on success
                    if (window.innerWidth < 768) {
                        setIsModalOpen(true);
                    }
                } else {
                    throw new Error('A API não retornou uma imagem. Tente novamente.');
                }
            } else { // Mode.Edit
                if (!prompt) {
                    throw new Error('Por favor, descreva a edição que você deseja fazer.');
                }
                const isCompose = editFunction === EditFunction.Compose;
                if(isCompose && (!image1 || !image2)) {
                    throw new Error('Para unir imagens, são necessárias duas imagens.');
                }
                if(!isCompose && !image1) {
                    throw new Error('Por favor, envie uma imagem para editar.');
                }
                
                const resultImage = await editImageApi(prompt, editFunction, image1, isCompose ? image2 : null);
                if (resultImage) {
                    setGeneratedImage(resultImage);
                    setLastCreateFunction(null);
                    if (window.innerWidth < 768) {
                        setIsModalOpen(true);
                    }
                } else {
                     throw new Error('A API não retornou uma imagem. Tente novamente.');
                }
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, mode, prompt, createFunction, editFunction, image1, image2, aspectRatio]);
    
    const handleRegenerate = useCallback(async () => {
        // Only allow regenerate for create functions, not for skeletons which have their own flow
        if (isLoading || !lastSuccessfulPrompt || !lastCreateFunction || lastCreateFunction === CreateFunction.Skeleton) return;
        
        setError(null);
        setIsLoading(true);
        setGeneratedImage(null);

        try {
            // Check if the last generation used a reference image.
            // The `image1` state should still hold the source image if no other action was taken.
            const sourceImageForRegen = (lastCreateFunction === CreateFunction.Miniature || image1) ? image1 : null;

            const resultImage = await generateImageApi(lastSuccessfulPrompt, lastCreateFunction, undefined, aspectRatio, sourceImageForRegen);
            
            if (resultImage) {
                setGeneratedImage(resultImage);
                if (window.innerWidth < 768) {
                    setIsModalOpen(true);
                }
            } else {
                throw new Error('A API não retornou uma imagem. Tente novamente.');
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, lastSuccessfulPrompt, lastCreateFunction, aspectRatio, image1]);

    const handleGenerateOrthoView = useCallback(async (view: OrthoView) => {
        if (isLoading) return;

        const isImageToSkeleton = !!skeletonSourceImage;
        const isTextToSkeleton = !isImageToSkeleton && !!lastSuccessfulPrompt;

        if (!isImageToSkeleton && !isTextToSkeleton) return;
        
        setError(null);
        setIsLoading(true);
        setGeneratedImage(null);

        try {
            let resultImage: string | null = null;
            if (isImageToSkeleton) {
                resultImage = await transformImageToSkeletonApi(skeletonSourceImage, view);
            } else if (isTextToSkeleton) {
                resultImage = await generateImageApi(lastSuccessfulPrompt, CreateFunction.Skeleton, view, '1:1', null);
            }

            if (resultImage) {
                setGeneratedImage(resultImage);
                setLastCreateFunction(CreateFunction.Skeleton);
                if (window.innerWidth < 768) {
                    setIsModalOpen(true);
                }
            } else {
                throw new Error('A API não retornou uma imagem. Tente novamente.');
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, lastSuccessfulPrompt, skeletonSourceImage]);
    
    const handleGenerateSkeletonFromPrompt = useCallback(async () => {
        if (isLoading || !generatedImage) return;
        
        setError(null);
        setIsLoading(true);
        setGeneratedImage(null);
        setLastSuccessfulPrompt('');
    
        try {
            const mimeTypeMatch = generatedImage.match(/data:(.*);base64,/);
            if (!mimeTypeMatch) {
                throw new Error("Não foi possível determinar o tipo de mime da imagem.");
            }
            const mimeType = mimeTypeMatch[1];
            const base64 = generatedImage.split(',')[1];
            
            const sourceImageFile: ImageFile = { base64, mimeType };
            setSkeletonSourceImage(sourceImageFile);

            const resultImage = await transformImageToSkeletonApi(sourceImageFile, 'front');
    
            if (resultImage) {
                setGeneratedImage(resultImage);
                setLastCreateFunction(CreateFunction.Skeleton);
                if (window.innerWidth < 768) {
                    setIsModalOpen(true);
                }
            } else {
                throw new Error('A API não retornou uma imagem. Tente novamente.');
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, generatedImage]);


    const handleEditCurrentImage = () => {
        if (!generatedImage) return;
        
        const newImageFile: ImageFile = {
            base64: generatedImage.split(',')[1],
            mimeType: 'image/png'
        };
        
        setMode(Mode.Edit);
        setEditFunction(EditFunction.AddRemove);
        setCreateFunction(CreateFunction.Free)
        setPrompt('');
        setImage1(newImageFile);
        setImage2(null);
        setGeneratedImage(null);
        setError(null);
        setSkeletonSourceImage(null);
        setAspectRatio('1:1');

        if (window.innerWidth < 768) {
            setIsModalOpen(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-900 flex flex-col">
            <div className="flex flex-col md:flex-row w-full flex-grow">
                <LeftPanel
                    prompt={prompt}
                    setPrompt={setPrompt}
                    mode={mode}
                    setMode={setMode}
                    createFunction={createFunction}
                    setCreateFunction={setCreateFunction}
                    editFunction={editFunction}
                    setEditFunction={setEditFunction}
                    image1={image1}
                    setImage1={setImage1}
                    image2={image2}
                    setImage2={setImage2}
                    isLoading={isLoading}
                    onGenerate={handleGenerate}
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                    onReset={resetToDefaults}
                />
                <RightPanel
                    isLoading={isLoading}
                    generatedImage={generatedImage}
                    createFunction={createFunction}
                    error={error}
                    onEditCurrentImage={handleEditCurrentImage}
                    lastCreateFunction={lastCreateFunction}
                    lastPrompt={lastSuccessfulPrompt}
                    onGenerateOrthoView={handleGenerateOrthoView}
                    onGenerateSkeletonFromPrompt={handleGenerateSkeletonFromPrompt}
                    onDismissError={() => setError(null)}
                    onRegenerate={handleRegenerate}
                />
            </div>
            <MobileModal 
                isOpen={isModalOpen}
                generatedImage={generatedImage}
                onEdit={handleEditCurrentImage}
                onNew={() => {
                    resetToDefaults();
                    setIsModalOpen(false);
                }}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default App;
