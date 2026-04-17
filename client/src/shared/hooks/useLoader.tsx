import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from "react";
import { Spinner } from "@/shared/components/ui/spinner";

interface LoaderContextValue {
  isLoading: boolean;
  wrap: <T>(executor: () => Promise<T>) => Promise<T>;
}

const LoaderContext = createContext<LoaderContextValue | null>(null);

export function LoaderProvider({ children }: PropsWithChildren) {
  const [loadingCount, setLoadingCount] = useState(0);

  const wrap = useCallback(async <T,>(executor: () => Promise<T>) => {
    setLoadingCount((current) => current + 1);

    try {
      return await executor();
    } finally {
      setLoadingCount((current) => Math.max(current - 1, 0));
    }
  }, []);

  const value = useMemo(
    () => ({ isLoading: loadingCount > 0, wrap }),
    [loadingCount, wrap],
  );

  return (
    <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within LoaderProvider.");
  }
  return context;
}

export function LoaderOverlay() {
  const { isLoading } = useLoader();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-border/80 bg-background/95 px-6 py-5 shadow-xl">
        <Spinner className="h-10 w-10 text-primary" />
        <span className="text-sm font-medium text-foreground">Loading...</span>
      </div>
    </div>
  );
}
