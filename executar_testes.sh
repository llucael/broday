#!/bin/bash

# Script de Execução dos Testes - Broday Transportes
echo "🚀 Iniciando Testes da API Broday Transportes"
echo "=============================================="

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
echo "📋 Executando Testes..."
echo "======================="

# Executar testes usando Newman (CLI do Postman)
if command -v newman &> /dev/null; then
    echo "🔧 Executando com Newman..."
    
    # Testes de Unidade
    echo "1️⃣ Testes de Unidade..."
    newman run "Broday_Transportes_Tests.postman_collection.json" -e "Broday_Transportes_Environment.postman_environment.json" --folder "1. Testes de Unidade"
    
    # Testes de Integração
    echo "2️⃣ Testes de Integração..."
    newman run "Broday_Transportes_Tests.postman_collection.json" -e "Broday_Transportes_Environment.postman_environment.json" --folder "2. Testes de Integração"
    
    # Testes de Sistema
    echo "3️⃣ Testes de Sistema..."
    newman run "Broday_Transportes_Tests.postman_collection.json" -e "Broday_Transportes_Environment.postman_environment.json" --folder "3. Testes de Sistema"
    
    # Testes de Regressão
    echo "4️⃣ Testes de Regressão..."
    newman run "Broday_Transportes_Tests.postman_collection.json" -e "Broday_Transportes_Environment.postman_environment.json" --folder "4. Testes de Regressão"
    
    # Testes de Usabilidade
    echo "5️⃣ Testes de Usabilidade..."
    newman run "Broday_Transportes_Tests.postman_collection.json" -e "Broday_Transportes_Environment.postman_environment.json" --folder "5. Testes de Usabilidade"
    
    # Testes de Desempenho
    echo "6️⃣ Testes de Desempenho..."
    newman run "Broday_Transportes_Tests.postman_collection.json" -e "Broday_Transportes_Environment.postman_environment.json" --folder "6. Testes de Desempenho"
    
    # Testes de Segurança
    echo "7️⃣ Testes de Segurança..."
    newman run "Broday_Transportes_Tests.postman_collection.json" -e "Broday_Transportes_Environment.postman_environment.json" --folder "7. Testes de Segurança"
    
    echo ""
    echo "✅ Todos os testes foram executados!"
    
else
    echo "❌ Newman não está instalado. Instale com:"
    echo "   npm install -g newman"
    echo ""
    echo "📖 Ou importe os arquivos no Postman:"
    echo "   1. Broday_Transportes_Tests.postman_collection.json"
    echo "   2. Broday_Transportes_Environment.postman_environment.json"
fi

echo ""
echo "📊 Relatórios de Teste:"
echo "======================="
echo "Os resultados dos testes serão exibidos no terminal."
echo "Para relatórios HTML, use: newman run collection.json -e environment.json --reporters html"
