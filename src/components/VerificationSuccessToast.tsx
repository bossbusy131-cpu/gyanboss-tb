import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, X, CheckCircle2 } from 'lucide-react';

interface VerificationSuccessToastProps {
  show: boolean;
  onClose: () => void;
}

export const VerificationSuccessToast: React.FC<VerificationSuccessToastProps> = ({
  show,
  onClose,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in slide-in-from-top duration-300">
      <div className="pointer-events-auto max-w-md w-full bg-emerald-600 text-white rounded-2xl p-4 shadow-2xl shadow-emerald-900/30 border border-emerald-400/40 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 text-white">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Verification Successful! 🎉</span>
          </div>
          <p className="text-xs text-emerald-100 mt-0.5 leading-snug">
            Website aapke phone par agle <strong>24 ghante</strong> ke liye unlock ho gayi hai. Enjoy all lectures & notes!
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
