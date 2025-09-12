const express = require('express');
const router = express.Router();
const { authenticateToken, requireCliente } = require('../middleware/auth');
const {
  getDashboard,
  solicitarFrete,
  acompanharFrete,
  getMeusFretes,
  cancelarFrete,
  alterarFrete,
  reagendarEntrega,
  atualizarPerfil,
  getHistoricoCompleto
} = require('../controllers/clienteController');

// Aplicar autenticação e verificação de tipo de usuário em todas as rotas
router.use(authenticateToken);
router.use(requireCliente);

// Dashboard do cliente
router.get('/dashboard', getDashboard);

// Solicitar frete
router.post('/fretes/solicitar', solicitarFrete);

// Acompanhar frete
router.get('/fretes/:id/acompanhar', acompanharFrete);

// Meus fretes
router.get('/fretes/meus', getMeusFretes);

// Cancelar frete
router.put('/fretes/:id/cancelar', cancelarFrete);

// Alterar frete
router.put('/fretes/:id/alterar', alterarFrete);

// Reagendar entrega
router.put('/fretes/:id/reagendar', reagendarEntrega);

// Atualizar perfil
router.put('/perfil', atualizarPerfil);

// Histórico completo
router.get('/historico', getHistoricoCompleto);

module.exports = router;
