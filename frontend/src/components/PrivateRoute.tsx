import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Spinner } from './ui/spinner';


interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { data, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <Spinner />;
  }

  if (!data?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
