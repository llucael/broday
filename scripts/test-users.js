const { sequelize } = require('../config/database');

async function createTestUsers() {
  try {
    console.log('👥 Criando usuários de teste...');
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');
    
    // Criar usuários diretamente via SQL
    const users = [
      {
        email: 'cliente@broday.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // cliente123
        user_type: 'cliente',
        is_active: 1,
        email_verified: 1
      },
      {
        email: 'motorista@broday.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // motorista123
        user_type: 'motorista',
        is_active: 1,
        email_verified: 1
      }
    ];
    
    for (const user of users) {
      // Verificar se usuário já existe
      const [existing] = await sequelize.query(
        'SELECT * FROM users WHERE email = ?',
        { replacements: [user.email] }
      );
      
      if (existing.length === 0) {
        await sequelize.query(
          'INSERT INTO users (email, password, user_type, is_active, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
          { replacements: [user.email, user.password, user.user_type, user.is_active, user.email_verified] }
        );
        console.log(`✅ Usuário ${user.user_type} criado: ${user.email}`);
      } else {
        console.log(`⚠️  Usuário ${user.user_type} já existe: ${user.email}`);
      }
    }
    
    console.log('\n🎯 Usuários de teste disponíveis:');
    console.log('   - Admin: admin@broday.com / admin123');
    console.log('   - Cliente: cliente@broday.com / cliente123');
    console.log('   - Motorista: motorista@broday.com / motorista123');
    
    console.log('\n✅ Usuários de teste criados com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar usuários de teste:', err);
  } finally {
    await sequelize.close();
  }
}

createTestUsers();
