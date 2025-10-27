const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function addEmailVerificationColumns() {
  try {
    console.log('🔄 Adicionando colunas de verificação de email...');
    
    // Query para verificar se as colunas já existem
    const checkColumns = `
      SELECT COUNT(*) as count FROM pragma_table_info('users') 
      WHERE name IN ('email_verification_code', 'email_verification_expires');
    `;
    
    const [results] = await sequelize.query(checkColumns);
    const count = results[0].count;
    
    if (count >= 2) {
      console.log('✅ Colunas de verificação de email já existem no banco de dados');
      return;
    }
    
    // Adicionar coluna email_verification_code
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN email_verification_code TEXT;
      `);
      console.log('✅ Coluna email_verification_code adicionada');
    } catch (err) {
      if (err.message.includes('duplicate column')) {
        console.log('⚠️  Coluna email_verification_code já existe');
      } else {
        throw err;
      }
    }
    
    // Adicionar coluna email_verification_expires
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN email_verification_expires DATETIME;
      `);
      console.log('✅ Coluna email_verification_expires adicionada');
    } catch (err) {
      if (err.message.includes('duplicate column')) {
        console.log('⚠️  Coluna email_verification_expires já existe');
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
addEmailVerificationColumns()
  .then(() => {
    console.log('🎉 Migration executada com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro na migration:', error);
    process.exit(1);
  });

