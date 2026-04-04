import { useApp } from '../context/AppContext';
import { RequestList } from '../components/employee/RequestList';
import { RequestDetails } from '../components/employee/RequestDetails';
import { HODDashboard } from '../components/hod';
import { ITDashboard } from '../components/it';
import { Analytics } from './Analytics';
import { EmployeeDashboard } from './EmployeeDashboard';
import { UserProfile } from './UserProfile';

export function PageRouter() {
  const { currentPage, currentRole } = useApp();

  if (currentRole === 'EMPLOYEE') {
    switch (currentPage) {
      case 'EMPLOYEE_DASHBOARD':
        return <EmployeeDashboard />;
      case 'EMPLOYEE_REQUESTS':
        return <RequestList />;
      case 'EMPLOYEE_REQUEST_DETAIL':
        return <RequestDetails />;
      case 'USER_PROFILE':
        return <UserProfile />;
      default:
        return <EmployeeDashboard />;
    }
  }

  if (currentRole === 'HOD') {
    switch (currentPage) {
      case 'HOD_APPROVALS':
        return <HODDashboard />;
      case 'ANALYTICS':
        return <Analytics />;
      case 'USER_PROFILE':
        return <UserProfile />;
      default:
        return <HODDashboard />;
    }
  }

  if (currentRole === 'IT_INFRA') {
    switch (currentPage) {
      case 'IT_QUEUE':
        return <ITDashboard />;
      case 'IT_ACTIVE_ACCESS':
        return <ITDashboard />;
      case 'ANALYTICS':
        return <Analytics />;
      case 'USER_PROFILE':
        return <UserProfile />;
      default:
        return <ITDashboard />;
    }
  }

  return <ITDashboard />;
}
