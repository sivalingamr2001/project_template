import { AppProvider, useApp } from "./context/AppContext"
import { DataProvider } from "./context/DataContext"
import { Layout } from "./components/layout/Layout"
import { Login } from "./pages/Login"
import { AppRoutes } from "./routes/AppRoutes"
import { NavigationSync } from "./routes/NavigationSync"

function AppContent() {
  const { isAuthenticated } = useApp()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Layout>
      <NavigationSync />
      <AppRoutes />
    </Layout>
  )
}

export default function App() {
  return (
    <AppProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AppProvider>
  )
}
