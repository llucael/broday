const express = require('express');
const router = express.Router();
const freteController = require('../controllers/freteController');
const { authenticateToken, requireCliente, requireMotorista, requireAdmin, requireClienteOrAdmin } = require('../middleware/auth');
const { validateFrete, validateId, validatePagination } = require('../middleware/validation');

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Rotas para clientes
router.post('/', requireCliente, validateFrete, freteController.createFrete);
router.get('/meus-fretes', requireCliente, validatePagination, freteController.getFretesByCliente);
router.get('/:id', validateId, freteController.getFreteById);

// Rotas para motoristas
router.get('/disponiveis', requireMotorista, validatePagination, freteController.getFretesDisponiveis);
router.get('/meus-fretes', requireMotorista, validatePagination, freteController.getFretesByMotorista);
router.post('/:id/aceitar', requireMotorista, validateId, freteController.acceptFrete);

// Rotas para atualização de status (motorista ou admin)
router.put('/:id/status', validateId, freteController.updateFreteStatus);

// Rotas para administradores
router.get('/', requireAdmin, validatePagination, freteController.getAllFretes);

module.exports = router;
