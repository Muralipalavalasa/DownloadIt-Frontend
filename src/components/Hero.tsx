import { UrlDownloader } from './UrlDownloader'

export function Hero() {
  return (
    <section id="download" className="mx-auto max-w-[1180px] scroll-mt-24 px-4 pb-14 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-16 lg:pt-24">
      <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[0.72rem] font-medium text-zinc-700">
          <span className="h-2 w-2 rounded-full bg-zinc-950" />
          For supported media URLs
        </div>

        <h1 className="mt-7 text-balance text-[2.5rem] font-bold tracking-[-0.07em] text-zinc-950 sm:text-[3rem] md:text-[3.8rem] lg:text-[4.25rem]">
          <span className="block">Download your videos</span>
          <span className="mt-1 block text-zinc-400">in high quality.</span>
        </h1>

        <p className="mt-6 max-w-[680px] text-[1rem] leading-7 text-zinc-600 sm:text-[1.06rem] lg:text-[1.12rem]">
          Check what&apos;s available, choose a format, and prepare an authorized download.
        </p>

        <div className="mt-9 w-full">
          <UrlDownloader />
        </div>
      </div>
    </section>
  )
}
