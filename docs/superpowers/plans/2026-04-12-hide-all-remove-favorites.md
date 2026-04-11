# Hide All Group And Remove Favorites Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the visible `all` and `favorites` browse pages from the UI while keeping per-tool favorite starring, persisted favorite data, and global search across real tool groups.

**Architecture:** The change stays inside the existing SPA structure by simplifying the group model and deleting special browse-page branches from `App.tsx`. Real tool groups remain the only visible navigation targets, while search becomes a global result mode rendered inside the normal main content area.

**Tech Stack:** React 19, TypeScript, Vite 6, Tailwind CSS 4, pnpm

---

## File Structure

- Modify: `src/data/toolRegistry.ts`
  Responsibility: remove visible `all` and `favorites` group definitions and narrow filtering helpers toward real module groups while preserving global search support.
- Modify: `src/App.tsx`
  Responsibility: remove special browse-page state, normalize startup and selection to real groups, and render search results without `all`/`favorites` branches.
- Verify only: `src/components/Sidebar.tsx`
  Responsibility: should keep working unchanged once it receives only real groups.
- Verify only: `src/components/ToolCard.tsx`
  Responsibility: favorite star behavior should remain intact with no code change required unless implementation reveals a dependency.
- Create: `docs/superpowers/plans/2026-04-12-hide-all-remove-favorites.md`
  Responsibility: this implementation plan.

### Task 1: Simplify Group Definitions In `toolRegistry.ts`

**Files:**
- Modify: `src/data/toolRegistry.ts:17-35`
- Modify: `src/data/toolRegistry.ts:149-240`
- Modify: `src/data/toolRegistry.ts:3393-3414`

- [ ] **Step 1: Write the failing type expectation by narrowing the visible group model**

Target code to introduce during this task:

```ts
export type ToolModuleGroupId = Exclude<ToolGroupId, 'all' | 'favorites'>;

export interface ToolDefinition {
  id: string;
  name: string;
  summary: string;
  group: ToolModuleGroupId;
  kind: ToolKind;
  level: ToolLevel;
  color: ToolColor;
  icon: LucideIcon;
  tags: string[];
  fields: ToolField[];
  featured?: boolean;
  workspace?: ToolWorkspaceConfig;
  getFieldSuggestions?: (context: ToolRunContext, fieldName: string) => string[];
  run: (context: ToolRunContext) => ToolResult | Promise<ToolResult>;
}

export interface ToolGroup {
  id: ToolModuleGroupId;
  label: string;
  kicker: string;
  description: string;
}
```

This should break `App.tsx` where it still assumes `TOOL_GROUPS` may contain `all` or `favorites`.

- [ ] **Step 2: Run type check to verify the current app still depends on removed groups**

Run: `pnpm run lint`
Expected: FAIL with TypeScript errors in `src/App.tsx` referencing `all`, `favorites`, or `Exclude<ToolGroupId, 'all' | 'favorites'>` assumptions.

- [ ] **Step 3: Make the minimal `toolRegistry.ts` implementation change**

Update the group model and filtering code to this shape:

