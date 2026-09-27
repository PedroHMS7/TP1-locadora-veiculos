using LocadoraVeiculos.Data;
using LocadoraVeiculos.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculos.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AlugueisController : ControllerBase
{
    private readonly ApplicationContext _context;

    public AlugueisController(ApplicationContext context)
    {
        _context = context;
    }

    /// <summary>Lista todos os aluguéis com cliente e veículo.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Aluguel>>> GetAll()
    {
        var alugueis = await _context.Alugueis
            .Include(a => a.Cliente)
            .Include(a => a.Veiculo)
            .AsNoTracking()
            .ToListAsync();

        return Ok(alugueis);
    }

    /// <summary>Busca um aluguel pelo id.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Aluguel>> GetById(int id)
    {
        var aluguel = await _context.Alugueis
            .Include(a => a.Cliente)
            .Include(a => a.Veiculo)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        if (aluguel is null)
            return NotFound(new { mensagem = $"Aluguel com id {id} não encontrado." });

        return Ok(aluguel);
    }

    /// <summary>Registra um novo aluguel.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Aluguel>> Create([FromBody] Aluguel aluguel)
    {
        var erro = await ValidarAsync(aluguel);
        if (erro is not null)
            return BadRequest(new { mensagem = erro });

        try
        {
            aluguel.Cliente = null;
            aluguel.Veiculo = null;

            _context.Alugueis.Add(aluguel);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new
            {
                mensagem = "Não foi possível salvar o aluguel.",
                detalhe = ex.GetBaseException().Message
            });
        }

        return CreatedAtAction(nameof(GetById), new { id = aluguel.Id }, aluguel);
    }

    /// <summary>Atualiza um aluguel existente (inclusive o registro da devolução).</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Aluguel>> Update(int id, [FromBody] Aluguel aluguel)
    {
        if (id != aluguel.Id)
            return BadRequest(new { mensagem = "O id da rota é diferente do id informado no corpo da requisição." });

        var existente = await _context.Alugueis.FirstOrDefaultAsync(a => a.Id == id);

        if (existente is null)
            return NotFound(new { mensagem = $"Aluguel com id {id} não encontrado." });

        var erro = await ValidarAsync(aluguel);
        if (erro is not null)
            return BadRequest(new { mensagem = erro });

        existente.ClienteId = aluguel.ClienteId;
        existente.VeiculoId = aluguel.VeiculoId;
        existente.DataRetirada = aluguel.DataRetirada;
        existente.DataPrevistaDevolucao = aluguel.DataPrevistaDevolucao;
        existente.DataDevolucao = aluguel.DataDevolucao;
        existente.QuilometragemInicial = aluguel.QuilometragemInicial;
        existente.QuilometragemFinal = aluguel.QuilometragemFinal;
        existente.ValorDiaria = aluguel.ValorDiaria;
        existente.ValorTotal = aluguel.ValorTotal;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new
            {
                mensagem = "Não foi possível atualizar o aluguel.",
                detalhe = ex.GetBaseException().Message
            });
        }

        return Ok(existente);
    }

    /// <summary>Remove um aluguel.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var aluguel = await _context.Alugueis.FirstOrDefaultAsync(a => a.Id == id);

        if (aluguel is null)
            return NotFound(new { mensagem = $"Aluguel com id {id} não encontrado." });

        _context.Alugueis.Remove(aluguel);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Validações de negócio do aluguel: existência de cliente e veículo,
    /// coerência do período e da quilometragem.
    /// </summary>
    private async Task<string?> ValidarAsync(Aluguel aluguel)
    {
        if (!await _context.Clientes.AnyAsync(c => c.Id == aluguel.ClienteId))
            return $"Cliente com id {aluguel.ClienteId} não encontrado.";

        if (!await _context.Veiculos.AnyAsync(v => v.Id == aluguel.VeiculoId))
            return $"Veículo com id {aluguel.VeiculoId} não encontrado.";

        if (aluguel.DataPrevistaDevolucao < aluguel.DataRetirada)
            return "A data prevista de devolução não pode ser anterior à data de retirada.";

        if (aluguel.DataDevolucao is not null && aluguel.DataDevolucao < aluguel.DataRetirada)
            return "A data de devolução não pode ser anterior à data de retirada.";

        if (aluguel.QuilometragemFinal is not null && aluguel.QuilometragemFinal < aluguel.QuilometragemInicial)
            return "A quilometragem final não pode ser menor que a inicial.";

        return null;
    }
}
