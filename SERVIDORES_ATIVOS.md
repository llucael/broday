# 🚀 Servidores Ativos - Broday Transportes

## ✅ Status dos Servidores

### 1. Backend API Server (Node 20820) ✅
```
Porta: 3000
Status: RODANDO
URL: http://localhost:3000
API: http://localhost:3000/api
```

**Funcionalidades:**
- ✅ API REST completa
- ✅ Sistema de verificação de email funcionando
- ✅ Conexão com SQLite estabelecida
- ✅ Modelos sincronizados
- ✅ Email configurado: broday.verificacao@gmail.com

### 2. Frontend Web Server (Node 12936) ✅
```
Porta: 5501
Status: RODANDO
URL: http://localhost:5501
```

**Páginas Disponíveis:**
- 🌐 Início: http://localhost:5501/
- 🔐 Login: http://localhost:5501/login
- 📦 Frete: http://localhost:5501/frete
- ✅ Login Success: http://localhost:5501/login-success

## 📋 Endpoints API Disponíveis

### Autenticação
```
POST /api/auth/register          - Registrar usuário
POST /api/auth/login             - Login
POST /api/auth/refresh-token     - Renovar token
GET  /api/auth/profile           - Obter perfil
PUT  /api/auth/profile           - Atualizar perfil
POST /api/auth/verify-email/request  - Solicitar código de verificação
POST /api/auth/verify-email/verify   - Verificar código
```

### Fretes
```
GET  /api/fretes/cliente/meus-fretes     - Listar fretes do cliente
GET  /api/fretes/motorista/meus-fretes   - Listar fretes do motorista
GET  /api/fretes/disponiveis             - Fretes disponíveis
GET  /api/fretes/:id                     - Buscar frete por ID
POST /api/fretes                         - Criar frete
PUT  /api/fretes/:id/status              - Atualizar status
POST /api/fretes/:id/aceitar             - Aceitar frete (motorista)
```

### Motoristas
```
GET  /api/motorista/dashboard            - Dashboard motorista
GET  /api/motorista/perfil               - Perfil motorista
PUT  /api/motorista/perfil               - Atualizar perfil
```

### Clientes
```
GET  /api/cliente/dashboard              - Dashboard cliente
GET  /api/cliente/perfil                 - Perfil cliente
PUT  /api/cliente/perfil                 - Atualizar perfil
```

### Admin
```
GET  /api/admin/dashboard                - Dashboard admin
GET  /api/admin/fretes                   - Listar todos os fretes
PUT  /api/admin/fretes/:id               - Atualizar frete
GET  /api/admin/usuarios                 - Listar usuários
```

## 🔧 Configuração

### Backend (.env)
```env
PORT=3000
EMAIL_USER=broday.verificacao@gmail.com
EMAIL_PASS=cqci jdpy dejn saiq
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
```

### Frontend
- Porta: 5501
- Servindo arquivos estáticos da raiz
- Configurado para CORS com backend

## 🧪 Como Testar

### 1. Acessar o Frontend
```
http://localhost:5501
```

### 2. Testar API
```bash
curl http://localhost:3000/api/auth/profile
```

### 3. Testar Verificação de Email
```bash
curl -X POST http://localhost:3000/api/auth/verify-email/request \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@email.com"}'
```

## 📊 Funcionalidades Implementadas

### ✅ Sistema de Verificação de Email
- Código aleatório de 6 dígitos
- Envio automático de email
- Validade de 10 minutos
- Template HTML responsivo

### ✅ Gestão de Fretes
- Filtro por status (meus fretes)
- Busca por CEP
- Busca por nome do motorista
- Filtro por intervalo de datas
- Datas obrigatórias

### ✅ Validações
- CPF/CNPJ únicos
- Ordem de transição de status
- Campos obrigatórios

### ✅ Outras
- Reaproveitamento de contatos
- Remoção de dimensões
- Substituição "Rua" por "Logradouro"

## 🛠️ Comandos Úteis

### Parar todos os servidores
```powershell
Stop-Process -Name node -Force
```

### Reiniciar servidores
```powershell
# Parar
Stop-Process -Name node -Force

# Backend
node server.js

# Frontend
node web-server.js
```

### Ver processos Node
```powershell
Get-Process | Where-Object {$_.ProcessName -eq 'node'}
```

## 📝 Logs

Os servidores exibem:
- ✅ Conexão com banco de dados
- ✅ Sincronização de modelos
- ✅ Configuração de email
- ✅ Requisições HTTP
- ⚠️ Erros e avisos

## 🎯 Status Final

```
✅ Backend Server (porta 3000) - RODANDO
✅ Frontend Server (porta 5501) - RODANDO
✅ Email configurado e funcionando
✅ Database conectado
✅ Todos os endpoints funcionais
```

**Sistema 100% operacional!** 🚀

