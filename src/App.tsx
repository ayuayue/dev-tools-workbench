import {startTransition, useDeferredValue, useEffect, useState} from 'react';
import {GripVertical} from 'lucide-react';
import {motion} from 'motion/react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ToolCard from './components/ToolCard';
import Workbench from './components/Workbench';
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
  ToolResult,
  TOOLS,
} from './data/toolRegistry';

type AppLanguage = RegistryLanguage;
type ThemeAccent = 'mint' | 'sky' | 'amber' | 'rose' | 'slate' | 'github';

const GROUP_TRANSLATIONS: Record<ToolGroupId, Record<AppLanguage, {label: string; kicker: string; description: string}>> = {
  all: {
    zh: {label: '全部工具', kicker: '完整目录', description: '保留全部工具可见，主要依靠搜索和筛选定位。'},
    en: {label: 'All Tools', kicker: 'catalog', description: 'Browse the full toolbox and narrow it down with search.'},
  },
  favorites: {
    zh: {label: '收藏工具', kicker: 'favorites', description: '集中查看你标记过的常用工具。'},
    en: {label: 'Favorites', kicker: 'favorites', description: 'Keep your bookmarked tools in one place.'},
  },
  text: {
    zh: {label: '文本处理', kicker: '纯文本', description: '处理大小写、空白、行序、替换和基础文本整理。'},
    en: {label: 'Text', kicker: 'plain text', description: 'Whitespace cleanup, casing, line transforms, and common text tasks.'},
  },
  json: {
    zh: {label: 'JSON 处理', kicker: 'json', description: 'JSON 格式化、压缩以及和其他数据格式的互转。'},
    en: {label: 'JSON', kicker: 'json', description: 'Format, minify, and convert JSON with other data formats.'},
  },
  encode: {
    zh: {label: '编码转换', kicker: 'url/base64', description: '集中处理 URL、Base64 等常见编码与解码能力。'},
    en: {label: 'Encoding', kicker: 'url/base64', description: 'Work with URL and Base64 encoding and decoding in one module.'},
  },
  crypto: {
    zh: {label: '加密处理', kicker: 'hash/aes', description: '提供常见摘要、HMAC 和 AES 加解密工具。'},
    en: {label: 'Crypto', kicker: 'hash/aes', description: 'Use common hash, HMAC, and AES encryption helpers.'},
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
    zh: {label: '模拟数据', kicker: 'mock', description: '生成用户名、邮箱、证件、地址、手机号等常用测试数据。'},
    en: {label: 'Mock Data', kicker: 'mock', description: 'Generate usernames, emails, IDs, addresses, phones, and more test data.'},
  },
  data: {
    zh: {label: '数据格式', kicker: 'xml/csv/md', description: 'XML、CSV、Markdown 表格和 HTML 实体等专一格式处理。'},
    en: {label: 'Data Formats', kicker: 'xml/csv/md', description: 'Handle XML, CSV, markdown tables, and HTML entities.'},
  },
  extract: {
    zh: {label: '信息提取', kicker: '抽取信号', description: '从原始文本中提取链接、邮箱、数字和正则结果。'},
    en: {label: 'Extract', kicker: 'signals', description: 'Extract URLs, emails, numbers, and regex matches from text.'},
  },
  base64: {
    zh: {label: 'Base64', kicker: 'legacy', description: '旧分组，已合并到编码转换。'},
    en: {label: 'Base64', kicker: 'legacy', description: 'Legacy group. Moved into Encoding.'},
  },
  url: {
    zh: {label: 'URL', kicker: 'legacy', description: '旧分组，已合并到编码转换。'},
    en: {label: 'URL', kicker: 'legacy', description: 'Legacy group. Moved into Encoding.'},
  },
  generate: {
    zh: {label: '开发生成', kicker: 'legacy', description: '旧分组，已拆分为时间戳工具与模拟数据。'},
    en: {label: 'Generate', kicker: 'legacy', description: 'Legacy group. Split into Timestamps and Mock Data.'},
  },
};

