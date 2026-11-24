// Funções usadas por todas as telas: formatação, avisos e controle dos modais.

const el = (seletor) => document.querySelector(seletor);
const todos = (seletor) => Array.from(document.querySelectorAll(seletor));

function escapar(texto) {
    if (texto === null || texto === undefined) return '';
    return String(texto)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return '—';
    return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarNumero(valor) {
    if (valor === null || valor === undefined) return '—';
    return Number(valor).toLocaleString('pt-BR');
}

/** Converte a data vinda da API (ISO) para o formato dd/mm/aaaa. */
function formatarData(iso) {
    if (!iso) return '—';
    const data = new Date(iso);
    if (Number.isNaN(data.getTime())) return '—';
    return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/** Converte a data vinda da API para o formato aceito por <input type="date">. */
function dataParaCampo(iso) {
    if (!iso) return '';
    return String(iso).substring(0, 10);
}

function formatarCpf(cpf) {
    if (!cpf) return '—';
    const digitos = String(cpf).replace(/\D/g, '');
    if (digitos.length !== 11) return cpf;
    return `${digitos.substring(0, 3)}.${digitos.substring(3, 6)}.${digitos.substring(6, 9)}-${digitos.substring(9)}`;
}

/** Formata telefones com DDD gravados só com números: 31977777777 vira (31) 97777-7777. */
function formatarTelefone(telefone) {
    if (!telefone) return '—';
    const digitos = String(telefone).replace(/\D/g, '');
    if (digitos.length === 11) {
        return `(${digitos.substring(0, 2)}) ${digitos.substring(2, 7)}-${digitos.substring(7)}`;
    }
    if (digitos.length === 10) {
        return `(${digitos.substring(0, 2)}) ${digitos.substring(2, 6)}-${digitos.substring(6)}`;
    }
    return telefone;
}

/** Aviso temporário no canto inferior direito. */
let temporizadorRecado = null;

function recado(texto, falha = false) {
    const caixa = el('#recado');
    if (!caixa) return;

    caixa.textContent = texto;
    caixa.classList.toggle('falha', falha);
    caixa.classList.add('visivel');

    clearTimeout(temporizadorRecado);
    temporizadorRecado = setTimeout(() => caixa.classList.remove('visivel'), 4000);
}

/** Abre e fecha os modais. O fechamento também responde à tecla Esc. */
function abrirModal(id) {
    el(id).classList.add('aberto');
}

function fecharModal(id) {
    el(id).classList.remove('aberto');
}

document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') {
        todos('.palco.aberto').forEach((palco) => palco.classList.remove('aberto'));
    }
});

/** Clique fora da janela fecha o modal. */
document.addEventListener('click', (evento) => {
    if (evento.target.classList.contains('palco')) {
        evento.target.classList.remove('aberto');
    }
});

/** Lê um formulário e devolve um objeto com os valores dos campos. */
function lerFormulario(formulario) {
    return Object.fromEntries(new FormData(formulario).entries());
}

/** Mensagem de erro dentro de um modal. */
function mostrarErroModal(seletor, texto) {
    const caixa = el(seletor);
    caixa.textContent = texto;
    caixa.classList.remove('oculto');
}

function limparErroModal(seletor) {
    el(seletor).classList.add('oculto');
}

/** Linha única ocupando a tabela inteira, usada para "carregando", "vazio" e "erro". */
function linhaAviso(colunas, texto) {
    return `<tr><td colspan="${colunas}"><div class="aviso-tabela">${escapar(texto)}</div></td></tr>`;
}

/** Botões com data-fechar apontam para o modal que devem fechar. */
document.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-fechar]');
    if (botao) fecharModal(botao.dataset.fechar);
});

/**
 * Abre a janela de confirmação de exclusão.
 * A função recebida em "acao" só é executada quando o usuário confirma.
 */
function confirmarExclusao(titulo, descricaoHtml, acao) {
    el('#titulo-exclusao').textContent = titulo;
    el('#texto-exclusao').innerHTML = descricaoHtml;
    limparErroModal('#erro-exclusao');

    const botao = el('#bt-confirmar-exclusao');

    // Troca o botão por um clone para descartar o listener da exclusão anterior
    const novo = botao.cloneNode(true);
    botao.parentNode.replaceChild(novo, botao);

    novo.addEventListener('click', async () => {
        novo.disabled = true;
        try {
            await acao();
            fecharModal('#modal-exclusao');
        } catch (erro) {
            mostrarErroModal('#erro-exclusao', erro.message);
        } finally {
            novo.disabled = false;
        }
    });

    abrirModal('#modal-exclusao');
}

/** Preenche um <select> com os registros de um cadastro. */
function preencherLista(seletor, registros, rotulo, textoVazio) {
    const lista = el(seletor);
    const atual = lista.value;

    lista.innerHTML = `<option value="">${escapar(textoVazio)}</option>` +
        registros.map((r) => `<option value="${r.id}">${escapar(rotulo(r))}</option>`).join('');

    lista.value = atual;
}
