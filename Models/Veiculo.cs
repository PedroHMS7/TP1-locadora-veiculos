using System.ComponentModel.DataAnnotations;

namespace LocadoraVeiculos.Models;

public class Veiculo
{
    // Chave primária
    public int Id { get; set; }

    [Required(ErrorMessage = "O modelo é obrigatório.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "O modelo deve ter no máximo 100 caracteres.")]
    public string Modelo { get; set; } = string.Empty;

    [Required(ErrorMessage = "A placa é obrigatória.")]
    [StringLength(8, MinimumLength = 7, ErrorMessage = "A placa deve ter 7 ou 8 caracteres.")]
    public string Placa { get; set; } = string.Empty;

    [Range(1950, 2100, ErrorMessage = "O ano de fabricação deve estar entre 1950 e 2100.")]
    public int AnoFabricacao { get; set; }

    // Quilometragem atual do veículo
    [Range(0, int.MaxValue, ErrorMessage = "A quilometragem não pode ser negativa.")]
    public int Quilometragem { get; set; }

    public bool Disponivel { get; set; } = true;

    // Chave estrangeira -> Fabricante (todo veículo pertence a um fabricante)
    [Range(1, int.MaxValue, ErrorMessage = "Informe um fabricante válido.")]
    public int FabricanteId { get; set; }
    public Fabricante? Fabricante { get; set; }

    // Chave estrangeira -> Categoria
    [Range(1, int.MaxValue, ErrorMessage = "Informe uma categoria válida.")]
    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    // Um veículo pode ter vários aluguéis ao longo do tempo (1:N)
    public ICollection<Aluguel> Alugueis { get; set; } = new List<Aluguel>();
}
