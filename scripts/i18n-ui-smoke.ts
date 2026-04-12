import assert from 'node:assert/strict';

const zhReady = '先选择工具，再在工作台执行。';
const enReady = 'Choose a tool and run it from the workspace.';
const zhEmptyResult = '先选择工具，再在工作台执行。';
const enEmptyResult = 'Choose a tool to generate output in the workspace.';
const zhStatus = '默认中文和亮色已启用。先搜索，再选工具，然后在工作台运行。';
const enStatus = 'English and light mode are ready. Search, pick a tool, then run it in the workspace.';

function normalizeResultMessage(message: string, lang: 'zh' | 'en') {
  if (message === zhReady || message === enReady || message === zhEmptyResult || message === enEmptyResult) {
    return lang === 'zh' ? zhEmptyResult : enEmptyResult;
  }
  return message;
}

function normalizeStatusMessage(message: string, lang: 'zh' | 'en') {
  if (message === zhStatus || message === enStatus) {
    return lang === 'zh' ? zhStatus : enStatus;
  }
  return message;
}

function localizeTabTitle(toolId: string, lang: 'zh' | 'en') {
  const names = {
    'find-replace': {zh: '查找替换', en: 'Find & Replace'},
    'json-format': {zh: 'JSON 格式化', en: 'JSON Format'},
  } as const;
  return names[toolId as keyof typeof names]?.[lang] ?? toolId;
}

assert.equal(localizeTabTitle('find-replace', 'en'), 'Find & Replace', 'tab title should follow current language');
assert.equal(localizeTabTitle('json-format', 'zh'), 'JSON 格式化', 'tab title should localize in Chinese');
assert.equal(normalizeResultMessage(zhReady, 'en'), enEmptyResult, 'legacy zh empty result should normalize to English');
assert.equal(normalizeResultMessage(enReady, 'zh'), zhEmptyResult, 'legacy en ready message should normalize to Chinese');
assert.equal(normalizeStatusMessage(zhStatus, 'en'), enStatus, 'legacy zh status should normalize to English');
assert.equal(normalizeStatusMessage(enStatus, 'zh'), zhStatus, 'legacy en status should normalize to Chinese');

console.log('i18n ui smoke test passed');
