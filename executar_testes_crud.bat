@echo off
echo 🚀 Iniciando Testes CRUD da API Broday Transportes
echo ==================================================

REM Verificar se o servidor está rodando
echo 🔍 Verificando se o servidor está rodando...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Servidor não está rodando. Inicie o servidor primeiro:
    echo    npm start
    pause
    exit /b 1
)
echo ✅ Servidor está rodando

echo.
echo 📋 Executando Testes CRUD...
echo =============================

REM Verificar se Newman está instalado
where newman >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Newman não está instalado. Instale com:
    echo    npm install -g newman
    echo.
    echo 📖 Ou importe os arquivos no Postman:
    echo    1. Broday_Transportes_CRUD_Tests.postman_collection.json
    echo    2. Broday_CRUD_Environment.postman_environment.json
    pause
    exit /b 1
)

echo 🔧 Executando com Newman...

REM Testes de Autenticação
echo 1️⃣ Testes de Autenticação...
newman run "Broday_Transportes_CRUD_Tests.postman_collection.json" -e "Broday_CRUD_Environment.postman_environment.json" --folder "1. Autenticação - Login de Usuários"

REM Testes GET
echo 2️⃣ Testes GET (Consultas)...
newman run "Broday_Transportes_CRUD_Tests.postman_collection.json" -e "Broday_CRUD_Environment.postman_environment.json" --folder "2. Operações GET - Consultas"

REM Testes POST
echo 3️⃣ Testes POST (Criação)...
newman run "Broday_Transportes_CRUD_Tests.postman_collection.json" -e "Broday_CRUD_Environment.postman_environment.json" --folder "3. Operações POST - Criação"

REM Testes DELETE
echo 4️⃣ Testes DELETE (Exclusão)...
newman run "Broday_Transportes_CRUD_Tests.postman_collection.json" -e "Broday_CRUD_Environment.postman_environment.json" --folder "4. Operações DELETE - Exclusão"

REM Testes de Validação
echo 5️⃣ Testes de Validação e Erros...
newman run "Broday_Transportes_CRUD_Tests.postman_collection.json" -e "Broday_CRUD_Environment.postman_environment.json" --folder "5. Testes de Validação e Erros"

echo.
echo ✅ Todos os testes CRUD foram executados!

echo.
echo 📊 Resumo dos Testes CRUD:
echo ==========================
echo ✅ GET: Consultas de dados (health, perfis, fretes)
echo ✅ POST: Criação de recursos (fretes, usuários, status)
echo ✅ DELETE: Exclusão de recursos (fretes, usuários)
echo ✅ Autenticação: Login de cliente, motorista e admin
echo ✅ Validação: Tratamento de erros e dados inválidos
echo.
echo 🎯 Testes focados em operações CRUD básicas!

pause
