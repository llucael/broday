const { sequelize } = require('../config/database');

async function addFreteDateColumns() {
  try {
    console.log('🔄 Adicionando colunas de datas limites ao Frete...');
    
    // Adicionar coluna data_coleta_limite
    try {
      await sequelize.query(`
        ALTER TABLE fretes 
        ADD COLUMN data_coleta_limite DATETIME;
      `);
      console.log('✅ Coluna data_coleta_limite adicionada');
    } catch (err) {
      if (err.message.includes('duplicate column')) {
        console.log('⚠️  Coluna data_coleta_limite já existe');
      } else {
        throw err;
      }
    }
    
    // Adicionar coluna data_entrega_limite
    try {
      await sequelize.query(`
        ALTER TABLE fretes 
        ADD COLUMN data_entrega_limite DATETIME;
      `);
      console.log('✅ Coluna data_entrega_limite adicionada');
    } catch (err) {
      if (err.message.includes('duplicate column')) {
        console.log('⚠️  Coluna data_entrega_limite já existe');
      } else {
        throw err;
      }
    }
    
    console.log('✅ Migration concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Executar migration
addFreteDateColumns()
  .then(() => {
    console.log('🎉 Migration executada com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro na migration:', error);
    process.exit(1);
  });

