const { sequelize, Frete, User } = require('../models');

async function checkFretes() {
  try {
    await sequelize.sync();
    
    const fretes = await Frete.findAll({
      include: [
        { model: User, as: 'cliente', attributes: ['email'] },
        { model: User, as: 'motorista', attributes: ['email'] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    console.log('\n🚛 Fretes criados:');
    console.log('='.repeat(80));
    
    fretes.forEach((f, index) => {
      console.log(`\n${index + 1}. 📦 ${f.codigo} - ${f.status.toUpperCase()}`);
      console.log(`   Cliente: ${f.cliente ? f.cliente.email : 'N/A'}`);
      console.log(`   Motorista: ${f.motorista ? f.motorista.email : 'N/A'}`);
      console.log(`   Carga: ${f.cargoType} (${f.cargoWeight}kg)`);
      console.log(`   Origem: ${f.originCity}/${f.originState}`);
      console.log(`   Destino: ${f.destinationCity}/${f.destinationState}`);
      console.log(`   Valor: R$ ${f.cargoValue}`);
      console.log(`   Coleta: ${f.dataColeta ? f.dataColeta.toLocaleDateString('pt-BR') : 'N/A'}`);
      console.log(`   Entrega: ${f.dataEntrega ? f.dataEntrega.toLocaleDateString('pt-BR') : 'N/A'}`);
    });
    
    // Estatísticas por status
    const stats = await Frete.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    console.log('\n📊 Estatísticas por status:');
    console.log('-'.repeat(40));
    stats.forEach(stat => {
      console.log(`   ${stat.status.toUpperCase()}: ${stat.dataValues.count}`);
    });
    
  } catch (err) {
    console.error('❌ Erro ao verificar fretes:', err);
  } finally {
    await sequelize.close();
  }
}

checkFretes();

