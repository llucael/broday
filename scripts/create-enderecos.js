const { sequelize } = require('../config/database');
const { Endereco } = require('../models');
require('dotenv').config();

const createEnderecosTable = async () => {
  try {
    console.log('🔄 Criando tabela de endereços...');
    
    // Criar apenas a tabela de endereços se não existir
    await Endereco.sync();
    
    console.log('✅ Tabela de endereços criada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela de endereços:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

createEnderecosTable();