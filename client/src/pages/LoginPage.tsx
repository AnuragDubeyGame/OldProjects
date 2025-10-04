import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Video, Upload, Shield, Zap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-secondary-900 dark:to-secondary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
            Video Vault
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Your personal video gallery with unlimited storage
          </p>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-medium text-secondary-900 dark:text-white">
                  Unlimited Storage
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Store all your videos using your YouTube channel
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-accent-600 dark:text-accent-400" />
              </div>
              <div>
                <h3 className="font-medium text-secondary-900 dark:text-white">
                  AI-Powered Search
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Find videos by content, objects, and text
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-secondary-900 dark:text-white">
                  Private & Secure
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  All videos uploaded as private to your account
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-lg p-6">
          <button
            onClick={login}
            className="w-full bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-secondary-900 dark:text-white font-medium">
              Continue with Google
            </span>
          </button>

          <p className="text-xs text-secondary-500 dark:text-secondary-400 text-center mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Theme Toggle */}
        <div className="text-center mt-6">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center space-x-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white transition-colors"
          >
            <span className="text-sm">
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
