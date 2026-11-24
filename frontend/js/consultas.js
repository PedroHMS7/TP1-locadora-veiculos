// Tela de consultas: executa as cinco rotas do FiltrosController (terceira etapa)
// e mostra o resultado devolvido pelo banco de dados.

const ROTULOS = {
    veiculoId: 'Id do veículo',
    aluguelId: 'Id do aluguel',
    clienteId: 'Id do cliente',
    fabricanteId: 'Id do fabricante',
    anoFabricacao: 'Ano',
    quilometragem: 'Km',
    paisOrigem: 'País de origem',
    dataRetirada: 'Retirada',
    dataPrevistaDevolucao: 'Previsão',
    dataDevolucao: 'Devolução',
    valorDiaria: 'Valor da diária',
    valorTotal: 'Valor total',
    valorDiariaBase: 'Diária base',
    disponivel: 'Disponível',
    categoria: 'Categoria',
    cpf: 'CPF',
    email: 'E-mail'
};

/** Transforma o nome da propriedade do JSON em um título legível. */
function rotular(chave) {
    if (ROTULOS[chave]) return ROTULOS[chave];
    const comEspacos = chave.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
    return comEspacos.charAt(0).toUpperCase() + comEspacos.slice(1);
}

const EH_DATA = /^\d{4}-\d{2}-\d{2}T/;

function formatarCelula(chave, valor) {
    if (valor === null || valor === undefined) return '—';
    if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
    if (typeof valor === 'string' && EH_DATA.test(valor)) return formatarData(valor);
    if (chave === 'cpf') return formatarCpf(valor);
    if (chave === 'placa') return `<span class="placa">${escapar(valor)}</span>`;
    if (typeof valor === 'number') {
        // Ano e identificadores não levam separador de milhar
        if (chave === 'anoFabricacao' || chave === 'id' || chave.endsWith('Id')) return String(valor);
        return chave.toLowerCase().includes('valor') ? formatarMoeda(valor) : formatarNumero(valor);
    }
    return escapar(valor);
}

/** Monta a tabela a partir das próprias propriedades devolvidas pela consulta. */
function tabelaDoResultado(registros) {
    if (registros.length === 0) {
        return '<div class="tabela"><div class="aviso-tabela">A consulta não retornou registros.</div></div>';
    }

    const chaves = Object.keys(registros[0]);
    const numerica = (chave) => chave === 'placa' ? false : typeof registros[0][chave] === 'number';

    const cabecalho = chaves
        .map((c) => `<th${numerica(c) ? ' class="num"' : ''}>${escapar(rotular(c))}</th>`)
        .join('');

    const linhas = registros.map((registro) => {
        const celulas = chaves
            .map((c) => `<td${numerica(c) ? ' class="num"' : ''}>${formatarCelula(c, registro[c])}</td>`)
            .join('');
        return `<tr>${celulas}</tr>`;
    }).join('');

    const total = registros.length;

    return `<div class="tabela">
        <table><thead><tr>${cabecalho}</tr></thead><tbody>${linhas}</tbody></table>
        <div class="pe"><span>${total} ${total === 1 ? 'registro' : 'registros'}</span></div>
    </div>`;
}

async function executar(secao) {
    const rota = secao.dataset.rota;
    const destino = secao.querySelector('[data-resultado]');
    const endereco = secao.querySelector('[data-endereco]');

    const parametros = {};
    secao.querySelectorAll('[data-parametro]').forEach((campo) => {
        parametros[campo.dataset.parametro] = campo.value;
    });

    destino.innerHTML = '<div class="tabela"><div class="aviso-tabela">Consultando...</div></div>';
    endereco.textContent = '';

    try {
        const registros = await consultar(rota, parametros);
        destino.innerHTML = tabelaDoResultado(registros);
        endereco.textContent = `GET /api/Filtros/${rota}${montarConsulta(parametros)}`;
    } catch (erro) {
        destino.innerHTML = `<div class="tabela"><div class="aviso-tabela">${escapar(erro.message)}</div></div>`;
        endereco.textContent = `GET /api/Filtros/${rota}${montarConsulta(parametros)}`;
    }
}

todos('.consulta').forEach((secao) => {
    const botaoAbrir = secao.querySelector('[data-abrir]');

    botaoAbrir.addEventListener('click', () => {
        const abrindo = !secao.classList.contains('aberta');
        secao.classList.toggle('aberta', abrindo);
        botaoAbrir.textContent = abrindo ? 'Recolher' : 'Executar';

        // Consultas sem parâmetro obrigatório já trazem o resultado ao abrir
        if (abrindo && !secao.querySelector('[data-resultado]').innerHTML) {
            const obrigatorio = secao.dataset.rota === 'veiculos-por-fabricante';
            if (!obrigatorio) executar(secao);
        }
    });

    secao.querySelector('[data-executar]').addEventListener('click', () => executar(secao));

    secao.querySelectorAll('[data-parametro]').forEach((campo) => {
        campo.addEventListener('keydown', (evento) => {
            if (evento.key === 'Enter') executar(secao);
        });
    });
});
