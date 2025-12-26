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

const languages: LanguageOption[] = [
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
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
          {/* Content */}
          <div className="relative z-20 w-full h-full flex items-center justify-center">
            <span className="text-lg leading-none group-hover:scale-110 transition-transform duration-300">{currentLang.flag}</span>
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
            <span>{language.flag}</span>
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
