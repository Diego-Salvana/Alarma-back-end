import nodemailer from 'nodemailer';

export class EmailService {
  private host = 'http://localhost:4200';
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  checkConnection () {
    this.transporter.verify(err => {
      if (err) {
        console.log('Fallo en la conexión al email', err);
      } else {
        console.log('Transporter listo para enviar correos');
      }
    });
  }

  async sendVerificationEmail (to: string, token: string) {
    try {
      const info = await this.transporter.sendMail({
        from: 'AlarmsTech <alarms@alarms.com>',
        to,
        subject: 'Verificación de correo',
        text: 'Verificación de correo - AlarmsTech',
        html: this.createVerificationEmailHtml(token)
      });

      console.log('Correo enviado', info);
    } catch (err) {
      console.log(err);
      throw new Error('Error al enviar el correo de verificación');
    }
  }

  async sendResetPassEmail (to: string, token: string) {
    try {
      const info = await this.transporter.sendMail({
        from: 'AlarmsTech <alarms@alarms.com>',
        to,
        subject: 'Restablecimiento de contraseña',
        text: 'Restablecimiento de contraseña - AlarmsTech',
        html: this.createResetPassEmailHtml(token)
      });

      console.log('Correo enviado', info);
    } catch (err) {
      console.log(err);
      throw new Error('Error al enviar el correo de restablecimiento de contraseña');
    }
  }

  private createVerificationEmailHtml (token: string) {
    const verifyEmailPath = 'auth/verify-email';

    return `
      <!DOCTYPE html>
      <html lang="en">

      <body style="margin:0; padding:0; background-color:#ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
          <tr>
            <td align="center">
              <table
                width="600"
                cellpadding="0"
                cellspacing="0"
                style="
                    font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #FFF7CC;
                    padding: 40px;
                    border-radius: 4px;
                  ">
                <tr>
                  <td>
                    <h1 style="margin-top:0;">Verificación de correo electrónico</h1>

                    <p style="font-size: 16px;">
                      Hay una nueva cuenta en AlarmsTech con este correo electrónico.
                    </p>
                    <p style="font-size: 16px;">Si no has creado la cuenta, desestima este correo.</p>
                    <p style="font-size: 16px;">
                      Si la has creado, verifica la cuenta haciendo click en el siguiente enlace:
                    </p>
                    <p style="font-size: 16px;">
                      <a
                        href="${this.host}/${verifyEmailPath}/${token}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                            display:inline-block;
                            padding:12px 20px;
                            background-color:#000000;
                            color:#ffffff;
                            text-decoration:none;
                            border-radius:4px;
                            font-weight:bold;
                      ">
                        Verificar cuenta
                      </a>
                    </p>

                    <p style="font-size: 16px; margin-bottom:0;">— Equipo AlarmsTech</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>

      </html>
    `;
  }

  private createResetPassEmailHtml (token: string) {
    const resetPassPath = 'auth/reset-password';

    return `
      <!DOCTYPE html>
      <html lang="es">

      <body style="margin:0; padding:0; background-color:#ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
          <tr>
            <td align="center">
              <table
                width="600"
                cellpadding="0"
                cellspacing="0"
                style="
                  font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;
                  background-color: #E6F4FF; /* Celeste claro */
                  padding: 40px;
                  border-radius: 4px;
                ">
                <tr>
                  <td>
                    <h1 style="margin-top:0;">Recuperación de contraseña</h1>

                    <p style="font-size: 16px;">
                      Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>AlarmsTech</strong>.
                    </p>

                    <p style="font-size: 16px;">
                      Si no realizaste esta solicitud, podés ignorar este correo. Tu contraseña no será modificada.
                    </p>

                    <p style="font-size: 16px;">
                      Para crear una nueva contraseña, hacé click en el siguiente botón:
                    </p>

                    <p style="font-size: 16px;">
                      <a
                        href="${this.host}/${resetPassPath}/${token}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                          display:inline-block;
                          padding:12px 20px;
                          background-color:#000000;
                          color:#ffffff;
                          text-decoration:none;
                          border-radius:4px;
                          font-weight:bold;
                        ">
                        Restablecer contraseña
                      </a>
                    </p>

                    <p style="font-size: 14px; color:#555;">
                      Este enlace es válido por tiempo limitado.
                    </p>

                    <p style="font-size: 16px; margin-bottom:0;">
                      — Equipo AlarmsTech
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>

      </html>
    `;
  }
}
