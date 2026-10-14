import { useEffect, useState } from 'react'
import { LoaderCircle, RotateCw } from 'lucide-react'

import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { getDownloadFile, getDownloadHistory } from '../lib/api'
import type { DownloadHistoryItem } from '../types/download'

const statusStyles: Record<DownloadHistoryItem['status'], string> = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  processing: 'bg-sky-50 text-sky-800 ring-sky-200',
  completed: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  failed: 'bg-red-50 text-red-800 ring-red-200',
  expired: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
}

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export function History() {
  const [items, setItems] = useState<DownloadHistoryItem[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    let isActive = true

    const loadHistory = async () => {
      setIsLoading(true)
      setError('')

      try {
        const history = await getDownloadHistory()
        if (isActive) {
          setItems(history)
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load download history.',
          )
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadHistory()
    return () => {
      isActive = false
    }
  }, [reloadKey])

  const handleDownload = async (downloadId: string, format: string) => {
    if (downloadingId) {
      return
    }
    setDownloadingId(downloadId)
    setDownloadError('')
    try {
      const file = await getDownloadFile(downloadId)
      const objectUrl = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = objectUrl
      const extension = format === 'm4a' ? 'm4a' : format === 'mp3' ? 'mp3' : 'mp4'
      link.download = `DownloadIt-${downloadId}.${extension}`
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch (requestError) {
      setDownloadError(requestError instanceof Error ? requestError.message : 'Download service is temporarily unavailable.')
      setReloadKey((current) => current + 1)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <Navbar />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
            DownloadIt
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">History</h1>
          <p className="mt-2 text-sm text-zinc-600">Your recent download jobs and available files.</p>
        </div>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-zinc-600" role="status">
            <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
            Loading history...
          </div>
        ) : error ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <p className="text-sm text-red-700" role="alert">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <p className="text-base font-medium text-zinc-800">No downloads yet</p>
            <p className="mt-2 text-sm text-zinc-600">Downloads you start will appear here.</p>
            <a href="/" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900">
              Find media
            </a>
          </div>
        ) : (
          <div className="mt-6">
            <ul className="grid gap-4 lg:grid-cols-2" aria-label="Download history">
              {items.map((item) => (
                <li key={item.id} className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words font-semibold text-zinc-900">
                        {item.title ?? 'Untitled download'}
                      </h2>
                      <p className="mt-1 break-all text-xs text-zinc-500">{item.source_url}</p>
                    </div>
                    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${statusStyles[item.status]}`}>
                      {item.status}
                    </span>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-zinc-500">Platform</dt>
                      <dd className="mt-1 capitalize text-zinc-800">{item.platform}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-500">Format</dt>
                      <dd className="mt-1 uppercase text-zinc-800">{item.format}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-500">Quality</dt>
                      <dd className="mt-1 text-zinc-800">{item.quality}</dd>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <dt className="text-xs text-zinc-500">Created</dt>
                      <dd className="mt-1 text-zinc-800">{formatDate(item.created_at)}</dd>
                    </div>
                  </dl>

                  <div className="mt-5 border-t border-zinc-100 pt-4">
                    {item.status === 'completed' ? (
                      <button
                        type="button"
                        onClick={() => void handleDownload(item.id, item.format)}
                        disabled={downloadingId !== null}
                        className="inline-flex min-h-11 items-center rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {downloadingId === item.id ? 'Preparing file...' : 'Download file'}
                      </button>
                    ) : item.status === 'pending' ? (
                      <span className="text-sm text-zinc-600">Preparing your download…</span>
                    ) : item.status === 'processing' ? (
                      <span className="text-sm text-zinc-600">Download in progress…</span>
                    ) : item.status === 'failed' ? (
                      <span className="text-sm text-red-700">This download could not be completed.</span>
                    ) : (
                      <span className="text-sm text-zinc-600">This file has expired.</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {downloadError && <p className="mt-4 text-sm text-red-700" role="alert">{downloadError}</p>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}