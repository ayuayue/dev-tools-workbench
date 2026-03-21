import {
  Braces,
  CaseSensitive,
  FileSearch,
  FileText,
  Fingerprint,
  Globe,
  LucideIcon,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TableProperties,
  TextCursorInput,
  Waypoints,
} from 'lucide-react';

export type ToolGroupId =
  | 'all'
  | 'favorites'
  | 'text'
  | 'json'
  | 'encode'
  | 'crypto'
  | 'timestamp'
  | 'mock'
  | 'base64'
  | 'url'
  | 'jwt'
  | 'data'
  | 'extract'
  | 'generate';
export type ToolKind = 'transform' | 'extract' | 'generate';
export type ToolLevel = 'core' | 'expert';
export type ToolColor = 'primary' | 'secondary' | 'tertiary';
export type AppLanguage = 'zh' | 'en';
export interface UploadedAsset {
  name: string;
  mimeType: string;
  content: string;
  dataUrl: string;
  size: number;
}

export type ToolFieldValue = string | boolean | UploadedAsset | null;

export type ToolField =
  | {
      name: string;
      label: string;
      type: 'text';
      placeholder?: string;
      required?: boolean;
      defaultValue?: string;
    }
  | {
      name: string;
      label: string;
      type: 'select';
      defaultValue: string;
      options: Array<{label: string; value: string}>;
    }
  | {
      name: string;
      label: string;
      type: 'checkbox';
      defaultValue?: boolean;
    }
  | {
      name: string;
      label: string;
      type: 'file';
      accept?: string;
      required?: boolean;
      helper?: string;
    };

export interface ToolRunContext {
  input: string;
  fields: Record<string, ToolFieldValue>;
}

export interface ToolDownload {
  fileName: string;
  mimeType: string;
  content: string;
  dataUrl?: string;
}

export interface ToolPreview {
  type: 'image';
  src: string;
}

export interface ToolResult {
  ok: boolean;
  output: string;
  mode: 'replace' | 'result';
  message: string;
  meta?: Record<string, number | string>;
  download?: ToolDownload | null;
  preview?: ToolPreview | null;
}

export interface ToolDefinition {
  id: string;
  name: string;
  summary: string;
  group: Exclude<ToolGroupId, 'all' | 'favorites'>;
  kind: ToolKind;
  level: ToolLevel;
  color: ToolColor;
  icon: LucideIcon;
  tags: string[];
  fields: ToolField[];
  featured?: boolean;
  run: (context: ToolRunContext) => ToolResult | Promise<ToolResult>;
}

export interface ToolGroup {
  id: ToolGroupId;
  label: string;
  kicker: string;
  description: string;
}

export const STORAGE_KEYS = {
  favorites: 'dev-tools2.favorites.v1',
  recents: 'dev-tools2.recents.v1',
  theme: 'dev-tools2.theme.v1',
  language: 'dev-tools2.language.v1',
  accent: 'dev-tools2.accent.v1',
  toolOrders: 'dev-tools2.tool-orders.v1',
};

export const MAX_RECENTS = 6;

export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: 'all',
    label: '全部工具',
    kicker: '完整目录',
    description: '保留全部工具可见，主要依靠搜索和筛选定位。',
  },
  {
    id: 'favorites',
    label: '收藏工具',
    kicker: 'favorites',
    description: '集中查看你标记过的常用工具。',
  },
  {
    id: 'text',
    label: '文本处理',
    kicker: '纯文本',
    description: '处理大小写、空白、行序、替换和基础文本整理。',
  },
  {
    id: 'json',
    label: 'JSON 处理',
    kicker: 'json',
    description: 'JSON 格式化、压缩以及和其他数据格式的互转。',
  },
  {
    id: 'encode',
    label: '编码转换',
    kicker: 'url/base64',
    description: '集中处理 URL、Base64 等常见编码与解码能力。',
  },
  {
    id: 'crypto',
    label: '加密处理',
    kicker: 'hash/aes',
    description: '提供常见摘要、HMAC 和 AES 加解密工具。',
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
    description: '生成用户名、邮箱、证件、地址、手机号等常用测试数据。',
  },
  {
    id: 'data',
    label: '数据格式',
    kicker: 'xml/csv/md',
    description: 'XML、CSV、Markdown 表格和 HTML 实体等专一格式处理。',
  },
  {
    id: 'extract',
    label: '信息提取',
    kicker: '抽取信号',
    description: '从原始文本中提取链接、邮箱、数字和正则结果。',
  },
];

export const FEATURED_TOOL_IDS = [
  'replace-text',
  'json-format',
  'extract-urls',
  'generate-email',
  'markdown-align',
  'csv-to-json',
];

type ToolFieldLocale = {
  label?: string;
  placeholder?: string;
  helper?: string;
  options?: Record<string, string>;
};

type ToolLocale = {
  name?: string;
  summary?: string;
  tags?: string[];
  fields?: Record<string, ToolFieldLocale>;
};

const TAG_I18N: Record<string, Record<AppLanguage, string>> = {
  regex: {zh: '正则', en: 'regex'},
  replace: {zh: '替换', en: 'replace'},
  cleanup: {zh: '清理', en: 'cleanup'},
  trim: {zh: '裁剪', en: 'trim'},
  whitespace: {zh: '空白', en: 'whitespace'},
  space: {zh: '空格', en: 'space'},
  tabs: {zh: '制表符', en: 'tabs'},
  lines: {zh: '行处理', en: 'lines'},
  blank: {zh: '空行', en: 'blank'},
  case: {zh: '大小写', en: 'case'},
  english: {zh: '英文', en: 'english'},
  slug: {zh: '标识符', en: 'slug'},
  variable: {zh: '变量', en: 'variable'},
  url: {zh: '链接', en: 'url'},
  sort: {zh: '排序', en: 'sort'},
  dedupe: {zh: '去重', en: 'dedupe'},
  download: {zh: '下载', en: 'download'},
  file: {zh: '文件', en: 'file'},
  text: {zh: '文本', en: 'text'},
  encode: {zh: '编码', en: 'encode'},
  decode: {zh: '解码', en: 'decode'},
  image: {zh: '图片', en: 'image'},
  json: {zh: 'JSON', en: 'json'},
  pretty: {zh: '格式化', en: 'pretty'},
  minify: {zh: '压缩', en: 'minify'},
  html: {zh: 'HTML', en: 'html'},
  escape: {zh: '转义', en: 'escape'},
  xml: {zh: 'XML', en: 'xml'},
  jwt: {zh: 'JWT', en: 'jwt'},
  token: {zh: '令牌', en: 'token'},
  payload: {zh: '载荷', en: 'payload'},
  email: {zh: '邮箱', en: 'email'},
  links: {zh: '链接', en: 'links'},
  numbers: {zh: '数字', en: 'numbers'},
  metrics: {zh: '数值', en: 'metrics'},
  capture: {zh: '捕获', en: 'capture'},
  time: {zh: '时间', en: 'time'},
  timestamp: {zh: '时间戳', en: 'timestamp'},
  iso: {zh: 'ISO', en: 'iso'},
  uuid: {zh: 'UUID', en: 'uuid'},
  csv: {zh: 'CSV', en: 'csv'},
  markdown: {zh: 'Markdown', en: 'markdown'},
  table: {zh: '表格', en: 'table'},
  hash: {zh: '摘要', en: 'hash'},
  sha: {zh: 'SHA', en: 'sha'},
  hmac: {zh: 'HMAC', en: 'hmac'},
  signature: {zh: '签名', en: 'signature'},
  aes: {zh: 'AES', en: 'aes'},
  encrypt: {zh: '加密', en: 'encrypt'},
  username: {zh: '用户名', en: 'username'},
  mock: {zh: '模拟', en: 'mock'},
  phone: {zh: '手机号', en: 'phone'},
  address: {zh: '地址', en: 'address'},
  id: {zh: '证件', en: 'id'},
  card: {zh: '卡号', en: 'card'},
  passport: {zh: '护照', en: 'passport'},
  license: {zh: '执照', en: 'license'},
  local: {zh: '本地', en: 'local'},
  beijing: {zh: '北京时间', en: 'beijing'},
  convert: {zh: '换算', en: 'convert'},
};

