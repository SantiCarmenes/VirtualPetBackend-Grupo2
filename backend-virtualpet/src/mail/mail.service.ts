import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 587),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM ?? 'Virtual Pet <no-reply@virtualpet.com>',
        to: email,
        subject: 'Recuperar contraseña - Virtual Pet',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #333;">Recuperar contraseña</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>Hacé clic en el siguiente botón para continuar. El enlace expira en <strong>1 hora</strong>.</p>
            <a
              href="${resetUrl}"
              style="display:inline-block;margin:16px 0;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;"
            >
              Restablecer contraseña
            </a>
            <p style="color:#666;font-size:14px;">Si no solicitaste esto, podés ignorar este correo.</p>
          </div>
        `,
      });
    } catch (err) {
      this.logger.error('Error enviando email de recuperación', err);
      throw err;
    }
  }
}
