using System.ComponentModel.DataAnnotations;

namespace LocadoraVeiculos.Models;

/// <summary>
/// Categoria do veículo (Econômico, SUV, Executivo...).
/// É a 5ª entidade exigida no item 1.5 do enunciado.
/// </summary>
public class Categoria
{
    // Chave primária
    public int Id { get; set; }

    [Required(ErrorMessage = "O nome da categoria é obrigatório.")]
    [StringLength(60, MinimumLength = 2, ErrorMessage = "O nome deve ter entre 2 e 60 caracteres.")]
    public string Nome { get; set; } = string.Empty;

    [StringLength(200, ErrorMessage = "A descrição deve ter no máximo 200 caracteres.")]
    public string? Descricao { get; set; }

    [Range(0.01, 100000.0, ErrorMessage = "O valor da diária base deve ser maior que zero.")]
    public decimal ValorDiariaBase { get; set; }

    // Uma categoria possui vários veículos (1:N)
    public ICollection<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
}
