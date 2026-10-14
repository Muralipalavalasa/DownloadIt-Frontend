import { ArrowRight, Link2, LoaderCircle } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

import { analyzeMedia, createDownload, getDownloadFile, getDownloadStatus } from '../lib/api'
import type { DownloadJobStatus } from '../types/download'
import type { MediaAnalyzeResponse } from '../types/media'
import { MediaResult } from './MediaResult'

export function UrlDownloader() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<MediaAnalyzeResponse | null>(null)
  const [analyzedUrl, setAnalyzedUrl] = useState('')
  const [downloadJob, setDownloadJob] = useState<DownloadJobStatus | null>(null)
  const [downloadError, setDownloadError] = useState('')
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [isDownloadingFile, setIsDownloadingFile] = useState(false)
  const [authorizedToDownload, setAuthorizedToDownload] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState('mp4')
  const pollingDownloadId = downloadJob?.id
  const pollingDownloadStatus = downloadJob?.status

  useEffect(() => {
    if (!pollingDownloadId || !pollingDownloadStatus || !['pending', 'processing'].includes(pollingDownloadStatus)) {
      return
    }

    let isActive = true
    let timeoutId: number | undefined

    const pollStatus = async () => {
      try {
        const latestStatus = await getDownloadStatus(pollingDownloadId)
        if (!isActive) {
          return
        }
        setDownloadJob(latestStatus)
        setDownloadError('')
        if (['pending', 'processing'].includes(latestStatus.status)) {
          timeoutId = window.setTimeout(pollStatus, 1500)
        }
      } catch {
        if (isActive) {
          setDownloadError('Download service is temporarily unavailable.')
          timeoutId = window.setTimeout(pollStatus, 2000)
        }
      }
    }

    timeoutId = window.setTimeout(pollStatus, 1000)
    return () => {
      isActive = false
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [pollingDownloadId, pollingDownloadStatus])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedUrl = url.trim()

    if (result) {
      return
    }

    if (!trimmedUrl) {
      setError('Please enter a video URL.')
      setResult(null)
      return
    }

    try {
      const parsedUrl = new URL(trimmedUrl)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Unsupported URL scheme.')
      }
    } catch {
      setError('Enter a valid HTTP or HTTPS media URL.')
      setResult(null)
      return
    }

    if (isLoading) {
      return
    }

    setError('')
    setIsLoading(true)
    setResult(null)
    setAnalyzedUrl('')
    setDownloadJob(null)
    setDownloadError('')
    setAuthorizedToDownload(false)

    try {
      const response = await analyzeMedia(trimmedUrl)
      setResult(response)
      setAnalyzedUrl(trimmedUrl)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to connect to DownloadIt server. Please make sure the backend is running.'
      setError(message)
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDownload = async (format: string, quality: string, authorized: boolean) => {
    if (!result || !analyzedUrl || isCreatingJob) {
      return
    }
    setDownloadError('')
    setIsCreatingJob(true)
    setDownloadFormat(format)
    try {
      const created = await createDownload(analyzedUrl, format, quality, authorized)
      setDownloadJob({ ...created, progress: null, error: null })
    } catch (requestError) {
      setDownloadError(
        requestError instanceof Error
          ? requestError.message
          : 'Download service is temporarily unavailable.',
      )
    } finally {
      setIsCreatingJob(false)
    }
  }

  const handleDownloadFile = async () => {
    if (!downloadJob || isDownloadingFile) {
      return
    }
    setDownloadError('')
    setIsDownloadingFile(true)
    try {
      const file = await getDownloadFile(downloadJob.id)
      const objectUrl = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = objectUrl
      const extension = downloadFormat === 'm4a' ? 'm4a' : downloadFormat === 'mp3' ? 'mp3' : 'mp4'
      link.download = `DownloadIt-${downloadJob.id}.${extension}`
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : ''
      if (message.toLowerCase().includes('expired')) {
        setDownloadJob({ ...downloadJob, status: 'expired' })
        setDownloadError('This download has expired. Please start again.')
      } else {
        setDownloadError(message || 'Download service is temporarily unavailable.')
      }
    } finally {
      setIsDownloadingFile(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[820px]">
        <div className="flex items-center gap-3 rounded-[1rem] border border-zinc-200 bg-white p-2 shadow-[0_8px_24px_rgba(24,24,27,0.03)] transition-all duration-200 focus-within:border-zinc-300 focus-within:ring-4 focus-within:ring-zinc-100 sm:gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 sm:h-12 sm:w-12">
            <Link2 className="h-5 w-5" strokeWidth={2} />
          </div>

          <input
            value={url}
            placeholder="Paste a supported media URL"
            aria-label="Video URL"
            aria-describedby={error ? 'url-error' : 'url-help'}
            aria-invalid={error ? true : undefined}
            required
            inputMode="url"
            disabled={isLoading || result !== null}
            onChange={(event) => {
              setUrl(event.target.value)
              if (error) {
                setError('')
              }
            }}
            className="h-11 w-full min-w-0 border-0 bg-transparent px-1 text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none sm:h-12"
            type="text"
          />

          <button
            type="submit"
            disabled={isLoading || result !== null}
            className="inline-flex h-[3rem] w-[9.5rem] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.01] hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-80 sm:h-[3rem] sm:w-[10.25rem]"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2.3} />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyze</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2.3} />
              </>
            )}
          </button>
        </div>

        {error && <p id="url-error" className="mt-3 text-left text-sm text-red-700" role="alert">{error}</p>}
        {isLoading && !error && (
          <p id="url-help" className="mt-3 text-left text-sm font-medium text-zinc-600" role="status">Checking available media details...</p>
        )}
        {!error && !isLoading && <p id="url-help" className="sr-only">Enter a supported HTTP or HTTPS media URL.</p>}
      </form>

      {result && (
        <MediaResult
          result={result}
          job={downloadJob}
          error={downloadError}
          isCreatingJob={isCreatingJob}
          isDownloadingFile={isDownloadingFile}
          authorizedToDownload={authorizedToDownload}
          onAuthorizationChange={setAuthorizedToDownload}
          onCreateDownload={handleCreateDownload}
          onDownloadFile={handleDownloadFile}
          onStartAnother={() => {
            setResult(null)
            setAnalyzedUrl('')
            setDownloadJob(null)
            setDownloadError('')
            setAuthorizedToDownload(false)
            setUrl('')
          }}
        />
      )}
    </div>
  )
}
