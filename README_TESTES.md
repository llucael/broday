# 🧪 Testes da API Broday Transportes

Esta pasta contém uma suíte completa de testes para a API da Broday Transportes, cobrindo todos os aspectos funcionais e não funcionais.

## 📁 Arquivos

- `Broday_Transportes_Tests.postman_collection.json` - Coleção principal com todos os testes
- `Broday_Transportes_Environment.postman_environment.json` - Ambiente de configuração
- `executar_testes.sh` - Script para executar todos os testes
- `testes_*.json` - Arquivos individuais de cada categoria de teste

## 🚀 Como Executar

### Opção 1: Postman GUI
1. Abra o Postman
2. Importe `Broday_Transportes_Tests.postman_collection.json`
3. Importe `Broday_Transportes_Environment.postman_environment.json`
4. Execute os testes desejados

### Opção 2: Newman CLI
```bash
# Instalar Newman
npm install -g newman

# Executar todos os testes
./executar_testes.sh

# Executar categoria específica
newman run Broday_Transportes_Tests.postman_collection.json -e Broday_Transportes_Environment.postman_environment.json --folder "1. Testes de Unidade"
```

## 📋 Categorias de Teste

### 1. Testes de Unidade
- Validação de componentes individuais
- Estrutura de resposta da API
- Headers de segurança
- Rate limiting

### 2. Testes de Integração
- Fluxo completo de autenticação
- Integração frontend-backend
- Consistência de dados no banco
- Relacionamentos entre entidades

### 3. Testes de Sistema
- Fluxo completo cliente (solicitação de frete)
- Fluxo completo motorista (aceitar frete)
- Fluxo administrativo (gestão completa)
- Casos de uso end-to-end

### 4. Testes de Regressão
- Validação de funcionalidades críticas
- Endpoints essenciais
- Performance básica
- Segurança fundamental

### 5. Testes de Usabilidade
- Mensagens de erro claras
- Estrutura intuitiva da API
- Experiência do usuário
- Tratamento de erros

### 6. Testes de Desempenho
- Testes de carga básica
- Testes de estresse
- Volume de dados
- Concorrência
- Limites de recursos

### 7. Testes de Segurança
- Autenticação e autorização
- Validação de entrada (SQL injection, XSS)
- Headers de segurança
- Rate limiting e DDoS
- Vazamento de dados sensíveis

## ⚙️ Configuração

### Variáveis de Ambiente
- `baseUrl`: URL base da API (padrão: http://localhost:3000/api)
- `clienteToken`: Token de autenticação do cliente
- `motoristaToken`: Token de autenticação do motorista
- `adminToken`: Token de autenticação do administrador
- `freteId`: ID do frete para testes
- `clienteId`: ID do cliente para testes
- `motoristaId`: ID do motorista para testes

### Pré-requisitos
1. Servidor da API rodando na porta 3000
2. Banco de dados configurado
3. Usuários de teste criados:
   - Cliente: cliente.teste@broday.com / cliente123
   - Motorista: motorista.teste@broday.com / motorista123
   - Admin: admin.teste@broday.com / admin123

## 📊 Interpretação dos Resultados

### Status Codes Esperados
- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Dados inválidos
- `401`: Não autorizado
- `403`: Acesso negado
- `404`: Não encontrado
- `429`: Rate limit excedido
- `500`: Erro interno do servidor

### Métricas de Performance
- Tempo de resposta < 1s (ideal)
- Tempo de resposta < 2s (aceitável)
- Tempo de resposta < 5s (máximo)

### Taxa de Sucesso
- Testes de unidade: 100%
- Testes de integração: 100%
- Testes de sistema: 100%
- Testes de regressão: 100%
- Testes de usabilidade: 100%
- Testes de desempenho: 95%+
- Testes de segurança: 100%

## 🔧 Troubleshooting

### Erro: "Servidor não está rodando"
- Verifique se o servidor está iniciado: `npm start`
- Verifique se a porta 3000 está disponível

### Erro: "Token inválido"
- Execute primeiro os testes de autenticação
- Verifique se os usuários de teste existem no banco

### Erro: "Rate limit excedido"
- Aguarde alguns minutos antes de executar novamente
- Ajuste o rate limiting no servidor se necessário

### Erro: "Timeout"
- Verifique a performance do servidor
- Ajuste os timeouts nos testes se necessário

## 📈 Relatórios

Para gerar relatórios HTML:
```bash
newman run Broday_Transportes_Tests.postman_collection.json -e Broday_Transportes_Environment.postman_environment.json --reporters html --reporter-html-export relatorio.html
```

## 🤝 Contribuição

Para adicionar novos testes:
1. Crie um novo arquivo `testes_nova_categoria.json`
2. Siga o padrão dos arquivos existentes
3. Adicione a categoria na coleção principal
4. Atualize este README

---

**Desenvolvido para Broday Transportes** © 2024
