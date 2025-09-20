import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { LoginRequest, RegisterRequest } from '../types';
import axiosInstance from '../services/axiosInstance';

const AuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [loginData, setLoginData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState<RegisterRequest>({
    email: '',
    password: '',
    name: '',
    birthDate: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string>('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'login' | 'register'
  ) => {
    const { name, value } = e.target;
    if (type === 'login') {
      setLoginData((prev) => ({ ...prev, [name]: value }));
    } else {
      setRegisterData((prev) => ({ ...prev, [name]: value }));
      // Check password match when password changes
      if (name === 'password') {
        setPasswordMatch(confirmPassword === '' || value === confirmPassword);
      }
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPasswordMatch(value === registerData.password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(loginData);
      navigate('/');
    } catch (err) {
      setError('Email hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate password match before submitting
    if (registerData.password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      setPasswordMatch(false);
      return;
    }
    
    setIsLoading(true);
    try {
      await axiosInstance.post('/auth/register', registerData);
      await login({
        email: registerData.email,
        password: registerData.password,
      });
      navigate('/');
    } catch (err) {
      setError('Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setFocusedField('');
    setConfirmPassword('');
    setPasswordMatch(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md w-full relative">
        <div 
          className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6 transition-all duration-700 ease-in-out transform ${
            isRegister ? 'scale-105' : 'scale-100'
          }`}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Header with smooth transition */}
          <div className="text-center relative overflow-hidden">
            <div className={`transition-all duration-500 ease-in-out transform ${isRegister ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-100'}`}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <div className={`transition-transform duration-500 ${isRegister ? 'rotate-180' : 'rotate-0'}`}>
                  {isRegister ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {isRegister ? 'Tạo tài khoản mới' : 'Chào mừng trở lại'}
              </h2>
              <p className="mt-3 text-gray-600 font-medium">
                {isRegister 
                  ? 'Bắt đầu hành trình quản lý tài chính thông minh' 
                  : 'Tiếp tục quản lý tài chính cá nhân của bạn'
                }
              </p>
            </div>
          </div>

          {/* Error message with animation */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${error ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          </div>

          {/* Form Container with height transition */}
          <div className="relative">
            <div className={`transition-all duration-500 ease-in-out ${isRegister ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-96'}`}>
              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-4">
                  {/* Email Field */}
                  <div className="relative group">
                    <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200">
                      📧 Email
                    </label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => handleChange(e, 'login')}
                      onFocus={() => setFocusedField('login-email')}
                      onBlur={() => setFocusedField('')}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-300 ease-in-out bg-gray-50/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                        focusedField === 'login-email'
                          ? 'border-indigo-400 ring-4 ring-indigo-100 bg-white transform scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative group">
                    <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200">
                      🔐 Mật khẩu
                    </label>
                    <input
                      id="login-password"
                      name="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => handleChange(e, 'login')}
                      onFocus={() => setFocusedField('login-password')}
                      onBlur={() => setFocusedField('')}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-300 ease-in-out bg-gray-50/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                        focusedField === 'login-password'
                          ? 'border-indigo-400 ring-4 ring-indigo-100 bg-white transform scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-6 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 ease-in-out transform ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Đang đăng nhập...
                    </div>
                  ) : (
                    'Đăng nhập 🚀'
                  )}
                </button>
              </form>
            </div>

            <div className={`transition-all duration-500 ease-in-out ${isRegister ? 'opacity-100 max-h-[600px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-4">
                  {/* Name Field */}
                  <div className="relative group">
                    <label htmlFor="register-name" className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Họ và tên
                    </label>
                    <input
                      id="register-name"
                      name="name"
                      type="text"
                      value={registerData.name}
                      onChange={(e) => handleChange(e, 'register')}
                      onFocus={() => setFocusedField('register-name')}
                      onBlur={() => setFocusedField('')}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-300 ease-in-out bg-gray-50/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                        focusedField === 'register-name'
                          ? 'border-green-400 ring-4 ring-green-100 bg-white transform scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="relative group">
                    <label htmlFor="register-email" className="block text-sm font-semibold text-gray-700 mb-2">
                      📧 Email
                    </label>
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => handleChange(e, 'register')}
                      onFocus={() => setFocusedField('register-email')}
                      onBlur={() => setFocusedField('')}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-300 ease-in-out bg-gray-50/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                        focusedField === 'register-email'
                          ? 'border-green-400 ring-4 ring-green-100 bg-white transform scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative group">
                    <label htmlFor="register-password" className="block text-sm font-semibold text-gray-700 mb-2">
                      🔐 Mật khẩu
                    </label>
                    <input
                      id="register-password"
                      name="password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => handleChange(e, 'register')}
                      onFocus={() => setFocusedField('register-password')}
                      onBlur={() => setFocusedField('')}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-300 ease-in-out bg-gray-50/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                        focusedField === 'register-password'
                          ? 'border-green-400 ring-4 ring-green-100 bg-white transform scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Tạo mật khẩu mạnh"
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <div className="relative group">
                    <label htmlFor="register-confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      🔒 Nhập lại mật khẩu
                    </label>
                    <input
                      id="register-confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onFocus={() => setFocusedField('register-confirmPassword')}
                      onBlur={() => setFocusedField('')}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-300 ease-in-out bg-gray-50/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                        focusedField === 'register-confirmPassword'
                          ? passwordMatch
                            ? 'border-green-400 ring-4 ring-green-100 bg-white transform scale-[1.02]'
                            : 'border-red-400 ring-4 ring-red-100 bg-white transform scale-[1.02]'
                          : !passwordMatch && confirmPassword !== ''
                          ? 'border-red-300 hover:border-red-400'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Nhập lại mật khẩu"
                    />
                    {/* Password Match Indicator */}
                    {confirmPassword !== '' && (
                      <div className="absolute right-3 top-11 flex items-center">
                        <div className={`transition-all duration-300 ${passwordMatch ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className={`transition-all duration-300 ${!passwordMatch ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {/* Password Match Message */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      confirmPassword !== '' && !passwordMatch 
                        ? 'max-h-8 opacity-100 mt-2' 
                        : 'max-h-0 opacity-0'
                    }`}>
                      <p className="text-red-500 text-sm font-medium flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Mật khẩu không khớp
                      </p>
                    </div>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      confirmPassword !== '' && passwordMatch 
                        ? 'max-h-8 opacity-100 mt-2' 
                        : 'max-h-0 opacity-0'
                    }`}>
                      <p className="text-green-500 text-sm font-medium flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Mật khẩu khớp
                      </p>
                    </div>
                  </div>

                  {/* Birth Date Field */}
                  <div className="relative group">
                    <label htmlFor="register-birthDate" className="block text-sm font-semibold text-gray-700 mb-2">
                      🎂 Ngày sinh
                    </label>
                    <input
                      id="register-birthDate"
                      name="birthDate"
                      type="date"
                      value={registerData.birthDate}
                      onChange={(e) => handleChange(e, 'register')}
                      onFocus={() => setFocusedField('register-birthDate')}
                      onBlur={() => setFocusedField('')}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-300 ease-in-out bg-gray-50/50 backdrop-blur-sm text-gray-900 ${
                        focusedField === 'register-birthDate'
                          ? 'border-green-400 ring-4 ring-green-100 bg-white transform scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-6 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 ease-in-out transform ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Đang tạo tài khoản...
                    </div>
                  ) : (
                    'Tạo tài khoản ✨'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-gray-600 mb-3 font-medium">
              {isRegister ? 'Đã có tài khoản rồi?' : 'Lần đầu sử dụng?'}
            </p>
            <button
              type="button"
              onClick={switchMode}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 ${
                isRegister
                  ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200'
                  : 'text-green-600 bg-green-50 hover:bg-green-100 border-2 border-green-200'
              }`}
            >
              {isRegister ? '🔄 Chuyển sang đăng nhập' : '🌟 Tạo tài khoản mới'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;