# Broday Transportes - Sistema de Gerenciamento

Sistema completo para gerenciamento de carga e caminhões da Broday Transportes, incluindo uma tela de login e registro para diferentes tipos de usuários.

## 🚚 Funcionalidades

### Página Inicial
- Apresentação da empresa e serviços
- Navegação para diferentes seções
- Botões de acesso ao sistema (Entrar/Cadastrar)

### Sistema de Autenticação
- **Login**: Acesso para usuários já cadastrados
- **Registro**: Cadastro de novos usuários
- **Tipos de Usuário**:
  - **Motoristas**: Com campos específicos (CPF, CNH, categoria)
  - **Clientes**: Pessoa física ou jurídica (CPF/CNPJ, endereço)
  - **Administradores**: Funcionários da empresa (departamento)

### Página de Frete
- Formulário para solicitação de cotação
- Campos para origem, destino, tipo de carga
- Validação de dados em tempo real

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos e responsivos
- **JavaScript**: Funcionalidades interativas e validações
- **Font Awesome**: Ícones para interface

## 📱 Características

- **Design Responsivo**: Funciona em dispositivos móveis e desktop
- **Validação em Tempo Real**: Feedback imediato para o usuário
- **Máscaras de Input**: Formatação automática para CPF, CNPJ, telefone, CEP
- **Navegação por Tabs**: Interface intuitiva para login/registro
- **Animações**: Transições suaves e feedback visual

## 🚀 Como Usar

### Acesso ao Sistema
1. Clique no botão "Entrar" na página inicial
2. Escolha entre fazer login ou criar nova conta
3. Selecione o tipo de usuário apropriado
4. Preencha os campos obrigatórios
5. Clique em "Entrar" ou "Criar Conta"

### Navegação
- **Página Inicial**: `index.html`
- **Sistema de Login**: `login.html`
- **Solicitar Frete**: `frete.html`

## 📋 Validações Implementadas

### Campos Obrigatórios
- Todos os campos marcados com * são obrigatórios
- Validação de formato de e-mail
- Verificação de CPF e CNPJ válidos
- Confirmação de senha no registro

### Máscaras Automáticas
- **CPF**: 000.000.000-00
- **CNPJ**: 00.000.000/0000-00
- **Telefone**: (00) 00000-0000
- **CEP**: 00000-000

## 🎨 Estilo e Design

- **Tema Escuro**: Interface moderna com cores escuras
- **Cores Principais**: Azul (#60A5FA), Roxo (#8B5CF6), Verde (#48BB78)
- **Tipografia**: Segoe UI para melhor legibilidade
- **Sombras e Bordas**: Efeitos visuais para profundidade

## 📱 Responsividade

- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: 768px e 480px para diferentes tamanhos de tela
- **Layout Adaptativo**: Grid e flexbox para organização responsiva

## 🔧 Personalização

### Cores
As cores podem ser alteradas no arquivo `styles.css`:
```css
:root {
    --primary-color: #8B5CF6;
    --secondary-color: #60A5FA;
    --success-color: #48BB78;
    --error-color: #E53E3E;
}
```

### Validações
As regras de validação podem ser modificadas no arquivo `auth.js`:
- Comprimento mínimo de senha
- Formatos aceitos para documentos
- Campos obrigatórios por tipo de usuário

## 🚧 Próximas Funcionalidades

- [ ] Dashboard para cada tipo de usuário
- [ ] Sistema de recuperação de senha
- [ ] Integração com banco de dados
- [ ] API para autenticação
- [ ] Sistema de notificações push
- [ ] Histórico de fretes
- [ ] Rastreamento em tempo real

## 📞 Suporte

Para dúvidas ou sugestões sobre o sistema, entre em contato através da página de contato no site.

---

**Desenvolvido para Broday Transportes** © 2024
