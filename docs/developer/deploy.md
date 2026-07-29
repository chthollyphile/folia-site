# 部署指南

Folia 有两种主要运行方式：

- Web 版：适合浏览器、自托管和多端访问
- 桌面版：适合本地完整体验

## Web 版部署

### 前置条件

你至少需要准备两类外部依赖：

1. 网易云 API 服务
2. （可选）酷狗 API 服务
3. AI 接口配置

### 网易云 API 的部署来源

Folia 当前依赖的后端项目是：

- [NeteaseCloudMusicApiEnhanced/api-enhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced)

按其官方文档，常见部署方式包括：

- 直接运行 Node 服务：`pnpm i` 后执行 `node app.js`
- 使用 `npx @neteaseapireborn/api@latest`
- 将该 API 项目单独部署到 Vercel

官方文档还说明：

- 默认端口是 `3000`
- 默认 host 是 `localhost`
- Vercel 版接口在部分请求中可能需要额外传 `realIP`

### 酷狗 API 的部署

Web 版的酷狗音乐功能使用独立的 [KuGouMusicApi](https://github.com/MakcRe/KuGouMusicApi) 服务，主仓库不会自动提供公共实例。可按该项目文档选择以下方式：

- 直接运行 Node 服务：`npm install` 后执行 `npm run dev`，默认端口为 `3000`
- 将 KuGouMusicApi fork 到自己的 GitHub 账号后导入 Vercel，`Framework Preset` 选择 `Other`

注意: 本项目使用概念版接口，在 API 项目的环境变量中添加 `platform=lite`

服务部署完成后，在 Folia Web 项目中设置：

```env
VITE_KUGOU_API_BASE=https://your-kugou-api.example.com
```

该变量只在 Web 版构建时使用。桌面版在 Electron 主进程中调用内置模块，不需要启动酷狗 HTTP 服务。完整 Docker 说明见[主仓库 Docker 部署文档](https://github.com/chthollyphile/folia-major/tree/main/deploy/docker)。

### 一键部署到 Vercel

可以直接使用：

[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https://github.com/chthollyphile/folia-major)

部署后补齐环境变量，变量表见 [配置说明](/developer/configuration)。

### 部署到 Cloudflare

项目仓库已经包含 Cloudflare 所需的基础入口：

- `wrangler.jsonc`
- `worker/index.ts`
- `dist/` 作为静态资源目录

典型流程：

```bash
npm install
npm run build
npx wrangler login
npx wrangler deploy
```

当前 `wrangler.jsonc` 配置会：

- 以 `./worker/index.ts` 作为 Worker 入口
- 以 `./dist` 作为静态资源目录
- 对 `/api/*` 请求优先交给 Worker 处理

部署到 Cloudflare 时，同样需要配置和 Vercel 一致的环境变量，见 [配置说明](/developer/configuration)。

### Docker 部署

如果希望一次部署前端、网易云 API、酷狗 API 和同步服务，可使用主仓库的 Docker Compose 堆栈：

```bash
docker compose config
docker compose pull
docker compose up -d --wait
```

Compose 内部会将 `/netease/` 和 `/kugou/` 分别转发到对应 API 容器，因此 Docker 部署不需要另外填写 `VITE_KUGOU_API_BASE`。默认 Web 地址为 `http://NAS-IP:18080`。

### 本地开发

推荐使用 `vercel dev`，它会模拟 Vercel 的运行环境，从而支持 `api/` 目录下的AI主题接口功能：

```bash
npm install
cp .env.example .env.local
vercel dev
```

建议先在 Vercel 配置好环境变量，接入你的仓库CI/CD流水线，然后：

```bash
vercel env pull .env.local
```

这样就能保证本地开发环境和线上环境的一致性，避免一些环境变量导致的调试问题，也更方便做版本控制。

## 桌面版开发

### 启动 Electron 开发环境

```bash
npm install
npm run dev:electron
```

这会同时启动：

- Vite 前端开发服务器
- Electron 主进程

### 用构建产物运行桌面版

```bash
npm run dev:electron:dist
```

## 打包桌面版

```bash
npm run build:electron
```

当前构建配置覆盖：

- Windows `nsis`
- macOS `dmg`
- Linux `tar.gz` / `deb` / `rpm`

## 运行时注意事项

### 网易云 API

桌面版会在本地启动内嵌的 Netease API 服务；Web 版则需要你自己提供一个可访问的 API 地址。

### Linux 图形兼容

桌面版在 Linux 下包含若干图形兼容分支，可通过不同脚本使用更保守的渲染模式：

```bash
npm run dev:electron:dist:swiftshader
npm run dev:electron:dist:software
```

如果你要排查 Wayland / Vulkan / 驱动兼容问题，这两个脚本会很有帮助。
