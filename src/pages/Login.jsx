import API_BASE from '../config';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { 
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaLock, 
  FaLeaf,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { toast } from 'react-toastify';
import axios from 'axios';
import loginImage from '../assets/images/loginImage.jpeg';

const Login = ({ setIsLoggedIn, fetchUserDetails }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    const isLikelyJwt = (str) =>
      typeof str === 'string' && str.split('.').length === 3 && str.length > 20;

    try {
      const response = await axios.post('${API_BASE}/auth/login', {
        email,
        password,
      });
      const token = response.data;

      if (token === 'Invalid credentials!' || !isLikelyJwt(token)) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setError('Invalid email or password. Please try again.');
        toast.error('Login failed');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);
      setIsLoggedIn(true);
      await fetchUserDetails(token);

      let userId = null;
      try {
        const uRes = await axios.get('${API_BASE}/auth/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        userId =
          uRes.data.id || uRes.data.userId || uRes.data._id || uRes.data.sub || null;
        if (userId) localStorage.setItem('userId', userId);
      } catch {
        /* ignore */
      }

      if (!userId) {
        const parts = token.split('.');
        if (parts.length === 3) {
          try {
            const decoded = JSON.parse(atob(parts[1]));
            userId = decoded.id || decoded.userId || decoded.sub;
            if (userId) localStorage.setItem('userId', userId);
          } catch {
            /* ignore */
          }
        }
      }

      let farmId = null;
      if (userId) {
        try {
          const farmRes = await axios.get(
            `${API_BASE}/api/farms/user/${encodeURIComponent(userId)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const farmData = farmRes.data;
          farmId = farmData?.id || farmData?.farmId || farmData?.FarmId || null;
          if (farmId) localStorage.setItem('farmId', farmId);
        } catch (farmErr) {
          if (farmErr.response?.status !== 404) {
            console.warn('Farm lookup error:', farmErr.response?.data || farmErr.message);
          } else {
            localStorage.removeItem('farmId');
          }
        }
      }

      toast.success('Welcome back! Login successful.');
      navigate(farmId ? '/dashboard' : '/create-farm');
    } catch (err) {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      if (err.response?.data === 'Invalid credentials!' || err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
        toast.error('Login failed');
      } else {
        setError('An error occurred during login. Please try again later.');
        toast.error('Login error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setError('');
    setForgotMessage('');
    setIsLoading(true);

    if (!validateEmail(forgotEmail)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('${API_BASE}/auth/forgot-password', {
        email: forgotEmail,
      });
      setForgotMessage(response.data);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      setError(err.response?.data || 'An error occurred while sending the reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${loginImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-green-900/50" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 opacity-20">
        <FaLeaf className="w-32 h-32 text-green-400 transform -rotate-12" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20">
        <FaLeaf className="w-24 h-24 text-green-400 transform rotate-45" />
      </div>

      {/* Main Content */}
      <div className="relative flex-grow flex justify-center items-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg shadow-green-500/30 mb-4">
              <FaLeaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {showForgot ? 'Reset Password' : 'Welcome Back'}
            </h1>
            <p className="text-gray-300 text-sm">
              {showForgot
                ? 'Enter your email to receive a reset link'
                : 'Sign in to continue to MyFarm'}
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8">
            {!showForgot ? (
              /* Login Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 outline-none focus:border-green-400 focus:bg-white/15 transition-all duration-300 disabled:opacity-50"
                  />
                </div>

                {/* Password Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 outline-none focus:border-green-400 focus:bg-white/15 transition-all duration-300 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex justify-between items-center">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded-md transition-all duration-200 ${
                        rememberMe 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-400 group-hover:border-green-400'
                      }`}>
                        {rememberMe && (
                          <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors">
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-sm text-green-400 hover:text-green-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <FaExclamationCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-300 flex items-center justify-center gap-2 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-green-500/40 hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <HiSparkles className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-gray-400">or continue with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-300"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-sm font-medium">Google</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="text-sm font-medium">GitHub</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Forgot Password Form */
              <form onSubmit={handleForgotPassword} className="space-y-5">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setError('');
                    setForgotMessage('');
                  }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back to login</span>
                </button>

                {/* Email Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 outline-none focus:border-green-400 focus:bg-white/15 transition-all duration-300 disabled:opacity-50"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <FaExclamationCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {forgotMessage && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                    <FaCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-300 text-sm">{forgotMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-300 flex items-center justify-center gap-2 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-green-500/40 hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>

                {/* Info Text */}
                <p className="text-center text-gray-400 text-sm">
                  We'll send you a link to reset your password
                </p>
              </form>
            )}

            {/* Sign Up Link */}
            {!showForgot && (
              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs">
              By continuing, you agree to our{' '}
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  setIsLoggedIn: PropTypes.func.isRequired,
  fetchUserDetails: PropTypes.func.isRequired,
};

export default Login;



