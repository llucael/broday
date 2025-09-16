# Validações REGEX Implementadas

## 📋 Visão Geral

Sistema completo de validações REGEX implementado em todos os formulários de registro e edição do sistema Broday Transportes.

## 🔧 Validações Implementadas

### 1. **CPF (Cadastro de Pessoa Física)**
- **Formato:** XXX.XXX.XXX-XX ou 11 dígitos
- **Validação:** Algoritmo completo de validação do CPF
- **Campos aplicados:**
  - `cpf`, `cliente-cpf`, `edit-usuario-cpf`
  - `motorista-cpf`, `edit-motorista-cpf`, `cpf-documento`

### 2. **CNPJ (Cadastro Nacional da Pessoa Jurídica)**
- **Formato:** XX.XXX.XXX/XXXX-XX ou 14 dígitos
- **Validação:** Algoritmo completo de validação do CNPJ
- **Campos aplicados:**
  - `cnpj`, `cliente-cnpj`, `edit-usuario-cnpj`
  - `cnpj-documento`

### 3. **Documento (CPF ou CNPJ)**
- **Formato:** Detecta automaticamente se é CPF (11 dígitos) ou CNPJ (14 dígitos)
- **Validação:** Aplica validação específica baseada no tamanho
- **Campos aplicados:**
  - `sender-document`, `recipient-document`

### 4. **Telefone Internacional**
- **Formato:** Até 15 dígitos, suporta formatos:
  - `+55 (11) 99999-9999`
  - `(11) 99999-9999`
  - `11 99999-9999`
- **Validação:** Entre 10 e 15 dígitos
- **Campos aplicados:**
  - `telefone`, `cliente-telefone`, `edit-usuario-telefone`
  - `motorista-telefone`, `edit-motorista-telefone`
  - `sender-phone`, `recipient-phone`

### 5. **CNH (Carteira Nacional de Habilitação)**
- **Formato:** 11 dígitos
- **Validação:** Exatamente 11 dígitos numéricos
- **Campos aplicados:**
  - `cnh`, `motorista-cnh`, `edit-motorista-cnh`

### 6. **Email**
- **Formato:** Padrão RFC 5322
- **Validação:** `usuario@dominio.com`
- **Campos aplicados:**
  - `email`, `cliente-email`, `edit-usuario-email`
  - `motorista-email`, `edit-motorista-email`
  - `sender-email`, `recipient-email`
  - `login-email`, `register-email`

### 7. **Placa de Veículo Brasileira**
- **Formato:** 
  - Antigo: `ABC-1234`
  - Novo: `ABC1D23`
- **Validação:** Formato brasileiro válido
- **Campos aplicados:**
  - `placa`, `caminhao-placa`

### 8. **CEP (Código de Endereçamento Postal)**
- **Formato:** XXXXX-XXX ou 8 dígitos
- **Validação:** Exatamente 8 dígitos
- **Campos aplicados:**
  - `cep`, `origin-cep`, `destination-cep`, `endereco-cep`

## 🎨 Recursos Visuais

### **Indicadores Visuais:**
- **Campo Válido:** Borda verde (`#48bb78`)
- **Campo Inválido:** Borda vermelha (`#e53e3e`)
- **Mensagem de Erro:** Texto vermelho abaixo do campo

### **Máscaras Automáticas:**
- Aplicadas durante a digitação
- Formatação automática baseada no tipo de campo
- Suporte a diferentes formatos de entrada

## 📁 Arquivos Modificados

### **Arquivo Principal:**
- `js/validation.js` - Sistema completo de validações

### **Páginas Atualizadas:**
- `login.html` - Validação de email
- `frete.html` - Validação de documentos, telefones, emails, CEP
- `admin-usuarios.html` - Validação de CPF, CNPJ, telefone, email
- `admin-motoristas.html` - Validação de CPF, CNPJ, telefone, email, CNH
- `admin-caminhoes.html` - Validação de placa
- `admin-configuracoes.html` - Validação de CNPJ, telefone
- `motorista-perfil.html` - Validação de CPF, CNPJ, telefone, email, CNH
- `cliente-perfil.html` - Validação de CPF, CNPJ, telefone, email

### **Estilos:**
- `styles.css` - Classes CSS para indicadores visuais

## 🚀 Como Funciona

### **Inicialização Automática:**
```javascript
// Inicializa automaticamente quando o DOM carrega
document.addEventListener('DOMContentLoaded', function() {
    formValidation.initAll();
});
```

### **Validação em Tempo Real:**
- **Durante digitação:** Aplica máscaras automaticamente
- **Ao sair do campo:** Valida e mostra erros
- **Ao enviar formulário:** Valida todos os campos

### **Exemplo de Uso:**
```javascript
// Validar campo específico
const validation = formValidation.validateField('123.456.789-00', 'cpf');
if (!validation.valid) {
    console.log(validation.message);
}

// Aplicar máscara
const formatted = formValidation.formatField('12345678900', 'cpf');
// Resultado: "123.456.789-00"
```

## ✅ Benefícios

1. **Validação Robusta:** Algoritmos completos para CPF e CNPJ
2. **UX Melhorada:** Feedback visual imediato
3. **Formatação Automática:** Máscaras aplicadas durante digitação
4. **Consistência:** Mesma validação em todos os formulários
5. **Manutenibilidade:** Código centralizado e reutilizável
6. **Acessibilidade:** Mensagens de erro claras e específicas

## 🔍 Testes Recomendados

### **CPF:**
- ✅ `123.456.789-09` (válido)
- ❌ `111.111.111-11` (inválido - dígitos iguais)
- ❌ `123.456.789-00` (inválido - dígito verificador)

### **CNPJ:**
- ✅ `11.222.333/0001-81` (válido)
- ❌ `11.111.111/1111-11` (inválido - dígitos iguais)

### **Telefone:**
- ✅ `+55 11 99999-9999`
- ✅ `(11) 99999-9999`
- ❌ `123` (muito curto)

### **Email:**
- ✅ `usuario@exemplo.com`
- ❌ `usuario@` (incompleto)

### **Placa:**
- ✅ `ABC-1234` (formato antigo)
- ✅ `ABC1D23` (formato novo)
- ❌ `123-ABCD` (inválido)

## 📝 Notas Técnicas

- **Compatibilidade:** Funciona em todos os navegadores modernos
- **Performance:** Validações otimizadas para não impactar a UX
- **Extensibilidade:** Fácil adicionar novos tipos de validação
- **Manutenção:** Código bem documentado e estruturado
