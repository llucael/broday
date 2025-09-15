const { User, sequelize } = require('../models');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');

// Registrar novo usuário
const register = async (req, res) => {
  try {
    const { email, password, userType, ...userData } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'E-mail já está em uso'
      });
    }

    // Criar usuário
    const user = await User.create({
      email,
      password,
      user_type: userType,
      is_active: true,
      email_verified: true
    });

    // Gerar tokens
    const { accessToken, refreshToken } = await generateTokens(user.id);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: user.toSafeObject(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Login do usuário
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário apenas por email
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'E-mail não encontrado'
      });
    }

    // Verificar senha
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    // Verificar se usuário está ativo
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada'
      });
    }

    // Atualizar último login
    await user.update({ last_login: new Date() });

    // Gerar tokens
    const { accessToken, refreshToken } = await generateTokens(user.id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: user.toSafeObject(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token não fornecido'
      });
    }

    // Verificar refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Buscar usuário
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    // Gerar novos tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    res.json({
      success: true,
      message: 'Tokens renovados com sucesso',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });
  } catch (error) {
    console.error('Erro no refresh token:', error);
    res.status(401).json({
      success: false,
      message: 'Refresh token inválido'
    });
  }
};

// Logout (invalidar token)
const logout = async (req, res) => {
  try {
    // Em uma implementação mais robusta, você salvaria o token em uma blacklist
    // Por enquanto, apenas retornamos sucesso
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter perfil do usuário logado
const getProfile = async (req, res) => {
  try {
    console.log('🔍 Buscando perfil para usuário ID:', req.user.id);
    
    // Usar query SQL direta para garantir que todos os campos sejam retornados
    const results = await sequelize.query(
      'SELECT id, nome, email, telefone, cpf, endereco, cnh, categoria, vencimento_cnh, empresa, cnpj, user_type, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
      {
        replacements: [req.user.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log('📊 Resultados da query:', results);

    if (!results || results.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const userData = results[0];
    console.log('✅ Dados do usuário:', userData);
    
    // Remover a senha dos dados retornados
    if (userData && userData.password) {
      delete userData.password;
    }

    console.log('📤 Enviando resposta:', {
      success: true,
      data: userData
    });

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar perfil do usuário
const updateProfile = async (req, res) => {
  try {
    // Buscar dados atuais do usuário para comparar email
    const [currentUser] = await sequelize.query(
      'SELECT email FROM users WHERE id = ?',
      {
        replacements: [req.user.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Verificar se email já existe (apenas se está sendo alterado)
    if (req.body.email && req.body.email !== currentUser.email) {
      const [existingUser] = await sequelize.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        {
          replacements: [req.body.email, req.user.id],
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'E-mail já está em uso'
        });
      }
    }

    // Campos permitidos para atualização
    const allowedFields = ['nome', 'email', 'telefone', 'cpf', 'endereco', 'cnh', 'categoria', 'vencimento_cnh', 'empresa', 'cnpj'];
    const updateFields = [];
    const values = [];
    
    // Construir query de atualização
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo válido para atualização'
      });
    }

    // Adicionar updated_at e id
    updateFields.push('updated_at = ?');
    values.push(new Date());
    values.push(req.user.id);

    // Executar atualização
    await sequelize.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      {
        replacements: values,
        type: sequelize.QueryTypes.UPDATE
      }
    );

    // Buscar dados atualizados
    const [results] = await sequelize.query(
      'SELECT id, nome, email, telefone, cpf, endereco, cnh, categoria, vencimento_cnh, empresa, cnpj, user_type, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
      {
        replacements: [req.user.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: results[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Alterar senha
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.userId);
    
    // Verificar senha atual
    const isCurrentPasswordValid = await user.checkPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword
};
