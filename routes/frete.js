const express = require('express');
const router = express.Router();
const freteController = require('../controllers/freteController');
const { authenticateToken, requireCliente, requireMotorista, requireAdmin, requireClienteOrAdmin } = require('../middleware/auth');
const { validateFrete, validateId, validatePagination } = require('../middleware/validation');

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Rotas para clientes
router.post('/', requireCliente, validateFrete, freteController.createFrete);
router.get('/cliente/meus-fretes', requireCliente, validatePagination, freteController.getFretesByCliente);

// Rotas para motoristas
router.get('/disponiveis', requireMotorista, freteController.getFretesDisponiveis);
router.get('/motorista/meus-fretes', requireMotorista, freteController.getFretesByMotorista);

// Rotas genéricas (devem vir por último)
router.get('/:id', validateId, freteController.getFreteById);
router.post('/:id/aceitar', requireMotorista, validateId, freteController.acceptFrete);

// Rotas para atualização de status (motorista ou admin)
router.put('/:id/status', validateId, freteController.updateFreteStatus);

// Rotas para administradores
router.get('/', requireAdmin, validatePagination, freteController.getAllFretes);
router.put('/:id', requireAdmin, validateId, freteController.updateFrete);

module.exports = router;
