const { User, Frete } = require('../models');
const { Op } = require('sequelize');

// Dashboard do Cliente
const getDashboard = async (req, res) => {
  try {
    const clienteId = req.userId;
    
    // Buscar fretes ativos do cliente
    const fretesAtivos = await Frete.findAll({
      where: {
        cliente_id: clienteId,
        status: ['solicitado', 'aceito', 'em_transito']
      },
      include: [
        { model: User, as: 'motorista', attributes: ['id', 'email'] }
      ],
      order: [['updated_at', 'DESC']]
    });

    // Buscar fretes concluídos do cliente
    const fretesConcluidos = await Frete.findAll({
      where: {
        cliente_id: clienteId,
        status: 'concluido'
      },
      include: [
        { model: User, as: 'motorista', attributes: ['id', 'email'] }
      ],
      order: [['updated_at', 'DESC']],
      limit: 5
    });

    // Buscar fretes pendentes
    const fretesPendentes = await Frete.findAll({
      where: {
        cliente_id: clienteId,
        status: 'pendente'
      },
      order: [['created_at', 'DESC']]
    });

    // Estatísticas
    const totalFretes = await Frete.count({
      where: { cliente_id: clienteId }
    });

    const fretesConcluidosCount = await Frete.count({
      where: {
        cliente_id: clienteId,
        status: 'concluido'
      }
    });

    res.json({
      success: true,
      data: {
        dashboard: {
          fretesAtivos,
          fretesConcluidos,
          fretesPendentes,
          estatisticas: {
            totalFretes,
            fretesConcluidos: fretesConcluidosCount,
            fretesAtivos: fretesAtivos.length,
            fretesPendentes: fretesPendentes.length
          }
        }
      }
    });
  } catch (error) {
    console.error('Erro no dashboard do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Solicitar frete
const solicitarFrete = async (req, res) => {
  try {
    const clienteId = req.userId;
    const {
      tipo_carga,
      peso,
      valor,
      origem_endereco,
      origem_cidade,
      origem_estado,
      origem_cep,
      destino_endereco,
      destino_cidade,
      destino_estado,
      destino_cep,
      data_coleta,
      observacoes
    } = req.body;

    // Validar dados obrigatórios
    if (!tipo_carga || !peso || !valor || !origem_endereco || !destino_endereco) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios não fornecidos'
      });
    }

    // Criar frete
    const frete = await Frete.create({
      cliente_id: clienteId,
      tipo_carga,
      peso: parseFloat(peso),
      valor: parseFloat(valor),
      origem_endereco,
      origem_cidade,
      origem_estado,
      origem_cep,
      destino_endereco,
      destino_cidade,
      destino_estado,
      destino_cep,
      data_coleta: data_coleta ? new Date(data_coleta) : null,
      observacoes,
      status: 'solicitado'
    });

    res.status(201).json({
      success: true,
      message: 'Frete solicitado com sucesso',
      data: { frete }
    });
  } catch (error) {
    console.error('Erro ao solicitar frete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Acompanhar frete
const acompanharFrete = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteId = req.userId;

    const frete = await Frete.findOne({
      where: {
        id,
        cliente_id: clienteId
      },
      include: [
        { model: User, as: 'motorista', attributes: ['id', 'email'] }
      ]
    });

    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    res.json({
      success: true,
      data: { frete }
    });
  } catch (error) {
    console.error('Erro ao acompanhar frete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Gerenciar fretes do cliente
const getMeusFretes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const clienteId = req.userId;

    const whereClause = { cliente_id: clienteId };
    if (status) whereClause.status = status;

    const fretes = await Frete.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'motorista', attributes: ['id', 'email'] }
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
    console.error('Erro ao buscar fretes do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Cancelar frete
const cancelarFrete = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteId = req.userId;
    const { motivo } = req.body;

    const frete = await Frete.findOne({
      where: {
        id,
        cliente_id: clienteId
      }
    });

    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    if (frete.status === 'concluido') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar um frete já concluído'
      });
    }

    if (frete.status === 'em_transito') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar um frete em trânsito'
      });
    }

    // Cancelar frete
    await frete.update({
      status: 'cancelado',
      motivo_cancelamento: motivo,
      data_cancelamento: new Date()
    });

    res.json({
      success: true,
      message: 'Frete cancelado com sucesso',
      data: { frete }
    });
  } catch (error) {
    console.error('Erro ao cancelar frete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Alterar informações do frete
const alterarFrete = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteId = req.userId;
    const updateData = req.body;

    const frete = await Frete.findOne({
      where: {
        id,
        cliente_id: clienteId
      }
    });

    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    if (frete.status === 'aceito' || frete.status === 'em_transito' || frete.status === 'concluido') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível alterar um frete já aceito'
      });
    }

    // Atualizar frete
    await frete.update(updateData);

    res.json({
      success: true,
      message: 'Frete atualizado com sucesso',
      data: { frete }
    });
  } catch (error) {
    console.error('Erro ao alterar frete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Reagendar entrega
const reagendarEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const { nova_data } = req.body;
    const clienteId = req.userId;

    const frete = await Frete.findOne({
      where: {
        id,
        cliente_id: clienteId
      }
    });

    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    if (frete.status === 'concluido') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível reagendar um frete já concluído'
      });
    }

    // Reagendar
    await frete.update({
      data_coleta: new Date(nova_data)
    });

    res.json({
      success: true,
      message: 'Entrega reagendada com sucesso',
      data: { frete }
    });
  } catch (error) {
    console.error('Erro ao reagendar entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar perfil do cliente
const atualizarPerfil = async (req, res) => {
  try {
    const clienteId = req.userId;
    const { nome, telefone, endereco, cidade, estado, cep, cpf, cnpj } = req.body;

    const user = await User.findByPk(clienteId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Atualizar dados do usuário
    await user.update({
      email: req.body.email || user.email
    });

    // Atualizar dados do perfil do cliente
    const cliente = await user.getCliente();
    if (cliente) {
      await cliente.update({
        nome: nome || cliente.nome,
        telefone: telefone || cliente.telefone,
        endereco: endereco || cliente.endereco,
        cidade: cidade || cliente.cidade,
        estado: estado || cliente.estado,
        cep: cep || cliente.cep,
        cpf: cpf || cliente.cpf,
        cnpj: cnpj || cliente.cnpj
      });
    }

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Histórico completo do cliente
const getHistoricoCompleto = async (req, res) => {
  try {
    const clienteId = req.userId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const fretes = await Frete.findAndCountAll({
      where: { cliente_id: clienteId },
      include: [
        { model: User, as: 'motorista', attributes: ['id', 'email'] }
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
    console.error('Erro ao buscar histórico do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getDashboard,
  solicitarFrete,
  acompanharFrete,
  getMeusFretes,
  cancelarFrete,
  alterarFrete,
  reagendarEntrega,
  atualizarPerfil,
  getHistoricoCompleto
};
