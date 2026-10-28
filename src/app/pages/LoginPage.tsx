import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Lock,
  Phone,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChefHat,
  X
} from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Button3D } from '../components/Button3D';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    phoneNumber?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // If already logged in, redirect to intended page or home
  useEffect(() => {
    if (isAuthenticated && !isSubmitting) {
      const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, isSubmitting, location.state, navigate]);

  const validate = () => {
    const newErrors: typeof errors = {};

    // 1. User Name validation
    const trimmedUser = username.trim();
    if (!trimmedUser) {
      newErrors.username = 'User name is required';
    } else if (trimmedUser.length < 3) {
      newErrors.username = 'User name must be at least 3 characters';
    }

    // 2. Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // 3. Phone Number validation
    const cleanPhone = phoneNumber.replace(/[\s\-()]/g, '');
    const phoneDigits = cleanPhone.replace(/^\+/, '');
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[0-9]{7,15}$/.test(cleanPhone) || phoneDigits.length < 7) {
      newErrors.phoneNumber = 'Enter a valid phone number (at least 7 to 15 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Brief simulated verification transition for smooth UX
    setTimeout(() => {
      login({
        username,
        phoneNumber,
        password,
      });
      setLoginSuccess(true);

      setTimeout(() => {
        const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';
        navigate(destination, { replace: true });
      }, 500);
    }, 450);
  };

  const handleQuickFillDemo = () => {
    setUsername('chef_alexander');
    setPassword('Catering@2026');
    setPhoneNumber('+91 98765 43210');
    setErrors({});
  };

  return (
    <div className="bg-app min-h-dvh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="glow-orb glow-orb-1" aria-hidden />
      <div className="glow-orb glow-orb-2" aria-hidden />
      <div className="glow-orb glow-orb-3" aria-hidden />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md my-8 animate-fade-in-up">
        <GlassCard className="p-6 sm:p-8 border border-white/15 shadow-2xl backdrop-blur-xl">
          {/* Header & Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-pink-500 text-white shadow-lg shadow-violet-500/30 mb-3 border border-white/20">
              <ChefHat size={30} strokeWidth={2.2} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Catering Hub
            </h1>
            <p className="text-sm text-white/60 mt-1">
              Sign in with your credentials to manage events & catering schedules
            </p>
          </div>

          {/* Quick Demo Pill */}
          <div className="mb-6 flex items-center justify-between p-2.5 rounded-xl bg-violet-950/40 border border-violet-500/20">
            <div className="flex items-center gap-2 text-xs text-violet-200">
              <Sparkles size={15} className="text-pink-400 flex-shrink-0 animate-pulse" />
              <span>Need quick access?</span>
            </div>
            <button
              type="button"
              onClick={handleQuickFillDemo}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-600/40 hover:bg-violet-600/60 text-white transition-colors border border-violet-400/30 cursor-pointer"
            >
              Fill Demo Data
            </button>
          </div>

          {/* General Error Banner */}
          {errors.general && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center gap-2.5 text-red-200 text-xs animate-fade-in">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* 1. User Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-username"
                  className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5"
                >
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-violet-500/30 text-violet-300 text-[10px] font-bold">
                    1
                  </span>
                  User Name
                </label>
                {username && (
                  <button
                    type="button"
                    onClick={() => setUsername('')}
                    className="text-white/40 hover:text-white text-xs flex items-center gap-0.5"
                    tabIndex={-1}
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <User size={18} />
                </div>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
                  }}
                  placeholder="e.g. chef_alexander"
                  className={`glass-input pl-10 pr-3 ${
                    errors.username ? 'border-red-500/60 focus:border-red-400' : ''
                  }`}
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                />
              </div>
              {errors.username && (
                <p id="username-error" className="text-red-300 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.username}
                </p>
              )}
            </div>

            {/* 2. Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5"
                >
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-violet-500/30 text-violet-300 text-[10px] font-bold">
                    2
                  </span>
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <Lock size={18} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`glass-input pl-10 pr-10 ${
                    errors.password ? 'border-red-500/60 focus:border-red-400' : ''
                  }`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-red-300 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* 3. Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-phone"
                  className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5"
                >
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-violet-500/30 text-violet-300 text-[10px] font-bold">
                    3
                  </span>
                  Phone Number
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <Phone size={18} />
                </div>
                <input
                  id="login-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (errors.phoneNumber) setErrors(prev => ({ ...prev, phoneNumber: undefined }));
                  }}
                  placeholder="e.g. +91 98765 43210"
                  className={`glass-input pl-10 pr-3 ${
                    errors.phoneNumber ? 'border-red-500/60 focus:border-red-400' : ''
                  }`}
                  aria-invalid={!!errors.phoneNumber}
                  aria-describedby={errors.phoneNumber ? 'phone-error' : undefined}
                />
              </div>
              {errors.phoneNumber && (
                <p id="phone-error" className="text-red-300 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-violet-500 focus:ring-violet-400 focus:ring-offset-0 w-4 h-4 accent-violet-500 cursor-pointer"
                />
                <span>Remember this device</span>
              </label>

              <span className="text-[11px] text-white/40 flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Protected</span>
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button3D
                variant="primary"
                type="submit"
                disabled={isSubmitting || loginSuccess}
                className="w-full justify-center text-sm font-semibold py-3 gap-2"
              >
                {loginSuccess ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-300 animate-bounce" />
                    <span>Signing in...</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying details...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </Button3D>
            </div>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-white/40 flex items-center justify-center gap-1.5">
              <span>Catering Staff Portal</span>
              <span>•</span>
              <span>v1.0</span>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
