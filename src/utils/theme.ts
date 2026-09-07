export type ThemeMode = 'light' | 'dark';

export const getTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('maddah_math_theme_mode');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch (e) {
    console.warn('Error reading theme mode:', e);
  }
  return 'light';
};

export const applyTheme = (mode: ThemeMode) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('maddah_math_theme_mode', mode);
    if (mode === 'dark') {
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
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
};

// Force default light theme on boot for eye-friendly bright experience
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('maddah_math_theme_mode');
  // Always default to light theme on fresh boot
  if (!stored || stored === 'dark') {
    applyTheme('light');
  } else {
    applyTheme(getTheme());
  }
}



