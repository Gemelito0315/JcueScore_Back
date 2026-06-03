import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      if (
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
      ) {
        // Usar SMTP real configurado en .env (ej. Gmail, SendGrid, etc)
        const port = parseInt(process.env.SMTP_PORT as string) || 587;
        const isGmail = process.env.SMTP_HOST.toLowerCase().includes('gmail.com');

        const transportConfig: any = {
          host: process.env.SMTP_HOST,
          port: port,
          secure: process.env.SMTP_SECURE === 'true' || port === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
        };

        if (isGmail) {
          // Si es Gmail, usar el service preset de nodemailer para mayor compatibilidad
          delete transportConfig.host;
          delete transportConfig.port;
          delete transportConfig.secure;
          transportConfig.service = 'gmail';
        }

        this.transporter = nodemailer.createTransport(transportConfig);
        this.logger.log(
          `Real SMTP Mail service initialized for user: ${process.env.SMTP_USER} (Gmail: ${isGmail})`,
        );
      } else {
        // Fallback: Usar Ethereal para desarrollo si no hay .env configurado
        const testAccount = await nodemailer.createTestAccount();

        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        this.logger.log(
          `Ethereal Mail service initialized. User: ${testAccount.user}`,
        );
        this.logger.warn(
          `Configure SMTP_HOST, SMTP_USER, SMTP_PASS en .env para enviar correos reales.`,
        );
      }
    } catch (error) {
      this.logger.error('Error initializing mail transporter', error);
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const verificationLink = `${frontendUrl}/auth/verify?token=${token}`;

    const mailOptions = {
      from: '"JcueScore Support" <support@jcuescore.com>',
      to,
      subject: 'Verifica tu cuenta en JcueScore',
      text: `¡Bienvenido a JcueScore! Por favor, verifica tu cuenta haciendo clic en el siguiente enlace: ${verificationLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #06b6d4;">¡Bienvenido a JcueScore!</h2>
          <p>Gracias por registrarte. Para poder iniciar sesión y disfrutar del sistema, necesitamos que verifiques tu correo electrónico.</p>
          <p>Haz clic en el botón de abajo para verificar tu cuenta:</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; margin-top: 15px; background: linear-gradient(135deg, #34d399, #06b6d4); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Verificar mi cuenta</a>
          <p style="margin-top: 30px; font-size: 0.9em; color: #666;">O copia y pega este enlace en tu navegador:<br>${verificationLink}</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${to}`);

      // Mostrar Preview URL solo si estamos usando Ethereal (para pruebas)
      if (info.messageId && info.messageId.includes('ethereal')) {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return info;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
      throw error;
    }
  }
}
