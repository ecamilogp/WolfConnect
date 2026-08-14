export interface PlatformInvitationEmailData {
  inviterName: string;
  token: string;
  joinUrl: string;
  expiresInDays: number;
}

export function buildPlatformInvitationEmailHtml(data: PlatformInvitationEmailData): string {
  return `
    <div style="background-color: #f4f2f7; padding: 32px 16px; font-family: Arial, Helvetica, sans-serif;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e1ee;">
        <div style="background-color: #693ac3; padding: 24px 32px;">
          <h1 style="margin: 0; font-size: 22px; color: #ffffff; letter-spacing: 0.5px;">WolfConnect</h1>
        </div>

        <div style="padding: 32px; color: #1a1a1a;">
          <p style="font-size: 16px; margin: 0 0 16px;">¡Hola!</p>

          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
            <strong>${data.inviterName}</strong> te invitó a unirte a <strong>WolfConnect</strong>, la
            plataforma donde tu equipo se mantiene conectado con mensajes instantáneos, grupos y
            notificaciones en tiempo real.
          </p>

          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Crea tu cuenta con un clic para empezar a chatear.
          </p>

          <p style="text-align: center; margin: 0 0 24px;">
            <a
              href="${data.joinUrl}"
              style="display: inline-block; background-color: #693ac3; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;"
            >
              Crear mi cuenta
            </a>
          </p>

          <p style="font-size: 13px; line-height: 1.6; color: #555555; margin: 0 0 8px;">
            Este enlace es válido durante ${data.expiresInDays} días. Si el botón no funciona, copia y
            pega esta dirección en tu navegador:
          </p>

          <p style="font-size: 13px; word-break: break-all; margin: 0 0 24px;">
            <a href="${data.joinUrl}" style="color: #693ac3;">${data.joinUrl}</a>
          </p>

          <p style="font-size: 12px; color: #888888; margin: 0;">
            Código de invitación: <code>${data.token}</code>
          </p>
        </div>

        <div style="padding: 20px 32px; background-color: #f4f2f7; border-top: 1px solid #e5e1ee;">
          <p style="font-size: 12px; color: #888888; margin: 0;">
            Si no esperabas esta invitación, puedes ignorar este correo con tranquilidad — no se
            creará ninguna cuenta sin tu confirmación.
          </p>
          <p style="font-size: 12px; color: #aaaaaa; margin: 8px 0 0;">
            Este es un correo automático de WolfConnect, por favor no respondas a este mensaje.
          </p>
        </div>
      </div>
    </div>
  `;
}
