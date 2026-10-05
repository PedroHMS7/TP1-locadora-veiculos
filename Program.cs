using System.Reflection;
using System.Text.Json.Serialization;
using LocadoraVeiculos.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Registro do ApplicationContext com SQL Server (SQL Express)
builder.Services.AddDbContext<ApplicationContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services
    .AddControllers(options =>
    {
        // As propriedades de navegação não são exigidas no JSON de entrada
        options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
    })
    .AddJsonOptions(options =>
    {
        // Evita erro de referência cíclica (Veiculo -> Fabricante -> Veiculos -> ...)
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();

// Integração do Swagger (item 3.1): documenta e permite testar as APIs
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "API - Locadora de Veículos",
        Version = "v1",
        Description = "API REST para gerenciamento de uma locadora de veículos."
    });

    // Usa os comentários /// <summary> dos controllers como descrição dos endpoints
    var arquivoXml = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var caminhoXml = Path.Combine(AppContext.BaseDirectory, arquivoXml);

    if (File.Exists(caminhoXml))
    {
        options.IncludeXmlComments(caminhoXml);
    }
});

var app = builder.Build();

// Tratamento global de exceções não previstas: devolve 500 com mensagem em JSON
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            mensagem = "Ocorreu um erro inesperado no servidor."
        });
    });
});

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "API - Locadora de Veículos v1");
});

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
