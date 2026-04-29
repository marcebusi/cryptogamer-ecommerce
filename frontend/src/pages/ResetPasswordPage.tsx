import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { resetPassword } = useAuth()

  const token = searchParams.get('token') ?? ''

  const [password, setPassword]   = useState('')
  const [confirm,  setConfirm]    = useState('')
  const [showPwd,  setShowPwd]    = useState(false)
  const [busy,     setBusy]       = useState(false)
  const [error,    setError]      = useState('')
  const [success,  setSuccess]    = useState(false)

  useEffect(() => {
    if (!token) navigate('/')
  }, [token, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!password || !confirm)       { setError('Completá ambos campos.'); return }
    if (password !== confirm)        { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 6)         { setError('Mínimo 6 caracteres.'); return }
    setBusy(true)
    try { await resetPassword(token, password); setSuccess(true) }
    catch (err) { setError((err as Error).message) }
    finally { setBusy(false) }
  }

  const inp = 'w-full bg-surface-container border border-outline-variant rounded-xl px-sm py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all'

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-xl">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#0e0f16]/95 backdrop-blur-2xl rounded-2xl border border-purple-500/25 shadow-[0_0_60px_rgba(138,43,226,0.2)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent pointer-events-none" />

          <div className="p-lg text-center mb-sm">
            <span className="text-2xl font-black italic text-purple-400 drop-shadow-[0_0_10px_rgba(138,43,226,0.6)] font-['Plus_Jakarta_Sans']">
              Cryptogamer
            </span>
          </div>

          {success ? (
            <div className="px-lg pb-lg text-center space-y-md">
              <div className="w-16 h-16 rounded-full bg-primary-container/10 border border-primary-container/30 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-primary-container text-3xl">check_circle</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-on-surface font-['Plus_Jakarta_Sans'] mb-xs">¡Contraseña restablecida!</h2>
                <p className="text-sm text-on-surface-variant">Ya podés iniciar sesión con tu nueva contraseña.</p>
              </div>
              <Link to="/"
                className="inline-flex items-center gap-xs px-lg py-3 bg-primary-container text-on-primary rounded-xl font-bold text-sm hover:brightness-110 transition-all">
                <span className="material-symbols-outlined text-sm">home</span>Ir al inicio
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-lg pb-lg space-y-sm">
              <div className="text-center mb-md">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-sm">
                  <span className="material-symbols-outlined text-purple-400 text-xl">lock_reset</span>
                </div>
                <h2 className="font-bold text-on-surface font-['Plus_Jakarta_Sans']">Nueva contraseña</h2>
                <p className="text-xs text-on-surface-variant mt-1">Elegí una contraseña segura de al menos 6 caracteres.</p>
              </div>

              {error && (
                <div className="px-sm py-2.5 bg-error/10 border border-error/30 rounded-xl text-sm text-error flex items-center gap-xs">
                  <span className="material-symbols-outlined text-sm">error</span>{error}
                </div>
              )}

              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Nueva contraseña</label>
                <input type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inp} autoComplete="new-password" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-1">Confirmar contraseña</label>
                <input type={showPwd ? 'text' : 'password'} value={confirm}
                  onChange={e => setConfirm(e.target.value)} placeholder="••••••••" className={inp} autoComplete="new-password" />
              </div>
              <label className="flex items-center gap-xs cursor-pointer text-xs text-on-surface-variant">
                <input type="checkbox" checked={showPwd} onChange={e => setShowPwd(e.target.checked)} className="accent-purple-500" />
                Mostrar contraseñas
              </label>

              <button type="submit" disabled={busy}
                className="w-full bg-primary-container text-on-primary py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                {busy
                  ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Guardando...</>
                  : <><span className="material-symbols-outlined text-sm">lock_reset</span>Restablecer contraseña</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
