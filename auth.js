// Funcionalidades de autenticação para Broday Transportes

document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    const userFields = document.querySelectorAll('.user-fields');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    // Navegação entre tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchToTab(targetTab);
        });
    });
    
    // Verificar se há hash na URL para abrir diretamente a aba de registro
    if (window.location.hash === '#register') {
        switchToTab('register');
    }
    
    // Função para alternar entre tabs
    function switchToTab(targetTab) {
        // Remover classe active de todos os tabs e formulários
        tabBtns.forEach(b => b.classList.remove('active'));
        authForms.forEach(form => form.classList.remove('active'));
        
        // Adicionar classe active ao tab e formulário selecionado
        const targetBtn = document.querySelector(`[data-tab="${targetTab}"]`);
        const targetForm = document.getElementById(`${targetTab}-form`);
        
        if (targetBtn && targetForm) {
            targetBtn.classList.add('active');
            targetForm.classList.add('active');
        }
        
        // Resetar formulários ao trocar de tab
        resetForms();
    }
    

    
    // Toggle de visibilidade da senha
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input && icon) {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    });
    
    // Validação do formulário de login
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (validateLoginForm()) {
                try {
                    showNotification('Entrando no sistema...', 'info');
                    
                    const email = document.getElementById('login-email').value.trim();
                    const password = document.getElementById('login-password').value.trim();

                    
                    const response = await api.login(email, password);
                    
                    if (response.success) {
                        showNotification('Login realizado com sucesso!', 'success');
                        // Redirecionar baseado no tipo de usuário
                        redirectToDashboard();
                    }
                } catch (error) {
                    console.error('Erro no login:', error);
                    
                    // Verificar se precisa verificar email
                    if (error.message && error.message.includes('não verificado')) {
                        showNotification('Verifique seu email antes de fazer login.', 'error');
                        localStorage.setItem('pendingVerification', email);
                        setTimeout(() => {
                            window.location.href = 'verify-email.html';
                        }, 2000);
                        return;
                    }
                    
                    let errorMessage = 'Erro ao fazer login. Tente novamente.';
                    
                    // Verificar se é erro de credenciais baseado na mensagem da API
                    if (error.message) {
                        if (error.message === 'E-mail não encontrado') {
                            errorMessage = 'E-mail não encontrado. Verifique se o e-mail está correto.';
                        } else if (error.message === 'Senha incorreta') {
                            errorMessage = 'Senha incorreta. Verifique sua senha e tente novamente.';
                        } else if (error.message === 'Conta desativada') {
                            errorMessage = 'Sua conta está desativada. Entre em contato com o suporte.';
                        } else if (error.message.includes('credenciais') || 
                                   error.message.includes('senha') || 
                                   error.message.includes('password') ||
                                   error.message.includes('incorreto') ||
                                   error.message.includes('inválido')) {
                            errorMessage = 'E-mail ou senha incorretos. Verifique suas credenciais.';
                        } else {
                            errorMessage = error.message;
                        }
                    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                        errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
                    }
                    
                    showNotification(errorMessage, 'error');
                }
            }
        });
    }
    
    // Validação do formulário de registro
    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (validateRegisterForm()) {
                try {
                    showNotification('Criando conta...', 'info');
                    
                    const email = document.getElementById('register-email').value.trim();
                    const documento = document.getElementById('register-cpf').value.trim();
                    const password = document.getElementById('register-password').value;
                    
                    // Determinar se é CPF ou CNPJ
                    const cleanDocument = documento.replace(/\D/g, '');
                    const isCPF = cleanDocument.length === 11;
                    
                    // Coletar dados básicos do usuário
                    const userData = {
                        email,
                        password,
                        userType: 'cliente' // Default para cliente
                    };
                    
                    // Adicionar CPF ou CNPJ baseado no tipo
                    if (isCPF) {
                        userData.cpf = documento;
                    } else {
                        userData.cnpj = documento;
                    }
                    
                    const response = await api.register(userData);
                    
                    if (response.success) {
                        showNotification('Conta criada com sucesso! Verifique seu email.', 'success');
                        this.reset();
                        
                        // Redirecionar para tela de verificação
                        if (response.data.needsVerification) {
                            localStorage.setItem('pendingVerification', response.data.email);
                            setTimeout(() => {
                                window.location.href = 'verify-email.html';
                            }, 1500);
                        } else {
                            showConfirmationMessage();
                        }
                    }
                } catch (error) {
                    showNotification(error.message || 'Erro ao criar conta', 'error');
                }
            }
        });
    }
    
    // Aplicar máscaras aos campos
    applyMasks();
    
    // Validação em tempo real
    setupRealTimeValidation();
});

