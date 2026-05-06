import { Spinner } from "./ui/spinner"


interface GlobalLoaderProps {
    isLoading: boolean
}

export function GlobalLoader({ isLoading }: GlobalLoaderProps) {
    if (!isLoading) return null

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-950">
                <Spinner className="size-8 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Loading...</span>
            </div>
        </div>
    )
}
