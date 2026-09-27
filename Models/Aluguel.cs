using System.ComponentModel.DataAnnotations;

namespace LocadoraVeiculos.Models;

public class Aluguel
{
    // Chave primária
    public int Id { get; set; }

    // Chave estrangeira -> Cliente
    [Range(1, int.MaxValue, ErrorMessage = "Informe um cliente válido.")]
    public int ClienteId { get; set; }
    public Cliente? Cliente { get; set; }

    // Chave estrangeira -> Veiculo
    [Range(1, int.MaxValue, ErrorMessage = "Informe um veículo válido.")]
    public int VeiculoId { get; set; }
    public Veiculo? Veiculo { get; set; }

    // Período da locação
    [Required(ErrorMessage = "A data de retirada é obrigatória.")]
    public DateTime DataRetirada { get; set; }

    [Required(ErrorMessage = "A data prevista de devolução é obrigatória.")]
    public DateTime DataPrevistaDevolucao { get; set; }

    // Registro da devolução (nulo enquanto o veículo não foi devolvido)
    public DateTime? DataDevolucao { get; set; }

    // Quilometragem inicial e final do aluguel
    [Range(0, int.MaxValue, ErrorMessage = "A quilometragem inicial não pode ser negativa.")]
    public int QuilometragemInicial { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "A quilometragem final não pode ser negativa.")]
    public int? QuilometragemFinal { get; set; }

    [Range(0.01, 100000.0, ErrorMessage = "O valor da diária deve ser maior que zero.")]
    public decimal ValorDiaria { get; set; }

    // Calculado na devolução (nulo enquanto o aluguel está em aberto)
    [Range(0.0, 1000000.0, ErrorMessage = "O valor total não pode ser negativo.")]
    public decimal? ValorTotal { get; set; }
}
