import { ArchitectureSection } from '@/features/landing/architecture-section'
import { CtaSection } from '@/features/landing/cta-section'
import { FeaturesSection } from '@/features/landing/features-section'
import { HeroSection } from '@/features/landing/hero-section'
import { LandingNav } from '@/features/landing/landing-nav'
import { RolesSection } from '@/features/landing/roles-section'
import { TechStackSection } from '@/features/landing/tech-stack-section'

/** Public marketing page at `/` for signed-out visitors. */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow-md"
      >
        Skip to content
      </a>
      <LandingNav />
      <main id="main">
        <HeroSection />
        <FeaturesSection />
        <RolesSection />
        <ArchitectureSection />
        <TechStackSection />
        <CtaSection />
      </main>
      <footer className="border-t px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>
            OpsHub is a fictional demo product built as a portfolio project.
          </p>
          <p>All properties, residents and tickets are sample data.</p>
        </div>
      </footer>
    </div>
  )
}
