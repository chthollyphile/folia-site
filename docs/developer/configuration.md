# 配置说明

## 环境变量

来自主仓库根目录 `.env.example` 的核心变量如下。

| 变量名 | 是否必需 | 说明 |
| --- | --- | --- |
| `VITE_NETEASE_API_BASE` | 是 | 网易云 API 基地址 |
| `VITE_KUGOU_API_BASE` | 否 | Web 版 KuGouMusicApi 基地址；默认留空，Electron 版使用内置模块 |
| `VITE_QQ_API_BASE` | 否 | Web / 开发构建使用的 QQ 音乐 API 基地址；Cloudflare / Vercel 上可填 `/api/qq` 用仓库内置的 serverless 入口；默认留空，留空时 QQ 入口可见但不可用 |
| `QQ_SESSION_SECRET` | 用 `/api/qq` 时需要 | serverless 形态下加密登录态的服务端密钥，**不加 `VITE_` 前缀**；未设置时 QQ 登录路由返回 501，曲库路由仍可用 |
| `QQ_SESSION_SECRET_PREVIOUS` | 否 | 轮换 `QQ_SESSION_SECRET` 时用来验证旧令牌，避免把所有人一次性登出 |
| `VITE_AI_PROVIDER` | 是 | `google` 或 `openai` |
| `GEMINI_API_KEY` | 使用 Gemini 时必需 | Gemini Key |
| `OPENAI_API_KEY` | 使用 OpenAI 兼容接口时必需 | OpenAI 兼容 Key |
| `OPENAI_API_URL` | 使用 OpenAI 兼容接口时建议设置 | 可填 base URL 或完整 `chat/completions` 地址 |
| `OPENAI_API_MODEL` | 使用 OpenAI 兼容接口时建议设置 | 模型名 |
| `OPENAI_API_TEMPERATURE` | 否 | 取值 `0`–`2`，留空或无效时按 `0.7` 处理 |

`VITE_` 前缀的变量在构建时注入前端；其余变量只在服务端函数（Vercel `api/`、Cloudflare `worker/`）中读取，不会进入前端产物。

::: warning 温度参数
部分模型对温度有硬性要求，例如 `kimi-k3` 要求温度必须为 `1`。留空时 OpenAI 兼容接口按 `0.7` 处理。
:::

## 示例

### Gemini

```bash
VITE_NETEASE_API_BASE=http://localhost:3000
VITE_KUGOU_API_BASE=
VITE_QQ_API_BASE=
VITE_AI_PROVIDER=google
GEMINI_API_KEY=your_gemini_api_key_here
```

### Web 版酷狗 API

Web 版的酷狗搜索、播放、歌词和登录功能通过独立的 [KuGouMusicApi](https://github.com/MakcRe/KuGouMusicApi) 服务提供。主仓库不提供默认公共实例，部署后将服务根地址填入 `VITE_KUGOU_API_BASE`。Electron 版在主进程中直接调用内置模块，不需要配置这个变量。

注意: 本项目使用概念版接口，在 API 项目的环境变量中添加 `platform=lite`

Electron 的酷狗登录与账号刷新日志位于 `%APPDATA%\Folia\logs\kugou-provider.log`，日志中的 token、Cookie、userid、dfid 均已脱敏。

### Web 版 QQ 音乐 API

QQ 音乐由 npm 包 `@yakult-green-tea/qq-music-api` 提供，需要一个常驻 Node 进程（Docker、裸 Node，或 Electron 主进程内嵌）。原生扫码依赖 MQTT over WebSocket 长连线与进程内会话，因此不支持 Cloudflare Workers 与 Vercel Serverless。

Web 版把 `VITE_QQ_API_BASE` 指向实例地址即可；Electron 版在主进程内直接启动该包，不需要单独部署。

```bash
VITE_QQ_API_BASE=http://localhost:3200
```

### OpenAI 官方接口

```bash
VITE_NETEASE_API_BASE=http://localhost:3000
VITE_AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_API_MODEL=gpt-4o
OPENAI_API_TEMPERATURE=0.7
```

### 兼容接口示例

```bash
VITE_NETEASE_API_BASE=http://localhost:3000
VITE_AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_API_URL=https://api.deepseek.com
OPENAI_API_MODEL=deepseek-v4-flash
OPENAI_API_TEMPERATURE=0.7
```

### 本机同时调试三个服务

Vite 默认占用 `3000`，因此同时验收 Folia、网易云扫码和 QQ 扫码时，网易云 API 改用 `3300`，QQ API 使用 `3200`：

```bash
VITE_NETEASE_API_BASE=http://localhost:3300
VITE_QQ_API_BASE=http://localhost:3200
```

修改 `.env.local` 后必须重启 Vite。

## 桌面版设置项

桌面版除了读取运行环境外，还会在本地设置中持久化一些选项，例如：

- AI 提供商与 Key
- 是否为 AI 请求使用系统代理
- Stage Mode 是否启用、来源、Token 与端口
- 歌词接口是否启用（固定监听 `127.0.0.1:32109`，见[歌词接口](/developer/lyric-api)）
- 更新通道（Realeco / Limo / Cielo）、更新检查和自动更新开关
- 音频缓存目录

在线音乐账号的凭据不会明文留在渲染进程：QQ 只在渲染进程保存 opaque 的 `qqmusic_session`，酷狗的 Electron 链路只保留非敏感的 `userid` 提示，真实 token、Cookie 与 `dfid` 由主进程通过 `safeStorage` 加密持有。

## Navidrome 配置

Navidrome 在前端侧保存这些信息：

- `serverUrl`
- `username`
- `password`

接入时会按 Subsonic 标准的 salt + token 方式生成认证参数（`t = md5(密码 + salt)`，每次请求随机 salt），声明 API 版本 `1.16.1`、客户端标识 `Folia`、响应格式 JSON。**token 认证要求客户端持有明文密码，因此密码无法预先哈希，是明文保存的**——建议在服务端单独建一个只读账号给 Folia 用。

入口是 `src/services/navidromeService.ts`，它是独立的 Subsonic / OpenSubsonic 客户端，不属于 Omni provider，也不受在线 Provider 切换影响。因为走的是标准接口，其他 Subsonic 兼容服务端同样可以连接，能力上限取决于服务端实现了什么。

连接成功时 `getServerProfile` 会并行探测 `ping`、`getOpenSubsonicExtensions`、`getUser`、`getMusicFolders`、`getLicense` 并缓存结果，其中的扩展列表决定了 `songLyrics`、`playbackReport`、`transcoding`、`apiKeyAuthentication`、`formPost` 这几项能力是否可用。

## 同步服务

多端同步需要额外部署同步服务端，支持 Cloudflare D1 / Workers、Docker 与 Node.js 自托管三种方式，鉴权依赖 `SYNC_TOKEN`（客户端）与可选的 `DASHBOARD_TOKEN`（状态看板）。部署步骤见[部署同步服务](/guide/deploy-sync)。

## 本地音乐运行条件

本地音乐功能依赖浏览器或桌面运行环境的文件访问能力。桌面版体验会更完整；Web 版则依赖宿主环境是否支持文件系统访问接口。

可导入的音频扩展名分两档：

- 所有版本：`mp3`、`flac`、`m4a`、`wav`、`ogg`、`opus`、`aac`
- 桌面版额外支持（需要 `window.electron.requestTranscodeFallback` 存在）：`alac`、`ape`、`wv`、`tta`、`wma`、`aif`、`aiff`、`caf`；播放时用内置 FFmpeg 转码回退，不改动原文件

自动扫描依赖运行环境的 `FileSystemObserver`；不支持时设置页不会显示这一节。
