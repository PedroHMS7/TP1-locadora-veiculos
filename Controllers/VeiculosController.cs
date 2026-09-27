using LocadoraVeiculos.Data;
using LocadoraVeiculos.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculos.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class VeiculosController : ControllerBase
{
    private readonly ApplicationContext _context;

    public VeiculosController(ApplicationContext context)
    {
        _context = context;
    }

    /// <summary>Lista todos os veículos com seu fabricante e categoria.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Veiculo>>> GetAll()
    {
        var veiculos = await _context.Veiculos
            .Include(v => v.Fabricante)
            .Include(v => v.Categoria)
            .AsNoTracking()
            .ToListAsync();

        return Ok(veiculos);
    }

    /// <summary>Busca um veículo pelo id.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Veiculo>> GetById(int id)
    {
        var veiculo = await _context.Veiculos
            .Include(v => v.Fabricante)
            .Include(v => v.Categoria)
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == id);

        if (veiculo is null)
            return NotFound(new { mensagem = $"Veículo com id {id} não encontrado." });

        return Ok(veiculo);
    }

    /// <summary>Cadastra um novo veículo.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Veiculo>> Create([FromBody] Veiculo veiculo)
    {
        var erro = await ValidarAsync(veiculo, null);
        if (erro is not null)
            return BadRequest(new { mensagem = erro });

        try
        {
            // As navegações não são gravadas: apenas as chaves estrangeiras
            veiculo.Fabricante = null;
            veiculo.Categoria = null;

            _context.Veiculos.Add(veiculo);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new
            {
                mensagem = "Não foi possível salvar o veículo.",
                detalhe = ex.GetBaseException().Message
            });
        }

        return CreatedAtAction(nameof(GetById), new { id = veiculo.Id }, veiculo);
    }

    /// <summary>Atualiza um veículo existente.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Veiculo>> Update(int id, [FromBody] Veiculo veiculo)
    {
        if (id != veiculo.Id)
            return BadRequest(new { mensagem = "O id da rota é diferente do id informado no corpo da requisição." });

        var existente = await _context.Veiculos.FirstOrDefaultAsync(v => v.Id == id);

        if (existente is null)
            return NotFound(new { mensagem = $"Veículo com id {id} não encontrado." });

        var erro = await ValidarAsync(veiculo, id);
        if (erro is not null)
            return BadRequest(new { mensagem = erro });

        existente.Modelo = veiculo.Modelo;
        existente.Placa = veiculo.Placa;
        existente.AnoFabricacao = veiculo.AnoFabricacao;
        existente.Quilometragem = veiculo.Quilometragem;
        existente.Disponivel = veiculo.Disponivel;
        existente.FabricanteId = veiculo.FabricanteId;
        existente.CategoriaId = veiculo.CategoriaId;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new
            {
                mensagem = "Não foi possível atualizar o veículo.",
                detalhe = ex.GetBaseException().Message
            });
        }

        return Ok(existente);
    }

    /// <summary>Remove um veículo.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var veiculo = await _context.Veiculos.FirstOrDefaultAsync(v => v.Id == id);

        if (veiculo is null)
            return NotFound(new { mensagem = $"Veículo com id {id} não encontrado." });

        if (await _context.Alugueis.AnyAsync(a => a.VeiculoId == id))
            return BadRequest(new { mensagem = "Não é possível excluir: existem aluguéis vinculados a este veículo." });

        _context.Veiculos.Remove(veiculo);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Validações de negócio do veículo: existência das chaves estrangeiras e placa única.
    /// Quando idAtual é informado, a placa do próprio registro é desconsiderada.
    /// </summary>
    private async Task<string?> ValidarAsync(Veiculo veiculo, int? idAtual)
    {
        if (!await _context.Fabricantes.AnyAsync(f => f.Id == veiculo.FabricanteId))
            return $"Fabricante com id {veiculo.FabricanteId} não encontrado.";

        if (!await _context.Categorias.AnyAsync(c => c.Id == veiculo.CategoriaId))
            return $"Categoria com id {veiculo.CategoriaId} não encontrada.";

        var placaEmUso = idAtual is null
            ? await _context.Veiculos.AnyAsync(v => v.Placa == veiculo.Placa)
            : await _context.Veiculos.AnyAsync(v => v.Placa == veiculo.Placa && v.Id != idAtual);

        if (placaEmUso)
            return "Já existe um veículo cadastrado com essa placa.";

        return null;
    }
}
