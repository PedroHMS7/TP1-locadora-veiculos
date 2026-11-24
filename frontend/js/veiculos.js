// Tela de veículos: pesquisa com filtros, cadastro, edição e exclusão.

let veiculos = [];
let fabricantes = [];
let categorias = [];
let idEmEdicao = null;

const COLUNAS = 8;

/** Carrega os cadastros auxiliares que alimentam os selects de filtro e do formulário. */
async function carregarAuxiliares() {
    [fabricantes, categorias] = await Promise.all([
        listar('Fabricantes'),
        listar('Categorias')
    ]);

    preencherLista('#f-fabricante', fabricantes, (f) => f.nome, 'Todos');
    preencherLista('#f-categoria', categorias, (c) => c.nome, 'Todas');
    preencherLista('#fabricanteId', fabricantes, (f) => f.nome, 'Selecione');
    preencherLista('#categoriaId', categorias, (c) => c.nome, 'Selecione');
}

/** Lê os campos de filtro da tela. Campos em branco são descartados em api.js. */
function filtrosAtuais() {
    return {
        modelo: el('#f-modelo').value,
        placa: el('#f-placa').value,
        fabricanteId: el('#f-fabricante').value,
        categoriaId: el('#f-categoria').value,
        disponivel: el('#f-disponivel').value,
        anoMinimo: el('#f-ano').value
    };
}

async function carregar() {
    const corpo = el('#corpo');
    corpo.innerHTML = linhaAviso(COLUNAS, 'Carregando...');

    try {
        veiculos = await listar('Veiculos', filtrosAtuais());
        desenhar();
    } catch (erro) {
        corpo.innerHTML = linhaAviso(COLUNAS, erro.message);
        el('#resumo-veiculos').textContent = 'Não foi possível carregar os veículos';
        el('#contagem').textContent = '';
    }
}

function linha(veiculo) {
    const situacao = veiculo.disponivel
        ? '<span class="selo v-disp"><span class="bolinha"></span>Disponível</span>'
        : '<span class="selo v-alug"><span class="bolinha"></span>Alugado</span>';

    return `<tr>
        <td><span class="placa">${escapar(veiculo.placa)}</span></td>
        <td class="forte">${escapar(veiculo.modelo)}</td>
        <td>${escapar(veiculo.fabricante ? veiculo.fabricante.nome : '—')}</td>
        <td>${escapar(veiculo.categoria ? veiculo.categoria.nome : '—')}</td>
        <td class="num">${veiculo.anoFabricacao}</td>
        <td class="num">${formatarNumero(veiculo.quilometragem)}</td>
        <td>${situacao}</td>
        <td>
          <div class="acoes">
            <button type="button" class="bt min" data-editar="${veiculo.id}">Editar</button>
            <button type="button" class="bt min risco" data-excluir="${veiculo.id}">Excluir</button>
          </div>
        </td>
    </tr>`;
}

function desenhar() {
    const corpo = el('#corpo');

    corpo.innerHTML = veiculos.length === 0
        ? linhaAviso(COLUNAS, 'Nenhum veículo encontrado com esses filtros.')
        : veiculos.map(linha).join('');

    const total = veiculos.length;
    el('#resumo-veiculos').textContent =
        total === 1 ? '1 veículo encontrado' : `${total} veículos encontrados`;
    el('#contagem').textContent = `Mostrando ${total} ${total === 1 ? 'registro' : 'registros'}`;
}

// ------------------------------------------------------------ cadastro e edição
function abrirNovo() {
    idEmEdicao = null;
    el('#form-veiculo').reset();
    el('#titulo-veiculo').textContent = 'Novo veículo';
    limparErroModal('#erro-veiculo');
    abrirModal('#modal-veiculo');
    el('#modelo').focus();
}

function abrirEdicao(id) {
    const veiculo = veiculos.find((v) => v.id === id);
    if (!veiculo) return;

    idEmEdicao = id;
    el('#titulo-veiculo').textContent = 'Editar veículo';
    el('#modelo').value = veiculo.modelo;
    el('#placa').value = veiculo.placa;
    el('#fabricanteId').value = veiculo.fabricanteId;
    el('#categoriaId').value = veiculo.categoriaId;
    el('#anoFabricacao').value = veiculo.anoFabricacao;
    el('#quilometragem').value = veiculo.quilometragem;
    el('#disponivel').value = String(veiculo.disponivel);

    limparErroModal('#erro-veiculo');
    abrirModal('#modal-veiculo');
}

/** Converte os campos do formulário para os tipos esperados pela API. */
function montarVeiculo() {
    return {
        id: idEmEdicao ?? 0,
        modelo: el('#modelo').value.trim(),
        placa: el('#placa').value.trim().toUpperCase(),
        anoFabricacao: Number(el('#anoFabricacao').value),
        quilometragem: Number(el('#quilometragem').value),
        disponivel: el('#disponivel').value === 'true',
        fabricanteId: Number(el('#fabricanteId').value),
        categoriaId: Number(el('#categoriaId').value)
    };
}

async function salvar(evento) {
    evento.preventDefault();
    limparErroModal('#erro-veiculo');

    const dados = montarVeiculo();

    if (!dados.fabricanteId || !dados.categoriaId) {
        mostrarErroModal('#erro-veiculo', 'Selecione o fabricante e a categoria.');
        return;
    }

    try {
        if (idEmEdicao === null) {
            await criar('Veiculos', dados);
            recado('Veículo cadastrado.');
        } else {
            await atualizar('Veiculos', idEmEdicao, dados);
            recado('Veículo atualizado.');
        }

        fecharModal('#modal-veiculo');
        await carregar();
    } catch (erro) {
        mostrarErroModal('#erro-veiculo', erro.message);
    }
}

function pedirExclusao(id) {
    const veiculo = veiculos.find((v) => v.id === id);
    if (!veiculo) return;

    confirmarExclusao(
        'Excluir veículo',
        `Excluir o veículo <span class="placa">${escapar(veiculo.placa)}</span> ` +
        `<b style="font-weight:500">${escapar(veiculo.modelo)}</b>?`,
        async () => {
            await excluir('Veiculos', id);
            recado('Veículo excluído.');
            await carregar();
        }
    );
}

// ------------------------------------------------------------------- eventos
el('#bt-filtrar').addEventListener('click', carregar);

el('#bt-limpar').addEventListener('click', () => {
    todos('.filtros input').forEach((campo) => { campo.value = ''; });
    todos('.filtros select').forEach((campo) => { campo.value = ''; });
    carregar();
});

todos('.filtros input').forEach((campo) => {
    campo.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') carregar();
    });
});

el('#bt-novo').addEventListener('click', abrirNovo);
el('#form-veiculo').addEventListener('submit', salvar);

el('#corpo').addEventListener('click', (evento) => {
    const editar = evento.target.closest('[data-editar]');
    if (editar) abrirEdicao(Number(editar.dataset.editar));

    const apagar = evento.target.closest('[data-excluir]');
    if (apagar) pedirExclusao(Number(apagar.dataset.excluir));
});

// ------------------------------------------------------------------- início
(async () => {
    try {
        await carregarAuxiliares();
    } catch (erro) {
        recado(`Não foi possível carregar fabricantes e categorias: ${erro.message}`, true);
    }
    await carregar();
})();
