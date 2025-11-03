const { User, sequelize } = require('../models');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');
const { sendVerificationEmail } = require('../services/emailService');

// Gerar código de verificação (5 dígitos)
const generateVerificationCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Registrar novo usuário
const register = async (req, res) => {
  try {
    const { email, password, userType, cpf, cnpj, ...userData } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'E-mail já está em uso'
      });
    }

    // Verificar CPF único (se fornecido)
    if (cpf) {
      const existingCpf = await User.findOne({ where: { cpf } });
      if (existingCpf) {
        return res.status(400).json({
          success: false,
          message: 'CPF já está em uso'
        });
      }
    }

    // Verificar CNPJ único (se fornecido)
    if (cnpj) {
      const existingCnpj = await User.findOne({ where: { cnpj } });
      if (existingCnpj) {
        return res.status(400).json({
          success: false,
          message: 'CNPJ já está em uso'
        });
      }
    }

    // Criar usuário (NÃO verificado)
    const user = await User.create({
      email,
      password,
      user_type: userType,
      cpf: cpf || null,
      cnpj: cnpj || null,
      is_active: true,
      email_verified: false
    });

    // Gerar e enviar código de verificação
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    await user.update({
      email_verification_code: code,
      email_verification_expires: expiresAt
    });

    // Enviar email de verificação
    try {
      const { sendVerificationEmail } = require('../services/emailService');
      await sendVerificationEmail(email, code);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      // Continuar com a criação mesmo se o email falhar
    }

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso. Verifique seu email para ativar sua conta.',
      data: {
        user: user.toSafeObject(),
        email: user.email,
        needsVerification: true
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
      where: { email },
      attributes: ['id', 'email', 'password', 'user_type', 'is_active', 'email_verified', 'nome', 'telefone', 'cpf', 'empresa', 'cnpj', 'cnh', 'categoria', 'status', 'cnh_emissao', 'cnh_uf', 'cnh_observacoes', 'cnh_validade', 'created_at', 'updated_at']
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

    // Verificar se email está verificado
    if (!user.email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Email não verificado. Verifique seu email antes de fazer login.',
        needsVerification: true
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

    // Verificar CPF único (se está sendo alterado)
    if (req.body.cpf) {
      const [existingCpf] = await sequelize.query(
        'SELECT id FROM users WHERE cpf = ? AND id != ?',
        {
          replacements: [req.body.cpf, req.user.id],
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (existingCpf) {
        return res.status(400).json({
          success: false,
          message: 'CPF já está em uso'
        });
      }
    }

    // Verificar CNPJ único (se está sendo alterado)
    if (req.body.cnpj) {
      const [existingCnpj] = await sequelize.query(
        'SELECT id FROM users WHERE cnpj = ? AND id != ?',
        {
          replacements: [req.body.cnpj, req.user.id],
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (existingCnpj) {
        return res.status(400).json({
          success: false,
          message: 'CNPJ já está em uso'
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

// Solicitar verificação de email
const requestEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email já verificado'
      });
    }

    // Gerar código de verificação
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    await user.update({
      email_verification_code: code,
      email_verification_expires: expiresAt
    });

    // Enviar email
    try {
      await sendVerificationEmail(email, code);
      res.json({
        success: true,
        message: 'Código de verificação enviado para seu email'
      });
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar email de verificação'
      });
    }
  } catch (error) {
    console.error('Erro ao solicitar verificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Verificar código de email
const verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email já verificado'
      });
    }

    if (!user.email_verification_code || !user.email_verification_expires) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum código de verificação encontrado'
      });
    }

    // Verificar expiração
    if (new Date() > user.email_verification_expires) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificação expirado'
      });
    }

    // Verificar código
    if (user.email_verification_code !== code) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificação inválido'
      });
    }

    // Verificar email
    await user.update({
      email_verified: true,
      email_verification_code: null,
      email_verification_expires: null
    });

    res.json({
      success: true,
      message: 'Email verificado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao verificar código:', error);
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
  changePassword,
  requestEmailVerification,
  verifyEmailCode
};
