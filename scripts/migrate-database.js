const { sequelize } = require('../config/database');
const { User, Frete } = require('../models');

async function migrateDatabase() {
  try {
    console.log('🔄 Iniciando migração do banco de dados...');
    
    // Sincronizar modelos com o banco
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Modelos sincronizados com o banco de dados');
    
    // Verificar se existem dados na tabela users
    const userCount = await User.count();
    console.log(`📊 Total de usuários encontrados: ${userCount}`);
    
    // Verificar se existem dados na tabela fretes
    const freteCount = await Frete.count();
    console.log(`📊 Total de fretes encontrados: ${freteCount}`);
    
    // Se não há usuários, criar usuários de teste
    if (userCount === 0) {
      console.log('👤 Criando usuários de teste...');
      
      const testUsers = [
        {
          email: 'admin@broday.com',
          password: 'admin123',
          user_type: 'admin',
          name: 'Administrador',
          is_active: true,
          email_verified: true
        },
        {
          email: 'cliente@broday.com',
          password: 'cliente123',
          user_type: 'cliente',
          name: 'Cliente Teste',
          telefone: '(42) 99999-9999',
          cpf: '123.456.789-00',
          is_active: true,
          email_verified: true
        },
        {
          email: 'motorista@broday.com',
          password: 'motorista123',
          user_type: 'motorista',
          name: 'Motorista Teste',
          telefone: '(42) 88888-8888',
          cpf: '987.654.321-00',
          is_active: true,
          email_verified: true
        }
      ];
      
      for (const userData of testUsers) {
        await User.create(userData);
        console.log(`✅ Usuário criado: ${userData.email}`);
      }
    }
    
    // Se não há fretes, criar fretes de teste
    if (freteCount === 0) {
      console.log('🚛 Criando fretes de teste...');
      
      const cliente = await User.findOne({ where: { user_type: 'cliente' } });
      
      if (cliente) {
        const testFretes = [
          {
            cliente_id: cliente.id,
            tipo_carga: 'Eletrônicos',
            peso: 15.5,
            valor: 150.00,
            origem: 'Rua das Flores, 123, Ponta Grossa - PR',
            destino: 'Av. Brasil, 456, Curitiba - PR',
            origem_endereco: 'Rua das Flores, 123',
            origem_cidade: 'Ponta Grossa',
            origem_estado: 'PR',
            origem_cep: '84010-000',
            destino_endereco: 'Av. Brasil, 456',
            destino_cidade: 'Curitiba',
            destino_estado: 'PR',
            destino_cep: '80000-000',
            data_coleta: new Date(),
            status: 'solicitado',
            codigo: `FR${Date.now()}001`
          },
          {
            cliente_id: cliente.id,
            tipo_carga: 'Móveis',
            peso: 50.0,
            valor: 300.00,
            origem: 'Rua Central, 789, Ponta Grossa - PR',
            destino: 'Rua Comercial, 321, São Paulo - SP',
            origem_endereco: 'Rua Central, 789',
            origem_cidade: 'Ponta Grossa',
            origem_estado: 'PR',
            origem_cep: '84020-000',
            destino_endereco: 'Rua Comercial, 321',
            destino_cidade: 'São Paulo',
            destino_estado: 'SP',
            destino_cep: '01000-000',
            data_coleta: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
            status: 'aceito',
            codigo: `FR${Date.now()}002`
          }
        ];
        
        for (const freteData of testFretes) {
          await Frete.create(freteData);
          console.log(`✅ Frete criado: ${freteData.codigo}`);
        }
      }
    }
    
    console.log('🎉 Migração concluída com sucesso!');
    console.log('\n📋 Credenciais de teste:');
    console.log('Admin: admin@broday.com / admin123');
    console.log('Cliente: cliente@broday.com / cliente123');
    console.log('Motorista: motorista@broday.com / motorista123');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Executar migração se o script for chamado diretamente
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('✅ Script de migração executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar migração:', error);
      process.exit(1);
    });
}

module.exports = { migrateDatabase };







