
import React from 'react';

interface FunctionCardProps {
    icon: string;
    name: string;
    isActive: boolean;
    onClick: () => void;
}

export const FunctionCard: React.FC<FunctionCardProps> = ({ icon, name, isActive, onClick }) => {
    return (
        <div 
            className={`function-card flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition duration-200 border-2 ${isActive ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-transparent hover:bg-gray-600 text-gray-300'}`}
            onClick={onClick}
        >
            <div className="text-2xl">{icon}</div>
            <div className="text-sm font-medium mt-1 text-center">{name}</div>
        </div>
    );
};
