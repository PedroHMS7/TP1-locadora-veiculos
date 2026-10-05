# Relatório de Testes — Locadora de Veículos

Trabalho Prático 1 — Etapa 3 (item 3.3)

Todos os testes foram realizados manualmente pela interface do Swagger
(`http://localhost:5000/swagger`), com o banco `LocadoraVeiculosDb` em execução no SQL Server Express.

Cada teste abaixo registra a chamada realizada e o retorno obtido, evidenciados por print de tela.

> **Como preencher:** execute o teste no Swagger, tire o print mostrando a requisição e o
> *Server response*, salve a imagem em `docs/imagens/` com o nome indicado e o print aparecerá
> automaticamente neste relatório.

---

## 0. Swagger integrado ao projeto (item 3.1)

Interface do Swagger gerada pelo projeto, com todos os endpoints documentados.

![Swagger 1](imagens/00-swagger-geral-1.png)

![Swagger 2](imagens/00-swagger-geral-2.png)

![Swagger 3](imagens/00-swagger-geral-3.png)

---

## 1. Fabricantes

### 1.1 POST /api/Fabricantes — cadastrar fabricante

Corpo enviado:
```json
{ "nome": "Toyota", "paisOrigem": "Japão" }
```
Retorno esperado: **201 Created**

![POST Fabricantes](imagens/01-post-fabricantes.png)

![POST Fabricantes - retorno](imagens/01b-post-fabricantes-resposta.png)

### 1.2 GET /api/Fabricantes — listar fabricantes

Retorno esperado: **200 OK**

![GET Fabricantes](imagens/02-get-fabricantes.png)

### 1.3 GET /api/Fabricantes/{id} — buscar por id

Parâmetro: `id = 1`
Retorno esperado: **200 OK**

![GET Fabricantes por id](imagens/03-get-fabricantes-id.png)

### 1.4 PUT /api/Fabricantes/{id} — atualizar fabricante

Parâmetro: `id = 1`
Corpo enviado:
```json
{ "id": 1, "nome": "Toyota", "paisOrigem": "Japao" }
```
Retorno esperado: **200 OK**

![PUT Fabricantes](imagens/04-put-fabricantes.png)
![PUT Fabricantes](imagens/04b-put-fabricantes-resposta.png)

### 1.5 DELETE /api/Fabricantes/{id} — remover fabricante

Parâmetro: `id` de um fabricante sem veículos vinculados
Retorno esperado: **204 No Content**

![DELETE Fabricantes](imagens/05-delete-fabricantes.png)

---

## 2. Categorias

### 2.1 POST /api/Categorias

```json
{ "nome": "SUV", "descricao": "Utilitario esportivo", "valorDiariaBase": 250.00 }
```
Retorno esperado: **201 Created**

![POST Categorias](imagens/06-post-categorias.png)

![POST Categorias - retorno](imagens/06b-post-categorias-resposta.png)

### 2.2 GET /api/Categorias

Retorno esperado: **200 OK**

![GET Categorias](imagens/07-get-categorias.png)

### 2.3 GET /api/Categorias/{id}

Parâmetro: `id = 1`
Retorno esperado: **200 OK**

![GET Categorias por id](imagens/08-get-categorias-id.png)

### 2.4 PUT /api/Categorias/{id}

```json
{ "id": 1, "nome": "SUV", "descricao": "Utilitario esportivo compacto", "valorDiariaBase": 280.00 }
```
Retorno esperado: **200 OK**

![PUT Categorias](imagens/09-put-categorias.png)
![PUT Categorias](imagens/09b-put-categorias-resposta.png)

### 2.5 DELETE /api/Categorias/{id}

Parâmetro: `id` de uma categoria sem veículos vinculados
Retorno esperado: **204 No Content**

![DELETE Categorias](imagens/10-delete-categorias.png)

---

## 3. Clientes

### 3.1 POST /api/Clientes

```json
{ "nome": "Pedro Henrique", "cpf": "12345678901", "email": "pedro@email.com", "telefone": "31999999999" }
```
Retorno esperado: **201 Created**

