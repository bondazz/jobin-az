import { useState, useEffect } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';

type Language = 'az' | 'ru' | 'en';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

const AzerbaijanFlag = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className}>
    <path fill="#0080BF" d="M241 1.1c-60.7 3-121.3 30.3-165.5 74.4-18.2 18.3-34.2 40-46.1 62.9C23.7 149.5 16 167 16 169.1c0 .5 103.7.9 240 .9 132 0 240-.3 240-.8 0-3.9-15.5-35.9-23.5-48.6-31.6-50-80.4-88.5-135-106.5C304.7 3.3 276.1-.6 241 1.1"/>
    <path fill="#BF0000" d="M14.7 171.7c-1.3 2.2-6.9 23-9.1 33.6C2.1 222.6.8 235.9.8 256c0 27.1 3.2 49.4 10.5 73.8l3.3 10.7h482.8l3.2-10.6c7.3-24.2 10.5-46.7 10.5-73.9s-3.2-49.7-10.5-73.9l-3.2-10.6-241.1-.3c-132.7-.1-241.4.1-241.6.5m242.8 9.2c16.5 4 31.7 13.4 42 25.9 5.2 6.5 4.3 7-2.2 1.2-11.1-9.8-25.4-15.1-41.3-15.1-18.1 0-31.8 5.7-44.6 18.5S192.9 238 192.9 256s5.7 31.8 18.5 44.5c13 12.9 26.6 18.6 44.6 18.6 15.9 0 30.2-5.3 41.3-15.1 6.8-6.1 7.4-5.2 1.3 2-24.6 28.8-66.6 35.5-99.2 15.9-16.9-10.2-30.4-29.1-34.8-48.6-2.1-9.3-2.1-25.3 0-34.6 6.4-28.7 29.9-51.9 58.8-58.2 9.3-2 24.7-1.8 34.1.4m73.6 47.8c1.1 3.5 2.4 6.3 2.8 6.3.5 0 5.2-2.1 10.5-4.6 5.4-2.5 10-4.3 10.4-4 .3.4-1.5 4.9-4.1 10.2-2.6 5.2-4.7 9.8-4.7 10.3s5 2.6 11 4.7c6.1 2.1 11 4.1 11 4.4s-4.9 2.2-11 4.4c-6 2.1-11 4.2-11 4.7s2.3 5.4 5 10.9c2.8 5.5 4.6 10 4 10s-5.4-2-10.7-4.5-9.9-4.5-10.3-4.5-2.5 4.9-4.6 10.9c-2.1 6.1-4.1 10.8-4.4 10.6s-2.3-5.3-4.4-11.3l-3.9-11-10.3 5.1c-5.7 2.8-10.6 4.9-10.9 4.6-.3-.4 1.7-5.3 4.4-11.1l4.9-10.5-11.3-3.9c-6.3-2.1-11.2-4.1-10.9-4.5.2-.4 5.3-2.3 11.2-4.4l10.9-3.8-4.9-10.5c-2.7-5.7-4.6-10.7-4.4-11 .3-.3 5.2 1.8 10.9 4.5l10.3 5 3.4-9.6c5-14.4 4.9-14.3 7.1-8.5 1.1 2.7 2.8 7.7 4 11.1"/>
    <path fill="#008040" d="M15 341.3c0 1.5 8.5 20.8 13.8 31.2 11.8 23.3 27.5 44.8 46.7 64 35.1 35.1 80.3 59.7 127.5 69.5 24.3 5 58.3 6.7 81 4 58.4-6.8 111.4-32.4 152.5-73.5 19.1-19 34.9-40.8 46.9-64.4 5.1-10.1 13.6-29.3 13.6-30.8 0-.2-108.4-.3-241-.3-132.5 0-241 .1-241 .3"/>
    <g fill="#FFF">
      <path d="M222 182c-25.5 6.3-45.8 25.1-54.7 50.5-2.6 7.4-2.8 9.1-2.8 23.5s.2 16.1 2.8 23.5c11.1 31.6 39.8 52.5 72.2 52.5 20 0 37.5-6.9 51.8-20.3 3.4-3.2 4.6-4.7 2.7-3.3-5.8 4.1-15.5 8.5-22.2 10.1-8.1 1.9-23.5 1.9-31.6 0-22.2-5.2-40.8-23.7-46.6-46.2-2.1-8-2.1-24.6 0-32.6 5.8-22.4 23.7-40.3 46.1-46.1 8-2.1 24.6-2.1 32.6 0 6.7 1.7 16.2 6.1 21.7 10 1.9 1.4.7-.1-2.7-3.3C272.9 183 246.2 176 222 182"/>
      <path d="M323.8 219c-.8 1.9-2.5 6.6-3.8 10.5-1.2 3.8-2.4 7.1-2.5 7.3-.1.1-5-2-10.8-4.7l-10.6-4.9 5 10c2.7 5.5 4.7 10.4 4.4 10.8s-4.8 2.2-10 4c-5.2 1.9-9.5 3.7-9.5 4.1s4.3 2.2 9.5 3.9 9.7 3.5 10 4c.2.4-1.8 5.3-4.5 10.8l-4.9 10.1 9.7-4.6c5.3-2.4 10.2-4.7 10.7-4.9.6-.2 2.2 3.1 3.7 7.3 5.3 15.6 4.5 15.2 8.7 3.6 2-5.6 3.9-10.4 4.1-10.7.3-.3 5.1 1.7 10.7 4.3l10.1 4.9-2.4-5.5c-1.3-3-3.6-7.7-4.9-10.4L344 264l2.7-1.1c1.6-.6 6.3-2.3 10.5-3.7 4.3-1.5 7.8-2.9 7.8-3.2s-4.6-2.1-10.3-4.1c-5.6-2-10.1-4-10-4.5s2.2-5.2 4.7-10.6l4.4-9.6-10.1 4.8c-5.6 2.7-10.4 4.7-10.7 4.4-.2-.3-2.1-5.1-4.1-10.7l-3.7-10.2z"/>
    </g>
  </svg>
);

