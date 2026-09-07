import React from 'react';
import { Shield, Award, Medal, Trophy, Sparkles, Crown } from 'lucide-react';

interface RankTierIconProps {
  tier?: string;
  className?: string;
  size?: number;
}

export const RankTierIcon: React.FC<RankTierIconProps> = ({ tier = 'bronze', className = 'h-4 w-4', size }) => {
  const iconProps = size ? { size, className } : { className };
  switch (tier?.toLowerCase()) {
    case 'bronze':
      return <Shield {...iconProps} />;
    case 'silver':
      return <Award {...iconProps} />;
    case 'gold':
      return <Medal {...iconProps} />;
    case 'platinum':
      return <Trophy {...iconProps} />;
    case 'diamond':
      return <Sparkles {...iconProps} />;
    case 'master':
    case 'grandmaster':
    case 'legend':
      return <Crown {...iconProps} />;
    default:
      return <Shield {...iconProps} />;
  }
};
