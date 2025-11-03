const { sequelize } = require('./config/database');

// Função para gerar código de frete único
function generateFreteCode() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FR${timestamp}${random}`;
}

async function createFreteAceito() {
    try {
        await sequelize.authenticate();
        console.log('Conectado ao banco de dados');
        
        const codigo = generateFreteCode();
        const now = new Date().toISOString();
        
        // Inserir frete diretamente com SQL
        const [result] = await sequelize.query(`
            INSERT INTO fretes (
                codigo, cliente_id, motorista_id, status,
                sender_name, sender_document, sender_phone, sender_email,
                recipient_name, recipient_document, recipient_phone, recipient_email,
                cargo_type, cargo_value, cargo_weight, cargo_dimensions,
                origin_cep, origin_street, origin_number, origin_complement, origin_city, origin_state,
                destination_cep, destination_street, destination_number, destination_complement, destination_city, destination_state,
                observacoes, data_coleta_limite, data_entrega_limite, data_coleta, data_entrega,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?
            )
        `, {
            replacements: [
                codigo, 1, 3, 'aceito',
                'Metalúrgica Industrial Ltda', '98.765.432/0001-10', '(21) 97654-3210', 'comercial@metalurgica.com.br',
                'Maria Oliveira Costa', '987.654.321-00', '(21) 88888-7777', 'maria.oliveira@email.com',
                'Peças Metálicas', 8500.00, 150.0, '120x80x50 cm',
                '20090-003', 'Av. Presidente Vargas', '642', 'Galpão 15', 'Rio de Janeiro', 'RJ',
                '04038-001', 'Av. Faria Lima', '2232', 'Conj. 801', 'São Paulo', 'SP',
                'Material pesado - equipamento de içamento necessário. Produto industrial.',
                '2025-11-06 16:00:00', '2025-11-10 14:00:00', '2025-11-05 14:20:00', null,
                now, now
            ]
        });
        
        console.log('✅ Novo frete criado com sucesso!');
        console.log('📋 Detalhes do frete:');
        console.log(`   🔢 Código: ${codigo}`);
        console.log(`   📊 Status: aceito`);
        console.log(`   👤 Cliente ID: 1`);
        console.log(`   🚛 Motorista ID: 3`);
        console.log(`   📦 Carga: Peças Metálicas (150kg)`);
        console.log(`   📏 Dimensões: 120x80x50 cm`);
        console.log(`   💰 Valor: R$ 8.500,00`);
        console.log(`   📍 Origem: Rio de Janeiro/RJ - Av. Presidente Vargas, 642`);
        console.log(`   🎯 Destino: São Paulo/SP - Av. Faria Lima, 2232`);
        console.log(`   📅 Coleta: 05/11/2025 às 14:20`);
        console.log(`   📅 Entrega limite: 10/11/2025 às 14:00`);
        console.log(`   💬 Observações: Material pesado - equipamento de içamento necessário. Produto industrial.`);
        
        // Verificar se foi criado
        const [verification] = await sequelize.query(
            'SELECT * FROM fretes WHERE codigo = ?',
            { replacements: [codigo] }
        );
        
        if (verification.length > 0) {
            console.log('\n🔍 Verificação: Frete encontrado no banco de dados!');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar frete:', error);
        process.exit(1);
    }
}

createFreteAceito();