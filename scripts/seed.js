const { sequelize, User } = require('../models');

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');
    
    // Sincronizar modelos (criar tabelas se não existirem)
    await sequelize.sync({ force: false });
    
    // Verificar se o usuário admin já existe
    const existingAdmin = await User.findOne({
      where: { email: 'admin@broday.com' }
    });
    
    if (existingAdmin) {
      console.log('⚠️  Usuário admin já existe no banco de dados');
      console.log('👥 Usuário existente:');
      console.log('   - Admin: admin@broday.com');
    } else {
      // Criar usuário admin
      await User.create({
        email: 'admin@broday.com',
        password: 'admin123',
        user_type: 'admin',
        is_active: true,
        email_verified: true,
      });
      console.log('✅ Usuário admin criado com sucesso!');
      console.log('👥 Usuários criados:');
      console.log('   - Admin: admin@broday.com');
    }
    
    console.log('✅ Seed concluído com sucesso!');
  } catch (err) {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
