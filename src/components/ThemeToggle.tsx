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
      className="relative w-8 h-8 rounded-full overflow-hidden group"
      aria-label={isDarkMode ? 'Gündüz' : 'Gecə'}
    >
      {/* Animated border */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className="absolute animate-[border-rotate_3s_linear_infinite]"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "150%",
            height: "150%",
            background: isDarkMode 
              ? "conic-gradient(from 0deg, transparent 0deg, transparent 60deg, hsl(45 93% 47%) 120deg, hsl(45 93% 47% / 0.8) 150deg, hsl(45 93% 47% / 0.4) 180deg, hsl(45 93% 47% / 0.1) 210deg, transparent 270deg, transparent 360deg)"
              : "conic-gradient(from 0deg, transparent 0deg, transparent 60deg, hsl(239 84% 67%) 120deg, hsl(239 84% 67% / 0.8) 150deg, hsl(239 84% 67% / 0.4) 180deg, hsl(239 84% 67% / 0.1) 210deg, transparent 270deg, transparent 360deg)"
          }}
        />
      </div>
      {/* Inner background */}
      <div className="absolute inset-[2px] rounded-full bg-card z-10">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
      </div>
      {/* Content */}
      <div className="relative z-20 w-full h-full">
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`}>
          <Sun className="w-4 h-4 text-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
        </div>
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${!isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-75'}`}>
          <Moon className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_4px_rgba(129,140,248,0.5)]" />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;