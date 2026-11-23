// Comunicação com a API REST do Trabalho Prático 1.
// O front-end é servido pela própria aplicação ASP.NET Core, então os endereços
// são relativos e não há configuração de porta nem de CORS.

const API = '/api';

/**
 * Monta a query string descartando os campos que o usuário deixou em branco.
 * É o que permite que os mesmos filtros sirvam para "buscar tudo" e para
 * "buscar com um ou mais critérios".
 */
function montarConsulta(filtros) {
    const parametros = new URLSearchParams();

    for (const [campo, valor] of Object.entries(filtros)) {
        if (valor !== null && valor !== undefined && String(valor).trim() !== '') {
            parametros.append(campo, String(valor).trim());
        }
    }

    const texto = parametros.toString();
    return texto ? `?${texto}` : '';
}

/** Lê a mensagem de erro devolvida pela API, seja ela do controller ou da validação. */
async function lerErro(resposta) {
    let corpo = null;

    try {
        corpo = await resposta.json();
    } catch {
        return `Erro ${resposta.status} ao comunicar com o servidor.`;
    }

    if (corpo && corpo.mensagem) {
        return corpo.mensagem;
    }

    // Erros de Data Annotations chegam no formato ProblemDetails, com os campos em "errors"
    if (corpo && corpo.errors) {
        const mensagens = Object.values(corpo.errors).flat();
        if (mensagens.length > 0) return mensagens.join(' ');
    }

    return `Erro ${resposta.status} ao comunicar com o servidor.`;
}

async function listar(recurso, filtros = {}) {
    const resposta = await fetch(`${API}/${recurso}${montarConsulta(filtros)}`);
    if (!resposta.ok) throw new Error(await lerErro(resposta));
    return resposta.json();
}

async function buscarPorId(recurso, id) {
    const resposta = await fetch(`${API}/${recurso}/${id}`);
    if (!resposta.ok) throw new Error(await lerErro(resposta));
    return resposta.json();
}

async function criar(recurso, dados) {
    const resposta = await fetch(`${API}/${recurso}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    if (!resposta.ok) throw new Error(await lerErro(resposta));
    return resposta.json();
}

async function atualizar(recurso, id, dados) {
    const resposta = await fetch(`${API}/${recurso}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    if (!resposta.ok) throw new Error(await lerErro(resposta));
    return resposta.json();
}

async function excluir(recurso, id) {
    const resposta = await fetch(`${API}/${recurso}/${id}`, { method: 'DELETE' });
    if (!resposta.ok) throw new Error(await lerErro(resposta));
}

/** Consultas da terceira etapa (FiltrosController). */
async function consultar(rota, parametros = {}) {
    const resposta = await fetch(`${API}/Filtros/${rota}${montarConsulta(parametros)}`);
    if (!resposta.ok) throw new Error(await lerErro(resposta));
    return resposta.json();
}
