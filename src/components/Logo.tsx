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
  const iconDimensions = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10 sm:h-11 sm:w-11',
    lg: 'h-13 w-13',
    xl: 'h-16 w-16'
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const subtitleSizes = {
    sm: 'text-[10px]',
    md: 'text-[11px] sm:text-xs',
    lg: 'text-xs sm:text-sm',
    xl: 'text-sm'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`} dir="rtl">
      {/* Visual Mathematical Emblem / Luxury Shield */}
      <div className="relative group shrink-0">
        {/* Soft Golden Ambient Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#F97316]/40 via-[#FDBA74]/20 to-[#EA580C]/40 blur-xs opacity-75 group-hover:opacity-100 transition-opacity" />
        
        {/* Geometric Shield Emblem Frame */}
        <div className={`relative flex ${iconDimensions[size]} items-center justify-center rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#080B10] border border-[#F97316]/60 shadow-[0_4px_16px_rgba(249,115,22,0.25)] overflow-hidden transition-all duration-300 group-hover:border-[#F97316]`}>
          
          {/* Subtle Precision Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#F97316_0.8px,transparent_0.8px)] [background-size:6px_6px] opacity-20" />

          {/* Masterwork Vector Math Icon: Modern Stylized Sigma (∑) + Infinity + Axis */}
          <svg 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 w-4/5 h-4/5 drop-shadow-[0_2px_6px_rgba(249,115,22,0.5)]"
          >
            <defs>
              <linearGradient id="mathGoldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF7ED" />
                <stop offset="0.3" stopColor="#FDBA74" />
                <stop offset="0.7" stopColor="#F97316" />
                <stop offset="1" stopColor="#C2410C" />
              </linearGradient>
              <linearGradient id="mathAccentGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDBA74" stopOpacity="0.8" />
                <stop offset="1" stopColor="#F97316" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Subtle Mathematical Function Curve (Parabola / Integral arc) */}
            <path 
              d="M 6 36 C 14 36, 18 12, 42 12" 
              stroke="url(#mathAccentGrad)" 
              strokeWidth="1.5" 
              strokeDasharray="2 2"
              strokeLinecap="round"
            />

            {/* Sharp Architectural Mathematical Sigma (∑) */}
            <path 
              d="M 36 12 L 15 12 L 27 24 L 15 36 L 36 36 L 38 31 L 22 31 L 29.5 24 L 22 17 L 38 17 Z" 
              fill="url(#mathGoldGrad)" 
              stroke="#FDBA74"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />

            {/* Precision Coordinate Origin Point */}
            <circle cx="27" cy="24" r="1.5" fill="#FFF7ED" />

            {/* Math Spark / Light Accent Point */}
            <circle cx="36" cy="12" r="1.8" fill="#FDBA74" className="animate-pulse" />
          </svg>

          {/* Golden Corner Accents */}
          <div className="absolute top-0 right-0 h-1.5 w-1.5 border-t border-r border-[#FDBA74]/80" />
          <div className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-[#FDBA74]/80" />
        </div>
      </div>

      {/* Brand Typography: مداح الرياضيات */}
      <div className="flex flex-col text-right shrink-0 leading-tight">
        <div className="flex items-center gap-2">
          <div className={`${titleSizes[size]} font-black tracking-normal flex items-center gap-1.5 whitespace-nowrap`}>
            {/* "مداح" with Royal Gold-Orange Gradient */}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#EA580C] via-[#F97316] to-[#FDBA74] font-black drop-shadow-xs">
              مداح
            </span>
            {/* "الرياضيات" - High Contrast for both Light & Dark Mode */}
            <span className="text-[#0F172A] dark:text-white font-extrabold transition-colors">
              الرياضيات
            </span>
          </div>

          {/* Platform Tag Badge */}
          <span className="hidden sm:inline-flex items-center rounded-md bg-[#F97316]/10 border border-[#F97316]/30 px-1.5 py-0.5 text-[9px] font-black text-[#F97316] dark:text-[#FDBA74] tracking-wider uppercase font-mono shadow-xs whitespace-nowrap">
            MATH
          </span>
        </div>
        
        {showSubtitle && (
          <span className={`${subtitleSizes[size]} font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap mt-0.5`}>
            منصة الرياضيات التعليمية لجميع المراحل
          </span>
        )}
      </div>
    </div>
  );
};
