import { createContext, useContext, useState, type ReactNode } from "react";
import type { BudgetRecord } from "@/features/budget/types";

interface NavigationBlockContextType {
  isBlocked: boolean;
  blockMessage: string;
  blockRecord: BudgetRecord | null;
  onBlock: (message: string, record?: BudgetRecord) => void;
  onUnblock: () => void;
  onConfirm: () => void;
}

const NavigationBlockContext = createContext<NavigationBlockContextType | null>(null);

export function NavigationBlockProvider({ children }: { children: ReactNode }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");
  const [blockRecord, setBlockRecord] = useState<BudgetRecord | null>(null);

  const onBlock = (message: string, record?: BudgetRecord) => {
    setIsBlocked(true);
    setBlockMessage(message);
    setBlockRecord(record || null);
  };

  const onUnblock = () => {
    setIsBlocked(false);
    setBlockMessage("");
    setBlockRecord(null);
  };

  const onConfirm = () => {
    setIsBlocked(false);
    setBlockMessage("");
    setBlockRecord(null);
  };

  return (
    <NavigationBlockContext.Provider
      value={{
        isBlocked,
        blockMessage,
        blockRecord,
        onBlock,
        onUnblock,
        onConfirm,
      }}
    >
      {children}
    </NavigationBlockContext.Provider>
  );
}

export function useNavigationBlock() {
  const context = useContext(NavigationBlockContext);
  if (!context) {
    throw new Error("useNavigationBlock must be used within NavigationBlockProvider");
  }
  return context;
}