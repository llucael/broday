const express = require('express');
const router = express.Router();
const { authenticateToken, requireMotorista } = require('../middleware/auth');
const {
  getDashboard,
  getFretesDisponiveis,
  aceitarFrete,
  atualizarStatusFrete,
  getMeusFretes,
  atualizarPerfil,
  getRelatoriosPessoais
} = require('../controllers/motoristaController');

// Aplicar autenticação e verificação de tipo de usuário em todas as rotas
router.use(authenticateToken);
router.use(requireMotorista);

// Dashboard do motorista
router.get('/dashboard', getDashboard);

// Fretes disponíveis
router.get('/fretes/disponiveis', getFretesDisponiveis);

// Aceitar frete
router.post('/fretes/:id/aceitar', aceitarFrete);

// Atualizar status do frete
router.put('/fretes/:id/status', atualizarStatusFrete);

// Meus fretes
router.get('/fretes/meus', getMeusFretes);

// Atualizar perfil
router.put('/perfil', atualizarPerfil);

// Relatórios pessoais
router.get('/relatorios', getRelatoriosPessoais);

module.exports = router;
