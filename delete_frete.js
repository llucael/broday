require('dotenv').config();
const { Frete } = require('./models');
const { sequelize } = require('./config/database');

async function deleteFrete() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco de dados');

        const codigo = 'FR17621968607026F03Y';
        
        // Buscar o frete
        const frete = await Frete.findOne({ where: { codigo } });
        
        if (!frete) {
            console.log(`❌ Frete com código ${codigo} não encontrado`);
            process.exit(1);
        }

        console.log(`📦 Frete encontrado:`, {
            id: frete.id,
            codigo: frete.codigo,
            status: frete.status,
            cliente_id: frete.cliente_id,
            origem: `${frete.origin_city}/${frete.origin_state}`,
            destino: `${frete.destination_city}/${frete.destination_state}`
        });

        // Excluir o frete
        await frete.destroy();
        console.log(`✅ Frete ${codigo} excluído com sucesso!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao excluir frete:', error);
        process.exit(1);
    }
}

deleteFrete();
