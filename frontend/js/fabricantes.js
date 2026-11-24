// Tela de fabricantes: pesquisa com filtros, cadastro, edição e exclusão.

let fabricantes = [];
let idEmEdicao = null;

const COLUNAS = 3;

function filtrosAtuais() {
    return {
        nome: el('#f-nome').value,
        pais: el('#f-pais').value
    };
}

async function carregar() {
    const corpo = el('#corpo');
    corpo.innerHTML = linhaAviso(COLUNAS, 'Carregando...');

    try {
        fabricantes = await listar('Fabricantes', filtrosAtuais());
        desenhar();
    } catch (erro) {
        corpo.innerHTML = linhaAviso(COLUNAS, erro.message);
        el('#resumo-fabricantes').textContent = 'Não foi possível carregar os fabricantes';
        el('#contagem').textContent = '';
    }
}

function linha(fabricante) {
    return `<tr>
        <td class="forte">${escapar(fabricante.nome)}</td>
        <td>${escapar(fabricante.paisOrigem || '—')}</td>
        <td>
          <div class="acoes">
            <button type="button" class="bt min" data-editar="${fabricante.id}">Editar</button>
            <button type="button" class="bt min risco" data-excluir="${fabricante.id}">Excluir</button>
          </div>
        </td>
    </tr>`;
}

function desenhar() {
    const corpo = el('#corpo');

    corpo.innerHTML = fabricantes.length === 0
        ? linhaAviso(COLUNAS, 'Nenhum fabricante encontrado com esses filtros.')
        : fabricantes.map(linha).join('');

    const total = fabricantes.length;
    el('#resumo-fabricantes').textContent =
        total === 1 ? '1 fabricante encontrado' : `${total} fabricantes encontrados`;
    el('#contagem').textContent = `Mostrando ${total} ${total === 1 ? 'registro' : 'registros'}`;
}

// ------------------------------------------------------------ cadastro e edição
function abrirNovo() {
    idEmEdicao = null;
    el('#form-fabricante').reset();
    el('#titulo-fabricante').textContent = 'Novo fabricante';
    limparErroModal('#erro-fabricante');
    abrirModal('#modal-fabricante');
    el('#nome').focus();
}

function abrirEdicao(id) {
    const fabricante = fabricantes.find((f) => f.id === id);
    if (!fabricante) return;

    idEmEdicao = id;
    el('#titulo-fabricante').textContent = 'Editar fabricante';
    el('#nome').value = fabricante.nome;
    el('#paisOrigem').value = fabricante.paisOrigem || '';

    limparErroModal('#erro-fabricante');
    abrirModal('#modal-fabricante');
}

async function salvar(evento) {
    evento.preventDefault();
    limparErroModal('#erro-fabricante');

    const dados = {
        id: idEmEdicao ?? 0,
        nome: el('#nome').value.trim(),
        paisOrigem: el('#paisOrigem').value.trim() || null
    };

    try {
        if (idEmEdicao === null) {
            await criar('Fabricantes', dados);
            recado('Fabricante cadastrado.');
        } else {
            await atualizar('Fabricantes', idEmEdicao, dados);
            recado('Fabricante atualizado.');
        }

        fecharModal('#modal-fabricante');
        await carregar();
    } catch (erro) {
        mostrarErroModal('#erro-fabricante', erro.message);
    }
}

function pedirExclusao(id) {
    const fabricante = fabricantes.find((f) => f.id === id);
    if (!fabricante) return;

    confirmarExclusao(
        'Excluir fabricante',
        `Excluir o fabricante <b style="font-weight:500">${escapar(fabricante.nome)}</b>?`,
        async () => {
            await excluir('Fabricantes', id);
            recado('Fabricante excluído.');
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
el('#form-fabricante').addEventListener('submit', salvar);

el('#corpo').addEventListener('click', (evento) => {
    const editar = evento.target.closest('[data-editar]');
    if (editar) abrirEdicao(Number(editar.dataset.editar));

    const apagar = evento.target.closest('[data-excluir]');
    if (apagar) pedirExclusao(Number(apagar.dataset.excluir));
});

carregar();
