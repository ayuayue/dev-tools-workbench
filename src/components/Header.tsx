import {useRef, useState} from 'react';
import {ChevronDown, Download, Languages, MoonStar, Palette, Search, Settings, SunMedium, Upload} from 'lucide-react';

type HeaderStrings = {
  searchPlaceholder: string;
  themeValue: string;
  accentLabel: string;
  accentOptions: Record<string, string>;
  settingsMenu?: {
    export: string;
    import: string;
    about: string;
    version: string;
  };
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
  onExport?: () => void;
  onImport?: () => void;
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
  onExport,
  onImport,
}: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const actionClass =
    'inline-flex h-11 items-center gap-2 rounded-lg bg-surface-container px-4 text-sm font-semibold text-on-surface-variant shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:bg-surface-container-high hover:text-on-surface';

  return (
    <header className="fixed top-0 right-0 left-48 z-50 border-b border-outline/45 bg-surface/92 px-7 py-4 backdrop-blur-xl shadow-[0_10px_22px_-20px_rgba(0,0,0,0.24)]">
      <div className="flex items-center gap-4">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/85" />
          <input
            className="block h-11 w-full rounded-lg bg-surface-container-low pl-10 pr-4 text-sm font-mono text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_0_0_1px_rgba(110,135,127,0.18)] placeholder:text-on-surface-variant/55 focus:outline-none focus:ring-2 focus:ring-primary/18"
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
               className="h-11 rounded-lg bg-surface-container pl-10 pr-9 text-sm font-semibold text-on-surface-variant outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_0_0_1px_rgba(110,135,127,0.18)] transition-colors hover:bg-surface-container-high hover:text-on-surface focus:ring-2 focus:ring-primary/15"
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

          {/* Settings Menu */}
          <div className="relative" ref={menuRef}>
            <button
              className={actionClass}
              onClick={() => setShowMenu(!showMenu)}
              type="button"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === 'zh' ? '设置' : 'Settings'}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg bg-surface-container p-1.5 shadow-[0_18px_50px_-26px_rgba(0,0,0,0.45),0_0_0_1px_rgba(110,135,127,0.2)]">
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                    onClick={() => {
                      onExport?.();
                      setShowMenu(false);
                    }}
                    type="button"
                  >
                    <Download className="h-4 w-4" />
                    {strings.settingsMenu?.export || (lang === 'zh' ? '导出配置' : 'Export Config')}
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                    onClick={() => {
                      onImport?.();
                      setShowMenu(false);
                    }}
                    type="button"
                  >
                    <Upload className="h-4 w-4" />
                    {strings.settingsMenu?.import || (lang === 'zh' ? '导入配置' : 'Import Config')}
                  </button>
                  <div className="my-1 border-t border-outline/35" />
                  <div className="px-3 py-2 text-xs text-on-surface-variant">
                    <p className="font-semibold">Dev Tools Workbench</p>
                    <p className="mt-0.5">{strings.settingsMenu?.version || 'Version 0.2.0'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
