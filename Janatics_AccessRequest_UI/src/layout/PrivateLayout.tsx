import { AnimatedOutlet } from "@/core/routing/AnimatedOutlet"
import { Header } from "./TopBar"

export function PrivateLayout() {
  return (
    <div className="min-h-svh bg-card/80">
      {/* Container is now full width with no sidebar padding */}
      <main className="mx-auto flex h-auto flex-col p-2">
        <Header />
        <div className="m-3 h-auto rounded-sm bg-background shadow-sm">
          <AnimatedOutlet />
        </div>
      </main>
    </div>
  )
}