```ts
export type ToolGroupId =
  | 'all'
  | 'favorites'
  | 'text'
  | 'format'
  | 'encode'
  | 'crypto'
  | 'timestamp'
  | 'mock'
  | 'jwt'
  | 'regex'
  | 'compress'
  | 'code'
  | 'json'
  | 'base64'
  | 'url'
  | 'data'
  | 'extract'
  | 'generate';

export type ToolModuleGroupId = Exclude<ToolGroupId, 'all' | 'favorites'>;

export interface ToolDefinition {
  id: string;
  name: string;
  summary: string;
  group: ToolModuleGroupId;
  kind: ToolKind;
  level: ToolLevel;
  color: ToolColor;
  icon: LucideIcon;
  tags: string[];
  fields: ToolField[];
  featured?: boolean;
  workspace?: ToolWorkspaceConfig;
  getFieldSuggestions?: (context: ToolRunContext, fieldName: string) => string[];
  run: (context: ToolRunContext) => ToolResult | Promise<ToolResult>;
}

export interface ToolGroup {
  id: ToolModuleGroupId;
  label: string;
  kicker: string;
  description: string;
}

export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: 'text',
    label: '文本处理',
    kicker: '纯文本',
    description: '处理大小写、空白、行序、提取、替换、正则抽取与基础文本整理。',
  },
  {
    id: 'format',
    label: '格式化处理',
    kicker: 'json/xml/sql',
    description: '集中处理 JSON、XML、SQL、CSV、Markdown 表格等格式化与结构转换。',
  },
  {
    id: 'encode',
    label: '编码处理',
    kicker: 'url/base64/html',
    description: '集中处理 URL、Base64、HTML 实体等常见编码与解码能力。',
  },
  {
    id: 'crypto',
    label: '加密处理',
    kicker: 'md5/sha/aes',
    description: '提供 MD5、SHA、HMAC 和 AES 等常见加密与摘要工具。',
  },
  {
    id: 'jwt',
    label: 'JWT',
    kicker: 'jwt',
    description: 'JWT 编码、解码与快速检查。',
  },
  {
    id: 'timestamp',
    label: '时间戳工具',
    kicker: 'time',
    description: '秒/毫秒时间戳、ISO、本地时间之间的常用互转。',
  },
  {
    id: 'mock',
    label: '模拟数据',
    kicker: 'mock',
    description: '生成中文名、用户名、邮箱、证件、地址、手机号、UUID、GUID 等常用测试数据。',
  },
  {
    id: 'regex',
    label: '正则测试',
    kicker: 'regex',
    description: '在线测试正则表达式，查看匹配、捕获组和替换结果。',
  },
  {
    id: 'compress',
    label: '压缩工具',
    kicker: 'html/js/css/xml',
    description: '支持 HTML、JS、CSS、XML 的压缩与解压整理。',
  },
  {
    id: 'code',
    label: '运行代码',
    kicker: 'html/js/css',
    description: '在本地运行 HTML、CSS、JS 代码并直接预览效果。',
  },
];

export function filterTools({
  search = '',
  group,
}: {
  search?: string;
  group?: ToolModuleGroupId;
}) {
  const keyword = search.trim().toLowerCase();

  return TOOLS.filter((tool) => {
    if (group && tool.group !== group) {
      return false;
    }

    if (!keyword) {
      return true;
    }

    const haystack = `${buildSearchText(tool)} ${tool.kind} ${tool.group}`;
    return haystack.includes(keyword);
  });
}
```

- [ ] **Step 4: Run type check to verify `toolRegistry.ts` changes are valid and remaining failures are confined to `App.tsx`**

Run: `pnpm run lint`
Expected: FAIL only in `src/App.tsx` because it still uses `all`/`favorites` state branches.

- [ ] **Step 5: Commit the isolated registry change**

```bash
git add src/data/toolRegistry.ts
git commit -m "refactor: remove hidden browse groups from registry"
```

### Task 2: Remove Special Browse Pages From `App.tsx`

**Files:**
- Modify: `src/App.tsx:1-240`
- Modify: `src/App.tsx:350-412`
- Modify: `src/App.tsx:465-1148`

- [ ] **Step 1: Write the failing state shape by switching `activeGroup` to real module groups**

Target code to introduce during this task:

```ts
import {
  executeTool,
  FEATURED_TOOL_IDS,
  filterTools,
  getDefaultFieldValues,
  getToolById,
  getLocalizedTool,
  localizeToolResult,
  MAX_RECENTS,
  STORAGE_KEYS,
  AppLanguage as RegistryLanguage,
  ToolFieldValue,
  TOOL_GROUPS,
  ToolDefinition,
  ToolGroupId,
  ToolModuleGroupId,
  ToolResult,
  TOOLS,
} from './data/toolRegistry';

const DEFAULT_GROUP = TOOL_GROUPS[0]?.id ?? 'text';

const [activeGroup, setActiveGroup] = useState<ToolModuleGroupId>(DEFAULT_GROUP);
```

This should force the rest of `App.tsx` to stop treating `all` and `favorites` as valid page destinations.

- [ ] **Step 2: Run type check to verify `App.tsx` still contains incompatible browse-page branches**

Run: `pnpm run lint`
Expected: FAIL with errors around `GROUP_TRANSLATIONS`, `handleSelectGroup`, `visibleTools`, or browse rendering branches.

- [ ] **Step 3: Replace special-group helpers and derived state with a single real-group/search flow**

Refactor the central state and helpers to this shape:

```ts
function getGroupBaseOrder(groupId: ToolModuleGroupId) {
  return TOOLS.filter((tool) => tool.group === groupId).map((tool) => tool.id);
}

function mergeGroupOrder(groupId: ToolModuleGroupId, storedOrder: string[] = []) {
  const baseOrder = getGroupBaseOrder(groupId);
  return [...storedOrder.filter((toolId) => baseOrder.includes(toolId)), ...baseOrder.filter((toolId) => !storedOrder.includes(toolId))];
}

function sortToolsByOrder(tools: ToolDefinition[], groupId: ToolModuleGroupId, orders: Record<string, string[]>) {
  const mergedOrder = mergeGroupOrder(groupId, orders[groupId]);
  const orderMap = new Map(mergedOrder.map((toolId, index) => [toolId, index]));

  return [...tools].sort((left, right) => {
    const leftIndex = orderMap.get(left.id) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = orderMap.get(right.id) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
}

const DEFAULT_GROUP = TOOL_GROUPS[0]?.id ?? 'text';

const [activeGroup, setActiveGroup] = useState<ToolModuleGroupId>(DEFAULT_GROUP);

useEffect(() => {
  if (!TOOL_GROUPS.some((group) => group.id === activeGroup)) {
    setActiveGroup(DEFAULT_GROUP);
  }
}, [activeGroup]);

const allMatchingTools = filterTools({search: normalizedSearch});
const visibleTools = isSearching
  ? allMatchingTools
  : sortToolsByOrder(filterTools({group: activeGroup}), activeGroup, toolOrders);
```

