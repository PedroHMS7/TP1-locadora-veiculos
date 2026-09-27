using LocadoraVeiculos.Data;
using LocadoraVeiculos.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculos.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class FabricantesController : ControllerBase
{
    private readonly ApplicationContext _context;

    public FabricantesController(ApplicationContext context)
    {
        _context = context;
    }

    /// <summary>Lista todos os fabricantes.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Fabricante>>> GetAll()
    {
        var fabricantes = await _context.Fabricantes.AsNoTracking().ToListAsync();
        return Ok(fabricantes);
    }

    /// <summary>Busca um fabricante pelo id.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Fabricante>> GetById(int id)
    {
        var fabricante = await _context.Fabricantes.AsNoTracking().FirstOrDefaultAsync(f => f.Id == id);

        if (fabricante is null)
            return NotFound(new { mensagem = $"Fabricante com id {id} não encontrado." });

        return Ok(fabricante);
    }

    /// <summary>Cadastra um novo fabricante.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Fabricante>> Create([FromBody] Fabricante fabricante)
    {
        // Regra de negócio: o nome do fabricante é único
        if (await _context.Fabricantes.AnyAsync(f => f.Nome == fabricante.Nome))
            return BadRequest(new { mensagem = "Já existe um fabricante cadastrado com esse nome." });

        try
        {
            _context.Fabricantes.Add(fabricante);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new
            {
                mensagem = "Não foi possível salvar o fabricante.",
                detalhe = ex.GetBaseException().Message
            });
        }

        return CreatedAtAction(nameof(GetById), new { id = fabricante.Id }, fabricante);
    }

    /// <summary>Atualiza um fabricante existente.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Fabricante>> Update(int id, [FromBody] Fabricante fabricante)
    {
        if (id != fabricante.Id)
            return BadRequest(new { mensagem = "O id da rota é diferente do id informado no corpo da requisição." });

        var existente = await _context.Fabricantes.FirstOrDefaultAsync(f => f.Id == id);

        if (existente is null)
            return NotFound(new { mensagem = $"Fabricante com id {id} não encontrado." });

        if (await _context.Fabricantes.AnyAsync(f => f.Nome == fabricante.Nome && f.Id != id))
            return BadRequest(new { mensagem = "Já existe outro fabricante cadastrado com esse nome." });

        existente.Nome = fabricante.Nome;
        existente.PaisOrigem = fabricante.PaisOrigem;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new
            {
                mensagem = "Não foi possível atualizar o fabricante.",
                detalhe = ex.GetBaseException().Message
            });
        }

        return Ok(existente);
    }

    /// <summary>Remove um fabricante.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var fabricante = await _context.Fabricantes.FirstOrDefaultAsync(f => f.Id == id);

        if (fabricante is null)
            return NotFound(new { mensagem = $"Fabricante com id {id} não encontrado." });

        // Integridade referencial: não permite excluir fabricante com veículos vinculados
        if (await _context.Veiculos.AnyAsync(v => v.FabricanteId == id))
            return BadRequest(new { mensagem = "Não é possível excluir: existem veículos vinculados a este fabricante." });

        _context.Fabricantes.Remove(fabricante);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
