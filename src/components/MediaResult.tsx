import { ArrowDownToLine, Check, LoaderCircle, RotateCcw } from 'lucide-react'
import { useState } from 'react'

import type { DownloadJobStatus } from '../types/download'
import type { MediaAnalyzeResponse } from '../types/media'

interface MediaResultProps {
  result: MediaAnalyzeResponse
  job: DownloadJobStatus | null
  error: string
  isCreatingJob: boolean
  isDownloadingFile: boolean
  authorizedToDownload: boolean
  onAuthorizationChange: (authorized: boolean) => void
  onCreateDownload: (format: string, quality: string, authorized: boolean) => void
  onDownloadFile: () => void
  onStartAnother: () => void
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  const units = ['KB', 'MB', 'GB', 'TB']
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)) - 1, units.length - 1)
  return `${(bytes / 1024 ** (unitIndex + 1)).toFixed(1)} ${units[unitIndex]}`
}

export function MediaResult({
  result,
  job,
  error,
  isCreatingJob,
  isDownloadingFile,
  authorizedToDownload,
  onAuthorizationChange,
  onCreateDownload,
  onDownloadFile,
  onStartAnother,
}: MediaResultProps) {
  const formatKey = (format: string, quality: string) => `${format}::${quality}`
  const [selectedKey, setSelectedKey] = useState(() => {
    const first = result.available_formats[0]
    return first ? formatKey(first.format, first.quality) : ''
  })
  const selectedFormat = result.available_formats.find(
    (item) => formatKey(item.format, item.quality) === selectedKey,
  ) ?? result.available_formats[0]
  const selectedQuality = selectedFormat?.quality ?? ''
  const outputFormat = selectedFormat?.format ?? ''
  const requiresAuthorization = result.requires_authorization

  const isActive = job?.status === 'pending' || job?.status === 'processing'
  const progress = typeof job?.progress === 'number'
    ? Math.max(0, Math.min(100, job.progress))
    : null
  const terminalMessage = job?.status === 'failed'
    ? job.error || "We couldn't prepare this download. Please try again."
    : job?.status === 'expired'
      ? 'This download has expired. Please start again.'
      : ''

  return (
    <div className="mt-6 w-full max-w-[760px] overflow-hidden rounded-[1.6rem] border border-zinc-200 bg-white shadow-[0_12px_30px_rgba(24,24,27,0.04)]">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="h-32 w-full overflow-hidden rounded-[1.2rem] border border-zinc-200 bg-zinc-100 sm:w-[180px]">
            {result.thumbnail ? (
              <img src={result.thumbnail} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-sm font-medium uppercase tracking-[0.18em] text-zinc-400" aria-hidden="true">
                No preview
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-zinc-400">
                  Analysis complete
                </p>
                <h2 className="mt-2 break-words text-[1.5rem] font-semibold tracking-[-0.05em] text-zinc-900">
                  {result.title ?? 'Title unavailable'}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-600">
                <Check className="h-4 w-4 text-zinc-700" strokeWidth={2.5} />
                <span className="capitalize">{result.platform}</span>
                {result.extractor && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>via {result.extractor}</span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-2 text-sm text-zinc-600 sm:col-span-2">
                <label htmlFor="quality-select" className="font-medium text-zinc-500">
                  Available formats
                </label>
                <select
                  id="quality-select"
                  value={selectedKey}
                  onChange={(event) => setSelectedKey(event.target.value)}
                  disabled={isActive || isCreatingJob || job?.status === 'completed'}
                  aria-describedby="selected-format-details"
                  className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500"
                >
                  {result.available_formats.map((mediaFormat) => (
                    <option
                      key={formatKey(mediaFormat.format, mediaFormat.quality)}
                      value={formatKey(mediaFormat.format, mediaFormat.quality)}
                    >
                      {mediaFormat.quality} · {mediaFormat.format.toUpperCase()}
                      {mediaFormat.resolution ? ` · ${mediaFormat.resolution}` : ''}
                      {mediaFormat.filesize != null ? ` · ${formatBytes(mediaFormat.filesize)}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <dl id="selected-format-details" className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-zinc-50 p-3 text-sm">
                <div>
                  <dt className="text-xs text-zinc-500">Format</dt>
                  <dd className="mt-1 font-medium uppercase text-zinc-800">{(selectedFormat?.extension?.replace('.', '') ?? outputFormat) || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Resolution</dt>
                  <dd className="mt-1 font-medium text-zinc-800">{selectedFormat?.resolution ?? 'Not provided'}</dd>
                </div>
                {selectedFormat?.filesize != null && (
                  <div>
                    <dt className="text-xs text-zinc-500">Estimated size</dt>
                    <dd className="mt-1 font-medium text-zinc-800">{formatBytes(selectedFormat.filesize)}</dd>
                  </div>
                )}
                {(selectedFormat?.video_codec || selectedFormat?.audio_codec) && (
                  <div className="min-w-0">
                    <dt className="text-xs text-zinc-500">Codecs</dt>
                    <dd className="mt-1 break-words font-medium text-zinc-800">
                      {[selectedFormat.video_codec, selectedFormat.audio_codec].filter(Boolean).join(' · ') || 'Not provided'}
                    </dd>
                  </div>
                )}
              </dl>
              {result.duration && (
                <div className="flex flex-col gap-1 text-sm text-zinc-600">
                  <span className="text-xs font-medium text-zinc-500">Duration</span>
                  <span>{result.duration}</span>
                </div>
              )}
              {result.uploader && (
                <div className="flex min-w-0 flex-col gap-1 text-sm text-zinc-600">
                  <span className="text-xs font-medium text-zinc-500">Uploader</span>
                  <span className="break-words">{result.uploader}</span>
                </div>
              )}
            </div>

            {requiresAuthorization && (
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-950">
                <input
                  type="checkbox"
                  checked={authorizedToDownload}
                  onChange={(event) => onAuthorizationChange(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                />
                <span>I am authorized to download this content, and the platform permits it.</span>
              </label>
            )}

            {job?.status === 'completed' ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900" role="status">
                  <Check className="h-4 w-4" aria-hidden="true" /> Download ready
                </p>
                <p className="mt-1 text-sm text-emerald-900/80">
                  {selectedQuality} · {outputFormat.toUpperCase()}
                  {job.total_bytes != null ? ` · ${formatBytes(job.total_bytes)}` : ''}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onDownloadFile}
                    disabled={isDownloadingFile}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDownloadingFile ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowDownToLine className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />}
                    {isDownloadingFile ? 'Preparing file...' : 'Download file'}
                  </button>
                  <button
                    type="button"
                    onClick={onStartAnother}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Start another
                  </button>
                </div>
              </div>
            ) : isActive ? (
              <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4" role="status" aria-live="polite">
                <div className="flex items-center justify-between gap-3 text-sm font-medium text-zinc-800">
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {job.status === 'pending' ? 'Preparing your download' : 'Downloading'}
                  </span>
                  {progress !== null && <span>{progress}%</span>}
                </div>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200"
                  role="progressbar"
                  aria-label="Download progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress ?? undefined}
                  aria-valuetext={progress === null ? 'Progress unavailable' : `${progress}%`}
                >
                  <div
                    className={`h-full rounded-full bg-zinc-900 transition-[width] duration-300 ${progress === null ? 'w-1/3 animate-pulse' : ''}`}
                    style={progress === null ? undefined : { width: `${progress}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-zinc-600">
                  <span>{selectedQuality} · {outputFormat.toUpperCase()}</span>
                  {job.downloaded_bytes != null && (
                    <span>
                      {formatBytes(job.downloaded_bytes)}
                      {job.total_bytes != null ? ` / ${formatBytes(job.total_bytes)}` : ' downloaded'}
                    </span>
                  )}
                </div>
              </div>
            ) : job?.status === 'failed' || job?.status === 'expired' ? (
              <div className="mt-5 flex flex-col items-end gap-3">
                <p className="text-sm text-red-700" role="alert">{terminalMessage}</p>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onCreateDownload(outputFormat, selectedQuality, authorizedToDownload)}
                    disabled={isCreatingJob || (requiresAuthorization && !authorizedToDownload) || !selectedFormat}
                    className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCreatingJob && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={onStartAnother}
                    className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                  >
                    Start another
                  </button>
                </div>
              </div>
            ) : (
              <>
                {result.available_formats.length === 0 && (
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-zinc-50 p-3">
                    <p className="text-sm text-zinc-700">No download formats are currently available for this URL.</p>
                    <button
                      type="button"
                      onClick={onStartAnother}
                      className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                    >
                      Start another
                    </button>
                  </div>
                )}
                {selectedFormat && (
                  <button
                    type="button"
                    onClick={() => onCreateDownload(outputFormat, selectedQuality, authorizedToDownload)}
                    disabled={isCreatingJob || (requiresAuthorization && !authorizedToDownload)}
                    className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 self-end rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCreatingJob ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowDownToLine className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />}
                    {isCreatingJob ? 'Preparing...' : 'Download'}
                  </button>
                )}
              </>
            )}
            {error && <p className="mt-3 text-right text-sm text-red-700" role="alert">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
