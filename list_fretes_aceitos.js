const { sequelize } = require('./config/database');

async function listFretesAceitos() {
    try {
        const [fretes] = await sequelize.query(`
            SELECT codigo, status, cargo_type, cargo_value, origin_city, destination_city, created_at 
            FROM fretes 
            WHERE status = 'aceito' 
            ORDER BY created_at DESC
        `);
        
        console.log('🚛 Fretes com status ACEITO:');
        console.log('═══════════════════════════════════════════════════════════════');
        
        fretes.forEach((frete, index) => {
            console.log(`${index + 1}. ${frete.codigo}`);
            console.log(`   📦 Carga: ${frete.cargo_type}`);
            console.log(`   💰 Valor: R$ ${parseFloat(frete.cargo_value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
            console.log(`   🗺️  Rota: ${frete.origin_city} → ${frete.destination_city}`);
            console.log(`   📅 Criado em: ${new Date(frete.created_at).toLocaleString('pt-BR')}`);
            console.log('───────────────────────────────────────────────────────────────');
        });
        
        console.log(`\n📊 Total de fretes aceitos: ${fretes.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

listFretesAceitos();