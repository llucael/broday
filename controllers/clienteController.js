const { User, Frete } = require('../models');
const { Op } = require('sequelize');

// Dashboard do Cliente
const getDashboard = async (req, res) => {
  try {
    const clienteId = req.user.id;
    
    // Buscar fretes ativos do cliente
    const fretesAtivos = await Frete.findAll({
      where: {
        cliente_id: clienteId,
        status: ['aceito', 'em_transito']
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
        status: 'entregue'
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
        status: 'solicitado'
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
        status: 'entregue'
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
    const clienteId = req.user.id;
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

    // Buscar dados do cliente
    const cliente = await User.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Gerar código único para o frete
    const codigo = `FR${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Criar frete com os campos corretos do modelo
    const frete = await Frete.create({
      codigo: codigo,
      cliente_id: clienteId,
      status: 'solicitado',
      // Informações do remetente (cliente)
      sender_name: cliente.nome || 'Cliente',
      sender_document: cliente.cpf || cliente.cnpj || '',
      sender_phone: cliente.telefone || '',
      sender_email: cliente.email || '',
      // Informações do destinatário (mesmo cliente por enquanto)
      recipient_name: cliente.nome || 'Cliente',
      recipient_document: cliente.cpf || cliente.cnpj || '',
      recipient_phone: cliente.telefone || '',
      recipient_email: cliente.email || '',
      // Detalhes da carga
      cargo_type: tipo_carga,
      cargo_value: parseFloat(valor),
      cargo_weight: parseFloat(peso),
      cargo_dimensions: 'Não especificado',
      // Endereço de origem
      origin_cep: origem_cep || '',
      origin_street: origem_endereco,
      origin_number: '1',
      origin_complement: '',
      origin_city: origem_cidade || '',
      origin_state: origem_estado || '',
      // Endereço de destino
      destination_cep: destino_cep || '',
      destination_street: destino_endereco,
      destination_number: '1',
      destination_complement: '',
      destination_city: destino_cidade || '',
      destination_state: destino_estado || '',
      // Informações adicionais
      observacoes: observacoes || '',
      data_coleta: data_coleta ? new Date(data_coleta) : null
    });

    console.log('Frete criado com sucesso:', frete.toJSON());

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
    const clienteId = req.user.id;

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
    const clienteId = req.user.id;

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
    const clienteId = req.user.id;
    const { motivo } = req.body;

    console.log('Cancelando frete:', { id, clienteId, motivo });

    const frete = await Frete.findOne({
      where: {
        id,
        cliente_id: clienteId
      }
    });

    console.log('Frete encontrado:', frete);

    if (!frete) {
      return res.status(404).json({
        success: false,
        message: 'Frete não encontrado'
      });
    }

    if (frete.status === 'entregue') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar um frete já entregue'
      });
    }

    if (frete.status === 'em_transito') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar um frete em trânsito'
      });
    }

    if (frete.status === 'cancelado') {
      return res.status(400).json({
        success: false,
        message: 'Este frete já foi cancelado'
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
    const clienteId = req.user.id;
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
    const clienteId = req.user.id;

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

// Obter perfil do cliente
const getPerfil = async (req, res) => {
  try {
    const clienteId = req.user.id;
    
    // Buscar usuário sem attributes específicos para evitar problemas
    const user = await User.findByPk(clienteId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('Dados do usuário no getPerfil:', {
      id: user.id,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      cpf: user.cpf,
      endereco: user.endereco,
      cidade: user.cidade,
      estado: user.estado,
      cep: user.cep,
      empresa: user.empresa
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        tipo_pessoa: user.tipo_pessoa,
        cpf: user.cpf,
        cnpj: user.cnpj,
        rg: user.rg,
        inscricao_estadual: user.inscricao_estadual,
        endereco: user.endereco,
        cidade: user.cidade,
        estado: user.estado,
        cep: user.cep,
        empresa: user.empresa,
        data_nascimento: user.data_nascimento,
        razao_social: user.razao_social
      }
    });
  } catch (error) {
    console.error('Erro ao obter perfil do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter endereços do cliente
const getEnderecos = async (req, res) => {
  try {
    // Por enquanto, retornar array vazio até implementar a tabela de endereços
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Erro ao obter endereços:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar endereço do cliente
const createEndereco = async (req, res) => {
  try {
    // Por enquanto, retornar sucesso até implementar a tabela de endereços
    res.json({
      success: true,
      message: 'Endereço criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar endereço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar perfil do cliente
const atualizarPerfil = async (req, res) => {
  try {
    const clienteId = req.user.id;
    const { 
      nome, 
      telefone, 
      endereco, 
      cidade, 
      estado, 
      cep, 
      cpf, 
      cnpj, 
      tipo_pessoa, 
      rg, 
      inscricao_estadual,
      empresa,
      data_nascimento,
      razao_social,
      nome_completo,
      cpf_documento,
      cnpj_documento
    } = req.body;

    const user = await User.findByPk(clienteId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('Dados para atualização:', {
      nome, telefone, cpf, endereco, cidade, estado, cep, empresa
    });
    
    // Atualizar campos diretamente na instância
    if (nome !== undefined) user.nome = nome;
    if (nome_completo !== undefined) user.nome = nome_completo;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (telefone !== undefined) user.telefone = telefone;
    if (tipo_pessoa !== undefined) user.tipo_pessoa = tipo_pessoa;
    if (cpf !== undefined) user.cpf = cpf;
    if (cpf_documento !== undefined) user.cpf = cpf_documento;
    if (cnpj !== undefined) user.cnpj = cnpj;
    if (cnpj_documento !== undefined) user.cnpj = cnpj_documento;
    if (rg !== undefined) user.rg = rg;
    if (inscricao_estadual !== undefined) user.inscricao_estadual = inscricao_estadual;
    if (endereco !== undefined) user.endereco = endereco;
    if (cidade !== undefined) user.cidade = cidade;
    if (estado !== undefined) user.estado = estado;
    if (cep !== undefined) user.cep = cep;
    if (empresa !== undefined) user.empresa = empresa;
    if (data_nascimento !== undefined) user.data_nascimento = data_nascimento;
    if (razao_social !== undefined) user.razao_social = razao_social;

    // Salvar mudanças
    await user.save();
    
    console.log('Usuário atualizado com sucesso');
    
    // Buscar o usuário atualizado para verificar
    const updatedUser = await User.findByPk(clienteId);
    console.log('Usuário após atualização:', {
      nome: updatedUser.nome,
      telefone: updatedUser.telefone,
      cpf: updatedUser.cpf,
      endereco: updatedUser.endereco,
      cidade: updatedUser.cidade,
      estado: updatedUser.estado,
      cep: updatedUser.cep,
      empresa: updatedUser.empresa
    });

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
    const clienteId = req.user.id;
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
  getPerfil,
  getEnderecos,
  createEndereco,
  atualizarPerfil,
  getHistoricoCompleto
};
