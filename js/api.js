// Configuração da API (detecção automática do ambiente)
// Ordem de prioridade para definir a base da API:
// 1. window.__API_BASE_URL__ (injetável via script para overrides em produção)
// 2. meta[name="api-base-url"] no HTML
// 3. Se rodando via file:// => fallback para http://localhost:3000/api
// 4. Se hostname for localhost/127.0.0.1 => usar origin:porta ou http://localhost:3000/api
// 5. Caso contrário, assumir mesma origem em /api
function detectApiBaseUrl() {
  try {
    if (window && window.__API_BASE_URL__) return window.__API_BASE_URL__;
  } catch (e) {}

  const meta = document.querySelector && document.querySelector('meta[name="api-base-url"]');
  if (meta && meta.content) return meta.content;

  if (location.protocol === 'file:') {
    return 'http://localhost:3000/api';
  }

  const hostname = location.hostname;
  const origin = location.origin;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Frontend on localhost frequently runs on a different port (e.g. 5500).
    // Prefer the conventional backend dev port 3000 unless explicitly overridden.
    return 'http://localhost:3000/api';
  }

  // Ambiente de produção: API no mesmo host sob /api
  return `${location.origin}/api`;
}

let API_BASE_URL = detectApiBaseUrl();
// Informar no console qual URL foi resolvida (útil para debug local/produção)
console.info('[api] API base URL:', API_BASE_URL);