// Função para validar formulário de login
function validateLoginForm() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (!email) {
        showNotification('Por favor, informe seu e-mail.', 'error');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Por favor, informe um e-mail válido.', 'error');
        return false;
    }
    
    if (!password) {
        showNotification('Por favor, informe sua senha.', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres.', 'error');
        return false;
    }
    
    return true;
}

// Função para validar formulário de registro
function validateRegisterForm() {
    const email = document.getElementById('register-email').value.trim();
    const cpf = document.getElementById('register-cpf').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (!email) {
        showNotification('Por favor, informe seu e-mail.', 'error');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Por favor, informe um e-mail válido.', 'error');
        return false;
    }
    
    if (!cpf) {
        showNotification('Por favor, informe seu CPF ou CNPJ.', 'error');
        return false;
    }
    
    if (!isValidCPForCNPJ(cpf)) {
        showNotification('Por favor, informe um CPF ou CNPJ válido.', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres.', 'error');
        return false;
    }
    
    if (password !== confirmPassword) {
        showNotification('As senhas não coincidem.', 'error');
        return false;
    }
    
    return true;
}



// Função para aplicar máscaras aos campos
function applyMasks() {
    // Máscara inteligente para CPF/CNPJ
    const cpfFields = document.querySelectorAll('input[id*="cpf"]');
    cpfFields.forEach(field => {
        field.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            // Limitar a 14 dígitos (tamanho máximo para CNPJ)
            if (value.length > 14) {
                value = value.substring(0, 14);
            }
            
            if (value.length <= 11) {
                // Máscara de CPF: 000.000.000-00
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            } else {
                // Máscara de CNPJ: 00.000.000/0001-00
                value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            }
            e.target.value = value;
        });
    });
    
    // Máscara para CNPJ em campos específicos de documento
    const cnpjFields = document.querySelectorAll('input[id*="documento"]');
    cnpjFields.forEach(field => {
        field.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                // CPF
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            } else {
                // CNPJ
                value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            }
            e.target.value = value;
        });
    });
    
    // Máscara para telefone
    const phoneFields = document.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        field.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
    });
    
    // Máscara para CEP
    const cepFields = document.querySelectorAll('input[id*="cep"]');
    cepFields.forEach(field => {
        field.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        });
    });
}

// Função para configurar validação em tempo real
function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Remover estilo de erro ao digitar
            if (this.classList.contains('error')) {
                this.classList.remove('error');
                
                // Para campos de CPF/CNPJ, validar em tempo real quando tiver tamanho suficiente
                if (this.id && this.id.includes('cpf') && this.value.trim()) {
                    const cleanValue = this.value.replace(/\D/g, '');
                    if (cleanValue.length === 11 || cleanValue.length === 14) {
                        // Re-validar se já tem tamanho completo
                        setTimeout(() => validateField(this), 100);
                    }
                }
            }
        });
    });
}

