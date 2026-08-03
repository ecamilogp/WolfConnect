import nodemailer, { Transporter } from 'nodemailer';

import { env } from '../../config/env.js';
import { MailerRepository, SendEmailOptions } from '../../domain/repositories/mailer.repository.js';

export class NodemailerMailerRepository implements MailerRepository {
  private transporter: Transporter | undefined;

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
      throw new Error(
        'SMTP_HOST, SMTP_USER and SMTP_PASSWORD environment variables are required to send email.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });

    return this.transporter;
  }

  async send(options: SendEmailOptions): Promise<void> {
    await this.getTransporter().sendMail({
      from: env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}
