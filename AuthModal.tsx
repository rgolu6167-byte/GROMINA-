import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'signup' | 'login';
  gmailConnected: boolean;
  onConnectGmail: () => void;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function AuthModal({
  isOpen,
  initialMode,
  gmailConnected,
  onConnectGmail,
  onClose,
  onSuccess
}: AuthModalProps) {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  // Keep mode in sync with props
  React.useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleGoogleConnect = () => {
    setIsConnectingGoogle(true);
    setError('');

    setTimeout(() => {
      setIsConnectingGoogle(false);
      onConnectGmail();
      setShowToast(true);

      // Pre-fill email with Google user
      if (!email) {
        setEmail('rgolu6167@gmail.com');
      }

      // Auto hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gmailConnected) {
      setError('Please connect your Gmail first to continue');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Success login/signup
    onSuccess(email.trim());
    onClose();
  };

  const handleFieldClick = () => {
    if (!gmailConnected) {
      setError('Please connect your Gmail first to continue');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-[#1f1f1f] border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Gmail connected successfully</span>
        </div>
      )}

      <div className="relative w-full max-w-[400px] bg-[#202020] border border-white/10 rounded-2xl p-8 shadow-2xl text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top: Gromina logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg text-xl mb-3">
            G
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
        </div>

        {/* Continue with Google button */}
        <button
          type="button"
          onClick={handleGoogleConnect}
          disabled={isConnectingGoogle}
          className={`w-full py-3 px-4 rounded-full border flex items-center justify-center gap-3 text-sm font-medium transition cursor-pointer relative ${
            gmailConnected
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-white/20 hover:bg-white/5 text-white'
          }`}
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {isConnectingGoogle
              ? 'Connecting to Google...'
              : gmailConnected
              ? 'Gmail Connected (rgolu6167@gmail.com)'
              : 'Continue with Google'}
          </span>
          {gmailConnected && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-4" />
          )}
        </button>

        {/* Quick instant login button if Gmail already connected */}
        {gmailConnected && (
          <button
            type="button"
            onClick={() => {
              onSuccess(email || 'rgolu6167@gmail.com');
              onClose();
            }}
            className="w-full mt-2 py-2 px-4 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
          >
            Continue as rgolu6167@gmail.com
          </button>
        )}

        {/* Divider OR with lines */}
        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-white/10" />
          <span className="px-3 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            OR
          </span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4" onClick={handleFieldClick}>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email address {!gmailConnected && <span className="text-[11px] text-zinc-500">(Connect Gmail first)</span>}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={!gmailConnected}
              required
              className={`w-full bg-[#171717] border rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 text-sm outline-none transition ${
                gmailConnected
                  ? 'border-white/15 focus:border-white/40'
                  : 'border-white/5 opacity-50 cursor-not-allowed bg-zinc-900'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your email.')}
                  disabled={!gmailConnected}
                  className={`text-xs text-sky-400 hover:underline ${!gmailConnected ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={!gmailConnected}
              required
              className={`w-full bg-[#171717] border rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 text-sm outline-none transition ${
                gmailConnected
                  ? 'border-white/15 focus:border-white/40'
                  : 'border-white/5 opacity-50 cursor-not-allowed bg-zinc-900'
              }`}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                disabled={!gmailConnected}
                required
                className={`w-full bg-[#171717] border rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 text-sm outline-none transition ${
                  gmailConnected
                    ? 'border-white/15 focus:border-white/40'
                    : 'border-white/5 opacity-50 cursor-not-allowed bg-zinc-900'
                }`}
              />
            </div>
          )}

          {/* Continue button */}
          <button
            type="submit"
            disabled={!gmailConnected}
            className={`w-full py-3 rounded-full font-semibold text-sm transition mt-2 shadow-md ${
              gmailConnected
                ? 'bg-white text-black hover:bg-zinc-200 cursor-pointer'
                : 'bg-white/10 text-zinc-500 cursor-not-allowed border border-white/5'
            }`}
          >
            Continue
          </button>
        </form>

        {/* Bottom toggle */}
        <div className="mt-6 text-center text-xs text-zinc-400">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-white font-semibold hover:underline cursor-pointer"
              >
                Log in
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="text-white font-semibold hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
