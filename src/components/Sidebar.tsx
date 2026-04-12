import {Workflow} from 'lucide-react';
import {ToolGroup} from '../data/toolRegistry';

type SidebarStrings = {
  badge: string;
  title: string;
  description: string;
  menuTitle: string;
};

interface SidebarProps {
  groups: ToolGroup[];
  activeGroup: string;
  counts: Record<string, number>;
  strings: SidebarStrings;
  onSelectGroup: (groupId: string) => void;
}

export default function Sidebar({
  groups,
  activeGroup,
  counts,
  strings,
  onSelectGroup,
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-48 flex-col border-r border-outline/45 bg-surface-container shadow-[18px_0_40px_-34px_rgba(0,0,0,0.5)]">
      <div className="border-b border-outline/35 p-4">
        <div className="inline-flex items-center gap-2 rounded-md bg-primary/12 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-primary shadow-[inset_0_0_0_1px_rgba(111,195,170,0.28)]">
          <Workflow className="h-3 w-3" />
          {strings.badge}
        </div>
        <h1 className="mt-4 text-xl font-black tracking-tight text-on-surface">{strings.title}</h1>
        <p className="mt-2 text-[12px] leading-5 text-on-surface-variant/88">
          {strings.description}
        </p>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4">
        <section>
          <div className="px-2.5 pb-2">
            <p className="label-sm all-caps font-bold tracking-[0.24em] text-on-surface-variant/70">{strings.menuTitle}</p>
          </div>

          <div className="space-y-1.5">
            {groups.map((group) => {
              const active = group.id === activeGroup;
              return (
                <button
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all ${
                    active
                      ? 'bg-surface-container-highest text-primary shadow-[inset_0_0_0_1px_rgba(163,166,255,0.16)]'
                      : 'bg-surface-container-low text-on-surface/78 shadow-[inset_0_0_0_1px_rgba(110,135,127,0.14)] hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                  key={group.id}
                  onClick={() => onSelectGroup(group.id)}
                  type="button"
                >
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.18em]">{group.kicker}</div>
                    <div className="mt-1 text-[13px] font-semibold leading-4">{group.label}</div>
                  </div>
                    <span className="rounded-md bg-background/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
                      {counts[group.id] ?? 0}
                    </span>
                </button>
              );
            })}
          </div>
        </section>

      </nav>
    </aside>
  );
}
