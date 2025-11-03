const { sequelize } = require('./config/database');

async function testFretesDisponiveis() {
    try {
        await sequelize.authenticate();
        console.log('Conectado ao banco de dados');
        
        // Simular um motorista que tem frete aceito (mas não em trânsito)
        console.log('\n📋 Teste: Motorista com frete aceito pode ver fretes disponíveis?');
        console.log('═══════════════════════════════════════════════════════════════');
        
        // 1. Primeiro, vamos criar um frete aceito para um motorista
        const motoristaId = 2; // ID do motorista para teste
        
        // Verificar se motorista tem fretes
        const [fretesMotorista] = await sequelize.query(`
            SELECT codigo, status, motorista_id 
            FROM fretes 
            WHERE motorista_id = ? 
            ORDER BY created_at DESC
        `, { replacements: [motoristaId] });
        
        console.log(`👤 Motorista ID ${motoristaId}:`);
        if (fretesMotorista.length === 0) {
            console.log('   ❌ Não tem fretes atribuídos');
        } else {
            console.log(`   📦 Tem ${fretesMotorista.length} frete(s):`);
            fretesMotorista.forEach(f => {
                console.log(`      - ${f.codigo}: ${f.status.toUpperCase()}`);
            });
        }
        
        // 2. Verificar se tem frete em trânsito (que bloquearia)
        const [fretesEmTransito] = await sequelize.query(`
            SELECT codigo, status 
            FROM fretes 
            WHERE motorista_id = ? AND status = 'em_transito'
        `, { replacements: [motoristaId] });
        
        console.log(`\n🚛 Fretes em trânsito: ${fretesEmTransito.length}`);
        if (fretesEmTransito.length > 0) {
            console.log('   ⚠️  BLOQUEADO: Motorista está em viagem');
            fretesEmTransito.forEach(f => console.log(`      - ${f.codigo}`));
        } else {
            console.log('   ✅ PERMITIDO: Motorista não está em viagem');
        }
        
        // 3. Verificar fretes disponíveis (aceitos sem motorista)
        const [fretesDisponiveis] = await sequelize.query(`
            SELECT codigo, status, motorista_id, cargo_type, origin_city, destination_city
            FROM fretes 
            WHERE status = 'aceito' AND motorista_id IS NULL
            ORDER BY created_at DESC
        `);
        
        console.log(`\n📋 Fretes disponíveis para aceitar: ${fretesDisponiveis.length}`);
        if (fretesDisponiveis.length === 0) {
            console.log('   ❌ Nenhum frete disponível');
        } else {
            console.log('   ✅ Fretes que devem aparecer para o motorista:');
            fretesDisponiveis.forEach(f => {
                console.log(`      - ${f.codigo}: ${f.cargo_type} (${f.origin_city} → ${f.destination_city})`);
            });
        }
        
        // 4. Simulação da lógica do controller
        console.log('\n🔧 Simulação da lógica do backend:');
        console.log('═══════════════════════════════════════════════════════════════');
        
        const bloqueado = fretesEmTransito.length > 0;
        console.log(`Motorista ${motoristaId} ${bloqueado ? 'NÃO PODE' : 'PODE'} ver fretes disponíveis`);
        console.log(`Motivo: ${bloqueado ? 'Está em viagem' : 'Não está em viagem'}`);
        
        if (!bloqueado) {
            console.log(`\n✅ RESULTADO: Motorista verá ${fretesDisponiveis.length} frete(s) disponível(is)`);
        } else {
            console.log(`\n❌ RESULTADO: Motorista verá 0 fretes (bloqueado por estar em viagem)`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

testFretesDisponiveis();