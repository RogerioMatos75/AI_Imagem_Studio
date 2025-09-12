
import React from 'react';

interface ErrorDisplayProps {
    message: string;
    onDismiss: () => void;
}

interface FriendlyError {
    title: string;
    suggestion: string;
}

const getFriendlyError = (message: string): FriendlyError => {
    if (message.toLowerCase().includes('api key')) {
        return {
            title: 'Erro de Autenticação',
            suggestion: 'Sua chave de API parece estar inválida ou faltando. Por favor, verifique suas configurações.'
        };
    }
    if (message.includes('Por favor, insira um prompt')) {
        return {
            title: 'Prompt Vazio',
            suggestion: 'Você precisa descrever a imagem que deseja criar no campo de texto.'
        };
    }
     if (message.includes('descreva a edição')) {
        return {
            title: 'Descrição da Edição Faltando',
            suggestion: 'Por favor, explique qual alteração você gostaria de fazer na imagem.'
        };
    }
    if (message.includes('são necessárias duas imagens')) {
        return {
            title: 'Imagens Faltando',
            suggestion: 'A função "Unir" requer que você envie duas imagens para funcionar.'
        };
    }
    if (message.includes('envie uma imagem para editar')) {
        return {
            title: 'Imagem Faltando',
            suggestion: 'Para editar, você primeiro precisa carregar uma imagem.'
        };
    }
    if (message.includes('Para a função Miniatura, é necessário enviar uma imagem.')) {
        return {
            title: 'Imagem Faltando',
            suggestion: 'A função "Miniatura" requer que você envie uma imagem do modelo para funcionar.'
        };
    }
     if (message.includes('A API não retornou uma imagem')) {
        return {
            title: 'Falha na Geração',
            suggestion: 'A IA não conseguiu gerar uma imagem com a sua solicitação. Tente reformular seu prompt ou tente novamente mais tarde.'
        };
    }

    return {
        title: 'Ocorreu um Erro Inesperado',
        suggestion: message
    };
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onDismiss }) => {
    const { title, suggestion } = getFriendlyError(message);

    return (
        <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-6 w-full max-w-md mx-auto text-center text-white relative">
            <button
                onClick={onDismiss}
                className="absolute top-2 right-2 text-red-300 hover:text-white transition-colors"
                aria-label="Fechar erro"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-300 mb-2">{title}</h3>
            <p className="text-red-200">{suggestion}</p>
        </div>
    );
};
