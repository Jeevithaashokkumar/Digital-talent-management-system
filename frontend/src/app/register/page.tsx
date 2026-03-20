'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // For demo purposes, we'll allow role selection on register
  const [role, setRole] = useState('user'); 
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, password, role });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px] opacity-50 animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200 rounded-full blur-[120px] opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md w-full p-8 glass rounded-2xl card-3d border border-white/50 backdrop-blur-xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            Join DTMS
          </h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">Create your professional talent profile</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-6 rounded-r-lg animate-pulse">
            <p className="text-red-700 text-xs font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="group">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 ml-1">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              required
            />
          </div>
          
          <div className="group">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              required
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              required
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 ml-1">I am a...</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white/50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
            >
              <option value="user">Talent (User)</option>
              <option value="admin">Manager (Admin)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transform transition-all active:scale-95 hover:shadow-xl hover:-translate-y-0.5 mt-4"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-gray-500 hover:text-primary transition-colors text-sm font-medium decoration-primary decoration-2 underline-offset-4 hover:underline">
            Already have an account? <span className="text-primary font-bold">Login here</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
