import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '@/store/hooks';
import { authService } from '@/services/auth';
import { clearAuth } from '@/store/slices/authSlice';

export function RouteGuard({
  children,
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const hasDispatchedLogoutRef = React.useRef(false);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const isAuthenticated = await authService.isAuthenticated();

        if (!isAuthenticated) {
          setAuthorized(false);
          setLoading(false);
          if (!hasDispatchedLogoutRef.current) {
            hasDispatchedLogoutRef.current = true;
            dispatch(clearAuth());
          }
          return;
        }

        setAuthorized(true);
      } catch (error) {
        setAuthorized(false);
        if (!hasDispatchedLogoutRef.current) {
          hasDispatchedLogoutRef.current = true;
          dispatch(clearAuth());
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (!authorized && !loading) {
    return null;
  }

  return <>{children}</>;
}
