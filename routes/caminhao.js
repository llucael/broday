const express = require('express');
const router = express.Router();
const caminhaoController = require('../controllers/caminhaoController');
const { authenticateToken, requireAdmin, requireMotorista } = require('../middleware/auth');

// Middleware de validação
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }
  next();
};

const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  if (page && (isNaN(page) || page < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Página inválida'
    });
  }
  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Limite inválido (1-100)'
    });
  }
  next();
};

// Rotas públicas
router.get('/motoristas', caminhaoController.getMotoristas);

// Rotas protegidas
router.get('/', authenticateToken, requireAdmin, validatePagination, caminhaoController.getAllCaminhoes);
router.get('/motorista', authenticateToken, requireMotorista, validatePagination, caminhaoController.getCaminhoesByMotorista);
router.get('/:id', authenticateToken, validateId, caminhaoController.getCaminhaoById);
router.post('/', authenticateToken, requireAdmin, caminhaoController.createCaminhao);
router.put('/:id', authenticateToken, requireAdmin, validateId, caminhaoController.updateCaminhao);
router.delete('/:id', authenticateToken, requireAdmin, validateId, caminhaoController.deleteCaminhao);

module.exports = router;
