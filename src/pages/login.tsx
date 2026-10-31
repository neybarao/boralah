import { useState, type FormEvent } from 'react'
import { BackButton, Screen, TopBar } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { backend } from '@/lib/data'

export default function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await backend.signIn(email.trim())
      setStatus('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não deu pra enviar')
      setStatus('error')
    }
  }

  return (
    <Screen>
      <TopBar title="Entrar para editar" back={<BackButton to="/visitas" />} />
      <form onSubmit={submit} className="flex flex-col gap-4 px-5 pt-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Mandamos um link de acesso para o seu e-mail. Só contas autorizadas conseguem editar.
        </p>
        <Label>
          E-mail
          <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Label>
        <Button type="submit" size="lg" disabled={status === 'sending'}>
          {status === 'sending' ? 'Enviando…' : 'Enviar link'}
        </Button>
        <p aria-live="polite" className="text-sm font-semibold">
          {status === 'sent' && <span className="text-kids">Link enviado. Abra o e-mail neste aparelho.</span>}
          {status === 'error' && <span className="text-primary">{error}</span>}
        </p>
      </form>
    </Screen>
  )
}
