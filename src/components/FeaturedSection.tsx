import {Clock3, Sparkles, Star, Wrench} from 'lucide-react';
import {ToolDefinition} from '../data/toolRegistry';

interface FeaturedSectionProps {
  featuredTools: ToolDefinition[];
  recentTool: ToolDefinition | null;
  favoriteCount: number;
  onSelectTool: (toolId: string) => void;
}

export default function FeaturedSection({
  featuredTools,
  recentTool,
  favoriteCount,
  onSelectTool,
}: FeaturedSectionProps) {
  const primary = featuredTools[0] ?? null;

  return (
    <section className="mb-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="label-sm all-caps font-bold tracking-[0.22em] text-on-surface-variant">快速入口</h3>
        <div className="h-px flex-1 bg-outline-variant/10" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)]">
        <div className="group relative overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-low p-7">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl transition-colors group-hover:bg-primary/15" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  推荐工具
                </div>
                <h4 className="mt-5 text-2xl font-black tracking-tight text-on-surface">
                  {primary ? primary.name : '当前没有推荐工具'}
                </h4>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-on-surface-variant">
                  {primary
                    ? primary.summary
                    : '在注册表中标记 featured 后，就会出现在这里。'}
                </p>
              </div>
              {primary ? (
                <div className="rounded-2xl border border-current/10 bg-background/40 p-4 text-primary">
                  <primary.icon className="h-8 w-8" />
                </div>
              ) : null}
            </div>

            <div className="mt-auto pt-8">
              {primary ? (
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 transition-opacity hover:opacity-90"
                  onClick={() => onSelectTool(primary.id)}
                  type="button"
                >
                  打开工具
                  <Wrench className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-high p-5">
            <div className="flex items-center gap-3 text-tertiary">
              <Star className="h-5 w-5" />
              <span className="label-sm all-caps tracking-[0.2em]">收藏工具</span>
            </div>
            <div className="mt-4 text-3xl font-black text-on-surface">{favoriteCount}</div>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              收藏会固定在快捷区里，减少来回翻找。
            </p>
          </div>

          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-high p-5">
            <div className="flex items-center gap-3 text-secondary">
              <Clock3 className="h-5 w-5" />
              <span className="label-sm all-caps tracking-[0.2em]">最近使用</span>
            </div>
            <div className="mt-4 text-lg font-bold text-on-surface">{recentTool?.name ?? '还没有最近使用记录'}</div>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {recentTool?.summary ?? '运行过一次的工具会出现在这里，方便快速回到上次工作。'}
            </p>
            {recentTool ? (
              <button
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-secondary/20 bg-secondary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary transition-colors hover:bg-secondary/15"
                onClick={() => onSelectTool(recentTool.id)}
                type="button"
              >
                继续使用
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
