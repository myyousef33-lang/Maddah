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
        {/* Outer Luxury Orange & Light Orange Halo */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#F97316]/50 via-[#FDBA74]/30 to-[#F97316]/50 blur-sm opacity-80 group-hover:opacity-100 transition-opacity" />
        
        {/* Inner Badge Frame */}
        <div className={`relative flex ${iconSizes[size]} items-center justify-center rounded-2xl bg-[#080B10] border-2 border-[#F97316] shadow-md overflow-hidden shrink-0`}>
          
          {/* Subtle Math Geometry Rings in Background */}
          <svg className="absolute inset-0 h-full w-full opacity-40 animate-[spin_24s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" fill="none" stroke="#F97316" strokeWidth="1.5" strokeDasharray="4 3" />
            <ellipse cx="50" cy="50" rx="36" ry="18" fill="none" stroke="#FDBA74" strokeWidth="1.2" strokeDasharray="3 3" transform="rotate(45 50 50)" />
            <ellipse cx="50" cy="50" rx="36" ry="18" fill="none" stroke="#F97316" strokeWidth="1.2" transform="rotate(-45 50 50)" />
          </svg>

          {/* Central Mathematical Symbol: Sigma (∑) with Orange Gradient */}
          <div className="relative z-10 flex items-center justify-center font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFEDD5] via-[#F97316] to-[#EA580C] drop-shadow-[0_2px_8px_rgba(249,115,22,0.6)]">
            <span className="leading-none">∑</span>
          </div>

          {/* Math Light Orange Spark Dot */}
          <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#FDBA74] shadow-[0_0_8px_#FDBA74] animate-pulse" />
        </div>
      </div>

      {/* Luxury Calligraphic Typography: مداح الرياضيات */}
      <div className="flex flex-col text-right shrink-0">
        <div className="flex items-center gap-2">
          <div className={`${titleSizes[size]} font-calligraphy font-black tracking-normal flex items-center gap-1.5 whitespace-nowrap`}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#F97316] gold-glow-subtle font-extrabold">
              مداح
            </span>
            <span className="text-white transition-colors">
              الرياضيات
            </span>
          </div>
          <span className="hidden xs:inline-block rounded-md bg-[#F97316]/10 border border-[#F97316]/30 px-1.5 py-0.5 text-[9px] font-black text-[#FDBA74] tracking-wider uppercase font-mono shadow-xs whitespace-nowrap">
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
