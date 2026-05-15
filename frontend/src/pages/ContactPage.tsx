import { useState } from 'react'
import './ContactPage.css'
import { api } from '../lib/api'

type Status = 'idle' | 'sending' | 'success' | 'error'

const SUBJECTS = [
  'Consulta sobre un producto',
  'Estado de mi pedido',
  'Devolución o garantía',
  'Soporte técnico',
  'Vender mi equipo',
  'Otro',
]

const contactInfo = [
  {
    icon: 'mail',
    color: 'text-tertiary-container',
    bg: 'bg-tertiary-container/10 border-tertiary-container/20',
    title: 'Email',
    value: 'hola@cryptogamer.ar',
    sub: 'Respondemos en menos de 24 hs',
  },
  {
    icon: 'chat',
    color: 'text-primary-container',
    bg: 'bg-primary-container/10 border-primary-container/20',
    title: 'WhatsApp',
    value: '+54 11 4000-0000',
    sub: 'Lun – Sáb · 9 a 21 hs',
  },
  {
    icon: 'storefront',
    color: 'text-secondary-container',
    bg: 'bg-secondary-container/10 border-secondary-container/20',
    title: 'Tienda física',
    value: 'Av. Corrientes 1234, CABA',
    sub: 'Lun – Vie · 10 a 19 hs',
  },
  {
    icon: 'schedule',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/20',
    title: 'Horario de atención',
    value: 'Lun a Sáb · 9 – 21 hs',
    sub: 'Domingos: 12 – 18 hs',
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('idle')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Requerido'
    if (!form.email.includes('@')) e.email = 'Email inválido'
    if (!form.message.trim() || form.message.length < 10) e.message = 'Mínimo 10 caracteres'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStatus('sending')
    try {
      await api.post('/api/contact', { name: form.name, email: form.email, message: `[${form.subject}] ${form.message}` })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const inp = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full bg-surface-container border rounded-xl px-sm py-xs text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 transition-all ${
          errors[key]
            ? 'border-error focus:ring-error/30'
            : 'border-outline-variant focus:border-tertiary-container focus:ring-tertiary-container/20'
        }`}
      />
      {errors[key] && <p className="text-xs text-error mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <main className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="contact-hero relative overflow-hidden border-b border-purple-500/20">
        <div className="absolute inset-0 contact-grid-bg pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-tertiary-container/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-screen-xl mx-auto px-4 md:px-8 py-xl text-center">
          <div className="inline-flex items-center gap-xs px-sm py-1.5 rounded-full bg-tertiary-container/15 border border-tertiary-container/25 text-tertiary-container text-xs font-bold uppercase tracking-widest mb-md">
            <span className="material-symbols-outlined text-sm">support_agent</span>
            Soporte Cryptogamer
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-on-background font-['Plus_Jakarta_Sans'] leading-tight mb-md">
            ¿Cómo podemos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary-container to-primary-container">
              ayudarte?
            </span>
          </h1>

          <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
            Estamos acá para responder todas tus preguntas sobre productos, pedidos y más.
          </p>
        </div>
      </section>

      {/* ── Info cards + Form ────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-4 md:px-8 py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">

          {/* Left — contact info */}
          <div className="lg:col-span-5 space-y-md">
            <div>
              <h2 className="text-2xl font-black text-on-surface font-['Plus_Jakarta_Sans'] mb-xs">
                Contacto directo
              </h2>
              <p className="text-on-surface-variant text-sm">
                Elegí el canal que prefieras. Siempre respondemos.
              </p>
            </div>

            <div className="space-y-sm">
              {contactInfo.map(c => (
                <div
                  key={c.title}
                  className={`contact-info-card flex items-start gap-sm p-sm rounded-2xl border ${c.bg} transition-all duration-200 hover:scale-[1.02] cursor-default`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg} border`}>
                    <span className={`material-symbols-outlined ${c.color} text-2xl`}>{c.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold mb-0.5">
                      {c.title}
                    </p>
                    <p className={`font-bold text-on-surface ${c.color}`}>{c.value}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="pt-sm border-t border-white/8">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-sm">También en redes</p>
              <div className="flex gap-sm">
                {[
                  { fa: 'fa-brands fa-facebook', label: 'Facebook', href: 'https://www.facebook.com/groups/840438795976507', color: 'hover:text-blue-500 hover:border-blue-500/40' },
                  { fa: 'fa-brands fa-whatsapp', label: 'WhatsApp', href: 'https://wa.me/541140000000',                     color: 'hover:text-green-400 hover:border-green-400/40' },
                ].map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center gap-1 p-sm rounded-xl border border-white/10 bg-surface-container text-on-surface-variant transition-all cursor-pointer ${s.color}`}
                    aria-label={s.label}
                  >
                    <i className={`${s.fa} text-xl`} />
                    <span className="text-[10px] font-semibold">{s.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-7">
            <div className="contact-form-card rounded-2xl border border-purple-500/20 p-lg relative overflow-hidden">
              {/* Top glow line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tertiary-container/50 to-transparent" />
              {/* Corner glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-xl text-center space-y-md">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-container/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-20 h-20 rounded-full bg-primary-container/10 border border-primary-container/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-container text-4xl">check_circle</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-on-surface font-['Plus_Jakarta_Sans'] mb-xs">
                      ¡Mensaje enviado!
                    </h3>
                    <p className="text-on-surface-variant">
                      Te contactaremos a <span className="text-tertiary-container font-semibold">{form.email}</span> a la brevedad.
                    </p>
                  </div>
                  <button
                    onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' }) }}
                    className="px-lg py-sm border border-outline-variant text-on-surface rounded-xl font-semibold hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-lg relative z-10">
                    <h2 className="text-xl font-black text-on-surface font-['Plus_Jakarta_Sans'] mb-xs flex items-center gap-xs">
                      <span className="material-symbols-outlined text-tertiary-container">edit_square</span>
                      Envianos un mensaje
                    </h2>
                    <p className="text-sm text-on-surface-variant">Completá el formulario y te respondemos pronto.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-sm relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                      {inp('name', 'Nombre completo', 'text', 'Tu nombre')}
                      {inp('email', 'Email', 'email', 'tu@email.com')}
                    </div>

                    <div>
                      <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">
                        Asunto
                      </label>
                      <select
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl px-sm py-xs text-sm text-on-surface outline-none focus:border-tertiary-container focus:ring-2 focus:ring-tertiary-container/20 cursor-pointer"
                      >
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">
                        Mensaje
                      </label>
                      <textarea
                        rows={5}
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Contanos en qué te podemos ayudar..."
                        className={`w-full bg-surface-container border rounded-xl px-sm py-xs text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 transition-all resize-none ${
                          errors.message
                            ? 'border-error focus:ring-error/30'
                            : 'border-outline-variant focus:border-tertiary-container focus:ring-tertiary-container/20'
                        }`}
                      />
                      {errors.message && <p className="text-xs text-error mt-1">{errors.message}</p>}
                      <p className="text-xs text-on-surface-variant/50 mt-1 text-right">{form.message.length} / 500</p>
                    </div>

                    {/* Trust row */}
                    <div className="flex flex-wrap gap-md text-xs text-on-surface-variant py-xs border-t border-white/8">
                      <span className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-xs text-primary-container">lock</span>
                        Datos protegidos
                      </span>
                      <span className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-xs text-tertiary-container">schedule</span>
                        Respuesta en &lt; 24 hs
                      </span>
                      <span className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-xs text-secondary-container">verified</span>
                        Sin spam
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="contact-submit-btn w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-xs active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'sending' ? (
                        <>
                          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                          Enviando mensaje...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">send</span>
                          Enviar mensaje
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ strip ────────────────────────────────── */}
      <section className="contact-faq-section border-t border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-lg">
          <h2 className="text-xl font-black text-on-surface font-['Plus_Jakarta_Sans'] mb-lg text-center">
            Preguntas frecuentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
            {[
              { q: '¿Cuánto tarda el envío?', a: 'Los envíos dentro de CABA llegan en 24–48 hs. Interior del país 3–5 días hábiles con OCA o Andreani.' },
              { q: '¿Qué garantía tienen los productos?', a: 'Solo los productos nuevos cuentan con garantía de 30 días. Los productos usados se venden en el estado descrito y no incluyen garantía.' },
              { q: '¿Puedo ver el producto antes de comprarlo?', a: 'Si elegís retiro en domicilio, podés coordinar una visita con el vendedor para revisar el estado del producto en persona antes de confirmar el pago. No estás obligado a transferir hasta que estés conforme.' },
              { q: '¿Cómo puedo vender mi equipo?', a: 'Completá el formulario indicando el asunto "Vender mi equipo" y te cotizamos en menos de 2 horas.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-surface-container rounded-xl border border-white/8 p-sm hover:border-purple-500/20 transition-colors">
                <p className="font-semibold text-on-surface mb-xs text-sm flex items-start gap-xs">
                  <span className="material-symbols-outlined text-primary-container text-base flex-shrink-0 mt-0.5">help</span>
                  {q}
                </p>
                <p className="text-sm text-on-surface-variant leading-relaxed pl-6">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
