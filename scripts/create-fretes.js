const { sequelize, User, Frete } = require('../models');

// Função para gerar código único do frete
function generateFreteCode() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `FR${timestamp}${random}`;
}

// Função para gerar data aleatória
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function createFretes() {
  try {
    console.log('🚛 Iniciando criação de fretes...');
    
    // Sincronizar modelos
    await sequelize.sync();
    
    // Buscar usuários
    const clientes = await User.findAll({ where: { user_type: 'cliente' } });
    const motoristas = await User.findAll({ where: { user_type: 'motorista' } });
    
    if (clientes.length === 0 || motoristas.length === 0) {
      console.log('❌ É necessário ter pelo menos 1 cliente e 1 motorista no banco');
      return;
    }
    
    console.log(`👥 Encontrados ${clientes.length} clientes e ${motoristas.length} motoristas`);
    
    // Dados de exemplo para fretes
    const fretesData = [
      // Fretes ATIVOS (em andamento)
      {
        status: 'aceito',
        senderName: 'João Silva',
        senderDocument: '123.456.789-00',
        senderPhone: '(11) 99999-1111',
        senderEmail: 'joao@email.com',
        recipientName: 'Maria Santos',
        recipientDocument: '987.654.321-00',
        recipientPhone: '(21) 88888-2222',
        recipientEmail: 'maria@email.com',
        cargoType: 'Eletrônicos',
        cargoValue: 2500.00,
        cargoWeight: 15.5,
        cargoDimensions: '50x40x30 cm',
        originCep: '84053-060',
        originStreet: 'Rua Cambara',
        originNumber: '268',
        originComplement: 'Nova Russia',
        originCity: 'Ponta Grossa',
        originState: 'PR',
        destinationCep: '20040-020',
        destinationStreet: 'Rua da Carioca',
        destinationNumber: '200',
        destinationComplement: 'Apt 302',
        destinationCity: 'Rio de Janeiro',
        destinationState: 'RJ',
        observacoes: 'Produto frágil, manuseio com cuidado',
        dataColeta: new Date(),
        dataEntrega: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 dias
      },
      {
        status: 'em_transito',
        senderName: 'Carlos Oliveira',
        senderDocument: '111.222.333-44',
        senderPhone: '(11) 77777-3333',
        senderEmail: 'carlos@email.com',
        recipientName: 'Ana Costa',
        recipientDocument: '555.666.777-88',
        recipientPhone: '(31) 66666-4444',
        recipientEmail: 'ana@email.com',
        cargoType: 'Roupas',
        cargoValue: 800.00,
        cargoWeight: 8.2,
        cargoDimensions: '60x40x20 cm',
        originCep: '84053-060',
        originStreet: 'Rua Cambara',
        originNumber: '268',
        originComplement: 'Nova Russia',
        originCity: 'Ponta Grossa',
        originState: 'PR',
        destinationCep: '30112-000',
        destinationStreet: 'Rua da Bahia',
        destinationNumber: '1500',
        destinationComplement: 'Loja 1',
        destinationCity: 'Belo Horizonte',
        destinationState: 'MG',
        observacoes: 'Entrega urgente',
        dataColeta: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        dataEntrega: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 dia
      },
      {
        status: 'aceito',
        senderName: 'Pedro Mendes',
        senderDocument: '999.888.777-66',
        senderPhone: '(11) 55555-5555',
        senderEmail: 'pedro@email.com',
        recipientName: 'Lucia Ferreira',
        recipientDocument: '444.333.222-11',
        recipientPhone: '(47) 44444-6666',
        recipientEmail: 'lucia@email.com',
        cargoType: 'Documentos',
        cargoValue: 50.00,
        cargoWeight: 0.5,
        cargoDimensions: '30x20x5 cm',
        originCep: '84053-060',
        originStreet: 'Rua Cambara',
        originNumber: '268',
        originComplement: 'Nova Russia',
        originCity: 'Ponta Grossa',
        originState: 'PR',
        destinationCep: '88010-400',
        destinationStreet: 'Rua Felipe Schmidt',
        destinationNumber: '456',
        destinationComplement: 'Escritório 2',
        destinationCity: 'Florianópolis',
        destinationState: 'SC',
        observacoes: 'Documentos importantes',
        dataColeta: new Date(),
        dataEntrega: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 dias
      },
      
      // Fretes CONCLUÍDOS (entregues)
      {
        status: 'entregue',
        senderName: 'Roberto Lima',
        senderDocument: '777.666.555-44',
        senderPhone: '(11) 33333-7777',
        senderEmail: 'roberto@email.com',
        recipientName: 'Fernanda Alves',
        recipientDocument: '222.111.000-99',
        recipientPhone: '(85) 22222-8888',
        recipientEmail: 'fernanda@email.com',
        cargoType: 'Livros',
        cargoValue: 300.00,
        cargoWeight: 12.0,
        cargoDimensions: '40x30x25 cm',
        originCep: '84053-060',
        originStreet: 'Rua Cambara',
        originNumber: '268',
        originComplement: 'Nova Russia',
        originCity: 'Ponta Grossa',
        originState: 'PR',
        destinationCep: '60060-100',
        destinationStreet: 'Rua Barão do Rio Branco',
        destinationNumber: '100',
        destinationComplement: 'Apt 501',
        destinationCity: 'Fortaleza',
        destinationState: 'CE',
        observacoes: 'Coleção de livros raros',
        dataColeta: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
        dataEntrega: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 dias atrás
      },
      {
        status: 'entregue',
        senderName: 'Patricia Souza',
        senderDocument: '333.444.555-66',
        senderPhone: '(11) 11111-9999',
        senderEmail: 'patricia@email.com',
        recipientName: 'Marcos Rocha',
        recipientDocument: '888.999.000-11',
        recipientPhone: '(51) 00000-1111',
        recipientEmail: 'marcos@email.com',
        cargoType: 'Equipamentos',
        cargoValue: 5000.00,
        cargoWeight: 25.0,
        cargoDimensions: '80x60x40 cm',
        originCep: '84053-060',
        originStreet: 'Rua Cambara',
        originNumber: '268',
        originComplement: 'Nova Russia',
        originCity: 'Ponta Grossa',
        originState: 'PR',
        destinationCep: '90020-004',
        destinationStreet: 'Rua dos Andradas',
        destinationNumber: '500',
        destinationComplement: 'Sala 1001',
        destinationCity: 'Porto Alegre',
        destinationState: 'RS',
        observacoes: 'Equipamento industrial pesado',
        dataColeta: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
        dataEntrega: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 dias atrás
      },
      {
        status: 'entregue',
        senderName: 'Antonio Santos',
        senderDocument: '123.789.456-12',
        senderPhone: '(11) 98765-4321',
        senderEmail: 'antonio@email.com',
        recipientName: 'Carla Mendes',
        recipientDocument: '987.123.654-98',
        recipientPhone: '(62) 12345-6789',
        recipientEmail: 'carla@email.com',
        cargoType: 'Móveis',
        cargoValue: 1200.00,
        cargoWeight: 35.0,
        cargoDimensions: '120x80x60 cm',
        originCep: '84053-060',
        originStreet: 'Rua Cambara',
        originNumber: '268',
        originComplement: 'Nova Russia',
        originCity: 'Ponta Grossa',
        originState: 'PR',
        destinationCep: '74015-010',
        destinationStreet: 'Rua 3',
        destinationNumber: '800',
        destinationComplement: 'Casa 2',
        destinationCity: 'Goiânia',
        destinationState: 'GO',
        observacoes: 'Mesa de escritório, cuidado com arranhões',
        dataColeta: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás
        dataEntrega: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) // 12 dias atrás
      },
      
      // Fretes SOLICITADOS (aguardando motorista)
      {
        status: 'solicitado',
        senderName: 'Isabela Costa',
        senderDocument: '456.789.123-45',
        senderPhone: '(11) 33333-4444',
        senderEmail: 'isabela@email.com',
        recipientName: 'Rafael Oliveira',
        recipientDocument: '789.456.123-78',
        recipientPhone: '(27) 55555-6666',
        recipientEmail: 'rafael@email.com',
        cargoType: 'Alimentos',
        cargoValue: 150.00,
        cargoWeight: 5.0,
        cargoDimensions: '40x30x20 cm',
        originCep: '84053-060',
        originStreet: 'Rua Cambara',
        originNumber: '268',
        originComplement: 'Nova Russia',
        originCity: 'Ponta Grossa',
        originState: 'PR',
        destinationCep: '29010-120',
        destinationStreet: 'Rua Sete de Setembro',
        destinationNumber: '300',
        destinationComplement: 'Apt 201',
        destinationCity: 'Vitória',
        destinationState: 'ES',
        observacoes: 'Produtos perecíveis, transporte refrigerado',
        dataColeta: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // amanhã
        dataEntrega: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 dias
      }
    ];
    
    // Criar fretes
    for (let i = 0; i < fretesData.length; i++) {
      const freteData = fretesData[i];
      const cliente = clientes[i % clientes.length];
      const motorista = freteData.status === 'solicitado' ? null : motoristas[i % motoristas.length];
      
      const frete = await Frete.create({
        codigo: generateFreteCode(),
        clienteId: cliente.id,
        motoristaId: motorista ? motorista.id : null,
        ...freteData
      });
      
      console.log(`✅ Frete criado: ${frete.codigo} - ${frete.status} - ${frete.cargoType}`);
    }
    
    // Verificar fretes criados
    const totalFretes = await Frete.count();
    const fretesAtivos = await Frete.count({ where: { status: ['aceito', 'em_transito'] } });
    const fretesConcluidos = await Frete.count({ where: { status: 'entregue' } });
    const fretesSolicitados = await Frete.count({ where: { status: 'solicitado' } });
    
    console.log('\n📊 Resumo dos fretes criados:');
    console.log(`   Total: ${totalFretes}`);
    console.log(`   Ativos: ${fretesAtivos}`);
    console.log(`   Concluídos: ${fretesConcluidos}`);
    console.log(`   Solicitados: ${fretesSolicitados}`);
    
    console.log('\n✅ Fretes criados com sucesso!');
    
  } catch (err) {
    console.error('❌ Erro ao criar fretes:', err);
  } finally {
    await sequelize.close();
  }
}

createFretes();

