using LocadoraVeiculos.Data;
using LocadoraVeiculos.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculos.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CategoriasController : ControllerBase
{
    private readonly ApplicationContext _context;

    public CategoriasController(ApplicationContext context)
    {
        _context = context;
    }

    /// <summary>Lista todas as categorias.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Categoria>>> GetAll()
    {
        var categorias = await _context.Categorias.AsNoTracking().ToListAsync();
        return Ok(categorias);
    }

    /// <summary>Busca uma categoria pelo id.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Categoria>> GetById(int id)
    {
        var categoria = await _context.Categorias.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);

        if (categoria is null)
            return NotFound(new { mensagem = $"Categoria com id {id} não encontrada." });

        return Ok(categoria);
    }

    /// <summary>Cadastra uma nova categoria.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Categoria>> Create([FromBody] Categoria categoria)
    {
        if (await _context.Categorias.AnyAsync(c => c.Nome == categoria.Nome))
            return BadRequest(new { mensagem = "Já existe uma categoria cadastrada com esse nome." });

        try
        {
            _context.Categorias.Add(categoria);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new
            {
                mensagem = "Não foi possível salvar a categoria.",
                detalhe = ex.GetBaseException().Message
            });
        }

        return CreatedAtAction(nameof(GetById), new { id = categoria.Id }, categoria);
    }

    /// <summary>Atualiza uma categoria existente.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Categoria>> Update(int id, [FromBody] Categoria categoria)
    {
        if (id != categoria.Id)
            return BadRequest(new { mensagem = "O id da rota é diferente do id informado no corpo da requisição." });

        var existente = await _context.Categorias.FirstOrDefaultAsync(c => c.Id == id);

        if (existente is null)
            return NotFound(new { mensagem = $"Categoria com id {id} não encontrada." });

        if (await _context.Categorias.AnyAsync(c => c.Nome == categoria.Nome && c.Id != id))
            return BadRequest(new { mensagem = "Já existe outra categoria cadastrada com esse nome." });

        existente.Nome = categoria.Nome;
        existente.Descricao = categoria.Descricao;
        existente.ValorDiariaBase = categoria.ValorDiariaBase;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new
            {
                mensagem = "Não foi possível atualizar a categoria.",
                detalhe = ex.GetBaseException().Message
            });
        }

        return Ok(existente);
    }

    /// <summary>Remove uma categoria.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var categoria = await _context.Categorias.FirstOrDefaultAsync(c => c.Id == id);

        if (categoria is null)
            return NotFound(new { mensagem = $"Categoria com id {id} não encontrada." });

        if (await _context.Veiculos.AnyAsync(v => v.CategoriaId == id))
            return BadRequest(new { mensagem = "Não é possível excluir: existem veículos vinculados a esta categoria." });

        _context.Categorias.Remove(categoria);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
