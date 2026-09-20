namespace LocadoraVeiculos.Models;

/// <summary>
/// Categoria do veículo (Econômico, SUV, Executivo...).
/// É a 5ª entidade exigida no item 1.5 do enunciado.
/// </summary>
public class Categoria
{
    // Chave primária
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string? Descricao { get; set; }

    // Valor sugerido da diária para a categoria
    public decimal ValorDiariaBase { get; set; }

    // Uma categoria possui vários veículos (1:N)
    public ICollection<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
}
