const { Localizacao, Frete, User } = require('../models');
const { Op } = require('sequelize');

// Registrar localização do motorista
const registrarLocalizacao = async (req, res) => {
  try {
    const { frete_id, latitude, longitude, endereco, cidade, estado, velocidade, direcao, precisao } = req.body;
    const motorista_id = req.user.id;

    // Verificar se o frete existe e pertence ao motorista
    const frete = await Frete.findOne({
      where: {
        id: frete_id,
        motorista_id: motorista_id,
        status: 'em_transito'
      }
    });

    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado ou não está em trânsito'
      });
    }

    // Validar coordenadas
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude e longitude são obrigatórias'
      });
    }

    // Criar registro de localização
    const localizacao = await Localizacao.create({
      frete_id,
      motorista_id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      endereco: endereco || null,
      cidade: cidade || null,
      estado: estado || null,
      velocidade: velocidade ? parseFloat(velocidade) : null,
      direcao: direcao ? parseFloat(direcao) : null,
      precisao: precisao ? parseFloat(precisao) : null,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: localizacao,
      message: 'Localização registrada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao registrar localização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter histórico de localizações de um frete
const obterHistoricoLocalizacoes = async (req, res) => {
  try {
    const { frete_id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const offset = (page - 1) * limit;

    // Verificar se o frete existe
    const frete = await Frete.findByPk(frete_id);
    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    // Buscar localizações
    const localizacoes = await Localizacao.findAndCountAll({
      where: { frete_id },
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      include: [
        {
          model: User,
          as: 'motorista',
          attributes: ['id', 'email', 'nome']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        localizacoes: localizacoes.rows,
        total: localizacoes.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(localizacoes.count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao obter histórico de localizações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter localização atual de um frete
const obterLocalizacaoAtual = async (req, res) => {
  try {
    const { frete_id } = req.params;

    // Verificar se o frete existe
    const frete = await Frete.findByPk(frete_id);
    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    // Buscar última localização
    const localizacao = await Localizacao.findOne({
      where: { frete_id },
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: User,
          as: 'motorista',
          attributes: ['id', 'email', 'nome']
        }
      ]
    });

    if (!localizacao) {
      return res.json({
        success: true,
        data: null,
        message: 'Nenhuma localização registrada para este frete'
      });
    }

    res.json({
      success: true,
      data: localizacao
    });

  } catch (error) {
    console.error('Erro ao obter localização atual:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter localizações em tempo real (últimas 24 horas)
const obterLocalizacoesTempoReal = async (req, res) => {
  try {
    const { frete_id } = req.params;

    // Data de 24 horas atrás
    const vinteQuatroHorasAtras = new Date();
    vinteQuatroHorasAtras.setHours(vinteQuatroHorasAtras.getHours() - 24);

    // Buscar localizações das últimas 24 horas
    const localizacoes = await Localizacao.findAll({
      where: {
        frete_id,
        timestamp: {
          [Op.gte]: vinteQuatroHorasAtras
        }
      },
      order: [['timestamp', 'ASC']],
      include: [
        {
          model: User,
          as: 'motorista',
          attributes: ['id', 'email', 'nome']
        }
      ]
    });

    res.json({
      success: true,
      data: localizacoes
    });

  } catch (error) {
    console.error('Erro ao obter localizações em tempo real:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter estatísticas de rastreamento
const obterEstatisticasRastreamento = async (req, res) => {
  try {
    const { frete_id } = req.params;

    // Verificar se o frete existe
    const frete = await Frete.findByPk(frete_id);
    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    // Contar total de localizações
    const totalLocalizacoes = await Localizacao.count({
      where: { frete_id }
    });

    // Primeira localização
    const primeiraLocalizacao = await Localizacao.findOne({
      where: { frete_id },
      order: [['timestamp', 'ASC']]
    });

    // Última localização
    const ultimaLocalizacao = await Localizacao.findOne({
      where: { frete_id },
      order: [['timestamp', 'DESC']]
    });

    // Localizações das últimas 24 horas
    const vinteQuatroHorasAtras = new Date();
    vinteQuatroHorasAtras.setHours(vinteQuatroHorasAtras.getHours() - 24);

    const localizacoes24h = await Localizacao.count({
      where: {
        frete_id,
        timestamp: {
          [Op.gte]: vinteQuatroHorasAtras
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalLocalizacoes,
        primeiraLocalizacao,
        ultimaLocalizacao,
        localizacoes24h,
        frete: {
          id: frete.id,
          codigo: frete.codigo,
          status: frete.status
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas de rastreamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  registrarLocalizacao,
  obterHistoricoLocalizacoes,
  obterLocalizacaoAtual,
  obterLocalizacoesTempoReal,
  obterEstatisticasRastreamento
};
