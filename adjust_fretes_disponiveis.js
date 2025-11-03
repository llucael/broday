const { sequelize } = require('./config/database');

async function adjustFretesDisponiveis() {
    try {
        await sequelize.authenticate();
        console.log('Conectado ao banco de dados');
        
        // Remover data de coleta dos fretes aceitos sem motorista
        await sequelize.query(`
            UPDATE fretes 
            SET data_coleta = NULL, updated_at = ?
            WHERE status = 'aceito' AND motorista_id IS NULL
        `, {
            replacements: [new Date().toISOString()]
        });
        
        console.log('✅ Data de coleta removida dos fretes disponíveis');
        
        // Verificar resultado final
        const [fretes] = await sequelize.query(`
            SELECT codigo, status, cargo_type, motorista_id, data_coleta, data_coleta_limite
            FROM fretes 
            WHERE status = 'aceito' AND motorista_id IS NULL
            ORDER BY created_at DESC
        `);
        
        console.log('\n📋 Status final dos fretes disponíveis:');
        console.log('═══════════════════════════════════════════════════════════════');
        
        fretes.forEach((frete, index) => {
            console.log(`${index + 1}. ${frete.codigo}`);
            console.log(`   📦 Carga: ${frete.cargo_type}`);
            console.log(`   📊 Status: ${frete.status.toUpperCase()}`);
            console.log(`   👤 Motorista: ${frete.motorista_id ? `ID ${frete.motorista_id}` : '❌ NENHUM ATRIBUÍDO'}`);
            console.log(`   📅 Coleta realizada: ${frete.data_coleta ? new Date(frete.data_coleta).toLocaleString('pt-BR') : '❌ AGUARDANDO COLETA'}`);
            console.log(`   ⏰ Limite para coleta: ${new Date(frete.data_coleta_limite).toLocaleString('pt-BR')}`);
            console.log('───────────────────────────────────────────────────────────────');
        });
        
        console.log('\n🎯 RESULTADO:');
        console.log('✅ Fretes aceitos pelo admin');
        console.log('❌ Sem motorista atribuído');
        console.log('❌ Sem data de coleta');
        console.log('📱 Aparecerão como "Fretes Disponíveis" para todos os motoristas');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

adjustFretesDisponiveis();