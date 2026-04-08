'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { Shield, Zap, Lock, Cpu, Globe, Activity, Rocket, Users, BarChart3 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [captchaData, setCaptchaData] = useState({ id: '', data: '' });
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email/Captcha, 2: OTP
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 3D Tilt Logic
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rx = ((y - centerY) / centerY) * -5; // Subtle tilt for split screen
    const ry = ((x - centerX) / centerX) * 5;
    setTilt({ rx, ry });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const res = await api.get('/captcha/generate');
      setCaptchaData(res.data);
    } catch (err) {
      setError('Failed to load CAPTCHA');
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/request-otp', {
        email,
        captchaId: captchaData.id,
        captchaText
      });
      if (res.data.debugOtp) {
        setDemoOtp(res.data.debugOtp);
      }
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden relative" style={{ background: '#0a0a0f' }}>
      {/* --- FULL SCREEN BACKGROUND IMAGE --- */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/assets/login-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.60) 0%, rgba(10,10,30,0.55) 100%)' }} />

      {/* Subtle scanline for tech feel */}
      <div className="scanline opacity-10" />

      {/* --- SPLIT SCREEN CONTAINER --- */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-[3rem] overflow-hidden relative z-10 border border-white/10 card-3d"
        style={{ 
          background: 'rgba(10,10,25,0.55)', 
          backdropFilter: 'blur(32px)', 
          WebkitBackdropFilter: 'blur(32px)', 
          boxShadow: '0 40px 100px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.08)',
          '--rx': `${tilt.rx}deg`, 
          '--ry': `${tilt.ry}deg` 
        } as any}
      >
        
        {/* --- LEFT COLUMN: BRANDING OVERLAY --- */}
        <div className="relative hidden lg:flex flex-col items-center justify-center border-r border-white/10 overflow-hidden">
           {/* Subtle gradient overlay on left side */}
           <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(79,70,229,0.12) 0%, rgba(236,72,153,0.08) 100%)' }} />

           <div className="relative z-10 flex flex-col items-center gap-8 px-14 text-center">
              {/* Icon */}
              <div className="w-28 h-28 bg-white/10 backdrop-blur-2xl rounded-[2rem] border border-white/20 flex items-center justify-center shadow-2xl shadow-indigo-900/30 animate-float-3d">
                 <Rocket size={56} className="text-indigo-300 drop-shadow-xl" />
              </div>

              <div>
                 <h1 className="text-5xl font-black text-white tracking-tight leading-none">
                    DT<span className="text-indigo-400">MS</span>
                 </h1>
                 <p className="text-white/50 text-xs font-bold uppercase tracking-[0.4em] mt-3">Digital Task Management</p>
              </div>

              {/* Feature Badges */}
              <div className="flex flex-col gap-3 w-full mt-4">
                 {[{ icon: Shield, label: 'Secure OTP Auth' }, { icon: Zap, label: 'Real-Time Sync' }, { icon: BarChart3, label: 'Executive Analytics' }, { icon: Users, label: 'Team Collaboration' }].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
                       <Icon size={16} className="text-indigo-400 shrink-0" />
                       <span className="text-white/70 text-xs font-semibold tracking-wide">{label}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Corner accents */}
           <div className="absolute top-10 left-10 w-6 h-6 border-t-2 border-l-2 border-indigo-400/30" />
           <div className="absolute bottom-10 right-10 w-6 h-6 border-b-2 border-r-2 border-pink-400/30" />
        </div>

        {/* --- RIGHT COLUMN: LOGIN FORM --- */}
        <div className="flex flex-col justify-center p-12 lg:p-20 relative group/form" style={{ background: 'rgba(255,255,255,0.03)' }}>
           {/* Interior Glowing Border */}
           <div className="absolute -inset-px bg-gradient-to-br from-indigo-400/20 via-transparent to-pink-400/20 opacity-0 group-hover/form:opacity-100 transition-opacity rounded-[4rem]"></div>

           <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="flex justify-center mb-5">
                   <div className="w-20 h-20 bg-indigo-500/15 rounded-3xl flex items-center justify-center border border-indigo-500/30 shadow-xl shadow-indigo-900/30 relative">
                      <Cpu size={40} className="text-indigo-400" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-white/10 shadow-sm">
                         <Shield size={12} className="text-white" />
                      </div>
                   </div>
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight">
                  Digital Task <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Management</span>
                </h2>
                <p className="text-white/50 text-sm font-medium mt-2">Sign in to your account</p>
              </div>

              {error && (
                <div className="border border-rose-500/30 p-4 mb-6 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.12)' }}>
                    <div className="w-8 h-8 rounded-xl bg-rose-500/80 flex items-center justify-center shrink-0">
                       <Activity size={16} className="text-white" />
                    </div>
                    <p className="text-rose-300 text-sm font-semibold leading-snug">{error}</p>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleRequestOTP} className="space-y-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1 flex items-center gap-2">
                       <Globe size={12} /> Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-white/15 rounded-2xl px-5 py-4 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all text-white text-sm font-medium placeholder:text-white/25"
                      style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
                      required
                    />
                  </div>

                  {/* CAPTCHA */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1 flex items-center gap-2">
                       <Lock size={12} /> Security Check
                       <span className="text-white/35 font-normal normal-case tracking-normal">— click image to refresh</span>
                    </label>
                    <div 
                       dangerouslySetInnerHTML={{ __html: captchaData.data }} 
                       className="w-full h-16 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 cursor-pointer transition-all hover:opacity-90"
                       style={{ background: 'rgba(255,255,255,0.92)' }}
                       onClick={fetchCaptcha}
                    />
                    <input
                      type="text"
                      placeholder="Type the characters shown above"
                      value={captchaText}
                      onChange={(e) => setCaptchaText(e.target.value)}
                      className="w-full border border-white/15 rounded-2xl px-5 py-4 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all font-mono text-center text-base font-bold text-indigo-300 placeholder:text-white/25 placeholder:font-sans placeholder:text-sm placeholder:font-normal"
                      style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
                      required
                    />
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="group relative w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-900/40 transition-all hover:from-indigo-500 hover:to-indigo-700 active:scale-95 disabled:opacity-50 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 rounded-2xl" />
                    <span className="relative z-10 tracking-wide">{loading ? 'Sending…' : 'Send OTP'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6 animate-fade-in">
                  {/* OTP Sent Info */}
                  <div className="text-center py-5 rounded-2xl border border-indigo-500/20 flex flex-col items-center gap-2" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <p className="text-white/60 text-sm font-medium">OTP sent to</p>
                    <p className="text-indigo-300 text-sm font-bold">{email}</p>
                    {demoOtp && (
                      <div className="mt-2 px-6 py-4 rounded-xl border border-emerald-500/25 border-dashed" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <p className="text-emerald-400/70 text-xs font-semibold uppercase tracking-wide mb-1">Dev OTP (testing)</p>
                        <p className="text-4xl font-black text-emerald-400 tracking-widest">{demoOtp}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* OTP Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1 flex items-center gap-2">
                       <Activity size={12} /> Enter OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full border border-white/15 rounded-2xl py-6 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all font-mono text-center text-5xl font-black text-emerald-400 tracking-[0.5em] placeholder:text-white/10 placeholder:text-3xl placeholder:tracking-widest"
                      style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      disabled={loading}
                      type="submit"
                      className="group relative w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-900/30 transition-all hover:from-emerald-500 hover:to-emerald-700 active:scale-95 disabled:opacity-50 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 rounded-2xl" />
                      <span className="relative z-10 tracking-wide">{loading ? 'Verifying…' : 'Verify & Sign In'}</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="text-sm font-semibold text-white/40 hover:text-indigo-400 transition-colors py-1"
                    >
                      ← Back to email
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-10 text-center pt-8 border-t border-white/10 relative">
                 <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-10 h-px bg-indigo-500" />
                 <p className="text-white/35 text-sm mb-3">Don't have an account?</p>
                 <Link href="/register" className="group/link inline-flex items-center gap-3">
                    <span className="text-sm font-bold text-indigo-400 group-hover/link:text-indigo-300 transition-colors">Create an account</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center group-hover/link:bg-indigo-500 group-hover/link:text-white group-hover/link:scale-110 transition-all text-indigo-400 text-sm">
                       →
                    </div>
                 </Link>
              </div>
           </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          background-color: #0a0a0f !important;
        }
      `}</style>
    </div>
  );
}