const TOOL_EN_LOCALES: Record<string, ToolLocale> = {
  'replace-text': {
    name: 'Find & Replace',
    summary: 'Replace plain text or regex matches and return a clear match count.',
    fields: {
      find: {label: 'Find', placeholder: 'foo'},
      replace: {label: 'Replace With', placeholder: 'bar'},
      regex: {label: 'Use Regex'},
      caseSensitive: {label: 'Case Sensitive'},
    },
  },
  'trim-text': {name: 'Trim Edges', summary: 'Remove leading and trailing spaces and blank lines.'},
  'collapse-spaces': {name: 'Collapse Spaces', summary: 'Compress repeated spaces and tabs into a single space.'},
  'remove-empty-lines': {name: 'Remove Empty Lines', summary: 'Delete blank lines while preserving the remaining order.'},
  'title-case': {name: 'Title Case', summary: 'Convert English titles into Title Case.'},
  'snake-case': {summary: 'Convert headings, labels, or variable names into snake_case.'},
  'kebab-case': {summary: 'Convert titles and identifiers into kebab-case for URLs and class names.'},
  'sort-lines': {
    name: 'Sort Lines',
    summary: 'Sort line lists in ascending or descending order.',
    fields: {direction: {label: 'Sort Direction', options: {asc: 'A to Z', desc: 'Z to A'}}},
  },
  'unique-lines': {name: 'Unique Lines', summary: 'Remove duplicate lines and keep the first occurrence order.'},
  'export-text-file': {
    name: 'Export as File',
    summary: 'Package the current editor text as a downloadable file.',
    fields: {
      fileName: {label: 'File Name', placeholder: 'Default: timestamp'},
      extension: {label: 'Extension', placeholder: 'txt'},
    },
  },
  'url-encode': {summary: 'Encode strings so they are safe to use in URL parameters.'},
  'url-decode': {summary: 'Decode URL-encoded content back into plain text.'},
  'base64-encode': {summary: 'Encode Unicode text into Base64.'},
  'base64-decode': {summary: 'Decode Base64 back into readable text.'},
  'file-to-base64': {
    name: 'File/Image to Base64',
    summary: 'Upload any file or image and convert it into a Base64 string.',
    fields: {
      sourceFile: {label: 'Choose File', helper: 'Images and any file type are supported.'},
      withDataUrl: {label: 'Include Data URL Prefix'},
    },
  },
  'base64-to-file': {
    name: 'Base64 to File',
    summary: 'Restore a Base64 string into a file. Images support preview and download.',
    fields: {
      fileName: {label: 'File Name', placeholder: 'Default: timestamp'},
      extension: {label: 'Extension', placeholder: 'png / txt / bin'},
      mimeType: {label: 'MIME Type', placeholder: 'image/png or text/plain'},
    },
  },
  'crypto-hash': {
    name: 'Text Digest',
    summary: 'Generate SHA-1, SHA-256, SHA-384, or SHA-512 digests.',
    fields: {
      algorithm: {label: 'Algorithm', options: {'SHA-1': 'SHA-1', 'SHA-256': 'SHA-256', 'SHA-384': 'SHA-384', 'SHA-512': 'SHA-512'}},
      outputFormat: {label: 'Output', options: {hex: 'Hex', base64: 'Base64'}},
    },
  },
  'crypto-hmac': {
    name: 'HMAC Signature',
    summary: 'Generate an HMAC signature with SHA-256 or SHA-512.',
    fields: {
      algorithm: {label: 'Algorithm', options: {'SHA-256': 'HMAC-SHA256', 'SHA-512': 'HMAC-SHA512'}},
      secret: {label: 'Secret', placeholder: 'your-secret'},
      outputFormat: {label: 'Output', options: {hex: 'Hex', base64: 'Base64'}},
    },
  },
  'crypto-aes-encrypt': {
    name: 'AES Encrypt',
    summary: 'Encrypt text with AES-GCM and output a JSON payload that can be decrypted later.',
    fields: {secret: {label: 'Password', placeholder: 'strong-password'}},
  },
  'crypto-aes-decrypt': {
    name: 'AES Decrypt',
    summary: 'Decrypt an AES-GCM JSON payload with the same password.',
    fields: {secret: {label: 'Password', placeholder: 'strong-password'}},
  },
  'jwt-encode': {
    name: 'Encode JWT',
    summary: 'Create a JWT from a payload with none or HS256 signing.',
    fields: {
      algorithm: {label: 'Algorithm', options: {none: 'none', HS256: 'HS256'}},
      secret: {label: 'Secret', placeholder: 'Required for HS256'},
      header: {label: 'Header JSON', placeholder: '{"typ":"JWT"}'},
    },
  },
  'json-format': {name: 'Format JSON', summary: 'Format and validate JSON content.'},
  'json-minify': {name: 'Minify JSON', summary: 'Compress JSON into a single line.'},
  'html-encode': {name: 'HTML Encode', summary: 'Escape HTML special characters so they are not rendered directly.'},
  'html-decode': {name: 'HTML Decode', summary: 'Decode HTML entities back into plain text.'},
  'xml-format': {name: 'Format XML', summary: 'Format XML while preserving its node hierarchy.'},
  'xml-minify': {name: 'Minify XML', summary: 'Remove extra whitespace from XML.'},
  'jwt-decode': {name: 'Decode JWT', summary: 'Parse JWT header and payload for quick inspection.'},
  'extract-emails': {name: 'Extract Emails', summary: 'Extract and deduplicate email addresses from text.'},
  'extract-urls': {name: 'Extract URLs', summary: 'Extract every link from raw text, logs, or documents.'},
  'extract-numbers': {name: 'Extract Numbers', summary: 'Extract all numbers and decimals line by line.'},
  'extract-regex': {
    name: 'Regex Extract',
    summary: 'Use a custom regex to extract full matches or the first capture group.',
    fields: {
      pattern: {label: 'Regular Expression', placeholder: 'id=(\\d+)'},
      flags: {label: 'Flags', placeholder: 'gi'},
    },
  },
  'generate-timestamp': {
    name: 'Current Timestamp',
    summary: 'Generate the current timestamp in seconds or milliseconds.',
    fields: {precision: {label: 'Precision', options: {ms: 'Milliseconds', s: 'Seconds'}}},
  },
  'generate-current-iso': {name: 'Current ISO Time', summary: 'Generate the current ISO 8601 time string.'},
  'generate-current-local-time': {name: 'Current Local Time', summary: 'Generate the current local datetime string.'},
  'timestamp-to-iso': {name: 'Timestamp to ISO', summary: 'Convert a 10 or 13 digit timestamp into ISO time.'},
  'timestamp-to-local': {name: 'Timestamp to Local Time', summary: 'Convert a timestamp into local datetime.'},
  'datetime-to-timestamp': {name: 'Datetime to Timestamp', summary: 'Convert an ISO or local datetime into a millisecond timestamp.'},
  'seconds-ms-convert': {name: 'Seconds / Milliseconds', summary: 'Convert a seconds timestamp into milliseconds, or back again.'},
  'timestamp-to-beijing': {name: 'Timestamp to Beijing Time', summary: 'Convert a timestamp into Asia/Shanghai local time.'},
  'timestamp-details': {name: 'Timestamp Details', summary: 'Generate UTC, local time, Beijing time, and seconds/milliseconds in one result.'},
  'date-to-day-range': {
    name: 'Date to Day Range',
    summary: 'Generate start-of-day and end-of-day timestamps for a given date.',
    fields: {precision: {label: 'Precision', options: {ms: 'Milliseconds', s: 'Seconds'}}},
  },
  'generate-username': {name: 'Generate Username', summary: 'Generate a test username.'},
  'generate-email': {name: 'Generate Email', summary: 'Generate a test email address.', fields: {domain: {label: 'Domain', placeholder: 'example.com'}}},
  'generate-phone': {name: 'Generate Phone', summary: 'Generate a mainland China mobile phone number.'},
  'generate-address': {name: 'Generate Address', summary: 'Generate a Chinese address for testing.'},
  'generate-id-card': {name: 'Generate ID Card', summary: 'Generate a mainland China ID card format.'},
  'generate-passport': {name: 'Generate Passport', summary: 'Generate a passport-like identifier for testing.'},
  'generate-license': {name: 'Generate License Number', summary: 'Generate a business license style code for testing.'},
  'generate-uuid': {name: 'Generate UUID', summary: 'Generate a new UUID in the browser.'},
  'csv-to-json': {name: 'CSV to JSON', summary: 'Treat the first row as headers and convert the rest into a JSON array.'},
  'json-to-csv': {name: 'JSON to CSV', summary: 'Convert a JSON array into CSV rows.'},
  'markdown-align': {name: 'Align Markdown Table', summary: 'Reformat a Markdown table into aligned columns.'},
};

