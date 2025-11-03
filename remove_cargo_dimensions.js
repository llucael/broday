const { sequelize } = require('./config/database');

async function removeCargoDialogColumn() {
  try {
    console.log('🔄 Iniciando remoção da coluna cargo_dimensions...');
    
    // Como SQLite não suporta DROP COLUMN diretamente, precisamos recriar a tabela
    console.log('📋 Verificando estrutura atual...');
    
    // 1. Criar nova tabela sem cargo_dimensions
    await sequelize.query(`
      CREATE TABLE fretes_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo VARCHAR(255) NOT NULL UNIQUE,
        cliente_id INTEGER NOT NULL,
        motorista_id INTEGER,
        status TEXT NOT NULL DEFAULT 'solicitado',
        sender_name VARCHAR(255) NOT NULL,
        sender_document VARCHAR(255) NOT NULL,
        sender_phone VARCHAR(255) NOT NULL,
        sender_email VARCHAR(255) NOT NULL,
        recipient_name VARCHAR(255) NOT NULL,
        recipient_document VARCHAR(255) NOT NULL,
        recipient_phone VARCHAR(255) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        cargo_type VARCHAR(255) NOT NULL,
        cargo_value DECIMAL(10,2) NOT NULL,
        cargo_weight DECIMAL(8,2) NOT NULL,
        origin_cep VARCHAR(255) NOT NULL,
        origin_street VARCHAR(255) NOT NULL,
        origin_number VARCHAR(255) NOT NULL,
        origin_complement VARCHAR(255),
        origin_city VARCHAR(255) NOT NULL,
        origin_state VARCHAR(255) NOT NULL,
        destination_cep VARCHAR(255) NOT NULL,
        destination_street VARCHAR(255) NOT NULL,
        destination_number VARCHAR(255) NOT NULL,
        destination_complement VARCHAR(255),
        destination_city VARCHAR(255) NOT NULL,
        destination_state VARCHAR(255) NOT NULL,
        observacoes TEXT,
        data_coleta_limite DATETIME NOT NULL,
        data_entrega_limite DATETIME NOT NULL,
        data_coleta DATETIME,
        data_entrega DATETIME,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      );
    `);
    console.log('✅ Nova tabela criada');

    // 2. Copiar dados da tabela antiga (excluindo cargo_dimensions)
    await sequelize.query(`
      INSERT INTO fretes_new (
        id, codigo, cliente_id, motorista_id, status,
        sender_name, sender_document, sender_phone, sender_email,
        recipient_name, recipient_document, recipient_phone, recipient_email,
        cargo_type, cargo_value, cargo_weight,
        origin_cep, origin_street, origin_number, origin_complement, origin_city, origin_state,
        destination_cep, destination_street, destination_number, destination_complement, destination_city, destination_state,
        observacoes, data_coleta_limite, data_entrega_limite, data_coleta, data_entrega,
        created_at, updated_at
      )
      SELECT 
        id, codigo, cliente_id, motorista_id, status,
        sender_name, sender_document, sender_phone, sender_email,
        recipient_name, recipient_document, recipient_phone, recipient_email,
        cargo_type, cargo_value, cargo_weight,
        origin_cep, origin_street, origin_number, origin_complement, origin_city, origin_state,
        destination_cep, destination_street, destination_number, destination_complement, destination_city, destination_state,
        observacoes, data_coleta_limite, data_entrega_limite, data_coleta, data_entrega,
        created_at, updated_at
      FROM fretes;
    `);
    console.log('✅ Dados copiados para nova tabela');

    // 3. Remover tabela antiga
    await sequelize.query('DROP TABLE fretes;');
    console.log('✅ Tabela antiga removida');

    // 4. Renomear nova tabela
    await sequelize.query('ALTER TABLE fretes_new RENAME TO fretes;');
    console.log('✅ Tabela renomeada');

    // 5. Recriar índices (deixar o SQLite criar automaticamente)
    await sequelize.query('CREATE UNIQUE INDEX fretes_codigo_unique ON fretes (codigo);');
    console.log('✅ Índices recriados');

    console.log('🎉 Coluna cargo_dimensions removida com sucesso!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro ao remover coluna:', error);
    process.exit(1);
  }
}

removeCargoDialogColumn();