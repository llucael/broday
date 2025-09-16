# 🧪 Guia dos Testes CRUD - Broday Transportes

Este guia apresenta os testes específicos para operações CRUD (Create, Read, Update, Delete) com autenticação de diferentes tipos de usuário.

## 📁 Arquivos

- `Broday_Transportes_CRUD_Tests.postman_collection.json` - Coleção de testes CRUD
- `Broday_CRUD_Environment.postman_environment.json` - Ambiente de configuração
- `executar_testes_crud.sh` - Script para executar os testes

## 🚀 Como Executar

### Opção 1: Postman GUI
1. Importe `Broday_Transportes_CRUD_Tests.postman_collection.json`
2. Importe `Broday_CRUD_Environment.postman_environment.json`
3. Execute as pastas na ordem: 1 → 2 → 3 → 4 → 5

### Opção 2: Newman CLI
```bash
# Executar todos os testes CRUD
./executar_testes_crud.sh

# Executar categoria específica
newman run Broday_Transportes_CRUD_Tests.postman_collection.json -e Broday_CRUD_Environment.postman_environment.json --folder "2. Operações GET - Consultas"
```

## 📋 Estrutura dos Testes

### 1. Autenticação - Login de Usuários
**Objetivo**: Fazer login com diferentes tipos de usuário

#### Testes:
- **Login Cliente**: `POST /auth/login` com credenciais de cliente
- **Login Motorista**: `POST /auth/login` com credenciais de motorista  
- **Login Admin**: `POST /auth/login` com credenciais de administrador

#### Validações:
- Status 200 para login bem-sucedido
- Token de acesso salvo nas variáveis de ambiente
- Dados do usuário retornados corretamente

### 2. Operações GET - Consultas
**Objetivo**: Testar consultas de dados com diferentes permissões

#### Testes:
- **Health Check (Público)**: `GET /health` - sem autenticação
- **Perfil Cliente**: `GET /auth/profile` - com token de cliente
- **Perfil Motorista**: `GET /auth/profile` - com token de motorista
- **Perfil Admin**: `GET /auth/profile` - com token de admin
- **Fretes do Cliente**: `GET /fretes/cliente/meus-fretes` - fretes do cliente logado
- **Fretes Disponíveis**: `GET /fretes/disponiveis` - fretes para motoristas
- **Fretes do Motorista**: `GET /fretes/motorista/meus-fretes` - fretes do motorista logado
- **Todos os Fretes**: `GET /fretes` - todos os fretes (apenas admin)
- **Frete por ID**: `GET /fretes/{id}` - buscar frete específico

#### Validações:
- Status 200 para consultas bem-sucedidas
- Dados corretos retornados para cada tipo de usuário
- Listas de fretes com estrutura adequada

### 3. Operações POST - Criação
**Objetivo**: Testar criação de recursos

#### Testes:
- **Criar Frete (Cliente)**: `POST /fretes` - cliente cria novo frete com campos completos
- **Aceitar Frete (Motorista)**: `POST /fretes/{id}/aceitar` - motorista aceita frete
- **Atualizar Status**: `PUT /fretes/{id}/status` - atualizar status do frete
- **Registrar Cliente**: `POST /auth/register` - registrar novo usuário

#### Validações:
- Status 201 para criação bem-sucedida
- Recursos criados com dados corretos
- IDs salvos para testes posteriores

### 4. Operações DELETE - Exclusão
**Objetivo**: Testar exclusão de recursos

#### Testes:
- **Cancelar Frete (Cliente)**: `DELETE /fretes/{id}` - cliente cancela frete
- **Deletar Usuário (Admin)**: `DELETE /admin/usuarios/{id}` - admin remove usuário
- **Deletar Frete (Admin)**: `DELETE /admin/fretes/{id}` - admin remove frete

#### Validações:
- Status 200 para exclusão bem-sucedida
- Mensagens de confirmação adequadas
- Recursos removidos corretamente

### 5. Testes de Validação e Erros
**Objetivo**: Verificar tratamento de erros

#### Testes:
- **Acesso Negado**: `GET /fretes/meus-fretes` sem token
- **Dados Inválidos**: `POST /fretes` com dados incorretos
- **Recurso Não Encontrado**: `DELETE /fretes/99999` com ID inexistente

#### Validações:
- Status 401 para acesso negado
- Status 400 para dados inválidos
- Status 404 para recurso não encontrado
- Mensagens de erro apropriadas

