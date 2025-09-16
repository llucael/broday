// Validações REGEX para formulários
class FormValidation {
    constructor() {
        this.patterns = {
            // CPF: 11 dígitos, formato XXX.XXX.XXX-XX
            cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
            
            // CNPJ: 14 dígitos, formato XX.XXX.XXX/XXXX-XX
            cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/,
            
            // Telefone internacional: até 15 dígitos, formato +55 (11) 99999-9999
            telefone: /^(\+\d{1,3}\s?)?(\(?\d{2,3}\)?[\s-]?)?\d{4,5}[\s-]?\d{4}$/,
            
            // CNH: 11 dígitos, formato brasileiro
            cnh: /^\d{11}$/,
            
            // Email: formato padrão de email
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            
            // Placa brasileira: formato antigo ABC-1234 ou novo ABC1D23
            placa: /^[A-Z]{3}[-]?[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/,
            
            // CEP: 8 dígitos, formato XXXXX-XXX
            cep: /^\d{5}-?\d{3}$/
        };
        
        this.messages = {
            cpf: 'CPF deve ter 11 dígitos no formato XXX.XXX.XXX-XX',
            cnpj: 'CNPJ deve ter 14 dígitos no formato XX.XXX.XXX/XXXX-XX',
            telefone: 'Telefone deve ter formato válido (ex: +55 11 99999-9999)',
            cnh: 'CNH deve ter 11 dígitos',
            email: 'Email deve ter formato válido (ex: usuario@exemplo.com)',
            placa: 'Placa deve estar no formato ABC-1234 ou ABC1D23',
            cep: 'CEP deve ter 8 dígitos no formato XXXXX-XXX'
        };
    }

    // Validar CPF
    validateCPF(value) {
        const cleanValue = value.replace(/\D/g, '');
        
        // Verificar se tem 11 dígitos
        if (cleanValue.length !== 11) {
            return { valid: false, message: this.messages.cpf };
        }
        
        // Verificar se não são todos os dígitos iguais
        if (/^(\d)\1{10}$/.test(cleanValue)) {
            return { valid: false, message: 'CPF inválido' };
        }
        
        // Algoritmo de validação do CPF
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanValue.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanValue.charAt(9))) {
            return { valid: false, message: 'CPF inválido' };
        }
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanValue.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanValue.charAt(10))) {
            return { valid: false, message: 'CPF inválido' };
        }
        
        return { valid: true, message: '' };
    }

    // Validar CNPJ
    validateCNPJ(value) {
        const cleanValue = value.replace(/\D/g, '');
        
        // Verificar se tem 14 dígitos
        if (cleanValue.length !== 14) {
            return { valid: false, message: this.messages.cnpj };
        }
        
        // Verificar se não são todos os dígitos iguais
        if (/^(\d)\1{13}$/.test(cleanValue)) {
            return { valid: false, message: 'CNPJ inválido' };
        }
        
        // Algoritmo de validação do CNPJ
        let sum = 0;
        let weight = 2;
        for (let i = 11; i >= 0; i--) {
            sum += parseInt(cleanValue.charAt(i)) * weight;
            weight = weight === 9 ? 2 : weight + 1;
        }
        let remainder = sum % 11;
        let digit1 = remainder < 2 ? 0 : 11 - remainder;
        if (digit1 !== parseInt(cleanValue.charAt(12))) {
            return { valid: false, message: 'CNPJ inválido' };
        }
        
        sum = 0;
        weight = 2;
        for (let i = 12; i >= 0; i--) {
            sum += parseInt(cleanValue.charAt(i)) * weight;
            weight = weight === 9 ? 2 : weight + 1;
        }
        remainder = sum % 11;
        let digit2 = remainder < 2 ? 0 : 11 - remainder;
        if (digit2 !== parseInt(cleanValue.charAt(13))) {
            return { valid: false, message: 'CNPJ inválido' };
        }
        
        return { valid: true, message: '' };
    }

    // Validar telefone
    validateTelefone(value) {
        const cleanValue = value.replace(/\D/g, '');
        
        // Verificar se tem entre 10 e 15 dígitos
        if (cleanValue.length < 10 || cleanValue.length > 15) {
            return { valid: false, message: this.messages.telefone };
        }
        
        return { valid: true, message: '' };
    }

    // Validar CNH
    validateCNH(value) {
        const cleanValue = value.replace(/\D/g, '');
        
        if (cleanValue.length !== 11) {
            return { valid: false, message: this.messages.cnh };
        }
        
        return { valid: true, message: '' };
    }

    // Validar email
    validateEmail(value) {
        if (!this.patterns.email.test(value)) {
            return { valid: false, message: this.messages.email };
        }
        
        return { valid: true, message: '' };
    }

    // Validar placa
    validatePlaca(value) {
        const upperValue = value.toUpperCase();
        
        if (!this.patterns.placa.test(upperValue)) {
            return { valid: false, message: this.messages.placa };
        }
        
        return { valid: true, message: '' };
    }

    // Validar CEP
    validateCEP(value) {
        const cleanValue = value.replace(/\D/g, '');
        
        if (cleanValue.length !== 8) {
            return { valid: false, message: this.messages.cep };
        }
        
        return { valid: true, message: '' };
    }

    // Aplicar máscara de CPF
    formatCPF(value) {
        const cleanValue = value.replace(/\D/g, '');
        return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    // Aplicar máscara de CNPJ
    formatCNPJ(value) {
        const cleanValue = value.replace(/\D/g, '');
        return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    // Aplicar máscara de telefone
    formatTelefone(value) {
        const cleanValue = value.replace(/\D/g, '');
        
        if (cleanValue.length <= 10) {
            return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else if (cleanValue.length === 11) {
            return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleanValue.length > 11) {
            return cleanValue.replace(/(\d{2})(\d{2})(\d{4,5})(\d{4})/, '+$1 ($2) $3-$4');
        }
        
        return value;
    }

    // Aplicar máscara de CEP
    formatCEP(value) {
        const cleanValue = value.replace(/\D/g, '');
        return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    // Aplicar máscara de placa
    formatPlaca(value) {
        const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        if (upperValue.length <= 3) {
            return upperValue;
        } else if (upperValue.length <= 7) {
            // Formato antigo ABC-1234
            return upperValue.replace(/([A-Z]{3})(\d{4})/, '$1-$2');
        } else {
            // Formato novo ABC1D23
            return upperValue.substring(0, 7);
        }
    }

    // Validar documento (CPF ou CNPJ)
    validateDocumento(value) {
        const cleanValue = value.replace(/\D/g, '');
        
        if (cleanValue.length === 11) {
            return this.validateCPF(value);
        } else if (cleanValue.length === 14) {
            return this.validateCNPJ(value);
        } else {
            return { valid: false, message: 'Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)' };
        }
    }

    // Aplicar máscara de documento (CPF ou CNPJ)
    formatDocumento(value) {
        const cleanValue = value.replace(/\D/g, '');
        
        if (cleanValue.length <= 11) {
            return this.formatCPF(value);
        } else {
            return this.formatCNPJ(value);
        }
    }

    // Validar campo baseado no tipo
    validateField(value, type) {
        switch (type) {
            case 'cpf':
                return this.validateCPF(value);
            case 'cnpj':
                return this.validateCNPJ(value);
            case 'documento':
                return this.validateDocumento(value);
            case 'telefone':
                return this.validateTelefone(value);
            case 'cnh':
                return this.validateCNH(value);
            case 'email':
                return this.validateEmail(value);
            case 'placa':
                return this.validatePlaca(value);
            case 'cep':
                return this.validateCEP(value);
            default:
                return { valid: true, message: '' };
        }
    }

    // Aplicar máscara baseada no tipo
    formatField(value, type) {
        switch (type) {
            case 'cpf':
                return this.formatCPF(value);
            case 'cnpj':
                return this.formatCNPJ(value);
            case 'documento':
                return this.formatDocumento(value);
            case 'telefone':
                return this.formatTelefone(value);
            case 'cep':
                return this.formatCEP(value);
            case 'placa':
                return this.formatPlaca(value);
            default:
                return value;
        }
    }

    // Inicializar validações em um formulário
    initForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        // Mapear campos por tipo
        const fieldMappings = {
            'cpf': ['cpf', 'cliente-cpf', 'edit-usuario-cpf', 'motorista-cpf', 'edit-motorista-cpf', 'cpf-documento'],
            'cnpj': ['cnpj', 'cliente-cnpj', 'edit-usuario-cnpj', 'cnpj-documento'],
            'documento': ['sender-document', 'recipient-document'],
            'telefone': ['telefone', 'cliente-telefone', 'edit-usuario-telefone', 'motorista-telefone', 'edit-motorista-telefone', 'sender-phone', 'recipient-phone'],
            'cnh': ['cnh', 'motorista-cnh', 'edit-motorista-cnh'],
            'email': ['email', 'cliente-email', 'edit-usuario-email', 'motorista-email', 'edit-motorista-email', 'sender-email', 'recipient-email', 'login-email', 'register-email'],
            'placa': ['placa', 'caminhao-placa'],
            'cep': ['cep', 'origin-cep', 'destination-cep', 'endereco-cep']
        };

        // Aplicar validações
        Object.keys(fieldMappings).forEach(type => {
            fieldMappings[type].forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    this.setupFieldValidation(field, type);
                }
            });
        });
    }

    // Configurar validação para um campo específico
    setupFieldValidation(field, type) {
        // Aplicar máscara durante a digitação
        field.addEventListener('input', (e) => {
            const formatted = this.formatField(e.target.value, type);
            if (formatted !== e.target.value) {
                e.target.value = formatted;
            }
        });

        // Validar ao sair do campo
        field.addEventListener('blur', (e) => {
            this.validateAndShowError(e.target, type);
        });

        // Validar ao enviar o formulário
        const form = field.closest('form');
        if (form) {
            form.addEventListener('submit', (e) => {
                if (!this.validateAndShowError(field, type)) {
                    e.preventDefault();
                }
            });
        }
    }

    // Validar campo e mostrar erro
    validateAndShowError(field, type) {
        const validation = this.validateField(field.value, type);
        
        // Remover mensagem de erro anterior
        this.removeErrorMessage(field);
        
        if (!validation.valid) {
            this.showErrorMessage(field, validation.message);
            return false;
        } else if (field.value.trim() !== '') {
            this.showFieldValid(field);
        }
        
        return true;
    }

    // Mostrar mensagem de erro
    showErrorMessage(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
        field.classList.add('error');
        field.classList.remove('valid');
    }

    // Remover mensagem de erro
    removeErrorMessage(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        field.classList.remove('error', 'valid');
    }

    // Mostrar campo válido
    showFieldValid(field) {
        field.classList.add('valid');
        field.classList.remove('error');
    }

    // Inicializar todas as validações
    initAll() {
        // Inicializar validações em todos os formulários
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (form.id) {
                this.initForm(form.id);
            }
        });

        // Inicializar validações em campos específicos que não estão em formulários
        const fieldMappings = {
            'cpf': ['cpf', 'cliente-cpf', 'edit-usuario-cpf', 'motorista-cpf', 'edit-motorista-cpf', 'cpf-documento'],
            'cnpj': ['cnpj', 'cliente-cnpj', 'edit-usuario-cnpj', 'cnpj-documento'],
            'documento': ['sender-document', 'recipient-document'],
            'telefone': ['telefone', 'cliente-telefone', 'edit-usuario-telefone', 'motorista-telefone', 'edit-motorista-telefone', 'sender-phone', 'recipient-phone'],
            'cnh': ['cnh', 'motorista-cnh', 'edit-motorista-cnh'],
            'email': ['email', 'cliente-email', 'edit-usuario-email', 'motorista-email', 'edit-motorista-email', 'sender-email', 'recipient-email', 'login-email', 'register-email'],
            'placa': ['placa', 'caminhao-placa'],
            'cep': ['cep', 'origin-cep', 'destination-cep', 'endereco-cep']
        };

        Object.keys(fieldMappings).forEach(type => {
            fieldMappings[type].forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    this.setupFieldValidation(field, type);
                }
            });
        });
    }
}

// Instância global
const formValidation = new FormValidation();

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    formValidation.initAll();
});

// Exportar para uso global
window.FormValidation = FormValidation;
window.formValidation = formValidation;
