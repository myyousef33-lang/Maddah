import React from 'react';
import { Shield, Award, Medal, Trophy, Sparkles, Crown } from 'lucide-react';

interface RankTierIconProps {
  tier?: string;
  className?: string;
}

export const RankTierIcon: React.FC<RankTierIconProps> = ({ tier = 'bronze', className = 'h-4 w-4' }) => {
  switch (tier?.toLowerCase()) {
    case 'bronze':
      return <Shield className={className} />;
    case 'silver':
      return <Award className={className} />;
    case 'gold':
      return <Medal className={className} />;
    case 'platinum':
      return <Trophy className={className} />;
    case 'diamond':
      return <Sparkles className={className} />;
    case 'master':
    case 'grandmaster':
    case 'legend':
      return <Crown className={className} />;
    default:
      return <Shield className={className} />;
  }
};
