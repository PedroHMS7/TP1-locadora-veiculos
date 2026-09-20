using LocadoraVeiculos.Models;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculos.Data;

public class ApplicationContext : DbContext
{
    public ApplicationContext(DbContextOptions<ApplicationContext> options)
        : base(options)
    {
    }

    // Cada DbSet vira uma tabela no SQL Server
    public DbSet<Fabricante> Fabricantes => Set<Fabricante>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Veiculo> Veiculos => Set<Veiculo>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Aluguel> Alugueis => Set<Aluguel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ---------- Fabricante ----------
        modelBuilder.Entity<Fabricante>(e =>
        {
            e.ToTable("Fabricantes");
            e.HasKey(f => f.Id);
            e.Property(f => f.Nome).IsRequired().HasMaxLength(100);
            e.Property(f => f.PaisOrigem).HasMaxLength(60);
            e.HasIndex(f => f.Nome).IsUnique();
        });

        // ---------- Categoria ----------
        modelBuilder.Entity<Categoria>(e =>
        {
            e.ToTable("Categorias");
            e.HasKey(c => c.Id);
            e.Property(c => c.Nome).IsRequired().HasMaxLength(60);
            e.Property(c => c.Descricao).HasMaxLength(200);
            e.Property(c => c.ValorDiariaBase).HasColumnType("decimal(10,2)");
            e.HasIndex(c => c.Nome).IsUnique();
        });

        // ---------- Veiculo ----------
        modelBuilder.Entity<Veiculo>(e =>
        {
            e.ToTable("Veiculos");
            e.HasKey(v => v.Id);
            e.Property(v => v.Modelo).IsRequired().HasMaxLength(100);
            e.Property(v => v.Placa).IsRequired().HasMaxLength(8);
            e.Property(v => v.AnoFabricacao).IsRequired();
            e.Property(v => v.Quilometragem).IsRequired();
            e.HasIndex(v => v.Placa).IsUnique();

            // FK Veiculo -> Fabricante (N:1)
            e.HasOne(v => v.Fabricante)
             .WithMany(f => f.Veiculos)
             .HasForeignKey(v => v.FabricanteId)
             .OnDelete(DeleteBehavior.Restrict);

            // FK Veiculo -> Categoria (N:1)
            e.HasOne(v => v.Categoria)
             .WithMany(c => c.Veiculos)
             .HasForeignKey(v => v.CategoriaId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ---------- Cliente ----------
        modelBuilder.Entity<Cliente>(e =>
        {
            e.ToTable("Clientes");
            e.HasKey(c => c.Id);
            e.Property(c => c.Nome).IsRequired().HasMaxLength(150);
            e.Property(c => c.Cpf).IsRequired().HasMaxLength(11);
            e.Property(c => c.Email).IsRequired().HasMaxLength(150);
            e.Property(c => c.Telefone).HasMaxLength(20);
            e.HasIndex(c => c.Cpf).IsUnique();
            e.HasIndex(c => c.Email).IsUnique();
        });

        // ---------- Aluguel ----------
        modelBuilder.Entity<Aluguel>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.DataRetirada).IsRequired();
            e.Property(a => a.DataPrevistaDevolucao).IsRequired();
            e.Property(a => a.QuilometragemInicial).IsRequired();
            e.Property(a => a.ValorDiaria).HasColumnType("decimal(10,2)");
            e.Property(a => a.ValorTotal).HasColumnType("decimal(12,2)");

            // FK Aluguel -> Cliente (N:1)
            e.HasOne(a => a.Cliente)
             .WithMany(c => c.Alugueis)
             .HasForeignKey(a => a.ClienteId)
             .OnDelete(DeleteBehavior.Restrict);

            // FK Aluguel -> Veiculo (N:1)
            e.HasOne(a => a.Veiculo)
             .WithMany(v => v.Alugueis)
             .HasForeignKey(a => a.VeiculoId)
             .OnDelete(DeleteBehavior.Restrict);

            // Nome da tabela + restrições de integridade (CHECK constraints)
            e.ToTable("Alugueis", t =>
            {
                t.HasCheckConstraint("CK_Aluguel_Periodo", "[DataPrevistaDevolucao] >= [DataRetirada]");
                t.HasCheckConstraint("CK_Aluguel_Km", "[QuilometragemFinal] IS NULL OR [QuilometragemFinal] >= [QuilometragemInicial]");
                t.HasCheckConstraint("CK_Aluguel_ValorDiaria", "[ValorDiaria] > 0");
            });
        });
    }
}
