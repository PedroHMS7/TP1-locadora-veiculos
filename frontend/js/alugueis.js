// Tela de aluguéis: pesquisa com filtros, cadastro, edição e exclusão.

let alugueis = [];
let clientes = [];
let veiculos = [];
let idEmEdicao = null;

const COLUNAS = 8;

async function carregarAuxiliares() {
    [clientes, veiculos] = await Promise.all([
        listar('Clientes'),
        listar('Veiculos')
    ]);

    preencherLista('#clienteId', clientes, (c) => c.nome, 'Selecione');
    preencherLista('#veiculoId', veiculos, (v) => `${v.placa} — ${v.modelo}`, 'Selecione');
}

function filtrosAtuais() {
    return {
        cliente: el('#f-cliente').value,
        placa: el('#f-placa').value,
        inicio: el('#f-inicio').value,
        fim: el('#f-fim').value,
        situacao: el('#f-situacao').value
    };
}

async function carregar() {
    const corpo = el('#corpo');
    corpo.innerHTML = linhaAviso(COLUNAS, 'Carregando...');

    try {
        alugueis = await listar('Alugueis', filtrosAtuais());
        desenhar();
    } catch (erro) {
        corpo.innerHTML = linhaAviso(COLUNAS, erro.message);
        el('#resumo-alugueis').textContent = 'Não foi possível carregar os aluguéis';
        el('#contagem').textContent = '';
    }
}

/**
 * A situação não é uma coluna do banco: ela é deduzida das datas do próprio
 * aluguel. Devolvido quando há data de devolução; em atraso quando a previsão
 * já passou e o veículo não voltou.
 */
function situacao(aluguel) {
    if (aluguel.dataDevolucao) {
        return '<span class="selo v-disp"><span class="bolinha"></span>Devolvido</span>';
    }

    const previsao = new Date(aluguel.dataPrevistaDevolucao);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (previsao < hoje) {
        const dias = Math.round((hoje - previsao) / 86400000);
        const texto = dias === 1 ? '1 dia de atraso' : `${dias} dias de atraso`;
        return `<span class="selo v-atr"><span class="bolinha"></span>${texto}</span>`;
    }

    return '<span class="selo v-alug"><span class="bolinha"></span>Em aberto</span>';
}

function linha(aluguel) {
    const veiculo = aluguel.veiculo;

    const descricaoVeiculo = veiculo
        ? `<span class="placa">${escapar(veiculo.placa)}</span>
           <div class="leve" style="margin-top:4px">${escapar(veiculo.modelo)}</div>`
        : '—';

    return `<tr>
        <td class="forte">${escapar(aluguel.cliente ? aluguel.cliente.nome : '—')}</td>
        <td>${descricaoVeiculo}</td>
        <td class="num" style="text-align:left">${formatarData(aluguel.dataRetirada)}</td>
        <td class="num" style="text-align:left">${formatarData(aluguel.dataPrevistaDevolucao)}</td>
        <td class="num" style="text-align:left">${formatarData(aluguel.dataDevolucao)}</td>
        <td class="num">${formatarMoeda(aluguel.valorTotal)}</td>
        <td>${situacao(aluguel)}</td>
        <td>
          <div class="acoes">
            <button type="button" class="bt min" data-editar="${aluguel.id}">Editar</button>
            <button type="button" class="bt min risco" data-excluir="${aluguel.id}">Excluir</button>
          </div>
        </td>
    </tr>`;
}

function desenhar() {
    const corpo = el('#corpo');

    corpo.innerHTML = alugueis.length === 0
        ? linhaAviso(COLUNAS, 'Nenhum aluguel encontrado com esses filtros.')
        : alugueis.map(linha).join('');

    const total = alugueis.length;
    el('#resumo-alugueis').textContent =
        total === 1 ? '1 aluguel encontrado' : `${total} aluguéis encontrados`;
    el('#contagem').textContent = `Mostrando ${total} ${total === 1 ? 'registro' : 'registros'}`;
}

