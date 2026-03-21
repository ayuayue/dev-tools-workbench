# Dev Tools Workbench

一个面向开发者日常高频操作的单页工具箱，默认中文、支持中英双语、亮暗模式与全局主题色切换，可直接作为纯静态站点部署，也适合后续封装为桌面端应用。

## 项目定位

Dev Tools Workbench 聚焦“打开即用”的本地工具体验：

- 文本处理：大小写、去重、排序、提取、替换、转义等常用文本操作
- 格式化处理：JSON、XML、SQL、CSV、Markdown 表格等格式整理与校验
- 编码处理：URL、Base64、HTML 实体，以及文件和图片转 Base64
- 加密处理：MD5、SHA、HMAC、AES 等常见摘要和加解密能力
- JWT：编码、解码、快速检查
- 时间戳工具：秒、毫秒、ISO、本地时间互转
- 模拟数据：用户名、中文名、邮箱、手机号、地址、证件、UUID、GUID
- 正则测试：匹配、捕获组、替换结果联调
- 压缩工具：HTML、JS、CSS、XML 的压缩与格式化
- 运行代码：直接运行 HTML、CSS、JS 并内嵌预览

## 主要特性

- 单页应用，浏览器内直接完成大多数处理
- 默认中文界面，支持完整中英切换
- 默认亮色主题，支持多套全局配色方案
- 工作区与结果区分离，运行后不会覆盖原始输入
- 支持收藏、搜索、拖动排序，并持久化到本地存储
- 图片和文件类工具支持拖拽、上传、粘贴等更直观的输入方式
- 无需后端服务即可完成构建和部署

## 技术栈

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- `js-beautify`
- `sql-formatter`
- `terser`

## 本地开发

### 环境要求

- Node.js 20+
- npm 或 pnpm

### 启动方式

```bash
npm install
npm run dev
```

默认本地地址为 [http://localhost:3000](http://localhost:3000)。

## 构建与静态部署

这个项目当前就是标准前端静态应用，可以直接构建后部署到 GitHub Pages、Vercel、Netlify，或者放到任何静态文件服务器上。

### 生成静态文件

```bash
npm run build
```

构建产物位于 `dist/`。

### GitHub Pages

仓库已包含 GitHub Pages 工作流。首次使用前，需要先在仓库设置中手动启用一次 Pages：

1. `Settings`
2. `Pages`
3. `Build and deployment`
4. `Source` 选择 `GitHub Actions`

完成一次初始化后，后续每次推送默认分支，都会自动构建并部署 `dist/`。

### 自定义部署路径

默认构建使用相对路径，适合 GitHub Pages 子路径部署。如果需要显式指定资源前缀，可设置环境变量：

```bash
VITE_BASE_URL=/your-base-path/ npm run build
```

## 桌面端封装可行性

可以。当前项目采用 Vite 前端结构，后续封装桌面端成本较低，推荐两种路线：

### 方案一：Tauri

- 体积更小
- 启动更快
- 更适合纯工具箱类应用
- 可以直接复用当前前端页面作为桌面窗口

### 方案二：Electron

- 生态更成熟
- 插件和资料更多
- 但安装包更大、内存占用更高

当前仓库还没有引入 Tauri 或 Electron 脚手架。如果需要，我可以下一步直接把它补成可打包的桌面项目。

## 推荐发布方式

如果目标是先公开可用版本，优先建议：

1. GitHub Pages 发布静态站点
2. 补仓库截图、README 和版本说明
3. 后续再按需要增加 Tauri 桌面壳

这样成本最低，维护也最轻。

## 目录结构

```text
src/
  components/      界面组件
  data/            工具定义、分组、执行逻辑、本地化文案
index.html         应用入口
vite.config.ts     Vite 构建配置
```

## 隐私与数据处理

大部分工具都在浏览器本地完成处理，适合离线或内网场景。对于敏感数据，仍建议优先在本地环境中使用并自行评估风险。

## 后续可扩展方向

- Tauri 桌面打包
- PWA 安装能力
- 更多开发类工具模块
- 导入导出个人工具配置
- 快捷键体系与批处理能力

## License

如需开源发布，建议补充 `MIT` License。
