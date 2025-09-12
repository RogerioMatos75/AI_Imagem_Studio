const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generate3dModelApi = async (prompt: string): Promise<string> => {
    // Nota: Este serviço usa uma estrutura de API hipotética para mesh.ai
    if (!process.env.MESH_API_KEY) {
        throw new Error("A variável de ambiente MESH_API_KEY não está definida.");
    }
    const MESH_API_KEY = process.env.MESH_API_KEY;
    const MESH_API_BASE = 'https://api.mesh.ai/v1'; // Endpoint hipotético

    // 1. Requisição inicial para gerar o modelo
    const createResponse = await fetch(`${MESH_API_BASE}/tasks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${MESH_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
    });

    if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({ message: createResponse.statusText }));
        throw new Error(`Erro na API: ${errorData.message || 'Falha ao iniciar a geração do modelo 3D'}`);
    }

    const { task_id } = await createResponse.json();

    if (!task_id) {
        throw new Error("A API não retornou um task_id para a geração do modelo 3D.");
    }

    // 2. Polling pelo resultado
    const maxAttempts = 60; // Fazer polling por até 10 minutos (60 * 10s)
    for (let i = 0; i < maxAttempts; i++) {
        await sleep(10000); // Fazer polling a cada 10 segundos
        
        const statusResponse = await fetch(`${MESH_API_BASE}/tasks/${task_id}`, {
            headers: { 'Authorization': `Bearer ${MESH_API_KEY}` }
        });

        if (statusResponse.ok) {
            const result = await statusResponse.json();
            if (result.status === 'completed' && result.asset_url) {
                return result.asset_url; // Sucesso
            } else if (result.status === 'failed') {
                throw new Error(`A geração do modelo 3D falhou. Motivo: ${result.error || 'Desconhecido'}`);
            }
            // se o status for 'processing', continua o polling.
        }
    }
    
    throw new Error("A geração do modelo 3D expirou após 10 minutos.");
};
