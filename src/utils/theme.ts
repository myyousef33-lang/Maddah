export type ThemeMode = 'light' | 'dark';

export const getTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('maddah_math_theme_mode');
  return (saved === 'dark' || saved === 'light') ? saved : 'light';
};

export const applyTheme = (mode?: ThemeMode) => {
  if (typeof window === 'undefined') return;
  const targetMode = mode || getTheme();
  try {
    localStorage.setItem('maddah_math_theme_mode', targetMode);
    if (targetMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {
    console.warn('Error applying theme mode:', e);
  }
};

export const toggleTheme = (): ThemeMode => {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
};

if (typeof window !== 'undefined') {
  applyTheme();
}



