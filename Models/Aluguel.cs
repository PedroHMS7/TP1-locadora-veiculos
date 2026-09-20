namespace LocadoraVeiculos.Models;

public class Aluguel
{
    // Chave primária
    public int Id { get; set; }

    // Chave estrangeira -> Cliente
    public int ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;

    // Chave estrangeira -> Veiculo
    public int VeiculoId { get; set; }
    public Veiculo Veiculo { get; set; } = null!;

    // Período da locação
    public DateTime DataRetirada { get; set; }
    public DateTime DataPrevistaDevolucao { get; set; }

    // Registro da devolução (nulo enquanto o veículo não foi devolvido)
    public DateTime? DataDevolucao { get; set; }

    // Quilometragem inicial e final do aluguel
    public int QuilometragemInicial { get; set; }
    public int? QuilometragemFinal { get; set; }

    public decimal ValorDiaria { get; set; }

    // Calculado na devolução (nulo enquanto o aluguel está em aberto)
    public decimal? ValorTotal { get; set; }
}
