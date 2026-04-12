import {ArrowRight, ExternalLink, LucideIcon, Star} from 'lucide-react';

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  category: string;
  badges: string[];
  categoryColor: 'primary' | 'secondary' | 'tertiary';
  compact?: boolean;
  variant?: 'card' | 'rail';
  isFavorite?: boolean;
  isActive?: boolean;
  isOpen?: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onOpenInNewTab?: () => void;
}

export default function ToolCard({
  icon: Icon,
  title,
  description,
  category,
  badges,
  categoryColor,
  compact,
  variant = 'card',
  isFavorite,
  isActive,
  isOpen,
  onSelect,
  onToggleFavorite,
  onOpenInNewTab,
}: ToolCardProps) {
  const colorClasses = {
    primary: 'border-primary/20 bg-primary/10 text-primary',
    secondary: 'border-secondary/20 bg-secondary/10 text-secondary',
    tertiary: 'border-tertiary/20 bg-tertiary/10 text-tertiary',
  };
  const isRail = variant === 'rail';

  return (
    <div
      className={`group rounded-2xl border transition-all duration-200 ${
        isActive
          ? 'bg-surface-container-highest shadow-[inset_0_0_0_1px_rgba(163,166,255,0.16),0_14px_30px_-24px_rgba(0,0,0,0.34)]'
          : 'bg-surface-container shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)] hover:bg-surface-container-high'
      } ${isRail ? 'p-2.5' : compact ? 'p-2.5' : 'p-4'}`}
    >
      <div className={`flex items-start ${isRail ? 'gap-3' : compact ? 'gap-3' : 'gap-4'}`}>
        <button className="flex-1 text-left" onClick={onSelect} type="button">
          <div className={`flex items-start justify-between ${isRail ? 'gap-3' : compact ? 'gap-3' : 'gap-4'}`}>
            <div
              className={`mt-0.5 inline-flex items-center justify-center rounded-xl border ${colorClasses[categoryColor]} ${
                isRail ? 'h-8 w-8' : compact ? 'h-8 w-8' : 'h-11 w-11'
              } ${isOpen ? 'ring-2 ring-primary/30' : ''}`}
            >
              <Icon className={isRail ? 'h-3.5 w-3.5' : compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
            </div>

            <div className="min-w-0 flex-1">
              <div className={`flex items-center ${isRail ? 'gap-1.5' : 'gap-2'}`}>
                <h5
                  className={`truncate font-bold tracking-tight text-on-surface ${isRail ? 'text-sm' : compact ? 'text-sm' : 'text-base'} ${isOpen ? 'text-primary' : ''}`}
                  title={title}
                >
                  {title}
                  {isOpen && <span className="ml-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>}
                </h5>
              </div>
              <p className={`mt-1 text-on-surface-variant ${isRail ? 'line-clamp-2 text-[12px] leading-5' : compact ? 'line-clamp-1 text-[11px] leading-4.5' : 'text-sm leading-relaxed'}`}>{description}</p>

              <div className={`flex flex-wrap items-center gap-1.5 ${isRail ? 'mt-1' : compact ? 'mt-2.5' : 'mt-4'}`}>
                {badges.slice(0, isRail ? 3 : compact ? 3 : 4).map((badge, index) => (
                  <span
                    className={`rounded-md bg-background/45 font-bold uppercase text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.12)] ${
                      isRail ? 'px-1.5 py-0.5 text-[8px] tracking-[0.12em]' : 'px-2 py-0.5 text-[9px] tracking-[0.16em]'
                    }`}
                    key={`${badge}-${index}`}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </button>

        <div className="flex flex-col items-end gap-1">
          <button
            className={`rounded-xl transition-colors ${
              isFavorite ? 'text-tertiary' : 'text-on-surface-variant hover:text-tertiary'
            } ${isRail ? 'p-1' : compact ? 'p-1' : 'p-2'}`}
            onClick={onToggleFavorite}
            type="button"
            title={isFavorite ? '取消收藏' : '加入收藏'}
          >
            <Star className={`${isRail ? 'h-3.5 w-3.5' : compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          {onOpenInNewTab && (
            <button
              className={`rounded-xl bg-background/45 text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)] transition-colors hover:bg-surface-container-highest hover:text-secondary ${isRail ? 'p-1' : compact ? 'p-1' : 'p-2'}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpenInNewTab();
              }}
              type="button"
              title="在新标签页打开"
            >
              <ExternalLink className={isRail ? 'h-3 w-3' : compact ? 'h-3 w-3' : 'h-4 w-4'} />
            </button>
          )}
          <button
            className={`rounded-xl bg-background/45 text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)] transition-colors hover:bg-surface-container-highest hover:text-primary ${isRail ? 'p-1' : compact ? 'p-1.5' : 'p-2'}`}
            onClick={onSelect}
            type="button"
            title={isOpen ? '切换到该工具' : '打开工具'}
          >
            <ArrowRight className={isRail ? 'h-3 w-3' : compact ? 'h-3 w-3' : 'h-4 w-4'} />
          </button>
        </div>
      </div>
    </div>
  );
}
