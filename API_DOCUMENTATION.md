# 📚 Documentação da API - Broday Transportes

Esta documentação descreve todas as rotas e funcionalidades da API REST da Broday Transportes.

## 🌐 Base URL

```
http://localhost:3000/api
```

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer <seu_token>
```

## 📋 Endpoints

### 🔑 Autenticação

#### POST `/auth/register`
Registrar novo usuário

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "userType": "cliente",
  "nome": "João Silva",
  "telefone": "(11) 99999-9999",
  // ... outros campos específicos do tipo
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

#### POST `/auth/login`
Fazer login

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "userType": "cliente"
}
```

#### POST `/auth/refresh-token`
Renovar token de acesso

**Body:**
```json
{
  "refreshToken": "..."
}
```

#### GET `/auth/profile` 🔒
Obter perfil do usuário logado

#### PUT `/auth/profile` 🔒
Atualizar perfil do usuário

#### PUT `/auth/change-password` 🔒
Alterar senha

**Body:**
```json
{
  "currentPassword": "senha_atual",
  "newPassword": "nova_senha"
}
```

#### POST `/auth/logout` 🔒
Fazer logout

### 📦 Fretes

#### POST `/fretes` 🔒👤
Criar novo frete (apenas clientes)

**Body:**
```json
{
  "tipoCarga": "Eletrônicos",
  "peso": 1500.000,
  "volume": 2.500,
  "valor": 2500.00,
  "observacoes": "Carga frágil",
  "origemEndereco": "Av. Paulista, 1000",
  "origemCidade": "São Paulo",
  "origemEstado": "SP",
  "origemCep": "01310-100",
  "destinoEndereco": "Rua da Consolação, 2000",
  "destinoCidade": "São Paulo",
  "destinoEstado": "SP",
  "destinoCep": "01302-000",
  "dataColeta": "2024-01-15T10:00:00Z",
  "dataEntrega": "2024-01-16T18:00:00Z"
}
```

#### GET `/fretes/meus-fretes` 🔒👤
Listar fretes do cliente logado

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `status` (opcional): Filtrar por status

#### GET `/fretes/disponiveis` 🔒🚛
Listar fretes disponíveis para motoristas

#### GET `/fretes/meus-fretes` 🔒🚛
Listar fretes do motorista logado

#### GET `/fretes/:id` 🔒
Buscar frete por ID

#### POST `/fretes/:id/aceitar` 🔒🚛
Aceitar frete (apenas motoristas)

#### PUT `/fretes/:id/status` 🔒
Atualizar status do frete

**Body:**
```json
{
  "status": "em_transito"
}
```

**Status possíveis:**
- `solicitado` - Frete solicitado pelo cliente
- `cotado` - Frete cotado
- `aceito` - Frete aceito pelo motorista
- `em_transito` - Frete em trânsito
- `entregue` - Frete entregue
- `cancelado` - Frete cancelado

#### GET `/fretes` 🔒👨‍💼
Listar todos os fretes (apenas administradores)

## 📊 Modelos de Dados

### User
```json
{
  "id": 1,
  "email": "usuario@exemplo.com",
  "userType": "cliente",
  "isActive": true,
  "emailVerified": true,
  "lastLogin": "2024-01-15T10:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Motorista
```json
{
  "id": 1,
  "userId": 1,
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "cnh": "12345678901",
  "categoria": "C",
  "telefone": "(11) 99999-9999",
  "endereco": "Rua das Flores, 123",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234-567",
  "status": "ativo",
  "dataNascimento": "1985-05-15",
  "salario": 3500.00
}
```

### Cliente
```json
{
  "id": 1,
  "userId": 1,
  "nome": "Empresa ABC Ltda",
  "tipoPessoa": "juridica",
  "documento": "12.345.678/0001-90",
  "telefone": "(11) 99999-9999",
  "endereco": "Av. Paulista, 1000",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310-100",
  "status": "ativo",
  "limiteCredito": 50000.00,
  "observacoes": "Cliente preferencial"
}
```

### Admin
```json
{
  "id": 1,
  "userId": 1,
  "nome": "Administrador Sistema",
  "cpf": "123.456.789-00",
  "telefone": "(11) 99999-9999",
  "departamento": "ti",
  "cargo": "Administrador",
  "nivelAcesso": "master",
  "status": "ativo",
  "dataAdmissao": "2024-01-01",
  "salario": 8000.00
}
```

### Frete
```json
{
  "id": 1,
  "clienteId": 1,
  "motoristaId": 1,
  "codigo": "FR001",
  "status": "solicitado",
  "tipoCarga": "Eletrônicos",
  "peso": 1500.000,
  "volume": 2.500,
  "valor": 2500.00,
  "observacoes": "Carga frágil",
  "origemEndereco": "Av. Paulista, 1000",
  "origemCidade": "São Paulo",
  "origemEstado": "SP",
  "origemCep": "01310-100",
  "destinoEndereco": "Rua da Consolação, 2000",
  "destinoCidade": "São Paulo",
  "destinoEstado": "SP",
  "destinoCep": "01302-000",
  "dataColeta": "2024-01-15T10:00:00Z",
  "dataEntrega": "2024-01-16T18:00:00Z",
  "dataColetaReal": null,
  "dataEntregaReal": null
}
```

## 🔒 Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `429` - Muitas tentativas
- `500` - Erro interno do servidor

## 📝 Formato de Resposta

### Sucesso
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": { ... }
}
```

### Erro
```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": [ ... ] // Apenas para erros de validação
}
```

## 🔐 Tipos de Usuário e Permissões

### 👤 Cliente
- Criar fretes
- Visualizar seus fretes
- Cancelar fretes
- Atualizar perfil

### 🚛 Motorista
- Visualizar fretes disponíveis
- Aceitar fretes
- Atualizar status dos fretes
- Visualizar seus fretes
- Atualizar perfil

### 👨‍💼 Administrador
- Visualizar todos os fretes
- Gerenciar usuários
- Relatórios e estatísticas
- Configurações do sistema

## 🧪 Exemplos de Uso

### Login e Obter Token
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'cliente@broday.com',
    password: 'cliente123',
    userType: 'cliente'
  })
});

const data = await response.json();
const token = data.data.tokens.accessToken;
```

### Criar Frete
```javascript
const response = await fetch('http://localhost:3000/api/fretes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    tipoCarga: 'Eletrônicos',
    peso: 1500.000,
    valor: 2500.00,
    origemEndereco: 'Av. Paulista, 1000',
    origemCidade: 'São Paulo',
    origemEstado: 'SP',
    origemCep: '01310-100',
    destinoEndereco: 'Rua da Consolação, 2000',
    destinoCidade: 'São Paulo',
    destinoEstado: 'SP',
    destinoCep: '01302-000'
  })
});
```

## 🔄 Rate Limiting

A API possui rate limiting configurado:
- **100 requests** por **15 minutos** por IP
- Headers de resposta incluem informações sobre o limite

## 🛡️ Segurança

- **HTTPS** recomendado para produção
- **JWT** com expiração configurável
- **CORS** configurado
- **Helmet** para headers de segurança
- **Validação** de entrada em todas as rotas
- **Sanitização** de dados

---

**Desenvolvido para Broday Transportes** © 2024
