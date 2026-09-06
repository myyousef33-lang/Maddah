export type ThemeMode = 'light' | 'dark';

export const getTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem('maddah_math_theme_mode');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch (e) {
    console.warn('Error reading theme mode:', e);
  }
  return 'dark';
};

export const applyTheme = (mode: ThemeMode) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('maddah_math_theme_mode', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  } catch (e) {
    console.warn('Error applying theme mode:', e);
  }
};

export const toggleTheme = (): ThemeMode => {
  const current = getTheme();
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
};

// Auto-initialize theme on boot immediately to dark
if (typeof window !== 'undefined') {
  applyTheme(getTheme());
}

