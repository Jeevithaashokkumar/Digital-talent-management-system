'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.id) {
      router.push('/login');
      return;
    }
    setUser(userData);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0c10] text-white">
      {/* Dynamic 3D Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-900/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <Navbar />

      <div className="max-w-4xl mx-auto py-24 px-6 text-center">
        <div className="mb-12">
          <h1 className="text-6xl font-black bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent tracking-tighter">
            Operative Profile
          </h1>
          <p className="text-slate-400 mt-4 font-bold uppercase tracking-[0.4em] text-xs">Security Clearance: {user.role.toUpperCase()}</p>
        </div>

        {/* 3D Profile Card */}
        <div className="relative group perspective-1000">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.8rem] p-12 overflow-hidden card-3d">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-1 mb-8 shadow-2xl shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-4xl font-black">
                  {user.name.charAt(0)}
                </div>
              </div>

              <div className="space-y-6 w-full max-w-md">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-left">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">Operative Designation</label>
                  <p className="text-2xl font-bold text-white tracking-tight">{user.name}</p>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-left">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">Digital Identity (Email)</label>
                  <p className="text-lg font-medium text-slate-300">{user.email}</p>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-left">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">Matrix Entry Date</label>
                  <p className="text-lg font-medium text-slate-300">Initialized on System Phase I</p>
                </div>
              </div>

              <div className="mt-12 flex gap-6">
                <Link 
                  href="/dashboard"
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 transition-all"
                >
                  Return to Control Center
                </Link>
                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push('/login');
                  }}
                  className="px-8 py-4 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-red-500/20"
                >
                  Terminate Session
                </button>
              </div>
            </div>
            
            {/* Geometric Accents */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="animate-spin-slow">
                <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="0.5" strokeDasharray="10 10" />
                <rect x="25" y="25" width="50" height="50" stroke="white" strokeWidth="0.5" transform="rotate(45 50 50)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
