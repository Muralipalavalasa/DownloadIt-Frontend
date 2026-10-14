import { useState, type FormEvent } from 'react'

import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/useAuth'

export function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(email.trim(), password)
      window.location.assign('/history')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in.')
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
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">Sign in</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">Sign in to access your private download history.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-zinc-700">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(error) || undefined}
                aria-describedby={error ? 'login-error' : undefined}
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-700 focus:ring-2 focus:ring-zinc-200"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-zinc-700">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(error) || undefined}
                aria-describedby={error ? 'login-error' : undefined}
                className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-700 focus:ring-2 focus:ring-zinc-200"
              />
            </div>
            {error && <p id="login-error" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-600">
            Don&apos;t have an account?{' '}
            <a href="/register" className="font-medium text-zinc-950 underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900">Create one</a>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}