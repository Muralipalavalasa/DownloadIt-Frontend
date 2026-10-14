import { Download, Globe, Shield, Zap } from 'lucide-react'

import { FeatureCard } from './FeatureCard'

const features = [
  {
    icon: Zap,
    title: 'Clear progress',
    description: 'Follow each job as it moves from preparation to completion.',
  },
  {
    icon: Shield,
    title: 'Secure & Safe',
    description: 'Privacy-focused architecture with no unnecessary tracking.',
  },
  {
    icon: Globe,
    title: 'Provider detection',
    description: 'DownloadIt checks media URLs and reports the extractor it can use.',
  },
  {
    icon: Download,
    title: 'Easy to Use',
    description: 'No complicated settings. Paste your URL and get started.',
  },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 bg-[#f7f7f5] py-16 sm:py-20">
      <div className="mx-auto max-w-[1160px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
