export type ThemeMode = 'dark';

export const getTheme = (): ThemeMode => 'dark';

export const applyTheme = (mode?: ThemeMode) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('maddah_math_theme_mode', 'dark');
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  } catch (e) {
    console.warn('Error applying theme mode:', e);
  }
};

export const toggleTheme = (): ThemeMode => {
  applyTheme('dark');
  return 'dark';
};

// Always apply permanent dark luxury theme (#0B0B0F) on load
if (typeof window !== 'undefined') {
  applyTheme('dark');
}



