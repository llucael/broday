const { sequelize } = require('./config/database');

async function updateFretesRemoveMotorista() {
    try {
        await sequelize.authenticate();
        console.log('Conectado ao banco de dados');
        
        // Atualizar os fretes aceitos para remover o motorista_id
        const [result] = await sequelize.query(`
            UPDATE fretes 
            SET motorista_id = NULL, updated_at = ?
            WHERE status = 'aceito' AND motorista_id IS NOT NULL
        `, {
            replacements: [new Date().toISOString()]
        });
        
        console.log('✅ Fretes aceitos atualizados!');
        
        // Listar os fretes aceitos sem motorista
        const [fretes] = await sequelize.query(`
            SELECT codigo, status, cargo_type, cargo_value, origin_city, destination_city, motorista_id
            FROM fretes 
            WHERE status = 'aceito' 
            ORDER BY created_at DESC
        `);
        
        console.log('\n🚛 Fretes ACEITOS (disponíveis para motoristas):');
        console.log('═══════════════════════════════════════════════════════════════');
        
        fretes.forEach((frete, index) => {
            console.log(`${index + 1}. ${frete.codigo}`);
            console.log(`   📦 Carga: ${frete.cargo_type}`);
            console.log(`   💰 Valor: R$ ${parseFloat(frete.cargo_value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
            console.log(`   🗺️  Rota: ${frete.origin_city} → ${frete.destination_city}`);
            console.log(`   👤 Motorista: ${frete.motorista_id ? `ID ${frete.motorista_id}` : '❌ DISPONÍVEL PARA ACEITAR'}`);
            console.log(`   📊 Status: ${frete.status.toUpperCase()}`);
            console.log('───────────────────────────────────────────────────────────────');
        });
        
        console.log(`\n📊 Total de fretes aceitos disponíveis: ${fretes.filter(f => !f.motorista_id).length}`);
        console.log('💡 Estes fretes aparecerão na lista "Fretes Disponíveis" para todos os motoristas');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

updateFretesRemoveMotorista();