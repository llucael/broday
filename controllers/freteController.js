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
    // Validar campos obrigatórios
    if (!req.body.data_coleta_limite || !req.body.data_entrega_limite) {
      return res.status(400).json({
        success: false,
        message: 'Data limite de coleta e data de entrega são obrigatórias'
      });
    }

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
    const { page = 1, limit = 10, status, mostrarTodos = 'false', search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { cliente_id: req.user.id };
    
    // Por padrão, mostrar apenas status que precisam de ação (não finalizados)
    // A menos que o parâmetro mostrarTodos=true seja passado
    if (mostrarTodos !== 'true') {
      whereClause.status = { [Op.in]: ['solicitado', 'aceito', 'em_transito'] };
    }
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    // Construir condições de busca
    if (search) {
      whereClause[Op.or] = [
        { origin_cep: { [Op.like]: `%${search}%` } },
        { destination_cep: { [Op.like]: `%${search}%` } },
        { origin_street: { [Op.like]: `%${search}%` } },
        { destination_street: { [Op.like]: `%${search}%` } },
        { origin_city: { [Op.like]: `%${search}%` } },
        { destination_city: { [Op.like]: `%${search}%` } },
        // Buscar também no nome/email do motorista e cliente
        { '$motorista.nome$': { [Op.like]: `%${search}%` } },
        { '$motorista.email$': { [Op.like]: `%${search}%` } },
        { '$cliente.nome$': { [Op.like]: `%${search}%` } },
        { '$cliente.email$': { [Op.like]: `%${search}%` } }
      ];
    }

    // Buscar com ordenação por data_coleta_limite (mais recente primeiro)
    const { count, rows: fretes } = await Frete.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email', 'nome', 'telefone', 'cpf', 'empresa', 'cnpj'] },
        { model: User, as: 'motorista', attributes: ['id', 'email', 'nome', 'telefone', 'cpf', 'empresa', 'cnpj'] }
      ],
      order: [['data_coleta_limite', 'DESC']],
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
      // Disponíveis são fretes aprovados pelo admin ('aceito') e sem motorista vinculado
      where: {
        status: 'aceito',
        motorista_id: null
      },
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email', 'nome', 'telefone', 'cpf', 'empresa', 'cnpj'] }
      ],
      order: [['data_coleta_limite', 'DESC']],
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
    const { page = 1, limit = 10, status, mostrarTodos = 'false' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { motorista_id: req.user.id };
    
    // Por padrão, mostrar apenas status que precisam de ação (não finalizados)
    // A menos que o parâmetro mostrarTodos=true seja passado
    if (mostrarTodos !== 'true') {
      whereClause.status = { [Op.in]: ['solicitado', 'aceito', 'em_transito'] };
    }
    
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
        { model: User, as: 'cliente', attributes: ['id', 'email', 'nome', 'telefone', 'cpf', 'empresa', 'cnpj'] },
        { model: User, as: 'motorista', attributes: ['id', 'email', 'nome', 'telefone', 'cpf', 'empresa', 'cnpj'] }
      ],
      order: [['data_coleta_limite', 'DESC']],
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

    // Now driver accepts a frete that must have been approved by admin (status 'aceito')
    if (frete.status !== 'aceito') {
      return res.status(400).json({
        success: false,
        message: 'Frete não está disponível para aceitação por motorista'
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

    // Motorista aceita o frete: vinculamos o motorista e colocamos em 'em_espera'
    await frete.update({
      motorista_id: req.user.id,
      status: 'em_espera'
      // data_coleta será definida quando o motorista coletar (em_transito)
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

// Aceitar frete (admin) - aprovar e tornar disponível para motoristas
const adminAcceptFrete = async (req, res) => {
  try {
    const { id } = req.params;

    const frete = await Frete.findByPk(id);
    if (!frete) {
      return res.status(404).json({ success: false, message: 'Frete não encontrado' });
    }

    // Apenas admin deve acessar essa rota (middleware já define req.userType)
    if (req.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Ação permitida apenas para administradores' });
    }

    // Log do estado antes da atualização
    console.log('Admin aprovando frete - antes:', {
      id: frete.id,
      status: frete.status,
      motorista_id: frete.motorista_id
    });

    // Marcar como aceito e garantir que não há motorista vinculado ainda
    await frete.update({ status: 'aceito', motorista_id: null });

    const updatedFrete = await Frete.findByPk(id, {
      include: [
        { model: User, as: 'cliente' },
        { model: User, as: 'motorista' }
      ]
    });

    // Log do estado depois da atualização
    console.log('Admin aprovou frete - depois:', {
      id: updatedFrete.id,
      status: updatedFrete.status,
      motorista_id: updatedFrete.motorista_id
    });

    return res.json({ success: true, message: 'Frete aprovado e disponibilizado para motoristas', data: { frete: updatedFrete } });
  } catch (error) {
    console.error('Erro ao aprovar frete (adminAcceptFrete):', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// Debug: listar fretes por status (apenas admin)
const debugFretes = async (req, res) => {
  try {
    const status = req.query.status || null;
    const whereClause = {};
    if (status) whereClause.status = status;

    const fretes = await Frete.findAll({ where: whereClause, limit: 100, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: { fretes } });
  } catch (error) {
    console.error('Erro no debugFretes:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
};

// Atualizar status do frete
const updateFreteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['solicitado', 'cotado', 'aceito', 'em_espera', 'em_transito', 'entregue', 'cancelado'];
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

    // Verificar permissões e transições
    const userType = req.userType;

    // If client requests cancellation, check timing rule: up to 7 days before data_coleta_limite
    if (userType === 'cliente') {
      if (status !== 'cancelado') {
        return res.status(403).json({ success: false, message: 'Cliente só pode cancelar fretes' });
      }

      // check deadline
      const limite = frete.data_coleta_limite ? new Date(frete.data_coleta_limite) : null;
      if (!limite) {
        return res.status(400).json({ success: false, message: 'Data limite de coleta não definida; não é possível cancelar' });
      }
      const now = Date.now();
      const ms7days = 7 * 24 * 60 * 60 * 1000;
      if ((limite.getTime() - now) < ms7days) {
        return res.status(400).json({ success: false, message: 'Cancelamento só permitido até 7 dias antes da data de coleta' });
      }

      await frete.update({ status: 'cancelado' });

      const updatedFreteClient = await Frete.findByPk(id, { include: [{ model: User, as: 'cliente' }, { model: User, as: 'motorista' }] });
      return res.json({ success: true, message: 'Frete cancelado com sucesso', data: { frete: updatedFreteClient } });
    }

    // Motorista actions
    if (userType === 'motorista') {
      if (frete.motorista_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Acesso negado - este frete não está vinculado a você' });
      }

      // Driver can move to 'em_transito' (coleto) and 'entregue'
      if (status === 'em_transito') {
        await frete.update({ status: 'em_transito', data_coleta: new Date() });
      } else if (status === 'entregue') {
        // only allow if currently em_transito or em_espera (edge cases)
        await frete.update({ status: 'entregue', data_entrega: new Date() });
      } else {
        return res.status(403).json({ success: false, message: 'Motorista só pode marcar fretes como em_transito ou entregue' });
      }

      const updatedForDriver = await Frete.findByPk(id, { include: [{ model: User, as: 'cliente' }, { model: User, as: 'motorista' }] });
      return res.json({ success: true, message: 'Status do frete atualizado com sucesso', data: { frete: updatedForDriver } });
    }

    // Admin can set status (approve/aceito or cancel) - but prefer explicit adminAccept endpoint
    if (userType === 'admin') {
      // Only allow admin to set certain statuses via this endpoint
      if (!['aceito', 'cancelado'].includes(status)) {
        return res.status(403).json({ success: false, message: 'Admin só pode aprovar (aceito) ou cancelar via este endpoint' });
      }

      const updateData = { status };
      if (status === 'aceito') {
        // ensure motorista not assigned
        updateData.motorista_id = null;
      }
      await frete.update(updateData);

      const updatedForAdmin = await Frete.findByPk(id, { include: [{ model: User, as: 'cliente' }, { model: User, as: 'motorista' }] });
      return res.json({ success: true, message: 'Status do frete atualizado com sucesso', data: { frete: updatedForAdmin } });
    }

    // Default: forbidden
    return res.status(403).json({ success: false, message: 'Ação não permitida' });

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
    const { page = 1, limit = 10, status, clienteId, motoristaId, dataInicio, dataFim, nomeMotorista, nomeCliente } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (clienteId) whereClause.cliente_id = clienteId;
    if (motoristaId) whereClause.motorista_id = motoristaId;
    
    // Filtro por intervalo de datas
    if (dataInicio && dataFim) {
      whereClause.createdAt = {
        [Op.gte]: new Date(dataInicio),
        [Op.lte]: new Date(dataFim)
      };
    } else if (dataInicio) {
      whereClause.createdAt = {
        [Op.gte]: new Date(dataInicio)
      };
    } else if (dataFim) {
      whereClause.createdAt = {
        [Op.lte]: new Date(dataFim)
      };
    }

    // Configurar includes com filtro de nome do motorista e cliente
    const includeOptions = [];

    if (nomeCliente) {
      includeOptions.push({
        model: User,
        as: 'cliente',
        where: {
          nome: { [Op.like]: `%${nomeCliente}%` }
        },
        required: true
      });
    } else {
      includeOptions.push({ model: User, as: 'cliente' });
    }

    if (nomeMotorista) {
      includeOptions.push({
        model: User,
        as: 'motorista',
        where: {
          nome: { [Op.like]: `%${nomeMotorista}%` }
        },
        required: false
      });
    } else {
      includeOptions.push({ model: User, as: 'motorista' });
    }

    const { count, rows: fretes } = await Frete.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      order: [['data_coleta_limite', 'DESC']],
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
    // Nota: esta rota é para atualização geral de campos do frete pelo admin.
    // Atualizações de status devem usar /:id/status (updateFreteStatus) ou a rota de aprovação específica /:id/aceitar-admin.
    const { motorista_id, data_coleta, data_entrega, ...other } = req.body;

    console.log('Dados recebidos para atualização (status deve ser omitido):', {
      id,
      motorista_id,
      data_coleta,
      data_entrega,
      other
    });

    const frete = await Frete.findByPk(id);
    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    // Só permitir atualização de campos não relacionados a fluxo de status aqui
    const updateData = {};
    if (motorista_id !== undefined) updateData.motorista_id = motorista_id;
    if (data_coleta) updateData.data_coleta = data_coleta;
    if (data_entrega) updateData.data_entrega = data_entrega;

    // Também incluir quaisquer outros campos passados (por exemplo endereços, valores, etc.)
    // desde que não contenham 'status' — já removido via destructuring.
    Object.keys(other).forEach(key => {
      updateData[key] = other[key];
    });

    console.log('Dados para atualização (admin):', updateData);

    await frete.update(updateData);

    const refreshed = await Frete.findByPk(id, { include: [{ model: User, as: 'cliente' }, { model: User, as: 'motorista' }] });

    res.json({ success: true, message: 'Frete atualizado com sucesso', data: refreshed });
  } catch (error) {
    console.error('Erro ao atualizar frete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar remetentes e destinatários já cadastrados do cliente
const getContatosCadastrados = async (req, res) => {
  try {
    const clienteId = req.user.id;
    
    // Buscar todos os fretes do cliente
    const fretes = await Frete.findAll({
      where: { cliente_id: clienteId },
      attributes: [
        'sender_name',
        'sender_document',
        'sender_phone',
        'sender_email',
        'recipient_name',
        'recipient_document',
        'recipient_phone',
        'recipient_email'
      ]
    });

    // Extrair remetentes e destinatários únicos
    const remetentes = new Map();
    const destinatarios = new Map();

    fretes.forEach(frete => {
      // Adicionar remetente
      if (frete.sender_name) {
        remetentes.set(frete.sender_document || frete.sender_email, {
          name: frete.sender_name,
          document: frete.sender_document,
          phone: frete.sender_phone,
          email: frete.sender_email
        });
      }

      // Adicionar destinatário
      if (frete.recipient_name) {
        destinatarios.set(frete.recipient_document || frete.recipient_email, {
          name: frete.recipient_name,
          document: frete.recipient_document,
          phone: frete.recipient_phone,
          email: frete.recipient_email
        });
      }
    });

    res.json({
      success: true,
      data: {
        remetentes: Array.from(remetentes.values()),
        destinatarios: Array.from(destinatarios.values())
      }
    });
  } catch (error) {
    console.error('Erro ao buscar contatos cadastrados:', error);
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
  adminAcceptFrete,
  getAllFretes,
  updateFrete,
  getContatosCadastrados
};
