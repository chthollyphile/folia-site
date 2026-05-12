# 下载与部署

## 桌面版下载

如果你希望开箱即用，推荐直接下载桌面版：

- Releases: `https://github.com/chthollyphile/folia-major/releases`

桌面版内置运行环境，适合普通用户。

### Linux 获取方式

1. Arch Linux / Manjaro：通过 AUR 安装 `folia-major-bin`

```bash
yay -S folia-major-bin
```

2. Debian / Ubuntu / Linux Mint：下载 `.deb`
3. Fedora / RHEL / openSUSE：下载 `.rpm`
4. 其他发行版：下载 `tar.gz`，解压后直接运行 `folia-major`

`tar.gz` 包中附带图标与 `.desktop` 模板，可按需手动创建桌面启动项。

## 一键部署到 Vercel

如果你希望使用 Web 版本，可以直接通过下方入口部署：

- GitHub: `https://github.com/chthollyphile/folia-major`
- Vercel: `https://vercel.com/new/clone?repository-url=https://github.com/chthollyphile/folia-major`

部署完成后，请在 Vercel 项目设置中补齐环境变量。

### 必需环境变量

| 变量名 | 描述 | 是否必需 |
| --- | --- | --- |
| `VITE_NETEASE_API_BASE` | 网易云音乐 API 实例地址 | 是 |
| `VITE_AI_PROVIDER` | AI 提供商，`google` 或 `openai` | 是 |
| `GEMINI_API_KEY` | Gemini API Key | 使用 Gemini 时需要 |
| `OPENAI_API_KEY` | OpenAI 兼容 API Key | 使用 OpenAI 兼容接口时需要 |
| `OPENAI_API_URL` | OpenAI 兼容接口地址，可填 base URL 或完整 `chat/completions` 地址 | 使用 OpenAI 兼容接口时需要 |
| `OPENAI_API_MODEL` | 模型名，例如 `gpt-4o`、`gpt-4.1-mini`、`deepseek-v4-flash` | 使用 OpenAI 兼容接口时需要 |

### 环境变量示例

Gemini：

```env
VITE_NETEASE_API_BASE=http://localhost:3000
VITE_AI_PROVIDER=google
GEMINI_API_KEY=your_google_gemini_api_key
```

OpenAI 兼容接口：

```env
VITE_NETEASE_API_BASE=http://localhost:3000
VITE_AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_API_URL=https://api.deepseek.com
OPENAI_API_MODEL=deepseek-v4-flash
```

OpenAI 官方接口：

```env
VITE_NETEASE_API_BASE=http://localhost:3000
VITE_AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_API_MODEL=gpt-4o
```

## 本地开发

推荐使用 `vercel dev`，这样本地环境会更接近线上部署行为。

### 1. 安装依赖

```bash
cd ~/coding/folia-major
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

如果你已经在 Vercel 中配置过环境变量，也可以直接拉取：

```bash
vercel env pull .env.local
```

### 3. 启动开发环境

```bash
vercel dev
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 构建 Web 版本 |
| `npm run preview` | 预览构建结果 |
| `npm run dev:electron` | 启动 Electron 开发模式 |
| `npm run dev:electron:dist` | 构建后以桌面模式运行 |
| `npm run build:electron` | 打包桌面端应用 |
