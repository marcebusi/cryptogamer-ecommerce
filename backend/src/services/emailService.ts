import nodemailer from 'nodemailer'

/* ── Transport ───────────────────────────────────── */
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST  ?? 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: false, // TLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM    = process.env.SMTP_FROM ?? "Cryptogamer's <noreply@cryptogamer.ar>"
const CONFIGURED = !!(process.env.SMTP_USER && process.env.SMTP_PASS)

/* ── Core sender ─────────────────────────────────── */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!CONFIGURED) {
    console.log(`\n📧 [EMAIL — no configurado] Para: ${to}`)
    console.log(`   Asunto: ${subject}`)
    console.log(`   ${html.replace(/<[^>]+>/g, '').trim().substring(0, 200)}\n`)
    return
  }
  await transporter.sendMail({ from: FROM, to, subject, html })
}

/* ── Base layout ─────────────────────────────────── */
const layout = (content: string) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#0a0b10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:auto;background:#0d0e14;border-radius:16px;overflow:hidden;border:1px solid #1f1b2e">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4f00b4 0%,#1a0a33 100%);padding:36px 32px;text-align:center">
      <h1 style="margin:0;font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.5px">Cryptogamer's</h1>
      <p style="margin:6px 0 0;color:#c084fc;font-size:13px;letter-spacing:1px;text-transform:uppercase">Tu tienda gamer de confianza</p>
    </div>

    <!-- Content -->
    <div style="padding:32px">
      ${content}
    </div>

    <!-- Footer -->
    <div style="background:#080910;padding:20px 32px;text-align:center;border-top:1px solid #1f1b2e">
      <p style="margin:0;color:#52525b;font-size:12px">
        © 2025 Cryptogamer's &nbsp;·&nbsp;
        <a href="mailto:hola@cryptogamer.ar" style="color:#7c3aed;text-decoration:none">hola@cryptogamer.ar</a>
      </p>
    </div>
  </div>
