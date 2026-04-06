import { AppProvider } from "./context/AppContext"
import { DataProvider } from "./context/DataContext"
import { Layout } from "./components/layout/Layout"
import { PageRouter } from "./pages/PageRouter"
import { Login } from "./pages/Login"
import { useApp } from "./hooks/useApp"

function AppContent() {
  const { isAuthenticated } = useApp()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Layout>
      <PageRouter />
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
