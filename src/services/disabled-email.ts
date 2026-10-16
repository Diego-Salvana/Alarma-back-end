import { EmailSender } from '../interfaces';

export class DisabledEmailService implements EmailSender {
  checkConnection () {
    console.log('Email service disabled in demo mode');
  }

  async sendVerificationEmail (to: string, token: string): Promise<void> {
    console.log('Email verification skipped in demo mode');
  }

  async sendResetPassEmail (to: string, token: string): Promise<void> {
    console.log('Email reset password skipped in demo mode');
  }
}
