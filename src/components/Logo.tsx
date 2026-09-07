import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const iconSizes = {
    sm: 'h-7 w-7 text-base',
    md: 'h-9 w-9 sm:h-10 sm:w-10 text-lg',
    lg: 'h-12 w-12 text-xl',
    xl: 'h-16 w-16 text-2xl'
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Visual Mathematical Geometry & Golden Ratio Badge */}
      <div className="relative group">
        {/* Outer Luxury Gold & Math Cyan Halo */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D4AF37]/50 via-[#19C7E8]/30 to-[#D4AF37]/50 blur-sm opacity-80 group-hover:opacity-100 transition-opacity" />
        
        {/* Inner Badge Frame */}
        <div className={`relative flex ${iconSizes[size]} items-center justify-center rounded-2xl bg-[#080B10] border-2 border-[#D4AF37] dark:border-[#D4AF37] shadow-md overflow-hidden shrink-0`}>
          
          {/* Subtle Math Geometry Rings & Golden Spirals in Background */}
          <svg className="absolute inset-0 h-full w-full opacity-40 animate-[spin_24s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 3" />
            <ellipse cx="50" cy="50" rx="36" ry="18" fill="none" stroke="#19C7E8" strokeWidth="1.2" strokeDasharray="3 3" transform="rotate(45 50 50)" />
            <ellipse cx="50" cy="50" rx="36" ry="18" fill="none" stroke="#D4AF37" strokeWidth="1.2" transform="rotate(-45 50 50)" />
          </svg>

          {/* Central Mathematical Symbol: Infinity (∞) or Sigma (∑) with Gold Gradient */}
          <div className="relative z-10 flex items-center justify-center font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5C0] via-[#D4AF37] to-[#B8860B] drop-shadow-[0_2px_8px_rgba(212,175,55,0.6)]">
            <span className="leading-none">∑</span>
          </div>

          {/* Math Cyan Quantum Spark Dot */}
          <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#19C7E8] shadow-[0_0_8px_#19C7E8] animate-pulse" />
        </div>
      </div>

      {/* Luxury Calligraphic Typography: مداح الرياضيات */}
      <div className="flex flex-col text-right shrink-0">
        <div className="flex items-center gap-2">
          <div className={`${titleSizes[size]} font-calligraphy font-black tracking-normal flex items-center gap-1.5 whitespace-nowrap`}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#D4AF37] to-[#E5B83B] gold-glow-subtle font-extrabold">
              مداح
            </span>
            <span className="text-[#071A33] dark:text-white transition-colors">
              الرياضيات
            </span>
          </div>
          <span className="hidden xs:inline-block rounded-md bg-[#19C7E8]/10 dark:bg-[#19C7E8]/20 border border-[#19C7E8]/30 px-1.5 py-0.5 text-[9px] font-black text-[#19C7E8] dark:text-[#19C7E8] tracking-wider uppercase font-mono shadow-xs whitespace-nowrap">
            MATHEMATICS
          </span>
        </div>
        
        {showSubtitle && (
          <span className="text-[11px] sm:text-xs font-medium text-[#6B7280] dark:text-slate-300 whitespace-nowrap hidden sm:block">
            منصة الرياضيات لجميع المراحل الدراسية
          </span>
        )}
      </div>
    </div>
  );
};
