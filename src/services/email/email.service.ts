import { Prisma } from "@prisma/client";
import nodemailer, { Transporter } from "nodemailer";

export class EmailService {
  public transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  public static async sendPasswordResetEmail(
    to: string,
    resetUrl: string
  ): Promise<void> {
    try {
      const transporter = new EmailService().transporter;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Recuperação de Senha | Eventflow",
        html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #4a4a4a;">Olá!</h2>
          <p>Recebemos uma solicitação para redefinir sua senha no <strong>Eventflow</strong>.</p>
          <p>Se você fez essa solicitação, clique no botão abaixo para redefinir sua senha:</p>
          <a href="${resetUrl}" 
             style="
               display: inline-block;
               margin: 20px 0;
               padding: 10px 20px;
               background-color: #4a90e2;
               color: #ffffff;
               text-decoration: none;
               font-weight: bold;
               border-radius: 5px;
             "
          >
            Redefinir Senha
          </a>
          <p>Este link é válido por 1 hora. Caso não tenha solicitado essa recuperação, você pode ignorar esta mensagem com segurança.</p>
          <p>Atenciosamente,</p>
          <p><strong>Equipe Eventflow</strong></p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
          <small style="color: #777;">Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:</small>
          <p style="color: #4a90e2; word-break: break-word;">${resetUrl}</p>
        </div>
      `,
      });
    } catch (error) {
      throw new Error(
        "Não foi possível enviar o e-mail de recuperação de senha."
      );
    }
  }

  public static async sendSubscriptionConfirmationEmail(
    to: string,
    event: Prisma.EventoSelect
  ) {
    try {
      const transporter = new EmailService().transporter;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: `Confirmação de Inscrição - ${event.nome}`,
        html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #4a4a4a;">Olá!</h2>
          <p>Parabéns! Sua inscrição no <strong>${event.nome}</strong> foi confirmada.</p>
          <p>Atenciosamente,</p>
          <p><strong>Equipe Eventflow</strong></p>
        </div>
      `,
      });
    } catch (error) {
      throw new Error(
        "Não foi possível enviar o e-mail de confirmação de inscrição."
      );
    }
  }

  // Adicionar o envio do email para resetar a senha do Guest caso ele queira acessar a conta dele
}