const UI_COPY = {
  zh: {
    ready: '先选择工具，再在工作台执行。',
    status: '默认中文和亮色已启用。先搜索，再选工具，然后在工作台运行。',
    searchPlaceholder: '按名称、标签或场景搜索工具...',
    currentGroup: '当前分组',
    currentTool: '当前工具',
    sidebarBadge: '开发工具台',
    sidebarTitle: '开发工具台',
    sidebarDescription:
      '集中提供文本处理、JSON、编码转换、加密处理、JWT、时间戳、模拟数据与信息提取等常用能力，支持直接编辑、运行、预览和下载结果。',
    sidebarMenuTitle: '功能分组',
    browseOnly: '目录浏览',
    favorites: '收藏页',
    chooseTool: '请选择工具',
    toolsCount: (count: number) => `${count} 个工具`,
    dragToReorder: '可拖动排序',
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
  },
  en: {
    ready: 'Choose a tool and run it from the workspace.',
    status: 'English and light mode are ready. Search, pick a tool, then run it in the workspace.',
    searchPlaceholder: 'Search tools by name, tag, or use case...',
    currentGroup: 'Current Group',
    currentTool: 'Current Tool',
    sidebarBadge: 'Dev Toolbox',
    sidebarTitle: 'Dev Toolbox',
    sidebarDescription:
      'A focused toolbox for text, JSON, encoding, crypto, JWT, timestamps, mock data, extraction, preview, and downloadable results.',
    sidebarMenuTitle: 'Tool Groups',
    browseOnly: 'Browse',
    favorites: 'Favorites',
    chooseTool: 'Choose a tool',
    toolsCount: (count: number) => `${count} tools`,
    dragToReorder: 'Drag to reorder',
    dark: 'Dark',
    light: 'Light',
    accentLabel: 'Accent',
    accentOptions: {
      mint: 'Mint',
      sky: 'Sky',
      amber: 'Amber',
      rose: 'Rose',
      slate: 'Slate',
      github: 'GitHub Light',
    },
  },
} satisfies Record<
  AppLanguage,
  {
    ready: string;
    status: string;
    searchPlaceholder: string;
    currentGroup: string;
    currentTool: string;
    sidebarBadge: string;
    sidebarTitle: string;
    sidebarDescription: string;
    sidebarMenuTitle: string;
    browseOnly: string;
    favorites: string;
    chooseTool: string;
    toolsCount: (count: number) => string;
    dragToReorder: string;
    dark: string;
    light: string;
    accentLabel: string;
    accentOptions: Record<ThemeAccent, string>;
  }
>;

const DEFAULT_EDITOR_TEXT = `{
  "标题": "开发工具台",
  "负责人": "you@example.com",
  "链接": [
    "https://example.com/docs",
    "https://openai.com/zh-Hans"
  ]
}`;

function readStoredList(key: string) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeStoredList(key: string, items: string[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
}

function readStoredLanguage(): AppLanguage {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.language) === 'en' ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
}

function readStoredAccent(): ThemeAccent {
  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.accent);
    return value === 'sky' || value === 'amber' || value === 'rose' || value === 'slate' || value === 'github' ? value : 'mint';
  } catch {
    return 'mint';
  }
}

function readStoredOrders() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.toolOrders);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).map(([groupId, order]) => [
        groupId,
        Array.isArray(order) ? order.filter((item): item is string => typeof item === 'string') : [],
      ]),
    ) as Record<string, string[]>;
  } catch {
    return {};
  }
}

function writeStoredOrders(orders: Record<string, string[]>) {
  window.localStorage.setItem(STORAGE_KEYS.toolOrders, JSON.stringify(orders));
}

function buildStats(text: string) {
  const source = String(text ?? '');
  const words = source.trim() ? source.trim().split(/\s+/).filter(Boolean).length : 0;
  const lines = source ? source.split(/\r?\n/).length : 0;
  const chars = source.length;
  const bytes = new TextEncoder().encode(source).length;
  return {chars, words, lines, bytes};
}

function formatGroupLabel(groupId: string, lang: AppLanguage) {
  return GROUP_TRANSLATIONS[groupId as ToolGroupId]?.[lang]?.label ?? groupId;
}

function formatKindLabel(kind: ToolDefinition['kind'], lang: AppLanguage) {
  if (lang === 'en') {
    return kind === 'transform' ? 'transform' : kind === 'extract' ? 'extract' : 'generate';
  }
  return kind === 'transform' ? '转换' : kind === 'extract' ? '提取' : '生成';
}

