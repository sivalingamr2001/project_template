import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function UserProfile() {
  const { currentUser, currentRole } = useApp();

  const profileRows = [
    { id: 'name', label: 'Full Name', value: currentUser?.name ?? '-' },
    { id: 'email', label: 'Email Address', value: currentUser?.email ?? '-' },
    { id: 'role', label: 'Role', value: currentRole?.replace('_', ' ') ?? '-' },
    { id: 'department', label: 'Department', value: currentUser?.department ?? '-' },
    { id: 'employee-id', label: 'Employee ID', value: currentUser?.id ?? '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <p className="text-sm text-muted-foreground">
          Profile details are shown in read-only mode.
        </p>
      </div>

      <Card className="max-w-3xl shadow-sm">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {profileRows.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                value={field.value}
                readOnly
                disabled
                className="disabled:cursor-default disabled:opacity-100"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
