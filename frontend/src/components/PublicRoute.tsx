import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const token = localStorage.getItem('token');

  if (token) {
    return <Navigate to='/dashboard' replace />;
  }

  return <>{children}</>;
}
