// Painel: resumo da frota e dos aluguéis, montado a partir das rotas de listagem.

function estaAtrasado(aluguel) {
    if (aluguel.dataDevolucao) return false;

    const previsao = new Date(aluguel.dataPrevistaDevolucao);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return previsao < hoje;
}

/**
 * Classifica cada veículo uma única vez, para que a soma das três faixas
 * seja sempre igual ao total da frota. Um aluguel em aberto prevalece sobre
 * a coluna Disponivel, porque é ele que diz se o carro está fora da locadora.
 */
function classificarFrota(veiculos, alugueis) {
    const abertos = alugueis.filter((a) => !a.dataDevolucao);
    let disponiveis = 0;
    let alugados = 0;
    let atrasados = 0;

    for (const veiculo of veiculos) {
        const doVeiculo = abertos.filter((a) => a.veiculoId === veiculo.id);

        if (doVeiculo.some(estaAtrasado)) {
            atrasados++;
        } else if (doVeiculo.length > 0 || !veiculo.disponivel) {
            alugados++;
        } else {
            disponiveis++;
        }
    }

    return { disponiveis, alugados, atrasados };
}

function desenharFrota(veiculos, alugueis) {
    const total = veiculos.length;
    const { disponiveis, alugados, atrasados } = classificarFrota(veiculos, alugueis);

    el('#nota-frota').textContent =
        total === 1 ? '1 veículo cadastrado' : `${total} veículos cadastrados`;

    if (total === 0) {
        el('#barra-frota').innerHTML = '';
        el('#legenda-frota').innerHTML =
            '<div class="leg"><span class="r">Nenhum veículo cadastrado ainda.</span></div>';
        return;
    }

    const faixa = (quantidade, cor, singular, plural) => {
        if (quantidade === 0) return '';
        const largura = (quantidade / total) * 100;
        const rotulo = quantidade === 1 ? singular : plural;
        return `<span style="width:${largura}%;background:${cor}">${quantidade} ${rotulo}</span>`;
    };

    el('#barra-frota').innerHTML =
        faixa(disponiveis, '#2E7D5B', 'disponível', 'disponíveis') +
        faixa(alugados, '#C08318', 'alugado', 'alugados') +
        faixa(atrasados, '#B4452F', 'em atraso', 'em atraso');

    const item = (cor, quantidade, rotulo) => `
        <div class="leg">
          <span class="c" style="background:${cor}"></span>
          <span class="q">${quantidade}</span>
          <span class="r">${rotulo}</span>
        </div>`;

    el('#legenda-frota').innerHTML =
        item('#2E7D5B', disponiveis, 'prontos para locação') +
        item('#C08318', alugados, 'com devolução prevista') +
        item('#B4452F', atrasados, 'com prazo vencido');
}

function desenharAbertos(alugueis) {
    const abertos = alugueis
        .filter((a) => !a.dataDevolucao)
        .sort((a, b) => new Date(a.dataPrevistaDevolucao) - new Date(b.dataPrevistaDevolucao))
        .slice(0, 5);

    if (abertos.length === 0) {
        el('#lista-abertos').innerHTML =
            '<div class="vazio-dia">Nenhum aluguel em aberto no momento.</div>';
        return;
    }

    el('#lista-abertos').innerHTML = abertos.map((aluguel) => {
        const marca = estaAtrasado(aluguel)
            ? '<span class="selo v-atr"><span class="bolinha"></span>Em atraso</span>'
            : '<span class="selo v-alug"><span class="bolinha"></span>No prazo</span>';

        const placa = aluguel.veiculo
            ? `<span class="placa">${escapar(aluguel.veiculo.placa)}</span>` : '';

        return `<div class="linha-dia">
            ${placa}
            <span class="quem">
              <b>${escapar(aluguel.cliente ? aluguel.cliente.nome : '—')}</b>
              <span class="leve">${escapar(aluguel.veiculo ? aluguel.veiculo.modelo : '')}</span>
            </span>
            <span class="leve">até ${formatarData(aluguel.dataPrevistaDevolucao)}</span>
            ${marca}
        </div>`;
    }).join('');
}

function desenharRecentes(alugueis) {
    const recentes = alugueis
        .slice()
        .sort((a, b) => new Date(b.dataRetirada) - new Date(a.dataRetirada))
        .slice(0, 5);

    if (recentes.length === 0) {
        el('#lista-recentes').innerHTML =
            '<div class="vazio-dia">Nenhum aluguel registrado ainda.</div>';
        return;
    }

    el('#lista-recentes').innerHTML = recentes.map((aluguel) => {
        const valor = aluguel.valorTotal === null || aluguel.valorTotal === undefined
            ? 'em aberto'
            : `R$ ${formatarMoeda(aluguel.valorTotal)}`;

        const veiculo = aluguel.veiculo ? aluguel.veiculo.modelo : 'veículo';

        return `<div class="linha-dia">
            <span class="quem">
              <b>${escapar(aluguel.cliente ? aluguel.cliente.nome : '—')}</b>
              <span class="leve">${escapar(veiculo)}, retirada em ${formatarData(aluguel.dataRetirada)}</span>
            </span>
            <span class="num" style="font-weight:500">${valor}</span>
        </div>`;
    }).join('');
}

(async () => {
    const hoje = new Date().toLocaleDateString('pt-BR', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    try {
        const [veiculos, alugueis] = await Promise.all([
            listar('Veiculos'),
            listar('Alugueis')
        ]);

        el('#resumo-painel').textContent = `Situação da frota em ${hoje}`;
        desenharFrota(veiculos, alugueis);
        desenharAbertos(alugueis);
        desenharRecentes(alugueis);
    } catch (erro) {
        el('#resumo-painel').textContent = 'Não foi possível falar com a API';
        el('#nota-frota').textContent = erro.message;
        el('#lista-abertos').innerHTML = '<div class="vazio-dia">Sem dados.</div>';
        el('#lista-recentes').innerHTML = '<div class="vazio-dia">Sem dados.</div>';
        recado(`Erro ao carregar o painel: ${erro.message}`, true);
    }
})();
