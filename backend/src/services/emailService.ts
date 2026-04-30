import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? "Cryptogamer's <noreply@cryptogamer.ar>"

const isConfigured = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_tu-api-key-aqui'

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!isConfigured) {
    console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`)
    console.log(html.replace(/<[^>]+>/g, '').substring(0, 200))
    return
  }
  await resend.emails.send({ from: FROM, to, subject, html })
}

/* ── Templates ──────────────────────────────────── */
export const emailTemplates = {
  orderConfirmation: (orderNumber: string, total: number, items: { name: string; qty: number; price: number }[]) => ({
    subject: `✅ Pedido confirmado #${orderNumber} — Cryptogamer's`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0d0e14;color:#e0e0e0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#4f00b4,#1a0a33);padding:32px;text-align:center">
          <h1 style="margin:0;font-size:28px;color:#fff">Cryptogamer's</h1>
          <p style="color:#c084fc;margin:8px 0 0">¡Tu pedido fue confirmado!</p>
        </div>
        <div style="padding:32px">
          <p style="color:#a855f7;font-weight:bold;font-size:18px">Pedido #${orderNumber}</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            ${items.map(i => `
              <tr style="border-bottom:1px solid #1f2128">
                <td style="padding:8px 0;color:#e0e0e0">${i.name}</td>
                <td style="padding:8px 0;color:#a1a1aa;text-align:center">x${i.qty}</td>
                <td style="padding:8px 0;text-align:right;color:#39ff14;font-weight:bold">$${(i.price * i.qty).toFixed(0)}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="2" style="padding-top:12px;font-weight:bold;color:#fff">TOTAL</td>
              <td style="padding-top:12px;text-align:right;color:#39ff14;font-size:20px;font-weight:900">$${total.toFixed(0)}</td>
            </tr>
          </table>
          <p style="color:#a1a1aa;font-size:13px">Nos pondremos en contacto en las próximas horas para coordinar el envío.</p>
        </div>
        <div style="background:#0a0b10;padding:16px;text-align:center;color:#52525b;font-size:12px">
          © 2025 Cryptogamer's · <a href="mailto:hola@cryptogamer.ar" style="color:#7c3aed">hola@cryptogamer.ar</a>
        </div>
      </div>
    `,
  }),

  contactConfirmation: (name: string) => ({
    subject: `Recibimos tu mensaje — Cryptogamer's`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0d0e14;color:#e0e0e0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#4f00b4,#1a0a33);padding:32px;text-align:center">
          <h1 style="margin:0;font-size:28px;color:#fff">Cryptogamer's</h1>
        </div>
        <div style="padding:32px">
          <p>Hola <strong style="color:#c084fc">${name}</strong>,</p>
          <p>Recibimos tu mensaje y te responderemos en menos de 24 horas.</p>
          <p style="color:#a1a1aa;font-size:13px">Si tu consulta es urgente, podés contactarnos por WhatsApp.</p>
        </div>
      </div>
    `,
  }),

  passwordReset: (resetUrl: string) => ({
    subject: `Restablecer contraseña — Cryptogamer's`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0d0e14;color:#e0e0e0;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#4f00b4,#1a0a33);padding:32px;text-align:center">
          <h1 style="margin:0;font-size:28px;color:#fff">Cryptogamer's</h1>
        </div>
        <div style="padding:32px;text-align:center">
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:14px 32px;border-radius:10px;font-weight:bold;text-decoration:none;margin:16px 0">
            Restablecer contraseña
          </a>
          <p style="color:#a1a1aa;font-size:13px">Este link expira en 1 hora. Si no solicitaste este cambio, ignorá este email.</p>
        </div>
      </div>
    `,
  }),
}
