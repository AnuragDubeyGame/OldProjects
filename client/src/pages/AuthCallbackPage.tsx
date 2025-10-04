import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Authentication error:', error);
      navigate('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (token) {
      // Store the token
      setToken(token);
      
      // Redirect to dashboard
      navigate('/', { replace: true });
    } else {
      // No token found, redirect to login
      navigate('/login', { replace: true });
    }
  }, [searchParams, setToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-secondary-900 dark:to-secondary-800 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mb-4" />
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
          Completing sign in...
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400">
          Please wait while we set up your account
        </p>
      </div>
    </div>
  );
};
