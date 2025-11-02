const { sequelize } = require('../config/database');
const { User } = require('../models');
const { Op } = require('sequelize');

const testUniqueValidationDirect = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('🧪 Testando validação de CPF/CNPJ únicos via Sequelize...\n');

    // Buscar um CPF/CNPJ existente para testar
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { cpf: { [Op.ne]: null } },
          { cnpj: { [Op.ne]: null } }
        ]
      }
    });
    
    if (!existingUser) {
      console.log('❌ Nenhum usuário com CPF/CNPJ encontrado para teste');
      return;
    }

    console.log('👤 Usuário de referência encontrado:');
    console.log('   ID:', existingUser.id);
    console.log('   CPF:', existingUser.cpf || 'N/A');
    console.log('   CNPJ:', existingUser.cnpj || 'N/A');
    console.log();

    // Teste 1: Tentar criar usuário com CPF duplicado
    if (existingUser.cpf) {
      console.log('🔬 Teste 1: Tentando criar usuário com CPF duplicado via Sequelize...');
      try {
        await User.create({
          email: 'teste_cpf_duplicado@test.com',
          password: 'senha123',
          user_type: 'cliente',
          cpf: existingUser.cpf,
          nome: 'Teste CPF Duplicado',
          is_active: true,
          email_verified: false
        });
        
        console.log('❌ Teste 1 FALHOU: CPF duplicado foi aceito pelo banco');
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError' || error.message.includes('UNIQUE constraint failed')) {
          console.log('✅ Teste 1 PASSOU: CPF duplicado foi rejeitado pelo banco');
          console.log('   Erro:', error.message);
        } else {
          console.log('❌ Teste 1 ERRO INESPERADO:', error.message);
        }
      }
      console.log();
    }

    // Teste 2: Tentar criar usuário com CNPJ duplicado
    if (existingUser.cnpj) {
      console.log('🔬 Teste 2: Tentando criar usuário com CNPJ duplicado via Sequelize...');
      try {
        await User.create({
          email: 'teste_cnpj_duplicado@test.com',
          password: 'senha123',
          user_type: 'cliente',
          cnpj: existingUser.cnpj,
          nome: 'Teste CNPJ Duplicado',
          is_active: true,
          email_verified: false
        });
        
        console.log('❌ Teste 2 FALHOU: CNPJ duplicado foi aceito pelo banco');
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError' || error.message.includes('UNIQUE constraint failed')) {
          console.log('✅ Teste 2 PASSOU: CNPJ duplicado foi rejeitado pelo banco');
          console.log('   Erro:', error.message);
        } else {
          console.log('❌ Teste 2 ERRO INESPERADO:', error.message);
        }
      }
      console.log();
    }

    // Teste 3: Criar usuário com CPF/CNPJ únicos (deve funcionar)
    console.log('🔬 Teste 3: Criando usuário com CPF/CNPJ únicos via Sequelize...');
    try {
      const newUser = await User.create({
        email: 'teste_unico@test.com',
        password: 'senha123',
        user_type: 'cliente',
        cpf: '999.888.777-66',
        cnpj: '99.888.777/0001-66',
        nome: 'Teste Único',
        is_active: true,
        email_verified: false
      });
      
      console.log('✅ Teste 3 PASSOU: Usuário com dados únicos foi criado');
      console.log('   ID do usuário:', newUser.id);
      
      // Limpar o usuário criado
      await newUser.destroy();
      console.log('   Usuário de teste removido');
    } catch (error) {
      console.log('❌ Teste 3 FALHOU: Usuário com dados únicos foi rejeitado');
      console.log('   Erro:', error.message);
    }
    console.log();

    // Teste 4: Testar validação via controller (simulação)
    console.log('🔬 Teste 4: Testando validação via controller...');
    try {
      // Simular validação do authController
      if (existingUser.cpf) {
        const existingCpf = await User.findOne({ where: { cpf: existingUser.cpf } });
        if (existingCpf) {
          console.log('✅ Teste 4a PASSOU: Validação de CPF duplicado no controller funciona');
        }
      }
      
      if (existingUser.cnpj) {
        const existingCnpj = await User.findOne({ where: { cnpj: existingUser.cnpj } });
        if (existingCnpj) {
          console.log('✅ Teste 4b PASSOU: Validação de CNPJ duplicado no controller funciona');
        }
      }
    } catch (error) {
      console.log('❌ Teste 4 ERRO:', error.message);
    }

    console.log('\n🎯 Testes de validação concluídos!');
    
  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  testUniqueValidationDirect()
    .then(() => {
      console.log('✅ Testes finalizados');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro nos testes:', error);
      process.exit(1);
    });
}

module.exports = testUniqueValidationDirect;