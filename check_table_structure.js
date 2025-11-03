const { sequelize } = require('./config/database');

async function checkTableStructure() {
    try {
        // Verificar estrutura da tabela fretes
        const [results] = await sequelize.query("PRAGMA table_info(fretes);");
        
        console.log('📋 Estrutura da tabela fretes:');
        console.log('Campos obrigatórios (NOT NULL):');
        
        results.forEach(column => {
            console.log(`  ${column.name}: ${column.type} ${column.notnull ? '(NOT NULL)' : '(NULL)'} ${column.pk ? '(PRIMARY KEY)' : ''}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

checkTableStructure();