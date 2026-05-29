import { type ToolResult, TOOLS } from "../src/data/toolRegistry.ts";

function assert(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

function isPromiseResult(
	value: ToolResult | Promise<ToolResult>,
): value is Promise<ToolResult> {
	return value instanceof Promise;
}

const tool = TOOLS.find((item) => item.id === "base64-to-file");
assert(tool, "base64-to-file tool should exist");

// PDF 文件的二进制魔数是 "%PDF-"。纯 Base64 没有 Data URL 头时，仍应按内容识别类型，
// 避免业务用户拿到默认 txt 下载结果后无法直接用 PDF 阅读器打开。
const minimalPdfBase64 = btoa("%PDF-1.4\n% regression fixture\n");
const maybeResult = tool!.run({
	input: minimalPdfBase64,
	fields: {
		fileName: "sample",
		extension: "",
		mimeType: "",
	},
});

assert(
	!isPromiseResult(maybeResult),
	"base64-to-file should run synchronously",
);
const result = maybeResult;
assert(result.ok, "base64-to-file should decode successfully");
assert(
	result.download?.fileName === "sample.pdf",
	`expected sample.pdf, got ${result.download?.fileName}`,
);
assert(
	result.download?.mimeType === "application/pdf",
	`expected application/pdf, got ${result.download?.mimeType}`,
);
assert(
	result.download?.dataUrl?.startsWith("data:application/pdf;base64,"),
	"expected PDF data URL prefix",
);

console.log("base64-to-file PDF regression passed");
