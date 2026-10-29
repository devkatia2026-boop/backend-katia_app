export type SendEmailInput = {
  to: string[];
  subject: string;
  html: string;
  text: string;
};

export interface ITransactionalEmailSender {
  send(input: SendEmailInput): Promise<void>;
}
