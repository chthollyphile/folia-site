# 部署指南

Folia 有两种主要运行方式：

- Web 版：适合浏览器、自托管和多端访问
- 桌面版：适合本地完整体验

开发和构建都要求 Node.js 24 或更高版本（主仓库 `.nvmrc` 为 `24`）。

## Web 版部署

### 前置条件

你至少需要准备这几类外部依赖：

1. 网易云 API 服务（必需）
2. 酷狗 API 服务（可选）
3. QQ 音乐 API 服务（可选）
4. AI 接口配置（AI 主题需要）
5. 同步服务（多端同步需要，见[部署同步服务](/guide/deploy-sync)）

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

该变量只在 Web 版构建时使用。桌面版在 Electron 主进程中调用内置模块，不需要启动酷狗 HTTP 服务。

### QQ 音乐 API 的部署

QQ 音乐由 npm 包 `@yakult-green-tea/qq-music-api` 提供，需要一个常驻的 Node 进程：Docker 容器、裸 Node，或 Electron 主进程内嵌。

::: warning 不支持 Serverless
原生扫码依赖 MQTT over WebSocket 长连线与进程内会话，因此 QQ 音乐 API 暂不能部署到 Cloudflare Workers 或 Vercel Serverless。
:::

部署完成后填写：

```env
VITE_QQ_API_BASE=https://your-qq-api.example.com
```

留空时 QQ 入口仍然可见，但该 Provider 不可用。完整的部署方式、环境变量和装置状态说明见主仓库 [`deploy/docker/qq-api/README.md`](https://github.com/chthollyphile/folia-major/tree/main/deploy/docker/qq-api)。桌面版在主进程内直接启动该包，不需要单独部署。

### 一键部署到 Vercel

可以直接使用：

[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https://github.com/chthollyphile/folia-major)

部署后补齐环境变量，变量表见 [配置说明](/developer/configuration)。

服务端函数的源码在 `api-ts/`，`npm run build` 会先执行 `npm run build:vercel-api`（`tsc -p api-ts/tsconfig.json`）把它编译到 Vercel 实际使用的 `api/` 目录，再执行 `vite build`。修改接口时改 `api-ts/`，不要只改编译产物。

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
- 以 `./dist` 作为静态资源目录，并按单页应用处理 404
- 对 `/api/*` 请求优先交给 Worker 处理

Worker 目前接管三个路由，其余请求回落到静态资源：

- `/api/generate-theme`
- `/api/generate-theme_openai`
- `/api/lyric-proxy`

部署到 Cloudflare 时，同样需要配置和 Vercel 一致的环境变量，见 [配置说明](/developer/configuration)。注意 QQ 音乐 API 无法运行在 Workers 上，需要另找常驻 Node 环境。

### Docker 部署

如果希望一次部署前端、网易云 API、酷狗 API、QQ 音乐 API 和同步服务，可使用主仓库的 Docker Compose 堆栈：

```bash
docker compose config
docker compose pull
docker compose up -d --wait
```

要求 Docker Engine 24+ 与 Docker Compose v2。Compose 内部由 gateway 转发到各音源 API 容器，因此 Docker 部署不需要另外填写 `VITE_KUGOU_API_BASE` 或 `VITE_QQ_API_BASE`。默认地址：

- Web：`http://NAS-IP:18080`
- Sync Server：`http://NAS-IP:13000/health`

各音源 API 与 Folia Web API 不暴露宿主机端口，只能经 gateway 访问。完整说明见[Docker 全栈部署](/guide/deploy-docker)与[主仓库 Docker 文档](https://github.com/chthollyphile/folia-major/tree/main/deploy/docker)。

### 本地开发

推荐使用 `vercel dev`，它会模拟 Vercel 的运行环境，从而支持 `api/` 目录下的 AI 主题接口功能：

```bash
npm install
cp .env.example .env.local
vercel dev
```

建议先在 Vercel 配置好环境变量，接入你的仓库 CI/CD 流水线，然后：

```bash
vercel env pull .env.local
```

这样就能保证本地开发环境和线上环境的一致性，避免一些环境变量导致的调试问题，也更方便做版本控制。

只做前端开发时，`npm run dev` 直接启动 Vite 即可；此时 `api/` 下的服务端函数不会被挂载，AI 主题接口不可用。

## 桌面版开发

### 启动 Electron 开发环境

```bash
npm install
npm run dev:electron
```

这会同时启动：

- Vite 前端开发服务器
- Electron 主进程

主进程会按需拉起内嵌的网易云 API 与 QQ 音乐 API，并直接调用内置的 KuGouMusicApi 模块。

### 用构建产物运行桌面版

```bash
npm run dev:electron:dist
```

## 打包桌面版

```bash
npm run build:electron
```

当前 `electron-builder` 配置覆盖：

- Windows：`nsis`
- macOS：`dmg` 与 `zip`，均包含 `x64` / `arm64`
- Linux：`tar.gz` / `deb` / `rpm`，可执行文件名为 `folia-major`

只想在 Linux 上验证打包目录结构时，可用 `npm run build:electron:dir`（等价于 `electron-builder --linux dir`）。

正式发布走 Realeco / Limo / Cielo 三条通道，触发条件见[技术说明](/developer/technical#发布与更新通道)。

## 运行时注意事项

### 网易云 API

桌面版会在本地启动内嵌的 Netease API 服务；Web 版则需要你自己提供一个可访问的 API 地址。

### 本地集成接口

桌面版还会按设置开放两个本机接口：

- Stage API：默认 `http://127.0.0.1:32107`，Bearer Token 鉴权，见 [Stage API](/developer/stage-api)
- 歌词接口：固定 `http://127.0.0.1:32109/v1/lyric`，无鉴权只读，见[歌词接口](/developer/lyric-api)

两者都只监听回环地址，不要通过端口转发或反向代理暴露到不可信网络。

### Linux 图形兼容

桌面版在 Linux 下包含若干图形兼容分支，可通过不同脚本使用更保守的渲染模式：

```bash
npm run dev:electron:dist:swiftshader
npm run dev:electron:dist:software
```

它们分别通过 `FOLIA_LINUX_GRAPHICS_MODE=swiftshader` 与 `software` 生效。如果你要排查 Wayland / Vulkan / 驱动兼容问题，这两个脚本会很有帮助。

## 验证

```bash
npm run typecheck   # 类型检查
npm run test        # Vitest 单元测试
npm run test:ui     # Playwright UI 测试
```
