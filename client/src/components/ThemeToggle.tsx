import { useTheme } from '../context/ThemeContext';
import IconDarkMode from '~icons/material-symbols/dark-mode-outline';
import IconLightMode from '~icons/material-symbols/light-mode-outline';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <IconDarkMode /> : <IconLightMode />}
    </button>
  );
}
