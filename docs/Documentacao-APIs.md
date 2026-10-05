# Documentação das APIs — Locadora de Veículos

Trabalho Prático 1 — Etapa 3 (item 3.2)

URL base: `http://localhost:5000` (ou a porta exibida pelo `dotnet run`)
Swagger: `http://localhost:5000/swagger`
Formato de entrada e saída: `application/json`

---

## Códigos de resposta utilizados

| Código | Significado | Quando ocorre |
|---|---|---|
| 200 OK | Requisição bem-sucedida | GET e PUT executados com sucesso |
| 201 Created | Recurso criado | POST executado com sucesso (header `location` com a URL do novo recurso) |
| 204 No Content | Sucesso sem corpo de resposta | DELETE executado com sucesso |
| 400 Bad Request | Dados inválidos ou regra de negócio violada | Validação das Data Annotations, duplicidade, chave estrangeira inexistente, exclusão com registros dependentes |
| 404 Not Found | Recurso inexistente | Id informado não existe no banco |
| 500 Internal Server Error | Erro inesperado | Tratado pelo handler global, devolve JSON com mensagem genérica |

---

## 1. Fabricantes — `/api/Fabricantes`

| Método | Rota | Parâmetros | Respostas |
|---|---|---|---|
| GET | `/api/Fabricantes` | — | 200 |
| GET | `/api/Fabricantes/{id}` | `id` (rota, int) | 200, 404 |
| POST | `/api/Fabricantes` | corpo: objeto Fabricante | 201, 400 |
| PUT | `/api/Fabricantes/{id}` | `id` (rota, int) + corpo | 200, 400, 404 |
| DELETE | `/api/Fabricantes/{id}` | `id` (rota, int) | 204, 400, 404 |

**Corpo (POST / PUT)**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| id | int | só no PUT | deve ser igual ao id da rota |
| nome | string | sim | 2 a 100 caracteres, único |
| paisOrigem | string | não | até 60 caracteres |

```json
{ "nome": "Toyota", "paisOrigem": "Japão" }
```

**Erros específicos:** nome já cadastrado (400); exclusão com veículos vinculados (400).

---

## 2. Categorias — `/api/Categorias`

| Método | Rota | Parâmetros | Respostas |
|---|---|---|---|
| GET | `/api/Categorias` | — | 200 |
| GET | `/api/Categorias/{id}` | `id` (rota, int) | 200, 404 |
| POST | `/api/Categorias` | corpo: objeto Categoria | 201, 400 |
| PUT | `/api/Categorias/{id}` | `id` (rota, int) + corpo | 200, 400, 404 |
| DELETE | `/api/Categorias/{id}` | `id` (rota, int) | 204, 400, 404 |

**Corpo (POST / PUT)**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| id | int | só no PUT | deve ser igual ao id da rota |
| nome | string | sim | 2 a 60 caracteres, único |
| descricao | string | não | até 200 caracteres |
| valorDiariaBase | decimal | sim | maior que zero |

```json
{ "nome": "SUV", "descricao": "Utilitario esportivo", "valorDiariaBase": 250.00 }
```

**Erros específicos:** nome já cadastrado (400); exclusão com veículos vinculados (400).

---

## 3. Clientes — `/api/Clientes`

| Método | Rota | Parâmetros | Respostas |
|---|---|---|---|
| GET | `/api/Clientes` | — | 200 |
| GET | `/api/Clientes/{id}` | `id` (rota, int) | 200, 404 |
| POST | `/api/Clientes` | corpo: objeto Cliente | 201, 400 |
| PUT | `/api/Clientes/{id}` | `id` (rota, int) + corpo | 200, 400, 404 |
| DELETE | `/api/Clientes/{id}` | `id` (rota, int) | 204, 400, 404 |

**Corpo (POST / PUT)**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| id | int | só no PUT | deve ser igual ao id da rota |
| nome | string | sim | 3 a 150 caracteres |
| cpf | string | sim | exatamente 11 dígitos numéricos, único |
| email | string | sim | formato de e-mail válido, até 150 caracteres, único |
| telefone | string | não | até 20 caracteres |

```json
{ "nome": "Pedro Henrique", "cpf": "12345678901", "email": "pedro@email.com", "telefone": "31999999999" }
```

**Erros específicos:** CPF ou e-mail já cadastrados (400); exclusão com aluguéis vinculados (400).

---

## 4. Veículos — `/api/Veiculos`

| Método | Rota | Parâmetros | Respostas |
|---|---|---|---|
| GET | `/api/Veiculos` | — | 200 |
| GET | `/api/Veiculos/{id}` | `id` (rota, int) | 200, 404 |
| POST | `/api/Veiculos` | corpo: objeto Veiculo | 201, 400 |
| PUT | `/api/Veiculos/{id}` | `id` (rota, int) + corpo | 200, 400, 404 |
| DELETE | `/api/Veiculos/{id}` | `id` (rota, int) | 204, 400, 404 |

Os métodos GET retornam também o fabricante e a categoria do veículo (carregados com `Include`).

