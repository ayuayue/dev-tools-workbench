import {Languages, MoonStar, Palette, Search, SunMedium} from 'lucide-react';

type HeaderStrings = {
  searchPlaceholder: string;
  themeValue: string;
  accentLabel: string;
  accentOptions: Record<string, string>;
};

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  lang: 'zh' | 'en';
  strings: HeaderStrings;
  theme: 'light' | 'dark';
  accent: string;
  onAccentChange: (value: string) => void;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
}

export default function Header({
  search,
  onSearchChange,
  lang,
  strings,
  theme,
  accent,
  onAccentChange,
  onToggleLanguage,
  onToggleTheme,
}: HeaderProps) {
  const actionClass =
    'inline-flex h-11 items-center gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-low px-4 text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface';

  return (
    <header className="fixed top-0 right-0 left-48 z-50 border-b border-outline-variant/20 bg-background/80 px-7 py-4 backdrop-blur-xl shadow-[0_24px_24px_-12px_rgba(163,166,255,0.05)]">
      <div className="flex items-center gap-4">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="block h-11 w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest pl-10 pr-4 text-sm font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={strings.searchPlaceholder}
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <label className="relative">
            <Palette className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <select
              aria-label={strings.accentLabel}
              className="h-11 rounded-xl border border-outline-variant/15 bg-surface-container-low pl-10 pr-9 text-sm font-semibold text-on-surface-variant outline-none transition-colors hover:text-on-surface focus:border-primary/35 focus:ring-2 focus:ring-primary/15"
              onChange={(event) => onAccentChange(event.target.value)}
              value={accent}
            >
              {Object.entries(strings.accentOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {strings.accentLabel}: {label}
                </option>
              ))}
            </select>
          </label>

          <button className={actionClass} onClick={onToggleLanguage} type="button">
            <Languages className="h-4 w-4" />
            {lang === 'zh' ? 'EN' : '中文'}
          </button>

          <button className={actionClass} onClick={onToggleTheme} type="button">
            {theme === 'light' ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
            {strings.themeValue}
          </button>
        </div>
      </div>
    </header>
  );
}
