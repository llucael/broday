# 🚀 Guia de Instalação - Broday Transportes

Este guia irá te ajudar a configurar e executar o sistema completo da Broday Transportes, incluindo frontend, backend e banco de dados PostgreSQL.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior) - [Download](https://nodejs.org/)
- **PostgreSQL** (versão 12 ou superior) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## 🗄️ Configuração do Banco de Dados

### 1. Instalar PostgreSQL

**Windows:**
1. Baixe o instalador do PostgreSQL
2. Execute o instalador e siga as instruções
3. Anote a senha do usuário `postgres` que você definiu

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

### 2. Criar Banco de Dados

Abra o terminal/prompt e execute:

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE broday_transportes;

# Sair do psql
\q
```

## 🔧 Configuração do Backend

### 1. Instalar Dependências

```bash
# Navegar para a pasta do projeto
cd "caminho/para/seu/projeto"

# Instalar dependências do Node.js
npm install
```

### 2. Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp env.example .env
```

2. Edite o arquivo `.env` com suas configurações:

```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=broday_transportes
DB_USER=postgres
DB_PASSWORD=sua_senha_do_postgres

# Configurações de Autenticação JWT
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui_123456789
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# URL do Frontend (para CORS)
FRONTEND_URL=http://localhost:5500
```

### 3. Executar Migrações e Seed

```bash
# Criar tabelas no banco
npm run migrate

# Popular com dados de exemplo
npm run seed
```

### 4. Iniciar o Backend

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

O backend estará rodando em: `http://localhost:3000`

## 🌐 Configuração do Frontend

### 1. Servir os Arquivos

Você pode usar qualquer servidor HTTP local. Algumas opções:

**Opção 1: Live Server (VS Code)**
1. Instale a extensão "Live Server" no VS Code
2. Clique com botão direito no arquivo `index.html`
3. Selecione "Open with Live Server"

**Opção 2: Python (se instalado)**
```bash
# Python 3
python -m http.server 5500

# Python 2
python -m SimpleHTTPServer 5500
```

**Opção 3: Node.js (http-server)**
```bash
npm install -g http-server
http-server -p 5500
```

O frontend estará rodando em: `http://localhost:5501`

## ✅ Verificação da Instalação

### 1. Testar Backend

Abra o navegador e acesse:
- `http://localhost:3000` - Página inicial da API
- `http://localhost:3000/api/health` - Health check

### 2. Testar Frontend

Acesse: `http://localhost:5501`

### 3. Testar Login

Use as credenciais criadas pelo seed:

**Administrador:**
- Email: `admin@broday.com`
- Senha: `admin123`

**Motorista:**
- Email: `motorista@broday.com`
- Senha: `motorista123`

**Cliente:**
- Email: `cliente@broday.com`
- Senha: `cliente123`

## 🚨 Solução de Problemas

### Erro de Conexão com PostgreSQL

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Soluções:**
1. Verifique se o PostgreSQL está rodando
2. Confirme a senha no arquivo `.env`
3. Verifique se a porta 5432 está livre

### Erro de CORS

```
Access to fetch at 'http://localhost:3000' from origin 'http://localhost:5500' has been blocked by CORS policy
```

**Solução:**
1. Verifique se `FRONTEND_URL` no `.env` está correto
2. Reinicie o backend após alterar o `.env`

### Erro de Token JWT

```
JsonWebTokenError: invalid token
```

**Solução:**
1. Verifique se `JWT_SECRET` no `.env` está definido
2. Limpe o localStorage do navegador
3. Faça login novamente

## 📁 Estrutura do Projeto

```
broday-transportes/
├── 📁 config/           # Configurações do banco
├── 📁 controllers/      # Controladores da API
├── 📁 middleware/       # Middlewares (auth, validation)
├── 📁 models/          # Modelos do banco de dados
├── 📁 routes/          # Rotas da API
├── 📁 scripts/         # Scripts de migração e seed
├── 📁 js/              # JavaScript do frontend
├── 📄 server.js        # Servidor principal
├── 📄 package.json     # Dependências do Node.js
├── 📄 env.example      # Exemplo de variáveis de ambiente
├── 📄 index.html       # Página inicial
├── 📄 login.html       # Página de login/registro
├── 📄 frete.html       # Página de solicitação de frete
├── 📄 styles.css       # Estilos CSS
├── 📄 script.js        # JavaScript principal
└── 📄 auth.js          # JavaScript de autenticação
```

## 🔄 Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Executar em modo produção
npm start

# Criar/migrar banco de dados
npm run migrate

# Popular banco com dados de exemplo
npm run seed

# Executar testes (quando implementados)
npm test
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique se todos os pré-requisitos estão instalados
2. Confirme se as variáveis de ambiente estão corretas
3. Verifique os logs do console para erros específicos
4. Certifique-se de que as portas 3000 e 5500 estão livres

## 🎯 Próximos Passos

Após a instalação bem-sucedida, você pode:

1. **Personalizar** as configurações no arquivo `.env`
2. **Adicionar** novos tipos de usuário ou campos
3. **Implementar** funcionalidades adicionais
4. **Deploy** em servidor de produção
5. **Configurar** SSL/HTTPS para produção

---

**Desenvolvido para Broday Transportes** © 2024
