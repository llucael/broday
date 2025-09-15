const express = require('express');
const router = express.Router();
const { registrarLocalizacao, obterHistoricoLocalizacoes, obterLocalizacaoAtual, obterLocalizacoesTempoReal, obterEstatisticasRastreamento } = require('../controllers/rastreamentoController');
const { authenticateToken } = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Registrar localização do motorista
router.post('/localizacao', registrarLocalizacao);

// Obter histórico de localizações de um frete
router.get('/frete/:frete_id/historico', obterHistoricoLocalizacoes);

// Obter localização atual de um frete
router.get('/frete/:frete_id/atual', obterLocalizacaoAtual);

// Obter localizações em tempo real (últimas 24 horas)
router.get('/frete/:frete_id/tempo-real', obterLocalizacoesTempoReal);

// Obter estatísticas de rastreamento
router.get('/frete/:frete_id/estatisticas', obterEstatisticasRastreamento);

module.exports = router;
