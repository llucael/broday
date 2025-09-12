// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Classe para gerenciar requisições à API
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('accessToken');
  }

  // Método para fazer requisições HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
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
    return await this.request('/auth/profile');
  }

  // Atualizar perfil
  async updateProfile(userData) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // Alterar senha
  async changePassword(currentPassword, newPassword) {
    return await this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
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
  async getFretesByCliente(page = 1, limit = 10, status = null) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    
    return await this.request(`/fretes/meus-fretes?${params}`);
  }

  // Listar fretes disponíveis (motorista)
  async getFretesDisponiveis(page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit });
    return await this.request(`/fretes/disponiveis?${params}`);
  }

  // Listar fretes do motorista
  async getFretesByMotorista(page = 1, limit = 10, status = null) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    
    return await this.request(`/fretes/meus-fretes?${params}`);
  }

  // Buscar frete por ID
  async getFreteById(id) {
    return await this.request(`/fretes/${id}`);
  }

  // Aceitar frete (motorista)
  async acceptFrete(id) {
    return await this.request(`/fretes/${id}/aceitar`, {
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

  // Listar todos os fretes (admin)
  async getAllFretes(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({ page, limit });
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    return await this.request(`/fretes?${params}`);
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
