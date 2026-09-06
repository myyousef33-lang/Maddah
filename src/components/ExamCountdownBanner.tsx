import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sparkles, Target, Zap, ChevronLeft } from 'lucide-react';
import { StorageService, subscribeToStorage } from '../services/storage';

interface ExamCountdownBannerProps {
  onNavigate?: (view: string, params?: any) => void;
}

export const ExamCountdownBanner: React.FC<ExamCountdownBannerProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState(() => StorageService.getSettings());

  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setSettings(StorageService.getSettings());
    });
    return unsub;
  }, []);

  const rawExamDate = settings.ministryExamDate;
  let parsedTarget = rawExamDate ? new Date(rawExamDate).getTime() : NaN;
  
  // If no valid date or stored date has already passed, fallback to June 14, 2027
  if (isNaN(parsedTarget) || parsedTarget <= Date.now()) {
    parsedTarget = new Date('2027-06-14T09:00:00.000Z').getTime();
  }
  const targetDate = parsedTarget;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const mathTips = [
    'نصيحة اليوم: راجع قواعد الاشتقاق وحساب النهايات بدقة وركز على مشتقات الدوال المثلثية والأسية.',
    'نصيحة اليوم: في الهندسة الفراغية، الضرب الاتجاهي يعطي متجهاً عمودياً على المستوى ومقداره مساحة متوازي الأضلاع.',
    'نصيحة اليوم: مسائل التكامل بالتعويض والتجزيء تتطلب تحديد الدالة والمشتقة بذكاء وخطوات مرتبة.',
    'نصيحة اليوم: تأكد دائماً من تحديد مجال الدالة بدقة قبل حل المعادلات والمتباينات اللوغاريتمية والكسرية.'
  ];

  const [currentTip] = useState(() => mathTips[Math.floor(Math.random() * mathTips.length)]);

  return (
    <div className="rounded-3xl border border-[#D4AF37]/40 bg-[#06090F] p-5 sm:p-6 shadow-xl relative overflow-hidden text-white">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Title & Daily Tip */}
        <div className="space-y-2 text-center lg:text-right">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white/5 backdrop-blur-xs px-3.5 py-1 text-[11px] font-black text-[#F3C644] shadow-xs">
            <Clock className="h-3.5 w-3.5 text-[#F3C644]" />
            <span>العد التنازلي لامتحان الرياضيات للشهادات العامة</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            رحلة الدرجة النهائية في الرياضيات تقترب!
          </h3>
          <p className="text-xs text-slate-300 font-medium">{currentTip}</p>
        </div>

        {/* Countdown Digits Grid */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="rounded-2xl border border-blue-400/30 bg-[#0D1B3E] p-3 sm:p-4 text-center min-w-[65px] sm:min-w-[75px] shadow-sm">
            <span className="text-xl sm:text-2xl font-black text-[#F5B301] font-mono">{timeLeft.days}</span>
            <span className="text-[10px] text-blue-100 font-bold block mt-0.5">يوم</span>
          </div>

          <div className="text-[#F5B301] font-black text-lg">:</div>

          <div className="rounded-2xl border border-blue-400/30 bg-[#0D1B3E] p-3 sm:p-4 text-center min-w-[65px] sm:min-w-[75px] shadow-sm">
            <span className="text-xl sm:text-2xl font-black text-[#F5B301] font-mono">{timeLeft.hours}</span>
            <span className="text-[10px] text-blue-100 font-bold block mt-0.5">ساعة</span>
          </div>

          <div className="text-[#F5B301] font-black text-lg">:</div>

          <div className="rounded-2xl border border-blue-400/30 bg-[#0D1B3E] p-3 sm:p-4 text-center min-w-[65px] sm:min-w-[75px] shadow-sm">
            <span className="text-xl sm:text-2xl font-black text-[#F5B301] font-mono">{timeLeft.minutes}</span>
            <span className="text-[10px] text-blue-100 font-bold block mt-0.5">دقيقة</span>
          </div>

          <div className="text-[#F5B301] font-black text-lg">:</div>

          <div className="rounded-2xl border border-blue-400/30 bg-[#0D1B3E] p-3 sm:p-4 text-center min-w-[65px] sm:min-w-[75px] shadow-sm">
            <span className="text-xl sm:text-2xl font-black text-[#F5B301] font-mono">{timeLeft.seconds}</span>
            <span className="text-[10px] text-blue-100 font-bold block mt-0.5">ثانية</span>
          </div>
        </div>

        {/* Quick Review Plan Button */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('weakness-profile')}
            className="flex items-center gap-1.5 rounded-2xl bg-[#F5B301] px-5 py-3 text-xs font-black text-[#0D1B3E] hover:bg-[#e0a401] transition-all shadow-md shrink-0"
          >
            <span>خطة المراجعة الذكية</span>
            <ChevronLeft className="h-4 w-4 text-[#0D1B3E]" />
          </button>
        )}

      </div>
    </div>
  );
};
