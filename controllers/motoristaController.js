const { User, Frete } = require('../models');
const { Op } = require('sequelize');

// Dashboard do Motorista
const getDashboard = async (req, res) => {
  try {
    const motoristaId = req.user.id;
    
    // Buscar fretes disponíveis
    const fretesDisponiveis = await Frete.findAll({
      where: {
        status: 'aceito',
        motorista_id: null
      },
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email'] }
      ],
      order: [[Frete.sequelize.literal("ABS(julianday(data_coleta_limite) - julianday('now'))"), 'ASC']],
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
      order: [[Frete.sequelize.literal("ABS(julianday(data_coleta_limite) - julianday('now'))"), 'ASC']]
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
      order: [[Frete.sequelize.literal("ABS(julianday(data_coleta_limite) - julianday('now'))"), 'ASC']],
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
    const motoristaId = req.user.id;

    // Motorista só pode ver fretes disponíveis se NÃO tiver frete em trânsito
    const freteEmTransitoCount = await Frete.count({
      where: {
        motorista_id: motoristaId,
        status: 'em_transito' // Apenas em trânsito bloqueia, não aceito/em_espera
      }
    });

    if (freteEmTransitoCount > 0) {
      return res.json({
        success: true,
        data: {
          fretes: [],
          pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), pages: 0 }
        },
        message: 'Você já está em viagem com um frete'
      });
    }

    // Disponíveis para motoristas são fretes aprovados pelo admin ('aceito') e sem motorista vinculado
    const whereClause = {
      status: 'aceito',
      motorista_id: null
    };

    // Filtros
    if (localizacao) {
      whereClause[Op.or] = [
        { origin_city: { [Op.like]: `%${localizacao}%` } },
        { destination_city: { [Op.like]: `%${localizacao}%` } }
      ];
    }

    if (tipoCarga) {
      whereClause.cargo_type = { [Op.like]: `%${tipoCarga}%` };
    }

    if (valorMin || valorMax) {
      whereClause.cargo_value = {};
      if (valorMin) whereClause.cargo_value[Op.gte] = valorMin;
      if (valorMax) whereClause.cargo_value[Op.lte] = valorMax;
    }

    const fretes = await Frete.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email'] }
      ],
      order: [[Frete.sequelize.literal("ABS(julianday(data_coleta_limite) - julianday('now'))"), 'ASC']],
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

    // Driver can accept only fretes that were approved by admin ('aceito')
    if (frete.status !== 'aceito') {
      return res.status(400).json({
        success: false,
        message: 'Frete não está disponível para aceitação pelo motorista'
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
      where: { motorista_id: motoristaId }
    });

    if (!caminhao) {
      return res.status(400).json({
        success: false,
        message: 'Você precisa ter um caminhão cadastrado para aceitar fretes. Cadastre um caminhão primeiro.'
      });
    }

    // Motorista aceita o frete: vinculamos o motorista e colocamos em 'em_espera'
    await frete.update({
      motorista_id: motoristaId,
      status: 'em_espera'
      // data_coleta será definida quando o motorista marcar em_transito
    });

    // Atualizar status do motorista para 'indisponivel'
    const motorista = await User.findByPk(motoristaId);
    if (motorista) {
      await motorista.update({ status: 'indisponivel' });
    }

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
      // Motorista em viagem
      const motorista = await User.findByPk(motoristaId);
      if (motorista) {
        await motorista.update({ status: 'em_viagem' });
      }
    } else if (status === 'entregue') {
      updateData.data_entrega = new Date();
      // Libera motorista
      const motorista = await User.findByPk(motoristaId);
      if (motorista) {
        await motorista.update({ status: 'disponivel' });
      }
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
    const { page = 1, limit = 10, status, mostrarTodos = 'false' } = req.query;
    const offset = (page - 1) * limit;
    const motoristaId = req.user.id;

    const whereClause = { motorista_id: motoristaId };
    // Por padrão, somente não finalizados
    if (mostrarTodos !== 'true') {
      whereClause.status = { [Op.in]: ['aceito', 'em_espera', 'em_transito'] };
    }
    if (status) whereClause.status = status;

    const fretesResult = await Frete.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'email', 'nome', 'telefone', 'cpf', 'empresa', 'cnpj'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Data atual (2025-11-02)
    const hoje = new Date('2025-11-02');
    
    console.log('\n=== DEBUG ORDENAÇÃO MOTORISTA FRETES POR STATUS E DATA ===');
    console.log('Data atual para comparação:', hoje.toISOString().split('T')[0]);
    
    // Definir ordem de prioridade dos status
    const statusPriority = {
      'aceito': 1,
      'em_transito': 2,
      'solicitado': 3,
      'entregue': 4,
      'cancelado': 5
    };
    
    // Ordenar manualmente por status (prioridade) e depois por proximidade da data atual
    const fretesOrdenados = fretesResult.rows.sort((a, b) => {
      // Primeiro, comparar por prioridade de status
      const priorityA = statusPriority[a.status] || 999;
      const priorityB = statusPriority[b.status] || 999;
      
      if (priorityA !== priorityB) {
        console.log(`Ordenação por status: Frete ${a.id} (${a.status}, prioridade ${priorityA}) vs Frete ${b.id} (${b.status}, prioridade ${priorityB})`);
        return priorityA - priorityB;
      }
      
      // Se o status for o mesmo, ordenar por proximidade de data
      const dataA = new Date(a.data_coleta_limite);
      const dataB = new Date(b.data_coleta_limite);
      
      // Calcular diferença em dias
      const diffA = Math.abs((dataA.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      const diffB = Math.abs((dataB.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`Ordenação por data (mesmo status ${a.status}): Frete ${a.id} (${a.data_coleta_limite}, diff: ${diffA.toFixed(1)} dias) vs Frete ${b.id} (${b.data_coleta_limite}, diff: ${diffB.toFixed(1)} dias)`);
      
      return diffA - diffB;
    });

    console.log('--- RESULTADO FINAL ORDENAÇÃO MOTORISTA POR STATUS E DATA ---');
    fretesOrdenados.forEach((frete, index) => {
      const dataColeta = new Date(frete.data_coleta_limite);
      const diffDias = Math.abs((dataColeta.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`${index + 1}. Frete ID: ${frete.id}, Status: ${frete.status}, Data Coleta: ${frete.data_coleta_limite}, Diferença: ${diffDias.toFixed(1)} dias`);
    });
    console.log('=== FIM DEBUG MOTORISTA ===\n');

    const fretes = {
      count: fretesResult.count,
      rows: fretesOrdenados
    };

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
      attributes: ['id', 'nome', 'email', 'telefone', 'cpf', 'cnh', 'categoria', 'cnh_validade', 'cnh_emissao', 'cnh_uf', 'cnh_observacoes', 'empresa', 'cnpj', 'endereco', 'cidade', 'estado', 'cep', 'created_at', 'updated_at']
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
      cnh_observacoes,
      empresa,
      cnpj,
      endereco,
      cidade,
      estado,
      cep
    } = req.body;

    console.log('Dados recebidos para atualização:', {
      nome, email, telefone, cpf, cnh, categoria,
      cnh_validade, cnh_emissao, cnh_uf, cnh_observacoes,
      empresa, cnpj, endereco, cidade, estado, cep
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
      email: email !== undefined ? email : user.email,
      nome: nome !== undefined ? nome : user.nome,
      telefone: telefone !== undefined ? telefone : user.telefone,
      cpf: cpf !== undefined ? cpf : user.cpf,
      cnh: cnh !== undefined ? cnh : user.cnh,
      categoria: categoria !== undefined ? categoria : user.categoria,
      empresa: empresa !== undefined ? empresa : user.empresa,
      cnpj: cnpj !== undefined ? cnpj : user.cnpj,
      endereco: endereco !== undefined ? endereco : user.endereco,
      cidade: cidade !== undefined ? cidade : user.cidade,
      estado: estado !== undefined ? estado : user.estado,
      cep: cep !== undefined ? cep : user.cep
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
        cnh_observacoes: user.cnh_observacoes,
        empresa: user.empresa,
        cnpj: user.cnpj,
        endereco: user.endereco,
        cidade: user.cidade,
        estado: user.estado,
        cep: user.cep
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