![POST Clientes](imagens/11-post-clientes.png)

![POST Clientes - retorno](imagens/11b-post-clientes-resposta.png)

### 3.2 GET /api/Clientes

Retorno esperado: **200 OK**

![GET Clientes](imagens/12-get-clientes.png)

### 3.3 GET /api/Clientes/{id}

Parâmetro: `id = 1`
Retorno esperado: **200 OK**

![GET Clientes por id](imagens/13-get-clientes-id.png)

### 3.4 PUT /api/Clientes/{id}

```json
{ "id": 1, "nome": "Pedro Henrique Silva", "cpf": "12345678901", "email": "pedro@email.com", "telefone": "31988888888" }
```
Retorno esperado: **200 OK**

![PUT Clientes](imagens/14-put-clientes.png)
![PUT Clientes](imagens/14b-put-clientes-resposta.png)

### 3.5 DELETE /api/Clientes/{id}

Parâmetro: `id` de um cliente sem aluguéis vinculados
Retorno esperado: **204 No Content**

![DELETE Clientes](imagens/15-delete-clientes.png)

---

## 4. Veículos

### 4.1 POST /api/Veiculos

```json
{ "modelo": "Corolla Cross", "placa": "ABC1D23", "anoFabricacao": 2023, "quilometragem": 15000, "disponivel": true, "fabricanteId": 1, "categoriaId": 1 }
```
Retorno esperado: **201 Created**

![POST Veiculos](imagens/16-post-veiculos.png)

![POST Veiculos - retorno](imagens/16b-post-veiculos-resposta.png)

### 4.2 GET /api/Veiculos

Retorno esperado: **200 OK** (com fabricante e categoria carregados)

![GET Veiculos](imagens/17-get-veiculos.png)

### 4.3 GET /api/Veiculos/{id}

Parâmetro: `id = 1`
Retorno esperado: **200 OK**

![GET Veiculos por id](imagens/18-get-veiculos-id.png)

### 4.4 PUT /api/Veiculos/{id}

```json
{ "id": 1, "modelo": "Corolla Cross", "placa": "ABC1D23", "anoFabricacao": 2023, "quilometragem": 18000, "disponivel": true, "fabricanteId": 1, "categoriaId": 1 }
```
Retorno esperado: **200 OK**

![PUT Veiculos](imagens/19-put-veiculos.png)
![PUT Veiculos](imagens/19b-put-veiculos-resposta.png)

### 4.5 DELETE /api/Veiculos/{id}

Parâmetro: `id` de um veículo sem aluguéis vinculados
Retorno esperado: **204 No Content**

![DELETE Veiculos](imagens/20-delete-veiculos.png)

---

## 5. Aluguéis

### 5.1 POST /api/Alugueis

```json
{ "clienteId": 1, "veiculoId": 1, "dataRetirada": "2026-09-27T10:00:00", "dataPrevistaDevolucao": "2026-09-30T10:00:00", "quilometragemInicial": 15000, "valorDiaria": 250.00 }
```
Retorno esperado: **201 Created**

![POST Alugueis](imagens/21-post-alugueis.png)

![POST Alugueis - retorno](imagens/21b-post-alugueis-resposta.png)

### 5.2 GET /api/Alugueis

Retorno esperado: **200 OK** (com cliente e veículo carregados)

![GET Alugueis](imagens/22-get-alugueis.png)

### 5.3 GET /api/Alugueis/{id}

Parâmetro: `id = 1`
Retorno esperado: **200 OK**

![GET Alugueis por id](imagens/23-get-alugueis-id.png)

### 5.4 PUT /api/Alugueis/{id} — registrar a devolução

```json
{ "id": 1, "clienteId": 1, "veiculoId": 1, "dataRetirada": "2026-09-27T10:00:00", "dataPrevistaDevolucao": "2026-09-30T10:00:00", "dataDevolucao": "2026-09-30T09:00:00", "quilometragemInicial": 15000, "quilometragemFinal": 15600, "valorDiaria": 250.00, "valorTotal": 750.00 }
```
Retorno esperado: **200 OK**

