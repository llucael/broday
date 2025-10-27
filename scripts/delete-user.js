const { sequelize } = require('../config/database');

async function deleteUser() {
  try {
    console.log('🔄 Removendo usuário whoidklol@gmail.com...');
    
    await sequelize.query(`
      DELETE FROM users WHERE email = 'whoidklol@gmail.com';
    `);
    
    console.log('✅ Usuário removido com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao remover usuário:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

deleteUser()
  .then(() => {
    console.log('🎉 Usuário removido!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });

