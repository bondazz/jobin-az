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

const RussiaFlag = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className}>
    <path fill="#BFBFBF" d="M241 1.1C171.3 4.6 102 40.2 57.7 95.3c-16.7 20.8-34.9 52.3-40.2 69.4l-.6 2.3h478.2l-.6-2.3c-.4-1.2-2.3-5.8-4.2-10.2C462 88.9 404.8 36.3 337.5 14.1 304.7 3.3 276.1-.6 241 1.1"/>
    <path fill="#004080" d="M12.6 178.2c-15.9 49.9-15.9 105.7 0 155.5l3.6 11.3h479.6l3.6-11.3c15.9-50.1 15.9-105.3 0-155.5l-3.6-11.2H16.2z"/>
    <path fill="#BF0000" d="M17 345.8c0 1.8 5.6 14.4 11.8 26.7 11.8 23.3 27.5 44.8 46.7 64 40.5 40.5 91.2 65.4 149 73 14.1 1.9 45.5 2.1 59.5.5 58.3-6.7 111.3-32.3 152.5-73.5 19.1-19.1 34.9-40.8 46.9-64.4 6.1-12 11.6-24.5 11.6-26.3 0-.4-107.5-.8-239-.8-131.4 0-239 .4-239 .8"/>
  </svg>
);

