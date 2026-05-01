import nodemailer from 'nodemailer'

/* ── Transport ───────────────────────────────────── */
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST  ?? 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM       = process.env.SMTP_FROM ?? "Cryptogamer's <noreply@cryptogamer.ar>"
const CONFIGURED = !!(process.env.SMTP_USER && process.env.SMTP_PASS)

/* ── Core sender ─────────────────────────────────── */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!CONFIGURED) {
    console.log(`\n📧 [EMAIL — no configurado] Para: ${to} | Asunto: ${subject}\n`)
    return
  }
  await transporter.sendMail({ from: FROM, to, subject, html })
}

/* ── Design tokens (match frontend palette) ──────── */
const T = {
  bg:         '#080910',
  card:       '#0d0e17',
  cardBorder: '#1a1b2e',
  surface:    '#12131f',
  primary:    '#39ff14',   // neon green — primary-container
  primaryDim: '#2bcc10',
  purple:     '#7c3aed',
  purpleLight:'#a855f7',
  cyan:       '#3af4ff',   // tertiary-container
  pink:       '#ff2d6b',   // secondary-container
  textMain:   '#e8eaf0',
  textMuted:  '#71717a',
  textDim:    '#52525b',
  white:      '#ffffff',
}

/* ── Shared layout shell ─────────────────────────── */
const shell = (content: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>Cryptogamer's</title>
</head>
<body style="margin:0;padding:0;background:${T.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${T.bg};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- ── HEADER ── -->
        <tr><td style="background:linear-gradient(135deg,#1a0a33 0%,#0f0f23 50%,#0a0b18 100%);border-radius:16px 16px 0 0;padding:0;overflow:hidden;border:1px solid ${T.cardBorder};border-bottom:none;">
          <!-- Top glow line -->
          <div style="height:2px;background:linear-gradient(90deg,transparent,${T.purple},${T.cyan},${T.primary},transparent);"></div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:36px 40px 28px;text-align:center;">
              <!-- Logo -->
              <div style="display:inline-block;background:linear-gradient(135deg,${T.purple}22,${T.purple}11);border:1px solid ${T.purple}44;border-radius:12px;padding:10px 20px;margin-bottom:16px;">
                <span style="font-size:22px;font-weight:900;letter-spacing:-0.5px;color:${T.white};font-family:'Helvetica Neue',Helvetica,sans-serif;">
                  Crypto<span style="color:${T.primary};text-shadow:0 0 12px ${T.primary}99;">gamer</span>'s
                </span>
              </div>
            </td></tr>
          </table>
        </td></tr>

        <!-- ── CONTENT ── -->
        <tr><td style="background:${T.card};border:1px solid ${T.cardBorder};border-top:none;border-bottom:none;padding:32px 40px;">
          ${content}
        </td></tr>

        <!-- ── FOOTER ── -->
        <tr><td style="background:${T.bg};border:1px solid ${T.cardBorder};border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
          <p style="margin:0 0 8px;font-size:12px;color:${T.textDim};">
            © 2025 Cryptogamer's &nbsp;·&nbsp;
            <a href="mailto:hola@cryptogamer.ar" style="color:${T.purple};text-decoration:none;">hola@cryptogamer.ar</a>
          </p>
          <p style="margin:0;font-size:11px;color:${T.textDim};">
            Este email fue enviado automáticamente. Por favor no respondas directamente.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

/* ── Reusable blocks ─────────────────────────────── */
const badge = (text: string, color = T.primary, bg = '') =>
  `<span style="display:inline-block;background:${bg || color + '18'};color:${color};border:1px solid ${color}44;border-radius:20px;padding:4px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">${text}</span>`

const divider = () =>
  `<div style="height:1px;background:linear-gradient(90deg,transparent,${T.cardBorder},transparent);margin:24px 0;"></div>`

const ctaButton = (href: string, text: string, color = T.purple) =>
  `<table cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
    <tr><td style="background:${color};border-radius:10px;box-shadow:0 0 20px ${color}55;">
      <a href="${href}" style="display:block;padding:14px 32px;font-size:14px;font-weight:700;color:${T.white};text-decoration:none;letter-spacing:0.3px;">${text}</a>
    </td></tr>
  </table>`

const statRow = (label: string, value: string, valueColor = T.textMain) =>
  `<tr>
    <td style="padding:8px 0;color:${T.textMuted};font-size:13px;width:40%;">${label}</td>
    <td style="padding:8px 0;color:${valueColor};font-size:13px;font-weight:600;text-align:right;">${value}</td>
  </tr>`

const infoBox = (content: string, borderColor = T.purple) =>
  `<div style="background:${T.surface};border:1px solid ${borderColor}33;border-left:3px solid ${borderColor};border-radius:8px;padding:20px;margin:16px 0;">
    ${content}
  </div>`

/* ── Templates ──────────────────────────────────── */
export const emailTemplates = {

  /* ── Confirmación de pedido al comprador ─────── */
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
    subject: `Pedido confirmado #${params.orderNumber} · Cryptogamer's`,
    html: shell(`
      <p style="margin:0 0 6px;font-size:12px;color:${T.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Confirmación de compra</p>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:${T.white};line-height:1.2;">¡Gracias por tu compra, ${params.buyerName}!</h1>
      <p style="margin:0 0 24px;font-size:14px;color:${T.textMuted};line-height:1.6;">Tu pedido fue recibido y está siendo procesado.</p>

      ${badge(`Orden #${params.orderNumber}`, T.primary)}

      ${divider()}

      <!-- Items -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <thead>
          <tr style="border-bottom:1px solid ${T.cardBorder};">
            <th style="text-align:left;padding:0 0 10px;font-size:11px;font-weight:700;color:${T.textDim};text-transform:uppercase;letter-spacing:1px;">Producto</th>
            <th style="text-align:center;padding:0 0 10px;font-size:11px;font-weight:700;color:${T.textDim};text-transform:uppercase;letter-spacing:1px;">Cant.</th>
            <th style="text-align:right;padding:0 0 10px;font-size:11px;font-weight:700;color:${T.textDim};text-transform:uppercase;letter-spacing:1px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${params.items.map(i => `
            <tr style="border-bottom:1px solid ${T.cardBorder}11;">
              <td style="padding:12px 0;color:${T.textMain};font-size:14px;">${i.name}</td>
              <td style="padding:12px 0;color:${T.textMuted};font-size:13px;text-align:center;">×${i.qty}</td>
              <td style="padding:12px 0;color:${T.primary};font-size:14px;font-weight:700;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td>
            </tr>`).join('')}
          <tr>
            <td colspan="2" style="padding-top:16px;font-size:13px;font-weight:700;color:${T.textMuted};text-transform:uppercase;letter-spacing:1px;">Total</td>
            <td style="padding-top:16px;font-size:22px;font-weight:900;color:${T.primary};text-align:right;text-shadow:0 0 12px ${T.primary}66;">$${params.total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      ${params.sellerAlias ? `
        ${divider()}
        <p style="margin:0 0 12px;font-size:12px;color:${T.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">💳 Datos para transferencia</p>
        ${infoBox(`
          <table width="100%" cellpadding="0" cellspacing="0">
            ${statRow('Vendedor',  params.sellerName        ?? '', T.purpleLight)}
            ${statRow('Banco',     params.sellerBank        ?? '', T.textMain)}
            ${statRow('Alias',     params.sellerAlias       ?? '', T.primary)}
            ${statRow('Titular',   params.sellerAccountHolder ?? '', T.textMain)}
            ${statRow('Monto a transferir', '$' + params.total.toFixed(2), T.primary)}
          </table>
        `, T.purple)}
        <p style="margin:12px 0 0;font-size:12px;color:${T.textMuted};text-align:center;">Realizá la transferencia y tu pedido quedará confirmado.</p>
      ` : ''}
    `),
  }),

  /* ── Nueva orden al vendedor ─────────────────── */
  newOrderSeller: (params: {
    sellerName: string
    orderNumber: string
    buyerName: string
    buyerEmail: string
    buyerPhone?: string
    total: number
    items: { name: string; qty: number; price: number }[]
  }) => ({
    subject: `Nueva venta #${params.orderNumber} · Cryptogamer's`,
    html: shell(`
      <p style="margin:0 0 6px;font-size:12px;color:${T.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Nueva venta</p>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:${T.white};line-height:1.2;">¡Hola ${params.sellerName}, tenés una venta!</h1>
      <p style="margin:0 0 24px;font-size:14px;color:${T.textMuted};">
        ${badge(`Orden #${params.orderNumber}`, T.purpleLight)}
      </p>

      ${infoBox(`
        <p style="margin:0 0 12px;font-size:11px;color:${T.textMuted};font-weight:700;text-transform:uppercase;letter-spacing:1.2px;">Datos del comprador</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${statRow('Nombre',    params.buyerName,           T.textMain)}
          ${statRow('Email',     params.buyerEmail,          T.purpleLight)}
          ${params.buyerPhone ? statRow('Teléfono', params.buyerPhone, T.textMain) : ''}
        </table>
      `, T.cyan)}

      ${divider()}

      <table width="100%" cellpadding="0" cellspacing="0">
        ${params.items.map(i => `
          <tr style="border-bottom:1px solid ${T.cardBorder};">
            <td style="padding:10px 0;color:${T.textMain};font-size:13px;">${i.name}</td>
            <td style="padding:10px 0;color:${T.textMuted};font-size:13px;text-align:center;">×${i.qty}</td>
            <td style="padding:10px 0;color:${T.primary};font-weight:700;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td>
          </tr>`).join('')}
        <tr>
          <td colspan="2" style="padding-top:14px;font-size:12px;font-weight:700;color:${T.textMuted};text-transform:uppercase;letter-spacing:1px;">Total a recibir</td>
          <td style="padding-top:14px;font-size:20px;font-weight:900;color:${T.primary};text-align:right;text-shadow:0 0 10px ${T.primary}66;">$${params.total.toFixed(2)}</td>
        </tr>
      </table>

      <p style="margin:24px 0 0;font-size:12px;color:${T.textMuted};text-align:center;line-height:1.6;">
        Aguardá la acreditación de la transferencia antes de confirmar el envío.
      </p>
    `),
  }),

  /* ── Nueva orden al admin ─────────────────────── */
  newOrderAdmin: (params: {
    orderNumber: string
    buyerName: string
    buyerEmail: string
    sellerName?: string
    total: number
  }) => ({
    subject: `Nueva orden #${params.orderNumber} en la tienda`,
    html: shell(`
      <p style="margin:0 0 6px;font-size:12px;color:${T.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Panel de administración</p>
      <h1 style="margin:0 0 24px;font-size:24px;font-weight:900;color:${T.white};line-height:1.2;">Nueva orden recibida</h1>

      ${infoBox(`
        <table width="100%" cellpadding="0" cellspacing="0">
          ${statRow('Orden',     '#' + params.orderNumber,  T.primary)}
          ${statRow('Comprador', params.buyerName,           T.textMain)}
          ${statRow('Email',     params.buyerEmail,          T.textMuted)}
          ${params.sellerName ? statRow('Vendedor', params.sellerName, T.purpleLight) : ''}
          ${statRow('Total',     '$' + params.total.toFixed(2), T.primary)}
        </table>
      `, T.primary)}

      ${ctaButton(
        `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/admin/pedidos`,
        'Ver en el panel →',
        T.purple
      )}
    `),
  }),

  /* ── Reset de contraseña ─────────────────────── */
  passwordReset: (resetUrl: string, name?: string) => ({
    subject: `Restablecer contraseña · Cryptogamer's`,
    html: shell(`
      <p style="margin:0 0 6px;font-size:12px;color:${T.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Seguridad de cuenta</p>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:${T.white};line-height:1.2;">${name ? `Hola ${name},` : 'Hola,'}</h1>
      <p style="margin:0 0 24px;font-size:14px;color:${T.textMuted};line-height:1.6;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en Cryptogamer's.<br>
        Hacé click en el botón de abajo para crear una nueva contraseña.
      </p>

      ${ctaButton(resetUrl, '🔑 Restablecer contraseña', T.purple)}

      ${divider()}

      ${infoBox(`
        <p style="margin:0;font-size:12px;color:${T.textMuted};line-height:1.8;">
          ⏰ <strong style="color:${T.textMain};">Este link expira en 1 hora.</strong><br>
          Si no solicitaste este cambio, podés ignorar este email. Tu contraseña no será modificada.
        </p>
      `, T.pink)}
    `),
  }),

  /* ── Confirmación de contacto ────────────────── */
  contactConfirmation: (name: string) => ({
    subject: `Recibimos tu mensaje · Cryptogamer's`,
    html: shell(`
      <p style="margin:0 0 6px;font-size:12px;color:${T.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Soporte</p>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:${T.white};line-height:1.2;">Hola <span style="color:${T.purpleLight};">${name}</span> 👋</h1>
      <p style="margin:0 0 24px;font-size:14px;color:${T.textMuted};line-height:1.6;">
        Recibimos tu mensaje y te responderemos dentro de las próximas <strong style="color:${T.textMain};">24 horas</strong>.
      </p>

      ${infoBox(`
        <p style="margin:0;font-size:13px;color:${T.textMuted};line-height:1.7;">
          Si tu consulta es urgente podés contactarnos directamente por WhatsApp o al email
          <a href="mailto:hola@cryptogamer.ar" style="color:${T.purple};text-decoration:none;">hola@cryptogamer.ar</a>
        </p>
      `, T.cyan)}

      <p style="margin:24px 0 0;font-size:13px;color:${T.textDim};text-align:center;">¡Gracias por comunicarte con nosotros!</p>
    `),
  }),
}
