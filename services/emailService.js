const nodemailer = require('nodemailer');

// Configuração do transporter de email
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587'),
    secure: false, // true para 465, false para outras portas
    auth: {
        user: process.env.EMAIL_USER || process.env.SMTP_USER,
        pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
    }
});

// Verificar conexão
transporter.verify(function (error, success) {
    if (error) {
        console.log('❌ Erro na configuração do email:', error);
    } else {
        console.log('✅ Servidor de email pronto para enviar mensagens');
    }
});

// Enviar email de verificação
const sendVerificationEmail = async (email, code) => {
    try {
        const mailOptions = {
            from: `"Broday Transportes" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
            to: email,
            subject: 'Código de Verificação - Broday Transportes',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #667eea; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f4f4f4; padding: 20px; }
                        .code-box { 
                            background-color: #667eea; 
                            color: white; 
                            font-size: 32px; 
                            font-weight: bold; 
                            text-align: center; 
                            padding: 20px; 
                            margin: 20px 0;
                            border-radius: 8px;
                            letter-spacing: 5px;
                        }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Verificação de Email</h1>
                        </div>
                        <div class="content">
                            <p>Olá!</p>
                            <p>Seu código de verificação é:</p>
                            <div class="code-box">${code}</div>
                            <p>Este código expira em <strong>30 minutos</strong>.</p>
                            <p>Se você não solicitou esta verificação, ignore este email.</p>
                        </div>
                        <div class="footer">
                            <p>Broday Transportes © 2025 - Todos os direitos reservados</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email de verificação enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Erro ao enviar email de verificação:', error);
        throw error;
    }
};

module.exports = {
    sendVerificationEmail,
    transporter
};

