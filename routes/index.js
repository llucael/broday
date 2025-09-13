const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./auth');
const freteRoutes = require('./frete');
const motoristaRoutes = require('./motorista');
const clienteRoutes = require('./cliente');
const adminRoutes = require('./admin');

// Rota raiz da API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo à API da Broday Transportes!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      fretes: '/api/fretes'
    }
  });
});

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API da Broday Transportes está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Usar rotas
router.use('/auth', authRoutes);
router.use('/fretes', freteRoutes);
router.use('/motorista', motoristaRoutes);
router.use('/cliente', clienteRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