Also remove these structures completely:

```ts
function isModuleGroup(...) { ... }
function getBrowseSections(...) { ... }
const searchGroup = ...
const favoriteTools = ...
const isBrowseOnly = ...
```

- [ ] **Step 4: Delete `all`/`favorites` copy and status branches, then render one unified main content layout**

Replace page-specific logic with these concrete patterns:

```ts
const GROUP_TRANSLATIONS: Record<ToolModuleGroupId, Record<AppLanguage, {label: string; kicker: string; description: string}>> = {
  text: {
    zh: {label: '文本处理', kicker: '纯文本', description: '处理大小写、空白、行序、提取、替换、正则抽取与基础文本整理。'},
    en: {label: 'Text', kicker: 'plain text', description: 'Whitespace cleanup, extraction, casing, regex helpers, and common text tasks.'},
  },
  format: {
    zh: {label: '格式化处理', kicker: 'json/xml/sql', description: '集中处理 JSON、XML、SQL、CSV、Markdown 表格等格式化与结构转换。'},
    en: {label: 'Format', kicker: 'json/xml/sql', description: 'Format and restructure JSON, XML, SQL, CSV, and markdown tables.'},
  },
  encode: {
    zh: {label: '编码处理', kicker: 'url/base64/html', description: '集中处理 URL、Base64、HTML 实体等常见编码与解码能力。'},
    en: {label: 'Encoding', kicker: 'url/base64/html', description: 'Handle URL, Base64, and HTML entity encoding and decoding in one place.'},
  },
  crypto: {
    zh: {label: '加密处理', kicker: 'md5/sha/aes', description: '提供 MD5、SHA、HMAC 和 AES 等常见加密与摘要工具。'},
    en: {label: 'Crypto', kicker: 'md5/sha/aes', description: 'Use MD5, SHA, HMAC, and AES helpers in one module.'},
  },
  jwt: {
    zh: {label: 'JWT', kicker: 'jwt', description: 'JWT 编码、解码与快速检查。'},
    en: {label: 'JWT', kicker: 'jwt', description: 'Encode, decode, and inspect JWT tokens.'},
  },
  timestamp: {
    zh: {label: '时间戳工具', kicker: 'time', description: '秒/毫秒时间戳、ISO、本地时间之间的常用互转。'},
    en: {label: 'Timestamps', kicker: 'time', description: 'Common conversions between timestamps, ISO strings, and local time.'},
  },
  mock: {
    zh: {label: '模拟数据', kicker: 'mock', description: '生成中文名、用户名、邮箱、证件、地址、手机号、UUID、GUID 等常用测试数据。'},
    en: {label: 'Mock Data', kicker: 'mock', description: 'Generate names, usernames, emails, IDs, addresses, phones, UUIDs, and GUIDs.'},
  },
  regex: {
    zh: {label: '正则测试', kicker: 'regex', description: '在线测试正则表达式，查看匹配、捕获组和替换结果。'},
    en: {label: 'Regex', kicker: 'regex', description: 'Test regex patterns and inspect matches, groups, and replacements.'},
  },
  compress: {
    zh: {label: '压缩工具', kicker: 'html/js/css/xml', description: '支持 HTML、JS、CSS、XML 的压缩与解压整理。'},
    en: {label: 'Compress', kicker: 'html/js/css/xml', description: 'Compress and beautify HTML, JS, CSS, and XML.'},
  },
  code: {
    zh: {label: '运行代码', kicker: 'html/js/css', description: '在本地运行 HTML、CSS、JS 代码并直接预览效果。'},
    en: {label: 'Code Runner', kicker: 'html/js/css', description: 'Run HTML, CSS, and JS locally with an inline preview.'},
  },
};

function handleSelectGroup(groupId: ToolModuleGroupId) {
  setActiveGroup(groupId);
  setDraggedToolId(null);
  updateStatus('info', lang === 'zh' ? `${formatGroupLabel(groupId, lang)} 已打开。` : `${formatGroupLabel(groupId, lang)} opened.`);
}

const groupCounts = TOOL_GROUPS.reduce<Record<string, number>>((accumulator, group) => {
  accumulator[group.id] = filterTools({group: group.id}).length;
  return accumulator;
}, {});
```

