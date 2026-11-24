// Tela de clientes: pesquisa com filtros, cadastro, edição e exclusão.

let clientes = [];
let idEmEdicao = null;

const COLUNAS = 5;

function filtrosAtuais() {
    return {
        nome: el('#f-nome').value,
        cpf: el('#f-cpf').value,
        email: el('#f-email').value
    };
}

async function carregar() {
    const corpo = el('#corpo');
    corpo.innerHTML = linhaAviso(COLUNAS, 'Carregando...');

    try {
        clientes = await listar('Clientes', filtrosAtuais());
        desenhar();
    } catch (erro) {
        corpo.innerHTML = linhaAviso(COLUNAS, erro.message);
        el('#resumo-clientes').textContent = 'Não foi possível carregar os clientes';
        el('#contagem').textContent = '';
    }
}

function linha(cliente) {
    return `<tr>
        <td class="forte">${escapar(cliente.nome)}</td>
        <td class="num" style="text-align:left">${escapar(formatarCpf(cliente.cpf))}</td>
        <td>${escapar(cliente.email)}</td>
        <td class="num" style="text-align:left">${escapar(cliente.telefone || '—')}</td>
        <td>
          <div class="acoes">
            <button type="button" class="bt min" data-editar="${cliente.id}">Editar</button>
            <button type="button" class="bt min risco" data-excluir="${cliente.id}">Excluir</button>
          </div>
        </td>
    </tr>`;
}

function desenhar() {
    const corpo = el('#corpo');

    corpo.innerHTML = clientes.length === 0
        ? linhaAviso(COLUNAS, 'Nenhum cliente encontrado com esses filtros.')
        : clientes.map(linha).join('');

    const total = clientes.length;
    el('#resumo-clientes').textContent =
        total === 1 ? '1 cliente encontrado' : `${total} clientes encontrados`;
    el('#contagem').textContent = `Mostrando ${total} ${total === 1 ? 'registro' : 'registros'}`;
}

// ------------------------------------------------------------ cadastro e edição
function abrirNovo() {
    idEmEdicao = null;
    el('#form-cliente').reset();
    el('#titulo-cliente').textContent = 'Novo cliente';
    limparErroModal('#erro-cliente');
    abrirModal('#modal-cliente');
    el('#nome').focus();
}

function abrirEdicao(id) {
    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) return;

    idEmEdicao = id;
    el('#titulo-cliente').textContent = 'Editar cliente';
    el('#nome').value = cliente.nome;
    el('#cpf').value = cliente.cpf;
    el('#email').value = cliente.email;
    el('#telefone').value = cliente.telefone || '';

    limparErroModal('#erro-cliente');
    abrirModal('#modal-cliente');
}

function montarCliente() {
    return {
        id: idEmEdicao ?? 0,
        nome: el('#nome').value.trim(),
        // A API exige 11 dígitos numéricos, então a pontuação digitada é removida aqui
        cpf: el('#cpf').value.replace(/\D/g, ''),
        email: el('#email').value.trim(),
        telefone: el('#telefone').value.trim() || null
    };
}

async function salvar(evento) {
    evento.preventDefault();
    limparErroModal('#erro-cliente');

    const dados = montarCliente();

    try {
        if (idEmEdicao === null) {
            await criar('Clientes', dados);
            recado('Cliente cadastrado.');
        } else {
            await atualizar('Clientes', idEmEdicao, dados);
            recado('Cliente atualizado.');
        }

        fecharModal('#modal-cliente');
        await carregar();
    } catch (erro) {
        mostrarErroModal('#erro-cliente', erro.message);
    }
}

function pedirExclusao(id) {
    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) return;

    confirmarExclusao(
        'Excluir cliente',
        `Excluir o cliente <b style="font-weight:500">${escapar(cliente.nome)}</b>?`,
        async () => {
            await excluir('Clientes', id);
            recado('Cliente excluído.');
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
el('#form-cliente').addEventListener('submit', salvar);

el('#corpo').addEventListener('click', (evento) => {
    const editar = evento.target.closest('[data-editar]');
    if (editar) abrirEdicao(Number(editar.dataset.editar));

    const apagar = evento.target.closest('[data-excluir]');
    if (apagar) pedirExclusao(Number(apagar.dataset.excluir));
});

carregar();
