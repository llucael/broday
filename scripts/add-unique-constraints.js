const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const addUniqueConstraints = async () => {
  try {
    console.log('🔄 Adicionando constraints de unicidade para CPF e CNPJ...');
    
    // Verificar se já existem CPFs duplicados antes de adicionar a constraint
    const [duplicateCpfs] = await sequelize.query(`
      SELECT cpf, COUNT(*) as count 
      FROM users 
      WHERE cpf IS NOT NULL AND cpf != '' 
      GROUP BY cpf 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateCpfs.length > 0) {
      console.warn('⚠️  CPFs duplicados encontrados:');
      duplicateCpfs.forEach(dup => {
        console.log(`   CPF: ${dup.cpf} (${dup.count} ocorrências)`);
      });
      console.log('   Removendo duplicatas mantendo apenas o primeiro usuário de cada CPF...');
      
      for (const dup of duplicateCpfs) {
        // Manter apenas o primeiro usuário com este CPF
        const [users] = await sequelize.query(`
          SELECT id FROM users WHERE cpf = ? ORDER BY created_at ASC
        `, { replacements: [dup.cpf] });
        
        if (users.length > 1) {
          const keepUserId = users[0].id;
          const deleteUserIds = users.slice(1).map(u => u.id);
          
          console.log(`   Mantendo usuário ID ${keepUserId}, removendo CPF dos usuários: ${deleteUserIds.join(', ')}`);
          
          // Limpar CPF dos usuários duplicados (não deletar os usuários)
          await sequelize.query(`
            UPDATE users SET cpf = NULL WHERE id IN (${deleteUserIds.map(() => '?').join(',')})
          `, { replacements: deleteUserIds });
        }
      }
    }
    
    // Verificar se já existem CNPJs duplicados
    const [duplicateCnpjs] = await sequelize.query(`
      SELECT cnpj, COUNT(*) as count 
      FROM users 
      WHERE cnpj IS NOT NULL AND cnpj != '' 
      GROUP BY cnpj 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateCnpjs.length > 0) {
      console.warn('⚠️  CNPJs duplicados encontrados:');
      duplicateCnpjs.forEach(dup => {
        console.log(`   CNPJ: ${dup.cnpj} (${dup.count} ocorrências)`);
      });
      console.log('   Removendo duplicatas mantendo apenas o primeiro usuário de cada CNPJ...');
      
      for (const dup of duplicateCnpjs) {
        // Manter apenas o primeiro usuário com este CNPJ
        const [users] = await sequelize.query(`
          SELECT id FROM users WHERE cnpj = ? ORDER BY created_at ASC
        `, { replacements: [dup.cnpj] });
        
        if (users.length > 1) {
          const keepUserId = users[0].id;
          const deleteUserIds = users.slice(1).map(u => u.id);
          
          console.log(`   Mantendo usuário ID ${keepUserId}, removendo CNPJ dos usuários: ${deleteUserIds.join(', ')}`);
          
          // Limpar CNPJ dos usuários duplicados (não deletar os usuários)
          await sequelize.query(`
            UPDATE users SET cnpj = NULL WHERE id IN (${deleteUserIds.map(() => '?').join(',')})
          `, { replacements: deleteUserIds });
        }
      }
    }
    
    // Agora adicionar as constraints de unicidade
    try {
      console.log('📝 Adicionando constraint de unicidade para CPF...');
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_cpf ON users(cpf) WHERE cpf IS NOT NULL AND cpf != ''
      `);
      console.log('✅ Constraint de unicidade para CPF adicionada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Constraint de unicidade para CPF já existe');
      } else {
        throw error;
      }
    }
    
    try {
      console.log('📝 Adicionando constraint de unicidade para CNPJ...');
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_cnpj ON users(cnpj) WHERE cnpj IS NOT NULL AND cnpj != ''
      `);
      console.log('✅ Constraint de unicidade para CNPJ adicionada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Constraint de unicidade para CNPJ já existe');
      } else {
        throw error;
      }
    }
    
    console.log('🎉 Constraints de unicidade aplicadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar constraints:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  addUniqueConstraints()
    .then(() => {
      console.log('✅ Migração concluída com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na migração:', error);
      process.exit(1);
    });
}

module.exports = addUniqueConstraints;