const { User, Frete } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Função para gerar senha aleatória
function generateRandomPassword(length = 8) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Garantir pelo menos um caractere de cada tipo
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Preencher o resto com caracteres aleatórios
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Embaralhar a senha
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Dashboard do Administrador
const getDashboard = async (req, res) => {
  try {
    // Fretes ativos
    const fretesAtivos = await Frete.count({
      where: {
        status: {
          [Op.in]: ['solicitado', 'aceito', 'em_transito']
        }
      }
    });

    // Fretes concluídos nos últimos 2 meses (agosto e setembro)
    const inicioAgosto = new Date();
    inicioAgosto.setMonth(inicioAgosto.getMonth() - 1); // Agosto
    inicioAgosto.setDate(1);
    inicioAgosto.setHours(0, 0, 0, 0);

    const fretesConcluidosMes = await Frete.count({
      where: {
        status: 'entregue',
        data_entrega: {
          [Op.gte]: inicioAgosto
        }
      }
    });

    // Fretes por status para gráficos
    const fretesPorStatus = await Frete.findAll({
      attributes: [
        'status',
        [Frete.sequelize.fn('COUNT', Frete.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Fretes por mês (últimos 6 meses) - consulta simplificada
    const fretesPorMes = await Frete.findAll({
      where: {
        status: 'entregue'
      },
      attributes: [
        [Frete.sequelize.fn('strftime', '%Y-%m', Frete.sequelize.col('data_entrega')), 'mes'],
        [Frete.sequelize.fn('COUNT', Frete.sequelize.col('id')), 'count']
      ],
      group: [Frete.sequelize.fn('strftime', '%Y-%m', Frete.sequelize.col('data_entrega'))],
      order: [[Frete.sequelize.fn('strftime', '%Y-%m', Frete.sequelize.col('data_entrega')), 'ASC']]
    });

    // Fretes concluídos por motorista
    const fretesPorMotorista = await Frete.findAll({
      where: {
        status: 'entregue',
        data_entrega: {
          [Op.gte]: inicioAgosto
        }
      },
      attributes: [
        'motorista_id',
        [Frete.sequelize.fn('COUNT', Frete.sequelize.col('Frete.id')), 'count']
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

    // Log para debug dos dados de fretes por mês
    console.log('Fretes por mês:', JSON.stringify(fretesPorMes, null, 2));

    res.json({
      success: true,
      data: {
        dashboard: {
          fretesAtivos,
          fretesConcluidosMes,
          fretesPorStatus,
          fretesPorMes,
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

// Gerenciamento de usuários - Lista de usuários
const getClientes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, user_type } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    // Filtrar por tipo de usuário se especificado
    if (user_type) {
      // Suportar múltiplos tipos separados por vírgula
      if (user_type.includes(',')) {
        const types = user_type.split(',').map(type => type.trim());
        whereClause.user_type = { [Op.in]: types };
      } else {
        whereClause.user_type = user_type;
      }
    }
    
    if (status === 'ativo') whereClause.is_active = true;
    if (status === 'inativo') whereClause.is_active = false;
    
    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { nome: { [Op.iLike]: `%${search}%` } },
        { cpf: { [Op.iLike]: `%${search}%` } },
        { cnpj: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const usuarios = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'nome', 'email', 'telefone', 'cpf', 'empresa', 'cnpj', 'user_type', 'is_active', 'email_verified', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log('=== CONSULTA GET CLIENTES ===');
    console.log('SQL gerado:', usuarios.sql);
    console.log('Usuários encontrados:', usuarios.rows.length);

    console.log('=== DEBUG GET CLIENTES ===');
    console.log('Usuários encontrados no banco:', usuarios.rows.length);
    if (usuarios.rows.length > 0) {
      console.log('Primeiro usuário do banco:', {
        id: usuarios.rows[0].id,
        nome: usuarios.rows[0].nome,
        email: usuarios.rows[0].email,
        telefone: usuarios.rows[0].telefone,
        cpf: usuarios.rows[0].cpf,
        empresa: usuarios.rows[0].empresa,
        cnpj: usuarios.rows[0].cnpj
      });
    }

    // Log para debug
    console.log('Usuários encontrados:', usuarios.rows.length);
    if (usuarios.rows.length > 0) {
      console.log('Primeiro usuário:', {
        id: usuarios.rows[0].id,
        email: usuarios.rows[0].email,
        created_at: usuarios.rows[0].created_at,
        created_at_type: typeof usuarios.rows[0].created_at
      });
    }

    // Converter datas para string para evitar problemas de serialização
    const usuariosSerializados = usuarios.rows.map(usuario => {
      const userData = usuario.toJSON();
      console.log('Usuário antes da serialização:', {
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        telefone: userData.telefone,
        cpf: userData.cpf,
        empresa: userData.empresa,
        cnpj: userData.cnpj,
        user_type: userData.user_type,
        is_active: userData.is_active,
        created_at: userData.created_at,
        created_at_type: typeof userData.created_at
      });
      
      return {
        ...userData,
        created_at: userData.created_at ? new Date(userData.created_at).toISOString() : new Date().toISOString(),
        updated_at: userData.updated_at ? new Date(userData.updated_at).toISOString() : new Date().toISOString()
      };
    });

    res.json({
      success: true,
      data: {
        usuarios: usuariosSerializados,
        pagination: {
          total: usuarios.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(usuarios.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar novo usuário
const createUser = async (req, res) => {
  try {
    const { email, password, user_type, nome, telefone, cpf, empresa, cnpj } = req.body;

    console.log('=== DEBUG CREATE USER ===');
    console.log('Dados recebidos:', { email, password, user_type, nome, telefone, cpf, empresa, cnpj });

    // Verificar se o email já existe
    const [existingUsers] = await sequelize.query(
      'SELECT id, email FROM users WHERE email = ?',
      { replacements: [email] }
    );
    
    if (existingUsers.length > 0) {
      console.log('Email já cadastrado:', email);
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Gerar senha aleatória se não for fornecida
    const finalPassword = password || generateRandomPassword(10);
    console.log('Senha gerada:', finalPassword);

    // Hash da senha
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    // Criar usuário com SQL direto para garantir a ordem correta das colunas
    const sql = `
      INSERT INTO users (email, password, user_type, is_active, email_verified, created_at, updated_at, nome, telefone, cpf, empresa, cnpj)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)
    `;
    
    const replacements = [
      email,
      hashedPassword,
      user_type || 'cliente',
      true,
      false,
      nome || null,
      telefone || null,
      cpf || null,
      empresa || null,
      cnpj || null
    ];
    
    console.log('SQL de inserção:', sql);
    console.log('Parâmetros:', replacements);
    
    const [results] = await sequelize.query(sql, {
      replacements: replacements
    });
    
    // Buscar o usuário criado
    const [users] = await sequelize.query(
      'SELECT id, email, nome, telefone, cpf, empresa, cnpj, user_type, is_active, email_verified, created_at, updated_at FROM users WHERE email = ?',
      { replacements: [email] }
    );
    
    const newUser = users[0];

    console.log('Usuário criado:', {
      id: newUser.id,
      email: newUser.email,
      nome: newUser.nome,
      telefone: newUser.telefone,
      cpf: newUser.cpf,
      empresa: newUser.empresa,
      cnpj: newUser.cnpj
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          nome: newUser.nome,
          telefone: newUser.telefone,
          cpf: newUser.cpf,
          empresa: newUser.empresa,
          cnpj: newUser.cnpj,
          user_type: newUser.user_type,
          is_active: newUser.is_active,
          created_at: newUser.created_at
        },
        generatedPassword: finalPassword
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
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

    // Construir WHERE clause
    let whereClause = "WHERE user_type = 'motorista'";
    const replacements = [];

    if (status === 'ativo') {
      whereClause += " AND is_active = 1";
    } else if (status === 'inativo') {
      whereClause += " AND is_active = 0";
    }
    
    if (search) {
      whereClause += " AND (nome LIKE ? OR email LIKE ? OR cpf LIKE ?)";
      replacements.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Buscar motoristas com todos os campos
    const [motoristas] = await sequelize.query(
      `SELECT id, nome, email, telefone, cpf, empresa, cnpj, cnh, categoria, user_type, is_active, status, email_verified, created_at, updated_at 
       FROM users 
       ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      { replacements: [...replacements, parseInt(limit), parseInt(offset)] }
    );

    // Contar total
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      { replacements }
    );

    const total = countResult[0].count;

    console.log('=== DEBUG GET MOTORISTAS ===');
    console.log('Motoristas encontrados:', motoristas.length);
    if (motoristas.length > 0) {
      console.log('Primeiro motorista:', motoristas[0]);
    }

    res.json({
      success: true,
      data: {
        motoristas: motoristas,
        pagination: {
          total: total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
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
    const { email, nome, telefone, cpf, cnh, categoria, user_type, is_active, status } = req.body;

    console.log('=== DEBUG CADASTRAR MOTORISTA ===');
    console.log('Dados recebidos:', req.body);

    // Verificar se usuário já existe
    const [existingUsers] = await sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      { replacements: [email] }
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'E-mail já está em uso'
      });
    }

    // Gerar senha aleatória se não fornecida
    let generatedPassword = null;
    if (!req.body.password) {
      generatedPassword = generateRandomPassword();
    }

    const passwordToUse = req.body.password || generatedPassword;
    const hashedPassword = await bcrypt.hash(passwordToUse, 10);

    // Usar SQL direto para inserir
    const sql = `
      INSERT INTO users (nome, email, telefone, cpf, empresa, cnpj, cnh, categoria, password, user_type, is_active, status, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    const replacements = [
      nome,
      email,
      telefone,
      cpf,
      null, // empresa
      null, // cnpj
      cnh,
      categoria,
      hashedPassword,
      user_type || 'motorista',
      is_active !== false ? 1 : 0,
      status || null, // status
      1 // email_verified
    ];

    const [results] = await sequelize.query(sql, {
      replacements: replacements
    });

    // Buscar o ID do usuário recém-criado usando o email
    const [lastUser] = await sequelize.query(
      'SELECT id FROM users WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      { replacements: [email] }
    );
    
    if (!lastUser || lastUser.length === 0) {
      throw new Error('Erro ao obter ID do usuário criado');
    }
    
    const newUserId = lastUser[0].id;
    console.log('Motorista criado com ID:', newUserId);
    console.log('Results structure:', results);
    console.log('LastUser structure:', lastUser);

    // Buscar o usuário criado
    const [newUsers] = await sequelize.query(
      'SELECT id, nome, email, telefone, cpf, empresa, cnpj, cnh, categoria, user_type, is_active, status, email_verified, created_at, updated_at FROM users WHERE id = ?',
      { replacements: [newUserId] }
    );

    const newUser = newUsers[0];

    console.log('Usuário criado:', newUser);

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'Motorista cadastrado com sucesso',
      generatedPassword: generatedPassword
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

// Buscar usuário por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DEBUG GET USER BY ID ===');
    console.log('ID solicitado:', id);
    
    // Usar SQL direto para garantir que todos os campos sejam retornados
    const [users] = await sequelize.query(
      'SELECT id, email, nome, telefone, cpf, empresa, cnpj, cnh, categoria, user_type, is_active, status, email_verified, created_at, updated_at FROM users WHERE id = ?',
      { replacements: [id] }
    );
    
    if (users.length === 0) {
      console.log('Usuário não encontrado com ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    const usuario = users[0];
    console.log('Usuário encontrado:', usuario);

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar usuário
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('=== DEBUG UPDATE USER ===');
    console.log('ID recebido:', id);
    console.log('Dados recebidos:', updateData);

    // Verificar se o usuário existe
    const usuario = await User.findByPk(id);
    if (!usuario) {
      console.log('Usuário não encontrado com ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('Usuário encontrado:', {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      telefone: usuario.telefone,
      cpf: usuario.cpf,
      empresa: usuario.empresa,
      cnpj: usuario.cnpj
    });

    // Usar SQL direto para atualizar
    const { nome, email, telefone, cpf, empresa, cnpj, cnh, categoria, user_type, is_active, status, password } = updateData;
    
    // Garantir que os valores não sejam undefined
    const safeNome = nome || null;
    const safeEmail = email || null;
    const safeTelefone = telefone || null;
    const safeCpf = cpf || null;
    const safeEmpresa = empresa || null;
    const safeCnpj = cnpj || null;
    const safeCnh = cnh || null;
    const safeCategoria = categoria || null;
    const safeUserType = user_type || 'motorista';
    const safeIsActive = is_active !== false ? 1 : 0;
    const safeStatus = status || null;
    
    let sql, replacements;
    
    if (password && password.trim() !== '') {
      // Se uma nova senha foi fornecida, incluir no UPDATE
      console.log('Atualizando usuário com nova senha');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      sql = `
        UPDATE users 
        SET nome = ?, email = ?, telefone = ?, cpf = ?, empresa = ?, cnpj = ?, cnh = ?, categoria = ?, user_type = ?, is_active = ?, status = ?, password = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      replacements = [safeNome, safeEmail, safeTelefone, safeCpf, safeEmpresa, safeCnpj, safeCnh, safeCategoria, safeUserType, safeIsActive, safeStatus, hashedPassword, id];
    } else {
      // Se não foi fornecida senha, manter a senha atual
      console.log('Atualizando usuário sem alterar senha');
      
      sql = `
        UPDATE users 
        SET nome = ?, email = ?, telefone = ?, cpf = ?, empresa = ?, cnpj = ?, cnh = ?, categoria = ?, user_type = ?, is_active = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      replacements = [safeNome, safeEmail, safeTelefone, safeCpf, safeEmpresa, safeCnpj, safeCnh, safeCategoria, safeUserType, safeIsActive, safeStatus, id];
    }
    
    const [results] = await sequelize.query(sql, {
      replacements: replacements
    });

    console.log('SQL executado:', sql);
    console.log('Parâmetros:', replacements);
    console.log('Resultado:', results);
    console.log('Status sendo salvo:', safeStatus);
    console.log('safeStatus type:', typeof safeStatus);
    console.log('safeStatus value:', safeStatus);

    // Buscar usuário atualizado
    const [usuarios] = await sequelize.query(
      'SELECT id, nome, email, telefone, cpf, empresa, cnpj, cnh, categoria, user_type, is_active, status, email_verified, created_at, updated_at FROM users WHERE id = ?',
      { replacements: [id] }
    );

    const usuarioAtualizado = usuarios[0];

    console.log('=== USUÁRIO APÓS ATUALIZAÇÃO ===');
    console.log('Usuário atualizado:', usuarioAtualizado);

    res.json({
      success: true,
      data: usuarioAtualizado,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Excluir usuário
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário existe
    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se é o próprio admin (não pode se excluir)
    if (usuario.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode excluir sua própria conta'
      });
    }

    // Excluir usuário
    await usuario.destroy();

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Excluir frete (Admin)
const deleteFrete = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o frete existe
    const frete = await Frete.findByPk(id);
    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    // Verificar se o frete pode ser excluído (não pode estar em trânsito ou entregue)
    if (['em_transito', 'entregue'].includes(frete.status)) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir fretes em trânsito ou já entregues'
      });
    }

    // Excluir frete
    await frete.destroy();

    res.json({
      success: true,
      message: 'Frete excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir frete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
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
  getRelatoriosUsuarios,
  generateRandomPassword,
  deleteFrete
};
