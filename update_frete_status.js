const { Sequelize } = require('sequelize');
const path = require('path');

// Importar modelos
const { sequelize } = require('./config/database');
const Frete = require('./models/Frete');

async function updateFreteStatus() {
    try {
        // Sincronizar modelos primeiro
        await sequelize.sync({ force: false });
        console.log('Modelos sincronizados');
        
        // Buscar o frete pelo código
        const frete = await Frete.findOne({ where: { codigo: 'FR160717FI73' } });
        
        if (frete) {
            console.log('Frete encontrado:', {
                id: frete.id,
                codigo: frete.codigo,
                status_atual: frete.status
            });
            
            // Atualizar o status
            await frete.update({ status: 'aceito' });
            console.log('Status atualizado para: aceito');
            
            // Verificar a atualização
            await frete.reload();
            console.log('Status final:', frete.status);
        } else {
            console.log('Frete FR160717FI73 não encontrado');
            
            // Listar todos os fretes para ver os códigos disponíveis
            const fretes = await Frete.findAll({
                attributes: ['id', 'codigo', 'status'],
                limit: 10
            });
            console.log('Fretes disponíveis:', fretes.map(f => ({ id: f.id, codigo: f.codigo, status: f.status })));
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
}

updateFreteStatus();