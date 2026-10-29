import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import type {
  ITransactionalEmailSender,
  SendEmailInput,
} from '../../application/ports/transactional-email.port';

export const TRANSACTIONAL_EMAIL_EXCEPTION = 'TransactionalEmailException';

export type SesTransactionalEmailConfig = {
  fromEmail: string;
  region: string;
};

export class SesTransactionalEmailAdapter implements ITransactionalEmailSender {
  private readonly client: SESClient;

  constructor(private readonly config: SesTransactionalEmailConfig) {
    this.client = new SESClient({ region: config.region });
  }

  async send(input: SendEmailInput): Promise<void> {
    try {
      await this.client.send(
        new SendEmailCommand({
          Source: this.config.fromEmail,
          Destination: { ToAddresses: input.to },
          Message: {
            Subject: { Data: input.subject, Charset: 'UTF-8' },
            Body: {
              Html: { Data: input.html, Charset: 'UTF-8' },
              Text: { Data: input.text, Charset: 'UTF-8' },
            },
          },
        })
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao enviar e-mail.';
      const error = new Error(message);
      error.name = TRANSACTIONAL_EMAIL_EXCEPTION;
      throw error;
    }
  }
}
