import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const { settings, isLoading: settingsLoading } = useSettings();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError('');

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error(err);
      }

      setError(
        err?.message || 'Unable to sign in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const displaySchoolName = settings?.school_name || 'School Admin Portal';

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col lg:flex-row overflow-hidden">

      {/* Brand / marketing panel — hidden on small screens, shown from lg up */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-between bg-gradient-to-br from-teal-950 via-teal-900 to-slate-950 p-10 xl:p-12 h-full">

        {/* decorative dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(251,191,36,0.6) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* soft glow accents */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />

        {/* Greatly visible back link for Desktop */}
        <Link
          to="/"
          className="relative z-10 inline-flex w-fit items-center gap-2 text-base font-bold text-teal-100 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Public Portal
        </Link>

        <div className="relative z-10 space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-teal-800/60 text-amber-400 shadow-lg shadow-black/20 backdrop-blur-sm">
            <GraduationCap className="h-8 w-8" />
          </div>

          <div className="space-y-3">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-400/90">
              <Sparkles className="h-3.5 w-3.5" />
              Administrator Access
            </p>
            <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">
              {settingsLoading ? 'School Admin Portal' : displaySchoolName}
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-teal-100/70">
              Manage students, staff, and school operations from a single,
              secure dashboard built for your administration team.
            </p>
          </div>
        </div>

        <p className="relative z-10 text-xs font-medium text-teal-100/40">
          &copy; {settingsLoading ? 'School Admin Portal' : displaySchoolName}. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Card - Now using a sleek dark theme with reduced border radius */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-6">

            {/* Dynamic Admin Portal Header - Centered everywhere */}
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Admin Portal
              </h2>
              <div className="h-5 flex items-center justify-center">
                {settingsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                ) : (
                  <p className="text-sm font-medium text-slate-400 truncate max-w-[16rem] lg:max-w-full">
                    {displaySchoolName}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div
                className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs sm:text-sm text-red-400 font-medium"
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4" noValidate>

              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-1.5 block text-xs font-semibold text-slate-300"
                >
                  Admin Email
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-xs font-semibold text-slate-300"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-10 pr-10 text-sm text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-slate-600"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-md transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Updated Security Box for dark mode */}
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs">
                <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-amber-400 leading-tight">
                    Secure Administrator Access
                  </p>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    Secure access is reserved exclusively for authorized {settingsLoading ? 'school' : displaySchoolName} personnel.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || settingsLoading}
                aria-busy={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 py-3.5 font-bold text-white shadow-md shadow-teal-900/50 transition-all hover:bg-teal-500 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Highly visible mobile Back Link */}
            <div className="pt-2 text-center lg:hidden">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 text-[15px] font-bold text-teal-500 hover:text-teal-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Public Portal
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;