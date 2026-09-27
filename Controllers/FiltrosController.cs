using LocadoraVeiculos.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculos.Controllers;

/// <summary>
/// Rotas de consulta (item 2.5 do enunciado): 5 filtros diferentes que usam
/// dois tipos de join — INNER JOIN (filtros 1, 2 e 5) e LEFT JOIN (filtros 3 e 4).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class FiltrosController : ControllerBase
{
    private readonly ApplicationContext _context;

    public FiltrosController(ApplicationContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Filtro 1 (INNER JOIN Veiculo + Fabricante + Categoria):
    /// veículos de um determinado fabricante.
    /// </summary>
    [HttpGet("veiculos-por-fabricante")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VeiculosPorFabricante([FromQuery] string fabricante)
    {
        if (string.IsNullOrWhiteSpace(fabricante))
            return BadRequest(new { mensagem = "Informe o nome do fabricante." });

        var resultado = await (from v in _context.Veiculos
                               join f in _context.Fabricantes on v.FabricanteId equals f.Id   // INNER JOIN
                               join c in _context.Categorias on v.CategoriaId equals c.Id     // INNER JOIN
                               where f.Nome.Contains(fabricante)
                               orderby v.Modelo
                               select new
                               {
                                   VeiculoId = v.Id,
                                   v.Modelo,
                                   v.Placa,
                                   v.AnoFabricacao,
                                   v.Quilometragem,
                                   v.Disponivel,
                                   Fabricante = f.Nome,
                                   Categoria = c.Nome
                               }).ToListAsync();

        return Ok(resultado);
    }

    /// <summary>
    /// Filtro 2 (INNER JOIN Aluguel + Cliente + Veiculo):
    /// aluguéis realizados dentro de um período informado.
    /// </summary>
    [HttpGet("alugueis-por-periodo")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AlugueisPorPeriodo([FromQuery] DateTime inicio, [FromQuery] DateTime fim)
    {
        if (fim < inicio)
            return BadRequest(new { mensagem = "A data final não pode ser anterior à data inicial." });

        var resultado = await (from a in _context.Alugueis
                               join cl in _context.Clientes on a.ClienteId equals cl.Id   // INNER JOIN
                               join v in _context.Veiculos on a.VeiculoId equals v.Id     // INNER JOIN
                               where a.DataRetirada >= inicio && a.DataRetirada <= fim
                               orderby a.DataRetirada
                               select new
                               {
                                   AluguelId = a.Id,
                                   Cliente = cl.Nome,
                                   cl.Cpf,
                                   Veiculo = v.Modelo,
                                   v.Placa,
                                   a.DataRetirada,
                                   a.DataPrevistaDevolucao,
                                   a.DataDevolucao,
                                   a.ValorDiaria,
                                   a.ValorTotal
                               }).ToListAsync();

        return Ok(resultado);
    }

    /// <summary>
    /// Filtro 3 (LEFT JOIN Fabricante + Veiculo):
    /// fabricantes e seus veículos, incluindo fabricantes que ainda não possuem veículos.
    /// O parâmetro pais é opcional.
    /// </summary>
    [HttpGet("fabricantes-com-veiculos")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> FabricantesComVeiculos([FromQuery] string? pais)
    {
        var resultado = await (from f in _context.Fabricantes
                               join v in _context.Veiculos on f.Id equals v.FabricanteId into veiculosDoFabricante
                               from v in veiculosDoFabricante.DefaultIfEmpty()   // LEFT JOIN
                               where pais == null || (f.PaisOrigem != null && f.PaisOrigem.Contains(pais))
                               orderby f.Nome
                               select new
                               {
                                   FabricanteId = f.Id,
                                   Fabricante = f.Nome,
                                   f.PaisOrigem,
                                   Veiculo = v == null ? null : v.Modelo,
                                   Placa = v == null ? null : v.Placa
                               }).ToListAsync();

        return Ok(resultado);
    }

    /// <summary>
    /// Filtro 4 (LEFT JOIN Cliente + Aluguel):
    /// clientes e seus aluguéis, incluindo clientes que nunca alugaram.
    /// O parâmetro nome é opcional.
    /// </summary>
    [HttpGet("clientes-com-alugueis")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ClientesComAlugueis([FromQuery] string? nome)
    {
        var resultado = await (from cl in _context.Clientes
                               join a in _context.Alugueis on cl.Id equals a.ClienteId into alugueisDoCliente
                               from a in alugueisDoCliente.DefaultIfEmpty()   // LEFT JOIN
                               where nome == null || cl.Nome.Contains(nome)
                               orderby cl.Nome
                               select new
                               {
                                   ClienteId = cl.Id,
                                   Cliente = cl.Nome,
                                   cl.Email,
                                   AluguelId = a == null ? (int?)null : a.Id,
                                   DataRetirada = a == null ? (DateTime?)null : a.DataRetirada,
                                   ValorTotal = a == null ? null : a.ValorTotal
                               }).ToListAsync();

        return Ok(resultado);
    }

    /// <summary>
    /// Filtro 5 (INNER JOIN Veiculo + Categoria + Fabricante):
    /// veículos disponíveis de uma categoria, com diária base até o valor informado.
    /// Os dois parâmetros são opcionais.
    /// </summary>
    [HttpGet("veiculos-disponiveis-por-categoria")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> VeiculosDisponiveisPorCategoria(
        [FromQuery] string? categoria,
        [FromQuery] decimal? valorMaximoDiaria)
    {
        var resultado = await (from v in _context.Veiculos
                               join c in _context.Categorias on v.CategoriaId equals c.Id     // INNER JOIN
                               join f in _context.Fabricantes on v.FabricanteId equals f.Id   // INNER JOIN
                               where v.Disponivel
                                     && (categoria == null || c.Nome.Contains(categoria))
                                     && (valorMaximoDiaria == null || c.ValorDiariaBase <= valorMaximoDiaria)
                               orderby c.ValorDiariaBase
                               select new
                               {
                                   VeiculoId = v.Id,
                                   v.Modelo,
                                   v.Placa,
                                   v.AnoFabricacao,
                                   Fabricante = f.Nome,
                                   Categoria = c.Nome,
                                   c.ValorDiariaBase
                               }).ToListAsync();

        return Ok(resultado);
    }
}
