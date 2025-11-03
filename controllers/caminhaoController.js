const { Caminhao, User } = require('../models');

// Listar todos os caminhões (admin)
const getAllCaminhoes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: caminhoes } = await Caminhao.findAndCountAll({
      include: [
        { 
          model: User, 
          as: 'motorista',
          attributes: ['id', 'nome', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        caminhoes,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar caminhões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar caminhões do motorista
const getCaminhoesByMotorista = async (req, res) => {
  try {
    const motoristaId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: caminhoes } = await Caminhao.findAndCountAll({
      where: { motorista_id: motoristaId },
      include: [
        { 
          model: User, 
          as: 'motorista',
          attributes: ['id', 'nome', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        caminhoes,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar caminhões do motorista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar caminhão por ID
const getCaminhaoById = async (req, res) => {
  try {
    const { id } = req.params;

    const caminhao = await Caminhao.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'motorista',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    if (!caminhao) {
      return res.status(404).json({
        success: false,
        message: 'Caminhão não encontrado'
      });
    }

    res.json({
      success: true,
      data: caminhao
    });
  } catch (error) {
    console.error('Erro ao buscar caminhão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar caminhão
const createCaminhao = async (req, res) => {
  try {
    const { modelo, ano, placa, motorista_id } = req.body;

    console.log('=== CREATE CAMINHÃO ===');
    console.log('Dados recebidos:', { modelo, ano, placa, motorista_id });

    // Validar formato da placa
    if (placa) {
      const placaLimpa = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const isOldFormat = /^[A-Z]{3}[0-9]{4}$/.test(placaLimpa);
      const isMercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(placaLimpa);
      
      console.log('Placa limpa:', placaLimpa);
      console.log('Formato antigo válido:', isOldFormat);
      console.log('Formato Mercosul válido:', isMercosulFormat);
      
      if (!isOldFormat && !isMercosulFormat) {
        return res.status(400).json({
          success: false,
          message: 'Formato de placa inválido. Use ABC-1234 ou ABC1D23'
        });
      }
    }

    // Verificar se a placa já existe
    const existingCaminhao = await Caminhao.findOne({ where: { placa } });
    if (existingCaminhao) {
      console.log('Placa já existe:', existingCaminhao.placa);
      return res.status(400).json({
        success: false,
        message: 'Já existe um caminhão com esta placa'
      });
    }

    // Verificar se o motorista existe (se fornecido)
    if (motorista_id) {
      const motorista = await User.findByPk(motorista_id);
      if (!motorista || motorista.user_type !== 'motorista') {
        return res.status(400).json({
          success: false,
          message: 'Motorista não encontrado ou inválido'
        });
      }
    }

    const caminhao = await Caminhao.create({
      modelo,
      ano,
      placa,
      motorista_id: motorista_id || null
    });

    // Buscar o caminhão com o motorista associado
    const caminhaoCompleto = await Caminhao.findByPk(caminhao.id, {
      include: [
        { 
          model: User, 
          as: 'motorista',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Caminhão criado com sucesso',
      data: caminhaoCompleto
    });
  } catch (error) {
    console.error('Erro ao criar caminhão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar caminhão
const updateCaminhao = async (req, res) => {
  try {
    const { id } = req.params;
    const { modelo, ano, placa, motorista_id } = req.body;

    const caminhao = await Caminhao.findByPk(id);
    if (!caminhao) {
      return res.status(404).json({
        success: false,
        message: 'Caminhão não encontrado'
      });
    }

    // Verificar se a placa já existe (exceto para o próprio caminhão)
    if (placa && placa !== caminhao.placa) {
      const existingCaminhao = await Caminhao.findOne({ 
        where: { placa, id: { [require('sequelize').Op.ne]: id } } 
      });
      if (existingCaminhao) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um caminhão com esta placa'
        });
      }
    }

    // Verificar se o motorista existe (se fornecido)
    if (motorista_id) {
      const motorista = await User.findByPk(motorista_id);
      if (!motorista || motorista.user_type !== 'motorista') {
        return res.status(400).json({
          success: false,
          message: 'Motorista não encontrado ou inválido'
        });
      }
    }

    await caminhao.update({
      modelo: modelo || caminhao.modelo,
      ano: ano || caminhao.ano,
      placa: placa || caminhao.placa,
      motorista_id: motorista_id !== undefined ? motorista_id : caminhao.motorista_id
    });

    // Buscar o caminhão atualizado com o motorista associado
    const caminhaoAtualizado = await Caminhao.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'motorista',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Caminhão atualizado com sucesso',
      data: caminhaoAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar caminhão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar caminhão
const deleteCaminhao = async (req, res) => {
  try {
    const { id } = req.params;

    const caminhao = await Caminhao.findByPk(id);
    if (!caminhao) {
      return res.status(404).json({
        success: false,
        message: 'Caminhão não encontrado'
      });
    }

    await caminhao.destroy();

    res.json({
      success: true,
      message: 'Caminhão deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar caminhão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar motoristas para seleção
const getMotoristas = async (req, res) => {
  try {
    const motoristas = await User.findAll({
      where: { user_type: 'motorista', is_active: true },
      attributes: ['id', 'nome', 'email'],
      order: [['nome', 'ASC']]
    });

    res.json({
      success: true,
      data: motoristas
    });
  } catch (error) {
    console.error('Erro ao buscar motoristas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getAllCaminhoes,
  getCaminhoesByMotorista,
  getCaminhaoById,
  createCaminhao,
  updateCaminhao,
  deleteCaminhao,
  getMotoristas
};
