# Sistema de Rastreamento GPS - Broday Transportes

## Visão Geral

O sistema de rastreamento GPS permite que motoristas sejam rastreados em tempo real durante a execução de fretes, fornecendo localização, velocidade, direção e histórico de movimentações.

## Funcionalidades Implementadas

### 1. API de Rastreamento
- **Registrar Localização**: Captura e armazena localização do motorista
- **Histórico de Localizações**: Recupera histórico de movimentações
- **Localização Atual**: Obtém última posição registrada
- **Tempo Real**: Localizações das últimas 24 horas
- **Estatísticas**: Dados de rastreamento e performance

### 2. Dashboard do Motorista
- **Botão "Iniciar Viagem"**: Solicita permissão GPS e inicia rastreamento
- **Rastreamento Automático**: Captura localização a cada 30 segundos
- **Redirecionamento**: Leva automaticamente para página de rastreamento

### 3. Página de Rastreamento
- **Google Maps**: Visualização interativa com marcador e rota
- **Controles de Mapa**: Centralizar e alternar tipo de mapa
- **Informações em Tempo Real**: Coordenadas, velocidade, timestamp
- **Histórico de Movimentações**: Lista das últimas 10 localizações
- **Rastreamento Manual**: Botão para atualizar localização
- **Rastreamento Automático**: Iniciar/parar captura periódica

## Como Usar

### Para Motoristas

1. **Iniciar Viagem**:
   - No dashboard, clique em "Iniciar Viagem" em um frete aceito
   - Permita o acesso à localização quando solicitado
   - O sistema iniciará rastreamento automático
   - Você será redirecionado para a página de rastreamento

2. **Página de Rastreamento**:
   - Visualize sua localização no mapa
   - Acompanhe velocidade e última atualização
   - Use "Atualizar Localização" para captura manual
   - Inicie/pare rastreamento automático conforme necessário

### Para Clientes e Administradores

1. **Visualizar Rastreamento**:
   - Acesse a página de rastreamento com o ID do frete
   - Visualize localização atual e rota percorrida
   - Acompanhe histórico de movimentações
   - Monitore status do rastreamento

## Configuração

### 1. Google Maps API
```html
<!-- Substitua YOUR_GOOGLE_MAPS_API_KEY pela sua chave -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry"></script>
```

### 2. Banco de Dados
```bash
# Criar tabela de localizações
node scripts/create-localizacoes-table.js
```

### 3. Variáveis de Ambiente
```env
# Adicione ao .env se necessário
GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

## Estrutura do Banco de Dados

### Tabela: localizacoes
```sql
CREATE TABLE localizacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  frete_id INTEGER NOT NULL,
  motorista_id INTEGER NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  endereco TEXT,
  cidade VARCHAR(255),
  estado VARCHAR(255),
  velocidade DECIMAL(5,2),
  direcao DECIMAL(5,2),
  precisao DECIMAL(8,2),
  timestamp DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

## Endpoints da API

### POST /api/rastreamento/localizacao
Registra nova localização do motorista.

**Body:**
```json
{
  "frete_id": 1,
  "latitude": -23.5505,
  "longitude": -46.6333,
  "velocidade": 50.5,
  "direcao": 180.0,
  "precisao": 10.0
}
```

### GET /api/rastreamento/frete/:frete_id/historico
Obtém histórico de localizações.

**Query Parameters:**
- `page`: Página (padrão: 1)
- `limit`: Limite por página (padrão: 50)

### GET /api/rastreamento/frete/:frete_id/atual
Obtém localização atual do frete.

### GET /api/rastreamento/frete/:frete_id/tempo-real
Obtém localizações das últimas 24 horas.

### GET /api/rastreamento/frete/:frete_id/estatisticas
Obtém estatísticas de rastreamento.

## Segurança e Privacidade

- **Permissão GPS**: Solicita permissão explícita do usuário
- **Autenticação**: Todas as rotas requerem token JWT
- **Validação**: Verifica se o frete pertence ao motorista
- **Precisão**: Configurada para alta precisão (enableHighAccuracy: true)
- **Timeout**: 10 segundos para evitar travamentos

## Performance

- **Intervalo de Captura**: 30 segundos (configurável)
- **Cache de Localização**: 30 segundos (maximumAge)
- **Histórico Limitado**: Últimas 24 horas para tempo real
- **Paginação**: Histórico completo com paginação

## Troubleshooting

### Problemas Comuns

1. **"Geolocalização não suportada"**
   - Verifique se o navegador suporta GPS
   - Teste em HTTPS (requerido para GPS)

2. **"Permissão de localização negada"**
   - Solicite permissão manualmente nas configurações do navegador
   - Recarregue a página e tente novamente

3. **"Erro ao registrar localização"**
   - Verifique se o servidor está rodando
   - Confirme se o frete está em status "em_transito"

4. **Mapa não carrega**
   - Verifique se a chave da API do Google Maps está correta
   - Confirme se a biblioteca geometry está incluída

### Logs de Debug

O sistema inclui logs detalhados no console do navegador:
- Permissões de localização
- Registros de localização
- Erros de API
- Status de rastreamento

## Próximas Melhorias

- [ ] Geocodificação reversa para endereços
- [ ] Notificações de chegada
- [ ] Estimativa de tempo de entrega
- [ ] Relatórios de rota
- [ ] Integração com APIs de trânsito
- [ ] Modo offline com sincronização
