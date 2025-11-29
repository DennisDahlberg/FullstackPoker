import { Navigate, useLocation } from 'react-router-dom';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  if (token) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
