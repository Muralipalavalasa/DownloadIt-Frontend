import { Features } from '../components/Features'
import { Footer } from '../components/Footer'
import { Hero } from '../components/Hero'
import { Navbar } from '../components/Navbar'

export function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-zinc-900">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  )
}