![PUT Alugueis](imagens/24-put-alugueis.png)
![PUT Alugueis](imagens/24b-put-alugueis-resposta.png)

### 5.5 DELETE /api/Alugueis/{id}

Parâmetro: `id = 1`
Retorno esperado: **204 No Content**

![DELETE Alugueis](imagens/25-delete-alugueis.png)

---

## 6. Filtros

### 6.1 GET /api/Filtros/veiculos-por-fabricante (INNER JOIN)

Parâmetro: `fabricante = Toyota`
Retorno esperado: **200 OK** — veículos com o nome do fabricante e da categoria

![Filtro 1](imagens/26-filtro-veiculos-por-fabricante.png)

### 6.2 GET /api/Filtros/alugueis-por-periodo (INNER JOIN)

Parâmetros: `inicio = 2026-09-01`, `fim = 2026-10-31`
Retorno esperado: **200 OK** — aluguéis com dados do cliente e do veículo

![Filtro 2](imagens/27-filtro-alugueis-por-periodo.png)

![Filtro 2 - retorno](imagens/27b-filtro-alugueis-por-periodo-resposta.png)

### 6.3 GET /api/Filtros/fabricantes-com-veiculos (LEFT JOIN)

Parâmetro: `pais` em branco
Retorno esperado: **200 OK** — inclui fabricantes sem veículos, com `veiculo: null`

![Filtro 3](imagens/28-filtro-fabricantes-com-veiculos.png)

### 6.4 GET /api/Filtros/clientes-com-alugueis (LEFT JOIN)

Parâmetro: `nome` em branco
Retorno esperado: **200 OK** — inclui clientes sem aluguéis, com `aluguelId: null`

![Filtro 4](imagens/29-filtro-clientes-com-alugueis.png)

### 6.5 GET /api/Filtros/veiculos-disponiveis-por-categoria (INNER JOIN)

Parâmetro: `categoria = SUV`
Retorno esperado: **200 OK** — apenas veículos disponíveis

![Filtro 5](imagens/30-filtro-veiculos-disponiveis.png)

![Filtro 5 - retorno](imagens/30b-filtro-veiculos-disponiveis-resposta.png)

---

## 7. Testes de validação e tratamento de erros

### 7.1 POST /api/Clientes com CPF inválido

```json
{ "nome": "Teste", "cpf": "123", "email": "teste@email.com" }
```
Retorno esperado: **400 Bad Request** — mensagem sobre os 11 dígitos

![CPF invalido](imagens/31-erro-cpf-invalido.png)

### 7.2 GET /api/Fabricantes/{id} com id inexistente

Parâmetro: `id = 100`
Retorno esperado: **404 Not Found**

![Id inexistente](imagens/32-erro-id-inexistente.png)

### 7.3 POST /api/Veiculos com fabricante inexistente

```json
{ "modelo": "Teste", "placa": "XYZ9A88", "anoFabricacao": 2020, "quilometragem": 0, "disponivel": true, "fabricanteId": 999, "categoriaId": 1 }
```
Retorno esperado: **400 Bad Request** — fabricante não encontrado

![FK inexistente](imagens/33-erro-fk-inexistente.png)

### 7.4 DELETE /api/Categorias/{id} com veículos vinculados

Parâmetro: `id = 1`
Retorno esperado: **400 Bad Request** — exclusão bloqueada pela integridade referencial

![Exclusao bloqueada](imagens/34-erro-exclusao-com-dependentes.png)

---

## Conclusão

Todos os endpoints das cinco entidades (Fabricante, Categoria, Cliente, Veículo e Aluguel)
e as cinco rotas de filtro foram testados manualmente pelo Swagger, retornando os códigos
HTTP esperados. As validações de entrada e o tratamento de erros também foram verificados,
devolvendo 400 para dados inválidos e 404 para registros inexistentes.
