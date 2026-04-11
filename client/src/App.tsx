import { BudgetProvider } from "@/features/budget";
import { AppRouter } from "@/router/routes";

function App() {
  return (
    <BudgetProvider>
      <AppRouter />
    </BudgetProvider>
  );
}

export default App
