namespace LocadoraVeiculos.Models;

public class Cliente
{
    // Chave primária
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Cpf { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Telefone { get; set; }

    // Um cliente pode ter vários aluguéis (1:N)
    public ICollection<Aluguel> Alugueis { get; set; } = new List<Aluguel>();
}
