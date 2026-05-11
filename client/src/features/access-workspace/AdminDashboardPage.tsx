import PageSection from "./components/PageSection"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <PageSection
        title="Admin Dashboard"
        description="Administrative workspace for employee, department, and folder management."
      >
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <p className="mb-3 text-base font-semibold text-foreground">
            Welcome to the admin workspace.
          </p>
          <p className="text-sm leading-6">
            Use the navigation panel to manage employees, departments, folder mapping, roles, and audit logs.
          </p>
        </div>
      </PageSection>
    </div>
  )
}
