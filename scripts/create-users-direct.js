const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

async function createUsers() {
  try {
    console.log('🔐 Criando usuários de teste...');
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');
    
    // Hash das senhas
    const clientePassword = await bcrypt.hash('cliente123', 10);
    const motoristaPassword = await bcrypt.hash('motorista123', 10);
    
    // Verificar e criar usuário cliente
    const [clienteExists] = await sequelize.query(
      'SELECT * FROM users WHERE email = ?',
      { replacements: ['cliente@broday.com'] }
    );
    
    if (clienteExists.length === 0) {
      await sequelize.query(
        'INSERT INTO users (email, password, user_type, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))',
        { replacements: ['cliente@broday.com', clientePassword, 'cliente', 1] }
      );
      console.log('✅ Usuário cliente criado: cliente@broday.com');
    } else {
      console.log('⚠️  Usuário cliente já existe: cliente@broday.com');
    }
    
    // Verificar e criar usuário motorista
    const [motoristaExists] = await sequelize.query(
      'SELECT * FROM users WHERE email = ?',
      { replacements: ['motorista@broday.com'] }
    );
    
    if (motoristaExists.length === 0) {
      await sequelize.query(
        'INSERT INTO users (email, password, user_type, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))',
        { replacements: ['motorista@broday.com', motoristaPassword, 'motorista', 1] }
      );
      console.log('✅ Usuário motorista criado: motorista@broday.com');
    } else {
      console.log('⚠️  Usuário motorista já existe: motorista@broday.com');
    }
    
    // Criar usuários adicionais de exemplo
    const usuariosAdicionais = [
      {
        email: 'maria@logistica.com',
        password: await bcrypt.hash('cliente123', 10),
        user_type: 'cliente'
      },
      {
        email: 'pedro@cargas.com',
        password: await bcrypt.hash('cliente123', 10),
        user_type: 'cliente'
      },
      {
        email: 'ana@motorista.com',
        password: await bcrypt.hash('motorista123', 10),
        user_type: 'motorista'
      },
      {
        email: 'roberto@motorista.com',
        password: await bcrypt.hash('motorista123', 10),
        user_type: 'motorista'
      }
    ];

    for (const usuario of usuariosAdicionais) {
      const [exists] = await sequelize.query(
        'SELECT * FROM users WHERE email = ?',
        { replacements: [usuario.email] }
      );
      
      if (exists.length === 0) {
        await sequelize.query(
          'INSERT INTO users (email, password, user_type, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))',
          { replacements: [usuario.email, usuario.password, usuario.user_type, 1] }
        );
        console.log(`✅ Usuário ${usuario.user_type} criado: ${usuario.email}`);
      } else {
        console.log(`⚠️  Usuário ${usuario.user_type} já existe: ${usuario.email}`);
      }
    }

    // Listar todos os usuários
    const [users] = await sequelize.query('SELECT email, user_type FROM users');
    console.log('\n👥 Usuários no banco:');
    users.forEach(user => {
      console.log(`   - ${user.email} - ${user.user_type}`);
    });
    
    console.log('\n🎯 Credenciais de teste:');
    console.log('   - Admin: admin@broday.com / admin123');
    console.log('   - Cliente: cliente@broday.com / cliente123');
    console.log('   - Motorista: motorista@broday.com / motorista123');
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await sequelize.close();
  }
}

createUsers();
