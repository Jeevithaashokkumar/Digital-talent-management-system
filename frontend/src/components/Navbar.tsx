'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-3xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push('/dashboard')}>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-[1rem] shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center transform group-hover:rotate-12 transition-all">
                <span className="text-white font-black text-2xl">D</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-widest uppercase">DTMS</span>
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em]">Operations</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6 ml-8 border-l border-white/10 pl-8">
              <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Matrix</Link>
              <Link href="/profile" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Profile</Link>
            </div>
          </div>

          <div className="flex items-center">
            <button 
              onClick={handleLogout}
              className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl"
            >
              Terminate Session
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
