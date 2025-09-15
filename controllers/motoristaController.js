const { User, Frete } = require('../models');
const { Op } = require('sequelize');

// Dashboard do Motorista
const getDashboard = async (req, res) => {
  try {
    const motoristaId = req.user.id;
    
    // Buscar fretes disponíveis
    const fretesDisponiveis = await Frete.findAll({
      where: {
        status: 'solicitado',
        motorista_id: null
      },
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Buscar fretes ativos do motorista
    const fretesAtivos = await Frete.findAll({
      where: {
        motorista_id: motoristaId,
        status: { [Op.in]: ['aceito', 'em_transito'] }
      },
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email'] }
      ],
      order: [['updated_at', 'DESC']]
    });

    // Buscar fretes concluídos do motorista
    const fretesConcluidos = await Frete.findAll({
      where: {
        motorista_id: motoristaId,
        status: 'entregue'
      },
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email'] }
      ],
      order: [['updated_at', 'DESC']],
      limit: 5
    });

    // Estatísticas
    const totalFretes = await Frete.count({
      where: { motorista_id: motoristaId }
    });

    const fretesConcluidosCount = await Frete.count({
      where: {
        motorista_id: motoristaId,
        status: 'entregue'
      }
    });

    res.json({
      success: true,
      data: {
        dashboard: {
          fretesDisponiveis: fretesDisponiveis.length,
          fretesAtivos: fretesAtivos.length,
          fretesConcluidos: fretesConcluidosCount,
          totalFretes,
          fretesAtivosList: fretesAtivos,
          fretesConcluidosList: fretesConcluidos
        }
      }
    });
  } catch (error) {
    console.error('Erro no dashboard do motorista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Visualizar fretes disponíveis
const getFretesDisponiveis = async (req, res) => {
  try {
    const { page = 1, limit = 10, localizacao, tipoCarga, valorMin, valorMax } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
        status: 'solicitado',
      motorista_id: null
    };

    // Filtros
    if (localizacao) {
      whereClause[Op.or] = [
        { origem_cidade: { [Op.iLike]: `%${localizacao}%` } },
        { destino_cidade: { [Op.iLike]: `%${localizacao}%` } }
      ];
    }

    if (tipoCarga) {
      whereClause.tipo_carga = { [Op.iLike]: `%${tipoCarga}%` };
    }

    if (valorMin || valorMax) {
      whereClause.valor = {};
      if (valorMin) whereClause.valor[Op.gte] = valorMin;
      if (valorMax) whereClause.valor[Op.lte] = valorMax;
    }

    const fretes = await Frete.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        fretes: fretes.rows,
        pagination: {
          total: fretes.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(fretes.count / limit)
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

// Aceitar frete
const aceitarFrete = async (req, res) => {
  try {
    const { id } = req.params;
    const motoristaId = req.user.id;

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

    // Aceitar o frete
    await frete.update({
      motorista_id: motoristaId,
      status: 'aceito',
      data_aceitacao: new Date()
    });

    res.json({
      success: true,
      message: 'Frete aceito com sucesso',
      data: { frete }
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
const atualizarStatusFrete = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observacoes } = req.body;
    const motoristaId = req.user.id;

    const frete = await Frete.findByPk(id);
    
    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    if (frete.motorista_id !== motoristaId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar este frete'
      });
    }

    // Validar transição de status
    const statusValidos = ['aceito', 'em_transito', 'entregue'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido'
      });
    }

    // Atualizar status
    const updateData = { status };
    if (observacoes) updateData.observacoes_motorista = observacoes;
    
    if (status === 'em_transito') {
      updateData.data_inicio_transporte = new Date();
    } else if (status === 'entregue') {
      updateData.data_entrega = new Date();
    }

    await frete.update(updateData);

    res.json({
      success: true,
      message: 'Status do frete atualizado com sucesso',
      data: { frete }
    });
  } catch (error) {
    console.error('Erro ao atualizar status do frete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Visualizar fretes do motorista
const getMeusFretes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const motoristaId = req.user.id;

    const whereClause = { motorista_id: motoristaId };
    if (status) whereClause.status = status;

    const fretes = await Frete.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email'] }
      ],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        fretes: fretes.rows,
        pagination: {
          total: fretes.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(fretes.count / limit)
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

// Buscar perfil do motorista
const getPerfil = async (req, res) => {
  try {
    const motoristaId = req.user.id;

    const user = await User.findByPk(motoristaId, {
      attributes: ['id', 'nome', 'email', 'telefone', 'cpf', 'cnh', 'categoria', 'cnh_validade', 'cnh_emissao', 'cnh_uf', 'cnh_observacoes', 'created_at', 'updated_at']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erro ao buscar perfil do motorista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar perfil do motorista
const atualizarPerfil = async (req, res) => {
  try {
    const motoristaId = req.user.id;
    const { 
      nome, 
      email, 
      telefone, 
      cpf, 
      cnh, 
      categoria,
      cnh_validade,
      cnh_emissao,
      cnh_uf,
      cnh_observacoes
    } = req.body;

    console.log('Dados recebidos para atualização:', {
      nome, email, telefone, cpf, cnh, categoria,
      cnh_validade, cnh_emissao, cnh_uf, cnh_observacoes
    });

    const user = await User.findByPk(motoristaId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Atualizar dados do usuário
    const updateData = {
      email: email || user.email,
      nome: nome || user.nome,
      telefone: telefone || user.telefone,
      cpf: cpf || user.cpf,
      cnh: cnh || user.cnh,
      categoria: categoria || user.categoria
    };

    // Adicionar campos de documentos se fornecidos (incluindo strings vazias)
    if (cnh_validade !== undefined) updateData.cnh_validade = cnh_validade || null;
    if (cnh_emissao !== undefined) updateData.cnh_emissao = cnh_emissao || null;
    if (cnh_uf !== undefined) updateData.cnh_uf = cnh_uf || null;
    if (cnh_observacoes !== undefined) updateData.cnh_observacoes = cnh_observacoes || null;

    await user.update(updateData);

    console.log('Dados atualizados no banco:', updateData);

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        cpf: user.cpf,
        cnh: user.cnh,
        categoria: user.categoria,
        cnh_validade: user.cnh_validade,
        cnh_emissao: user.cnh_emissao,
        cnh_uf: user.cnh_uf,
        cnh_observacoes: user.cnh_observacoes
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil do motorista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Relatórios pessoais do motorista
const getRelatoriosPessoais = async (req, res) => {
  try {
    const motoristaId = req.user.id;
    const { periodo = '30' } = req.query;
    
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));

    // Fretes concluídos no período
    const fretesConcluidos = await Frete.count({
      where: {
        motorista_id: motoristaId,
        status: 'entregue',
        data_entrega: {
          [Op.gte]: dataInicio
        }
      }
    });

    // Total de fretes
    const totalFretes = await Frete.count({
      where: { motorista_id: motoristaId }
    });

    // Fretes por status
    const fretesPorStatus = await Frete.findAll({
      where: { motorista_id: motoristaId },
      attributes: [
        'status',
        [Frete.sequelize.fn('COUNT', Frete.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        relatorios: {
          fretesConcluidos,
          totalFretes,
          fretesPorStatus,
          periodo: `${periodo} dias`
        }
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatórios do motorista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getDashboard,
  getFretesDisponiveis,
  aceitarFrete,
  atualizarStatusFrete,
  getMeusFretes,
  getPerfil,
  atualizarPerfil,
  getRelatoriosPessoais
};