const USAFlag = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className}>
    <g fill="#BF0000" strokeWidth="0">
      <path d="M240.5 1c-6 .4-13.6 1.1-16.7 1.5l-5.8.7V218H3.3l-.7 5.2c-2.4 17.5-2.4 48.1 0 65.5l.7 5.3H218v214.7l5.3.7c17.4 2.4 48 2.4 65.5 0l5.2-.7V294h214.7l.8-5.3c2.3-17 2.3-48.4 0-65.5l-.8-5.2H294V3.2l-4.2-.6c-4.9-.7-33.3-2.6-36.3-2.4-1.1 0-6.9.4-13 .8"/>
      <path d="M65.9 85.2c-2.4 2.9-6.9 8.3-10 12.2l-5.7 7 52.1 43.3 52.1 43.3H191v-10.9l-59.3-49.4C99.1 103.6 72 81.1 71.4 80.8c-.5-.4-3 1.6-5.5 4.4m314.9 45.6-59.7 49.7v5.2l-.1 5.3h37.5l51.8-43 51.8-43.1-5.3-6.8c-7-9-14.4-17.1-15.5-17-.4 0-27.7 22.4-60.5 49.7M102.2 364.4l-52.1 43.3 8.2 9.8c4.5 5.4 9.1 10.9 10.2 12.3l2.1 2.4 60.2-50.2 60.2-50.1V321h-36.6zm218.9-38.2.1 5.3 59.6 49.5c32.8 27.2 60.1 49.5 60.7 49.5 1.3 0 9.1-8.7 16.2-17.7l4.4-5.8-51.8-43-51.7-43H321z"/>
    </g>
    <path fill="#FFF" d="m202 6.3-9.5 2.2-.5 63.9-.5 63.8L144 96.6c-26.1-21.7-47.8-39.4-48.2-39.3-1.2.4-23.8 21-23.8 21.7 0 .4 27 23.2 60 50.6l60 49.8V192h-38.2l-51.6-43c-28.4-23.7-52-43-52.4-43-1.2 0-16.8 24.4-16.8 26.4 0 .2 15.8 13.6 35.2 29.8l35.2 29.3-47.4.5-47.5.5-2.2 9.5c-1.2 5.2-2.2 10.7-2.2 12.2L4 217h213V4l-2.7.1c-1.6 0-7.1 1-12.3 2.2m93 104.2V217h213.2l-.7-4.8c-.3-2.6-1.4-8.1-2.4-12.2l-1.7-7.5-45.8-.3c-27.3-.1-45.6-.6-45.4-1.1s15.5-13.6 34.1-29.1l33.8-28.1-3.2-5.7c-1.7-3.1-5.6-9.4-8.7-13.9-4.7-7.1-5.7-8.1-7.1-7-.8.6-24.2 20-51.8 42.9L359 192h-39v-11.7l60-49.9c33-27.5 60-50.4 60-51.1 0-1.9-22.3-21.3-23.4-20.4-.6.4-22.4 18.4-48.4 39.9-26 21.6-47.5 39.2-47.7 39.2-.3 0-.6-29.1-.7-64.8l-.3-64.7-9.5-2.2c-5.2-1.2-10.7-2.2-12.2-2.2L295 4zM4.1 297.7c0 1.6 1 7.1 2.2 12.3l2.2 9.5 46.4.5 46.3.5-34.6 28.9-34.7 28.8 3.2 5.7C39.5 391.7 49 406 49.8 406c.4 0 24-19.4 52.4-43l51.6-43H192v12.5l-60 49.9c-33 27.4-60 50.2-60 50.6 0 .6 10 10 20.6 19.2 2 1.8 2.7 1.2 50.5-38.3l48.4-40.1.5 64.8.5 64.9 9.5 2.2c5.2 1.2 10.7 2.2 12.3 2.2l2.7.1V295H4zM295 401.5V508l2.8-.1c1.5 0 7-1 12.2-2.2l9.5-2.2.3-65.3c.1-35.8.6-65.2 1-65.2s22.5 18 49 40.1l48.3 40.1 5.2-4.5c9.3-8.2 16.7-15.3 16.7-16.3 0-.5-27-23.4-60-50.8l-60-49.9V320h39.2l50.2 41.7c27.6 23 50.9 42.4 51.7 43.1 1.4 1.1 2.5 0 8.1-8.5 3.5-5.4 7.6-11.9 9.1-14.5l2.8-4.7-33.3-27.7c-18.3-15.2-33.4-28-33.6-28.5s18.5-1 44.5-1.1l44.8-.3 2.2-9.5c1.2-5.2 2.2-10.7 2.2-12.3l.1-2.7H295z"/>
    <path fill="#000040" d="M178.5 12.4c-14.3 4.7-24.2 8.8-39 16.4-12.6 6.4-32.6 19.1-39.2 24.9L97 56.5l44.6 37c24.5 20.3 45.6 37.8 47 38.8l2.4 1.9V71.6c0-49.5-.3-62.6-1.2-62.5-.7 0-5.8 1.5-11.3 3.3M321 72.6c0 50.5.3 63.4 1.3 62.7 2.4-1.4 93.7-77.4 93.7-78 0-1-4.6-4.4-17.5-13.1-20.2-13.7-45.6-25.9-67.6-32.6-4.8-1.4-9-2.6-9.3-2.6s-.6 28.6-.6 63.6M25.7 145.7c-3.1 6.5-6.9 15.2-8.5 19.3-2.7 6.9-8.2 24-8.2 25.4 0 .3 20.7.6 46.1.6h46.1L67 162.5C48.2 146.8 32.5 134 32.1 134s-3.3 5.3-6.4 11.7m421.3 17-33.5 27.8 44.4.3c24.4.1 44.6.1 44.7-.1.7-.6-4.5-17.1-8.5-27.3-3.5-8.9-12.7-28.4-13.4-28.4-.1 0-15.3 12.5-33.7 27.7M9.4 322.7c.3 1 1.2 4.5 2.2 7.8 4.7 16.7 18.4 47.2 20.7 45.8.6-.4 15.9-13 34-28L99.1 321H54c-42.5 0-45.1.1-44.6 1.7m407.6-.3c.8.8 15.7 13.2 33 27.6l31.4 26.1 4.4-8.8c5-9.8 12.1-27.7 14.6-36.8 1-3.3 1.9-6.8 2.2-7.8.5-1.6-2-1.7-43.2-1.7-37.9 0-43.6.2-42.4 1.4m-96 115.9c0 35.6.3 64.7.6 64.7s4.5-1.2 9.3-2.6c22.1-6.7 47.5-19 67.6-32.6 16.2-11 19.3-13.5 18-14.6-.6-.5-21.2-17.7-46-38.2-24.7-20.5-46-38.2-47.2-39.3l-2.3-2zM143.3 415c-26 21.6-47.3 39.5-47.3 39.8.1 1 14.2 11.2 24.5 17.7 17.5 11.1 42.7 22.5 62.4 28.4 4 1.2 7.5 2 7.7 1.8s.3-28.8.2-63.6l-.3-63.2z"/>
  </svg>
);

const languages: LanguageOption[] = [
  { code: 'az', name: 'Azərbaycan', flag: '' },
  { code: 'ru', name: 'Русский', flag: '' },
  { code: 'en', name: 'English', flag: '' }
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
          <div className="relative z-20 w-full h-full flex items-center justify-center">
            {currentLang.code === 'az' ? (
              <AzerbaijanFlag className="w-5 h-5 rounded-sm group-hover:scale-110 transition-transform duration-300" />
            ) : currentLang.code === 'ru' ? (
              <RussiaFlag className="w-5 h-5 rounded-sm group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <USAFlag className="w-5 h-5 rounded-sm group-hover:scale-110 transition-transform duration-300" />
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
            ) : language.code === 'ru' ? (
              <RussiaFlag className="w-4 h-4 rounded-sm" />
            ) : (
              <USAFlag className="w-4 h-4 rounded-sm" />
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
