const { sequelize } = require('../config/database');
const { User } = require('../models');

const testUniqueValidation = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('🧪 Testando validação de CPF/CNPJ únicos...\n');

    // Buscar um CPF/CNPJ existente para testar
    const [existingUser] = await sequelize.query(
      "SELECT cpf, cnpj FROM users WHERE (cpf IS NOT NULL AND cpf != '') OR (cnpj IS NOT NULL AND cnpj != '') LIMIT 1"
    );
    
    if (existingUser.length === 0) {
      console.log('❌ Nenhum usuário com CPF/CNPJ encontrado para teste');
      return;
    }

    const testUser = existingUser[0];
    console.log('👤 Usuário de referência encontrado:');
    console.log('   CPF:', testUser.cpf || 'N/A');
    console.log('   CNPJ:', testUser.cnpj || 'N/A');
    console.log();

    // Teste 1: Tentar criar usuário com CPF duplicado
    if (testUser.cpf) {
      console.log('🔬 Teste 1: Tentando criar usuário com CPF duplicado...');
      try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'teste_cpf_duplicado@test.com',
            password: 'senha123',
            userType: 'cliente',
            cpf: testUser.cpf,
            nome: 'Teste CPF Duplicado'
          })
        });

        const result = await response.json();
        
        if (!response.ok && result.message.includes('CPF já está em uso')) {
          console.log('✅ Teste 1 PASSOU: CPF duplicado foi rejeitado');
          console.log('   Mensagem:', result.message);
        } else {
          console.log('❌ Teste 1 FALHOU: CPF duplicado foi aceito');
          console.log('   Resposta:', result);
        }
      } catch (error) {
        console.log('❌ Teste 1 ERRO:', error.message);
      }
      console.log();
    }

    // Teste 2: Tentar criar usuário com CNPJ duplicado
    if (testUser.cnpj) {
      console.log('🔬 Teste 2: Tentando criar usuário com CNPJ duplicado...');
      try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'teste_cnpj_duplicado@test.com',
            password: 'senha123',
            userType: 'cliente',
            cnpj: testUser.cnpj,
            nome: 'Teste CNPJ Duplicado'
          })
        });

        const result = await response.json();
        
        if (!response.ok && result.message.includes('CNPJ já está em uso')) {
          console.log('✅ Teste 2 PASSOU: CNPJ duplicado foi rejeitado');
          console.log('   Mensagem:', result.message);
        } else {
          console.log('❌ Teste 2 FALHOU: CNPJ duplicado foi aceito');
          console.log('   Resposta:', result);
        }
      } catch (error) {
        console.log('❌ Teste 2 ERRO:', error.message);
      }
      console.log();
    }

    // Teste 3: Criar usuário com CPF/CNPJ únicos (deve funcionar)
    console.log('🔬 Teste 3: Criando usuário com CPF/CNPJ únicos...');
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'teste_unico@test.com',
          password: 'senha123',
          userType: 'cliente',
          cpf: '999.888.777-66',
          cnpj: '99.888.777/0001-66',
          nome: 'Teste Único'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Teste 3 PASSOU: Usuário com dados únicos foi criado');
        console.log('   ID do usuário:', result.data?.user?.id);
        
        // Limpar o usuário criado
        if (result.data?.user?.id) {
          await sequelize.query('DELETE FROM users WHERE id = ?', {
            replacements: [result.data.user.id]
          });
          console.log('   Usuário de teste removido');
        }
      } else {
        console.log('❌ Teste 3 FALHOU: Usuário com dados únicos foi rejeitado');
        console.log('   Resposta:', result);
      }
    } catch (error) {
      console.log('❌ Teste 3 ERRO:', error.message);
    }

    console.log('\n🎯 Testes de validação concluídos!');
    
  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  testUniqueValidation()
    .then(() => {
      console.log('✅ Testes finalizados');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro nos testes:', error);
      process.exit(1);
    });
}

module.exports = testUniqueValidation;