function isModuleGroup(groupId: ToolGroupId): groupId is Exclude<ToolGroupId, 'all' | 'favorites'> {
  return groupId !== 'all' && groupId !== 'favorites';
}

function getGroupBaseOrder(groupId: Exclude<ToolGroupId, 'all' | 'favorites'>) {
  return TOOLS.filter((tool) => tool.group === groupId).map((tool) => tool.id);
}

function mergeGroupOrder(groupId: Exclude<ToolGroupId, 'all' | 'favorites'>, storedOrder: string[] = []) {
  const baseOrder = getGroupBaseOrder(groupId);
  return [...storedOrder.filter((toolId) => baseOrder.includes(toolId)), ...baseOrder.filter((toolId) => !storedOrder.includes(toolId))];
}

function sortToolsByOrder(
  tools: ToolDefinition[],
  groupId: Exclude<ToolGroupId, 'all' | 'favorites'>,
  orders: Record<string, string[]>,
) {
  const mergedOrder = mergeGroupOrder(groupId, orders[groupId]);
  const orderMap = new Map(mergedOrder.map((toolId, index) => [toolId, index]));

  return [...tools].sort((left, right) => {
    const leftIndex = orderMap.get(left.id) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = orderMap.get(right.id) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
}

function getBrowseSections(search: string, orders: Record<string, string[]>) {
  return TOOL_GROUPS.filter((group): group is (typeof TOOL_GROUPS)[number] & {id: Exclude<ToolGroupId, 'all' | 'favorites'>} => isModuleGroup(group.id))
    .map((group) => ({
      group,
      tools: sortToolsByOrder(
        filterTools({
          group: group.id,
          search,
        }),
        group.id,
        orders,
      ),
    }))
    .filter((section) => section.tools.length);
}

function getLocalizedFieldLabel(tool: ToolDefinition, fieldName: string, lang: AppLanguage) {
  const localizedTool = getLocalizedTool(tool, lang);
  return localizedTool.fields.find((field) => field.name === fieldName)?.label ?? fieldName;
}

export default function App() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [activeGroup, setActiveGroup] = useState<ToolGroupId>('all');
  const [favorites, setFavorites] = useState<string[]>(() => readStoredList(STORAGE_KEYS.favorites));
  const [recents, setRecents] = useState<string[]>(() => readStoredList(STORAGE_KEYS.recents));
  const [editorText, setEditorText] = useState(DEFAULT_EDITOR_TEXT);
  const [lang, setLang] = useState<AppLanguage>(() => readStoredLanguage());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEYS.theme) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const [accent, setAccent] = useState<ThemeAccent>(() => readStoredAccent());
  const copy = UI_COPY[lang];
  const [toolOrders, setToolOrders] = useState<Record<string, string[]>>(() => readStoredOrders());
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, ToolFieldValue>>>({});
  const [activeToolId, setActiveToolId] = useState(FEATURED_TOOL_IDS[0]);
  const [result, setResult] = useState<ToolResult>({
    ok: true,
    output: '',
    mode: 'result',
    message: UI_COPY[readStoredLanguage()].ready,
  });
  const [draggedToolId, setDraggedToolId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [resultVersion, setResultVersion] = useState(0);
  const [status, setStatus] = useState<{tone: 'info' | 'success' | 'error'; message: string}>({
    tone: 'info',
    message: UI_COPY[readStoredLanguage()].status,
  });

  const rawVisibleTools = filterTools({
    search: deferredSearch,
    group: activeGroup,
  });
  const favoriteTools = rawVisibleTools.filter((tool) => favorites.includes(tool.id));
  const visibleTools =
    activeGroup === 'all'
      ? rawVisibleTools
      : activeGroup === 'favorites'
        ? favoriteTools
        : sortToolsByOrder(rawVisibleTools, activeGroup, toolOrders);
  const browseSections = getBrowseSections(deferredSearch, toolOrders);
  const isBrowseOnly = activeGroup === 'all' || activeGroup === 'favorites';

  let activeTool = getToolById(activeToolId);
  if (!isBrowseOnly && activeTool && !visibleTools.some((tool) => tool.id === activeTool.id)) {
    activeTool = visibleTools[0] ?? null;
  }
  if (!isBrowseOnly && !activeTool) {
    activeTool = visibleTools[0] ?? null;
  }

  useEffect(() => {
    if (isBrowseOnly) {
      return;
    }
    if (activeTool && activeTool.id !== activeToolId) {
      setActiveToolId(activeTool.id);
    }
  }, [activeTool, activeToolId, isBrowseOnly]);

  useEffect(() => {
    writeStoredList(STORAGE_KEYS.favorites, favorites);
  }, [favorites]);

  useEffect(() => {
    writeStoredList(STORAGE_KEYS.recents, recents);
  }, [recents]);

  useEffect(() => {
    writeStoredOrders(toolOrders);
  }, [toolOrders]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
    window.localStorage.setItem(STORAGE_KEYS.accent, accent);
  }, [accent]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.language, lang);
  }, [lang]);

  function ensureToolFields(tool: ToolDefinition | null) {
    if (!tool) {
      return {};
    }

    if (!fieldValues[tool.id]) {
      const defaults = getDefaultFieldValues(tool);
      setFieldValues((current) => ({
        ...current,
        [tool.id]: defaults,
      }));
      return defaults;
    }

    return fieldValues[tool.id];
  }

  function updateStatus(tone: 'info' | 'success' | 'error', message: string) {
    setStatus({tone, message});
  }

  function pushRecent(toolId: string) {
    setRecents((current) => [toolId, ...current.filter((item) => item !== toolId)].slice(0, MAX_RECENTS));
  }

  function resetWorkbench(nextTool: ToolDefinition | null, message?: string) {
    const localizedTool = nextTool ? getLocalizedTool(nextTool, lang) : null;
    setIsRunning(false);
    setResultVersion((current) => current + 1);
    setResult({
      ok: true,
      output: '',
      mode: 'result',
      message:
        message ??
        (localizedTool
          ? lang === 'zh'
            ? `${localizedTool.name} 已就绪。运行后结果会显示在这里。`
            : `${localizedTool.name} is ready. Results will appear here after you run it.`
          : copy.ready),
    });
  }

  function handleSelectTool(toolId: string) {
    setActiveToolId(toolId);
    const tool = getToolById(toolId);
    if (tool) {
      const localizedTool = getLocalizedTool(tool, lang);
      setActiveGroup(tool.group);
      ensureToolFields(tool);
      resetWorkbench(tool);
      updateStatus('info', lang === 'zh' ? `${localizedTool.name} 已就绪。需要的话先调整参数，再运行。` : `${localizedTool.name} is ready. Adjust inputs if needed, then run it.`);
    }
  }

  function handleToggleFavorite(toolId: string) {
    setFavorites((current) => {
      const exists = current.includes(toolId);
      const next = exists ? current.filter((item) => item !== toolId) : [...current, toolId];
      updateStatus('success', exists ? (lang === 'zh' ? '已从收藏中移除。' : 'Removed from favorites.') : lang === 'zh' ? '已加入收藏。' : 'Added to favorites.');
      return next;
    });
  }

  function handleFieldChange(name: string, value: ToolFieldValue) {
    if (!activeTool) {
      return;
    }

    setFieldValues((current) => ({
      ...current,
      [activeTool.id]: {
        ...getDefaultFieldValues(activeTool),
        ...current[activeTool.id],
        [name]: value,
      },
    }));
  }

  async function handleCopy(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      updateStatus('success', successMessage);
    } catch {
      updateStatus('error', lang === 'zh' ? '当前环境无法写入剪贴板。' : 'Clipboard write is not available in this environment.');
    }
  }

  function handleDownloadResult() {
    if (!result.download) {
      updateStatus('error', lang === 'zh' ? '当前没有可下载的结果。' : 'There is no downloadable result yet.');
      return;
    }

    const href =
      result.download.dataUrl ??
      URL.createObjectURL(new Blob([result.download.content], {type: result.download.mimeType}));

    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = result.download.fileName;
    anchor.click();

    if (!result.download.dataUrl) {
      URL.revokeObjectURL(href);
    }

    updateStatus('success', lang === 'zh' ? `已开始下载 ${result.download.fileName}。` : `Started downloading ${result.download.fileName}.`);
  }

  function handleSelectGroup(groupId: ToolGroupId) {
    setActiveGroup(groupId);
    setDraggedToolId(null);

    if (groupId === 'all' || groupId === 'favorites') {
      resetWorkbench(null, lang === 'zh' ? '当前是目录浏览模式，不显示执行结果。' : 'Catalog mode is active. Execution results are hidden here.');
      updateStatus(
        'info',
        groupId === 'favorites'
          ? lang === 'zh'
            ? '收藏页只负责浏览和定位。'
            : 'The favorites page is for browsing only.'
          : lang === 'zh'
            ? '全部工具页只负责浏览和定位。'
            : 'The all-tools page is for browsing only.',
      );
      return;
    }

    const nextTool =
      sortToolsByOrder(
        filterTools({
          group: groupId,
          search: deferredSearch,
        }),
        groupId,
        toolOrders,
      )[0] ??
      sortToolsByOrder(
        filterTools({
          group: groupId,
        }),
        groupId,
        toolOrders,
      )[0] ??
      null;

    if (nextTool) {
      setActiveToolId(nextTool.id);
      ensureToolFields(nextTool);
      resetWorkbench(nextTool);
    } else {
      resetWorkbench(null, lang === 'zh' ? '当前模块下没有匹配工具。' : 'No matching tools in this group.');
    }

    updateStatus('info', lang === 'zh' ? `${formatGroupLabel(groupId, lang)} 已打开。` : `${formatGroupLabel(groupId, lang)} opened.`);
  }

  function handleReorder(groupId: Exclude<ToolGroupId, 'all' | 'favorites'>, targetToolId: string) {
    if (!draggedToolId || draggedToolId === targetToolId) {
      return;
    }

    const currentOrder = mergeGroupOrder(groupId, toolOrders[groupId]);
    const fromIndex = currentOrder.indexOf(draggedToolId);
    const toIndex = currentOrder.indexOf(targetToolId);
    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const nextOrder = [...currentOrder];
    const [moved] = nextOrder.splice(fromIndex, 1);
    nextOrder.splice(toIndex, 0, moved);

    setToolOrders((current) => ({
      ...current,
      [groupId]: nextOrder,
    }));
    setDraggedToolId(null);
    updateStatus('success', lang === 'zh' ? `${formatGroupLabel(groupId, lang)} 的工具顺序已保存。` : `Saved tool order for ${formatGroupLabel(groupId, lang)}.`);
  }

  function validateFields(tool: ToolDefinition, values: Record<string, ToolFieldValue>) {
    for (const field of tool.fields) {
      if (field.type === 'file') {
        if (!field.required) {
          continue;
        }
        if (!values[field.name]) {
          const label = getLocalizedFieldLabel(tool, field.name, lang);
          return lang === 'zh' ? `${label} 不能为空。` : `${label} is required.`;
        }
        continue;
      }

      if (field.type === 'checkbox' || field.type === 'select') {
        continue;
      }

      if (!field.required) {
        continue;
      }

      if (!String(values[field.name] ?? '').trim()) {
        const label = getLocalizedFieldLabel(tool, field.name, lang);
        return lang === 'zh' ? `${label} 不能为空。` : `${label} is required.`;
      }
    }
    return '';
  }

  async function handleRun() {
    if (!activeTool) {
      updateStatus('error', lang === 'zh' ? '当前没有选中的工具。' : 'No tool is currently selected.');
      return;
    }

    if (isRunning) {
      return;
    }

    const values = ensureToolFields(activeTool);
    const validationError = validateFields(activeTool, values);
    if (validationError) {
      updateStatus('error', validationError);
      return;
    }

    setIsRunning(true);
    const localizedTool = getLocalizedTool(activeTool, lang);
    updateStatus('info', lang === 'zh' ? `正在运行 ${localizedTool.name}...` : `Running ${localizedTool.name}...`);
    await new Promise((resolve) => window.setTimeout(resolve, 260));

    const rawExecution = await executeTool(activeTool, {
      input: editorText,
      fields: values,
    });
    const execution = localizeToolResult(rawExecution, lang);

    setResult(execution);
    setResultVersion((current) => current + 1);
    setIsRunning(false);

    if (!execution.ok) {
      updateStatus('error', execution.message);
      return;
    }

    pushRecent(activeTool.id);
    updateStatus('success', execution.message);
  }

  const activeGroupLabel = formatGroupLabel(activeGroup, lang);
  const groupCounts = TOOL_GROUPS.reduce<Record<string, number>>((accumulator, group) => {
    accumulator[group.id] = group.id === 'favorites' ? favorites.length : filterTools({group: group.id}).length;
    return accumulator;
  }, {});
  const localizedGroups = TOOL_GROUPS.map((group) => ({
    ...group,
    ...GROUP_TRANSLATIONS[group.id][lang],
  }));

  const activeFieldValues = activeTool ? ensureToolFields(activeTool) : {};

  return (
    <div className="min-h-screen bg-background font-body text-on-surface">
      <Sidebar
        activeGroup={activeGroup}
        counts={groupCounts}
        groups={localizedGroups}
        strings={{
          badge: copy.sidebarBadge,
          title: copy.sidebarTitle,
          description: copy.sidebarDescription,
          menuTitle: copy.sidebarMenuTitle,
        }}
        onSelectGroup={(groupId) => handleSelectGroup(groupId as ToolGroupId)}
      />
      <Header
        lang={lang}
        strings={{
          accentLabel: copy.accentLabel,
          accentOptions: copy.accentOptions,
          searchPlaceholder: copy.searchPlaceholder,
          themeValue: theme === 'light' ? copy.dark : copy.light,
        }}
        accent={accent}
        onAccentChange={(value) => setAccent(value as ThemeAccent)}
        onSearchChange={(value) => {
          startTransition(() => {
            setSearch(value);
          });
        }}
        onToggleLanguage={() => setLang((current) => (current === 'zh' ? 'en' : 'zh'))}
        onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
        search={search}
        theme={theme}
      />

      <main className="ml-72 min-h-screen px-8 pb-10 pt-24">
        {isBrowseOnly ? (
          <section className="space-y-8">
            {(activeGroup === 'favorites'
              ? [
                  {
                    group: localizedGroups.find((group) => group.id === 'favorites') ?? localizedGroups[0],
                    tools: visibleTools,
                  },
                ]
              : browseSections
            ).map((section, sectionIndex) => (
              <motion.section
                animate={{opacity: 1, y: 0}}
                className="space-y-4"
                initial={{opacity: 0, y: 12}}
                key={section.group.id}
                transition={{delay: Math.min(sectionIndex * 0.03, 0.18)}}
              >
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant/10 pb-3">
                  <div>
                    <p className="label-sm all-caps tracking-[0.22em] text-primary">{GROUP_TRANSLATIONS[section.group.id][lang].kicker}</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-on-surface">{GROUP_TRANSLATIONS[section.group.id][lang].label}</h3>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {activeGroup === 'favorites' && !section.tools.length
                        ? lang === 'zh'
                          ? '你还没有收藏工具。点工具卡片右上角的星标，就能把它收进这里。'
                          : 'You have no favorite tools yet. Star a tool card to collect it here.'
                        : GROUP_TRANSLATIONS[section.group.id][lang].description}
                    </p>
                  </div>
                  <span className="rounded-full border border-outline-variant/10 bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    {copy.toolsCount(section.tools.length)}
                  </span>
                </div>

                <div className="grid gap-2.5 xl:grid-cols-2 2xl:grid-cols-3">
                  {section.tools.map((rawTool) => {
                    const tool = getLocalizedTool(rawTool, lang);
                    return (
                    <div
                      className={`relative ${draggedToolId === tool.id ? 'opacity-60' : ''}`}
                      key={tool.id}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleReorder(rawTool.group, rawTool.id)}
                    >
                      <div className="pointer-events-none absolute right-14 top-3 z-10 rounded-lg border border-outline-variant/10 bg-background/75 px-1.5 py-1 text-on-surface-variant/70">
                        <GripVertical className="h-3.5 w-3.5" />
                      </div>
                      <button
                        className="absolute right-14 top-3 z-20 rounded-lg p-1.5 text-transparent"
                        draggable
                        onDragEnd={() => setDraggedToolId(null)}
                        onDragStart={() => setDraggedToolId(rawTool.id)}
                        type="button"
                      >
                        drag
                      </button>
                      <ToolCard
                        badges={[formatKindLabel(tool.kind, lang), ...tool.tags]}
                        category={formatGroupLabel(tool.group, lang)}
                        categoryColor={tool.color}
                        compact
                        description={tool.summary}
                        icon={tool.icon}
                        isFavorite={favorites.includes(rawTool.id)}
                        onSelect={() => handleSelectTool(rawTool.id)}
                        onToggleFavorite={() => handleToggleFavorite(rawTool.id)}
                        title={tool.name}
                      />
                    </div>
                  )})}
                </div>
              </motion.section>
            ))}
          </section>
        ) : (
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(150px,180px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(160px,190px)]">
            <Workbench
              editorText={editorText}
              fieldValues={activeFieldValues}
              isRunning={isRunning}
              onClearEditor={() => {
                setEditorText('');
                updateStatus('info', lang === 'zh' ? '编辑区已清空。' : 'Editor cleared.');
              }}
              onCopyInput={() => handleCopy(editorText, lang === 'zh' ? '已复制输入内容。' : 'Input copied.')}
              onCopyResult={() => handleCopy(result.output, lang === 'zh' ? '已复制结果内容。' : 'Result copied.')}
              onDownloadResult={handleDownloadResult}
              onEditorChange={setEditorText}
              onFieldChange={handleFieldChange}
              onResetFields={() => {
                if (!activeTool) {
                  return;
                }
                setFieldValues((current) => ({
                  ...current,
                  [activeTool.id]: getDefaultFieldValues(activeTool),
                }));
                updateStatus('info', lang === 'zh' ? '已恢复默认参数。' : 'Fields reset to defaults.');
              }}
              onRun={handleRun}
              onUseResult={() => {
                if (!result.output) {
                  updateStatus('error', lang === 'zh' ? '当前没有可写回编辑区的结果。' : 'There is no result to write back into the editor.');
                  return;
                }
                setEditorText(result.output);
                updateStatus('success', lang === 'zh' ? '已将结果写回编辑区。' : 'The result has been written back into the editor.');
              }}
              result={result}
              resultVersion={resultVersion}
              status={status}
              tool={activeTool ? getLocalizedTool(activeTool, lang) : null}
              lang={lang}
            />

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-on-surface">{activeGroupLabel}</h3>
                  <p className="mt-1 text-xs text-on-surface-variant">{copy.dragToReorder}</p>
                </div>
                <span className="ml-auto rounded-full border border-outline-variant/10 bg-surface-container-low px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                  {copy.toolsCount(visibleTools.length)}
                </span>
              </div>

              <div className="grid gap-1.5">
                {visibleTools.map((rawTool, index) => {
                  const tool = getLocalizedTool(rawTool, lang);
                  return (
                  <motion.div
                    animate={{opacity: 1, y: 0}}
                    className={`relative ${draggedToolId === tool.id ? 'opacity-60' : ''}`}
                    initial={{opacity: 0, y: 10}}
                    key={tool.id}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleReorder(rawTool.group, rawTool.id)}
                    transition={{delay: Math.min(index * 0.02, 0.14)}}
                  >
                    <div className="pointer-events-none absolute right-11 top-2.5 z-10 rounded-lg border border-outline-variant/10 bg-background/75 px-1 py-0.5 text-on-surface-variant/70">
                      <GripVertical className="h-3 w-3" />
                    </div>
                    <button
                      className="absolute right-11 top-2.5 z-20 rounded-lg p-1 text-transparent"
                      draggable
                      onDragEnd={() => setDraggedToolId(null)}
                      onDragStart={() => setDraggedToolId(rawTool.id)}
                      type="button"
                    >
                      drag
                    </button>
                    <ToolCard
                      badges={[formatKindLabel(tool.kind, lang), ...tool.tags]}
                      category={formatGroupLabel(tool.group, lang)}
                      categoryColor={tool.color}
                      compact
                      description={tool.summary}
                      icon={tool.icon}
                      isActive={rawTool.id === activeTool?.id}
                      isFavorite={favorites.includes(rawTool.id)}
                      onSelect={() => handleSelectTool(rawTool.id)}
                      onToggleFavorite={() => handleToggleFavorite(rawTool.id)}
                      title={tool.name}
                      variant="rail"
                    />
                  </motion.div>
                )})}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
