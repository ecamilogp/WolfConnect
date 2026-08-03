export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface MailerRepository {
  send(options: SendEmailOptions): Promise<void>;
}
