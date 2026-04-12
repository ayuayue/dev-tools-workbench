import {Clipboard, Download, Eraser, Expand, LoaderCircle, RotateCcw, Sparkles, Upload, X} from 'lucide-react';
import {motion} from 'motion/react';
import {useEffect, useState} from 'react';
import {
  AppLanguage,
  getToolFieldSuggestions,
  ToolDefinition,
  ToolFieldValue,
  ToolResult,
  UploadedAsset,
} from '../data/toolRegistry';

interface WorkbenchProps {
  tool: ToolDefinition | null;
  fieldValues: Record<string, ToolFieldValue>;
  editorText: string;
  isRunning: boolean;
  lang: AppLanguage;
  result: ToolResult;
  resultVersion: number;
  status: {tone: 'info' | 'success' | 'error'; message: string};
  onEditorChange: (value: string) => void;
  onFieldChange: (name: string, value: ToolFieldValue) => void;
  onRun: () => void | Promise<void>;
  onResetFields: () => void;
  onCopyInput: () => void;
  onCopyResult: () => void;
  onDownloadResult: () => void;
  onUseResult: () => void;
  onClearEditor: () => void;
}

async function readUploadedFile(file: File, lang: AppLanguage): Promise<UploadedAsset> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error(lang === 'zh' ? '文件读取失败。' : 'Failed to read the file.'));
    reader.readAsDataURL(file);
  });

  return {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    content: dataUrl.includes(',') ? dataUrl.split(',', 2)[1] : dataUrl,
    dataUrl,
    size: file.size,
  };
}

