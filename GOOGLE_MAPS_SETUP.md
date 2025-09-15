# Configuração do Google Maps API

## Como obter uma chave da API do Google Maps

1. **Acesse o Google Cloud Console**
   - Vá para: https://console.cloud.google.com/

2. **Crie um novo projeto ou selecione um existente**

3. **Habilite a API do Google Maps JavaScript**
   - No menu lateral, vá em "APIs e Serviços" > "Biblioteca"
   - Procure por "Maps JavaScript API"
   - Clique em "Ativar"

4. **Crie credenciais**
   - Vá em "APIs e Serviços" > "Credenciais"
   - Clique em "Criar Credenciais" > "Chave de API"
   - Copie a chave gerada

5. **Configure restrições (recomendado)**
   - Clique na chave criada para editá-la
   - Em "Restrições de aplicativo", selecione "Sites da Web"
   - Adicione os domínios onde a aplicação será usada:
     - `http://localhost:3000` (desenvolvimento)
     - `https://seudominio.com` (produção)

## Como configurar no projeto

1. **Abra o arquivo de configuração**
   ```bash
   config/google-maps.js
   ```

2. **Substitua a chave da API**
   ```javascript
   const GOOGLE_MAPS_CONFIG = {
       // Substitua pela sua chave da API do Google Maps
       API_KEY: 'SUA_CHAVE_AQUI',
       // ... resto da configuração
   };
   ```

3. **Teste a configuração**
   - Abra a página de rastreamento
   - Verifique se o mapa carrega sem erros
   - Verifique o console do navegador para erros

## Solução de Problemas

### Erro: "InvalidKeyMapError"
- Verifique se a chave está correta
- Confirme se a API está habilitada
- Verifique as restrições de domínio

### Erro: "RefererNotAllowedMapError"
- Adicione o domínio atual às restrições da chave
- Para desenvolvimento local, adicione `http://localhost:3000`

### Mapa não carrega
- Verifique se a chave está configurada
- Confirme se o arquivo `config/google-maps.js` está sendo carregado
- Verifique a conexão com a internet

## Custos

- **Uso gratuito**: 28.000 carregamentos de mapa por mês
- **Cobrança**: $7 por 1.000 carregamentos adicionais
- **Monitoramento**: Use o Google Cloud Console para acompanhar o uso

## Segurança

- **Nunca** commite a chave da API no repositório
- Use variáveis de ambiente em produção
- Configure restrições de domínio
- Monitore o uso regularmente

## Exemplo de configuração com variáveis de ambiente

```javascript
// config/google-maps.js
const GOOGLE_MAPS_CONFIG = {
    API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    // ... resto da configuração
};
```

```bash
# .env
GOOGLE_MAPS_API_KEY=sua_chave_aqui
```