// Função para validar campo individual
function validateField(field) {
    const value = field.value.trim();
    
    // Validação específica por tipo de campo
    if (field.type === 'email' && value && !isValidEmail(value)) {
        field.classList.add('error');
        return false;
    }
    
    if (field.hasAttribute('required') && !value) {
        field.classList.add('error');
        return false;
    }
    
    // Validação específica para CPF/CNPJ
    if (field.id && field.id.includes('cpf') && value) {
        const cleanValue = value.replace(/\D/g, '');
        // Só validar se tiver tamanho completo (11 para CPF ou 14 para CNPJ)
        if (cleanValue.length === 11 || cleanValue.length === 14) {
            if (!isValidCPForCNPJ(value)) {
                field.classList.add('error');
                return false;
            }
        } else if (cleanValue.length > 0 && cleanValue.length !== 11 && cleanValue.length !== 14) {
            // Se tiver dígitos mas não for tamanho válido, marcar como erro apenas se saiu do foco
            field.classList.add('error');
            return false;
        }
    }
    
    // Validação específica para documento (CPF/CNPJ)
    if (field.id && field.id.includes('documento') && value && !isValidCPForCNPJ(value)) {
        field.classList.add('error');
        return false;
    }
    
    // Se chegou até aqui, remover classe de erro se existir
    field.classList.remove('error');
    return true;
}

// Função para validar e-mail
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}



// Função para resetar formulários
function resetForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => form.reset());
    
    // Ocultar todos os campos específicos
    const userFields = document.querySelectorAll('.user-fields');
    userFields.forEach(field => {
        field.style.display = 'none';
    });
    
    // Remover classes de erro
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
}

// Função para mostrar mensagem de confirmação
function showConfirmationMessage() {
    const registerForm = document.getElementById('register-form');
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'confirmation-message';
    confirmationDiv.innerHTML = `
        <div class="confirmation-content">
            <i class="fas fa-check-circle"></i>
            <h3>Conta criada com sucesso!</h3>
            <p>Sua conta foi criada e está pendente de aprovação. Você receberá um e-mail de confirmação em breve.</p>
            <button class="btn btn-primary" onclick="switchToLogin()">Fazer Login</button>
        </div>
    `;
    
    registerForm.innerHTML = '';
    registerForm.appendChild(confirmationDiv);
}

// Função para alternar para o formulário de login
function switchToLogin() {
    const loginTab = document.querySelector('[data-tab="login"]');
    loginTab.click();
}

// Função para redirecionar para dashboard
function redirectToDashboard() {
    // Usar a função do api.js para obter o tipo de usuário
    const userType = getUserType();
    
    if (!userType) {
        showNotification('Tipo de usuário não reconhecido', 'error');
        return;
    }
    
    // Redirecionar baseado no tipo de usuário
    switch (userType) {
        case 'motorista':
            showNotification('Redirecionando para o painel do motorista...', 'info');
            setTimeout(() => {
                window.location.href = 'motorista-dashboard.html';
            }, 1500);
            break;
        case 'cliente':
            showNotification('Redirecionando para o painel do cliente...', 'info');
            setTimeout(() => {
                window.location.href = 'cliente-dashboard.html';
            }, 1500);
            break;
        case 'admin':
            showNotification('Redirecionando para o painel administrativo...', 'info');
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1500);
            break;
        default:
            showNotification('Tipo de usuário não reconhecido', 'error');
    }
}

// Função para validar CPF
function isValidCPF(cpf) {
    const validation = new FormValidation();
    const result = validation.validateCPF(cpf);
    return result.valid;
}

// Função para validar CPF ou CNPJ
function isValidCPForCNPJ(document) {
    const validation = new FormValidation();
    const cleanDocument = document.replace(/\D/g, '');
    
    console.log('Validando documento:', document, 'Limpo:', cleanDocument, 'Tamanho:', cleanDocument.length);
    
    if (cleanDocument.length === 11) {
        // Validar como CPF
        const result = validation.validateCPF(document);
        console.log('Resultado CPF:', result);
        return result.valid;
    } else if (cleanDocument.length === 14) {
        // Validar como CNPJ
        const result = validation.validateCNPJ(document);
        console.log('Resultado CNPJ:', result);
        return result.valid;
    }
    
    console.log('Tamanho inválido para CPF/CNPJ');
    return false; // Tamanho inválido
}
