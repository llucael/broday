const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getDashboard,
  getClientes,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  bloquearCliente,
  getFretesPorCliente,
  getMotoristas,
  cadastrarMotorista,
  bloquearMotorista,
  getEntregasMotorista,
  getTodosFretes,
  reatribuirMotorista,
  ajustarCondicoes,
  getMonitoramentoTempoReal,
  getRelatoriosUsuarios
} = require('../controllers/adminController');

// Aplicar autenticação e verificação de tipo de usuário em todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard do administrador
router.get('/dashboard', getDashboard);

// Gerenciamento de usuários
router.get('/users', getClientes); // Rota para listar todos os usuários
router.get('/users/:id', getUserById); // Rota para buscar usuário por ID
router.post('/users', createUser); // Rota para criar usuários
router.put('/users/:id', updateUser); // Rota para atualizar usuário
router.delete('/users/:id', deleteUser); // Rota para excluir usuário

// Gerenciamento de clientes
router.get('/clientes', getClientes);
router.put('/clientes/:id/bloquear', bloquearCliente);
router.get('/clientes/:clienteId/fretes', getFretesPorCliente);

// Gerenciamento de motoristas
router.get('/motoristas', getMotoristas);
router.post('/motoristas/cadastrar', cadastrarMotorista);
router.put('/motoristas/:id/bloquear', bloquearMotorista);
router.get('/motoristas/:motoristaId/entregas', getEntregasMotorista);

// Gerenciamento de fretes
router.get('/fretes', getTodosFretes);
router.put('/fretes/:id/reatribuir', reatribuirMotorista);
router.put('/fretes/:id/ajustar', ajustarCondicoes);

// Monitoramento em tempo real
router.get('/monitoramento', getMonitoramentoTempoReal);

// Relatórios
router.get('/relatorios/usuarios', getRelatoriosUsuarios);

module.exports = router;
