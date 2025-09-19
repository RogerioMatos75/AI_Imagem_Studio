# 🎨 AI Image Studio Pro

Bem-vindo ao AI Image Studio Pro, uma aplicação web de nível profissional para geração e edição de imagens e vídeos com o poder da Inteligência Artificial do Google Gemini. Este estúdio foi projetado para ser uma ferramenta robusta no arsenal de artistas digitais, designers 3D e criadores de conteúdo, fornecendo um pipeline de criação de recursos visuais de ponta.

![Placeholder para Screenshot da UI do App](https://via.placeholder.com/1200x600.png?text=AI+Image+Studio+UI)

## ✨ Funcionalidades Principais

O estúdio é dividido em dois modos principais: **Criar** e **Editar**, cada um com um conjunto de funções especializadas.

### Modo Criar

1.  **✨ Prompt Livre**: A função base de texto-para-imagem. Descreva qualquer cena, objeto ou conceito e a IA o criará para você.
2.  **🏷️ Adesivos**: Gera adesivos vibrantes no estilo "die-cut", perfeitos para mídias sociais ou projetos de design.
3.  **📝 Logo**: Cria logos tipográficos limpos e modernos a partir de um nome ou frase.
4.  **💭 HQ (Quadrinhos)**: Produz ilustrações no estilo de painéis de histórias em quadrinhos, com linhas ousadas e cores dinâmicas.
5.  **💀 Esqueleto 3D**: Uma ferramenta poderosa para modeladores 3D. Gere folhas de personagem (character sheets) com vistas ortogonais (frente, costas, esquerda, direita) em uma pose-T perfeita, a partir de um prompt de texto ou de uma imagem de conceito existente.
6.  **🧸 Miniatura**: Transforme uma imagem de referência em uma fotografia comercial de alta qualidade de uma miniatura em escala, com ambiente de estúdio e detalhes realistas.
7.  **🧊 Colmap**: Otimizado para fotogrametria e NeRF. Gera uma imagem-chave (keyframe) cinematográfica e fotorrealista de um objeto sobre uma base com marcadores geométricos de alto contraste, ideal para rastreamento 3D.
8.  **🎬 Animar Cena**: Leva a função Colmap um passo adiante, gerando um vídeo orbital de 7 segundos em 4K. A câmera gira 360 graus em torno do objeto de referência, com um leve desvio para criar um forte efeito de paralaxe, perfeito para pipelines de reconstrução 3D.

### Modo Editar

1.  **➕ Adicionar/Remover**: Edite imagens de forma intuitiva descrevendo o que você quer adicionar, remover ou modificar em uma área específica.
2.  **🎯 Retoque**: Realize retoques gerais na imagem para melhorar a qualidade visual.
3.  **🎨 Estilo**: Aplique um novo estilo artístico à sua imagem.
4.  **🖼️ Unir**: Componha duas imagens, descrevendo como elas devem ser mescladas.

### Recursos Gerais da Aplicação

-   **Upload de Referência**: Utilize suas próprias imagens como ponto de partida para a maioria das funções.
-   **Controle de Proporção**: Escolha entre formatos como 1:1, 16:9, 9:16, 4:3 e 3:4.
-   **Design Responsivo**: Interface totalmente funcional em desktops e dispositivos móveis.
-   **Persistência de Sessão**: Suas últimas configurações (prompt, imagens, funções) são salvas localmente para sua conveniência.
-   **Fluxo de Trabalho Integrado**: Salve suas criações ou envie-as diretamente para o modo de edição com um clique.
-   **Feedback de Carregamento Dinâmico**: Mensagens de status informativas durante processos demorados, como a geração de vídeo.
-   **Tratamento de Erros Amigável**: Mensagens claras que ajudam o usuário a corrigir problemas.

## 🛠️ Stack Tecnológica

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **API de Inteligência Artificial**: Google Gemini API
    -   **Geração de Imagem**: `imagen-4.0-generate-001`
    -   **Edição Multimodal**: `gemini-2.5-flash-image-preview`
    -   **Geração de Vídeo**: `veo-2.0-generate-001`

## 🚀 Como Executar o Projeto

A aplicação foi projetada para ser executada em um ambiente onde as variáveis de ambiente possam ser gerenciadas com segurança.

### Pré-requisitos

-   Um servidor web simples (ex: `npx serve` ou a extensão Live Server do VS Code).
-   Uma chave de API válida do Google Gemini.

### Configuração

1.  **Chave de API**: A aplicação espera que a chave da API do Gemini esteja disponível como uma variável de ambiente chamada `process.env.API_KEY`. Você deve configurar seu ambiente de hospedagem para fornecer essa variável ao código do lado do cliente.

    **Aviso de Segurança**: Nunca exponha sua chave de API diretamente no código do lado do cliente em um ambiente de produção público. Use um backend (como um Cloud Function ou um servidor Node.js) para atuar como um proxy, mantendo a chave segura.

2.  **Servindo os Arquivos**:
    -   Coloque todos os arquivos do projeto (`index.html`, `index.tsx`, `components/`, etc.) em um diretório.
    -   Use um servidor local para servir o diretório. Um método fácil é usar o `serve`:
      ```bash
      npx serve .
      ```
    -   Abra o endereço fornecido (geralmente `http://localhost:3000`) no seu navegador.

## 📂 Estrutura do Projeto

```
/
├── components/
│   ├── ErrorDisplay.tsx
│   ├── FunctionCard.tsx
│   ├── LeftPanel.tsx
│   ├── MobileModal.tsx
│   ├── RightPanel.tsx
│   └── UploadArea.tsx
├── services/
│   ├── geminiService.ts
│   └── meshService.ts (Hipotético)
├── App.tsx
├── index.html
├── index.tsx
├── metadata.json
├── README.md
└── types.ts
```

## 🤝 Como Contribuir

Contribuições são bem-vindas! Se você tiver ideias para novas funcionalidades, melhorias na interface ou correções de bugs, sinta-se à vontade para abrir uma issue ou enviar um pull request.

1.  Faça um Fork do repositório.
2.  Crie uma nova branch (`git checkout -b feature/nova-feature`).
3.  Faça suas alterações e commit (`git commit -m 'Adiciona nova-feature'`).
4.  Envie para a sua branch (`git push origin feature/nova-feature`).
5.  Abra um Pull Request.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.
