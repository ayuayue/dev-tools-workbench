import {ArrowRight, LucideIcon, Star} from 'lucide-react';

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
  onSelect: () => void;
  onToggleFavorite: () => void;
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
  onSelect,
  onToggleFavorite,
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
          ? 'border-primary/30 bg-surface-container-high shadow-[inset_0_0_0_1px_rgba(163,166,255,0.12)]'
          : 'border-outline-variant/10 bg-surface-container-low hover:border-outline-variant/20 hover:bg-surface-container-high/80'
      } ${isRail ? 'p-1.5' : compact ? 'p-2.5' : 'p-4'}`}
    >
      <div className={`flex items-start ${isRail ? 'gap-2' : compact ? 'gap-3' : 'gap-4'}`}>
        <button className="flex-1 text-left" onClick={onSelect} type="button">
          <div className={`flex items-start justify-between ${isRail ? 'gap-2' : compact ? 'gap-3' : 'gap-4'}`}>
            <div
              className={`mt-0.5 inline-flex items-center justify-center rounded-xl border ${colorClasses[categoryColor]} ${
                isRail ? 'h-6 w-6' : compact ? 'h-8 w-8' : 'h-11 w-11'
              }`}
            >
              <Icon className={isRail ? 'h-2.5 w-2.5' : compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
            </div>

            <div className="min-w-0 flex-1">
              <div className={`flex items-center ${isRail ? 'gap-1.5' : 'gap-2'}`}>
                <h5
                  className={`truncate font-bold tracking-tight text-on-surface ${isRail ? 'text-[12px]' : compact ? 'text-sm' : 'text-base'}`}
                  title={title}
                >
                  {title}
                </h5>
              </div>
              {!isRail ? (
                <p className={`mt-1 text-on-surface-variant ${compact ? 'line-clamp-1 text-[11px] leading-4.5' : 'text-sm leading-relaxed'}`}>{description}</p>
              ) : null}

              <div className={`flex flex-wrap items-center gap-1.5 ${isRail ? 'mt-1' : compact ? 'mt-2.5' : 'mt-4'}`}>
                {badges.slice(0, isRail ? 1 : compact ? 3 : 4).map((badge) => (
                  <span
                    className={`rounded-full border border-outline-variant/10 bg-background/40 font-bold uppercase text-on-surface-variant ${
                      isRail ? 'px-1 py-0.5 text-[7px] tracking-[0.12em]' : 'px-2 py-0.5 text-[9px] tracking-[0.16em]'
                    }`}
                    key={badge}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </button>

        <div className="flex flex-col items-end gap-2">
          <button
            className={`rounded-xl transition-colors ${
              isFavorite ? 'text-tertiary' : 'text-on-surface-variant hover:text-tertiary'
            } ${isRail ? 'p-0.5' : compact ? 'p-1' : 'p-2'}`}
            onClick={onToggleFavorite}
            type="button"
          >
            <Star className={`${isRail ? 'h-3 w-3' : compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            className={`rounded-xl border border-outline-variant/10 bg-background/40 text-on-surface-variant transition-colors hover:border-primary/20 hover:text-primary ${isRail ? 'p-1' : compact ? 'p-1.5' : 'p-2'}`}
            onClick={onSelect}
            type="button"
          >
            <ArrowRight className={isRail ? 'h-2.5 w-2.5' : compact ? 'h-3 w-3' : 'h-4 w-4'} />
          </button>
        </div>
      </div>
    </div>
  );
}
