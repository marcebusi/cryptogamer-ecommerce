import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import './AuthModal.css'

type View = 'login' | 'register' | 'forgot'

interface Props {
  isOpen: boolean
  onClose: () => void
  defaultView?: View
}

export default function AuthModal({ isOpen, onClose, defaultView = 'login' }: Props) {
  const { login, register, forgotPassword } = useAuth()
  const [view,  setView]  = useState<View>(defaultView)
  const [error, setError] = useState('')
  const [info,  setInfo]  = useState('')
  const [busy,  setBusy]  = useState(false)

  /* ── Login form ──────────────────────────── */
  const [loginEmail,    setLoginEmail]    = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  /* ── Register form ───────────────────────── */
  const [regName,     setRegName]     = useState('')
  const [regEmail,    setRegEmail]    = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm,  setRegConfirm]  = useState('')
  const [showPass,    setShowPass]    = useState(false)

  /* ── Forgot form ─────────────────────────── */
  const [forgotEmail, setForgotEmail] = useState('')

  const reset = useCallback(() => {
    setError(''); setInfo(''); setBusy(false)
    setLoginEmail(''); setLoginPassword('')
    setRegName(''); setRegEmail(''); setRegPassword(''); setRegConfirm('')
    setForgotEmail('')
  }, [])

  useEffect(() => { if (isOpen) { setView(defaultView); reset() } }, [isOpen, defaultView, reset])

  /* Close on Escape */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  /* Body scroll lock */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  /* ── Handlers ─────────────────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!loginEmail || !loginPassword) { setError('Completá todos los campos.'); return }
    setBusy(true)
    try { await login(loginEmail, loginPassword); onClose() }
    catch (err) { setError((err as Error).message) }
    finally { setBusy(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!regName || !regEmail || !regPassword || !regConfirm) { setError('Completá todos los campos.'); return }
    if (regPassword !== regConfirm) { setError('Las contraseñas no coinciden.'); return }
    if (regPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setBusy(true)
    try { await register(regName, regEmail, regPassword); onClose() }
    catch (err) { setError((err as Error).message) }
    finally { setBusy(false) }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!forgotEmail) { setError('Ingresá tu email.'); return }
    setBusy(true)
    try { const msg = await forgotPassword(forgotEmail); setInfo(msg); setForgotEmail('') }
    catch (err) { setError((err as Error).message) }
    finally { setBusy(false) }
  }

  /* ── Shared input class ───────────────────── */
  const inp = 'auth-input w-full bg-surface-container border border-outline-variant rounded-xl px-sm py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all'

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:px-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="auth-modal relative w-full max-w-md sm:rounded-2xl rounded-t-2xl border border-purple-500/25 shadow-[0_0_60px_rgba(138,43,226,0.25)] overflow-hidden max-h-[90dvh] overflow-y-auto">

        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer z-10"
          aria-label="Cerrar"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header logo */}
        <div className="px-lg pt-lg pb-md text-center">
          <span className="text-2xl font-black italic text-purple-400 drop-shadow-[0_0_10px_rgba(138,43,226,0.6)] font-['Plus_Jakarta_Sans']">
            Cryptogamer
          </span>
        </div>

        {/* Tabs */}
        {view !== 'forgot' && (
          <div className="flex mx-lg mb-md border border-white/10 rounded-xl overflow-hidden">
            {(['login', 'register'] as const).map(v => (
              <button
                key={v}
                onClick={() => { setView(v); setError('') }}
                className={`flex-1 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                  view === v
                    ? 'bg-purple-600/30 text-purple-300'
                    : 'text-on-surface-variant hover:bg-white/5'
                }`}
              >
                {v === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>
        )}

        {/* Feedback */}
        {error && (
          <div className="mx-lg mb-sm px-sm py-2.5 bg-error/10 border border-error/30 rounded-xl text-sm text-error flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm flex-shrink-0">error</span>
            {error}
          </div>
        )}
        {info && (
          <div className="mx-lg mb-sm px-sm py-2.5 bg-primary-container/10 border border-primary-container/30 rounded-xl text-sm text-primary-container flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm flex-shrink-0">check_circle</span>
            {info}
          </div>
        )}

        {/* ── Login ─────────────────────────────── */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="px-lg pb-lg space-y-sm">
            <div>
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                placeholder="tu@email.com" className={inp} autoComplete="email" />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Contraseña</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••" className={`${inp} pr-10`} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-sm">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button type="button" onClick={() => { setView('forgot'); setError('') }}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">
              ¿Olvidaste tu contraseña?
            </button>

            <button type="submit" disabled={busy}
              className="w-full bg-primary-container text-on-primary py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-sm">
              {busy
                ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Ingresando...</>
                : <><span className="material-symbols-outlined text-sm">login</span>Iniciar sesión</>}
            </button>
          </form>
        )}

        {/* ── Register ──────────────────────────── */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="px-lg pb-lg space-y-sm">
            <div>
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Nombre completo</label>
              <input type="text" value={regName} onChange={e => setRegName(e.target.value)}
                placeholder="Tu nombre" className={inp} autoComplete="name" />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Email</label>
              <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                placeholder="tu@email.com" className={inp} autoComplete="email" />
            </div>
            <div className="grid grid-cols-2 gap-sm">
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Contraseña</label>
                <input type={showPass ? 'text' : 'password'} value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Mín. 6 caracteres" className={inp} autoComplete="new-password" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Confirmar</label>
                <input type={showPass ? 'text' : 'password'} value={regConfirm}
                  onChange={e => setRegConfirm(e.target.value)}
                  placeholder="Repetir contraseña" className={inp} autoComplete="new-password" />
              </div>
            </div>
            <label className="flex items-center gap-xs cursor-pointer text-xs text-on-surface-variant">
              <input type="checkbox" checked={showPass} onChange={e => setShowPass(e.target.checked)}
                className="accent-purple-500 cursor-pointer" />
              Mostrar contraseñas
            </label>

            <button type="submit" disabled={busy}
              className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(138,43,226,0.4)] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-xs">
              {busy
                ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Creando cuenta...</>
                : <><span className="material-symbols-outlined text-sm">person_add</span>Crear cuenta</>}
            </button>
            <p className="text-center text-[11px] text-on-surface-variant">
              Al registrarte aceptás nuestros <span className="text-purple-400 cursor-pointer hover:underline">términos y condiciones</span>.
            </p>
          </form>
        )}

        {/* ── Forgot password ────────────────────── */}
        {view === 'forgot' && (
          <form onSubmit={handleForgot} className="px-lg pb-lg space-y-sm">
            <div className="text-center mb-md">
              <div className="w-14 h-14 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-sm">
                <span className="material-symbols-outlined text-purple-400 text-2xl">lock_reset</span>
              </div>
              <h3 className="font-bold text-on-surface font-['Plus_Jakarta_Sans'] mb-1">Restablecer contraseña</h3>
              <p className="text-xs text-on-surface-variant">Ingresá tu email y te enviaremos un enlace.</p>
            </div>

            {!info && (
              <>
                <div>
                  <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Email</label>
                  <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                    placeholder="tu@email.com" className={inp} autoComplete="email" />
                </div>
                <button type="submit" disabled={busy}
                  className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:bg-purple-500 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  {busy
                    ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Enviando...</>
                    : <><span className="material-symbols-outlined text-sm">send</span>Enviar enlace</>}
                </button>
              </>
            )}

            <button type="button" onClick={() => { setView('login'); setError(''); setInfo('') }}
              className="w-full text-sm text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-xs cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Volver al login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
