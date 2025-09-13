const { sequelize, User } = require('../models');

async function createTestUsers() {
  try {
    console.log('👥 Criando usuários de teste...');
    
    // Verificar se usuários já existem
    const existingUsers = await User.findAll({
      where: {
        email: ['cliente@broday.com', 'motorista@broday.com']
      }
    });
    
    if (existingUsers.length > 0) {
      console.log('⚠️  Alguns usuários de teste já existem:');
      existingUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.user_type})`);
      });
    }
    
    // Criar usuário cliente se não existir
    const existingCliente = await User.findOne({
      where: { email: 'cliente@broday.com' }
    });
    
    if (!existingCliente) {
      await User.create({
        email: 'cliente@broday.com',
        password: 'cliente123',
        user_type: 'cliente',
        is_active: true,
        email_verified: true,
      });
      console.log('✅ Usuário cliente criado: cliente@broday.com');
    }
    
    // Criar usuário motorista se não existir
    const existingMotorista = await User.findOne({
      where: { email: 'motorista@broday.com' }
    });
    
    if (!existingMotorista) {
      await User.create({
        email: 'motorista@broday.com',
        password: 'motorista123',
        user_type: 'motorista',
        is_active: true,
        email_verified: true,
      });
      console.log('✅ Usuário motorista criado: motorista@broday.com');
    }
    
    console.log('\n🎯 Usuários de teste disponíveis:');
    console.log('   - Admin: admin@broday.com / admin123');
    console.log('   - Cliente: cliente@broday.com / cliente123');
    console.log('   - Motorista: motorista@broday.com / motorista123');
    
    console.log('\n✅ Usuários de teste criados com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar usuários de teste:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

createTestUsers();
