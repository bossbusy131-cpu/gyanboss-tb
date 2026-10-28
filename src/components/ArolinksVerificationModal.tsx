import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Smartphone, 
  HelpCircle, 
  Key, 
  RefreshCw,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Film,
  FileText
} from 'lucide-react';
import { arolinksService } from '../services/arolinksService';

interface ArolinksVerificationModalProps {
  isOpen: boolean;
  onUnlocked: () => void;
}

export const ArolinksVerificationModal: React.FC<ArolinksVerificationModalProps> = ({
  isOpen,
  onUnlocked,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  const handleStartVerification = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await arolinksService.createVerificationLink();
      if (res && res.shortUrl) {
        setGeneratedLink(res.shortUrl);

        // Open the Arolinks URL
        window.open(res.shortUrl, '_blank');
      } else {
        setErrorMsg('Verification link create nahi ho paya. Kripya dobara koshish karein.');
      }
    } catch (err: any) {
      console.error('Error starting verification:', err);
      setErrorMsg('Network error. Kripya dobara prayas karein.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckStatus = () => {
    // Check if user already got verified or has pending session
    if (arolinksService.isDeviceVerified() || arolinksService.verifyPendingSession()) {
      onUnlocked();
      return;
    }

    // Check if URL has params
    const urlCheck = arolinksService.checkAndHandleUrlVerification();
    if (urlCheck.isVerifiedNow) {
      onUnlocked();
      return;
    }

    setErrorMsg('Verification abhi complete nahi hui hai. Kripya Arolinks link open karke verification step poora karein.');
  };

  const handleAdminBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (arolinksService.verifyAdminBypass(adminCode)) {
      setAdminCode('');
      setShowAdminInput(false);
      onUnlocked();
    } else {
      setAdminError('Invalid Pass Key! Apna sahi Arolinks API token ya Admin Key enter karein.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        
        {/* Glow Header Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400" />

        {/* Top Header Section */}
        <div className="p-5 sm:p-6 pb-4 text-center">
          <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-4 flex items-center justify-center">
            {/* Glowing background halo */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 opacity-20 blur-xl animate-pulse" />
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <ShieldCheck className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1.5 shadow-md border-2 border-white dark:border-slate-900">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>24-Hour Access Verification</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            वेबसाइट 24 घंटे के लिए अनलॉक करें
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-md mx-auto leading-relaxed">
            GyanSarthi study portal ko apne phone par <strong>24 ghante</strong> ke liye unlock karne ke liye Arolinks verification complete karein.
          </p>
        </div>

        {/* Unlocked Benefits Grid */}
        <div className="px-5 sm:px-6 py-2">
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 p-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="text-[11px] sm:text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">11,000+ Lectures</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">All Board Batches</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-[11px] sm:text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">All PDF Notes</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Chapterwise PDFs</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1.5">
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Film className="w-4 h-4" />
              </div>
              <div className="text-[11px] sm:text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Tik-Reels Player</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Fast 60s Revision</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-[11px] sm:text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">24 Hours Pass</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">On this Device</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Easy Guide */}
        <div className="px-5 sm:px-6 py-3">
          <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                1
              </span>
              <p className="leading-snug">
                Neeche diye gaye <strong>"24h Ke Liye Unlock Karein"</strong> button par click karein.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                2
              </span>
              <p className="leading-snug">
                Arolinks page par 10-15 seconds ka short verification step poora karein.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold shrink-0 mt-0.5">
                3
              </span>
              <p className="leading-snug">
                Verfication complete hote hi website aapke phone par <strong>24 ghante ke liye automatically unlock</strong> ho jayegi!
              </p>
            </div>
          </div>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="mx-5 sm:mx-6 mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-5 sm:p-6 pt-2 space-y-2.5">
          {!generatedLink ? (
            <button
              onClick={handleStartVerification}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-700 hover:via-indigo-700 hover:to-sky-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Arolinks Link Taiyar Ho Raha Hai...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>🔓 24h Ke Liye Unlock Karein (Verify Now)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          ) : (
            <div className="space-y-2">
              <a
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Open Arolinks Verification Link</span>
              </a>

              <button
                onClick={handleCheckStatus}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Maine Verification Kar Liya Hai (Check Status)</span>
              </button>
            </div>
          )}

          {/* Secondary helper toggles: Help & Admin Bypass */}
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Verification Help</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdminInput(!showAdminInput)}
              className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Admin / Key Bypass</span>
            </button>
          </div>

          {/* Help Accordion */}
          {showHelp && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2 animate-in fade-in">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                ❓ Arolinks Verification Kaise Karein:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1">
                <li>Green button par click karke Arolinks page open karein.</li>
                <li>Agar page par timer ho to countdown khatam hone ka wait karein.</li>
                <li>"Get Link" ya "Continue" button par click karein.</li>
                <li>Click karte hi website automatically 24 ghante ke liye unlock ho jayegi!</li>
              </ol>
            </div>
          )}

          {/* Admin / Key Bypass Input Form */}
          {showAdminInput && (
            <form onSubmit={handleAdminBypassSubmit} className="pt-2 animate-in fade-in">
              <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                <label className="block text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 mb-1.5">
                  Admin Pass Key / API Token Bypass
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter API token or admin pass..."
                    value={adminCode}
                    onChange={e => setAdminCode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Bypass
                  </button>
                </div>
                {adminError && (
                  <p className="text-[11px] text-red-500 mt-1.5">{adminError}</p>
                )}
                <p className="text-[10px] text-indigo-700/70 dark:text-indigo-300/70 mt-1.5">
                  Website owner can enter their Arolinks API token or admin key to bypass verification.
                </p>
              </div>
            </form>
          )}

        </div>

        {/* Footer info badge */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200/60 dark:border-slate-800/80 text-center">
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
            🔒 Powered by Arolinks Verification • 24 Ghante Baad Dobara Verify Karein
          </p>
        </div>

      </div>
    </div>
  );
};
