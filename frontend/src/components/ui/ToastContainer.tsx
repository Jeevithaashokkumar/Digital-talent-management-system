'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-[#1e202e]/90 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 min-w-[300px] relative overflow-hidden group"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
            
            <div className={`p-2 rounded-xl bg-white/5`}>
              {toast.type === 'success' && <CheckCircle2 className="text-emerald-400" size={24} />}
              {toast.type === 'info' && <Info className="text-indigo-400" size={24} />}
              {toast.type === 'error' && <AlertTriangle className="text-rose-400" size={24} />}
            </div>

            <div className="flex-1">
              <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">System Message</p>
              <p className="text-sm font-bold text-white tracking-tight">{toast.message}</p>
            </div>

            <button onClick={() => removeToast(toast.id)} className="text-white/20 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
