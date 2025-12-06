import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import FullScreenLoader from './Loader';


interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { data, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!data?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
