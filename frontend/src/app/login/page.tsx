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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] overflow-hidden relative">
      {/* --- BRIGHT RUNNING BACKGROUND --- */}
      {/* 3D Animated Grid */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none scale-150 transform rotate-12">
        <div className="w-[200%] h-[200%] bg-grid-animate"></div>
      </div>
      
      {/* Floating Vibrant Nebulae */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-400/30 rounded-full nebula pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-400/20 rounded-full nebula pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full nebula pointer-events-none delay-1000"></div>

      {/* Scanning Line Overlay (Subtle Indigo) */}
      <div className="scanline opacity-20"></div>

      {/* --- SPLIT SCREEN CONTAINER --- */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-[4rem] overflow-hidden shadow-4xl relative z-10 border border-white/60 bg-white/30 backdrop-blur-3xl card-3d"
        style={{ 
          '--rx': `${tilt.rx}deg`, 
          '--ry': `${tilt.ry}deg` 
        } as any}
      >
        
        {/* --- LEFT COLUMN: 3D MOVING PICTURE --- */}
        <div className="relative hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600/10 to-pink-600/5 border-r border-white/40 overflow-hidden group">
           <div className="absolute inset-0 z-0 opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <img 
                 src="/assets/login-hero.png" 
                 alt="DTMS Neural Matrix" 
                 className="w-full h-full object-cover mix-blend-overlay animate-float-3d"
              />
           </div>
           
           {/* Primary 3D Floating Element */}
           <div className="relative z-10 p-12 translate-z-[50px] animate-float-3d">
              <div className="w-64 h-64 bg-white/20 backdrop-blur-2xl rounded-[4rem] border-2 border-white/40 shadow-4xl flex items-center justify-center relative overflow-hidden group/icon">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-pink-500/20 animate-pulse" />
                 <Rocket size={100} className="text-indigo-600 drop-shadow-2xl transform group-hover/icon:scale-110 transition-transform duration-500" />
                 
                 {/* Floating Particles */}
                 <div className="absolute top-8 left-8 w-3 h-3 bg-indigo-400 rounded-full blur-sm animate-ping" />
                 <div className="absolute bottom-12 right-12 w-2 h-2 bg-pink-400 rounded-full blur-sm animate-bounce" />
              </div>
           </div>

           {/* Decorative Elements */}
           <div className="absolute top-12 left-12 w-6 h-6 border-t-4 border-l-4 border-indigo-600/30"></div>
           <div className="absolute bottom-12 right-12 w-6 h-6 border-b-4 border-r-4 border-pink-600/30"></div>
        </div>

        {/* --- RIGHT COLUMN: LOGIN FORM --- */}
        <div className="flex flex-col justify-center p-12 lg:p-20 relative group/form">
           {/* Interior Glowing Border */}
           <div className="absolute -inset-px bg-gradient-to-br from-indigo-400/20 via-transparent to-pink-400/20 opacity-0 group-hover/form:opacity-100 transition-opacity rounded-[4rem]"></div>

           <div className="relative z-10 translate-z-[30px]">
              <div className="text-center mb-12">
                <div className="flex justify-center mb-6">
                   <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-100 shadow-xl shadow-indigo-200/20 relative">
                      <Cpu size={40} className="text-indigo-600" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-white shadow-sm">
                         <Shield size={12} className="text-white" />
                      </div>
                   </div>
                </div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase drop-shadow-sm">
                  DTMS <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">SECURE</span>
                </h2>
                <div className="flex items-center justify-center gap-3 mt-4">
                   <div className="w-10 h-px bg-slate-200" />
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Uplink Authorization Matrix</p>
                   <div className="w-10 h-px bg-slate-200" />
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 p-4 mb-8 rounded-2xl flex items-center gap-4 animate-shake">
                    <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-200">
                       <Activity size={16} className="text-white" />
                    </div>
                    <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest leading-relaxed flex-1">{error}</p>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleRequestOTP} className="space-y-8">
                  <div className="space-y-3 relative group/input">
                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] ml-4 flex items-center gap-2">
                       <Globe size={10} /> Neural Digital Signature
                    </label>
                    <input
                      type="email"
                      placeholder="IDENTITY@matrix.net"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/70 border-2 border-slate-100 rounded-2xl p-6 outline-none focus:border-indigo-400 focus:bg-white transition-all font-black text-slate-800 tracking-tight shadow-sm placeholder:text-slate-300 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] ml-4 flex items-center gap-2">
                       <Lock size={10} /> Neural Pattern Lock
                    </label>
                    <div className="space-y-4">
                      <div 
                         dangerouslySetInnerHTML={{ __html: captchaData.data }} 
                         className="w-full h-16 bg-white/80 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-slate-100 shadow-inner cursor-pointer hover:bg-white transition-all group/captcha"
                         onClick={fetchCaptcha}
                      />
                      <input
                        type="text"
                        placeholder="Pattern String"
                        value={captchaText}
                        onChange={(e) => setCaptchaText(e.target.value)}
                        className="w-full bg-white/70 border-2 border-slate-100 rounded-2xl p-6 outline-none focus:border-indigo-400 focus:bg-white transition-all font-mono text-center text-lg font-black text-indigo-600 placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="group relative w-full py-7 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 text-white font-black rounded-3xl shadow-2xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    <span className="relative z-10 uppercase tracking-[0.5em] text-xs italic">Initiate Handshake</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-8 animate-fade-in">
                  <div className="text-center py-6 bg-indigo-50 rounded-[2.5rem] border-2 border-indigo-100/50 flex flex-col items-center gap-2 group">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Uplink to {email}</p>
                    {demoOtp && (
                      <div className="mt-2 p-5 bg-white/90 rounded-2xl border-2 border-emerald-500/20 border-dashed animate-pulse shadow-xl shadow-emerald-500/10">
                        <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mb-1 italic">Dev Bypass Code</p>
                        <p className="text-5xl font-black text-emerald-600 tracking-tighter italic">{demoOtp}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] ml-4 flex items-center gap-2">
                       <Activity size={10} /> Neural Key Sync
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="******"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-white/70 border-2 border-slate-100 rounded-2xl p-7 outline-none focus:border-emerald-400 focus:bg-white transition-all font-mono text-center text-6xl font-black text-emerald-500 shadow-sm"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-5">
                    <button
                      disabled={loading}
                      type="submit"
                      className="group relative w-full py-7 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 text-white font-black rounded-3xl shadow-2xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                      <span className="relative z-10 uppercase tracking-[0.5em] text-xs italic">Sync Matrix</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] hover:text-indigo-600 transition-colors"
                    >
                      [ Re-Authenticate ]
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-16 text-center pt-10 border-t border-slate-100 relative">
                 <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-12 h-px bg-pink-500" />
                 <Link href="/register" className="group/link inline-flex items-center gap-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] group-hover/link:text-indigo-600 transition-colors italic">Create Neural ID</span>
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover/link:bg-indigo-500 group-hover/link:text-white group-hover/link:scale-110 transition-all text-indigo-600 shadow-lg shadow-indigo-100/50">
                       →
                    </div>
                 </Link>
              </div>
           </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          background-color: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
