import { Download } from 'lucide-react'

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
        <Download className="h-4 w-4" strokeWidth={2.6} />
      </div>
      <span className="text-[1.05rem] font-semibold tracking-[-0.04em] text-zinc-950">
        DownloadIt
      </span>
    </div>
  )
}
