# Configuração de Email - Passo a Passo

## 📧 Email: broday.verificacao@gmail.com

## ⚠️ IMPORTANTE: Você precisa gerar uma senha de app do Gmail

### Passo 1: Ativar autenticação de 2 fatores (se ainda não tiver)
1. Acesse: https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"

### Passo 2: Gerar senha de app
1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione "Mail" 
3. Selecione "Other (Custom name)"
4. Digite: **Broday Transportes**
5. Clique em "Generate"
6. **COPIE A SENHA DE 16 CARACTERES** (exemplo: abcd efgh ijkl mnop)

### Passo 3: Configurar no .env

Substitua no arquivo `.env`:

```env
EMAIL_PASS=abcd efgh ijkl mnop
```

Ou use este comando (substitua pela senha real):

```powershell
(Get-Content .env) -replace 'EMAIL_PASS=sua_senha_de_app', 'EMAIL_PASS=SUA_SENHA_AQUI' | Set-Content .env
```

## 🧪 Testar o Servidor

Após configurar, rode:

```bash
node server.js
```

Você deve ver:
```
✅ Servidor de email pronto para enviar mensagens
```

Se aparecer erro, verifique:
1. Se a senha de app está correta (16 caracteres, com espaços)
2. Se o email broday.verificacao@gmail.com está correto
3. Se a autenticação de 2 fatores está ativada

## 🚀 Próximos Passos

Depois de configurar, você pode testar o envio de email usando as rotas:

```bash
# Solicitar código
POST http://localhost:3000/api/auth/verify-email/request
Body: { "email": "destino@email.com" }

# Verificar código
POST http://localhost:3000/api/auth/verify-email/verify
Body: { "email": "destino@email.com", "code": "123456" }
```

