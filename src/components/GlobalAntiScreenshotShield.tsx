import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

interface GlobalAntiScreenshotShieldProps {
  children?: React.ReactNode;
}

export const GlobalAntiScreenshotShield: React.FC<GlobalAntiScreenshotShieldProps> = ({ children }) => {
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  useEffect(() => {
    const triggerCaptureBlock = () => {
      setIsBlocked(true);
      setTimeout(() => {
        setIsBlocked(false);
      }, 3000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isPrintScreen = e.key === 'PrintScreen' || e.keyCode === 44;
      if (isPrintScreen) {
        e.preventDefault();
        triggerCaptureBlock();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  return (
    <>
      {children}
      {isBlocked && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0D1B3E] border border-amber-400/50 text-white shadow-2xl animate-in slide-in-from-top duration-300" dir="rtl">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-amber-300">محتوى محمي ضد التصوير</h4>
            <p className="text-[11px] text-slate-200">جميع الحقوق محفوظة لمنصة مداح الرياضيات</p>
          </div>
        </div>
      )}
    </>
  );
};


