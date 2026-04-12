import type {ComponentType} from 'react';
import {useDeferredValue, useEffect, useState, useCallback} from 'react';
import {GripVertical, Plus, X} from 'lucide-react';
import {motion, AnimatePresence} from 'motion/react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ToolCard from './components/ToolCard';
import Workbench from './components/Workbench';
import {closeAllTabs, closeOtherTabs, ensureToolTabState, switchTabTool, TabState, ToolTabState} from './appTabState';
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
  ToolModuleGroupId,
  TOOL_GROUPS,
  ToolDefinition,
  ToolResult,
  TOOLS,
} from './data/toolRegistry';

type AppLanguage = RegistryLanguage;
type ThemeAccent = 'mint' | 'sky' | 'amber' | 'rose' | 'slate' | 'github';

const TAB_STORAGE_KEY = 'dev-tools2.tabs.v2';
const ACTIVE_TAB_STORAGE_KEY = 'dev-tools2.active-tab.v2';

function generateTabId(): string {
  return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const GROUP_TRANSLATIONS: Record<ToolModuleGroupId, Record<AppLanguage, {label: string; kicker: string; description: string}>> = {
  text: {
    zh: {label: '文本处理', kicker: '纯文本', description: '处理大小写、空白、行序、提取、替换、正则抽取与基础文本整理。'},
    en: {label: 'Text', kicker: 'plain text', description: 'Whitespace cleanup, extraction, casing, regex helpers, and common text tasks.'},
  },
  format: {
    zh: {label: '格式化处理', kicker: 'json/xml/sql', description: '集中处理 JSON、XML、SQL、CSV、Markdown 表格等格式化与结构转换。'},
    en: {label: 'Format', kicker: 'json/xml/sql', description: 'Format and restructure JSON, XML, SQL, CSV, and markdown tables.'},
  },
  json: {
    zh: {label: 'JSON 处理', kicker: 'legacy', description: '旧分组，已合并到格式化处理。'},
    en: {label: 'JSON', kicker: 'legacy', description: 'Legacy group. Moved into Format.'},
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
  data: {
    zh: {label: '数据格式', kicker: 'legacy', description: '旧分组，相关工具已合并到格式化处理和编码处理。'},
    en: {label: 'Data Formats', kicker: 'legacy', description: 'Legacy group. Tools moved into Format and Encoding.'},
  },
  extract: {
    zh: {label: '信息提取', kicker: 'legacy', description: '旧分组，相关工具已移动到文本处理和正则测试。'},
    en: {label: 'Extract', kicker: 'legacy', description: 'Legacy group. Tools moved into Text and Regex.'},
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
      '集中提供文本处理、格式化、编码、加密、JWT、时间戳、模拟数据、正则测试、压缩和代码运行等常用能力，支持直接编辑、运行、预览和下载结果。',
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
    closeOtherTabs: '关闭其他',
    closeAllTabs: '关闭全部',
    untitled: '未命名',
    settingsMenu: {
      export: '导出配置',
      import: '导入配置',
      about: '关于',
      version: '版本 0.2.0',
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
      'A focused toolbox for text, formatting, encoding, crypto, JWT, timestamps, mock data, regex testing, compression, previews, and code running.',
    sidebarMenuTitle: 'Tool Groups',
    chooseTool: 'Choose a tool',
    toolsCount: (count: number) => `${count} tools`,
    dragToReorder: 'Drag to reorder',
    searchResults: 'Search Results',
    searchResultsHint: 'The top search scans tool names, tags, summaries, and field labels across modules.',
    noSearchResults: 'No matching tools found. Try another keyword.',
    dark: 'Dark',
    light: 'Light',
    accentLabel: 'Accent',
    settingsMenu: {
      export: 'Export Config',
      import: 'Import Config',
      about: 'About',
      version: 'Version 0.2.0',
    },
    accentOptions: {
      mint: 'Mint',
      sky: 'Sky',
      amber: 'Amber',
      rose: 'Rose',
      slate: 'Slate',
      github: 'GitHub Light',
    },
    newTab: 'New Tab',
    closeTab: 'Close tab',
    closeOtherTabs: 'Close Others',
    closeAllTabs: 'Close All',
    untitled: 'Untitled',
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
    chooseTool: string;
    toolsCount: (count: number) => string;
    dragToReorder: string;
    searchResults: string;
    searchResultsHint: string;
    noSearchResults: string;
    dark: string;
    light: string;
    accentLabel: string;
    accentOptions: Record<ThemeAccent, string>;
    newTab: string;
    closeTab: string;
    closeOtherTabs: string;
    closeAllTabs: string;
    untitled: string;
    settingsMenu: {
      export: string;
      import: string;
      about: string;
      version: string;
    };
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
    return value === 'sky' || value === 'amber' || value === 'rose' || value === 'slate' || value === 'github' || value === 'mint' ? value : 'github';
  } catch {
    return 'github';
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

function readStoredTabs(): TabState[] {
  try {
    const raw = window.localStorage.getItem(TAB_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t): t is TabState => t && typeof t.id === 'string' && typeof t.toolId === 'string')
      .map((tab) => {
        if (tab.toolStates && typeof tab.toolStates === 'object') {
          return tab;
        }

        const legacyTab = tab as TabState & {
          fieldValues?: Record<string, ToolFieldValue>;
          result?: ToolResult;
          resultVersion?: number;
          isRunning?: boolean;
        };

        return {
          id: legacyTab.id,
          toolId: legacyTab.toolId,
          toolName: legacyTab.toolName,
          editorText: legacyTab.editorText ?? DEFAULT_EDITOR_TEXT,
          toolStates: {
            [legacyTab.toolId]: {
              fieldValues: legacyTab.fieldValues ?? {},
              result:
                legacyTab.result ?? {
                  ok: true,
                  output: '',
                  mode: 'result',
                  message: UI_COPY[readStoredLanguage()].ready,
                },
              resultVersion: legacyTab.resultVersion ?? 0,
              isRunning: legacyTab.isRunning ?? false,
            },
          },
        };
      });
  } catch {
    return [];
  }
}

function writeStoredTabs(tabs: TabState[]) {
  try {
    window.localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(tabs));
  } catch {
    // ignore
  }
}

function readStoredActiveTab(): string {
  try {
    return window.localStorage.getItem(ACTIVE_TAB_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function writeStoredActiveTab(tabId: string) {
  try {
    window.localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tabId);
  } catch {
    // ignore
  }
}

function createDefaultResult(lang: AppLanguage): ToolResult {
  return {
    ok: true,
    output: '',
    mode: 'result',
    message: UI_COPY[lang].ready,
  };
}

function createDefaultToolTabState(tool: ToolDefinition, lang: AppLanguage): ToolTabState {
  return {
    fieldValues: getDefaultFieldValues(tool),
    result: createDefaultResult(lang),
    resultVersion: 0,
    isRunning: false,
  };
}

function formatGroupLabel(groupId: ToolModuleGroupId, lang: AppLanguage) {
  return GROUP_TRANSLATIONS[groupId][lang].label;
}

function formatKindLabel(kind: ToolDefinition['kind'], lang: AppLanguage) {
  if (lang === 'en') {
    return kind === 'transform' ? 'transform' : kind === 'extract' ? 'extract' : 'generate';
  }
  return kind === 'transform' ? '转换' : kind === 'extract' ? '提取' : '生成';
}

function getGroupBaseOrder(groupId: ToolModuleGroupId) {
  return TOOLS.filter((tool) => tool.group === groupId).map((tool) => tool.id);
}

function mergeGroupOrder(groupId: ToolModuleGroupId, storedOrder: string[] = []) {
  const baseOrder = getGroupBaseOrder(groupId);
  return [...storedOrder.filter((toolId) => baseOrder.includes(toolId)), ...baseOrder.filter((toolId) => !storedOrder.includes(toolId))];
}

function sortToolsByOrder(
  tools: ToolDefinition[],
  groupId: ToolModuleGroupId,
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

function getLocalizedFieldLabel(tool: ToolDefinition, fieldName: string, lang: AppLanguage) {
  const localizedTool = getLocalizedTool(tool, lang);
  return localizedTool.fields.find((field) => field.name === fieldName)?.label ?? fieldName;
}

// Export/Import configuration
function exportConfig(lang: AppLanguage, favorites: string[], toolOrders: Record<string, string[]>, accent: ThemeAccent, theme: 'light' | 'dark') {
  const config = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    language: lang,
    theme,
    accent,
    favorites,
    toolOrders,
  };
  const blob = new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dev-tools-config-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importConfig(file: File): Promise<{lang: AppLanguage; favorites: string[]; toolOrders: Record<string, string[]>; accent: ThemeAccent; theme: 'light' | 'dark'} | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (config.version && config.favorites && config.toolOrders) {
          resolve({
            lang: config.language || 'zh',
            favorites: config.favorites,
            toolOrders: config.toolOrders,
            accent: config.accent || 'github',
            theme: config.theme || 'light',
          });
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}

export default function App() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim();
  const isSearching = normalizedSearch.length > 0;
  const [activeGroup, setActiveGroup] = useState<ToolModuleGroupId>(TOOL_GROUPS[0]?.id ?? 'text');
  const [favorites, setFavorites] = useState<string[]>(() => readStoredList(STORAGE_KEYS.favorites));
  const [recents, setRecents] = useState<string[]>(() => readStoredList(STORAGE_KEYS.recents));
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
  const [draggedToolId, setDraggedToolId] = useState<string | null>(null);
  const [status, setStatus] = useState<{tone: 'info' | 'success' | 'error'; message: string}>({
    tone: 'info',
    message: UI_COPY[readStoredLanguage()].status,
  });

  // Multi-tab state
  const [tabs, setTabs] = useState<TabState[]>(() => readStoredTabs());
  const [activeTabId, setActiveTabId] = useState<string>(() => readStoredActiveTab());

  // Persist tabs
  useEffect(() => {
    writeStoredTabs(tabs);
  }, [tabs]);

  useEffect(() => {
    writeStoredActiveTab(activeTabId);
  }, [activeTabId]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || null;
  const activeTool = activeTab ? getToolById(activeTab.toolId) : null;
  const activeToolState = activeTab && activeTool ? activeTab.toolStates[activeTool.id] : null;

  const visibleTools = isSearching
    ? filterTools({search: normalizedSearch})
    : sortToolsByOrder(
        filterTools({group: activeGroup}),
        activeGroup,
        toolOrders,
      );
  const canDragSort = !isSearching;

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

  function updateStatus(tone: 'info' | 'success' | 'error', message: string) {
    setStatus({tone, message});
  }

  function pushRecent(toolId: string) {
    setRecents((current) => [toolId, ...current.filter((item) => item !== toolId)].slice(0, MAX_RECENTS));
  }

  const createTab = useCallback((tool: ToolDefinition) => {
    const localized = getLocalizedTool(tool, lang);
    const sharedEditorText = tabs.find((tab) => tab.id === activeTabId)?.editorText ?? DEFAULT_EDITOR_TEXT;
    const newTab: TabState = {
      id: generateTabId(),
      toolId: tool.id,
      toolName: localized.name,
      editorText: sharedEditorText,
      toolStates: {
        [tool.id]: createDefaultToolTabState(tool, lang),
      },
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setActiveGroup(tool.group);
    updateStatus('info', lang === 'zh' ? `已打开 ${localized.name}` : `Opened ${localized.name}`);
  }, [activeTabId, lang, tabs]);

  const closeTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      const index = prev.findIndex((t) => t.id === tabId);
      if (index === -1) return prev;
      
      const newTabs = prev.filter((t) => t.id !== tabId);
      
      if (tabId === activeTabId && newTabs.length > 0) {
        const newIndex = Math.min(index, newTabs.length - 1);
        setActiveTabId(newTabs[Math.max(0, newIndex)].id);
      } else if (newTabs.length === 0) {
        setActiveTabId('');
      }
      
      return newTabs;
    });
  }, [activeTabId]);

  const closeTabsExceptActive = useCallback(() => {
    if (!activeTabId) {
      return;
    }

    setTabs((prev) => closeOtherTabs(prev, activeTabId));
    updateStatus('info', lang === 'zh' ? '已关闭其他标签页。' : 'Closed other tabs.');
  }, [activeTabId, lang]);

  const handleCloseAllTabs = useCallback(() => {
    const next = closeAllTabs();
    setTabs(next.tabs);
    setActiveTabId(next.activeTabId);
    updateStatus('info', lang === 'zh' ? '已关闭全部标签页。' : 'Closed all tabs.');
  }, [lang]);

  const updateActiveTab = useCallback((updates: Partial<TabState>) => {
    if (!activeTabId) return;
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId ? {...tab, ...updates} : tab
      )
    );
  }, [activeTabId]);

  const updateActiveToolState = useCallback((updater: (state: ToolTabState) => ToolTabState) => {
    if (!activeTabId || !activeTool) {
      return;
    }

    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) {
          return tab;
        }

        const ensuredTab = ensureToolTabState(tab, activeTool.id, () => createDefaultToolTabState(activeTool, lang));
        return {
          ...ensuredTab,
          toolStates: {
            ...ensuredTab.toolStates,
            [activeTool.id]: updater(ensuredTab.toolStates[activeTool.id]),
          },
        };
      }),
    );
  }, [activeTabId, activeTool, lang]);

  function handleSelectTool(toolId: string) {
    const tool = getToolById(toolId);
    if (!tool) {
      return;
    }

    const localizedTool = getLocalizedTool(tool, lang);
    setActiveGroup(tool.group);

    if (!activeTabId) {
      createTab(tool);
      return;
    }

    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) {
          return tab;
        }

        return switchTabTool(tab, {id: tool.id, name: localizedTool.name}, () => createDefaultToolTabState(tool, lang));
      }),
    );
    updateStatus('info', lang === 'zh' ? `${localizedTool.name} 已就绪。需要的话先调整参数，再运行。` : `${localizedTool.name} is ready. Adjust inputs if needed, then run it.`);
  }

  function handleOpenToolInNewTab(toolId: string) {
    const tool = getToolById(toolId);
    if (tool) {
      createTab(tool);
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
    if (!activeTool || !activeToolState) return;

    updateActiveToolState((current) => ({
      ...current,
      fieldValues: {
        ...getDefaultFieldValues(activeTool),
        ...current.fieldValues,
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
    if (!activeToolState?.result.download) {
      updateStatus('error', lang === 'zh' ? '当前没有可下载的结果。' : 'There is no downloadable result yet.');
      return;
    }

    const href =
      activeToolState.result.download.dataUrl ??
      URL.createObjectURL(new Blob([activeToolState.result.download.content], {type: activeToolState.result.download.mimeType}));

    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = activeToolState.result.download.fileName;
    anchor.click();

    if (!activeToolState.result.download.dataUrl) {
      URL.revokeObjectURL(href);
    }

    updateStatus('success', lang === 'zh' ? `已开始下载 ${activeToolState.result.download.fileName}。` : `Started downloading ${activeToolState.result.download.fileName}.`);
  }

  function handleSelectGroup(groupId: ToolModuleGroupId) {
    setActiveGroup(groupId);
    setDraggedToolId(null);

    const nextTool =
      sortToolsByOrder(
        filterTools({
          group: groupId,
          search: deferredSearch.trim(),
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
      handleSelectTool(nextTool.id);
      return;
    }

    updateStatus('info', lang === 'zh' ? `${formatGroupLabel(groupId, lang)} 已打开。` : `${formatGroupLabel(groupId, lang)} opened.`);
  }

  function handleReorder(groupId: ToolModuleGroupId, targetToolId: string) {
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
    if (!activeTool || !activeTab || !activeToolState) {
      updateStatus('error', lang === 'zh' ? '当前没有选中的工具。' : 'No tool is currently selected.');
      return;
    }

    if (activeToolState.isRunning) {
      return;
    }

    const validationError = validateFields(activeTool, activeToolState.fieldValues);
    if (validationError) {
      updateStatus('error', validationError);
      return;
    }

    updateActiveToolState((current) => ({...current, isRunning: true}));
    const localizedTool = getLocalizedTool(activeTool, lang);
    updateStatus('info', lang === 'zh' ? `正在运行 ${localizedTool.name}...` : `Running ${localizedTool.name}...`);
    await new Promise((resolve) => window.setTimeout(resolve, 260));

    const rawExecution = await executeTool(activeTool, {
      input: activeTab.editorText,
      fields: activeToolState.fieldValues,
    });
    const execution = localizeToolResult(rawExecution, lang);

    updateActiveToolState((current) => ({
      ...current,
      result: execution,
      resultVersion: current.resultVersion + 1,
      isRunning: false,
    }));

    if (!execution.ok) {
      updateStatus('error', execution.message);
      return;
    }

    pushRecent(activeTool.id);
    updateStatus('success', execution.message);
  }

  const activeGroupLabel = formatGroupLabel(activeGroup, lang);
  const railTitle = isSearching ? copy.searchResults : activeGroupLabel;
  const railHint = isSearching ? copy.searchResultsHint : copy.dragToReorder;
  const groupCounts = TOOL_GROUPS.reduce<Record<string, number>>((accumulator, group) => {
    accumulator[group.id] = filterTools({group: group.id}).length;
    return accumulator;
  }, {});
  const localizedGroups = TOOL_GROUPS.map((group) => ({
    ...group,
    ...GROUP_TRANSLATIONS[group.id][lang],
  }));

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
        onSelectGroup={(groupId) => handleSelectGroup(groupId as ToolModuleGroupId)}
      />
      <Header
        lang={lang}
        strings={{
          accentLabel: copy.accentLabel,
          accentOptions: copy.accentOptions,
          searchPlaceholder: copy.searchPlaceholder,
          themeValue: theme === 'light' ? copy.dark : copy.light,
          settingsMenu: copy.settingsMenu,
        }}
        accent={accent}
        onAccentChange={(value) => setAccent(value as ThemeAccent)}
        onSearchChange={setSearch}
        onToggleLanguage={() => setLang((current) => (current === 'zh' ? 'en' : 'zh'))}
        onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
        onExport={() => exportConfig(lang, favorites, toolOrders, accent, theme)}
        onImport={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const config = await importConfig(file);
              if (config) {
                setLang(config.lang);
                setFavorites(config.favorites);
                setToolOrders(config.toolOrders);
                setAccent(config.accent);
                setTheme(config.theme);
                updateStatus('success', lang === 'zh' ? '配置导入成功！' : 'Config imported successfully!');
              } else {
                updateStatus('error', lang === 'zh' ? '配置文件格式无效。' : 'Invalid config file format.');
              }
            }
          };
          input.click();
        }}
        search={search}
        theme={theme}
      />

      {/* Tabs Bar */}
      {tabs.length > 0 && (
        <div className="fixed left-48 right-0 top-[72px] z-40 mt-3 mb-2 border-b border-outline/30 bg-surface/94 backdrop-blur-sm shadow-[0_8px_18px_-18px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-1 px-4 py-2">
            <div className="flex flex-1 items-center gap-1 overflow-x-auto">
              <AnimatePresence mode="popLayout">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  const tool = getToolById(tab.toolId);
                  const Icon = tool?.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      layout
                      initial={{opacity: 0, x: -20}}
                      animate={{opacity: 1, x: 0}}
                      exit={{opacity: 0, x: 20}}
                      onClick={() => setActiveTabId(tab.id)}
                      className={`group flex min-w-0 max-w-[200px] shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left transition-all ${
                        isActive
                          ? 'border-primary/36 bg-surface-container-high text-primary shadow-[inset_0_0_0_1px_rgba(163,166,255,0.14)]'
                          : 'bg-surface-container-low text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)] hover:bg-surface-container-high'
                      }`}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                      <span className="flex-1 truncate text-xs font-medium">
                        {tab.toolName}
                      </span>
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                        className={`ml-1 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer ${
                          isActive ? 'hover:bg-primary/20' : 'hover:bg-surface-container-high'
                        }`}
                        title={copy.closeTab}
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
            <button
              onClick={closeTabsExceptActive}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-surface-container-low px-2.5 py-2 text-xs font-medium text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)] transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
              disabled={tabs.length <= 1 || !activeTabId}
              title={copy.closeOtherTabs}
              type="button"
            >
              {copy.closeOtherTabs}
            </button>
            <button
              onClick={handleCloseAllTabs}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-surface-container-low px-2.5 py-2 text-xs font-medium text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)] transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
              disabled={tabs.length === 0}
              title={copy.closeAllTabs}
              type="button"
            >
              {copy.closeAllTabs}
            </button>
            <button
              onClick={() => {
                // Open new tab with first visible tool or first tool overall
                const toolToOpen = visibleTools[0] || TOOLS[0];
                if (toolToOpen) {
                  handleOpenToolInNewTab(toolToOpen.id);
                }
              }}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-surface-container-low px-2 py-2 text-xs font-medium text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)] transition-colors hover:bg-surface-container-high hover:text-on-surface"
              title={copy.newTab}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <main className="ml-48 min-h-screen pl-4 pr-6 pb-10 pt-[140px]">
        <section className="grid gap-5 xl:grid-cols-[1fr_300px]">
            {activeTab && activeTool && activeToolState && (
              <Workbench
                editorText={activeTab.editorText}
                fieldValues={activeToolState.fieldValues}
                isRunning={activeToolState.isRunning}
                onClearEditor={() => {
                  updateActiveTab({editorText: ''});
                  updateStatus('info', lang === 'zh' ? '编辑区已清空。' : 'Editor cleared.');
                }}
                onCopyInput={() => handleCopy(activeTab.editorText, lang === 'zh' ? '已复制输入内容。' : 'Input copied.')}
                onCopyResult={() => handleCopy(activeToolState.result.output, lang === 'zh' ? '已复制结果内容。' : 'Result copied.')}
                onDownloadResult={handleDownloadResult}
                onEditorChange={(value) => updateActiveTab({editorText: value})}
                onFieldChange={handleFieldChange}
                onResetFields={() => {
                  updateActiveToolState((current) => ({
                    ...current,
                    fieldValues: getDefaultFieldValues(activeTool),
                  }));
                  updateStatus('info', lang === 'zh' ? '已恢复默认参数。' : 'Fields reset to defaults.');
                }}
                onRun={handleRun}
                onUseResult={() => {
                  if (!activeToolState.result.output) {
                    updateStatus('error', lang === 'zh' ? '当前没有可写回编辑区的结果。' : 'There is no result to write back into the editor.');
                    return;
                  }
                  updateActiveTab({editorText: activeToolState.result.output});
                  updateStatus('success', lang === 'zh' ? '已将结果写回编辑区。' : 'The result has been written back into the editor.');
                }}
                result={activeToolState.result}
                resultVersion={activeToolState.resultVersion}
                status={status}
                tool={getLocalizedTool(activeTool, lang)}
                lang={lang}
              />
            )}

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-on-surface">{railTitle}</h3>
                  <p className="mt-1 text-xs text-on-surface-variant">{railHint}</p>
                </div>
                <span className="ml-auto rounded-full border border-outline-variant/10 bg-surface-container-low px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                  {copy.toolsCount(visibleTools.length)}
                </span>
              </div>

              <div className="space-y-2.5">
                {!visibleTools.length ? (
                  <div className="rounded-2xl border border-outline-variant/12 bg-surface-container-low px-4 py-6 text-sm text-on-surface-variant">
                    {copy.noSearchResults}
                  </div>
                ) : null}
                {visibleTools.map((rawTool, index) => {
                  const tool = getLocalizedTool(rawTool, lang);
                  const isOpen = tabs.some((t) => t.toolId === tool.id);
                  return (
                  <motion.div
                    animate={{opacity: 1, y: 0}}
                    className={`relative ${draggedToolId === tool.id ? 'opacity-60' : ''}`}
                    initial={{opacity: 0, y: 10}}
                    key={tool.id}
                    onDragOver={canDragSort ? (event) => event.preventDefault() : undefined}
                    onDrop={canDragSort ? () => handleReorder(rawTool.group, rawTool.id) : undefined}
                    transition={{delay: Math.min(index * 0.02, 0.14)}}
                  >
                    {!isSearching ? (
                      <>
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
                      </>
                    ) : null}
                    <ToolCard
                      badges={[formatKindLabel(tool.kind, lang), ...tool.tags]}
                      category={formatGroupLabel(tool.group, lang)}
                      categoryColor={tool.color}
                      compact
                      description={tool.summary}
                      icon={tool.icon}
                      isActive={rawTool.id === activeTool?.id}
                      isFavorite={favorites.includes(rawTool.id)}
                      isOpen={isOpen}
                      onSelect={() => handleSelectTool(rawTool.id)}
                      onOpenInNewTab={() => handleOpenToolInNewTab(rawTool.id)}
                      onToggleFavorite={() => handleToggleFavorite(rawTool.id)}
                      strings={{
                        addFavorite: lang === 'zh' ? '加入收藏' : 'Add to favorites',
                        removeFavorite: lang === 'zh' ? '取消收藏' : 'Remove from favorites',
                        openInNewTab: lang === 'zh' ? '在新标签页打开' : 'Open in new tab',
                        openTool: lang === 'zh' ? '打开工具' : 'Open tool',
                        switchToTool: lang === 'zh' ? '切换到该工具' : 'Switch to tool',
                      }}
                      title={tool.name}
                      variant="rail"
                    />
                  </motion.div>
                )})}
              </div>
            </div>
          </section>
      </main>
    </div>
  );
}

// Export functions for use in other components
export {exportConfig, importConfig};
