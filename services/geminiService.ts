import { GoogleGenAI, Modality } from "@google/genai";
import { CreateFunction, EditFunction, ImageFile, OrthoView, AspectRatio } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getAugmentedPrompt = (prompt: string, func: CreateFunction, view: OrthoView = 'front'): string => {
    switch (func) {
        case CreateFunction.Sticker:
            return `A die-cut sticker of ${prompt}, vibrant colors, high contrast, isolated on a white background.`;
        case CreateFunction.Text:
            return `A typographic logo design for "${prompt}", clean, modern, vector style, high resolution.`;
        case CreateFunction.Comic:
            return `A comic book panel illustration of ${prompt}, in a dynamic, action-packed style with bold lines and vibrant colors, speech bubbles if necessary.`;
        case CreateFunction.Skeleton:
            const basePrompt = `Professional character design sheet for a 3D model of '${prompt}'. Masterpiece quality, 8k resolution, ultra-detailed, and intricately designed. The character is depicted in full body, vibrant color with cinematic lighting, emphasizing detailed textures and materials. The style should be a high-quality digital painting, suitable for concept art trending on ArtStation. The character must be in a perfect T-pose (arms straight out to the sides, parallel to the ground) with hands open and palms flat, fingers straight and held close together (but not touching), with palms facing completely downwards. The legs should be in a neutral A-pose (feet slightly apart). The view is an orthographic projection isolated on a pure white background with no shadows, ideal for 3D modeling reference.`;
            switch(view) {
                case 'front':
                    return `${basePrompt} Front view.`;
                case 'back':
                    return `${basePrompt} Back view.`;
                case 'side_left':
                    return `${basePrompt} Left side view.`;
                case 'side_right':
                    return `${basePrompt} Right side view.`;
                default:
                    return `${basePrompt} Front view.`;
            }
        case CreateFunction.Free:
        default:
            return prompt;
    }
}

export const generateImageApi = async (prompt: string, createFunction: CreateFunction, view: OrthoView | undefined, aspectRatio: AspectRatio, image: ImageFile | null): Promise<string> => {
    if (createFunction === CreateFunction.Colmap) {
        if (!image) {
            throw new Error("Para a função Colmap, é necessário enviar uma imagem de referência.");
        }

        const colmapPrompt = `Generate a cinematic, photorealistic 4K keyframe image. A realistic statuette of the character from the reference image stands still in the center.

**Base and Environment:** The character is on a simple, circular, matte gray concrete base. The base MUST feature high-contrast, non-repeating geometric markers (like checker patterns or fiducial markers) clearly visible on its surface to serve as tracking points for photogrammetry. The environment is a detailed skyscraper rooftop with industrial textures: concrete slabs and metal railings under a late afternoon sky.

**Lighting and Camera:** Use soft, directional sunlight to cast long shadows and subtle highlights on the character. Simulate a cinematic full-frame camera with a 35mm lens, creating a shallow depth of field.

**Composition:** The image must be full-frame and edge-to-edge clear. No vignettes, circular masks, or blurry edges. Maintain sharp focus on the character. The style is photorealistic, ensuring consistent lighting and texture detail, making it a perfect reference for NeRF training.`;

        const parts: any[] = [
            { inlineData: { data: image.base64, mimeType: image.mimeType } },
            { text: colmapPrompt }
        ];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                }
            }
        }
        throw new Error('A API não retornou uma imagem para a função Colmap. Tente novamente.');
    }
    
    if (createFunction === CreateFunction.Miniature) {
        if (!image) {
            throw new Error("Para a função Miniatura, é necessário enviar uma imagem.");
        }

        // Etapa 1: Identificar o modelo na imagem para melhorar o prompt
        const identifyPrompt = "Identifique o modelo principal nesta imagem (ex: carro, personagem, objeto). Responda apenas com o nome do modelo, de forma curta e descritiva.";
        const identifyResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: image.base64, mimeType: image.mimeType } },
                    { text: identifyPrompt }
                ]
            },
        });
        
        const modelName = identifyResponse.text.trim() || 'modelo da imagem'; // Fallback

        // Etapa 2: Gerar a imagem da miniatura com o nome do modelo identificado
        const miniatureBasePrompt = `Crie uma fotografia comercial de alta qualidade de uma miniatura em escala 1/7 de um(a) **${modelName}**, baseada na imagem fornecida, em estilo realista. A miniatura está sobre uma mesa de computador em um ambiente de estúdio. A miniatura tem uma base de acrílico redonda e transparente. Ao fundo, uma tela de computador exibe uma sessão de modelagem 3D desta miniatura. Ao lado da tela, há uma caixa de embalagem de brinquedo no estilo BANDAI com arte 2D original do modelo. A composição geral deve ser limpa e profissional. Se possível, a imagem final deve ter uma proporção de 16:9 (widescreen).`;
        
        const finalPrompt = prompt ? `${miniatureBasePrompt}\n\nDetalhes adicionais do usuário: ${prompt}` : miniatureBasePrompt;
        
        const imageGenParts: any[] = [
            { inlineData: { data: image.base64, mimeType: image.mimeType } },
            { text: finalPrompt }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: imageGenParts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                }
            }
        }
        throw new Error('A API não retornou uma imagem para a função Miniatura. Tente novamente.');
    }
    
    const augmentedPrompt = getAugmentedPrompt(prompt, createFunction, view);
    
    // Logic for multimodal (image + text) or text-only generation
    if (image) {
        const parts: any[] = [
            { inlineData: { data: image.base64, mimeType: image.mimeType } },
            { text: augmentedPrompt }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                }
            }
        }
        throw new Error('A API não retornou uma imagem ao usar a imagem de referência. Tente novamente.');
    } else {
        // Default text-to-image generation logic
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: augmentedPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }

        throw new Error("Image generation failed or returned no images.");
    }
};

