> [!TIP]
> 文档建设中，欢迎提交 Pull Request 来完善它！[文档 GitHub 地址](https://github.com/chthollyphile/folia-site)

# 开发者文档

本部分面向准备部署、二次开发或与 Folia 集成的开发者。

## 你会在这里找到什么

- Web / 桌面版开发与部署方式
- 环境变量和运行前提
- Stage API、歌词接口与 AI 主题接口说明
- 在线音乐 Omni 服务层与 Provider 扩展约定
- 从代码结构快速定位功能入口的方法

## 项目结构概览

Folia 主要由这些部分构成：

| 目录 | 作用 |
| --- | --- |
| `src/` | React 前端、播放逻辑、歌词解析、视觉模式、各类服务 |
| `api-ts/` | Vercel 服务端函数的 TypeScript 源码 |
| `api/` | 由 `api-ts/` 编译产出、供 Vercel 部署使用的接口 |
| `worker/` | Cloudflare Worker 入口与同一批接口的 Worker 版实现 |
| `shared/` | Web、Worker 与 Electron 共用的主题清洗等公共代码 |
| `electron/` | 桌面端主进程、Stage API、歌词接口、本地集成能力 |
| `sync-server/` | 官方同步服务端（Cloudflare D1 / Docker / Node 三种部署） |
| `deploy/docker/` | Docker Compose 全栈部署（前端 + 各音源 API + 同步服务） |
| `skills/` | 主仓库内的开发规则集，约束模块划分、复用和设置接入方式 |
| `dev/` | 开发期工具：代码地图生成器（`dev/mcp/ts-code-map/`）、UI probe、拼音索引插件等 |
| `mods/` | 实验性模组系统加载模组的目录 |
| `models/` | Automix 分析模型（按需下载，不进安装包） |
| `ffmpeg-audio/` | 桌面端音频转码回退用的 FFmpeg 相关资源 |
| `stage-client.html` | Stage API 联调台入口 |

主仓库还有一份自动生成的代码地图 `docs/CODEMAP.md`（由 `npm run codemap` 生成，CI 会重新生成并比对）。它给出区域分布、枢纽模块、`import.meta.glob` 动态注册点的完整展开和分层边界违规——**找不到代码在哪里时先读它**，不要手改它。

## 技术栈

- React 19
- Vite 8
- TypeScript 7
- Electron 43
- Tailwind CSS 4
- Framer Motion 13
- Zustand 5 / Dexie 4
- i18next 26
- Three.js（Diorama）、Pixi.js（Sonnet）

运行环境要求 Node.js 24 或更高版本。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Web 前端开发环境 |
| `npm run build` | 编译 `api-ts/` 到 `api/` 并构建 Web 版本 |
| `npm run preview` | 预览构建结果 |
| `npm run typecheck` | 全项目类型检查 |
| `npm run test` | 运行 Vitest 单元测试 |
| `npm run test:ui` | 运行 Playwright UI 截图测试 |
| `npm run test:component` | 只跑组件级 Playwright 测试 |
| `npm run test:render` | 跑 dev probe 渲染测试 |
| `npm run codemap` | 重新生成 `docs/CODEMAP.md` |
| `npm run codemap:check` | 检查代码地图是否与当前结构一致 |
| `npm run dev:electron` | 启动 Electron 开发模式 |
| `npm run dev:electron:dist` | 构建前端后以桌面模式运行 |
| `npm run build:electron` | 打包桌面版 |
| `npm run build:ffmpeg` | 拉取桌面端转码用的 FFmpeg |
| `npm run models:fetch` | 拉取 Automix 分析模型 |
| `npm run stage:client` | 打开 Stage API 联调台 |

## 推荐阅读顺序

1. [部署指南](/developer/deploy)
2. [配置说明](/developer/configuration)
3. [项目结构速查](/developer/project-map)
4. [Stage API](/developer/stage-api)
5. [歌词接口](/developer/lyric-api)
6. [AI 主题接口](/developer/ai-theme-api)
7. [Omni 在线音乐服务层](/developer/omni)
8. [歌词动画视觉效果器](/developer/visualizer)
