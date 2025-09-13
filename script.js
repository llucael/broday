// Funcionalidades básicas para o site da Broday Transportes

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling para links de navegação
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Validação e envio do formulário de frete
    const freteForm = document.querySelector('.frete-form');
    
    if (freteForm) {
        freteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validação básica
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#E53E3E';
                } else {
                    field.style.borderColor = '#4A5568';
                }
            });
            
            if (!isValid) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            try {
                // Verificar se está logado
                if (!isLoggedIn()) {
                    alert('Você precisa estar logado para enviar um frete. Redirecionando para o login...');
                    window.location.href = 'login.html';
                    return;
                }
                
                // Mostrar loading
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Enviando...';
                submitBtn.disabled = true;
                
                // Coletar dados do formulário
                const formData = {
                    // Informações do remetente
                    senderName: document.getElementById('sender-name').value.trim(),
                    senderDocument: document.getElementById('sender-document').value.trim(),
                    senderPhone: document.getElementById('sender-phone').value.trim(),
                    senderEmail: document.getElementById('sender-email').value.trim(),
                    // Informações do destinatário
                    recipientName: document.getElementById('recipient-name').value.trim(),
                    recipientDocument: document.getElementById('recipient-document').value.trim(),
                    recipientPhone: document.getElementById('recipient-phone').value.trim(),
                    recipientEmail: document.getElementById('recipient-email').value.trim(),
                    // Detalhes da carga
                    cargoType: document.getElementById('cargo-type').value.trim(),
                    cargoValue: parseFloat(document.getElementById('cargo-value').getAttribute('data-numeric-value') || 
                                document.getElementById('cargo-value').value.replace(/\./g, '').replace(',', '.')),
                    cargoWeight: parseFloat(document.getElementById('cargo-weight').value),
                    cargoDimensions: document.getElementById('cargo-dimensions').value.trim(),
                    // Endereço de origem
                    originCep: document.getElementById('origin-cep').value.trim(),
                    originStreet: document.getElementById('origin-street').value.trim(),
                    originNumber: document.getElementById('origin-number').value.trim(),
                    originComplement: document.getElementById('origin-complement').value.trim(),
                    originCity: document.getElementById('origin-city').value.trim(),
                    originState: document.getElementById('origin-state').value.trim(),
                    // Endereço de destino
                    destinationCep: document.getElementById('destination-cep').value.trim(),
                    destinationStreet: document.getElementById('destination-street').value.trim(),
                    destinationNumber: document.getElementById('destination-number').value.trim(),
                    destinationComplement: document.getElementById('destination-complement').value.trim(),
                    destinationCity: document.getElementById('destination-city').value.trim(),
                    destinationState: document.getElementById('destination-state').value.trim()
                };
                
                // Verificar se tem token válido
                const token = localStorage.getItem('accessToken');
                
                if (!token) {
                    // Fazer login automático
                    try {
                        const loginResponse = await api.login('cliente@broday.com', 'cliente123');
                        if (!loginResponse.success) {
                            throw new Error('Não foi possível fazer login');
                        }
                    } catch (loginError) {
                        console.error('Erro no login automático:', loginError);
                        throw new Error('Não foi possível fazer login');
                    }
                }
                
                // Enviar para a API
                const response = await api.createFrete(formData);
                
                if (response.success) {
                    alert('Solicitação de frete enviada com sucesso! Você pode acompanhar o status em "Meus Fretes".');
                    this.reset();
                    
                    // Redirecionar para meus fretes após 2 segundos
                    setTimeout(() => {
                        window.location.href = 'cliente-fretes.html';
                    }, 2000);
                } else {
                    alert(response.message || 'Erro ao enviar solicitação. Tente novamente.');
                }
                
            } catch (error) {
                console.error('Erro ao enviar frete:', error);
                alert('Erro de conexão. Verifique se o servidor está rodando.');
            } finally {
                // Restaurar botão
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Máscara para CPF/CNPJ
    const documentFields = document.querySelectorAll('input[id*="document"]');
    documentFields.forEach(field => {
        field.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                // CPF: 000.000.000-00
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            } else {
                // CNPJ: 00.000.000/0000-00
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

    // Máscara para valor monetário melhorada
    const valueField = document.querySelector('#cargo-value');
    if (valueField) {
        valueField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d,]/g, ''); // Permite números e vírgulas
            
            // Se tem vírgula, trata como decimal
            if (value.includes(',')) {
                const parts = value.split(',');
                if (parts.length === 2) {
                    // Formato: 1.234,56
                    const integerPart = parts[0].replace(/\D/g, '');
                    const decimalPart = parts[1].replace(/\D/g, '').substring(0, 2);
                    
                    // Adiciona pontos para milhares
                    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                    e.target.value = formattedInteger + ',' + decimalPart;
                }
            } else {
                // Sem vírgula, adiciona pontos para milhares
                const cleanValue = value.replace(/\D/g, '');
                if (cleanValue) {
                    e.target.value = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                }
            }
        });
        
        // Converter para formato numérico ao sair do campo
        valueField.addEventListener('blur', function(e) {
            let value = e.target.value.replace(/\./g, '').replace(',', '.');
            if (value && !isNaN(value)) {
                e.target.setAttribute('data-numeric-value', value);
            }
        });
    }

    // Header fixo com efeito de scroll
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.backgroundColor = 'rgba(15, 20, 25, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = '#0F1419';
            header.style.backdropFilter = 'none';
        }
        
        lastScrollTop = scrollTop;
    });

    // Animações de entrada para elementos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos para animação
    const animatedElements = document.querySelectorAll('.service-card, .feature-card, .form-section');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Adicionar ao DOM
    document.body.appendChild(notification);

    // Botão de fechar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });

    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}



// Função para validar CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    let digit1 = remainder < 2 ? 0 : remainder;
    
    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    let digit2 = remainder < 2 ? 0 : remainder;
    
    return parseInt(cpf.charAt(9)) === digit1 && parseInt(cpf.charAt(10)) === digit2;
}

// Função para validar CNPJ
function validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validar primeiro dígito verificador
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cnpj.charAt(i)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    // Validar segundo dígito verificador
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cnpj.charAt(i)) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cnpj.charAt(12)) === digit1 && parseInt(cnpj.charAt(13)) === digit2;
}
