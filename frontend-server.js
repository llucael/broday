const express = require('express');
const path = require('path');
const app = express();
const PORT = 5501;

// Servir arquivos estáticos
app.use(express.static('.'));

// Rota para a página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌐 Frontend rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
  console.log(`📄 Admin Motoristas: http://localhost:${PORT}/admin-motoristas.html`);
  console.log(`📄 Admin Usuários: http://localhost:${PORT}/admin-usuarios.html`);
  console.log(`📄 Admin Fretes: http://localhost:${PORT}/admin-fretes.html`);
});