Render only the non-browse layout in `<main>` and remove the large `{isBrowseOnly ? ... : ...}` branch entirely. Keep the existing workspace panel and right-rail card list, but make the right-rail heading/search state the only browsing surface.

- [ ] **Step 5: Keep favorite persistence but remove favorites-page copy from the UI contract**

Delete the now-unused copy keys and type fields:

```ts
const UI_COPY = {
  zh: {
    ready: '先选择工具，再在工作台执行。',
    status: '默认中文和亮色已启用。先搜索，再选工具，然后在工作台运行。',
    searchPlaceholder: '按名称、标签或场景搜索工具...',
    currentGroup: '当前分组',
    currentTool: '当前工具',
    sidebarBadge: '开发工具台',
    sidebarTitle: '开发工具台',
    sidebarDescription: '集中提供文本处理、格式化、编码、加密、JWT、时间戳、模拟数据、正则测试、压缩和代码运行等常用能力，支持直接编辑、运行、预览和下载结果。',
    sidebarMenuTitle: '功能分组',
    chooseTool: '请选择工具',
    toolsCount: (count: number) => `${count} 个工具`,
    dragToReorder: '可拖动排序',
    searchResults: '搜索结果',
    searchResultsHint: '顶部搜索会跨工具模块查找名称、标签、说明和字段。',
    noSearchResults: '没有找到匹配工具，换个关键词试试。',
    dark: '暗色',
    light: '亮色',
    accentLabel: '主题色',
    accentOptions: {
      mint: '薄荷绿',
      sky: '晴空蓝',
      amber: '琥珀橙',
      rose: '雾玫红',
      slate: '青灰蓝',
      github: 'GitHub 亮色',
    },
    newTab: '新建标签页',
    closeTab: '关闭标签',
    untitled: '未命名',
    settingsMenu: {
      export: '导出配置',
      import: '导入配置',
      about: '关于',
      version: '版本 0.2.0',
    },
  },
};
```

Do not remove this logic:

```ts
const [favorites, setFavorites] = useState<string[]>(() => readStoredList(STORAGE_KEYS.favorites));

useEffect(() => {
  writeStoredList(STORAGE_KEYS.favorites, favorites);
}, [favorites]);

function handleToggleFavorite(toolId: string) {
  setFavorites((current) => {
    const exists = current.includes(toolId);
    const next = exists ? current.filter((item) => item !== toolId) : [...current, toolId];
    updateStatus('success', exists ? (lang === 'zh' ? '已从收藏中移除。' : 'Removed from favorites.') : lang === 'zh' ? '已加入收藏。' : 'Added to favorites.');
    return next;
  });
}
```

- [ ] **Step 6: Run full type check after the `App.tsx` refactor**

Run: `pnpm run lint`
Expected: PASS

- [ ] **Step 7: Commit the app-level browse removal**

```bash
git add src/App.tsx
git commit -m "refactor: remove all and favorites pages"
```

### Task 3: Verify The UI Contract End-To-End

**Files:**
- Verify: `src/App.tsx`
- Verify: `src/components/Sidebar.tsx`
- Verify: `src/components/ToolCard.tsx`

- [ ] **Step 1: Run the full project verification suite**

Run: `pnpm run check`
Expected: PASS with lint and production build both succeeding.

- [ ] **Step 2: Start the local app for manual verification**

Run: `pnpm run dev`
Expected: Vite dev server starts successfully and prints a local URL, typically `http://localhost:3000`.

- [ ] **Step 3: Manually verify the removed pages and preserved favorite behavior**

Check these exact outcomes in the browser:

```text
1. Sidebar does not contain “全部工具 / All Tools”.
2. Sidebar does not contain “收藏工具 / Favorites”.
3. Initial load opens the first real group in the sidebar.
4. Typing a search term returns tools from multiple groups without switching to any browse page.
5. Clicking a star on a tool card still toggles favorite state and shows the existing success status.
6. Reloading the page preserves starred tools.
7. Exported config JSON still contains a top-level "favorites" field.
8. Importing that config restores favorite stars.
9. No empty state, title, or status copy mentions the removed pages.
```

- [ ] **Step 4: Stop the dev server after verification**

Run: `Ctrl+C` in the dev server terminal
Expected: Dev server exits cleanly.

- [ ] **Step 5: Commit the verified final state**

```bash
git add src/App.tsx src/data/toolRegistry.ts
git commit -m "feat: simplify tool navigation"
```

## Self-Review

- Spec coverage: the plan covers navigation removal, startup normalization, global search behavior, favorite persistence, empty-state cleanup, and verification.
- Placeholder scan: no `TBD`, `TODO`, or vague “handle appropriately” instructions remain.
- Type consistency: `ToolModuleGroupId` is used consistently for visible groups, ordering helpers, counts, and selection handlers.
