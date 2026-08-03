export interface PlatformInvitationEmailData {
  inviterName: string;
  token: string;
  joinUrl: string;
}

export function buildPlatformInvitationEmailHtml(data: PlatformInvitationEmailData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <h1 style="font-size: 20px;">WolfConnect</h1>
      <p><strong>${data.inviterName}</strong> te invitó a unirte a WolfConnect.</p>
      <p style="text-align: center; margin: 32px 0;">
        <a
          href="${data.joinUrl}"
          style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;"
        >
          Join WolfConnect
        </a>
      </p>
      <p style="font-size: 12px; color: #666666;">
        If the button doesn't work, use this invitation code: <code>${data.token}</code>
      </p>
    </div>
  `;
}
