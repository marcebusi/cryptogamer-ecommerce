import nodemailer from 'nodemailer'
import { Resend }  from 'resend'

/* ── Config ──────────────────────────────────────── */
const FROM             = process.env.EMAIL_FROM ?? process.env.SMTP_FROM ?? "Cryptogamer's <noreply@cryptogamer.ar>"
const RESEND_KEY       = process.env.RESEND_API_KEY ?? ''
const CONFIGURED_RESEND = !!RESEND_KEY
const CONFIGURED_SMTP   = !!(process.env.SMTP_USER && process.env.SMTP_PASS)
const CONFIGURED        = CONFIGURED_RESEND || CONFIGURED_SMTP

/* ── Resend client (HTTP — works on Hostinger VPS) ── */
const resend = CONFIGURED_RESEND ? new Resend(RESEND_KEY) : null

/* ── SMTP fallback (for local dev) ──────────────── */
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
})

// Startup diagnostics
if (CONFIGURED_RESEND) {
  console.log('✅ [EMAIL] Resend configurado — usando API HTTP (recomendado en VPS)')
} else if (CONFIGURED_SMTP) {
  console.log('✅ [EMAIL] SMTP configurado —', process.env.SMTP_USER)
  transporter.verify()
    .then(() => console.log('✅ [EMAIL] SMTP conectado correctamente'))
    .catch(err  => console.error('❌ [EMAIL] Error SMTP:', err?.message ?? err))
} else {
  console.warn('⚠️  [EMAIL] Sin configuración — definí RESEND_API_KEY (recomendado) o SMTP_USER+SMTP_PASS en .env')
}

