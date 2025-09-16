#!/bin/bash

# Script de Execução dos Testes CRUD - Broday Transportes
echo "🚀 Iniciando Testes CRUD da API Broday Transportes"
echo "=================================================="

# Verificar se o servidor está rodando
echo "🔍 Verificando se o servidor está rodando..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Servidor está rodando"
else
    echo "❌ Servidor não está rodando. Inicie o servidor primeiro:"
    echo "   npm start"
    exit 1
fi

echo ""
echo "📋 Executando Testes CRUD..."
echo "============================"

# Executar testes usando Newman (CLI do Postman)
if command -v newman &> /dev/null; then
    echo "🔧 Executando com Newman..."
    
    # Testes de Autenticação
    echo "1️⃣ Testes de Autenticação..."
    newman run "Broday_Transportes_CRUD_Tests.postman_collection.json" -e "Broday_CRUD_Environment.postman_environment.json" --folder "1. Autenticação - Login de Usuários"
    
    # Testes GET
    echo "2️⃣ Testes GET (Consultas)..."
    newman run "Broday_Transportes_CRUD_Tests.postman_collection.json" -e "Broday_CRUD_Environment.postman_environment.json" --folder "2. Operações GET - Consultas"
    
    # Testes POST
    echo "3️⃣ Testes POST (Criação)..."
    newman run "Broday_Transportes_CRUD_Tests.postman_collection.json" -e "Broday_CRUD_Environment.postman_environment.json" --folder "3. Operações POST - Criação"
    
    # Testes DELETE
    echo "4️⃣ Testes DELETE (Exclusão)..."
    newman run "Broday_Transportes_CRUD_Tests.postman_collection.json" -e "Broday_CRUD_Environment.postman_environment.json" --folder "4. Operações DELETE - Exclusão"
    
    # Testes de Validação
    echo "5️⃣ Testes de Validação e Erros..."
    newman run "Broday_Transportes_CRUD_Tests.postman_collection.json" -e "Broday_CRUD_Environment.postman_environment.json" --folder "5. Testes de Validação e Erros"
    
    echo ""
    echo "✅ Todos os testes CRUD foram executados!"
    
else
    echo "❌ Newman não está instalado. Instale com:"
    echo "   npm install -g newman"
    echo ""
    echo "📖 Ou importe os arquivos no Postman:"
    echo "   1. Broday_Transportes_CRUD_Tests.postman_collection.json"
    echo "   2. Broday_CRUD_Environment.postman_environment.json"
fi

echo ""
echo "📊 Resumo dos Testes CRUD:"
echo "=========================="
echo "✅ GET: Consultas de dados (health, perfis, fretes)"
echo "✅ POST: Criação de recursos (fretes, usuários, status)"
echo "✅ DELETE: Exclusão de recursos (fretes, usuários)"
echo "✅ Autenticação: Login de cliente, motorista e admin"
echo "✅ Validação: Tratamento de erros e dados inválidos"
echo ""
echo "🎯 Testes focados em operações CRUD básicas!"
