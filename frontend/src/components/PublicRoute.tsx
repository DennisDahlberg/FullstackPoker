import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Spinner } from './ui/spinner';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { data, loading } = useAuthContext();

  if (loading) {
    return <Spinner />;
  }

  if (data?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