const languages: LanguageOption[] = [
  { code: 'az', name: 'Azərbaycan', flag: '' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

const LanguageToggle = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('az');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (langCode: Language) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative w-8 h-8 rounded-full overflow-hidden group"
          aria-label="Dil"
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
                background: "conic-gradient(from 0deg, transparent 0deg, transparent 60deg, hsl(var(--primary)) 120deg, hsl(var(--primary) / 0.8) 150deg, hsl(var(--primary) / 0.4) 180deg, hsl(var(--primary) / 0.1) 210deg, transparent 270deg, transparent 360deg)"
              }}
            />
          </div>
          {/* Inner background */}
          <div className="absolute inset-[2px] rounded-full bg-card z-10">
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
          </div>
          {/* Hover shine effect */}
          <div className="absolute inset-[2px] rounded-full z-15 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div 
              className="absolute w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
              style={{ transform: 'skewX(-20deg)' }}
            />
          </div>
          {/* Content */}
          <div className="relative z-20 w-full h-full flex items-center justify-center">
            {currentLang.code === 'az' ? (
              <AzerbaijanFlag className="w-5 h-5 rounded-sm group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <span className="text-lg leading-none group-hover:scale-110 transition-transform duration-300">{currentLang.flag}</span>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-36 p-1 bg-popover border border-border rounded-lg shadow-lg z-50"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm ${
              currentLanguage === language.code 
                ? 'bg-primary/10 text-primary' 
                : 'hover:bg-muted'
            }`}
          >
            {language.code === 'az' ? (
              <AzerbaijanFlag className="w-4 h-4 rounded-sm" />
            ) : (
              <span>{language.flag}</span>
            )}
            <span className="flex-1">{language.name}</span>
            {currentLanguage === language.code && (
              <Check className="w-3 h-3" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
