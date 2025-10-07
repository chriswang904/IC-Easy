import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp, Loader, AlertCircle, Search } from 'lucide-react';
import { 
  getSearchHistory, 
  getTrendingKeywords, 
  getErrorMessage,
  isAuthenticated,
  getStoredUser 
} from '../api';
import Sidebar from '../components/Sidebar';

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authenticated = isAuthenticated();
  const user = getStoredUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [historyData, trendingData] = await Promise.all([
        getSearchHistory(20),
        getTrendingKeywords(7, 10)
      ]);

      setHistory(historyData);
      setTrending(trendingData);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error('[History] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleKeywordClick = (keyword) => {
    navigate(`/?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 p-6 ml-20">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Search History
              </h1>
              <p className="text-gray-600">
                {authenticated 
                  ? `Welcome back, ${user?.username}! Here's your search activity.` 
                  : 'Login to save and view your search history'}
              </p>
            </div>

            {/* Login Prompt for Unauthenticated Users */}
            {!authenticated && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-900 mb-2 text-lg">
                      Sign in to unlock personalized features
                    </h3>
                    <ul className="text-purple-700 mb-4 space-y-1 text-sm">
                      <li>• Save your search history across devices</li>
                      <li>• Get personalized trending topics</li>
                      <li>• Build your research collection</li>
                    </ul>
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition font-medium"
                    >
                      Login / Sign Up
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 font-medium">Error Loading History</p>
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    onClick={loadData}
                    className="text-red-600 hover:text-red-700 font-medium text-sm mt-2 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading your history...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Searches */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      Recent Searches
                    </h2>

                    {history.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                          <Search className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-gray-500 mb-4">
                          {authenticated 
                            ? "You haven't searched anything yet" 
                            : "No search history available"}
                        </p>
                        <button
                          onClick={() => navigate('/')}
                          className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Start searching →
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleKeywordClick(item.keyword)}
                            className="p-4 hover:bg-purple-50 rounded-lg transition-all cursor-pointer border border-gray-100 hover:border-purple-300 hover:shadow-sm"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Search className="w-4 h-4 text-gray-400" />
                                  <p className="font-medium text-gray-800">
                                    {item.keyword}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">{item.total_results}</span> results 
                                  {' • '}
                                  <span className="capitalize">{item.source}</span>
                                  {' • '}
                                  {formatTimestamp(item.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Trending Keywords */}
                <div>
                  <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      Trending
                      <span className="text-xs font-normal text-gray-500 ml-auto">
                        Last 7 days
                      </span>
                    </h2>

                    {trending.length === 0 ? (
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No trending data yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trending.map((item, index) => (
                          <div
                            key={item.keyword}
                            onClick={() => handleKeywordClick(item.keyword)}
                            className="p-3 hover:bg-purple-50 rounded-lg transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className={`text-base font-bold w-6 flex-shrink-0 ${
                                  index === 0 ? 'text-yellow-500' :
                                  index === 1 ? 'text-gray-400' :
                                  index === 2 ? 'text-orange-400' :
                                  'text-purple-600'
                                }`}>
                                  #{index + 1}
                                </span>
                                <span className="text-gray-700 group-hover:text-purple-600 transition truncate">
                                  {item.keyword}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500 bg-gray-100 group-hover:bg-purple-100 px-2 py-1 rounded transition ml-2 flex-shrink-0">
                                {item.count}×
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}