function SuggestionList({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (value: string) => void;
}) {
  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {suggestions.slice(0, 10).map((suggestion) => (
        <button
          className="rounded-full border border-outline-variant/12 bg-background/55 px-2.5 py-1 text-[11px] font-medium text-on-surface-variant transition hover:border-primary/30 hover:text-primary"
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          type="button"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

function renderField(
  tool: ToolDefinition | null,
  field: ToolDefinition['fields'][number],
  value: ToolFieldValue | undefined,
  editorText: string,
  fieldValues: Record<string, ToolFieldValue>,
  lang: AppLanguage,
  onFieldChange: (name: string, value: ToolFieldValue) => void,
) {
  const suggestions = getToolFieldSuggestions(
    tool,
    {
      input: editorText,
      fields: fieldValues,
    },
    field.name,
  );

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-3 rounded-lg border border-outline-variant/12 bg-background/40 px-4 py-3" key={field.name}>
        <input
          checked={Boolean(value)}
          onChange={(event) => onFieldChange(field.name, event.target.checked)}
          type="checkbox"
        />
        <span className="text-sm font-medium text-on-surface">{field.label}</span>
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <label className="grid gap-2" key={field.name}>
        <span className="label-sm all-caps font-bold tracking-[0.2em] text-on-surface-variant">{field.label}</span>
        <select
          className="h-11 rounded-lg border border-outline-variant/12 bg-background/50 px-4 text-sm text-on-surface outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          onChange={(event) => onFieldChange(field.name, event.target.value)}
          value={String(value ?? field.defaultValue)}
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === 'file') {
    const fileValue = value && typeof value === 'object' && 'name' in value ? (value as UploadedAsset) : null;
    const canPasteImage = Boolean(tool?.workspace?.supportsClipboardImage);

    const setUploadedFile = async (file: File | null) => {
      if (!file) {
        onFieldChange(field.name, null);
        return;
      }

      const uploaded = await readUploadedFile(file, lang);
      onFieldChange(field.name, uploaded);
    };

    return (
      <label className="grid gap-2" key={field.name}>
        <span className="label-sm all-caps font-bold tracking-[0.2em] text-on-surface-variant">{field.label}</span>
        <div
          className="rounded-lg border border-dashed border-outline-variant/20 bg-background/40 px-4 py-3"
          onDragOver={(event) => event.preventDefault()}
          onDrop={async (event) => {
            event.preventDefault();
            const file = event.dataTransfer.files?.[0] ?? null;
            await setUploadedFile(file);
          }}
          onPaste={async (event) => {
            if (!canPasteImage) {
              return;
            }
            const imageItem = Array.from(event.clipboardData.items as DataTransferItemList).find((item: DataTransferItem) =>
              item.type.startsWith('image/'),
            );
            const file = imageItem?.getAsFile() ?? null;
            if (file) {
              event.preventDefault();
              await setUploadedFile(file);
            }
          }}
          tabIndex={canPasteImage ? 0 : -1}
        >
          <input
            accept={field.accept}
            className="block w-full text-sm text-on-surface file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.18em] file:text-primary"
            onChange={async (event) => {
              const file = event.target.files?.[0] ?? null;
              await setUploadedFile(file);
            }}
            type="file"
          />

          <div className="mt-2 space-y-1 text-xs leading-relaxed text-on-surface-variant">
            <div>
              {fileValue
                ? lang === 'zh'
                  ? `已选择 ${fileValue.name} · ${Math.max(1, Math.round(fileValue.size / 1024))} KB`
                  : `Selected ${fileValue.name} · ${Math.max(1, Math.round(fileValue.size / 1024))} KB`
                : field.helper ?? (lang === 'zh' ? '请选择一个文件。' : 'Please choose a file.')}
            </div>
            {canPasteImage ? (
              <div>{lang === 'zh' ? '支持直接粘贴截图或拖拽图片到这里。' : 'You can paste a screenshot or drop an image here directly.'}</div>
            ) : null}
          </div>
        </div>
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <label className="grid gap-2" key={field.name}>
        <span className="label-sm all-caps font-bold tracking-[0.2em] text-on-surface-variant">{field.label}</span>
        <textarea
          className="min-h-[130px] rounded-lg border border-outline-variant/12 bg-background/50 px-4 py-3 font-mono text-sm leading-6 text-on-surface outline-none transition placeholder:text-on-surface-variant/35 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          onChange={(event) => onFieldChange(field.name, event.target.value)}
          placeholder={field.placeholder}
          rows={field.rows ?? 6}
          value={String(value ?? '')}
        />
        <SuggestionList suggestions={suggestions} onSelect={(nextValue) => onFieldChange(field.name, nextValue)} />
        {'helper' in field && field.helper ? (
          <p className="text-xs text-on-surface-variant/70">
            {String(field.helper).split(/(https?:\/\/[^\s]+)/).map((part, i) =>
              part.match(/^https?:\/\//) ? (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                  {part}
                </a>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        ) : null}
      </label>
    );
  }

  return (
    <label className="grid gap-2" key={field.name}>
      <span className="label-sm all-caps font-bold tracking-[0.2em] text-on-surface-variant">{field.label}</span>
      <input
        className="h-11 rounded-lg border border-outline-variant/12 bg-background/50 px-4 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/35 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        onChange={(event) => onFieldChange(field.name, event.target.value)}
        placeholder={field.placeholder}
        type="text"
        value={String(value ?? '')}
      />
      <SuggestionList suggestions={suggestions} onSelect={(nextValue) => onFieldChange(field.name, nextValue)} />
      {'helper' in field && field.helper ? (
        <p className="text-xs text-on-surface-variant/70">
          {field.helper.split(/(https?:\/\/[^\s]+)/).map((part, i) =>
            part.match(/^https?:\/\//) ? (
              <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                {part}
              </a>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>
      ) : null}
    </label>
  );
}

export default function Workbench({
  tool,
  fieldValues,
  editorText,
  isRunning,
  lang,
  result,
  resultVersion,
  status,
  onEditorChange,
  onFieldChange,
  onRun,
  onResetFields,
  onCopyInput,
  onCopyResult,
  onDownloadResult,
  onUseResult,
  onClearEditor,
}: WorkbenchProps) {
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const resultTone =
    status.tone === 'success'
      ? 'border-secondary/35 bg-secondary/12 text-secondary'
      : status.tone === 'error'
        ? 'border-error/35 bg-error/12 text-error'
        : 'border-outline/35 bg-surface-container-low text-on-surface-variant';

  const showEditor = tool?.workspace?.showEditor !== false;
  const showFieldsPanel = tool?.workspace?.showFieldsPanel !== false;
  const allowUseResult = tool?.workspace?.allowUseResult !== false && showEditor;
  const showResultOutput = tool?.workspace?.showResultOutput !== false;
  const preferPreviewLayout = Boolean(tool?.workspace?.preferPreviewLayout);
  const previewMinHeight = tool?.workspace?.previewMinHeight ?? (result.preview?.type === 'html' ? 360 : 288);
  const allowPreviewFullscreen = Boolean(tool?.workspace?.allowPreviewFullscreen && result.preview?.type === 'html' && result.preview.srcDoc);
  const editorTitle = tool?.workspace?.editorTitle ?? (lang === 'zh' ? '编辑器' : 'Input Editor');
  const editorLabel = tool?.workspace?.editorLabel ?? (lang === 'zh' ? '输入区' : 'Input');
  const editorPlaceholder = tool?.workspace?.editorPlaceholder ?? (lang === 'zh' ? '把原始文本粘贴到这里...' : 'Paste raw text here...');
  const resultSectionLabel =
    result.preview?.type === 'html' && !showResultOutput ? (lang === 'zh' ? '预览区' : 'Preview') : lang === 'zh' ? '结果区' : 'Output';

  useEffect(() => {
    if (!isPreviewFullscreen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPreviewFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isPreviewFullscreen]);

  return (
    <section className="space-y-4">
      <motion.div
        animate={
          isRunning
            ? {
                boxShadow: [
                  '0 0 0 0 rgba(108,115,235,0.1)',
                  '0 16px 44px -18px rgba(108,115,235,0.34)',
                  '0 0 0 0 rgba(108,115,235,0.1)',
                ],
              }
            : {boxShadow: '0 14px 32px -28px rgba(0,0,0,0.26)'}
        }
        className="sticky top-24 z-20 rounded-xl border border-primary/18 bg-surface/96 p-3 backdrop-blur-xl"
        transition={{duration: 1.1, repeat: isRunning ? Infinity : 0, ease: 'easeInOut'}}
      >
        <div className="flex flex-wrap items-center gap-4 rounded-xl bg-surface-container-low px-3 py-3 shadow-[inset_0_0_0_1px_rgba(110,135,127,0.12)]">
          <div className="min-w-0 flex-1">
            <p className="label-sm all-caps font-semibold tracking-[0.22em] text-primary/88">{lang === 'zh' ? '立即运行' : 'Run Now'}</p>
            <div className="mt-1 flex items-center gap-2">
              <h3 className="truncate text-[17px] font-black tracking-[-0.02em] text-on-surface">{tool?.name ?? (lang === 'zh' ? '请选择工具' : 'Choose a tool')}</h3>
              <span className="rounded-md bg-background/55 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.14)]">
                {tool?.fields.length ? (lang === 'zh' ? `${tool.fields.length} 个参数` : `${tool.fields.length} fields`) : lang === 'zh' ? '直接运行' : 'Direct Run'}
              </span>
            </div>
            <p className="mt-1 text-[12px] leading-5 text-on-surface-variant/88">
              {showEditor
                ? lang === 'zh'
                  ? '先准备输入内容，需要参数时在下方调整，然后点这里运行。'
                  : 'Prepare the input first, adjust any fields below if needed, then run from here.'
                : lang === 'zh'
                  ? '这个工具不依赖左侧编辑区，按需调整参数后可直接运行。'
                  : 'This tool does not rely on the left editor. Adjust the fields if needed and run directly.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <motion.button
              animate={isRunning ? {scale: [1, 1.03, 1]} : {scale: 1}}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-primary via-primary-dim to-primary px-4 text-sm font-semibold tracking-[0.01em] text-on-primary shadow-[0_12px_26px_-16px_rgba(108,115,235,0.42)] transition"
              disabled={isRunning}
              onClick={onRun}
              transition={{duration: 0.9, repeat: isRunning ? Infinity : 0, ease: 'easeInOut'}}
              type="button"
              whileTap={{scale: 0.97}}
            >
              {isRunning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isRunning ? (lang === 'zh' ? '运行中...' : 'Running...') : lang === 'zh' ? '运行工具' : 'Run Tool'}
            </motion.button>
            {showFieldsPanel && tool?.fields.length ? (
              <button
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-surface-container-low px-4 text-sm font-semibold tracking-[0.01em] text-on-surface shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)] transition hover:bg-surface-container-high hover:text-primary"
                onClick={onResetFields}
                type="button"
              >
                <RotateCcw className="h-4 w-4" />
                {lang === 'zh' ? '重置参数' : 'Reset Fields'}
              </button>
            ) : null}
          </div>
        </div>
      </motion.div>

      <div className={`grid gap-5 ${showEditor ? (preferPreviewLayout ? 'xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]' : 'xl:grid-cols-2') : ''}`}>
        {showEditor ? (
          <div className="rounded-xl border border-outline/28 bg-surface-container p-5 shadow-[0_22px_40px_-32px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="label-sm all-caps font-semibold tracking-[0.22em] text-secondary/90">{editorLabel}</p>
                <h4 className="mt-2 text-[18px] font-bold tracking-[-0.02em] text-on-surface">{editorTitle}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-container-low px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)] transition hover:bg-surface-container-high hover:text-on-surface"
                  onClick={onCopyInput}
                  type="button"
                >
                  <Clipboard className="h-4 w-4" />
                  {lang === 'zh' ? '复制' : 'Copy'}
                </button>
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-container-low px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)] transition hover:bg-surface-container-high hover:text-on-surface"
                  onClick={onClearEditor}
                  type="button"
                >
                  <Eraser className="h-4 w-4" />
                  {lang === 'zh' ? '清空' : 'Clear'}
                </button>
              </div>
            </div>

            <textarea
              className="mt-4 min-h-[440px] w-full rounded-lg bg-background/72 p-4 font-mono text-sm leading-6 text-on-surface outline-none shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16),0_10px_20px_-18px_rgba(0,0,0,0.2)] transition placeholder:text-on-surface-variant/45 focus:ring-2 focus:ring-primary/14"
              onChange={(event) => onEditorChange(event.target.value)}
              placeholder={editorPlaceholder}
              value={editorText}
            />
          </div>
        ) : null}

        <motion.div
          animate={{opacity: 1, y: 0}}
          className="rounded-xl border border-outline/28 bg-surface-container p-5 shadow-[0_22px_40px_-32px_rgba(0,0,0,0.3)]"
          initial={{opacity: 0.92, y: 12}}
          key={resultVersion}
          transition={{duration: 0.28, ease: 'easeOut'}}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
                <p className="label-sm all-caps font-semibold tracking-[0.22em] text-tertiary/92">{resultSectionLabel}</p>
                <h4 className="mt-2 text-[18px] font-bold tracking-[-0.02em] text-on-surface">{result.message}</h4>
            </div>
            <div className="flex flex-wrap gap-2 rounded-xl bg-surface px-2 py-2 shadow-[inset_0_0_0_1px_rgba(110,135,127,0.08)]">
              {showResultOutput ? (
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-container-low px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)] transition hover:bg-surface-container-high hover:text-on-surface"
                  onClick={onCopyResult}
                  type="button"
                >
                  <Clipboard className="h-4 w-4" />
                  {lang === 'zh' ? '复制' : 'Copy'}
                </button>
              ) : null}
              {allowUseResult ? (
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-container-low px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)] transition hover:bg-surface-container-high hover:text-on-surface"
                  onClick={onUseResult}
                  type="button"
                >
                  <Upload className="h-4 w-4" />
                  {lang === 'zh' ? '写回编辑区' : 'Send to Editor'}
                </button>
              ) : null}
              {result.download ? (
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/14 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-primary/20"
                  onClick={onDownloadResult}
                  type="button"
                >
                  <Download className="h-4 w-4" />
                  {lang === 'zh' ? '下载' : 'Download'}
                </button>
              ) : null}
              {allowPreviewFullscreen ? (
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-container-low px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)] transition hover:bg-surface-container-high hover:text-primary"
                  onClick={() => setIsPreviewFullscreen(true)}
                  type="button"
                >
                  <Expand className="h-4 w-4" />
                  {lang === 'zh' ? '放大预览' : 'Fullscreen'}
                </button>
              ) : null}
            </div>
          </div>

          {showResultOutput ? (
            <textarea
              className="mt-4 min-h-[240px] w-full rounded-lg bg-background/72 p-4 font-mono text-sm leading-6 text-on-surface outline-none shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16),0_10px_20px_-18px_rgba(0,0,0,0.2)]"
              readOnly
              value={result.output}
            />
          ) : null}

          {result.preview?.type === 'image' && result.preview.src ? (
            <div className="mt-4 overflow-hidden rounded-xl bg-surface-container-low p-3 shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)]">
              <img alt={lang === 'zh' ? '解码后的预览图' : 'Decoded preview image'} className="max-h-72 w-full rounded-lg object-contain" src={result.preview.src} />
            </div>
          ) : null}

          {result.preview?.type === 'html' && result.preview.srcDoc ? (
            <div className="mt-4 overflow-hidden rounded-xl bg-surface-container-low shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)]">
              <iframe
                className="w-full bg-white"
                style={{minHeight: `${previewMinHeight}px`}}
                sandbox="allow-scripts allow-modals"
                srcDoc={result.preview.srcDoc}
                title={lang === 'zh' ? '代码预览' : 'Code preview'}
              />
            </div>
          ) : null}

          <div className={`mt-4 rounded-xl border px-4 py-3 text-[13px] leading-6 ${resultTone}`}>
            <p className="font-medium tracking-[0.01em]">{status.message}</p>
          </div>
        </motion.div>
      </div>

      {showFieldsPanel ? (
        <div className="rounded-xl border border-outline/28 bg-surface-container p-4 shadow-[0_22px_40px_-32px_rgba(0,0,0,0.28)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-sm all-caps font-semibold tracking-[0.22em] text-primary/88">{lang === 'zh' ? '工具参数' : 'Parameters'}</p>
              <h3 className="mt-1.5 text-[18px] font-black tracking-[-0.02em] text-on-surface">{tool?.name ?? (lang === 'zh' ? '请选择一个工具' : 'Choose a tool')}</h3>
              <p className="mt-2 text-[13px] leading-6 text-on-surface-variant/88">
                {tool?.summary ?? (lang === 'zh' ? '先在右侧选择工具，再在这里调整参数并运行。' : 'Choose a tool on the right, then adjust fields here before running.')}
              </p>
            </div>
            {tool ? (
              <div className="rounded-lg bg-surface-container-low p-3 text-primary shadow-[inset_0_0_0_1px_rgba(111,195,170,0.22)]">
                <tool.icon className="h-5 w-5" />
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {tool?.fields.length ? (
              tool.fields.map((field) => renderField(tool, field, fieldValues[field.name], editorText, fieldValues, lang, onFieldChange))
            ) : (
              <div className="rounded-lg bg-surface-container-low px-4 py-3 text-[13px] leading-6 text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(110,135,127,0.16)]">
                {lang === 'zh' ? '这个工具不需要额外参数，直接运行即可。' : 'This tool does not require extra fields. You can run it directly.'}
              </div>
            )}
          </div>

          <div className="mt-4 rounded-lg border border-dashed border-outline/45 bg-surface-container-low px-4 py-3 text-[12px] leading-6 text-on-surface-variant/88">
            {showEditor
              ? lang === 'zh'
                ? '运行入口已固定在上方。修改参数后不用滚动到底部，直接点顶部的“运行工具”即可。'
                : 'The run action is fixed above. After changing fields, you can run immediately without scrolling down.'
              : lang === 'zh'
                ? '当前工具以参数或粘贴素材为主，不依赖左侧输入区。'
                : 'This tool is driven by fields or pasted assets instead of the main editor.'}
          </div>
        </div>
      ) : null}

      {isPreviewFullscreen && result.preview?.type === 'html' && result.preview.srcDoc ? (
        <div className="fixed inset-0 z-[90] bg-black/55 p-4 backdrop-blur-sm xl:p-6">
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-outline/45 bg-surface shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-outline/35 px-5 py-4">
              <div>
                <p className="label-sm all-caps tracking-[0.24em] text-primary">{lang === 'zh' ? '全屏预览' : 'Fullscreen Preview'}</p>
                <h4 className="mt-1 text-lg font-bold text-on-surface">{tool?.name ?? (lang === 'zh' ? '代码预览' : 'Code Preview')}</h4>
              </div>
              <button
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-outline/35 bg-surface-container-low px-4 text-sm font-bold text-on-surface-variant transition hover:border-primary/28 hover:bg-surface-container-high hover:text-primary"
                onClick={() => setIsPreviewFullscreen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
                {lang === 'zh' ? '关闭' : 'Close'}
              </button>
            </div>

            <div className="flex-1 bg-white p-3">
              <iframe
                className="h-full min-h-0 w-full rounded-lg border border-outline-variant/10 bg-white"
                sandbox="allow-scripts allow-modals"
                srcDoc={result.preview.srcDoc}
                title={lang === 'zh' ? '全屏代码预览' : 'Fullscreen code preview'}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
