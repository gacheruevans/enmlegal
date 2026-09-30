import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ScaleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useNavigate, useSearchParams, Link } from 'react-router';
import api from '../../lib/api';
import { isTokenExpired } from '../../lib/auth';
import { usePageSEO } from '../../hooks/usePageSEO';

export const Login: React.FC = () => {
  usePageSEO({
    title: 'Admin Portal Secure Login',
    description: 'Authorized administrative and counsel access for ENM Legal Advocates.',
    noindex: true,
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === '1';

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Bot Protection: Honeypot trap & Captcha
  const [honeypot, setHoneypot] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [isCaptchaRefreshing, setIsCaptchaRefreshing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Form Status & Security
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      navigate('/admin/blog-posts', { replace: true });
    }
  }, [navigate]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Generate & Draw Canvas Captcha
  const drawCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Random noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150 + 100)}, ${Math.floor(
        Math.random() * 150 + 100
      )}, 255, 0.35)`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render characters with distortion, rotation, and colors
    const colors = ['#f59e0b', '#38bdf8', '#34d399', '#fbbf24', '#e2e8f0'];
    const charSpacing = width / (code.length + 1);

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.save();
      const x = charSpacing * (i + 1) + (Math.random() * 6 - 3);
      const y = height / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 40 - 20) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = `bold ${Math.floor(Math.random() * 6 + 22)}px "Courier New", monospace`;
      ctx.fillStyle = colors[i % colors.length];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }, []);

  // Fetch or generate new Captcha
  const refreshCaptcha = useCallback(async () => {
    setIsCaptchaRefreshing(true);
    setCaptchaInput('');
    try {
      const { data } = await api.get('/auth/captcha');
      if (data && data.code && data.token) {
        setCaptchaCode(data.code);
        setCaptchaToken(data.token);
        drawCaptcha(data.code);
      } else {
        throw new Error('Fallback captcha required');
      }
    } catch {
      // Robust client-side fallback if backend endpoint is unavailable
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      let fallbackCode = '';
      for (let i = 0; i < 5; i++) {
        fallbackCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setCaptchaCode(fallbackCode);
      setCaptchaToken('');
      drawCaptcha(fallbackCode);
    } finally {
      setIsCaptchaRefreshing(false);
    }
  }, [drawCaptcha]);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  // Validation Checks
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isCaptchaValid =
    captchaInput.trim().toUpperCase() === captchaCode.trim().toUpperCase() &&
    captchaCode.length > 0;
  const isFormValid = isEmailValid && isPasswordValid && isCaptchaValid && lockoutSeconds === 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutSeconds > 0) {
      setError(`Access temporarily throttled. Please wait ${lockoutSeconds} seconds.`);
      return;
    }

    if (!isEmailValid) {
      setError('Please provide a valid administrative email address.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (!isCaptchaValid) {
      setError('Security verification failed. Please check the CAPTCHA characters.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
        captchaToken: captchaToken || undefined,
        captchaAnswer: captchaInput.trim().toUpperCase(),
        honeypot: honeypot || undefined,
      });

      const token = data.accessToken || data.token;
      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setFailedAttempts(0);
      navigate('/admin/blog-posts');
    } catch (err: any) {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);

      if (nextFailures >= 3) {
        setLockoutSeconds(30);
        setError('Too many failed attempts. Security cooldown active for 30 seconds.');
      } else {
        setError(
          err.response?.data?.message ||
            'Authentication failed. Please verify your administrative credentials.'
        );
      }
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#071322] to-[#041a27] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-royal/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Return to Home Action */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Return to enmlegal.com</span>
        </Link>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
          Restricted Counsel Access
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/85 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-2xl shadow-slate-950/80 overflow-hidden relative z-10">
        {/* Top Gold Royalty Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500" />

        <div className="p-6 sm:p-8">
          {/* Header & Crest */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-md">
              <ScaleIcon className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ENM Legal Advocates
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Executive Administration & Content Management Portal
            </p>
          </div>

          {/* Session Expiration Notice */}
          {isExpired && !error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <ExclamationCircleIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Your session has expired. Please authenticate to resume administrative duties.</span>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
              <ExclamationCircleIcon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Hidden Honeypot Field (Bot Trap) */}
            <input
              type="text"
              name="company_website_url"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />

            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Administrative Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <EnvelopeIcon className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="advocate@enmlegal.com"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/70 border text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition ${
                    emailTouched && !isEmailValid && email.length > 0
                      ? 'border-rose-500/60 focus:ring-rose-500/20'
                      : 'border-slate-800 focus:border-amber-400/80 focus:ring-amber-400/20'
                  }`}
                />
                {isEmailValid && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-400">
                    <CheckCircleIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <LockClosedIcon className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bot Protection / Interactive CAPTCHA Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="captcha-input"
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                  <span>Human Verification</span>
                </label>
                <span className="text-[10px] text-slate-400">Anti-Bot Shield</span>
              </div>

              {/* Canvas Captcha Box */}
              <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-950/90 border border-slate-800 mb-2">
                <canvas
                  ref={canvasRef}
                  width={160}
                  height={44}
                  className="rounded-xl border border-slate-800/80 shrink-0"
                />
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  disabled={isCaptchaRefreshing}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition cursor-pointer disabled:opacity-50"
                  title="Generate new challenge"
                >
                  <ArrowPathIcon
                    className={`w-4 h-4 ${isCaptchaRefreshing ? 'animate-spin' : ''}`}
                  />
                </button>
                <div className="flex-1 text-right pr-2">
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    Type characters exactly
                  </span>
                </div>
              </div>

              {/* Captcha Input */}
              <div className="relative">
                <input
                  id="captcha-input"
                  type="text"
                  required
                  maxLength={6}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  placeholder="Enter security code"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm font-mono tracking-widest text-center text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 transition uppercase"
                />
                {isCaptchaValid && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-400">
                    <CheckCircleIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400/30 cursor-pointer"
                />
                <span>Keep me signed in</span>
              </label>

              <span className="text-[11px] text-slate-500">256-Bit TLS Protected</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || lockoutSeconds > 0 || !isFormValid}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] transition shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating Credentials...</span>
                </>
              ) : lockoutSeconds > 0 ? (
                <span>Cooldown Active ({lockoutSeconds}s)</span>
              ) : (
                <>
                  <span>Sign In to Executive Portal</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Legal Compliance Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Strict Legal Professional Privilege Enforced</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Advocates Act (Cap 16, Laws of Kenya) • Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>

      {/* Powered by / copyright note */}
      <div className="mt-6 text-center text-xs text-slate-500 z-10">
        <p>© 2026 ENM Legal Advocates • All Rights Reserved</p>
      </div>
    </div>
  );
};
