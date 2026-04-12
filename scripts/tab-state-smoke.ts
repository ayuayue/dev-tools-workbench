import assert from 'node:assert/strict';
import {
  closeOtherTabs,
  closeAllTabs,
  deriveActiveGroupFromTabs,
  ensureToolTabState,
  switchTabTool,
  TabState,
  ToolTabState,
} from '../src/appTabState';

function createDefaultState(label: string): ToolTabState {
  return {
    fieldValues: {preset: label},
    result: {
      ok: true,
      output: '',
      mode: 'result',
      message: `${label} ready`,
    },
    resultVersion: 0,
    isRunning: false,
  };
}

let tab: TabState = {
  id: 'tab-1',
  toolId: 'json-format',
  toolName: 'JSON Format',
  editorText: '{"hello":true}',
  toolStates: {
    'json-format': createDefaultState('json-format'),
  },
};

tab = switchTabTool(tab, {id: 'jwt-decode', name: 'JWT Decode'}, () => createDefaultState('jwt-decode'));

assert.equal(tab.editorText, '{"hello":true}', 'switching tools should preserve shared editor text');
assert.equal(tab.toolId, 'jwt-decode', 'active tool should switch to the requested tool');
assert.equal(tab.toolStates['json-format'].fieldValues.preset, 'json-format', 'previous tool state should remain intact');
assert.equal(tab.toolStates['jwt-decode'].fieldValues.preset, 'jwt-decode', 'new tool state should initialize separately');

const untouched = ensureToolTabState(tab, 'jwt-decode', () => createDefaultState('wrong'));
assert.equal(untouched.toolStates['jwt-decode'].fieldValues.preset, 'jwt-decode', 'existing tool state should not be recreated');

const extraTabs: TabState[] = [
  tab,
  {
    id: 'tab-2',
    toolId: 'regex-tester',
    toolName: 'Regex Tester',
    editorText: 'abc',
    toolStates: {
      'regex-tester': createDefaultState('regex-tester'),
    },
  },
  {
    id: 'tab-3',
    toolId: 'replace-text',
    toolName: 'Replace Text',
    editorText: 'xyz',
    toolStates: {
      'replace-text': createDefaultState('replace-text'),
    },
  },
];

const onlyActive = closeOtherTabs(extraTabs, 'tab-2');
assert.equal(onlyActive.length, 1, 'close others should keep only the active tab');
assert.equal(onlyActive[0].id, 'tab-2', 'close others should preserve the requested active tab');

const closedAll = closeAllTabs();
assert.equal(closedAll.tabs.length, 0, 'close all should remove every tab');
assert.equal(closedAll.activeTabId, '', 'close all should clear the active tab id');

const derivedGroup = deriveActiveGroupFromTabs(extraTabs, 'tab-3', 'text', (toolId) => {
  if (toolId === 'replace-text') return 'text';
  if (toolId === 'regex-tester') return 'regex';
  if (toolId === 'jwt-decode') return 'jwt';
  return null;
});
assert.equal(derivedGroup, 'text', 'active group should follow the active tab tool group');

console.log('tab-state smoke test passed');
