import type { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="group min-h-[210px] rounded-[1.25rem] border border-zinc-200 bg-white p-7 shadow-[0_1px_0_rgba(24,24,27,0.02)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(24,24,27,0.04)]">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-800">
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <h3 className="text-[1.2rem] font-semibold tracking-[-0.04em] text-zinc-900">
        {title}
      </h3>
      <p className="mt-3 text-[0.95rem] leading-6 text-zinc-600">{description}</p>
    </div>
  )
}
