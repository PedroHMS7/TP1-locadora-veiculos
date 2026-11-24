// Tela de categorias: pesquisa com filtros, cadastro, edição e exclusão.

let categorias = [];
let idEmEdicao = null;

const COLUNAS = 4;

function filtrosAtuais() {
    return {
        nome: el('#f-nome').value,
        valorMaximo: el('#f-valor').value
    };
}

async function carregar() {
    const corpo = el('#corpo');
    corpo.innerHTML = linhaAviso(COLUNAS, 'Carregando...');

    try {
        categorias = await listar('Categorias', filtrosAtuais());
        desenhar();
    } catch (erro) {
        corpo.innerHTML = linhaAviso(COLUNAS, erro.message);
        el('#resumo-categorias').textContent = 'Não foi possível carregar as categorias';
        el('#contagem').textContent = '';
    }
}

function linha(categoria) {
    return `<tr>
        <td class="forte">${escapar(categoria.nome)}</td>
        <td class="leve">${escapar(categoria.descricao || '—')}</td>
        <td class="num">${formatarMoeda(categoria.valorDiariaBase)}</td>
        <td>
          <div class="acoes">
            <button type="button" class="bt min" data-editar="${categoria.id}">Editar</button>
            <button type="button" class="bt min risco" data-excluir="${categoria.id}">Excluir</button>
          </div>
        </td>
    </tr>`;
}

function desenhar() {
    const corpo = el('#corpo');

    corpo.innerHTML = categorias.length === 0
        ? linhaAviso(COLUNAS, 'Nenhuma categoria encontrada com esses filtros.')
        : categorias.map(linha).join('');

    const total = categorias.length;
    el('#resumo-categorias').textContent =
        total === 1 ? '1 categoria encontrada' : `${total} categorias encontradas`;
    el('#contagem').textContent = `Mostrando ${total} ${total === 1 ? 'registro' : 'registros'}`;
}

// ------------------------------------------------------------ cadastro e edição
function abrirNovo() {
    idEmEdicao = null;
    el('#form-categoria').reset();
    el('#titulo-categoria').textContent = 'Nova categoria';
    limparErroModal('#erro-categoria');
    abrirModal('#modal-categoria');
    el('#nome').focus();
}

function abrirEdicao(id) {
    const categoria = categorias.find((c) => c.id === id);
    if (!categoria) return;

    idEmEdicao = id;
    el('#titulo-categoria').textContent = 'Editar categoria';
    el('#nome').value = categoria.nome;
    el('#valorDiariaBase').value = categoria.valorDiariaBase;
    el('#descricao').value = categoria.descricao || '';

    limparErroModal('#erro-categoria');
    abrirModal('#modal-categoria');
}

async function salvar(evento) {
    evento.preventDefault();
    limparErroModal('#erro-categoria');

    const dados = {
        id: idEmEdicao ?? 0,
        nome: el('#nome').value.trim(),
        descricao: el('#descricao').value.trim() || null,
        valorDiariaBase: Number(el('#valorDiariaBase').value)
    };

    try {
        if (idEmEdicao === null) {
            await criar('Categorias', dados);
            recado('Categoria cadastrada.');
        } else {
            await atualizar('Categorias', idEmEdicao, dados);
            recado('Categoria atualizada.');
        }

        fecharModal('#modal-categoria');
        await carregar();
    } catch (erro) {
        mostrarErroModal('#erro-categoria', erro.message);
    }
}

function pedirExclusao(id) {
    const categoria = categorias.find((c) => c.id === id);
    if (!categoria) return;

    confirmarExclusao(
        'Excluir categoria',
        `Excluir a categoria <b style="font-weight:500">${escapar(categoria.nome)}</b>?`,
        async () => {
            await excluir('Categorias', id);
            recado('Categoria excluída.');
            await carregar();
        }
    );
}

// ------------------------------------------------------------------- eventos
el('#bt-filtrar').addEventListener('click', carregar);

el('#bt-limpar').addEventListener('click', () => {
    todos('.filtros input').forEach((campo) => { campo.value = ''; });
    carregar();
});

todos('.filtros input').forEach((campo) => {
    campo.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') carregar();
    });
});

el('#bt-novo').addEventListener('click', abrirNovo);
el('#form-categoria').addEventListener('submit', salvar);

el('#corpo').addEventListener('click', (evento) => {
    const editar = evento.target.closest('[data-editar]');
    if (editar) abrirEdicao(Number(editar.dataset.editar));

    const apagar = evento.target.closest('[data-excluir]');
    if (apagar) pedirExclusao(Number(apagar.dataset.excluir));
});

carregar();