</body>
</html>`

const btn = (href: string, text: string, color = '#7c3aed') =>
  `<a href="${href}" style="display:inline-block;background:${color};color:#fff;padding:14px 32px;border-radius:10px;font-weight:700;text-decoration:none;font-size:15px;margin:16px 0">${text}</a>`

const badge = (text: string, color = '#7c3aed') =>
  `<span style="display:inline-block;background:${color}22;color:${color};border:1px solid ${color}55;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">${text}</span>`

/* ── Templates ──────────────────────────────────── */
export const emailTemplates = {

  /* ── Confirmación de pedido al comprador ──── */
  orderConfirmation: (params: {
    orderNumber: string
    total: number
    buyerName: string
    items: { name: string; qty: number; price: number }[]
    sellerName?: string
    sellerAlias?: string
    sellerBank?: string
    sellerAccountHolder?: string
  }) => ({
    subject: `✅ Pedido confirmado #${params.orderNumber} — Cryptogamer's`,
    html: layout(`
      <p style="color:#c084fc;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-top:0">Confirmación de pedido</p>
      <h2 style="color:#fff;font-size:22px;margin:0 0 24px">Hola ${params.buyerName}, ¡tu pedido fue recibido! 🎮</h2>

      ${badge(`#${params.orderNumber}`, '#39ff14')}

      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        <thead>
          <tr style="border-bottom:2px solid #1f1b2e">
            <th style="text-align:left;padding:8px 0;color:#71717a;font-size:12px;text-transform:uppercase;font-weight:600">Producto</th>
            <th style="text-align:center;padding:8px 0;color:#71717a;font-size:12px;text-transform:uppercase;font-weight:600">Cant.</th>
            <th style="text-align:right;padding:8px 0;color:#71717a;font-size:12px;text-transform:uppercase;font-weight:600">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${params.items.map(i => `
            <tr style="border-bottom:1px solid #1a1a2e">
              <td style="padding:12px 0;color:#e0e0e0;font-size:14px">${i.name}</td>
              <td style="padding:12px 0;color:#a1a1aa;text-align:center;font-size:14px">x${i.qty}</td>
              <td style="padding:12px 0;text-align:right;color:#39ff14;font-weight:700;font-size:14px">$${(i.price * i.qty).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr>
            <td colspan="2" style="padding-top:16px;font-weight:900;color:#fff;font-size:15px">TOTAL</td>
            <td style="padding-top:16px;text-align:right;color:#39ff14;font-size:22px;font-weight:900">$${params.total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      ${params.sellerAlias ? `
        <div style="background:#0f0f1a;border:1px solid #7c3aed44;border-radius:12px;padding:20px;margin:24px 0">
          <p style="margin:0 0 12px;color:#c084fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px">💳 Datos para transferencia</p>
          <table style="width:100%;font-size:14px">
            <tr><td style="color:#71717a;padding:4px 0;width:40%">Vendedor</td><td style="color:#e0e0e0;font-weight:600">${params.sellerName}</td></tr>
            <tr><td style="color:#71717a;padding:4px 0">Banco</td><td style="color:#e0e0e0;font-weight:600">${params.sellerBank}</td></tr>
            <tr><td style="color:#71717a;padding:4px 0">Alias</td><td style="color:#39ff14;font-weight:700;font-family:monospace;font-size:15px">${params.sellerAlias}</td></tr>
            <tr><td style="color:#71717a;padding:4px 0">Titular</td><td style="color:#e0e0e0;font-weight:600">${params.sellerAccountHolder}</td></tr>
            <tr><td style="color:#71717a;padding:4px 0">Monto</td><td style="color:#39ff14;font-weight:900;font-size:16px">$${params.total.toFixed(2)}</td></tr>
          </table>
        </div>
      ` : ''}

      <p style="color:#71717a;font-size:13px;margin-bottom:0">
        ¿Tenés alguna consulta? Respondé este mail o contactanos por WhatsApp.
      </p>
    `),
  }),

  /* ── Notificación de nueva orden al vendedor ─ */
  newOrderSeller: (params: {
    sellerName: string
    orderNumber: string
    buyerName: string
    buyerEmail: string
    buyerPhone?: string
    total: number
    items: { name: string; qty: number; price: number }[]
  }) => ({
    subject: `🛒 Nueva orden #${params.orderNumber} — Cryptogamer's`,
    html: layout(`
      <p style="color:#c084fc;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-top:0">Nueva venta</p>
      <h2 style="color:#fff;font-size:22px;margin:0 0 8px">¡Hola ${params.sellerName}, tenés una nueva orden! 🎉</h2>
      <p style="color:#71717a;margin-top:0">${badge(`#${params.orderNumber}`, '#a855f7')}</p>

      <div style="background:#0f0f1a;border:1px solid #1f1b2e;border-radius:12px;padding:20px;margin:20px 0">
        <p style="margin:0 0 12px;color:#c084fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px">👤 Datos del comprador</p>
        <table style="width:100%;font-size:14px">
          <tr><td style="color:#71717a;padding:3px 0;width:35%">Nombre</td><td style="color:#e0e0e0;font-weight:600">${params.buyerName}</td></tr>
          <tr><td style="color:#71717a;padding:3px 0">Email</td><td style="color:#e0e0e0">${params.buyerEmail}</td></tr>
          ${params.buyerPhone ? `<tr><td style="color:#71717a;padding:3px 0">Teléfono</td><td style="color:#e0e0e0">${params.buyerPhone}</td></tr>` : ''}
        </table>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        ${params.items.map(i => `
          <tr style="border-bottom:1px solid #1a1a2e">
            <td style="padding:10px 0;color:#e0e0e0;font-size:14px">${i.name}</td>
            <td style="padding:10px 0;color:#a1a1aa;text-align:center;font-size:14px">x${i.qty}</td>
            <td style="padding:10px 0;text-align:right;color:#39ff14;font-weight:700">$${(i.price * i.qty).toFixed(2)}</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="2" style="padding-top:12px;font-weight:900;color:#fff">TOTAL</td>
          <td style="padding-top:12px;text-align:right;color:#39ff14;font-size:20px;font-weight:900">$${params.total.toFixed(2)}</td>
        </tr>
      </table>

      <p style="color:#71717a;font-size:13px">
        El comprador fue informado de tus datos de transferencia. Aguardá la acreditación antes de confirmar el envío.
      </p>
    `),
  }),

  /* ── Notificación de nueva orden al admin ──── */
  newOrderAdmin: (params: {
    orderNumber: string
    buyerName: string
    buyerEmail: string
    sellerName?: string
    total: number
  }) => ({
    subject: `📦 Nueva orden #${params.orderNumber} en la tienda`,
    html: layout(`
      <p style="color:#c084fc;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-top:0">Panel de admin</p>
      <h2 style="color:#fff;font-size:22px;margin:0 0 24px">Nueva orden recibida 📦</h2>

      <div style="background:#0f0f1a;border:1px solid #1f1b2e;border-radius:12px;padding:20px">
        <table style="width:100%;font-size:14px">
          <tr><td style="color:#71717a;padding:5px 0;width:35%">Orden</td><td style="color:#39ff14;font-weight:700;font-family:monospace">#${params.orderNumber}</td></tr>
          <tr><td style="color:#71717a;padding:5px 0">Comprador</td><td style="color:#e0e0e0">${params.buyerName}</td></tr>
          <tr><td style="color:#71717a;padding:5px 0">Email</td><td style="color:#e0e0e0">${params.buyerEmail}</td></tr>
          ${params.sellerName ? `<tr><td style="color:#71717a;padding:5px 0">Vendedor</td><td style="color:#c084fc;font-weight:600">${params.sellerName}</td></tr>` : ''}
          <tr><td style="color:#71717a;padding:5px 0">Total</td><td style="color:#39ff14;font-weight:900;font-size:18px">$${params.total.toFixed(2)}</td></tr>
        </table>
      </div>

      <div style="text-align:center;margin-top:24px">
        ${btn(`${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/admin/pedidos`, 'Ver en el panel', '#7c3aed')}
      </div>
    `),
  }),

  /* ── Reset de contraseña ─────────────────────── */
  passwordReset: (resetUrl: string, name?: string) => ({
    subject: `🔐 Restablecer contraseña — Cryptogamer's`,
    html: layout(`
      <p style="color:#c084fc;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-top:0">Seguridad de cuenta</p>
      <h2 style="color:#fff;font-size:22px;margin:0 0 16px">${name ? `Hola ${name},` : 'Hola,'} ¿olvidaste tu contraseña?</h2>
      <p style="color:#a1a1aa;line-height:1.6">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Hacé click en el botón de abajo para crear una nueva contraseña.</p>

      <div style="text-align:center">
        ${btn(resetUrl, '🔑 Restablecer contraseña')}
      </div>

      <div style="background:#0f0f1a;border:1px solid #292524;border-radius:8px;padding:14px;margin-top:16px">
        <p style="margin:0;color:#71717a;font-size:12px">
          ⏰ Este link expira en <strong style="color:#a1a1aa">1 hora</strong>.<br>
          Si no solicitaste este cambio, podés ignorar este email. Tu contraseña no se modificará.
        </p>
      </div>
    `),
  }),

  /* ── Confirmación de contacto ────────────────── */
  contactConfirmation: (name: string) => ({
    subject: `📩 Recibimos tu mensaje — Cryptogamer's`,
    html: layout(`
      <h2 style="color:#fff;font-size:22px;margin:0 0 16px">Hola <span style="color:#c084fc">${name}</span> 👋</h2>
      <p style="color:#a1a1aa;line-height:1.6">Recibimos tu mensaje y te responderemos dentro de las próximas <strong style="color:#e0e0e0">24 horas</strong>.</p>
      <p style="color:#a1a1aa;line-height:1.6">Si tu consulta es urgente, contactanos por WhatsApp.</p>
      <p style="color:#71717a;font-size:13px;margin-bottom:0">¡Gracias por comunicarte con nosotros!</p>
    `),
  }),
}