## 🔐 Tipos de Usuário e Permissões

### 👤 Cliente
- **Pode**: Criar fretes, visualizar seus fretes, cancelar fretes
- **Não pode**: Ver fretes de outros clientes, aceitar fretes, gerenciar usuários

### 🚛 Motorista
- **Pode**: Ver fretes disponíveis, aceitar fretes, atualizar status
- **Não pode**: Criar fretes, ver fretes de outros motoristas

### 👨‍💼 Administrador
- **Pode**: Ver todos os fretes, gerenciar usuários, deletar recursos
- **Não pode**: Criar fretes como cliente, aceitar fretes como motorista

## 📊 Fluxo de Teste Recomendado

### Sequência de Execução:
1. **Autenticação** → Fazer login com todos os tipos de usuário
2. **Consultas GET** → Testar visualização de dados
3. **Criação POST** → Criar recursos (fretes, usuários)
4. **Exclusão DELETE** → Remover recursos criados
5. **Validação** → Verificar tratamento de erros

### Dependências:
- Testes de POST dependem dos tokens de autenticação
- Testes de DELETE dependem dos IDs criados nos testes POST
- Execute sempre na ordem das pastas

## ⚙️ Configuração

### Variáveis de Ambiente:
- `baseUrl`: URL base da API (http://localhost:3000/api)
- `clienteToken`: Token de autenticação do cliente
- `motoristaToken`: Token de autenticação do motorista
- `adminToken`: Token de autenticação do administrador
- `freteId`: ID do frete criado (preenchido automaticamente)
- `clienteId`: ID do cliente (preenchido automaticamente)
- `motoristaId`: ID do motorista (preenchido automaticamente)

### Pré-requisitos:
1. Servidor da API rodando na porta 3000
2. Banco de dados configurado
3. Usuários de teste existentes:
   - Cliente: `cliente@broday.com` / `cliente123`
   - Motorista: `motorista@broday.com` / `motorista123`
   - Admin: `admin@broday.com` / `admin123`

## 🎯 Objetivos dos Testes

### Funcionalidade:
- ✅ Verificar se operações CRUD funcionam corretamente
- ✅ Validar permissões de cada tipo de usuário
- ✅ Testar criação, consulta e exclusão de recursos
- ✅ Verificar tratamento de erros

### Segurança:
- ✅ Validar autenticação obrigatória
- ✅ Verificar autorização por tipo de usuário
- ✅ Testar acesso negado para operações não permitidas

### Qualidade:
- ✅ Verificar estrutura de resposta consistente
- ✅ Validar códigos de status HTTP corretos
- ✅ Testar mensagens de erro apropriadas

## 🔧 Troubleshooting

### Problemas Comuns:

#### 1. "Token inválido"
- **Causa**: Login não foi executado ou falhou
- **Solução**: Execute primeiro a pasta "1. Autenticação"

#### 2. "Frete não encontrado"
- **Causa**: Teste de DELETE executado antes do POST
- **Solução**: Execute as pastas na ordem correta

#### 3. "Acesso negado"
- **Causa**: Usuário sem permissão para a operação
- **Solução**: Verifique se está usando o token correto

#### 4. "Dados inválidos"
- **Causa**: Validação de entrada funcionando
- **Solução**: Este é o comportamento esperado para testes de validação

## 📈 Interpretando Resultados

### Status Codes Esperados:
- `200`: Operação bem-sucedida
- `201`: Recurso criado com sucesso
- `400`: Dados inválidos
- `401`: Não autorizado
- `403`: Acesso negado
- `404`: Recurso não encontrado

### Testes que Devem Passar:
- Todos os testes de autenticação
- Consultas GET com tokens válidos
- Criação POST com dados válidos
- Exclusão DELETE de recursos existentes
- Validação de erros com dados inválidos

### Testes que Podem Falhar:
- Operações sem autenticação (esperado)
- Operações com dados inválidos (esperado)
- Operações em recursos inexistentes (esperado)

## 🚀 Próximos Passos

1. **Execute os testes** seguindo a ordem das pastas
2. **Analise os resultados** e identifique falhas
3. **Corrija problemas** encontrados na API
4. **Execute novamente** para validar correções
5. **Integre** os testes no pipeline de CI/CD

---

**Testes CRUD prontos para uso! 🎉**
