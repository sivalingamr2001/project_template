import { createContext, useContext, useState, type ReactNode } from "react";
import { GlobalLoader } from "@/shared/components/GlobalLoader";

const LoaderContext = createContext<{ setLoading: (loading: boolean) => void } | undefined>(undefined);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ setLoading: setIsLoading }}>
      <GlobalLoader isLoading={isLoading} />
      {children}
    </LoaderContext.Provider>
  );
}

export const useGlobalLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) throw new Error("useGlobalLoader must be used within LoaderProvider");
  return context;
};