const EXACT_MESSAGE_I18N: Record<string, string> = {
  '执行完成。': 'Done.',
  '当前环境不支持 Base64 编码。': 'This environment does not support Base64 encoding.',
  '当前环境不支持 Base64 解码。': 'This environment does not support Base64 decoding.',
  'XML 解析失败，请检查输入内容。': 'XML parsing failed. Please check the input.',
  'JSON 转 CSV 需要数组输入。': 'JSON to CSV requires an array input.',
  '已清理首尾空白。': 'Trimmed leading and trailing whitespace.',
  '已合并多余空格。': 'Collapsed extra spaces.',
  '已删除空行。': 'Removed empty lines.',
  '已转换为标题式大小写。': 'Converted to title case.',
  '已转换为 snake_case。': 'Converted to snake_case.',
  '已转换为 kebab-case。': 'Converted to kebab-case.',
  '已完成按行排序。': 'Sorted lines.',
  '已完成按行去重。': 'Removed duplicate lines.',
  '已完成 URL 编码。': 'Encoded as URL.',
  '已完成 URL 解码。': 'Decoded URL text.',
  '已完成 Base64 编码。': 'Encoded as Base64.',
  '已完成 Base64 解码。': 'Decoded Base64 text.',
  '请先选择要编码的文件。': 'Please choose a file to encode.',
  '请先在编辑区粘贴 Base64 内容。': 'Please paste Base64 content into the editor first.',
  '已完成 AES-GCM 加密。': 'Completed AES-GCM encryption.',
  '已完成 AES-GCM 解密。': 'Completed AES-GCM decryption.',
  '已生成无签名 JWT。': 'Generated an unsigned JWT.',
  '已生成 HS256 JWT。': 'Generated an HS256 JWT.',
  'HS256 模式需要填写密钥。': 'A secret is required for HS256 mode.',
  '已格式化 JSON。': 'Formatted JSON.',
  '已压缩 JSON。': 'Minified JSON.',
  '已完成 HTML 转义。': 'Encoded HTML entities.',
  '已完成 HTML 反转义。': 'Decoded HTML entities.',
  '已格式化 XML。': 'Formatted XML.',
  '已压缩 XML。': 'Minified XML.',
  '请输入完整的 JWT 字符串。': 'Please enter a complete JWT string.',
  '已解码 JWT Header 和 Payload。': 'Decoded JWT header and payload.',
  '没有在编辑区中找到 10 到 13 位时间戳。': 'No 10 to 13 digit timestamp was found in the editor.',
  '已转换为 ISO 时间。': 'Converted to ISO time.',
  '日期解析失败，请输入 ISO 或浏览器可识别的日期。': 'Date parsing failed. Please enter an ISO or browser-recognized date.',
  '已转换为时间戳。': 'Converted to timestamp.',
  '已生成当前时间戳。': 'Generated the current timestamp.',
  '已生成当前 ISO 时间。': 'Generated the current ISO time.',
  '已生成当前本地时间。': 'Generated the current local time.',
  '已转换为本地时间。': 'Converted to local time.',
  '已转换为毫秒时间戳。': 'Converted to a millisecond timestamp.',
  '已转换为秒级时间戳。': 'Converted to a seconds timestamp.',
  '已转换为北京时间。': 'Converted to Beijing time.',
  '已生成时间戳详情。': 'Generated timestamp details.',
  '已生成本日开始和结束时间戳。': 'Generated start and end timestamps for the selected day.',
  '已生成用户名。': 'Generated username.',
  '已生成邮箱。': 'Generated email.',
  '已生成手机号。': 'Generated phone number.',
  '已生成地址。': 'Generated address.',
  '已生成身份证号。': 'Generated ID card number.',
  '已生成护照号。': 'Generated passport number.',
  '已生成执照号。': 'Generated license number.',
  '已生成 UUID。': 'Generated UUID.',
  '已完成 CSV 转 JSON。': 'Converted CSV to JSON.',
  '已完成 JSON 转 CSV。': 'Converted JSON to CSV.',
  '已对齐 Markdown 表格。': 'Aligned the Markdown table.',
  '工具不存在。': 'Tool not found.',
  '工具返回了无效结果。': 'The tool returned an invalid result.',
  '工具执行失败。': 'Tool execution failed.',
  'AES 解密需要包含 salt、iv、cipherText 的 JSON。': 'AES decryption requires JSON with salt, iv, and cipherText.',
  '当前环境不支持 Web Crypto。': 'This environment does not support Web Crypto.',
  'Payload 必须是合法 JSON。': 'Payload must be valid JSON.',
  'Header 必须是合法 JSON。': 'Header must be valid JSON.',
};

const REGEX_MESSAGE_I18N: Array<{pattern: RegExp; format: (...matches: string[]) => string}> = [
  {pattern: /^已替换 (\d+) 处匹配内容。$/, format: (count) => `Replaced ${count} matches.`},
  {pattern: /^已准备好下载文件 (.+)。$/, format: (fileName) => `File ${fileName} is ready to download.`},
  {pattern: /^已将 (.+) 编码为 Base64。$/, format: (name) => `Encoded ${name} as Base64.`},
  {pattern: /^已生成 HMAC-(.+) 签名。$/, format: (algo) => `Generated HMAC-${algo} signature.`},
  {pattern: /^已生成 (SHA-[\d]+) 摘要。$/, format: (algo) => `Generated ${algo} digest.`},
  {pattern: /^已生成图片文件 (.+)$/, format: (name) => `Generated image file ${name}`},
  {pattern: /^已生成文件 (.+)$/, format: (name) => `Generated file ${name}`},
  {pattern: /^已解码图片，支持预览与下载。$/, format: () => 'Decoded image. Preview and download are available.'},
  {pattern: /^已解码文件，支持下载。$/, format: () => 'Decoded file. Download is available.'},
  {pattern: /^已提取 (\d+) 个邮箱。$/, format: (count) => `Extracted ${count} email addresses.`},
  {pattern: /^已提取 (\d+) 个 URL。$/, format: (count) => `Extracted ${count} URLs.`},
  {pattern: /^已提取 (\d+) 个数字。$/, format: (count) => `Extracted ${count} numbers.`},
  {pattern: /^已提取 (\d+) 条正则结果。$/, format: (count) => `Extracted ${count} regex results.`},
];

function localizeTag(tag: string, lang: AppLanguage) {
  return TAG_I18N[tag]?.[lang] ?? tag;
}

function getToolLocale(toolId: string, lang: AppLanguage) {
  if (lang === 'zh') {
    return null;
  }
  return TOOL_EN_LOCALES[toolId] ?? null;
}

export function getLocalizedTool(tool: ToolDefinition, lang: AppLanguage): ToolDefinition {
  const locale = getToolLocale(tool.id, lang);
  const localizedFields = tool.fields.map((field) => {
    const fieldLocale = locale?.fields?.[field.name];

    if (field.type === 'select') {
      return {
        ...field,
        label: fieldLocale?.label ?? field.label,
        options: field.options.map((option) => ({
          ...option,
          label: fieldLocale?.options?.[option.value] ?? option.label,
        })),
      };
    }

    if (field.type === 'file') {
      return {
        ...field,
        label: fieldLocale?.label ?? field.label,
        helper: fieldLocale?.helper ?? field.helper,
      };
    }

    return {
      ...field,
      label: fieldLocale?.label ?? field.label,
      placeholder: fieldLocale?.placeholder ?? ('placeholder' in field ? field.placeholder : undefined),
    };
  });

  return {
    ...tool,
    name: locale?.name ?? tool.name,
    summary: locale?.summary ?? tool.summary,
    tags: (locale?.tags ?? tool.tags).map((tag) => localizeTag(tag, lang)),
    fields: localizedFields,
  };
}

function translateMessage(message: string, lang: AppLanguage) {
  if (lang === 'zh') {
    return message;
  }

  if (EXACT_MESSAGE_I18N[message]) {
    return EXACT_MESSAGE_I18N[message];
  }

  for (const item of REGEX_MESSAGE_I18N) {
    const matched = message.match(item.pattern);
    if (matched) {
      return item.format(...matched.slice(1));
    }
  }

  if (message === '没有匹配到内容，原文保持不变。') {
    return 'No matches found. Original text kept.';
  }

  return message;
}

export function localizeToolResult(result: ToolResult, lang: AppLanguage): ToolResult {
  if (lang === 'zh') {
    return result;
  }

  return {
    ...result,
    message: translateMessage(result.message, lang),
    output: translateMessage(result.output, lang),
  };
}

function buildSearchText(tool: ToolDefinition) {
  const enLocale = TOOL_EN_LOCALES[tool.id];
  const fieldSearch = tool.fields.flatMap((field) => {
    const fieldLocale = enLocale?.fields?.[field.name];
    const values = [field.label];
    if ('placeholder' in field && field.placeholder) {
      values.push(field.placeholder);
    }
    if ('helper' in field && field.helper) {
      values.push(field.helper);
    }
    if (field.type === 'select') {
      values.push(...field.options.map((option) => option.label));
    }
    if (fieldLocale?.label) {
      values.push(fieldLocale.label);
    }
    if (fieldLocale?.placeholder) {
      values.push(fieldLocale.placeholder);
    }
    if (fieldLocale?.helper) {
      values.push(fieldLocale.helper);
    }
    if (fieldLocale?.options) {
      values.push(...Object.values(fieldLocale.options));
    }
    return values;
  });

  return [
    tool.name,
    tool.summary,
    ...tool.tags,
    enLocale?.name,
    enLocale?.summary,
    ...(enLocale?.tags ?? []),
    ...fieldSearch,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function successResult(options: Partial<ToolResult> = {}): ToolResult {
  return {
    ok: true,
    output: options.output ?? '',
    mode: options.mode ?? 'result',
    message: options.message ?? '执行完成。',
    meta: options.meta ?? {},
    download: options.download ?? null,
    preview: options.preview ?? null,
  };
}

function errorResult(message: string, meta: Record<string, number | string> = {}): ToolResult {
  return {
    ok: false,
    output: '',
    mode: 'result',
    message,
    meta,
    download: null,
    preview: null,
  };
}

function ensureText(value: unknown) {
  return String(value ?? '');
}

function getUploadedAsset(value: ToolFieldValue): UploadedAsset | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  if ('dataUrl' in value && 'content' in value && 'name' in value && 'mimeType' in value) {
    return value as UploadedAsset;
  }

  return null;
}

function buildTimestampName() {
  const date = new Date();
  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
    '-',
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0'),
  ];
  return parts.join('');
}

