
import React, { useRef } from 'react';
import { ImageFile } from '../types';

interface UploadAreaProps {
    id: string;
    title: string;
    subtext?: string;
    imageFile: ImageFile | null;
    onImageSelect: (file: File | null) => void;
    isDual: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ id, title, subtext, imageFile, onImageSelect, isDual }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        onImageSelect(file || null);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        onImageSelect(file || null);
        if (inputRef.current) {
            inputRef.current.files = event.dataTransfer.files;
        }
    };
    
    const baseClasses = "relative w-full border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition duration-200 flex items-center justify-center text-center text-gray-400";
    const dualClasses = isDual ? "h-28" : "flex-grow min-h-36 flex-col p-4";

    return (
        <div
            className={`${baseClasses} ${dualClasses}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id={`imageUpload${id}`}
                ref={inputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            {imageFile ? (
                <img
                    id={`imagePreview${id}`}
                    src={`data:${imageFile.mimeType};base64,${imageFile.base64}`}
                    alt="Preview"
                    className="image-preview absolute inset-0 w-full h-full object-cover rounded-lg"
                />
            ) : (
                <div className="flex flex-col items-center">
                    <div className="text-3xl">📁</div>
                    <div className="font-semibold">{title}</div>
                    {subtext && <div className="upload-text text-xs mt-1">{subtext}</div>}
                    {!subtext && isDual && <div className="upload-text text-xs mt-1">Clique para selecionar</div>}
                </div>
            )}
        </div>
    );
};
