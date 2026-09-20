namespace LocadoraVeiculos.Models;

public class Fabricante
{
    // Chave primária
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string? PaisOrigem { get; set; }

    // Um fabricante possui vários veículos (1:N)
    public ICollection<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
}
