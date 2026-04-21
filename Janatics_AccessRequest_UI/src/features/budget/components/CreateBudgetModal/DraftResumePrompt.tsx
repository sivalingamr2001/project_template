import { Button } from "@/shared/components/ui/button"

interface DraftResumePromptProps {
  onResume: () => void
  onDiscard: () => void
}

export function DraftResumePrompt({
  onResume,
  onDiscard,
}: DraftResumePromptProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-muted px-4 py-3 text-sm">
      <div className="font-semibold text-foreground">Resume your draft?</div>
      <div className="mt-1 text-xs text-muted-foreground">
        A saved draft was found for your session.
      </div>
      <div className="mt-3 flex gap-2">
        <Button type="button" size="sm" onClick={onResume}>
          Resume
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDiscard}>
          Discard
        </Button>
      </div>
    </div>
  )
}