// ------------------------------------------------------------ cadastro e edição
function abrirNovo() {
    idEmEdicao = null;
    el('#form-aluguel').reset();
    el('#titulo-aluguel').textContent = 'Novo aluguel';
    limparErroModal('#erro-aluguel');
    abrirModal('#modal-aluguel');
    el('#clienteId').focus();
}

function abrirEdicao(id) {
    const aluguel = alugueis.find((a) => a.id === id);
    if (!aluguel) return;

    idEmEdicao = id;
    el('#titulo-aluguel').textContent = 'Editar aluguel';
    el('#clienteId').value = aluguel.clienteId;
    el('#veiculoId').value = aluguel.veiculoId;
    el('#dataRetirada').value = dataParaCampo(aluguel.dataRetirada);
    el('#dataPrevistaDevolucao').value = dataParaCampo(aluguel.dataPrevistaDevolucao);
    el('#dataDevolucao').value = dataParaCampo(aluguel.dataDevolucao);
    el('#quilometragemInicial').value = aluguel.quilometragemInicial;
    el('#quilometragemFinal').value = aluguel.quilometragemFinal ?? '';
    el('#valorDiaria').value = aluguel.valorDiaria;
    el('#valorTotal').value = aluguel.valorTotal ?? '';

    limparErroModal('#erro-aluguel');
    abrirModal('#modal-aluguel');
}

/** Campos opcionais em branco viram null, que é o que a API espera. */
function ouNulo(valor) {
    return valor === '' ? null : Number(valor);
}

function montarAluguel() {
    return {
        id: idEmEdicao ?? 0,
        clienteId: Number(el('#clienteId').value),
        veiculoId: Number(el('#veiculoId').value),
        dataRetirada: el('#dataRetirada').value,
        dataPrevistaDevolucao: el('#dataPrevistaDevolucao').value,
        dataDevolucao: el('#dataDevolucao').value || null,
        quilometragemInicial: Number(el('#quilometragemInicial').value || 0),
        quilometragemFinal: ouNulo(el('#quilometragemFinal').value),
        valorDiaria: Number(el('#valorDiaria').value),
        valorTotal: ouNulo(el('#valorTotal').value)
    };
}

async function salvar(evento) {
    evento.preventDefault();
    limparErroModal('#erro-aluguel');

    const dados = montarAluguel();

    if (!dados.clienteId || !dados.veiculoId) {
        mostrarErroModal('#erro-aluguel', 'Selecione o cliente e o veículo.');
        return;
    }

    if (!dados.dataRetirada || !dados.dataPrevistaDevolucao) {
        mostrarErroModal('#erro-aluguel', 'Informe a data de retirada e a previsão de devolução.');
        return;
    }

    try {
        if (idEmEdicao === null) {
            await criar('Alugueis', dados);
            recado('Aluguel registrado.');
        } else {
            await atualizar('Alugueis', idEmEdicao, dados);
            recado('Aluguel atualizado.');
        }

        fecharModal('#modal-aluguel');
        await carregar();
    } catch (erro) {
        mostrarErroModal('#erro-aluguel', erro.message);
    }
}

function pedirExclusao(id) {
    const aluguel = alugueis.find((a) => a.id === id);
    if (!aluguel) return;

    const cliente = aluguel.cliente ? aluguel.cliente.nome : 'cliente';
    const placa = aluguel.veiculo ? aluguel.veiculo.placa : '';

    confirmarExclusao(
        'Excluir aluguel',
        `Excluir o aluguel de <b style="font-weight:500">${escapar(cliente)}</b> ` +
        `com o veículo <span class="placa">${escapar(placa)}</span>?`,
        async () => {
            await excluir('Alugueis', id);
            recado('Aluguel excluído.');
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
el('#form-aluguel').addEventListener('submit', salvar);

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
        recado(`Não foi possível carregar clientes e veículos: ${erro.message}`, true);
    }
    await carregar();
})();
