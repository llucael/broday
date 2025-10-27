const express = require('express');
const path = require('path');

const app = express();
const PORT = 5501;

// Servir arquivos estáticos
app.use(express.static('.'));

// Rota para servir o index.html na raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para servir login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Rota para servir frete.html
app.get('/frete', (req, res) => {
    res.sendFile(path.join(__dirname, 'frete.html'));
});

// Rota para servir login-success.html
app.get('/login-success', (req, res) => {
    res.sendFile(path.join(__dirname, 'login-success.html'));
});

// Rota para servir verify-email.html
app.get('/verify-email', (req, res) => {
    res.sendFile(path.join(__dirname, 'verify-email.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🌐 Servidor web rodando na porta ${PORT}`);
    console.log(`📱 Frontend disponível em: 
        http://localhost:${PORT}`);
    console.log(`🔗 Páginas disponíveis:`);
    console.log(`   - Início: http://localhost:${PORT}`);
    console.log(`   - Login: http://localhost:${PORT}/login`);
    console.log(`   - Frete: http://localhost:${PORT}/frete`);
    console.log(`   - Verificação: http://localhost:${PORT}/verify-email`);
});

module.exports = app;
