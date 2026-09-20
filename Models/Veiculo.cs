namespace LocadoraVeiculos.Models;

public class Veiculo
{
    // Chave primária
    public int Id { get; set; }

    public string Modelo { get; set; } = string.Empty;

    public string Placa { get; set; } = string.Empty;

    public int AnoFabricacao { get; set; }

    // Quilometragem atual do veículo
    public int Quilometragem { get; set; }

    public bool Disponivel { get; set; } = true;

    // Chave estrangeira -> Fabricante (todo veículo pertence a um fabricante)
    public int FabricanteId { get; set; }
    public Fabricante Fabricante { get; set; } = null!;

    // Chave estrangeira -> Categoria
    public int CategoriaId { get; set; }
    public Categoria Categoria { get; set; } = null!;

    // Um veículo pode ter vários aluguéis ao longo do tempo (1:N)
    public ICollection<Aluguel> Alugueis { get; set; } = new List<Aluguel>();
}
