import {Clipboard, Download, Eraser, LoaderCircle, RotateCcw, Sparkles, Upload} from 'lucide-react';
import {motion} from 'motion/react';
import {AppLanguage, ToolDefinition, ToolFieldValue, ToolResult, UploadedAsset} from '../data/toolRegistry';

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

function renderField(
  field: ToolDefinition['fields'][number],
  value: ToolFieldValue | undefined,
  lang: AppLanguage,
  onFieldChange: (name: string, value: ToolFieldValue) => void,
) {
  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-3 rounded-xl border border-outline-variant/12 bg-background/40 px-4 py-3" key={field.name}>
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
          className="h-11 rounded-xl border border-outline-variant/12 bg-background/50 px-4 text-sm text-on-surface outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
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

    return (
      <label className="grid gap-2" key={field.name}>
        <span className="label-sm all-caps font-bold tracking-[0.2em] text-on-surface-variant">{field.label}</span>
        <div className="rounded-xl border border-outline-variant/12 bg-background/40 px-4 py-3">
          <input
            accept={field.accept}
            className="block w-full text-sm text-on-surface file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.18em] file:text-primary"
            onChange={async (event) => {
              const file = event.target.files?.[0] ?? null;
              if (!file) {
                onFieldChange(field.name, null);
                return;
              }

              const uploaded = await readUploadedFile(file, lang);
              onFieldChange(field.name, uploaded);
            }}
            type="file"
          />
          <div className="mt-2 text-xs leading-relaxed text-on-surface-variant">
            {fileValue
              ? lang === 'zh'
                ? `已选择 ${fileValue.name} · ${Math.max(1, Math.round(fileValue.size / 1024))} KB`
                : `Selected ${fileValue.name} · ${Math.max(1, Math.round(fileValue.size / 1024))} KB`
              : field.helper ?? (lang === 'zh' ? '请选择一个文件。' : 'Please choose a file.')}
          </div>
        </div>
      </label>
    );
  }

  return (
    <label className="grid gap-2" key={field.name}>
      <span className="label-sm all-caps font-bold tracking-[0.2em] text-on-surface-variant">{field.label}</span>
      <input
        className="h-11 rounded-xl border border-outline-variant/12 bg-background/50 px-4 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/35 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        onChange={(event) => onFieldChange(field.name, event.target.value)}
        placeholder={field.placeholder}
        type="text"
        value={String(value ?? '')}
      />
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
  const resultTone =
    status.tone === 'success'
      ? 'border-secondary/25 bg-secondary/8 text-secondary'
      : status.tone === 'error'
        ? 'border-error/25 bg-error/8 text-error'
        : 'border-outline-variant/10 bg-background/40 text-on-surface-variant';

  return (
    <section className="space-y-4">
      <motion.div
        animate={
          isRunning
            ? {
                boxShadow: [
                  '0 0 0 0 rgba(108,115,235,0.08)',
                  '0 12px 40px -18px rgba(108,115,235,0.28)',
                  '0 0 0 0 rgba(108,115,235,0.08)',
                ],
              }
            : {boxShadow: '0 8px 24px -22px rgba(108,115,235,0.14)'}
        }
        className="sticky top-24 z-20 rounded-2xl border border-primary/12 bg-background/88 p-3 backdrop-blur-xl"
        transition={{duration: 1.1, repeat: isRunning ? Infinity : 0, ease: 'easeInOut'}}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="label-sm all-caps tracking-[0.24em] text-primary">{lang === 'zh' ? '立即运行' : 'Run Now'}</p>
            <div className="mt-1 flex items-center gap-2">
              <h3 className="truncate text-base font-black tracking-tight text-on-surface">{tool?.name ?? (lang === 'zh' ? '请选择工具' : 'Choose a tool')}</h3>
              <span className="rounded-full border border-outline-variant/12 bg-surface-container-low px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                {tool?.fields.length ? (lang === 'zh' ? `${tool.fields.length} 个参数` : `${tool.fields.length} fields`) : lang === 'zh' ? '直接运行' : 'Direct Run'}
              </span>
            </div>
            <p className="mt-1 text-xs text-on-surface-variant">
              {lang === 'zh'
                ? '先编辑左侧输入，需要参数时在下方调整，然后点这里运行。'
                : 'Edit the input first, adjust any fields below if needed, then run from here.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <motion.button
              animate={isRunning ? {scale: [1, 1.03, 1]} : {scale: 1}}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-primary via-primary-dim to-primary px-4 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition"
              disabled={isRunning}
              onClick={onRun}
              transition={{duration: 0.9, repeat: isRunning ? Infinity : 0, ease: 'easeInOut'}}
              type="button"
              whileTap={{scale: 0.97}}
            >
              {isRunning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isRunning ? (lang === 'zh' ? '运行中...' : 'Running...') : lang === 'zh' ? '运行工具' : 'Run Tool'}
            </motion.button>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-outline-variant/12 bg-background/60 px-4 text-sm font-bold text-on-surface transition hover:border-primary/20 hover:text-primary"
              onClick={onResetFields}
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
              {lang === 'zh' ? '重置参数' : 'Reset Fields'}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="label-sm all-caps tracking-[0.24em] text-secondary">{lang === 'zh' ? '输入区' : 'Input'}</p>
              <h4 className="mt-2 text-lg font-bold text-on-surface">{lang === 'zh' ? '编辑器' : 'Editor'}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-outline-variant/12 bg-background/40 px-3 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant transition hover:text-on-surface"
                onClick={onCopyInput}
                type="button"
              >
                <Clipboard className="h-4 w-4" />
                {lang === 'zh' ? '复制' : 'Copy'}
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-outline-variant/12 bg-background/40 px-3 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant transition hover:text-on-surface"
                onClick={onClearEditor}
                type="button"
              >
                <Eraser className="h-4 w-4" />
                {lang === 'zh' ? '清空' : 'Clear'}
              </button>
            </div>
          </div>

          <textarea
            className="mt-4 min-h-[440px] w-full rounded-2xl border border-outline-variant/12 bg-background/55 p-4 font-mono text-sm leading-6 text-on-surface outline-none transition placeholder:text-on-surface-variant/35 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
            onChange={(event) => onEditorChange(event.target.value)}
            placeholder={lang === 'zh' ? '把原始文本粘贴到这里...' : 'Paste raw text here...'}
            value={editorText}
          />
        </div>

        <motion.div
          animate={{opacity: 1, y: 0}}
          className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5"
          initial={{opacity: 0.92, y: 12}}
          key={resultVersion}
          transition={{duration: 0.28, ease: 'easeOut'}}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="label-sm all-caps tracking-[0.24em] text-tertiary">{lang === 'zh' ? '结果区' : 'Result'}</p>
              <h4 className="mt-2 text-lg font-bold text-on-surface">{result.message}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-outline-variant/12 bg-background/40 px-3 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant transition hover:text-on-surface"
                onClick={onCopyResult}
                type="button"
              >
                <Clipboard className="h-4 w-4" />
                {lang === 'zh' ? '复制' : 'Copy'}
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-outline-variant/12 bg-background/40 px-3 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant transition hover:text-on-surface"
                onClick={onUseResult}
                type="button"
              >
                <Upload className="h-4 w-4" />
                {lang === 'zh' ? '写回编辑区' : 'Use in Editor'}
              </button>
              {result.download ? (
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 text-xs font-bold uppercase tracking-[0.16em] text-primary transition hover:bg-primary/15"
                  onClick={onDownloadResult}
                  type="button"
                >
                  <Download className="h-4 w-4" />
                  {lang === 'zh' ? '下载' : 'Download'}
                </button>
              ) : null}
            </div>
          </div>

          <textarea
            className="mt-4 min-h-[440px] w-full rounded-2xl border border-outline-variant/12 bg-background/55 p-4 font-mono text-sm leading-6 text-on-surface outline-none"
            readOnly
            value={result.output}
          />

          {result.preview?.type === 'image' ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-outline-variant/12 bg-background/45 p-3">
              <img alt={lang === 'zh' ? '解码后的预览图' : 'Decoded preview image'} className="max-h-72 w-full rounded-xl object-contain" src={result.preview.src} />
            </div>
          ) : null}

          <div className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-relaxed ${resultTone}`}>{status.message}</div>
        </motion.div>
      </div>

      <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-sm all-caps tracking-[0.24em] text-primary">{lang === 'zh' ? '工具参数' : 'Tool Fields'}</p>
            <h3 className="mt-1.5 text-lg font-black tracking-tight text-on-surface">{tool?.name ?? (lang === 'zh' ? '请选择一个工具' : 'Choose a tool')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {tool?.summary ?? (lang === 'zh' ? '先在右侧选择工具，再在这里调整参数并运行。' : 'Choose a tool on the right, then adjust fields here before running.')}
            </p>
          </div>
          {tool ? (
            <div className="rounded-xl border border-current/10 bg-background/40 p-3 text-primary">
              <tool.icon className="h-5 w-5" />
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {tool?.fields.length ? (
            tool.fields.map((field) => renderField(field, fieldValues[field.name], lang, onFieldChange))
          ) : (
            <div className="rounded-xl border border-outline-variant/12 bg-background/40 px-4 py-3 text-sm text-on-surface-variant">
              {lang === 'zh' ? '这个工具不需要额外参数，直接运行即可。' : 'This tool does not require extra fields. You can run it directly.'}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-outline-variant/18 bg-background/35 px-4 py-3 text-xs leading-relaxed text-on-surface-variant">
          {lang === 'zh'
            ? '运行入口已固定在上方。修改参数后不用滚动到底部，直接点顶部的“运行工具”即可。'
            : 'The run action is fixed above. After changing fields, you can run immediately without scrolling down.'}
        </div>
      </div>
    </section>
  );
}