/* ── Core sender ─────────────────────────────────── */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!CONFIGURED) {
    console.log(`📧 [EMAIL — no configurado] Para: ${to} | Asunto: ${subject}`)
    return
  }

  console.log(`📧 [EMAIL] Enviando a ${to} — "${subject}"`)

  if (resend) {
    // Resend: HTTP API, funciona en Hostinger y cualquier VPS
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) throw new Error(`Resend error: ${error.message}`)
  } else {
    // Fallback SMTP (dev local)
    await transporter.sendMail({ from: FROM, to, subject, html })
  }

  console.log(`✅ [EMAIL] Enviado correctamente a ${to}`)
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
            © ${new Date().getFullYear()} Cryptogamer's &nbsp;·&nbsp;
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

  /* ── Confirmación de pedido / Factura al comprador ─── */
  orderConfirmation: (params: {
    orderNumber:         string
    total:               number
    buyerName:           string
    items:               { name: string; qty: number; price: number }[]
    paymentMethod?:      string
    shippingCost?:       number
    sellerName?:         string
    sellerAlias?:        string
    sellerBank?:         string
    sellerAccountHolder?: string
  }) => {
    const trackingUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/seguimiento/${params.orderNumber}`
    const now         = new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric' })
    const subtotal    = params.items.reduce((s,i) => s + i.price * i.qty, 0)
    const shipping    = params.shippingCost ?? 0
    const payLabel: Record<string,string> = {
      transfer: 'Transferencia bancaria',
      cash:     'Efectivo',
      usdt:     'Crypto (USDT)',
      mercadopago: 'Mercado Pago',
    }
    const payText = payLabel[params.paymentMethod ?? ''] ?? 'Transferencia bancaria'

    return ({
    subject: `🧾 Comprobante de compra #${params.orderNumber} · Cryptogamer's`,
    html: shell(`
      <!-- Invoice header -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td>
            <p style="margin:0 0 4px;font-size:12px;color:${T.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Comprobante de compra</p>
            <h1 style="margin:0 0 4px;font-size:22px;font-weight:900;color:${T.white};line-height:1.2;">¡Gracias, ${params.buyerName}!</h1>
            <p style="margin:0;font-size:13px;color:${T.textMuted};">Tu pedido fue recibido correctamente.</p>
          </td>
          <td style="text-align:right;vertical-align:top;">
            <p style="margin:0;font-size:11px;color:${T.textDim};">Fecha</p>
            <p style="margin:2px 0 0;font-size:13px;color:${T.textMain};font-weight:600;">${now}</p>
          </td>
        </tr>
      </table>

      <!-- Order & payment info -->
      ${infoBox(`
        <table width="100%" cellpadding="0" cellspacing="0">
          ${statRow('N° de pedido',     '#' + params.orderNumber, T.primary)}
          ${statRow('Método de pago',   payText,                  T.textMain)}
          ${params.sellerName ? statRow('Vendedor', params.sellerName, T.purpleLight) : ''}
        </table>
      `, T.purple)}

      ${divider()}

      <!-- Line items -->
      <p style="margin:0 0 10px;font-size:11px;color:${T.textDim};text-transform:uppercase;letter-spacing:1px;font-weight:700;">Detalle de productos</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <thead>
          <tr style="border-bottom:1px solid ${T.cardBorder};">
            <th style="text-align:left;padding:0 0 8px;font-size:11px;font-weight:700;color:${T.textDim};text-transform:uppercase;letter-spacing:1px;">Producto</th>
            <th style="text-align:center;padding:0 0 8px;font-size:11px;font-weight:700;color:${T.textDim};letter-spacing:1px;">Cant.</th>
            <th style="text-align:right;padding:0 0 8px;font-size:11px;font-weight:700;color:${T.textDim};text-transform:uppercase;letter-spacing:1px;">Precio unit.</th>
            <th style="text-align:right;padding:0 0 8px;font-size:11px;font-weight:700;color:${T.textDim};text-transform:uppercase;letter-spacing:1px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${params.items.map(i => `
            <tr style="border-bottom:1px solid ${T.cardBorder}22;">
              <td style="padding:10px 0;color:${T.textMain};font-size:13px;">${i.name}</td>
              <td style="padding:10px 0;color:${T.textMuted};font-size:13px;text-align:center;">×${i.qty}</td>
              <td style="padding:10px 0;color:${T.textMuted};font-size:13px;text-align:right;">$${i.price.toLocaleString('es-AR')}</td>
              <td style="padding:10px 0;color:${T.textMain};font-size:13px;font-weight:600;text-align:right;">$${(i.price * i.qty).toLocaleString('es-AR')}</td>
            </tr>`).join('')}
        </tbody>
      </table>

      <!-- Totals -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-top:1px solid ${T.cardBorder};">
        ${subtotal !== params.total ? `
          <tr>
            <td style="padding:6px 0;font-size:13px;color:${T.textMuted};">Subtotal</td>
            <td style="padding:6px 0;font-size:13px;color:${T.textMuted};text-align:right;">$${subtotal.toLocaleString('es-AR')}</td>
          </tr>` : ''}
        ${shipping > 0 ? `
          <tr>
            <td style="padding:6px 0;font-size:13px;color:${T.textMuted};">Envío</td>
            <td style="padding:6px 0;font-size:13px;color:${T.textMuted};text-align:right;">$${shipping.toLocaleString('es-AR')}</td>
          </tr>` : `
          <tr>
            <td style="padding:6px 0;font-size:13px;color:${T.textMuted};">Retiro a domicilio</td>
            <td style="padding:6px 0;font-size:13px;color:#39ff14;text-align:right;font-weight:700;">Gratis</td>
          </tr>`}
        <tr style="border-top:1px solid ${T.cardBorder};margin-top:8px;">
          <td style="padding:12px 0 0;font-size:16px;font-weight:900;color:${T.white};">TOTAL</td>
          <td style="padding:12px 0 0;font-size:22px;font-weight:900;color:${T.primary};text-align:right;text-shadow:0 0 12px ${T.primary}66;">$${params.total.toLocaleString('es-AR')}</td>
        </tr>
      </table>

      ${params.sellerAlias ? `
        ${divider()}
        <p style="margin:0 0 12px;font-size:12px;color:${T.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">💳 Datos para transferencia</p>
        ${infoBox(`
          <table width="100%" cellpadding="0" cellspacing="0">
            ${statRow('Banco / Billetera', params.sellerBank        ?? '', T.textMain)}
            ${statRow('Alias',              params.sellerAlias       ?? '', T.primary)}
            ${statRow('Titular',            params.sellerAccountHolder ?? '', T.textMain)}
            ${statRow('Monto exacto',       '$' + params.total.toLocaleString('es-AR'), T.primary)}
          </table>
        `, T.purple)}
        <p style="margin:12px 0 0;font-size:12px;color:${T.textMuted};text-align:center;">
          Una vez acreditada la transferencia, el vendedor confirmará tu pedido.
        </p>
      ` : ''}

      ${ctaButton(trackingUrl, '📦 Seguir mi pedido →', T.purple)}
    `),
  })},

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

  /* ── Notificación al dueño de tienda ────────── */
  contactNotification: (params: { name: string; email: string; message: string }) => ({
    subject: `📩 Nuevo contacto de ${params.name} · Cryptogamer's`,
    html: shell(`
      <p style="margin:0 0 6px;font-size:12px;color:${T.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Formulario de contacto</p>
      <h1 style="margin:0 0 24px;font-size:22px;font-weight:900;color:${T.white};line-height:1.2;">
        Nuevo mensaje de <span style="color:${T.purpleLight};">${params.name}</span>
      </h1>

      ${infoBox(`
        <table width="100%" cellpadding="0" cellspacing="0">
          ${statRow('Nombre', params.name, T.textMain)}
          ${statRow('Email',  params.email, T.purpleLight)}
        </table>
      `, T.cyan)}

      ${divider()}

      <p style="margin:0 0 8px;font-size:12px;color:${T.textMuted};font-weight:700;text-transform:uppercase;letter-spacing:1px;">Mensaje</p>
      ${infoBox(`<p style="margin:0;font-size:14px;color:${T.textMain};line-height:1.7;white-space:pre-wrap;">${params.message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`, T.purple)}

      ${ctaButton(`mailto:${params.email}`, `Responder a ${params.name} →`, T.purple)}
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

  /* ── Actualización de estado de pedido ──────── */
  statusUpdate: (params: {
    orderNumber:   string
    customerName:  string
    status:        string
    trackingCode?: string
  }) => {
    const trackingUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/seguimiento/${params.orderNumber}`

    const STATUS_INFO: Record<string, { label: string; color: string; icon: string; msg: string }> = {
      CONFIRMED:  { label: 'Pago confirmado',    color: T.cyan,    icon: '✅', msg: 'Confirmamos la recepción de tu pago. Tu pedido está en cola para ser preparado.' },
      PROCESSING: { label: 'En preparación',     color: '#f59e0b', icon: '📦', msg: 'Estamos preparando tu pedido. Pronto estará listo para ser enviado.' },
      SHIPPED:    { label: 'Pedido enviado',      color: T.primary, icon: '🚚', msg: 'Tu pedido ya está en camino. Podés rastrearlo usando el botón de abajo.' },
      COMPLETED:  { label: 'Pedido entregado',   color: T.primary, icon: '🏠', msg: '¡Tu pedido fue entregado! Gracias por comprar en Cryptogamer\'s.' },
      CANCELLED:  { label: 'Pedido cancelado',   color: '#ef4444', icon: '❌', msg: 'Lamentamos informarte que tu pedido fue cancelado. Si tenés dudas contactanos.' },
      PENDING:    { label: 'Pedido recibido',     color: T.purple,  icon: '📬', msg: 'Recibimos tu pedido y está pendiente de confirmación de pago.' },
    }
    const info = STATUS_INFO[params.status] ?? {
      label: params.status, color: T.purple, icon: '📋',
      msg: 'El estado de tu pedido fue actualizado.',
    }

    return ({
      subject: `${info.icon} Tu pedido ${params.orderNumber} — ${info.label} · Cryptogamer's`,
      html: shell(`
        <p style="margin:0 0 6px;font-size:12px;color:${T.textMuted};text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Actualización de pedido</p>
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:${T.white};line-height:1.2;">
          Hola <span style="color:${T.purpleLight};">${params.customerName}</span>,
        </h1>
        <p style="margin:0 0 24px;font-size:14px;color:${T.textMuted};">
          ${badge(params.orderNumber, T.primary)}
          &nbsp;
          ${badge(info.label, info.color)}
        </p>

        ${infoBox(`
          <p style="margin:0 0 12px;font-size:28px;text-align:center;">${info.icon}</p>
          <p style="margin:0;font-size:14px;color:${T.textMain};text-align:center;line-height:1.6;">${info.msg}</p>
          ${params.trackingCode ? `
            <div style="margin-top:16px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;color:${T.textMuted};text-transform:uppercase;letter-spacing:1px;">Número de seguimiento</p>
              <p style="margin:0;font-size:18px;font-weight:900;color:${T.primary};letter-spacing:2px;font-family:monospace;">${params.trackingCode}</p>
            </div>
          ` : ''}
        `, info.color)}

        ${ctaButton(trackingUrl, '📦 Ver estado del pedido →', T.purple)}
      `),
    })
  },
}
