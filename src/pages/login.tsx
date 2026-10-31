import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { BackButton, Screen, TopBar } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { backend } from '@/lib/data'

// Login por código enviado no e-mail, digitado no próprio app.
// Funciona dentro do PWA instalado no iPhone, que não compartilha login com o Safari.
export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function sendCode(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await backend.signIn(email.trim())
      setStep('code')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não deu pra enviar o código')
    } finally {
      setBusy(false)
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await backend.verifyCode(email.trim(), code.trim())
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido')
      setBusy(false)
    }
  }

  return (
    <Screen>
      <TopBar title="Entrar para editar" back={<BackButton to="/visitas" />} />

      {step === 'email' ? (
        <form onSubmit={sendCode} className="flex flex-col gap-4 px-5 pt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Vamos mandar um código para o seu e-mail. Só contas autorizadas conseguem editar.
          </p>
          <Label>
            E-mail
            <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Label>
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? 'Enviando…' : 'Enviar código'}
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} className="flex flex-col gap-4 px-5 pt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Digite o código que chegou em <strong className="text-foreground">{email}</strong>.
          </p>
          <Label>
            Código
            <Input
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="tracking-[0.3em]"
            />
          </Label>
          <Button type="submit" size="lg" disabled={busy || code.length < 6}>
            {busy ? 'Entrando…' : 'Entrar'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setStep('email')}>
            Usar outro e-mail
          </Button>
        </form>
      )}

      {error && (
        <p role="alert" className="px-5 pt-4 text-sm font-semibold text-primary">
          {error}
        </p>
      )}
    </Screen>
  )
}