**Corpo (POST / PUT)**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| id | int | só no PUT | deve ser igual ao id da rota |
| modelo | string | sim | até 100 caracteres |
| placa | string | sim | 7 ou 8 caracteres, única |
| anoFabricacao | int | sim | entre 1950 e 2100 |
| quilometragem | int | sim | não negativa |
| disponivel | bool | não | padrão `true` |
| fabricanteId | int | sim | deve existir em Fabricantes |
| categoriaId | int | sim | deve existir em Categorias |

```json
{
  "modelo": "Corolla Cross",
  "placa": "ABC1D23",
  "anoFabricacao": 2023,
  "quilometragem": 15000,
  "disponivel": true,
  "fabricanteId": 1,
  "categoriaId": 1
}
```

**Erros específicos:** placa duplicada (400); fabricante ou categoria inexistentes (400); exclusão com aluguéis vinculados (400).

---

## 5. Aluguéis — `/api/Alugueis`

| Método | Rota | Parâmetros | Respostas |
|---|---|---|---|
| GET | `/api/Alugueis` | — | 200 |
| GET | `/api/Alugueis/{id}` | `id` (rota, int) | 200, 404 |
| POST | `/api/Alugueis` | corpo: objeto Aluguel | 201, 400 |
| PUT | `/api/Alugueis/{id}` | `id` (rota, int) + corpo | 200, 400, 404 |
| DELETE | `/api/Alugueis/{id}` | `id` (rota, int) | 204, 404 |

Os métodos GET retornam também o cliente e o veículo do aluguel.
O registro da devolução é feito pelo PUT, preenchendo `dataDevolucao`, `quilometragemFinal` e `valorTotal`.

**Corpo (POST / PUT)**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| id | int | só no PUT | deve ser igual ao id da rota |
| clienteId | int | sim | deve existir em Clientes |
| veiculoId | int | sim | deve existir em Veiculos |
| dataRetirada | datetime | sim | — |
| dataPrevistaDevolucao | datetime | sim | não pode ser anterior à retirada |
| dataDevolucao | datetime | não | não pode ser anterior à retirada |
| quilometragemInicial | int | sim | não negativa |
| quilometragemFinal | int | não | não pode ser menor que a inicial |
| valorDiaria | decimal | sim | maior que zero |
| valorTotal | decimal | não | não negativo |

```json
{
  "clienteId": 1,
  "veiculoId": 1,
  "dataRetirada": "2026-09-27T10:00:00",
  "dataPrevistaDevolucao": "2026-09-30T10:00:00",
  "quilometragemInicial": 15000,
  "valorDiaria": 250.00
}
```

**Erros específicos:** cliente ou veículo inexistentes (400); devolução anterior à retirada (400); quilometragem final menor que a inicial (400).

---

## 6. Filtros — `/api/Filtros`

Rotas de consulta com joins entre tabelas. Todas aceitam apenas o método **GET** e retornam **200**.

| # | Rota | Parâmetros (query) | Join | Respostas |
|---|---|---|---|---|
| 1 | `/api/Filtros/veiculos-por-fabricante` | `fabricante` (string, obrigatório) | INNER JOIN: Veiculo + Fabricante + Categoria | 200, 400 |
| 2 | `/api/Filtros/alugueis-por-periodo` | `inicio` (datetime), `fim` (datetime) | INNER JOIN: Aluguel + Cliente + Veiculo | 200, 400 |
| 3 | `/api/Filtros/fabricantes-com-veiculos` | `pais` (string, opcional) | LEFT JOIN: Fabricante + Veiculo | 200 |
| 4 | `/api/Filtros/clientes-com-alugueis` | `nome` (string, opcional) | LEFT JOIN: Cliente + Aluguel | 200 |
| 5 | `/api/Filtros/veiculos-disponiveis-por-categoria` | `categoria` (string, opcional), `valorMaximoDiaria` (decimal, opcional) | INNER JOIN: Veiculo + Categoria + Fabricante | 200 |

**Detalhamento**

1. **veiculos-por-fabricante** — lista os veículos cujo fabricante contém o texto informado. Retorna id, modelo, placa, ano, quilometragem, disponibilidade, nome do fabricante e nome da categoria. Retorna 400 quando o parâmetro `fabricante` não é informado.
2. **alugueis-por-periodo** — lista os aluguéis com data de retirada dentro do intervalo. Retorna id do aluguel, nome e CPF do cliente, modelo e placa do veículo, datas, valor da diária e valor total. Retorna 400 quando `fim` é anterior a `inicio`.
3. **fabricantes-com-veiculos** — lista os fabricantes e seus veículos. Por usar LEFT JOIN, fabricantes **sem veículos** também aparecem, com `veiculo` e `placa` nulos. O parâmetro `pais` filtra pelo país de origem.
4. **clientes-com-alugueis** — lista os clientes e seus aluguéis. Por usar LEFT JOIN, clientes que **nunca alugaram** também aparecem, com `aluguelId`, `dataRetirada` e `valorTotal` nulos. O parâmetro `nome` filtra pelo nome do cliente.
5. **veiculos-disponiveis-por-categoria** — lista apenas os veículos com `disponivel = true`, podendo filtrar pelo nome da categoria e pelo valor máximo da diária base.
