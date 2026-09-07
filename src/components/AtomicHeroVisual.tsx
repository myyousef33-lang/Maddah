import React from 'react';

export const AtomicHeroVisual: React.FC = () => {
  return (
    <div className="relative mx-auto flex items-center justify-center my-2 select-none pointer-events-none">
      {/* Container with soft mathematical ambient background glow */}
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
        
        {/* Ambient Luxury Gold & Electric Blue Radial Glow */}
        <div className="absolute inset-1 bg-gradient-to-tr from-[#F97316]/15 via-[#FDBA74]/10 to-[#F97316]/15 rounded-full blur-xl pointer-events-none" />

        {/* Ring 1: Concentric Golden Ratio Geometric Circle with Mathematical Tick marks */}
        <div 
          className="absolute inset-0 flex items-center justify-center animate-[spin_30s_linear_infinite]"
          style={{ transformOrigin: 'center center' }}
        >
          <svg className="w-full h-full" viewBox="0 0 240 240">
            <circle 
              cx="120" cy="120" r="92" 
              fill="none" 
              stroke="#F97316" 
              strokeWidth="1.6" 
              strokeOpacity="0.45" 
              strokeDasharray="6 6"
            />
            {/* Elegant Mathematical Symbols on the ring */}
            <text x="120" y="24" fill="#F97316" fontSize="13" fontWeight="900" textAnchor="middle" opacity="0.8">π</text>
            <text x="216" y="124" fill="#FDBA74" fontSize="13" fontWeight="900" textAnchor="middle" opacity="0.8">∫</text>
            <text x="120" y="222" fill="#F97316" fontSize="13" fontWeight="900" textAnchor="middle" opacity="0.8">∑</text>
            <text x="24" y="124" fill="#FDBA74" fontSize="13" fontWeight="900" textAnchor="middle" opacity="0.8">√</text>
          </svg>
        </div>

        {/* Ring 2: Tilted Geometry Ellipse (Euler coordinate plane) */}
        <div 
          className="absolute inset-0 flex items-center justify-center animate-[spin_24s_linear_infinite_reverse]"
          style={{ transform: 'rotate(45deg)', transformOrigin: 'center center' }}
        >
          <svg className="w-full h-full" viewBox="0 0 240 240">
            <ellipse 
              cx="120" cy="120" rx="98" ry="42" 
              fill="none" 
              stroke="#FDBA74" 
              strokeWidth="1.4" 
              strokeOpacity="0.35" 
              strokeDasharray="4 4"
            />
            {/* Floating delta & infinity points */}
            <circle cx="218" cy="120" r="3.5" fill="#FDBA74" />
            <circle cx="218" cy="120" r="6.5" fill="#FDBA74" fillOpacity="0.25" />
          </svg>
        </div>

        {/* Ring 3: Orthogonal Ellipse with Gold Accent */}
        <div 
          className="absolute inset-0 flex items-center justify-center animate-[spin_20s_linear_infinite]"
          style={{ transform: 'rotate(-45deg)', transformOrigin: 'center center' }}
        >
          <svg className="w-full h-full" viewBox="0 0 240 240">
            <ellipse 
              cx="120" cy="120" rx="98" ry="42" 
              fill="none" 
              stroke="#F97316" 
              strokeWidth="1.4" 
              strokeOpacity="0.35" 
            />
            <circle cx="22" cy="120" r="3.5" fill="#F97316" />
            <circle cx="22" cy="120" r="6.5" fill="#F97316" fillOpacity="0.25" />
          </svg>
        </div>

        {/* Center Golden Infinity & Delta Emblem */}
        <div className="absolute z-10 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-[#0B0B0F] border border-[#F97316] shadow-[0_0_15px_rgba(249, 115, 22,0.5)] flex items-center justify-center">
              <span className="text-xs font-black font-serif text-[#F97316] leading-none">∞</span>
            </div>
            <div className="absolute w-10 h-10 rounded-full bg-[#F97316]/15 animate-ping pointer-events-none" />
          </div>
        </div>

        {/* Left Math Formula Badge: e^(iπ) + 1 = 0 */}
        <div className="absolute -left-5 sm:-left-8 top-1/2 -translate-y-1/2 z-20 bg-[#0B0B0F]/90 dark:bg-[#0B0B0F]/95 backdrop-blur-md border border-[#F97316]/50 px-2.5 py-0.5 rounded-xl shadow-md">
          <span className="text-[10px] sm:text-[11px] font-black font-mono text-[#F97316] tracking-wide dir-ltr inline-block">
            e^(iπ) + 1 = 0
          </span>
        </div>

        {/* Right Math Formula Badge: f(x) = ∫ e^x dx */}
        <div className="absolute -right-5 sm:-right-8 top-1/2 -translate-y-1/2 z-20 bg-[#0B0B0F]/90 dark:bg-[#0B0B0F]/95 backdrop-blur-md border border-[#FDBA74]/40 px-2.5 py-0.5 rounded-xl shadow-md">
          <span className="text-[10px] sm:text-[11px] font-black font-mono text-[#FDBA74] tracking-wide dir-ltr inline-block">
            f(x) = ∫ e^x
          </span>
        </div>

      </div>
    </div>
  );
};
