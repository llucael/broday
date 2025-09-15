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
      cliente_id: req.user.id,
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

    const whereClause = { cliente_id: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: fretes } = await Frete.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'cliente' },
        { model: User, as: 'motorista' }
      ],
      order: [['created_at', 'DESC']],
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: fretes } = await Frete.findAndCountAll({
      where: {
        status: 'solicitado',
        motorista_id: null
      },
      include: [
        { model: User, as: 'cliente' }
      ],
      order: [['created_at', 'DESC']],
      limit: limit,
      offset: offset
    });

    res.json({
      success: true,
      data: {
        fretes,
        pagination: {
          total: count,
          page: page,
          limit: limit,
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

    const whereClause = { motorista_id: req.user.id };
    if (status) {
      if (status.includes(',')) {
        whereClause.status = { [Op.in]: status.split(',') };
      } else {
        whereClause.status = status;
      }
    }

    const { count, rows: fretes } = await Frete.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'cliente' },
        { model: User, as: 'motorista' }
      ],
      order: [['created_at', 'DESC']],
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
    console.log('Verificando acesso:', {
      userType,
      userId: req.user.id,
      freteId: frete.id,
      freteMotoristaId: frete.motorista_id,
      freteClienteId: frete.cliente_id
    });
    
    if (userType === 'cliente' && frete.cliente_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    if (userType === 'motorista' && frete.motorista_id !== null && frete.motorista_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Log para debug
    console.log('Frete encontrado:', {
      id: frete.id,
      codigo: frete.codigo,
      status: frete.status,
      sender_name: frete.sender_name,
      recipient_name: frete.recipient_name,
      cargo_type: frete.cargo_type,
      cargo_value: frete.cargo_value,
      cargo_weight: frete.cargo_weight,
      data_coleta: frete.data_coleta,
      data_entrega: frete.data_entrega,
      cliente: frete.cliente?.email,
      motorista: frete.motorista?.email
    });

    res.json({
      success: true,
      data: frete
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

    if (frete.motorista_id) {
      return res.status(400).json({
        success: false,
        message: 'Frete já foi aceito por outro motorista'
      });
    }

    // Verificar se o motorista tem caminhão cadastrado
    const Caminhao = require('../models/Caminhao');
    const caminhao = await Caminhao.findOne({
      where: { motorista_id: req.user.id }
    });

    if (!caminhao) {
      return res.status(400).json({
        success: false,
        message: 'Você precisa ter um caminhão cadastrado para aceitar fretes. Cadastre um caminhão primeiro.'
      });
    }

    // Aceitar frete
    await frete.update({
      motorista_id: req.user.id,
      status: 'aceito',
      data_coleta: new Date() // Definir data de coleta quando motorista aceita
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

    if (userType === 'motorista' && frete.motorista_id !== null && frete.motorista_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Atualizar status e datas
    const updateData = { status };
    
    if (status === 'em_transito') {
      updateData.data_coleta = new Date();
    }
    
    if (status === 'entregue') {
      updateData.data_entrega = new Date();
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
    const { page = 1, limit = 10, status, clienteId, motoristaId, data } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (clienteId) whereClause.cliente_id = clienteId;
    if (motoristaId) whereClause.motorista_id = motoristaId;
    
    // Filtro por data
    if (data) {
      const dataInicio = new Date(data);
      const dataFim = new Date(data);
      dataFim.setDate(dataFim.getDate() + 1);
      
      whereClause.createdAt = {
        [Op.gte]: dataInicio,
        [Op.lt]: dataFim
      };
    }

    const { count, rows: fretes } = await Frete.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'cliente' },
        { model: User, as: 'motorista' }
      ],
      order: [['created_at', 'DESC']],
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

// Atualizar frete (admin)
const updateFrete = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, motorista_id, data_coleta, data_entrega } = req.body;

    console.log('Dados recebidos para atualização:', {
      id,
      status,
      motorista_id,
      data_coleta,
      data_entrega
    });

    const frete = await Frete.findByPk(id);
    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    // Atualizar campos permitidos
    const updateData = {};
    if (status) updateData.status = status;
    if (motorista_id !== undefined) updateData.motorista_id = motorista_id;
    if (data_coleta) updateData.data_coleta = data_coleta;
    if (data_entrega) updateData.data_entrega = data_entrega;

    console.log('Dados para atualização:', updateData);

    await frete.update(updateData);

    console.log('Frete atualizado com sucesso:', frete.toJSON());

    res.json({
      success: true,
      message: 'Frete atualizado com sucesso',
      data: frete
    });
  } catch (error) {
    console.error('Erro ao atualizar frete:', error);
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
  getAllFretes,
  updateFrete
};
