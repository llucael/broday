# Configuração do Arquivo .env

## ⚠️ IMPORTANTE

Crie um arquivo `.env` na raiz do projeto com as seguintes configurações:

```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações do Banco de Dados (SQLite por padrão)
# Para PostgreSQL, descomente e configure:
# DB_HOST=localhost
# DB_PORT=5500
# DB_NAME=broday_transportes
# DB_USER=postgres
# DB_PASSWORD=sua_senha

# Configurações de Autenticação JWT
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui_altere_isso
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Configurações de Email (OBRIGATÓRIO para verificação de email)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_gmail

# Configurações de Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Configurações de Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# URL do Frontend (para CORS)
FRONTEND_URL=http://localhost:5500
```

## 🔐 Como Configurar Email Gmail

### Passo 1: Gerar Senha de App

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione "Mail" e "Other (Custom name)"
3. Digite "Broday Transportes" e clique em "Generate"
4. Copie a senha gerada (16 caracteres)

### Passo 2: Configurar no .env

Substitua os valores de exemplo:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email_real@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # A senha de 16 caracteres gerada
```

### Passo 3: Testar

O servidor irá verificar automaticamente a conexão ao iniciar.

## 📝 Variáveis Importantes

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `EMAIL_HOST` | Servidor SMTP | Sim |
| `EMAIL_PORT` | Porta SMTP (587 para Gmail) | Sim |
| `EMAIL_USER` | Email do remetente | Sim |
| `EMAIL_PASS` | Senha de app do Gmail | Sim |
| `JWT_SECRET` | Chave secreta para JWT | Sim |
| `PORT` | Porta do servidor backend | Sim |

## ⚡ Configuração Rápida

```bash
# 1. Copie o arquivo de exemplo
cp env.example .env

# 2. Edite o arquivo .env
# Substitua EMAIL_USER e EMAIL_PASS pelas suas credenciais

# 3. Inicie o servidor
npm start
```

## 🚨 Atualizações Implementadas

O sistema agora suporta tanto `EMAIL_*` quanto `SMTP_*` como prefixos para maior compatibilidade. Use qualquer um dos dois:

### Opção 1: EMAIL_*
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=email@gmail.com
EMAIL_PASS=senha_app
```

### Opção 2: SMTP_*
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASS=senha_app
```

## 📌 Notas

- O arquivo `.env` NÃO deve ser commitado no Git
- Use `env.example` como base para outros desenvolvedores
- Sempre use senhas de app para Gmail, nunca a senha principal
- O JWT_SECRET deve ser uma string longa e aleatória em produção

