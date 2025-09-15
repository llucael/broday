const Joi = require('joi');
const { body, param, query, validationResult } = require('express-validator');

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validações para registro de usuário
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('E-mail deve ser válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('userType')
    .isIn(['motorista', 'cliente', 'admin'])
    .withMessage('Tipo de usuário deve ser motorista, cliente ou admin'),
  handleValidationErrors
];

// Validações para login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('E-mail deve ser válido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  handleValidationErrors
];

// Validações para motorista
const validateMotorista = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('cpf')
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato 000.000.000-00'),
  body('cnh')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('CNH deve ter entre 5 e 20 caracteres'),
  body('categoria')
    .isIn(['A', 'B', 'C', 'D', 'E'])
    .withMessage('Categoria deve ser A, B, C, D ou E'),
  body('telefone')
    .matches(/^\(\d{2}\) \d{5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (00) 00000-0000'),
  handleValidationErrors
];

// Validações para cliente
const validateCliente = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('tipoPessoa')
    .isIn(['fisica', 'juridica'])
    .withMessage('Tipo de pessoa deve ser física ou jurídica'),
  body('documento')
    .custom((value, { req }) => {
      if (req.body.tipoPessoa === 'fisica') {
        if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)) {
          throw new Error('CPF deve estar no formato 000.000.000-00');
        }
      } else {
        if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value)) {
          throw new Error('CNPJ deve estar no formato 00.000.000/0000-00');
        }
      }
      return true;
    }),
  body('telefone')
    .matches(/^\(\d{2}\) \d{5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (00) 00000-0000'),
  body('endereco')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Endereço deve ter entre 10 e 500 caracteres'),
  body('cidade')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cidade deve ter entre 2 e 100 caracteres'),
  body('estado')
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ter 2 caracteres'),
  body('cep')
    .matches(/^\d{5}-\d{3}$/)
    .withMessage('CEP deve estar no formato 00000-000'),
  handleValidationErrors
];

// Validações para admin
const validateAdmin = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('cpf')
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato 000.000.000-00'),
  body('telefone')
    .matches(/^\(\d{2}\) \d{5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (00) 00000-0000'),
  body('departamento')
    .isIn(['operacoes', 'financeiro', 'rh', 'ti', 'comercial'])
    .withMessage('Departamento deve ser operacoes, financeiro, rh, ti ou comercial'),
  handleValidationErrors
];

// Validações para frete
const validateFrete = [
  body('cargo_type')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Tipo de carga deve ter entre 2 e 100 caracteres'),
  body('cargo_weight')
    .isFloat({ min: 0.001 })
    .withMessage('Peso deve ser maior que zero'),
  body('cargo_value')
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser maior que zero'),
  body('cargo_dimensions')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Dimensões da carga são obrigatórias'),
  body('origin_street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Rua de origem deve ter entre 5 e 200 caracteres'),
  body('origin_number')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Número de origem é obrigatório'),
  body('origin_city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cidade de origem deve ter entre 2 e 100 caracteres'),
  body('origin_state')
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado de origem deve ter 2 caracteres'),
  body('origin_cep')
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP de origem deve estar no formato 00000-000 ou 00000000'),
  body('destination_street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Rua de destino deve ter entre 5 e 200 caracteres'),
  body('destination_number')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Número de destino é obrigatório'),
  body('destination_city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cidade de destino deve ter entre 2 e 100 caracteres'),
  body('destination_state')
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado de destino deve ter 2 caracteres'),
  body('destination_cep')
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP de destino deve estar no formato 00000-000 ou 00000000'),
  (req, res, next) => {
    console.log('Dados recebidos para validação:', req.body);
    next();
  },
  handleValidationErrors
];

// Validações para parâmetros de ID
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo'),
  handleValidationErrors
];

// Validações para query parameters
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  handleValidationErrors
];

// Validações para atualização de senha
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateLogin,
  validateMotorista,
  validateCliente,
  validateAdmin,
  validateFrete,
  validateId,
  validatePagination,
  validatePasswordUpdate
};