function toSnake(text: string) {
  return ensureText(text)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .replace(/[^\w\u4e00-\u9fa5]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

function uniqueMatches(pattern: RegExp, text: string) {
  return [...new Set(ensureText(text).match(pattern) ?? [])].join('\n');
}

function lineList(text: string) {
  return ensureText(text).split(/\r?\n/);
}

function countLines(text: string) {
  if (!text.trim()) {
    return 0;
  }
  return text.split(/\r?\n/).length;
}

function htmlEncode(text: string) {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return ensureText(text).replace(/[&<>"']/g, (char) => map[char]);
}

function htmlDecode(text: string) {
  if (typeof document === 'undefined') {
    return ensureText(text)
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'")
      .replaceAll('&amp;', '&');
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function unicodeToBase64(text: string) {
  const source = ensureText(text);
  if (typeof globalThis.btoa === 'function') {
    const bytes = new TextEncoder().encode(source);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return globalThis.btoa(binary);
  }

    throw new Error('当前环境不支持 Base64 编码。');
}

function base64ToUnicode(text: string) {
  const source = ensureText(text).trim();
  if (typeof globalThis.atob !== 'function') {
    throw new Error('当前环境不支持 Base64 解码。');
  }

  const binary = globalThis.atob(source);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function base64UrlToUnicode(text: string) {
  const normalized = ensureText(text).replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return base64ToUnicode(padded);
}

function unicodeToBase64Url(text: string) {
  return unicodeToBase64(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return globalThis.btoa(binary);
}

function base64ToBytes(text: string) {
  const binary = globalThis.atob(text);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function base64ToBase64Url(text: string) {
  return ensureText(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function formatDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function toTimestampNumber(input: string) {
  const matched = ensureText(input).trim().match(/\d{10,13}/);
  if (!matched) {
    throw new Error('没有在编辑区中找到 10 到 13 位时间戳。');
  }
  const raw = matched[0];
  return raw.length === 10 ? Number(raw) * 1000 : Number(raw);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: T[]) {
  return items[randomInt(0, items.length - 1)];
}

function randomDigits(length: number) {
  return Array.from({length}, () => String(randomInt(0, 9))).join('');
}

function generateChineseIdCard() {
  const regions = ['110101', '310101', '440106', '440303', '330106', '510107'];
  const start = new Date(1970, 0, 1).getTime();
  const end = new Date(2004, 11, 31).getTime();
  const birth = new Date(randomInt(start, end));
  const birthText = `${birth.getFullYear()}${String(birth.getMonth() + 1).padStart(2, '0')}${String(birth.getDate()).padStart(2, '0')}`;
  const seq = `${randomInt(100, 299)}`;
  const body = `${randomItem(regions)}${birthText}${seq}`;
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checks = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  const sum = body
    .split('')
    .reduce((total, char, index) => total + Number(char) * weights[index], 0);
  return `${body}${checks[sum % 11]}`;
}

function generateMockAddress() {
  const cities = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '成都市'];
  const districts = ['朝阳区', '浦东新区', '天河区', '南山区', '西湖区', '武侯区'];
  const roads = ['海棠路', '科技大道', '创新路', '云栖路', '中山路', '和平路'];
  return `${randomItem(cities)}${randomItem(districts)}${randomItem(roads)}${randomInt(8, 399)}号`;
}

function parseJsonRecord(text: string, fallback: Record<string, unknown>, errorMessage: string) {
  const source = ensureText(text).trim();
  if (!source) {
    return fallback;
  }

  const parsed = JSON.parse(source);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(errorMessage);
  }

  return parsed as Record<string, unknown>;
}

function ensureSubtleCrypto() {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('当前环境不支持 Web Crypto。');
  }
  return subtle;
}

async function digestText(algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', text: string) {
  const subtle = ensureSubtleCrypto();
  const bytes = new TextEncoder().encode(ensureText(text));
  const digest = await subtle.digest(algorithm, bytes);
  return new Uint8Array(digest);
}

async function signHmac(
  algorithm: 'SHA-256' | 'SHA-512',
  secret: string,
  text: string,
) {
  const subtle = ensureSubtleCrypto();
  const key = await subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {name: 'HMAC', hash: {name: algorithm}},
    false,
    ['sign'],
  );
  const signature = await subtle.sign('HMAC', key, new TextEncoder().encode(text));
  return new Uint8Array(signature);
}

async function deriveAesKey(secret: string, salt: Uint8Array, usages: KeyUsage[]) {
  const subtle = ensureSubtleCrypto();
  const keyMaterial = await subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 120000,
      hash: 'SHA-256',
    },
    keyMaterial,
    {name: 'AES-GCM', length: 256},
    false,
    usages,
  );
}

async function encryptAesGcm(secret: string, plainText: string) {
  const subtle = ensureSubtleCrypto();
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(secret, salt, ['encrypt']);
  const cipher = await subtle.encrypt(
    {name: 'AES-GCM', iv},
    key,
    new TextEncoder().encode(plainText),
  );
  return {
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    cipherText: bytesToBase64(new Uint8Array(cipher)),
  };
}

async function decryptAesGcm(secret: string, payloadText: string) {
  const subtle = ensureSubtleCrypto();
  const payload = JSON.parse(ensureText(payloadText));
  if (!payload?.salt || !payload?.iv || !payload?.cipherText) {
    throw new Error('AES 解密需要包含 salt、iv、cipherText 的 JSON。');
  }
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const cipherText = base64ToBytes(payload.cipherText);
  const key = await deriveAesKey(secret, salt, ['decrypt']);
  const plain = await subtle.decrypt({name: 'AES-GCM', iv}, key, cipherText);
  return new TextDecoder().decode(plain);
}

function parseXml(xml: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('XML 解析失败，请检查输入内容。');
  }
  return doc;
}

function formatXml(xml: string) {
  const doc = parseXml(xml);
  const indent = '  ';

  const formatNode = (node: Node, depth: number): string => {
    const pad = indent.repeat(depth);
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const attrs = Array.from(element.attributes)
        .map((attribute) => ` ${attribute.name}="${attribute.value.replace(/"/g, '&quot;')}"`)
        .join('');
      const children = Array.from(element.childNodes).filter((child) => {
        return !(child.nodeType === Node.TEXT_NODE && !(child.nodeValue ?? '').trim());
      });

      if (!children.length) {
        return `${pad}<${element.nodeName}${attrs}/>`;
      }

      if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
        return `${pad}<${element.nodeName}${attrs}>${children[0].nodeValue?.trim() ?? ''}</${element.nodeName}>`;
      }

      const inner = children.map((child) => formatNode(child, depth + 1)).join('\n');
      return `${pad}<${element.nodeName}${attrs}>\n${inner}\n${pad}</${element.nodeName}>`;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.nodeValue?.trim() ?? '';
      return value ? `${pad}${value}` : '';
    }

    if (node.nodeType === Node.DOCUMENT_NODE) {
      return Array.from(node.childNodes)
        .map((child) => formatNode(child, depth))
        .filter(Boolean)
        .join('\n');
    }

    return '';
  };

  return formatNode(doc, 0).trim();
}

function minifyXml(xml: string) {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(parseXml(xml)).replace(/>\s+</g, '><').trim();
}

function csvSplitLine(line: string) {
  const output: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === ',' && !quoted) {
      output.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  output.push(current);
  return output;
}

function csvToJson(csvText: string) {
  const lines = ensureText(csvText)
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (!lines.length) {
    return '[]';
  }

  const headers = csvSplitLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const columns = csvSplitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = columns[index] ?? '';
    });
    return row;
  });

  return JSON.stringify(rows, null, 2);
}

