export const PORTAL_CONFIG = {
  appName: "Janatics",
  appUrl: "http://localhost:3000",
  brand: {
    name: "Janatics",
    logoUrl: "/logo.png",
    homePath: "/",
  },
  apiBaseUrl: "http://localhost:5000/api",
  auth: {
    tokenKey: "authToken",
    userKey: "authUser",
  },
  navigation: [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "projects", label: "Projects", icon: "projects" },
    { id: "settings", label: "Settings", icon: "settings" },
    { id: "reports", label: "Reports", icon: "reports" },
  ],
}
