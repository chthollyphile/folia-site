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
| `stage-client.html` | Stage API 联调台入口 |

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
| `npm run test:ui` | 运行 Playwright UI 测试 |
| `npm run dev:electron` | 启动 Electron 开发模式 |
| `npm run dev:electron:dist` | 构建前端后以桌面模式运行 |
| `npm run build:electron` | 打包桌面版 |
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
