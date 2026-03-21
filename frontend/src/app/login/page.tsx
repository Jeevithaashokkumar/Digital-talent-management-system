'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden bg-slate-50">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-100 rounded-full blur-[120px] opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md w-full p-10 glass rounded-[2.5rem] card-3d border border-white/60 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="text-center mb-8">
          <h2 className="text-5xl font-black bg-gradient-to-br from-indigo-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
            DTMS Secure
          </h2>
          <p className="text-gray-500 mt-3 font-semibold text-sm">Two-Step Verification Matrix</p>
        </div>

        {error && (
          <div className="bg-red-50/80 border border-red-100 p-4 mb-6 rounded-2xl flex flex-col gap-2 animate-shake">
            <div className="flex items-center gap-3">
              <span className="bg-red-500 text-white p-1 rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold">!</span>
              <p className="text-red-600 text-xs font-bold">{error}</p>
            </div>
            {error.includes('User not found') && (
              <p className="text-[10px] text-slate-500 font-bold ml-8">
                System Reset Detected: If this is your first operation since the Matrix Update, please <Link href="/register" className="text-indigo-600 underline">Register a new profile</Link>.
              </p>
            )}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Digital ID (Email)</label>
              <input
                type="email"
                placeholder="identity@dtms.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/40 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-indigo-400 focus:bg-white transition-all font-medium text-slate-700 shadow-inner"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Security Verification</label>
              <div className="flex flex-col gap-4">
                <div 
                   dangerouslySetInnerHTML={{ __html: captchaData.data }} 
                   className="w-full h-14 bg-white/60 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm cursor-pointer hover:bg-white transition-all"
                   onClick={fetchCaptcha}
                   title="Click to refresh"
                />
                <input
                  type="text"
                  placeholder="Enter characters above"
                  value={captchaText}
                  onChange={(e) => setCaptchaText(e.target.value)}
                  className="w-full bg-white/40 border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-indigo-400 focus:bg-white transition-all font-mono tracking-[0.3em] text-center text-lg font-bold"
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-black rounded-[1.5rem] shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-[1.02] transform transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
            >
              {loading ? 'Transmitting...' : 'Decrypt Access'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6 animate-fade-in">
            <div className="text-center py-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 mb-2">
              <p className="text-[11px] font-bold text-indigo-600">OTP Sent to {email}</p>
              {demoOtp && (
                <div className="mt-2 p-2 bg-pink-50 rounded-xl border border-pink-100 animate-pulse">
                  <p className="text-[10px] text-pink-600 font-black uppercase tracking-widest">Dev Mode - Use Code:</p>
                  <p className="text-xl font-black text-pink-700">{demoOtp}</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-1">(Email service not configured in .env)</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-2">Verification Code</label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-white/40 border-2 border-slate-100 rounded-2xl p-5 outline-none focus:border-pink-400 focus:bg-white transition-all font-mono text-center text-4xl font-black text-slate-800 tracking-[0.5em]"
                required
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-gradient-to-br from-pink-600 to-pink-800 text-white font-black rounded-[1.5rem] shadow-xl shadow-pink-200 hover:shadow-2xl hover:scale-[1.02] transform transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
            >
              {loading ? 'Verifying...' : 'Finalize Login'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="w-full text-center text-xs font-bold text-indigo-500 hover:text-pink-600 transition-colors"
            >
              Back to Verification
            </button>
          </form>
        )}

        <div className="mt-10 text-center border-t border-slate-100 pt-6">
          <Link href="/register" className="text-slate-400 hover:text-indigo-600 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
            Create Neural Profile <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
