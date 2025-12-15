import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' || 
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-8 h-8 rounded-full bg-muted/50 border border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden group"
      aria-label={isDarkMode ? 'Gündüz' : 'Gecə'}
    >
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}>
        <Sun className="w-4 h-4 text-amber-500" />
      </div>
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${!isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
        <Moon className="w-4 h-4 text-indigo-400" />
      </div>
    </button>
  );
};

export default ThemeToggle;