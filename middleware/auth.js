const jwt = require('jsonwebtoken');
const { User, Motorista, Cliente, Admin } = require('../models');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    // Adicionar dados do usuário à requisição
    req.user = user;
    req.userId = user.id;
    req.userType = user.user_type;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar tipo de usuário específico
const requireUserType = (allowedTypes) => {
  return (req, res, next) => {
    if (!allowedTypes.includes(req.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Tipo de usuário não autorizado'
      });
    }
    next();
  };
};

// Middleware para verificar se é admin
const requireAdmin = requireUserType(['admin']);

// Middleware para verificar se é motorista
const requireMotorista = requireUserType(['motorista']);

// Middleware para verificar se é cliente
const requireCliente = requireUserType(['cliente']);

// Middleware para verificar se é motorista ou admin
const requireMotoristaOrAdmin = requireUserType(['motorista', 'admin']);

// Middleware para verificar se é cliente ou admin
const requireClienteOrAdmin = requireUserType(['cliente', 'admin']);

// Função para gerar tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Função para verificar refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Token inválido');
    }
    return decoded;
  } catch (error) {
    throw new Error('Refresh token inválido');
  }
};

module.exports = {
  authenticateToken,
  requireUserType,
  requireAdmin,
  requireMotorista,
  requireCliente,
  requireMotoristaOrAdmin,
  requireClienteOrAdmin,
  generateTokens,
  verifyRefreshToken
};
