import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') || 'An unexpected error occurred';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-secondary-50 dark:from-secondary-900 dark:to-secondary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
          Oops! Something went wrong
        </h1>
        
        <p className="text-secondary-600 dark:text-secondary-400 mb-8">
          {message}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/login')}
            className="w-full btn-primary btn-lg"
          >
            Try Again
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full btn-ghost btn-md flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