function jsonToCsv(jsonText: string) {
  const parsed = JSON.parse(ensureText(jsonText));
  if (!Array.isArray(parsed)) {
    throw new Error('JSON 转 CSV 需要数组输入。');
  }
  if (!parsed.length) {
    return '';
  }

  const headers = Object.keys(parsed[0]);
  const escapeCell = (value: unknown) => {
    const output = ensureText(value);
    return /[",\n]/.test(output) ? `"${output.replace(/"/g, '""')}"` : output;
  };

  const lines = [headers.join(',')];
  parsed.forEach((row) => {
    lines.push(headers.map((header) => escapeCell(row[header])).join(','));
  });
  return lines.join('\n');
}

function alignMarkdownTable(text: string) {
  const lines = ensureText(text)
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2 || !lines[1].includes('|')) {
    return ensureText(text);
  }

  const rows = lines.map((line) =>
    line
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((cell) => cell.trim()),
  );
  const widthCount = Math.max(...rows.map((row) => row.length));
  const widths = Array(widthCount).fill(3);

  rows.forEach((row) => {
    row.forEach((cell, index) => {
      widths[index] = Math.max(widths[index], cell.length);
    });
  });

  return rows
    .map((row, rowIndex) => {
      const columns = Array.from({length: widthCount}, (_, index) => {
        return ensureText(row[index] ?? '').padEnd(widths[index], ' ');
      });

      if (rowIndex === 1) {
        return `| ${widths.map((width) => '-'.repeat(Math.max(width, 3))).join(' | ')} |`;
      }

      return `| ${columns.join(' | ')} |`;
    })
    .join('\n');
}

function extractByRegex(text: string, pattern: string, flags: string) {
  const expression = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
  return [...ensureText(text).matchAll(expression)].map((match) => match[1] ?? match[0]).join('\n');
}

export const TOOLS: ToolDefinition[] = [
  {
    id: 'replace-text',
    name: '查找替换',
    summary: '支持普通文本或正则替换，并返回清晰的替换次数。',
    group: 'text',
    kind: 'transform',
    level: 'core',
    color: 'primary',
    icon: TextCursorInput,
    tags: ['regex', 'replace', 'cleanup'],
    featured: true,
    fields: [
      {name: 'find', label: '查找内容', type: 'text', placeholder: 'foo', required: true},
      {name: 'replace', label: '替换为', type: 'text', placeholder: 'bar'},
      {name: 'regex', label: '按正则处理', type: 'checkbox', defaultValue: false},
      {name: 'caseSensitive', label: '区分大小写', type: 'checkbox', defaultValue: false},
    ],
    run({input, fields}) {
      const source = ensureText(input);
      const flags = fields.caseSensitive ? 'g' : 'gi';
      const find = ensureText(fields.find);
      const pattern = fields.regex
        ? new RegExp(find, flags)
        : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const matches = source.match(pattern) ?? [];
      return successResult({
        output: source.replace(pattern, ensureText(fields.replace)),
        mode: 'replace',
        message: matches.length ? `已替换 ${matches.length} 处匹配内容。` : '没有匹配到内容，原文保持不变。',
        meta: {count: matches.length},
      });
    },
  },
  {
    id: 'trim-text',
    name: '去首尾空白',
    summary: '去掉整段输入前后的空格和空行。',
    group: 'text',
    kind: 'transform',
    level: 'core',
    color: 'primary',
    icon: Sparkles,
    tags: ['trim', 'whitespace'],
    fields: [],
    run({input}) {
      return successResult({
        output: ensureText(input).trim(),
        mode: 'replace',
        message: '已清理首尾空白。',
      });
    },
  },
  {
    id: 'collapse-spaces',
    name: '合并多余空格',
    summary: '把重复空格和制表符压缩成一个空格。',
    group: 'text',
    kind: 'transform',
    level: 'core',
    color: 'primary',
    icon: FileText,
    tags: ['space', 'tabs'],
    fields: [],
    run({input}) {
      return successResult({
        output: ensureText(input).replace(/[ \t]+/g, ' '),
        mode: 'replace',
        message: '已合并多余空格。',
      });
    },
  },
  {
    id: 'remove-empty-lines',
    name: '删除空行',
    summary: '移除空白行，同时保持剩余内容的原始顺序。',
    group: 'text',
    kind: 'transform',
    level: 'core',
    color: 'primary',
    icon: Waypoints,
    tags: ['lines', 'blank'],
    fields: [],
    run({input}) {
      return successResult({
        output: lineList(input).filter((line) => line.trim()).join('\n'),
        mode: 'replace',
        message: '已删除空行。',
      });
    },
  },
  {
    id: 'title-case',
    name: '标题式大小写',
    summary: '把英文标题规范成 Title Case。',
    group: 'text',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: CaseSensitive,
    tags: ['case', 'english'],
    fields: [],
    run({input}) {
      return successResult({
        output: ensureText(input).toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
        mode: 'replace',
        message: '已转换为标题式大小写。',
      });
    },
  },
  {
    id: 'snake-case',
    name: 'snake_case',
    summary: '把标签、标题或变量名转换成 snake_case。',
    group: 'text',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: Braces,
    tags: ['slug', 'variable'],
    fields: [],
    run({input}) {
      return successResult({
        output: toSnake(input),
        mode: 'replace',
        message: '已转换为 snake_case。',
      });
    },
  },
  {
    id: 'kebab-case',
    name: 'kebab-case',
    summary: '把标题和标识符转换成 kebab-case，适合 URL 和 class 名。',
    group: 'text',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: Globe,
    tags: ['slug', 'url'],
    fields: [],
    run({input}) {
      return successResult({
        output: toSnake(input).replace(/_/g, '-'),
        mode: 'replace',
        message: '已转换为 kebab-case。',
      });
    },
  },
  {
    id: 'sort-lines',
    name: '按行排序',
    summary: '对行列表进行正序或倒序排序。',
    group: 'text',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: Waypoints,
    tags: ['lines', 'sort'],
    fields: [
      {
        name: 'direction',
        label: '排序方向',
        type: 'select',
        defaultValue: 'asc',
        options: [
          {label: 'A 到 Z', value: 'asc'},
          {label: 'Z 到 A', value: 'desc'},
        ],
      },
    ],
    run({input, fields}) {
      const output = lineList(input)
        .sort((left, right) => {
          return fields.direction === 'desc'
            ? right.localeCompare(left, 'zh')
            : left.localeCompare(right, 'zh');
        })
        .join('\n');
      return successResult({
        output,
        mode: 'replace',
        message: '已完成按行排序。',
      });
    },
  },
  {
    id: 'unique-lines',
    name: '按行去重',
    summary: '删除重复行，并保留第一次出现的顺序。',
    group: 'text',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: FileSearch,
    tags: ['lines', 'dedupe'],
    fields: [],
    run({input}) {
      return successResult({
        output: [...new Set(lineList(input))].join('\n'),
        mode: 'replace',
        message: '已完成按行去重。',
      });
    },
  },
  {
    id: 'export-text-file',
    name: '导出为文件',
    summary: '把当前编辑区文本打包成文件并直接在结果区提供下载。',
    group: 'text',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: FileText,
    tags: ['download', 'file', 'text'],
    fields: [
      {name: 'fileName', label: '文件名', type: 'text', placeholder: '默认使用当前时间戳'},
      {name: 'extension', label: '后缀', type: 'text', placeholder: 'txt', defaultValue: 'txt'},
    ],
    run({input, fields}) {
      const rawName = ensureText(fields.fileName).trim() || buildTimestampName();
      const extension = ensureText(fields.extension).trim() || 'txt';
      const fileName = `${rawName}.${extension.replace(/^\./, '')}`;
      return successResult({
        output: ensureText(input),
        message: `已准备好下载文件 ${fileName}。`,
        download: {
          fileName,
          mimeType: 'text/plain;charset=utf-8',
          content: ensureText(input),
        },
      });
    },
  },
  {
    id: 'url-encode',
    name: 'URL Encode',
    summary: '把字符串编码成可安全放入 URL 参数的形式。',
    group: 'encode',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: Globe,
    tags: ['url', 'encode'],
    fields: [],
    run({input}) {
      return successResult({
        output: encodeURIComponent(ensureText(input)),
        mode: 'replace',
        message: '已完成 URL 编码。',
      });
    },
  },
  {
    id: 'url-decode',
    name: 'URL Decode',
    summary: '把 URL 编码内容还原成普通文本。',
    group: 'encode',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: Globe,
    tags: ['url', 'decode'],
    fields: [],
    run({input}) {
      return successResult({
        output: decodeURIComponent(ensureText(input)),
        mode: 'replace',
        message: '已完成 URL 解码。',
      });
    },
  },
  {
    id: 'base64-encode',
    name: 'Base64 Encode',
    summary: '把 Unicode 文本编码成 Base64。',
    group: 'encode',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: Fingerprint,
    tags: ['base64', 'encode'],
    fields: [],
    run({input}) {
      return successResult({
        output: unicodeToBase64(input),
        mode: 'replace',
        message: '已完成 Base64 编码。',
      });
    },
  },
  {
    id: 'base64-decode',
    name: 'Base64 Decode',
    summary: '把 Base64 解码成可读文本。',
    group: 'encode',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: Fingerprint,
    tags: ['base64', 'decode'],
    fields: [],
    run({input}) {
      return successResult({
        output: base64ToUnicode(input),
        mode: 'replace',
        message: '已完成 Base64 解码。',
      });
    },
  },
  {
    id: 'file-to-base64',
    name: '文件/图片转 Base64',
    summary: '上传任意文件或图片，直接转换成 Base64 字符串。',
    group: 'encode',
    kind: 'generate',
    level: 'core',
    color: 'secondary',
    icon: Fingerprint,
    tags: ['file', 'image', 'encode'],
    fields: [
      {name: 'sourceFile', label: '选择文件', type: 'file', accept: '*/*', required: true, helper: '支持图片和任意文件。'},
      {name: 'withDataUrl', label: '包含 Data URL 头', type: 'checkbox', defaultValue: false},
    ],
    run({fields}) {
      const asset = getUploadedAsset(fields.sourceFile);
      if (!asset) {
        return errorResult('请先选择要编码的文件。');
      }

      return successResult({
        output: fields.withDataUrl ? asset.dataUrl : asset.content,
        message: `已将 ${asset.name} 编码为 Base64。`,
        meta: {
          size: asset.size,
        },
      });
    },
  },
  {
    id: 'base64-to-file',
    name: 'Base64 解码为文件',
    summary: '把 Base64 字符串还原成文件，图片会在结果区显示预览并支持下载。',
    group: 'encode',
    kind: 'generate',
    level: 'core',
    color: 'secondary',
    icon: Fingerprint,
    tags: ['file', 'image', 'decode'],
    fields: [
      {name: 'fileName', label: '文件名', type: 'text', placeholder: '默认使用当前时间戳'},
      {name: 'extension', label: '后缀', type: 'text', placeholder: 'png / txt / bin', defaultValue: 'txt'},
      {name: 'mimeType', label: 'MIME 类型', type: 'text', placeholder: 'image/png 或 text/plain'},
    ],
    run({input, fields}) {
      const source = ensureText(input).trim();
      if (!source) {
        return errorResult('请先在编辑区粘贴 Base64 内容。');
      }

      const rawName = ensureText(fields.fileName).trim() || buildTimestampName();
      const extension = (ensureText(fields.extension).trim() || 'txt').replace(/^\./, '');
      const explicitMime = ensureText(fields.mimeType).trim();
      let mimeType = explicitMime || 'application/octet-stream';
      let base64Content = source;
      let dataUrl = '';

      if (source.startsWith('data:')) {
        const [header, body] = source.split(',', 2);
        base64Content = body ?? '';
        const matchedMime = header.match(/^data:([^;]+);base64$/);
        if (matchedMime?.[1]) {
          mimeType = matchedMime[1];
        }
        dataUrl = source;
      } else {
        if (!explicitMime) {
          if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension.toLowerCase())) {
            mimeType = extension.toLowerCase() === 'svg' ? 'image/svg+xml' : `image/${extension.toLowerCase() === 'jpg' ? 'jpeg' : extension.toLowerCase()}`;
          } else if (extension.toLowerCase() === 'txt') {
            mimeType = 'text/plain;charset=utf-8';
          }
        }
        dataUrl = `data:${mimeType};base64,${base64Content}`;
      }

      const fileName = `${rawName}.${extension}`;
      const isImage = mimeType.startsWith('image/');

      return successResult({
        output: isImage ? `已生成图片文件 ${fileName}` : `已生成文件 ${fileName}`,
        message: isImage ? `已解码图片，支持预览与下载。` : `已解码文件，支持下载。`,
        download: {
          fileName,
          mimeType,
          content: base64Content,
          dataUrl,
        },
        preview: isImage
          ? {
              type: 'image',
              src: dataUrl,
            }
          : null,
      });
    },
  },
  {
    id: 'json-format',
    name: 'JSON 格式化',
    summary: '格式化并校验 JSON 内容。',
    group: 'json',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: Braces,
    tags: ['json', 'pretty'],
    featured: true,
    fields: [],
    run({input}) {
      return successResult({
        output: JSON.stringify(JSON.parse(ensureText(input)), null, 2),
        mode: 'replace',
        message: '已格式化 JSON。',
      });
    },
  },
  {
    id: 'json-minify',
    name: 'JSON 压缩',
    summary: '把 JSON 压缩成单行。',
    group: 'json',
    kind: 'transform',
    level: 'expert',
    color: 'secondary',
    icon: Braces,
    tags: ['json', 'minify'],
    fields: [],
    run({input}) {
      return successResult({
        output: JSON.stringify(JSON.parse(ensureText(input))),
        mode: 'replace',
        message: '已压缩 JSON。',
      });
    },
  },
  {
    id: 'html-encode',
    name: 'HTML Encode',
    summary: '把 HTML 特殊字符转义，避免被直接渲染。',
    group: 'data',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: FileText,
    tags: ['html', 'escape'],
    fields: [],
    run({input}) {
      return successResult({
        output: htmlEncode(input),
        mode: 'replace',
        message: '已完成 HTML 转义。',
      });
    },
  },
  {
    id: 'html-decode',
    name: 'HTML Decode',
    summary: '把 HTML 实体恢复成普通文本。',
    group: 'data',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: FileText,
    tags: ['html', 'decode'],
    fields: [],
    run({input}) {
      return successResult({
        output: htmlDecode(input),
        mode: 'replace',
        message: '已完成 HTML 反转义。',
      });
    },
  },
  {
    id: 'xml-format',
    name: 'XML 格式化',
    summary: '格式化 XML 并保留节点层级。',
    group: 'data',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: Braces,
    tags: ['xml', 'pretty'],
    fields: [],
    run({input}) {
      return successResult({
        output: formatXml(input),
        mode: 'replace',
        message: '已格式化 XML。',
      });
    },
  },
  {
    id: 'xml-minify',
    name: 'XML 压缩',
    summary: '去掉 XML 的多余空白。',
    group: 'data',
    kind: 'transform',
    level: 'expert',
    color: 'secondary',
    icon: Braces,
    tags: ['xml', 'minify'],
    fields: [],
    run({input}) {
      return successResult({
        output: minifyXml(input),
        mode: 'replace',
        message: '已压缩 XML。',
      });
    },
  },
  {
    id: 'crypto-hash',
    name: '文本摘要',
    summary: '生成 SHA-1、SHA-256、SHA-384、SHA-512 等常见摘要值。',
    group: 'crypto',
    kind: 'generate',
    level: 'core',
    color: 'secondary',
    icon: ShieldCheck,
    tags: ['hash', 'sha'],
    fields: [
      {
        name: 'algorithm',
        label: '算法',
        type: 'select',
        defaultValue: 'SHA-256',
        options: [
          {label: 'SHA-1', value: 'SHA-1'},
          {label: 'SHA-256', value: 'SHA-256'},
          {label: 'SHA-384', value: 'SHA-384'},
          {label: 'SHA-512', value: 'SHA-512'},
        ],
      },
      {
        name: 'outputFormat',
        label: '输出格式',
        type: 'select',
        defaultValue: 'hex',
        options: [
          {label: 'Hex', value: 'hex'},
          {label: 'Base64', value: 'base64'},
        ],
      },
    ],
    async run({input, fields}) {
      const digest = await digestText(fields.algorithm as 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', input);
      return successResult({
        output: fields.outputFormat === 'base64' ? bytesToBase64(digest) : bytesToHex(digest),
        message: `已生成 ${fields.algorithm} 摘要。`,
      });
    },
  },
  {
    id: 'crypto-hmac',
    name: 'HMAC 签名',
    summary: '使用密钥对文本生成 HMAC-SHA256 或 HMAC-SHA512 签名。',
    group: 'crypto',
    kind: 'generate',
    level: 'core',
    color: 'secondary',
    icon: ShieldCheck,
    tags: ['hmac', 'signature'],
    fields: [
      {
        name: 'algorithm',
        label: '算法',
        type: 'select',
        defaultValue: 'SHA-256',
        options: [
          {label: 'HMAC-SHA256', value: 'SHA-256'},
          {label: 'HMAC-SHA512', value: 'SHA-512'},
        ],
      },
      {name: 'secret', label: '密钥', type: 'text', placeholder: 'your-secret', required: true},
      {
        name: 'outputFormat',
        label: '输出格式',
        type: 'select',
        defaultValue: 'hex',
        options: [
          {label: 'Hex', value: 'hex'},
          {label: 'Base64', value: 'base64'},
        ],
      },
    ],
    async run({input, fields}) {
      const signature = await signHmac(fields.algorithm as 'SHA-256' | 'SHA-512', ensureText(fields.secret), input);
      return successResult({
        output: fields.outputFormat === 'base64' ? bytesToBase64(signature) : bytesToHex(signature),
        message: `已生成 HMAC-${fields.algorithm} 签名。`,
      });
    },
  },
  {
    id: 'crypto-aes-encrypt',
    name: 'AES 加密',
    summary: '使用口令对文本执行 AES-GCM 加密，输出可直接用于解密的 JSON。',
    group: 'crypto',
    kind: 'generate',
    level: 'core',
    color: 'secondary',
    icon: ShieldCheck,
    tags: ['aes', 'encrypt'],
    fields: [{name: 'secret', label: '口令', type: 'text', placeholder: 'strong-password', required: true}],
    async run({input, fields}) {
      const payload = await encryptAesGcm(ensureText(fields.secret), ensureText(input));
      return successResult({
        output: JSON.stringify(payload, null, 2),
        message: '已完成 AES-GCM 加密。',
      });
    },
  },
  {
    id: 'crypto-aes-decrypt',
    name: 'AES 解密',
    summary: '输入由 AES 加密工具生成的 JSON，并使用同一口令还原原文。',
    group: 'crypto',
    kind: 'transform',
    level: 'core',
    color: 'secondary',
    icon: ShieldCheck,
    tags: ['aes', 'decrypt'],
    fields: [{name: 'secret', label: '口令', type: 'text', placeholder: 'strong-password', required: true}],
    async run({input, fields}) {
      return successResult({
        output: await decryptAesGcm(ensureText(fields.secret), input),
        mode: 'replace',
        message: '已完成 AES-GCM 解密。',
      });
    },
  },
  {
    id: 'jwt-encode',
    name: 'JWT 编码',
    summary: '根据 Payload 生成 JWT，支持无签名或 HS256 签名。',
    group: 'jwt',
    kind: 'generate',
    level: 'core',
    color: 'tertiary',
    icon: ShieldCheck,
    tags: ['jwt', 'encode', 'token'],
    fields: [
      {
        name: 'algorithm',
        label: '算法',
        type: 'select',
        defaultValue: 'none',
        options: [
          {label: 'none', value: 'none'},
          {label: 'HS256', value: 'HS256'},
        ],
      },
      {name: 'secret', label: '密钥', type: 'text', placeholder: 'HS256 时必填'},
      {name: 'header', label: 'Header JSON', type: 'text', placeholder: '{"typ":"JWT"}'},
    ],
    async run({input, fields}) {
      const algorithm = ensureText(fields.algorithm) || 'none';
      const payload = parseJsonRecord(input, {}, 'Payload 必须是合法 JSON。');
      const header = parseJsonRecord(ensureText(fields.header), {typ: 'JWT'}, 'Header 必须是合法 JSON。');
      const finalHeader = {...header, alg: algorithm, typ: 'JWT'};
      const unsignedToken = `${unicodeToBase64Url(JSON.stringify(finalHeader))}.${unicodeToBase64Url(JSON.stringify(payload))}`;

      if (algorithm === 'none') {
        return successResult({
          output: `${unsignedToken}.`,
          message: '已生成无签名 JWT。',
        });
      }

      const secret = ensureText(fields.secret);
      if (!secret.trim()) {
        return errorResult('HS256 模式需要填写密钥。');
      }

      const signature = await signHmac('SHA-256', secret, unsignedToken);
      return successResult({
        output: `${unsignedToken}.${base64ToBase64Url(bytesToBase64(signature))}`,
        message: '已生成 HS256 JWT。',
      });
    },
  },
  {
    id: 'jwt-decode',
    name: 'JWT 解码',
    summary: '解析 JWT 的 Header 和 Payload，方便快速检查声明内容。',
    group: 'jwt',
    kind: 'extract',
    level: 'core',
    color: 'tertiary',
    icon: ShieldCheck,
    tags: ['jwt', 'token', 'payload'],
    featured: true,
    fields: [],
    run({input}) {
      const token = ensureText(input).trim();
      const parts = token.split('.');
      if (parts.length < 2) {
        return errorResult('请输入完整的 JWT 字符串。');
      }

      const header = JSON.parse(base64UrlToUnicode(parts[0]));
      const payload = JSON.parse(base64UrlToUnicode(parts[1]));
      return successResult({
        output: JSON.stringify({header, payload}, null, 2),
        message: '已解码 JWT Header 和 Payload。',
      });
    },
  },
  {
    id: 'extract-emails',
    name: '提取邮箱',
    summary: '从文本里提取并去重邮箱地址。',
    group: 'extract',
    kind: 'extract',
    level: 'core',
    color: 'tertiary',
    icon: ScanSearch,
    tags: ['email', 'regex'],
    fields: [],
    run({input}) {
      const output = uniqueMatches(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, input);
      return successResult({
        output,
        message: `已提取 ${countLines(output)} 个邮箱。`,
        meta: {count: countLines(output)},
      });
    },
  },
  {
    id: 'extract-urls',
    name: '提取 URL',
    summary: '从原始文本、日志或文档里提取全部链接。',
    group: 'extract',
    kind: 'extract',
    level: 'core',
    color: 'tertiary',
    icon: Globe,
    tags: ['url', 'links'],
    featured: true,
    fields: [],
    run({input}) {
      const output = uniqueMatches(/https?:\/\/[^\s"'<>]+/g, input);
      return successResult({
        output,
        message: `已提取 ${countLines(output)} 个 URL。`,
        meta: {count: countLines(output)},
      });
    },
  },
  {
    id: 'extract-numbers',
    name: '提取数字',
    summary: '把所有数字或小数按行提取出来。',
    group: 'extract',
    kind: 'extract',
    level: 'core',
    color: 'tertiary',
    icon: ScanSearch,
    tags: ['numbers', 'metrics'],
    fields: [],
    run({input}) {
      const output = (ensureText(input).match(/\d+(?:\.\d+)?/g) ?? []).join('\n');
      return successResult({
        output,
        message: `已提取 ${countLines(output)} 个数字。`,
        meta: {count: countLines(output)},
      });
    },
  },
  {
    id: 'extract-regex',
    name: '正则提取',
    summary: '使用自定义正则提取完整匹配或第一捕获组。',
    group: 'extract',
    kind: 'extract',
    level: 'expert',
    color: 'tertiary',
    icon: ScanSearch,
    tags: ['regex', 'capture'],
    fields: [
      {name: 'pattern', label: '正则表达式', type: 'text', placeholder: 'id=(\\d+)', required: true},
      {name: 'flags', label: 'Flags', type: 'text', placeholder: 'gi', defaultValue: 'g'},
    ],
    run({input, fields}) {
      const output = extractByRegex(input, ensureText(fields.pattern), ensureText(fields.flags || 'g'));
      return successResult({
        output,
        message: `已提取 ${countLines(output)} 条正则结果。`,
        meta: {count: countLines(output)},
      });
    },
  },
  {
    id: 'generate-timestamp',
    name: '当前时间戳',
    summary: '生成当前秒级或毫秒级时间戳。',
    group: 'timestamp',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Sparkles,
    tags: ['time', 'timestamp'],
    fields: [
      {
        name: 'precision',
        label: '精度',
        type: 'select',
        defaultValue: 'ms',
        options: [
          {label: '毫秒', value: 'ms'},
          {label: '秒', value: 's'},
        ],
      },
    ],
    run({fields}) {
      const now = Date.now();
      return successResult({
        output: fields.precision === 's' ? String(Math.floor(now / 1000)) : String(now),
        message: '已生成当前时间戳。',
      });
    },
  },
  {
    id: 'generate-current-iso',
    name: '当前 ISO 时间',
    summary: '生成当前时刻的 ISO 8601 时间字符串。',
    group: 'timestamp',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Sparkles,
    tags: ['time', 'iso'],
    fields: [],
    run() {
      return successResult({
        output: new Date().toISOString(),
        message: '已生成当前 ISO 时间。',
      });
    },
  },
  {
    id: 'generate-current-local-time',
    name: '当前本地时间',
    summary: '生成当前本地日期时间，适合直接拷贝到日志或测试数据。',
    group: 'timestamp',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Sparkles,
    tags: ['time', 'local'],
    fields: [],
    run() {
      return successResult({
        output: formatDateTime(new Date()),
        message: '已生成当前本地时间。',
      });
    },
  },
  {
    id: 'timestamp-to-iso',
    name: '时间戳转 ISO',
    summary: '把 10 位或 13 位时间戳转换成 ISO 时间。',
    group: 'timestamp',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Sparkles,
    tags: ['timestamp', 'iso'],
    fields: [],
    run({input}) {
      return successResult({
        output: new Date(toTimestampNumber(input)).toISOString(),
        message: '已转换为 ISO 时间。',
      });
    },
  },
  {
    id: 'timestamp-to-local',
    name: '时间戳转本地时间',
    summary: '把 10 位或 13 位时间戳转换成本地日期时间。',
    group: 'timestamp',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Sparkles,
    tags: ['timestamp', 'local'],
    fields: [],
    run({input}) {
      return successResult({
        output: formatDateTime(new Date(toTimestampNumber(input))),
        message: '已转换为本地时间。',
      });
    },
  },
  {
    id: 'datetime-to-timestamp',
    name: '日期转时间戳',
    summary: '把 ISO 或浏览器可识别的日期字符串转换成毫秒时间戳。',
    group: 'timestamp',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Sparkles,
    tags: ['iso', 'timestamp'],
    fields: [],
    run({input}) {
      const value = new Date(ensureText(input).trim()).getTime();
      if (Number.isNaN(value)) {
        return errorResult('日期解析失败，请输入 ISO 或浏览器可识别的日期。');
      }

      return successResult({
        output: String(value),
        message: '已转换为时间戳。',
      });
    },
  },
  {
    id: 'seconds-ms-convert',
    name: '秒毫秒互转',
    summary: '自动识别 10 位秒级或 13 位毫秒级时间戳，并转换为另一种单位。',
    group: 'timestamp',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Sparkles,
    tags: ['timestamp', 'convert'],
    fields: [],
    run({input}) {
      const raw = ensureText(input).trim().match(/\d{10,13}/)?.[0];
      if (!raw) {
        return errorResult('没有在编辑区中找到 10 到 13 位时间戳。');
      }
      return successResult({
        output: raw.length === 10 ? String(Number(raw) * 1000) : String(Math.floor(Number(raw) / 1000)),
        message: raw.length === 10 ? '已转换为毫秒时间戳。' : '已转换为秒级时间戳。',
      });
    },
  },
  {
    id: 'timestamp-to-beijing',
    name: '时间戳转北京时间',
    summary: '把时间戳转换成北京时间（Asia/Shanghai）。',
    group: 'timestamp',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Sparkles,
    tags: ['timestamp', 'beijing'],
    fields: [],
    run({input}) {
      const date = new Date(toTimestampNumber(input));
      return successResult({
        output: date.toLocaleString('zh-CN', {
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
        message: '已转换为北京时间。',
      });
    },
  },
  {
    id: 'timestamp-details',
    name: '时间戳详情',
    summary: '一次输出时间戳的秒值、毫秒值、UTC ISO、本地时间和北京时间。',
    group: 'timestamp',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Sparkles,
    tags: ['timestamp', 'iso', 'local'],
    fields: [],
    run({input}) {
      const timestamp = toTimestampNumber(input);
      const date = new Date(timestamp);
      return successResult({
        output: JSON.stringify(
          {
            milliseconds: timestamp,
            seconds: Math.floor(timestamp / 1000),
            isoUtc: date.toISOString(),
            localTime: formatDateTime(date),
            beijingTime: date.toLocaleString('zh-CN', {
              timeZone: 'Asia/Shanghai',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            }),
          },
          null,
          2,
        ),
        message: '已生成时间戳详情。',
      });
    },
  },
  {
    id: 'date-to-day-range',
    name: '日期转当天范围',
    summary: '输入日期后，生成当天开始和结束时间的秒级或毫秒级时间戳。',
    group: 'timestamp',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Sparkles,
    tags: ['timestamp', 'convert', 'local'],
    fields: [
      {
        name: 'precision',
        label: '精度',
        type: 'select',
        defaultValue: 'ms',
        options: [
          {label: '毫秒', value: 'ms'},
          {label: '秒', value: 's'},
        ],
      },
    ],
    run({input, fields}) {
      const date = new Date(ensureText(input).trim());
      if (Number.isNaN(date.getTime())) {
        return errorResult('日期解析失败，请输入 ISO 或浏览器可识别的日期。');
      }

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      const useSeconds = fields.precision === 's';

      return successResult({
        output: JSON.stringify(
          {
            start: useSeconds ? Math.floor(start.getTime() / 1000) : start.getTime(),
            end: useSeconds ? Math.floor(end.getTime() / 1000) : end.getTime(),
            date: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
          },
          null,
          2,
        ),
        message: '已生成本日开始和结束时间戳。',
      });
    },
  },
  {
    id: 'generate-username',
    name: '生成用户名',
    summary: '生成适合测试用的用户名。',
    group: 'mock',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Fingerprint,
    tags: ['username', 'mock'],
    fields: [],
    run() {
      const prefixes = ['mint', 'river', 'pixel', 'cloud', 'lime', 'nova'];
      const suffixes = ['fox', 'dev', 'lab', 'node', 'byte', 'leaf'];
      return successResult({
        output: `${randomItem(prefixes)}_${randomItem(suffixes)}${randomInt(12, 999)}`,
        message: '已生成用户名。',
      });
    },
  },
  {
    id: 'generate-email',
    name: '生成邮箱',
    summary: '生成适合测试注册、表单和接口的邮箱地址。',
    group: 'mock',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Fingerprint,
    tags: ['email', 'mock'],
    fields: [{name: 'domain', label: '域名', type: 'text', placeholder: 'example.com', defaultValue: 'example.com'}],
    run({fields}) {
      const prefixes = ['mint', 'ocean', 'tester', 'hello', 'alpha', 'demo'];
      return successResult({
        output: `${randomItem(prefixes)}${randomInt(100, 9999)}@${ensureText(fields.domain).trim() || 'example.com'}`,
        message: '已生成邮箱。',
      });
    },
  },
  {
    id: 'generate-phone',
    name: '生成手机号',
    summary: '生成中国大陆 11 位测试手机号。',
    group: 'mock',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Fingerprint,
    tags: ['phone', 'mock'],
    fields: [],
    run() {
      return successResult({
        output: `1${randomItem(['3', '5', '7', '8', '9'])}${randomDigits(9)}`,
        message: '已生成手机号。',
      });
    },
  },
  {
    id: 'generate-address',
    name: '生成地址',
    summary: '生成适合测试表单和订单流的中文地址。',
    group: 'mock',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Fingerprint,
    tags: ['address', 'mock'],
    fields: [],
    run() {
      return successResult({
        output: generateMockAddress(),
        message: '已生成地址。',
      });
    },
  },
  {
    id: 'generate-id-card',
    name: '生成身份证号',
    summary: '生成 18 位中国大陆身份证号格式的测试数据。',
    group: 'mock',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Fingerprint,
    tags: ['id', 'card', 'mock'],
    fields: [],
    run() {
      return successResult({
        output: generateChineseIdCard(),
        message: '已生成身份证号。',
      });
    },
  },
  {
    id: 'generate-passport',
    name: '生成护照号',
    summary: '生成适合测试使用的护照号格式。',
    group: 'mock',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Fingerprint,
    tags: ['passport', 'mock'],
    fields: [],
    run() {
      return successResult({
        output: `${randomItem(['E', 'G', 'P'])}${randomDigits(8)}`,
        message: '已生成护照号。',
      });
    },
  },
  {
    id: 'generate-license',
    name: '生成执照号',
    summary: '生成统一社会信用代码格式的测试执照号。',
    group: 'mock',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Fingerprint,
    tags: ['license', 'mock'],
    fields: [],
    run() {
      const chars = '0123456789ABCDEFGHJKLMNPQRTUWXY';
      return successResult({
        output: Array.from({length: 18}, () => chars[randomInt(0, chars.length - 1)]).join(''),
        message: '已生成执照号。',
      });
    },
  },
  {
    id: 'generate-uuid',
    name: '生成 UUID',
    summary: '在浏览器本地生成新的 UUID。',
    group: 'mock',
    kind: 'generate',
    level: 'core',
    color: 'primary',
    icon: Fingerprint,
    tags: ['uuid', 'id'],
    featured: true,
    fields: [],
    run() {
      const output =
        typeof globalThis.crypto?.randomUUID === 'function'
          ? globalThis.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
      return successResult({
        output,
        message: '已生成 UUID。',
      });
    },
  },
  {
    id: 'csv-to-json',
    name: 'CSV 转 JSON',
    summary: '把首行当作表头，并将后续行转换成 JSON 数组。',
    group: 'json',
    kind: 'transform',
    level: 'expert',
    color: 'primary',
    icon: TableProperties,
    tags: ['csv', 'json'],
    featured: true,
    fields: [],
    run({input}) {
      return successResult({
        output: csvToJson(input),
        mode: 'replace',
        message: '已完成 CSV 转 JSON。',
      });
    },
  },
  {
    id: 'json-to-csv',
    name: 'JSON 转 CSV',
    summary: '把 JSON 数组转换成 CSV 行。',
    group: 'json',
    kind: 'transform',
    level: 'expert',
    color: 'primary',
    icon: TableProperties,
    tags: ['json', 'csv'],
    fields: [],
    run({input}) {
      return successResult({
        output: jsonToCsv(input),
        mode: 'replace',
        message: '已完成 JSON 转 CSV。',
      });
    },
  },
  {
    id: 'markdown-align',
    name: 'Markdown 表格对齐',
    summary: '把 Markdown 表格重新整理成对齐的列。',
    group: 'data',
    kind: 'transform',
    level: 'expert',
    color: 'primary',
    icon: TableProperties,
    tags: ['markdown', 'table'],
    featured: true,
    fields: [],
    run({input}) {
      return successResult({
        output: alignMarkdownTable(input),
        mode: 'replace',
        message: '已对齐 Markdown 表格。',
      });
    },
  },
];

export function getToolById(toolId: string | null | undefined) {
  return TOOLS.find((tool) => tool.id === toolId) ?? null;
}

export function getDefaultFieldValues(tool: ToolDefinition | null) {
  const output: Record<string, ToolFieldValue> = {};
  if (!tool) {
    return output;
  }

  tool.fields.forEach((field) => {
    if (field.type === 'checkbox') {
      output[field.name] = field.defaultValue ?? false;
      return;
    }

    if (field.type === 'file') {
      output[field.name] = null;
      return;
    }

    output[field.name] = field.defaultValue ?? '';
  });
  return output;
}

export function validateTool(tool: ToolDefinition) {
  return Boolean(tool.id && tool.name && tool.summary && tool.group && tool.kind && tool.run && Array.isArray(tool.fields));
}

export function filterTools({
  search = '',
  group = 'all',
}: {
  search?: string;
  group?: ToolGroupId;
}) {
  const keyword = search.trim().toLowerCase();

  return TOOLS.filter((tool) => {
    if (group !== 'all' && group !== 'favorites' && tool.group !== group) {
      return false;
    }

    if (!keyword) {
      return true;
    }

    const haystack = `${buildSearchText(tool)} ${tool.kind} ${tool.group}`;
    return haystack.includes(keyword);
  });
}

export async function executeTool(tool: ToolDefinition | null, context: ToolRunContext): Promise<ToolResult> {
  if (!tool) {
      return errorResult('工具不存在。');
  }

  try {
    const result = await tool.run(context);
    if (!result || typeof result.ok !== 'boolean') {
      return errorResult('工具返回了无效结果。');
    }
    return result;
  } catch (error) {
    return errorResult(error instanceof Error ? error.message : '工具执行失败。');
  }
}
