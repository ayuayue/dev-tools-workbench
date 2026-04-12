import {ToolFieldValue, ToolResult} from './data/toolRegistry';

export interface ToolTabState {
  fieldValues: Record<string, ToolFieldValue>;
  result: ToolResult;
  resultVersion: number;
  isRunning: boolean;
}

export interface TabState {
  id: string;
  toolId: string;
  toolName: string;
  editorText: string;
  toolStates: Record<string, ToolTabState>;
}

export function deriveActiveGroupFromTabs<TGroup extends string>(
  tabs: TabState[],
  activeTabId: string,
  fallbackGroup: TGroup,
  getToolGroup: (toolId: string) => TGroup | null,
): TGroup {
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0] ?? null;
  if (!activeTab) {
    return fallbackGroup;
  }

  return getToolGroup(activeTab.toolId) ?? fallbackGroup;
}

export function ensureToolTabState(
  tab: TabState,
  toolId: string,
  createDefaultState: () => ToolTabState,
): TabState {
  if (tab.toolStates[toolId]) {
    return tab;
  }

  return {
    ...tab,
    toolStates: {
      ...tab.toolStates,
      [toolId]: createDefaultState(),
    },
  };
}

export function switchTabTool(
  tab: TabState,
  nextTool: {id: string; name: string},
  createDefaultState: () => ToolTabState,
): TabState {
  const nextTab = ensureToolTabState(tab, nextTool.id, createDefaultState);
  return {
    ...nextTab,
    toolId: nextTool.id,
    toolName: nextTool.name,
  };
}

export function closeOtherTabs(tabs: TabState[], activeTabId: string): TabState[] {
  return tabs.filter((tab) => tab.id === activeTabId);
}

export function closeAllTabs(): {tabs: TabState[]; activeTabId: string} {
  return {
    tabs: [],
    activeTabId: '',
  };
}
