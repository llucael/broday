const { sequelize, Localizacao } = require('../models');

async function createLocalizacoesTable() {
  try {
    console.log('Criando tabela de localizações...');
    
    // Sincronizar o modelo com o banco de dados
    await Localizacao.sync({ force: false });
    
    console.log('✅ Tabela de localizações criada com sucesso!');
    
    // Verificar se a tabela foi criada
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    console.log('Tabelas existentes:', tableExists);
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela de localizações:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createLocalizacoesTable();
}

module.exports = createLocalizacoesTable;