export const generateVideoApi = async (prompt: string, image: ImageFile): Promise<string> => {
    const videoBasePrompt = `CRITICAL INSTRUCTION 1: The output video MUST be a SQUARE (1:1 aspect ratio).
CRITICAL INSTRUCTION 2: The video must start CLEANLY. The very first frame MUST be the intended scene. There should be absolutely no preceding frames, flashes, black frames, or distorted images.
CRITICAL INSTRUCTION 3: You MUST faithfully reproduce all details from the reference image. The character, its base, and especially the geometric markers on the base MUST be identical to the provided image. Do not alter, omit, or regenerate these elements. The goal is to animate the provided image, not to create a new one.

Create a SQUARE video with a total duration of exactly 5 seconds, in 4K resolution, that loops perfectly. The video animates the scene from the reference image, featuring the realistic statuette.

**Video Structure (Total 5 seconds):**
-   **Seconds 0-1 (The Clean Start):** The video MUST begin immediately with a perfectly static, clear, 1-second shot of the character as seen in the reference image. The first frame of the video file must be this static shot. Do not include any fade-in effects, transitions, or visual artifacts.
-   **Seconds 1-5 (The Motion):** Immediately following the first static second, the camera begins a 4-second continuous motion.

**Scene and Details (from reference image):**
The character, base, environment, and all visual elements (including the crucial high-contrast geometric markers for photogrammetry on the base) MUST be preserved exactly as they appear in the reference image. The environment, a detailed skyscraper rooftop with industrial textures under late afternoon lighting, should be coherently extended into a 360-degree panoramic view for the camera orbit.

**Camera and Motion (during seconds 1-5):** Over these 4 seconds, the camera must perform a single, smooth, complete 360-degree orbit around the character. It should also have a slight vertical and horizontal drift (±5cm) to create a strong parallax effect, essential for 3D reconstruction. Simulate a cinematic full-frame camera with a 35mm lens, shallow depth of field, and high shutter speed.

**Video Quality and Aspect Ratio (CRITICAL):**
The final output MUST be a SQUARE video with a 1:1 aspect ratio (e.g., 1080x1080 pixels). It is absolutely critical that the final video is NOT widescreen (16:9 or similar). The video must be full-frame and edge-to-edge clear. No vignettes, circular masks, black bars, or blurry edges. Maintain sharp focus on the character with minimal motion blur. Photorealistic. No audio. Ensure consistent lighting and texture detail across all frames for optimal NeRF training.`;

    const finalPrompt = prompt ? `${videoBasePrompt}\n\nDetalhes adicionais do usuário: ${prompt}` : videoBasePrompt;

    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: finalPrompt,
        image: {
            imageBytes: image.base64,
            mimeType: image.mimeType,
        },
        config: {
            numberOfVideos: 1
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error('A operação de vídeo foi concluída, mas nenhum link de download foi encontrado.');
    }
    
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    
    if (!videoResponse.ok) {
        throw new Error(`Falha ao baixar o vídeo gerado. Status: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

const skeletonFromImageBasePrompt = `Using the provided image as a reference, transform the character into a professional character design sheet for a 3D model. Masterpiece quality, 8k resolution, ultra-detailed, and intricately designed. The character must be depicted in full body, vibrant color with cinematic lighting, emphasizing detailed textures and materials. The style should be a high-quality digital painting, suitable for concept art trending on ArtStation. The character must be in a perfect T-pose (arms straight out to the sides, parallel to the ground) with hands open and palms flat, fingers straight and held close together (but not touching), with palms facing completely downwards. The legs should be in a neutral A-pose (feet slightly apart). The view is an orthographic projection isolated on a pure white background with no shadows, ideal for 3D modeling reference.`;

const getSkeletonFromImageViewPrompt = (view: OrthoView = 'front'): string => {
    switch(view) {
        case 'front':
            return `${skeletonFromImageBasePrompt} Front view.`;
        case 'back':
            return `${skeletonFromImageBasePrompt} Back view.`;
        case 'side_left':
            return `${skeletonFromImageBasePrompt} Left side view.`;
        case 'side_right':
            return `${skeletonFromImageBasePrompt} Right side view.`;
        default:
            return `${skeletonFromImageBasePrompt} Front view.`;
    }
}

export const transformImageToSkeletonApi = async (sourceImage: ImageFile, view: OrthoView): Promise<string> => {
    const prompt = getSkeletonFromImageViewPrompt(view);
    
    const parts: any[] = [
        { inlineData: { data: sourceImage.base64, mimeType: sourceImage.mimeType } },
        { text: prompt }
    ];
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    if (response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
    }

    throw new Error('A API não retornou uma imagem. Tente novamente.');
};


export const editImageApi = async (prompt: string, editFunction: EditFunction, image1: ImageFile | null, image2: ImageFile | null): Promise<string> => {
    if (!image1) {
        throw new Error("Primary image is required for editing.");
    }
    
    const parts: any[] = [{
      inlineData: { data: image1.base64, mimeType: image1.mimeType }
    }];

    if (editFunction === EditFunction.Compose && image2) {
        parts.push({
            inlineData: { data: image2.base64, mimeType: image2.mimeType }
        });
    }

    parts.push({ text: prompt });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    if (response.candidates && response.candidates.length > 0 && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
    }

    throw new Error('A API não retornou uma imagem. Tente novamente.');
};