const { User, Frete, Motorista, Cliente, Admin } = require('../models');
const { Op } = require('sequelize');

// Dashboard do Administrador
const getDashboard = async (req, res) => {
  try {
    // Fretes ativos
    const fretesAtivos = await Frete.count({
      where: {
        status: ['solicitado', 'aceito', 'em_transito']
      }
    });

    // Fretes concluídos no mês
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const fretesConcluidosMes = await Frete.count({
      where: {
        status: 'concluido',
        data_entrega: {
          [Op.gte]: inicioMes
        }
      }
    });

    // Fretes concluídos por motorista
    const fretesPorMotorista = await Frete.findAll({
      where: {
        status: 'concluido',
        data_entrega: {
          [Op.gte]: inicioMes
        }
      },
      attributes: [
        'motorista_id',
        [Frete.sequelize.fn('COUNT', Frete.sequelize.col('id')), 'count']
      ],
      group: ['motorista_id'],
      include: [
        { model: User, as: 'motorista', attributes: ['email'] }
      ]
    });

    // Motoristas disponíveis
    const motoristasDisponiveis = await User.count({
      where: {
        user_type: 'motorista',
        is_active: true
      }
    });

    // Fretes pendentes para aprovação
    const fretesPendentes = await Frete.count({
      where: {
        status: 'pendente'
      }
    });

    // Total de usuários
    const totalClientes = await User.count({
      where: { user_type: 'cliente' }
    });

    const totalMotoristas = await User.count({
      where: { user_type: 'motorista' }
    });

    const totalAdmins = await User.count({
      where: { user_type: 'admin' }
    });

    res.json({
      success: true,
      data: {
        dashboard: {
          fretesAtivos,
          fretesConcluidosMes,
          fretesPorMotorista,
          motoristasDisponiveis,
          fretesPendentes,
          usuarios: {
            totalClientes,
            totalMotoristas,
            totalAdmins
          }
        }
      }
    });
  } catch (error) {
    console.error('Erro no dashboard do administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Gerenciamento de usuários - Lista de clientes
const getClientes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_type: 'cliente' };
    
    if (status === 'ativo') whereClause.is_active = true;
    if (status === 'inativo') whereClause.is_active = false;
    
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const clientes = await User.findAndCountAll({
      where: whereClause,
      include: [
        { model: Cliente, as: 'cliente' }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        clientes: clientes.rows,
        pagination: {
          total: clientes.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(clientes.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Bloquear/desbloquear conta de cliente
const bloquearCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const cliente = await User.findOne({
      where: {
        id,
        user_type: 'cliente'
      }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    await cliente.update({ is_active });

    res.json({
      success: true,
      message: `Cliente ${is_active ? 'desbloqueado' : 'bloqueado'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao bloquear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Histórico de fretes por cliente
const getFretesPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const fretes = await Frete.findAndCountAll({
      where: { cliente_id: clienteId },
      include: [
        { model: User, as: 'motorista', attributes: ['id', 'email'] },
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
    console.error('Erro ao buscar fretes do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Gerenciamento de motoristas
const getMotoristas = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_type: 'motorista' };
    
    if (status === 'ativo') whereClause.is_active = true;
    if (status === 'inativo') whereClause.is_active = false;
    
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const motoristas = await User.findAndCountAll({
      where: whereClause,
      include: [
        { model: Motorista, as: 'motorista' }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        motoristas: motoristas.rows,
        pagination: {
          total: motoristas.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(motoristas.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar motoristas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Cadastrar novo motorista
const cadastrarMotorista = async (req, res) => {
  try {
    const { email, password, nome, telefone, cpf, cnh, categoria_cnh, endereco, cidade, estado, cep } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'E-mail já está em uso'
      });
    }

    // Criar usuário
    const user = await User.create({
      email,
      password,
      user_type: 'motorista',
      is_active: true,
      email_verified: true
    });

    // Criar perfil do motorista
    await Motorista.create({
      userId: user.id,
      nome,
      telefone,
      cpf,
      cnh,
      categoria_cnh,
      endereco,
      cidade,
      estado,
      cep
    });

    res.status(201).json({
      success: true,
      message: 'Motorista cadastrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cadastrar motorista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Bloquear/desbloquear motorista
const bloquearMotorista = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const motorista = await User.findOne({
      where: {
        id,
        user_type: 'motorista'
      }
    });

    if (!motorista) {
      return res.status(404).json({
        success: false,
        message: 'Motorista não encontrado'
      });
    }

    await motorista.update({ is_active });

    res.json({
      success: true,
      message: `Motorista ${is_active ? 'desbloqueado' : 'bloqueado'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao bloquear motorista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Histórico de entregas do motorista
const getEntregasMotorista = async (req, res) => {
  try {
    const { motoristaId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const fretes = await Frete.findAndCountAll({
      where: { 
        motorista_id: motoristaId,
        status: 'concluido'
      },
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email'] }
      ],
      order: [['data_entrega', 'DESC']],
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
    console.error('Erro ao buscar entregas do motorista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Gerenciamento de fretes - Visualizar todos os fretes
const getTodosFretes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, cliente, motorista, dataInicio, dataFim } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (cliente) whereClause.cliente_id = cliente;
    if (motorista) whereClause.motorista_id = motorista;
    
    if (dataInicio && dataFim) {
      whereClause.created_at = {
        [Op.between]: [new Date(dataInicio), new Date(dataFim)]
      };
    }

    const fretes = await Frete.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email'] },
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
    console.error('Erro ao buscar fretes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Reatribuir motorista
const reatribuirMotorista = async (req, res) => {
  try {
    const { id } = req.params;
    const { motorista_id } = req.body;

    const frete = await Frete.findByPk(id);
    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    // Verificar se o novo motorista existe e está ativo
    const motorista = await User.findOne({
      where: {
        id: motorista_id,
        user_type: 'motorista',
        is_active: true
      }
    });

    if (!motorista) {
      return res.status(400).json({
        success: false,
        message: 'Motorista não encontrado ou inativo'
      });
    }

    await frete.update({
      motorista_id,
      status: 'aceito',
      data_aceitacao: new Date()
    });

    res.json({
      success: true,
      message: 'Motorista reatribuído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao reatribuir motorista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Ajustar condições operacionais
const ajustarCondicoes = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const frete = await Frete.findByPk(id);
    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    await frete.update(updateData);

    res.json({
      success: true,
      message: 'Condições operacionais ajustadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao ajustar condições:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Monitoramento em tempo real
const getMonitoramentoTempoReal = async (req, res) => {
  try {
    // Fretes em trânsito
    const fretesEmTransito = await Frete.findAll({
      where: { status: 'em_transito' },
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email'] },
        { model: User, as: 'motorista', attributes: ['id', 'email'] }
      ]
    });

    // Fretes com atraso (exemplo: mais de 2 horas em trânsito)
    const duasHorasAtras = new Date();
    duasHorasAtras.setHours(duasHorasAtras.getHours() - 2);

    const fretesAtrasados = await Frete.findAll({
      where: {
        status: 'em_transito',
        data_inicio_transporte: {
          [Op.lt]: duasHorasAtras
        }
      },
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email'] },
        { model: User, as: 'motorista', attributes: ['id', 'email'] }
      ]
    });

    res.json({
      success: true,
      data: {
        fretesEmTransito,
        fretesAtrasados,
        totalEmTransito: fretesEmTransito.length,
        totalAtrasados: fretesAtrasados.length
      }
    });
  } catch (error) {
    console.error('Erro no monitoramento em tempo real:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Relatórios de usuários
const getRelatoriosUsuarios = async (req, res) => {
  try {
    const { periodo = '30' } = req.query;
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));

    // Novos cadastros no período
    const novosCadastros = await User.count({
      where: {
        created_at: {
          [Op.gte]: dataInicio
        }
      },
      group: ['user_type']
    });

    // Usuários ativos/inativos
    const usuariosAtivos = await User.count({
      where: { is_active: true }
    });

    const usuariosInativos = await User.count({
      where: { is_active: false }
    });

    // Avaliações (se implementado)
    // const avaliacoes = await Avaliacao.findAll({
    //   where: {
    //     created_at: {
    //       [Op.gte]: dataInicio
    //     }
    //   }
    // });

    res.json({
      success: true,
      data: {
        relatorios: {
          novosCadastros,
          usuariosAtivos,
          usuariosInativos,
          periodo: `${periodo} dias`
        }
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatórios de usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getDashboard,
  getClientes,
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
};
