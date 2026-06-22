# 项目结构速查

这页不是完整的架构设计文档，而是一张“从哪里下手读代码”的速查地图。内容主要根据主仓库 `docs/technical.md`、`src/README.md` 以及当前功能结构整理。

## 总体分层

Folia 大致可以分成四块：

- `src/`：前端界面、播放逻辑、歌词解析、视觉模式、设置中心
- `api/`：Web 版部署时使用的 AI 主题接口
- `electron/`：桌面端主进程、Stage API、本地系统集成
- `test/` 与 `stage-client.html`：联调、手动测试与 Stage 相关验证入口

## 常见需求看哪里

| 需求 | 优先入口 |
| --- | --- |
| App 顶层装配、主界面状态拼接 | `src/App.tsx`、`src/components/app/*` |
| 设置中心 UI | `src/components/modal/SettingsModal.tsx`、`src/components/modal/settings/*` |
| 设置持久化与偏好状态 | `src/stores/useSettingsUiStore.ts` |
| 首页布局与入口 | `src/components/home/*`、相关 app/navigation 入口 |
| 播放页主体和面板 | `src/components/player/*`、`src/components/app/*` |
| 命令面板 | `src/components/command-palette/commandRegistry.ts` |
| visualizer 共享契约和注册 | `src/components/visualizer/definition.ts`、`src/components/visualizer/registry.tsx` |
| visualizer 预览和设置面板 | `src/components/visualizer/VisPlayground.tsx`、`src/components/visualizer/VisPlaygroundSettingsPanel.tsx` |
| 各个歌词动画模式 | `src/components/visualizer/<mode>/*` |
| 歌词解析、过滤和适配层 | `src/utils/lyrics/*` |
| 网易云 / 本地音乐 / Navidrome 服务 | `src/services/*` |
| 共享类型定义 | `src/types.ts` |
| Stage API 桌面端实现 | `electron/stageApi.cjs` |

## 设置中心结构

如果你是为了补文档、做设置说明或找用户可见能力，最值得先读的是这些文件：

- `src/components/modal/SettingsModal.tsx`
- `src/components/modal/settings/AppearanceSettingsSubview.tsx`
- `src/components/modal/settings/PlaybackSettingsSubview.tsx`
- `src/components/modal/settings/IntegrationSettingsSubview.tsx`
- `src/components/modal/settings/DesktopSettingsSubview.tsx`
- `src/components/modal/settings/StorageSettingsSection.tsx`
- `src/components/modal/settings/LabSettingsModal.tsx`
- `src/stores/useSettingsUiStore.ts`

这一组文件基本覆盖了：

- 用户可见设置项名称
- 哪些开关只在桌面端生效
- 哪些配置会持久化到本地
- 哪些功能只是 UI 行为，哪些会真正调用 Electron 或服务层

## 播放与歌词链路

如果你想理解“歌词为什么会这样显示”，可以按这条线看：

1. `src/App.tsx` 和 app 相关组装层处理当前播放状态。
2. `src/services/*` 负责不同来源的歌曲与歌词接入。
3. `src/utils/lyrics/*` 把不同格式歌词整理成统一结构。
4. `src/components/visualizer/*` 根据统一结构渲染不同动画模式。

这也是为什么文档站点里“播放说明”和“设置说明”最好分开写：前者偏用户体验，后者偏配置行为，但底层会共用同一套状态与歌词数据。

## Visualizer 相关入口

Folia 的歌词动画能力相对独立，适合单独阅读：

- `registry.tsx`：有哪些模式、每个模式叫什么、挂了什么设置面板
- `definition.ts`：共享契约
- `VisPlayground.tsx`：预览与调参入口
- `VisPlaygroundSettingsPanel.tsx`：用户实际可调的参数面板
- `src/components/visualizer/<mode>/entry.tsx`：某个模式如何注册到系统里
- `src/components/visualizer/<mode>/*`：具体模式实现

其中 `Partita` 模式仓库内还有单独 README，可帮助理解它如何从歌词 token 生成最终分层文字布局。

## 本地音乐、Navidrome 与外部集成

这几块比较容易在文档里被写得太浅，建议直接顺着代码读：

- 本地音乐：`src/services/localMusic*`、相关播放守卫与匹配逻辑
- Navidrome：`src/services/navidromeService*`、`src/types/navidrome*`
- Stage / Now Playing：`src/hooks/useStagePlaybackController*`、`electron/stageApi.cjs`
- OBS Browser Source：OBS 相关组件与桌面集成设置

## 文档维护建议

如果后续继续从主仓库同步内容到文档站点，比较稳的方式是：

- 用户功能说明优先读 `SettingsModal` 与各个 settings subview
- 开发者导向内容优先读 `docs/technical.md` 和 `src/README.md`
- 某个具体功能页再补读对应 `services`、`hooks`、`visualizer` 或 `electron` 文件

这样文档会更贴近真实实现，而不是只停留在 README 层面的概述。
