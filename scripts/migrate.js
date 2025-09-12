const { sequelize } = require('../config/database');
require('dotenv').config();

const migrate = async () => {
  try {
    console.log('🔄 Iniciando migração do banco de dados...');
    
    // Sincronizar todos os modelos
    await sequelize.sync({ force: true });
    
    console.log('✅ Migração concluída com sucesso!');
    console.log('📊 Tabelas criadas:');
    console.log('   - users');
    console.log('   - motoristas');
    console.log('   - clientes');
    console.log('   - admins');
    console.log('   - fretes');
    console.log('   - veiculos');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

migrate();
