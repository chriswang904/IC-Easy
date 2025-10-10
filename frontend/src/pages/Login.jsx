import React, { useState, useEffect  } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle, Loader } from 'lucide-react';
import { login, register, getErrorMessage, getCurrentUser  } from '../api/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });

  // Handle Google OAuth callback
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    console.log('[Google Login] Checking for token in URL');
    console.log('[Google Login] Current URL:', window.location.href);
    console.log('[Google Login] Token:', token ? 'Found' : 'Not found');
    
    if (token) {
      console.log('[Google Login] Processing Google login...');

      localStorage.setItem('access_token', token);
      
      if (userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          console.log('[Google Login] User from URL:', user);
          console.log('[Google Login] Picture URL:', user.picture);

          localStorage.setItem('user', JSON.stringify(user));

          // Clear URL parameters
          window.history.replaceState({}, '', '/login');
        
          // Redirect to homepage
          const redirectPath = localStorage.getItem('redirect_after_login') || '/';
          localStorage.removeItem('redirect_after_login');
          
          window.location.href = redirectPath;
          return;
        } catch (e) {
          console.error('[Google Login] Failed to parse user from URL:', e);
        }
      }

      getCurrentUser()
        .then(user => {
          console.log('[Google Login] User fetched successfully:', user);
          localStorage.setItem('user', JSON.stringify(user));
          
          window.history.replaceState({}, '', '/login');
          
          const redirectPath = localStorage.getItem('redirect_after_login') || '/';
          localStorage.removeItem('redirect_after_login');
          window.location.href = redirectPath;
        })
        .catch(err => {
          console.error('[Google Login] Error fetching user:', err);
          
          const redirectPath = localStorage.getItem('redirect_after_login') || '/';
          localStorage.removeItem('redirect_after_login');
          window.location.href = redirectPath;
        });
    }
  }, []); 


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login({
          username: formData.username,
          password: formData.password
        });
      } else {
        await register({
          email: formData.email,
          username: formData.username,
          password: formData.password
        });
      }
      
      // Redirect to homepage on success
      navigate('/');
    } catch (err) {
      console.error('[Login] Error:', err);
      
      let errorMessage = 'An error occurred';
      
      if (err.response?.data?.detail) {
        // FastAPI 
        const detail = err.response.data.detail;
        
        if (Array.isArray(detail)) {
          // Pydantic 
          errorMessage = detail.map(error => {
            const field = error.loc?.join(' > ') || 'Field';
            return `${field}: ${error.msg}`;
          }).join(', ');
        } else if (typeof detail === 'string') {
          // String
          errorMessage = detail;
        } else if (typeof detail === 'object') {
          // Object
          errorMessage = detail.msg || JSON.stringify(detail);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/google/login');
      const data = await response.json();
      
      if (data.auth_url) {
        console.log('[Google Login] Redirecting to Google...');
        window.location.href = data.auth_url;
      } else {
        throw new Error('Failed to get Google login URL');
      }
    } catch (err) {
      console.error('[Google Login] Error:', err);
      setError('Google login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
            {isLogin ? (
              <LogIn className="w-8 h-8 text-purple-600" />
            ) : (
              <UserPlus className="w-8 h-8 text-purple-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Login to access your research' : 'Join IC-Easy today'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-4 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Loading...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder={isLogin ? "Username or email" : "Choose a username"}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter your password"
                minLength={6}
              />
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">
                At least 6 characters
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              <>
                {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                {isLogin ? 'Login' : 'Sign Up'}
              </>
            )}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setFormData({ email: '', username: '', password: '' });
            }}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>

        {/* Guest Access */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}