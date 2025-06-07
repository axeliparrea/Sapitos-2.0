/**
 * Email service utility for sending emails including OTP codes
 */
const nodemailer = require('nodemailer');
const { getSecret } = require('./secureVault');

/**
 * Create email transporter - Production version using Azure Key Vault
 */
const createProductionTransporter = async () => {
  try {
    // Get email credentials from Azure Key Vault
    const emailUser = process.env.EMAIL_USER || await getSecret('EMAIL-USER');
    const emailPass = process.env.EMAIL_PASSWORD || await getSecret('EMAIL-PASSWORD');
    
    // Create transporter
    return nodemailer.createTransport({
      service: 'gmail',  // You can change this to your email provider
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw new Error('Failed to initialize email service');
  }
};

/**
 * Create email transporter - Development version for testing
 */
const createDevTransporter = () => {
  // For development, you can use ethereal.email for testing
  // or configure with your own test email account
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'development@example.com',
      pass: process.env.EMAIL_PASSWORD || 'development-password'
    }
  });
};

/**
 * Get appropriate email transporter based on environment
 */
const getTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    return await createProductionTransporter();
  } else {
    return createDevTransporter();
  }
};

/**
 * Send an OTP code via email
 * @param {string} email - Recipient email address
 * @param {string} otp - The OTP code to send
 * @param {string} name - User's name
 * @returns {Promise<boolean>} - Success status
 */
const sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = await getTransporter();
    console.log(`Attempting to send OTP email to ${email} (${name})`);
      const mailOptions = {
      from: process.env.EMAIL_FROM || 'Sapitos Seguridad <seguridad@sapitos.com>',
      to: email,
      subject: 'Código de Verificación de Sapitos',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://drive.google.com/file/d/1sYn3eg9Lat-b6ye33ht4k_o5Ammjr41a/view?usp=sharing" alt="Logo de Sapitos" style="max-width: 150px;">
          </div>
          <h2 style="color: #333;">Se Requiere Verificación</h2>
          <p>Hola ${name || 'Usuario'},</p>
          <p>Tu código de verificación de seguridad es:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
            ${otp}
          </div>
          <p>Este código caducará en 3 minutos.</p>
          <p>Si no has solicitado este código, puedes ignorar este correo o contactar con soporte si tienes preocupaciones sobre la seguridad de tu cuenta.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
            &copy; ${new Date().getFullYear()} Sapitos. Todos los derechos reservados.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail
};
