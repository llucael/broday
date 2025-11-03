const { Sequelize } = require('sequelize');
const path = require('path');

// Importar modelos
const { sequelize } = require('./config/database');
const Frete = require('./models/Frete');

// Função para gerar código de frete único
function generateFreteCode() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FR${timestamp}${random}`;
}

async function createFreteAceito() {
    try {
        // Sincronizar modelos primeiro
        await sequelize.sync({ force: false });
        console.log('Modelos sincronizados');
        
        // Dados do novo frete
        const novoFrete = {
            codigo: generateFreteCode(),
            cliente_id: 1, // ID do cliente (assumindo que existe)
            motorista_id: 2, // ID do motorista (assumindo que existe)
            status: 'aceito',
            
            // Informações do remetente
            sender_name: 'Empresa ABC Ltda',
            sender_document: '12.345.678/0001-90',
            sender_phone: '(11) 98765-4321',
            sender_email: 'contato@empresaabc.com.br',
            
            // Informações do destinatário
            recipient_name: 'João Silva Santos',
            recipient_document: '123.456.789-01',
            recipient_phone: '(11) 99999-8888',
            recipient_email: 'joao.silva@email.com',
            
            // Informações da carga
            cargo_type: 'Eletrônicos',
            cargo_value: 15000.00,
            cargo_weight: 25.5,
            cargo_dimensions: '80x60x40 cm',
            
            // Endereço de origem
            origin_cep: '01310-100',
            origin_street: 'Av. Paulista',
            origin_number: '1578',
            origin_complement: 'Andar 10, Sala 1001',
            origin_city: 'São Paulo',
            origin_state: 'SP',
            
            // Endereço de destino
            destination_cep: '20040-020',
            destination_street: 'Av. Rio Branco',
            destination_number: '156',
            destination_complement: 'Centro Empresarial, Torre A',
            destination_city: 'Rio de Janeiro',
            destination_state: 'RJ',
            
            // Observações e datas
            observacoes: 'Carga frágil - manuseio cuidadoso. Entrega urgente.',
            data_coleta_limite: new Date('2025-11-05'),
            data_entrega_limite: new Date('2025-11-08'),
            data_coleta: new Date('2025-11-04'), // Já coletado
            data_entrega: null // Ainda não entregue
        };
        
        // Criar o frete
        const freteCriado = await Frete.create(novoFrete);
        
        console.log('✅ Novo frete criado com sucesso!');
        console.log('📋 Detalhes do frete:');
        console.log(`   🔢 Código: ${freteCriado.codigo}`);
        console.log(`   📊 Status: ${freteCriado.status}`);
        console.log(`   👤 Cliente ID: ${freteCriado.cliente_id}`);
        console.log(`   🚛 Motorista ID: ${freteCriado.motorista_id}`);
        console.log(`   📦 Carga: ${freteCriado.cargo_type} (${freteCriado.cargo_weight}kg)`);
        console.log(`   💰 Valor: R$ ${freteCriado.cargo_value}`);
        console.log(`   📍 Origem: ${freteCriado.origin_city}/${freteCriado.origin_state}`);
        console.log(`   🎯 Destino: ${freteCriado.destination_city}/${freteCriado.destination_state}`);
        console.log(`   📅 Coleta: ${freteCriado.data_coleta ? freteCriado.data_coleta.toLocaleDateString('pt-BR') : 'Não realizada'}`);
        console.log(`   📅 Entrega limite: ${freteCriado.data_entrega_limite.toLocaleDateString('pt-BR')}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar frete:', error);
        process.exit(1);
    }
}

createFreteAceito();