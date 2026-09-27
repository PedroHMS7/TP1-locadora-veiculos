using LocadoraVeiculos.Data;
using LocadoraVeiculos.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculos.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ClientesController : ControllerBase
{
    private readonly ApplicationContext _context;

    public ClientesController(ApplicationContext context)
    {
        _context = context;
    }

    /// <summary>Lista todos os clientes.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Cliente>>> GetAll()
    {
        var clientes = await _context.Clientes.AsNoTracking().ToListAsync();
        return Ok(clientes);
    }

    /// <summary>Busca um cliente pelo id.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Cliente>> GetById(int id)
    {
        var cliente = await _context.Clientes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);

        if (cliente is null)
            return NotFound(new { mensagem = $"Cliente com id {id} não encontrado." });

        return Ok(cliente);
    }

    /// <summary>Cadastra um novo cliente.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Cliente>> Create([FromBody] Cliente cliente)
    {
        // Regras de negócio: CPF e e-mail são únicos
        if (await _context.Clientes.AnyAsync(c => c.Cpf == cliente.Cpf))
            return BadRequest(new { mensagem = "Já existe um cliente cadastrado com esse CPF." });

        if (await _context.Clientes.AnyAsync(c => c.Email == cliente.Email))
            return BadRequest(new { mensagem = "Já existe um cliente cadastrado com esse e-mail." });

        try
        {
            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new
            {
                mensagem = "Não foi possível salvar o cliente.",
                detalhe = ex.GetBaseException().Message
            });
        }

        return CreatedAtAction(nameof(GetById), new { id = cliente.Id }, cliente);
    }

    /// <summary>Atualiza um cliente existente.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Cliente>> Update(int id, [FromBody] Cliente cliente)
    {
        if (id != cliente.Id)
            return BadRequest(new { mensagem = "O id da rota é diferente do id informado no corpo da requisição." });

        var existente = await _context.Clientes.FirstOrDefaultAsync(c => c.Id == id);

        if (existente is null)
            return NotFound(new { mensagem = $"Cliente com id {id} não encontrado." });

        if (await _context.Clientes.AnyAsync(c => c.Cpf == cliente.Cpf && c.Id != id))
            return BadRequest(new { mensagem = "Já existe outro cliente cadastrado com esse CPF." });

        if (await _context.Clientes.AnyAsync(c => c.Email == cliente.Email && c.Id != id))
            return BadRequest(new { mensagem = "Já existe outro cliente cadastrado com esse e-mail." });

        existente.Nome = cliente.Nome;
        existente.Cpf = cliente.Cpf;
        existente.Email = cliente.Email;
        existente.Telefone = cliente.Telefone;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new
            {
                mensagem = "Não foi possível atualizar o cliente.",
                detalhe = ex.GetBaseException().Message
            });
        }

        return Ok(existente);
    }

    /// <summary>Remove um cliente.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var cliente = await _context.Clientes.FirstOrDefaultAsync(c => c.Id == id);

        if (cliente is null)
            return NotFound(new { mensagem = $"Cliente com id {id} não encontrado." });

        if (await _context.Alugueis.AnyAsync(a => a.ClienteId == id))
            return BadRequest(new { mensagem = "Não é possível excluir: existem aluguéis vinculados a este cliente." });

        _context.Clientes.Remove(cliente);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
