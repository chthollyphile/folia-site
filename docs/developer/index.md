> [!TIP]
> 文档建设中，欢迎提交 Pull Request 来完善它！[文档 GitHub 地址](https://github.com/chthollyphile/folia-site)

# 开发者文档

本部分面向准备部署、二次开发或与 Folia 集成的开发者。

## 你会在这里找到什么

- Web / 桌面版开发与部署方式
- 环境变量和运行前提
- Stage API 与 AI 主题接口说明
- 从代码结构快速定位功能入口的方法

## 项目结构概览

Folia 主要由这些部分构成：

| 目录 | 作用 |
| --- | --- |
| `src/` | React 前端、播放逻辑、歌词解析、视觉模式、各类服务 |
| `api/` | Web 部署时使用的 AI 主题接口 |
| `electron/` | 桌面端主进程、Stage API、本地集成能力 |
| `stage-client.html` | Stage API 联调台入口 |

## 技术栈

- React 19
- Vite 6
- TypeScript
- Electron
- Tailwind CSS 4
- Framer Motion
- i18next

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Web 前端开发环境 |
| `npm run build` | 构建 Web 版本 |
| `npm run preview` | 预览构建结果 |
| `npm run test` | 运行单元测试 |
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
5. [AI 主题接口](/developer/ai-theme-api)
6. [歌词动画视觉效果器](/developer/visualizer)