// Classe para gerenciar requisições à API
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('accessToken');
    // Por padrão, usar credenciais same-origin (cookies) quando apropriado
    this.credentials = 'same-origin';
  }

  // Método para fazer requisições HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: options.credentials || this.credentials,
      ...options
    };

    // Adicionar token de autorização se disponível
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Verificar se a resposta tem conteúdo JSON
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      
      // Melhorar tratamento de erros de rede
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de conexão. Verifique se o servidor está rodando.');
      }
      
      throw error;
    }
  }

  // Método para atualizar token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  // Permite sobrescrever a base URL em runtime (útil para deployments)
  setBaseURL(url) {
    this.baseURL = url;
    API_BASE_URL = url;
  }

  // Permite configurar política de credentials ('omit' | 'same-origin' | 'include')
  setCredentialsMode(mode) {
    this.credentials = mode;
  }

  // Método para limpar dados de autenticação
  clearAuth() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // ===== MÉTODOS DE AUTENTICAÇÃO =====

  // Registrar usuário
  async register(userData) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Login
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.success) {
      this.setToken(response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  // Logout
  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      this.clearAuth();
    }
  }

  // Obter perfil do usuário
  async getProfile() {
    const userType = getUserType();
    if (userType === 'cliente') {
      return await this.request('/cliente/perfil');
    } else if (userType === 'motorista') {
      return await this.request('/motorista/perfil');
    } else {
      return await this.request('/auth/profile');
    }
  }

  // Atualizar perfil
  async updateProfile(userData) {
    const userType = getUserType();
    if (userType === 'cliente') {
      return await this.request('/cliente/perfil', {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    } else if (userType === 'motorista') {
      return await this.request('/motorista/perfil', {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    } else {
      return await this.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    }
  }

  // Alterar senha
  async changePassword(currentPassword, newPassword) {
    return await this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  // Endereços (apenas para clientes)
  async getEnderecos() {
    const userType = getUserType();
    if (userType === 'cliente') {
      return await this.request('/cliente/enderecos');
    }
    throw new Error('Funcionalidade não disponível para este tipo de usuário');
  }

  async createEndereco(enderecoData) {
    const userType = getUserType();
    if (userType === 'cliente') {
      return await this.request('/cliente/enderecos', {
        method: 'POST',
        body: JSON.stringify(enderecoData)
      });
    }
    throw new Error('Funcionalidade não disponível para este tipo de usuário');
  }

  // ===== MÉTODOS DE FRETE =====

  // Criar frete
  async createFrete(freteData) {
    return await this.request('/fretes', {
      method: 'POST',
      body: JSON.stringify(freteData)
    });
  }

  // Listar fretes do cliente
  async getFretesByCliente(page = 1, limit = 10, status = null, mostrarTodos = true, search = '') {
    const params = new URLSearchParams({ 
      page: String(page), 
      limit: String(limit), 
      mostrarTodos: String(mostrarTodos)
    });
    
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    
    return await this.request(`/fretes/cliente/meus-fretes?${params}`);
  }

  // Dashboard do motorista
  async getDashboard() {
    return await this.request('/motorista/dashboard');
  }

  // Listar fretes disponíveis (motorista)
  async getFretesDisponiveis(page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit });
    return await this.request(`/motorista/fretes/disponiveis?${params}`);
  }

  // Listar fretes do motorista
  async getFretesByMotorista(page = 1, limit = 10, status = null) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    
    return await this.request(`/motorista/fretes/meus?${params}`);
  }

  // ===== MÉTODOS DE CAMINHÕES =====

  // Listar todos os caminhões (admin)
  async getAllCaminhoes(page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit });
    return await this.request(`/caminhoes?${params}`);
  }

  // Listar caminhões do motorista
  async getCaminhoesByMotorista(page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit });
    return await this.request(`/caminhoes/motorista?${params}`);
  }

  // Buscar caminhão por ID
  async getCaminhaoById(id) {
    return await this.request(`/caminhoes/${id}`);
  }

  async getCaminhoesMotorista() {
    return await this.request('/caminhoes/motorista');
  }

  // Criar caminhão
  async createCaminhao(caminhaoData) {
    return await this.request('/caminhoes', {
      method: 'POST',
      body: JSON.stringify(caminhaoData)
    });
  }

  // Atualizar caminhão
  async updateCaminhao(id, caminhaoData) {
    return await this.request(`/caminhoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(caminhaoData)
    });
  }

  // Deletar caminhão
  async deleteCaminhao(id) {
    return await this.request(`/caminhoes/${id}`, {
      method: 'DELETE'
    });
  }

  // Listar motoristas para seleção
  async getMotoristas() {
    return await this.request('/admin/motoristas');
  }

  // Buscar frete por ID
  async getFreteById(id) {
    return await this.request(`/fretes/${id}`);
  }

  // Atualizar frete
  async updateFrete(freteId, updateData) {
    return await this.request(`/fretes/${freteId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  // Aceitar frete (motorista)
  async acceptFrete(id) {
    return await this.request(`/motorista/fretes/${id}/aceitar`, {
      method: 'POST'
    });
  }

  // Aceitar frete (admin) - aprovar e liberar para motoristas
  async adminAcceptFrete(id) {
    return await this.request(`/fretes/${id}/aceitar-admin`, {
      method: 'POST'
    });
  }

  // Atualizar status do frete
  async updateFreteStatus(id, status) {
    return await this.request(`/fretes/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Cancelar frete (cliente)
  async cancelarFrete(id) {
    return await this.request(`/cliente/fretes/${id}/cancelar`, {
      method: 'PUT'
    });
  }

  // Buscar contatos cadastrados (remetentes e destinatários)
  async getContatosCadastrados() {
    return await this.request('/fretes/cliente/contatos-cadastrados');
  }

  // ===== MÉTODOS DE PERFIL =====

  // Buscar perfil do usuário
  async getUserProfile(userId) {
    return await this.request(`/motorista/perfil`);
  }

  // Atualizar perfil do usuário
  async updateUserProfile(userId, profileData) {
    return await this.request(`/motorista/perfil`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Atualizar documentos do usuário
  async updateUserDocuments(userId, documentsData) {
    return await this.request(`/users/${userId}/documents`, {
      method: 'PUT',
      body: JSON.stringify(documentsData)
    });
  }

  // Listar todos os fretes (admin)
  async getAllFretes(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({ page, limit });
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    return await this.request(`/fretes?${params}`);
  }

  // ===== MÉTODOS DE USUÁRIOS (ADMIN) =====

  // Listar todos os clientes e administradores
  async getClientes(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({ page, limit });
    // Incluir tanto clientes quanto administradores
    params.append('user_type', 'cliente,admin');
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    return await this.request(`/admin/users?${params}`);
  }

  // Listar todos os motoristas (admin)
  async getAllMotoristas(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({ page, limit });
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });

    return await this.request(`/admin/motoristas?${params}`);
  }

  // Criar novo cliente
  async createCliente(clienteData) {
    return await this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ ...clienteData, user_type: 'cliente' })
    });
  }

  // Criar novo motorista
  async createMotorista(motoristaData) {
    return await this.request('/admin/motoristas/cadastrar', {
      method: 'POST',
      body: JSON.stringify(motoristaData)
    });
  }

  // Buscar usuário por ID
  async getUserById(userId) {
    return await this.request(`/admin/users/${userId}`);
  }

  // Atualizar usuário
  async updateUser(userId, userData) {
    return await this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // Excluir usuário
  async deleteUser(userId) {
    return await this.request(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }

  // Ativar/Desativar usuário
  async toggleUserStatus(userId, isActive) {
    return await this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive })
    });
  }

  // ===== MÉTODOS DE RASTREAMENTO =====

  // Registrar localização do motorista
  async registrarLocalizacao(localizacaoData) {
    return await this.request('/rastreamento/localizacao', {
      method: 'POST',
      body: JSON.stringify(localizacaoData)
    });
  }

  // Obter histórico de localizações de um frete
  async getHistoricoLocalizacoes(freteId, page = 1, limit = 50) {
    const params = new URLSearchParams({ page, limit });
    return await this.request(`/rastreamento/frete/${freteId}/historico?${params}`);
  }

  // Obter localização atual de um frete
  async getLocalizacaoAtual(freteId) {
    return await this.request(`/rastreamento/frete/${freteId}/atual`);
  }

  // Obter localizações em tempo real (últimas 24 horas)
  async getLocalizacoesTempoReal(freteId) {
    return await this.request(`/rastreamento/frete/${freteId}/tempo-real`);
  }

  // Obter estatísticas de rastreamento
  async getEstatisticasRastreamento(freteId) {
    return await this.request(`/rastreamento/frete/${freteId}/estatisticas`);
  }
}

// Instância global da API
const api = new ApiService();

// Função para verificar se o usuário está logado
function isLoggedIn() {
  return !!localStorage.getItem('accessToken');
}

// Função para obter dados do usuário logado
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Função para obter tipo de usuário
function getUserType() {
  const user = getCurrentUser();
  return user ? user.user_type : null;
}

// Função para redirecionar baseado no tipo de usuário
function redirectByUserType() {
  const userType = getUserType();
  
  switch (userType) {
    case 'admin':
      showNotification('Redirecionando para o painel administrativo...', 'info');
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1500);
      break;
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
    default:
      showNotification('Tipo de usuário não reconhecido', 'error');
  }
}

// Função para fazer logout e redirecionar
async function logout() {
  try {
    await api.logout();
    showNotification('Logout realizado com sucesso!', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  } catch (error) {
    showNotification('Erro ao fazer logout', 'error');
  }
}

// Exportar para uso global
window.api = api;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.getUserType = getUserType;
window.redirectByUserType = redirectByUserType;
window.logout = logout;
