const { Frete, User } = require('../models');
const { Op } = require('sequelize');

// Gerar código único para frete
const generateFreteCode = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `FR${timestamp}${random}`;
};

// Criar novo frete
const createFrete = async (req, res) => {
  try {
    const freteData = {
      ...req.body,
      clienteId: req.user.id,
      codigo: generateFreteCode(),
      status: 'solicitado'
    };

    const frete = await Frete.create(freteData);

    // Buscar frete completo com relacionamentos
    const completeFrete = await Frete.findByPk(frete.id, {
      include: [
        { model: User, as: 'cliente' },
        { model: User, as: 'motorista' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Frete solicitado com sucesso',
      data: { frete: completeFrete }
    });
  } catch (error) {
    console.error('Erro ao criar frete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar fretes do cliente
const getFretesByCliente = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { clienteId: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: fretes } = await Frete.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'cliente' },
        { model: User, as: 'motorista' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        fretes,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar fretes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar fretes disponíveis para motoristas
const getFretesDisponiveis = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: fretes } = await Frete.findAndCountAll({
      where: {
        status: 'solicitado',
        motoristaId: null
      },
      include: [
        { model: Cliente, as: 'cliente', include: [{ model: User, as: 'user' }] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        fretes,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar fretes disponíveis:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar fretes do motorista
const getFretesByMotorista = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { motoristaId: req.user.motorista.id };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: fretes } = await Frete.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'cliente' },
        { model: User, as: 'motorista' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        fretes,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar fretes do motorista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar frete por ID
const getFreteById = async (req, res) => {
  try {
    const { id } = req.params;

    const frete = await Frete.findByPk(id, {
      include: [
        { model: User, as: 'cliente' },
        { model: User, as: 'motorista' }
      ]
    });

    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    // Verificar se o usuário tem acesso ao frete
    const userType = req.userType;
    if (userType === 'cliente' && frete.clienteId !== req.user.cliente.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    if (userType === 'motorista' && frete.motoristaId !== req.user.motorista.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    res.json({
      success: true,
      data: { frete }
    });
  } catch (error) {
    console.error('Erro ao buscar frete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Aceitar frete (motorista)
const acceptFrete = async (req, res) => {
  try {
    const { id } = req.params;

    const frete = await Frete.findByPk(id);
    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    if (frete.status !== 'solicitado') {
      return res.status(400).json({
        success: false,
        message: 'Frete não está disponível para aceitação'
      });
    }

    if (frete.motoristaId) {
      return res.status(400).json({
        success: false,
        message: 'Frete já foi aceito por outro motorista'
      });
    }

    // Aceitar frete
    await frete.update({
      motoristaId: req.user.motorista.id,
      status: 'aceito'
    });

    // Buscar frete atualizado
    const updatedFrete = await Frete.findByPk(id, {
      include: [
        { model: User, as: 'cliente' },
        { model: User, as: 'motorista' }
      ]
    });

    res.json({
      success: true,
      message: 'Frete aceito com sucesso',
      data: { frete: updatedFrete }
    });
  } catch (error) {
    console.error('Erro ao aceitar frete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar status do frete
const updateFreteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['solicitado', 'cotado', 'aceito', 'em_transito', 'entregue', 'cancelado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido'
      });
    }

    const frete = await Frete.findByPk(id);
    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    // Verificar permissões
    const userType = req.userType;
    if (userType === 'cliente' && !['cancelado'].includes(status)) {
      return res.status(403).json({
        success: false,
        message: 'Cliente só pode cancelar fretes'
      });
    }

    if (userType === 'motorista' && frete.motoristaId !== req.user.motorista.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Atualizar status e datas
    const updateData = { status };
    
    if (status === 'em_transito') {
      updateData.dataColetaReal = new Date();
    }
    
    if (status === 'entregue') {
      updateData.dataEntregaReal = new Date();
    }

    await frete.update(updateData);

    // Buscar frete atualizado
    const updatedFrete = await Frete.findByPk(id, {
      include: [
        { model: User, as: 'cliente' },
        { model: User, as: 'motorista' }
      ]
    });

    res.json({
      success: true,
      message: 'Status do frete atualizado com sucesso',
      data: { frete: updatedFrete }
    });
  } catch (error) {
    console.error('Erro ao atualizar status do frete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar todos os fretes (admin)
const getAllFretes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, clienteId, motoristaId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (clienteId) whereClause.clienteId = clienteId;
    if (motoristaId) whereClause.motoristaId = motoristaId;

    const { count, rows: fretes } = await Frete.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'cliente' },
        { model: User, as: 'motorista' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        fretes,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar todos os fretes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  createFrete,
  getFretesByCliente,
  getFretesDisponiveis,
  getFretesByMotorista,
  getFreteById,
  acceptFrete,
  updateFreteStatus,
  getAllFretes
};
