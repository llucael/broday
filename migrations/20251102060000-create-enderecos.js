'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('enderecos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nome do endereço (ex: Casa, Trabalho, etc.)'
      },
      rua: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      numero: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      complemento: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      cidade: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      estado: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      cep: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      is_principal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Indica se é o endereço principal do cliente'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Criar índices
    await queryInterface.addIndex('enderecos', ['cliente_id'], {
      name: 'enderecos_cliente_id'
    });

    await queryInterface.addIndex('enderecos', ['cliente_id', 'is_principal'], {
      name: 'enderecos_cliente_principal'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('enderecos');
  }
};