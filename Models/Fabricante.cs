using System.ComponentModel.DataAnnotations;

namespace LocadoraVeiculos.Models;

public class Fabricante
{
    // Chave primária
    public int Id { get; set; }

    [Required(ErrorMessage = "O nome do fabricante é obrigatório.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "O nome deve ter entre 2 e 100 caracteres.")]
    public string Nome { get; set; } = string.Empty;

    [StringLength(60, ErrorMessage = "O país de origem deve ter no máximo 60 caracteres.")]
    public string? PaisOrigem { get; set; }

    // Um fabricante possui vários veículos (1:N)
    public ICollection<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
}
