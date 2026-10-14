import { useState, type FormEvent } from 'react'

import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/useAuth'

export function Register() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (password !== confirmation) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError('Use at least 12 characters with uppercase and lowercase letters, a number, and a symbol.')
      return
    }

    setIsSubmitting(true)
    try {
      await register(email.trim(), password)
      setRegistered(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        <section className="w-full max-w-md">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">DownloadIt</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">Create account</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">Create an account to keep your download history private.</p>

          {registered ? (
            <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">
              Account created.{' '}
              <a href="/login" className="font-medium underline underline-offset-4">Sign in</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-zinc-700">Email</label>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? 'register-error' : undefined}
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-700 focus:ring-2 focus:ring-zinc-200"
                />
              </div>
              <div>
                <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-zinc-700">Password</label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby="password-requirements"
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-700 focus:ring-2 focus:ring-zinc-200"
                />
                <p id="password-requirements" className="mt-2 text-xs leading-5 text-zinc-500">At least 12 characters, including uppercase and lowercase letters, a number, and a symbol.</p>
              </div>
              <div>
                <label htmlFor="register-confirm" className="mb-2 block text-sm font-medium text-zinc-700">Confirm Password</label>
                <input
                  id="register-confirm"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  required
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? 'register-error' : undefined}
                  className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-700 focus:ring-2 focus:ring-zinc-200"
                />
              </div>
              {error && <p id="register-error" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-zinc-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-zinc-950 underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900">Sign in</a>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}