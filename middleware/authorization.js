const { User } = require('../models');

// Função para verificar permissões específicas
const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      // Verificar se o usuário tem as permissões necessárias
      const hasPermission = requiredPermissions.some(permission => {
        return user.permissions && user.permissions.includes(permission);
      });

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Permissões insuficientes.'
        });
      }

      next();
    } catch (error) {
      console.error('Erro na verificação de permissões:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

// Função para verificar tipo de usuário específico
const requireUserType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!allowedTypes.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Tipo de usuário não autorizado.'
      });
    }

    next();
  };
};

// Middlewares específicos para cada tipo de usuário
const requireAdmin = requireUserType(['admin']);
const requireMotorista = requireUserType(['motorista']);
const requireCliente = requireUserType(['cliente']);

// Middlewares para combinações de tipos
const requireMotoristaOrAdmin = requireUserType(['motorista', 'admin']);
const requireClienteOrAdmin = requireUserType(['cliente', 'admin']);

// Função para verificar se o usuário pode acessar recursos de outros usuários
const checkResourceAccess = (resourceType) => {
  return (req, res, next) => {
    const user = req.user;
    const resourceId = req.params.id || req.params.userId;
    
    // Admins podem acessar qualquer recurso
    if (user.user_type === 'admin') {
      return next();
    }
    
    // Usuários só podem acessar seus próprios recursos
    if (resourceId && parseInt(resourceId) !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você só pode acessar seus próprios recursos.'
      });
    }
    
    next();
  };
};

// Função para verificar se o usuário pode gerenciar fretes
const checkFreteAccess = (action) => {
  return (req, res, next) => {
    const user = req.user;
    const freteId = req.params.id;
    
    // Admins podem fazer qualquer ação
    if (user.user_type === 'admin') {
      return next();
    }
    
    // Motoristas podem aceitar fretes disponíveis
    if (action === 'accept' && user.user_type === 'motorista') {
      return next();
    }
    
    // Clientes podem gerenciar seus próprios fretes
    if (action === 'manage' && user.user_type === 'cliente') {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Acesso negado para esta ação.'
    });
  };
};

module.exports = {
  checkPermission,
  requireUserType,
  requireAdmin,
  requireMotorista,
  requireCliente,
  requireMotoristaOrAdmin,
  requireClienteOrAdmin,
  checkResourceAccess,
  checkFreteAccess
};
