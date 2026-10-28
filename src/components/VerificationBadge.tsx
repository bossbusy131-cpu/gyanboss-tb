import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  Lock, 
  Smartphone, 
  Sparkles,
  X,
  AlertTriangle
} from 'lucide-react';
import { arolinksService, VerificationPass, TimeRemaining } from '../services/arolinksService';

interface VerificationBadgeProps {
  onReverify: () => void;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ onReverify }) => {
  const [pass, setPass] = useState<VerificationPass | null>(() => arolinksService.getStoredPass());
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => arolinksService.getRemainingTime());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Update timer every second and listen for pass changes
  useEffect(() => {
    const updateTime = () => {
      const currentPass = arolinksService.getStoredPass();
      setPass(currentPass);
      const remaining = arolinksService.getRemainingTime(currentPass);
      setTimeRemaining(remaining);

      // If pass expired, trigger reverify flow
      if (currentPass && remaining.isExpired) {
        arolinksService.clearPass();
        onReverify();
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handlePassUpdate = (e: any) => {
      setPass(e.detail);
      setTimeRemaining(arolinksService.getRemainingTime(e.detail));
    };

    window.addEventListener('gyansarthi_pass_updated', handlePassUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('gyansarthi_pass_updated', handlePassUpdate);
    };
  }, [onReverify]);

  if (!pass || !pass.isVerified || timeRemaining.isExpired) {
    return null;
  }

  const expiresDate = new Date(pass.expiresAt);
  const formattedExpiry = expiresDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  }) + ', ' + expiresDate.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <>
      {/* Header Compact Badge */}
      <button
        type="button"
        onClick={() => setIsDetailsOpen(true)}
        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
        title="24-Hour Access Pass Active - Click for Details"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="font-mono text-[11px] sm:text-xs">
          {timeRemaining.formatted}
        </span>
      </button>

      {/* Details Card Modal */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Shield Icon and Title */}
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                24-Hour Access Pass Active
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Aapka phone 24 ghante ke liye unlocked hai
              </p>
            </div>

            {/* Live Countdown Display */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Time Remaining
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1">
                <span>{timeRemaining.hours.toString().padStart(2, '0')}h</span>
                <span className="text-emerald-500 animate-pulse">:</span>
                <span>{timeRemaining.minutes.toString().padStart(2, '0')}m</span>
                <span className="text-emerald-500 animate-pulse">:</span>
                <span>{timeRemaining.seconds.toString().padStart(2, '0')}s</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${timeRemaining.percentageLeft}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                <span>Pass Valid: 24 Hours</span>
                <span>Expires: {formattedExpiry}</span>
              </div>
            </div>

            {/* Info Items */}
            <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Device Status:</span>
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Unlocked (24h)</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expiry Action:</span>
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Requires Re-verification
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-5 space-y-2">
              <button
                onClick={() => {
                  setIsDetailsOpen(false);
                  onReverify();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-verify / Extend 24 Hours</span>
              </button>

              <button
                onClick={() => {
                  arolinksService.clearPass();
                  setIsDetailsOpen(false);
                  onReverify();
                }}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Website Now (Test 24h Lock)</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
