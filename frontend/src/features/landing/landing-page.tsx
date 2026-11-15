import { Building } from 'lucide-react'
import { CtaSection } from '@/features/landing/cta-section'
import { FeaturesSection } from '@/features/landing/features-section'
import { HeroSection } from '@/features/landing/hero-section'
import { LandingNav } from '@/features/landing/landing-nav'
import { RolesSection } from '@/features/landing/roles-section'
import { WorkflowSection } from '@/features/landing/workflow-section'

/** Public page at `/` for signed-out visitors. */
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
        <WorkflowSection />
        <RolesSection />
        <CtaSection />
      </main>
      <footer className="border-t px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2 font-medium text-foreground">
            <Building className="h-4 w-4 text-primary" aria-hidden />
            OpsHub
          </span>
          <span>© {new Date().getFullYear()} OpsHub</span>
        </div>
      </footer>
    </div>
  )
}
