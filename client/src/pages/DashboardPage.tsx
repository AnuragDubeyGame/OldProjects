import React, { useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiHelpers } from '../lib/api';
import { debounce } from '../lib/utils';
import { 
  Search, 
  Upload, 
  User, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  Plus,
  Grid,
  List
} from 'lucide-react';
import { VideoGrid } from '../components/VideoGrid';
import { VideoUpload } from '../components/VideoUpload';
import { SearchBar } from '../components/SearchBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  // Fetch videos
  const {
    data: videosData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['videos', page, searchQuery],
    () => apiHelpers.getVideos(page, 20, searchQuery),
    {
      keepPreviousData: true,
    }
  );

  // Search videos by AI tags
  const {
    data: searchData,
    isLoading: isSearching,
    refetch: refetchSearch
  } = useQuery(
    ['search', searchQuery, page],
    () => apiHelpers.searchVideos(searchQuery, page, 20),
    {
      enabled: searchQuery.length > 2,
      keepPreviousData: true,
    }
  );

  const videos = searchQuery.length > 2 ? searchData?.data?.videos : videosData?.data?.videos;
  const pagination = searchQuery.length > 2 ? searchData?.data?.pagination : videosData?.data?.pagination;

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setPage(1);
    }, 300),
    []
  );

  const handleSearch = (query: string) => {
    debouncedSearch(query);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleUploadSuccess = () => {
    setIsUploadOpen(false);
    refetch();
    toast.success('Videos uploaded successfully!');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
            Failed to load videos
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            Please try again later
          </p>
          <button
            onClick={() => refetch()}
            className="btn-primary btn-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-950">
      {/* Header */}
      <header className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VV</span>
              </div>
              <h1 className="text-xl font-bold text-secondary-900 dark:text-white">
                Video Vault
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-secondary-100 dark:bg-secondary-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-secondary-700 text-primary-600'
                      : 'text-secondary-600 dark:text-secondary-400'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-secondary-700 text-primary-600'
                      : 'text-secondary-600 dark:text-secondary-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Upload Button */}
              <button
                onClick={() => setIsUploadOpen(true)}
                className="btn-primary btn-md flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload</span>
              </button>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors">
                  <img
                    src={user?.picture}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-secondary-900 dark:text-white font-medium">
                    {user?.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-900 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full px-4 py-2 text-left text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full px-4 py-2 text-left text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-1 border-secondary-200 dark:border-secondary-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-secondary-900 rounded-lg p-6 border border-secondary-200 dark:border-secondary-800">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <Upload className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    Total Videos
                  </p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {pagination?.total || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Videos */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <VideoGrid
            videos={videos || []}
            viewMode={viewMode}
            onVideoClick={(videoId) => navigate(`/video/${videoId}`)}
            onLoadMore={() => setPage(prev => prev + 1)}
            hasMore={pagination?.hasMore}
            isLoadingMore={isLoading}
          />
        )}

        {/* Empty State */}
        {!isLoading && (!videos || videos.length === 0) && (
          <div className="text-center py-12">
            <Upload className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
              No videos yet
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              Upload your first video to get started
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="btn-primary btn-lg"
            >
              Upload Video
            </button>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {isUploadOpen && (
        <VideoUpload
          onClose={() => setIsUploadOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};
