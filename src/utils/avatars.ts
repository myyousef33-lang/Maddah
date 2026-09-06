export interface AvatarOption {
  id: string;
  name: string;
  iconName: string;
  bgGradient: string;
  borderColor: string;
}

export const PRESET_AVATARS: AvatarOption[] = [
  {
    id: 'preset:infinity',
    name: 'رمز اللانهاية والتحليل',
    iconName: 'Infinity',
    bgGradient: 'from-amber-500/20 to-yellow-600/30',
    borderColor: 'border-[#D4AF37]'
  },
  {
    id: 'preset:calculator',
    name: 'المحاسب الذكي',
    iconName: 'Calculator',
    bgGradient: 'from-blue-500/20 to-indigo-600/30',
    borderColor: 'border-[#1E4FD8]'
  },
  {
    id: 'preset:geometry',
    name: 'الهندسة والفراغية',
    iconName: 'Compass',
    bgGradient: 'from-emerald-500/20 to-teal-600/30',
    borderColor: 'border-emerald-400'
  },
  {
    id: 'preset:functions',
    name: 'الدوال والتفاضل',
    iconName: 'TrendingUp',
    bgGradient: 'from-purple-500/20 to-indigo-600/30',
    borderColor: 'border-purple-400'
  },
  {
    id: 'preset:sparkles',
    name: 'الذكاء الرياضي الفائق',
    iconName: 'Sparkles',
    bgGradient: 'from-cyan-500/20 to-blue-600/30',
    borderColor: 'border-cyan-400'
  },
  {
    id: 'preset:khawarizmi',
    name: 'عالم الرياضيات (الخوارزمي)',
    iconName: 'Award',
    bgGradient: 'from-amber-400/20 to-orange-500/30',
    borderColor: 'border-amber-400'
  }
];

export const getPresetAvatar = (avatarUrl?: string): AvatarOption | null => {
  if (!avatarUrl || !avatarUrl.startsWith('preset:')) return null;
  return PRESET_AVATARS.find(a => a.id === avatarUrl) || PRESET_AVATARS[0];
};
