# 项目结构速查

这页不是完整的架构设计文档，而是一张“从哪里下手读代码”的速查地图。内容按主仓库 `src/README.md`、`docs/technical.md` 与当前目录结构整理。

原则：先找第一入口，再沿一层 import / call chain 追实现；不要因为 `src/App.tsx` 是主入口就全文阅读它。

## 总体分层

- `src/`：前端界面、播放逻辑、歌词解析、视觉模式、设置中心
- `src/mods/`：实验性模组系统的前端侧
- `skills/` 与 `docs/CODEMAP.md`：主仓库的 AI 协作规则与自动生成的代码地图；`docs/CODEMAP.md` 由 `npm run codemap` 生成，CI 会重新生成并比对，**不要手改**
- `api-ts/` → `api/`：Vercel 服务端函数源码与编译产物；`worker/` 是同一批接口的 Cloudflare 版本
- `shared/`：Web、Worker 与 Electron 共用的主题清洗等公共代码
- `electron/`：桌面端主进程、Stage API、歌词接口、本地系统集成
- `sync-server/`：官方同步服务端
- `test/` 与 `stage-client.html`：联调、手动测试与 Stage 相关验证入口

## 启动与渲染入口

```text
src/index.tsx
  -> 安装 Buffer 与 visualizer frame-rate limiter
  -> src/bootstrap.tsx
       -> index.css / i18n
       -> /obs、?remote=1 等特殊入口
       -> App.tsx
```

`src/bootstrap.tsx` 按 URL 选择根组件：

| 入口 | 组件 |
| --- | --- |
| 普通应用 | `src/App.tsx` |
| OBS 歌词源 | `components/obs/ObsBrowserSourceApp.tsx` |
| OBS Now Playing | `components/obs/ObsNowPlayingSourceApp.tsx` |
| OBS PlayerCap | `components/obs/ObsPlayerCapSourceApp.tsx` |
| 遥控窗 | `components/remote/RemoteControlApp.tsx` |

普通应用的主要装配关系：

```text
App.tsx
  -> AppShell（窗口 chrome + audio 节点）
  -> Home（GridViewOverlayHost + Grid3D）
  -> VisualizerRenderer（registry mode + background + harmony overlay）
  -> AppOverlays（搜索、浮动控制、debug）
  -> PlayerPanel（UnifiedPanel 的 app-level model）
  -> AppDialogs（设置、歌词匹配、替代歌曲、toast 等）
  -> CommandPalette / ThemeQuickEditorHost / UserGuideModal
```

`App.tsx` 是历史大型编排文件。新功能应放到下面的相邻目录，通过 model / builder、hook、store 或 service 接入，而不是继续往里堆 JSX、请求和副作用。

## 常见需求看哪里

| 需求 | 优先入口 |
| --- | --- |
| 应用壳与窗口行为 | `src/components/app/AppShell.tsx`、`TitlebarDragZone.tsx`、`WindowControls.tsx` |
| 首页 | `src/components/app/Home.tsx`、`app/home/buildHomeModel.ts` |
| 播放器面板 | `src/components/app/PlayerPanel.tsx`、`app/player-panel/buildPlayerPanelModel.ts` |
| overlay（搜索、浮动控制、debug） | `src/components/app/overlays/AppOverlays.tsx`、`buildAppOverlaysModel.ts` |
| 弹窗装配 | `src/components/app/dialogs/AppDialogs.tsx`、`buildAppDialogsModel.ts`、`buildSettingsDialogModel.ts` |
| 播放恢复与 URL 还原 | `src/components/app/playback/restorePlaybackSource.ts`、`createOnlineRecoveryController.ts` |
| 搜索工作区 | `src/components/app/search/SearchWorkspace.tsx`、`searchTrackActions.ts` |
| app-level 导航 | `src/components/app/navigation/*` |
| 展示派生（样式、主题、debug 快照） | `src/components/app/presentation/*` |
| 设置中心 UI | `src/components/modal/SettingsModal.tsx`、`src/components/modal/settings/*` |
| 设置弹窗导航与打开状态 | `src/stores/useSettingsModalStore.ts`、`src/components/modal/settings/navigation/*` |
| 命令面板 | `src/components/command-palette/commandRegistry.ts`、`commands/*`、`surfaces/*`、`syntax/*`、`search/*` |
| Lattice 队列拼贴 | `src/components/app/lattice/*`（`Lattice.tsx` 是入口，`PosterWall.tsx` 负责墙，`layout.ts` / `blockReflows.ts` 负责排布，`lyrics/*` 是卡片上的轻量歌词） |
| 播放后进入哪个视图 | `src/stores/usePlaybackEntryViewStore.ts`、`src/components/modal/playback-entry-view/*` |
| Folia 智能过渡 | `src/services/automix/*`、`src/stores/useAutomixSettingsStore.ts`、`src/components/modal/settings/TransitionSettingsSection.tsx`、`AutomixModelsSection.tsx` |
| 模组系统 | `src/mods/*`（前端）、`electron/modSystem/*`（加载器与安装校验） |
| 音频转码回退 | `electron/transcode/*`、`ffmpeg-audio/` |
| 壁纸模式 | `electron/windowsWallpaperController.cjs`、`macWallpaperController.cjs`、`wallpaperWatchdog.cjs` |
| visualizer 共享契约和注册 | `src/components/visualizer/definition.ts`、`registry.tsx`、`tuningRegistry.ts` |
| visualizer 预览与调参 | `src/components/visualizer/VisPlayground.tsx`、`VisPlaygroundSettingsPanel.tsx` |
| 各个歌词动画模式 | `src/components/visualizer/<mode>/*` |
| 歌词解析、过滤和适配层 | `src/utils/lyrics/*` |
| 在线音乐统一入口与 Provider 注册 | `src/services/onlineMusic/omni.ts`、`providerRegistry.ts` |
| 本地音乐 / Navidrome / 播放服务 | `src/services/*` |
| 共享类型定义 | `src/types.ts`、`src/types/*` |
| Stage API 桌面端实现 | `electron/stageApi.cjs` |
| 歌词接口桌面端实现 | `electron/lyricApi.cjs` |

## Hooks 与 stores

- 播放桥接：`usePlaybackAudioBridge`、`usePlaybackTransportController`、`usePlaybackQueueController`、`usePlaybackInteractionBridge`、`usePlaybackUiEffects`、`usePlaybackVisualizerBridge`
- 本地与在线库：`useLocalLibraryCatalog`、`useNeteaseLibrary`、`useKugouLibrary`、`useQqLibrary`、`useOnlineProviderPlatform`、`useOnlineProviderQrLogin`
- 外部 surface：`useStagePlaybackController`、`useNowPlayingSource`、`usePlayerCapSource`、`useObsBrowserSourcePublisher`、`useLyricApiPublisher`
- 恢复、主题与窗口：`useSessionRestoreController`、`useThemeController`、`useAppPreferences`，以及各 Electron bridge hook
- 导航 / 搜索 / 集合：`useAppNavigation.ts`、`useSearchNavigationStore.ts`、`useCollectionNavigationStore.ts`
- 设置 / 账户 / quick editor：`useSettingsModalStore.ts`、`useOnlineProviderAccountStore.ts`、`useThemeQuickEditorStore.ts`
- 界面与外观偏好：`useAppChromeStore.ts`、`useGridViewSettingsStore.ts`、`useHomeLayoutSettingsStore.ts`、`useLatticeSettingsStore.ts`、`useLatticeControlsStore.ts`、`usePlayerChromeSettingsStore.ts`、`usePlayerBottomBarLayoutStore.ts`、`useTypographySettingsStore.ts`
- 行为与功能开关：`useInteractionSettingsStore.ts`、`useAutomixSettingsStore.ts`、`useAudioSettingsStore.ts`、`useLyricSettingsStore.ts`、`useLyricSegmentationStore.ts`、`useLocalLibrarySettingsStore.ts`、`useSleepTimerStore.ts`、`usePersonalFmModeStore.ts`、`usePlaybackEntryViewStore.ts`、`useDesktopSettingsStore.ts`
- 视图与网格：`useAppViewStore.ts`（`home` / `player` / `lattice` 三个视图）、`useGridSurfaceStore.ts`（网格把自己的能力发布给命令面板）

## Services

- 在线歌曲公共边界：`services/onlineMusic/omni.ts`；provider adapter / transport 只在实现层使用，详见 [Omni 在线音乐服务层](/developer/omni)
- 本地库：`localLibraryCatalogService.ts`、`localLibraryCatalogInternals.ts`、`localLibraryImportCatalog.ts`、`localMusicService.ts`、`localPlaylistService.ts`
- 本地实体：`localLibraryEntityMutations.ts`、`localLibraryEntityRepository.ts`
- Navidrome：`navidromeService.ts`；它是独立的 Subsonic / OpenSubsonic 客户端，不是 Omni provider。能力探测在 `getServerProfile`，歌词在 `utils/lyrics/navidromeStructuredLyrics.ts` 与 `adapters/NavidromeLyricAdapter.ts`，播放上报在 `utils/navidromeScrobble.ts`
- 智能过渡：`services/automix/*`，过渡策略在 `transitionStrategy.ts`
- 播放：`onlinePlayback.ts`、`playbackAdapters.ts`、`prefetchService.ts`、`nowPlayingProvider.ts`、`playerCapProvider.ts`
- 音频处理：`audioEqualizerGraph.ts`、`audioEffects/*`
- 缓存 / 数据库：`db.ts`、`appDatabase.ts`、`repositories/*`、`coverCache.ts`、`audioCache.ts`、`binaryAssetStore.ts`
- 主题：`themeCache.ts`、`themePreferences.ts`、`themeSanitizer.ts`、`visualizerImageAsset.ts`、Monet 图像服务
- 同步：`services/sync/*`，编排从 `syncCoordinator.ts` 开始，配置快照在 `settingsSnapshot.ts`

## 设置中心结构

如果你是为了补文档、做设置说明或找用户可见能力，最值得先读的是这些文件：

- `src/components/modal/SettingsModal.tsx`
- `src/components/modal/settings/AppearanceSettingsSubview.tsx`
- `src/components/modal/settings/GeneralSettingsSubview.tsx`
- `src/components/modal/settings/PlaybackSettingsSubview.tsx`
- `src/components/modal/settings/IntegrationSettingsSubview.tsx`
- `src/components/modal/settings/DesktopSettingsSubview.tsx`
- `src/components/modal/settings/StorageSettingsSection.tsx`
- `src/components/modal/settings/PinnedCommandSettings.tsx`
- `src/components/modal/settings/InteractionSettingsSubview.tsx`
- `src/components/modal/settings/LabSettingsModal.tsx`
- `src/components/modal/settings/navigation/settingsNavModel.ts`（侧栏分组、顺序、标题的唯一真源）
- `src/components/modal/settings/navigation/settingsAnchorModel.ts`（每个小节属于哪一页、用哪个翻译键；命令面板的“直达小节”依赖它）
- `src/stores/useSettingsModalStore.ts`

这一组文件基本覆盖了：

- 用户可见设置项名称
- 哪些开关只在桌面端生效
- 哪些配置会持久化到本地
- 哪些功能只是 UI 行为，哪些会真正调用 Electron 或服务层

视觉配置的导入导出集中在 `AppearanceSettingsSubview.tsx` 的 `buildCurrentConfig`、`compressConfig`、`decompressConfig`、`validKeys` 和 `handleImportConfig`。新增视觉设置时必须同步这里；新增功能性设置和可执行动作则要注册到 `commandRegistry.ts`。

## 播放与歌词链路

如果你想理解“歌词为什么会这样显示”，可以按这条线看：

1. `src/App.tsx` 和 app 相关组装层处理当前播放状态。
2. `src/services/*` 负责不同来源的歌曲与歌词接入。
3. `src/utils/lyrics/*` 把不同格式歌词整理成统一结构；解析真源是 `parserCore.ts`，工厂是 `LyricParserFactory.ts`，重解析可走 `workers/lyricsParser.worker.ts`。
4. `src/utils/lyrics/renderHints.ts` 补齐行时序提示，`cjkSemanticLayout.ts` 与 `graphemeTiming.ts` 负责显示单元和逐字符时间轴。
5. `src/components/visualizer/*` 根据统一结构渲染不同动画模式。

在线音乐页面调用应经由 `src/services/onlineMusic/omni.ts`：它根据当前 Provider 或歌曲 / 集合归属路由到底层服务，并负责 Provider 切换期间的异步响应防护。详见 [Omni 在线音乐服务层](/developer/omni)。

## Visualizer 相关入口

Folia 的歌词动画能力相对独立，适合单独阅读：

- `registry.tsx`：有哪些模式、每个模式叫什么、挂了什么设置面板；模式通过 `import.meta.glob('./*/entry.tsx')` 自动发现
- `definition.ts`：共享契约
- `runtime.ts`：当前行、上一句、下一句和预热窗口的共享工具
- `VisualizerShell.tsx`：外层容器、背景层、字体注入
- `backgrounds/registry.tsx`：背景 entry 注册
- `VisPlayground.tsx` / `VisPlaygroundSettingsPanel.tsx`：预览与调参入口
- `src/components/visualizer/<mode>/entry.tsx`：某个模式如何注册到系统里

其中 `Partita` 与整个 visualizer 目录在主仓库内还有单独 README，可帮助理解歌词 token 如何变成最终分层文字布局。详见[歌词动画视觉效果器](/developer/visualizer)。

## 类型与本地化

- 共享产品类型：`src/types.ts`
- 领域类型：`src/types/appPlayback.ts`、`localLibrary.ts`、`localCover.ts`、`navidrome.ts`、`obsBrowserSource.ts`、`onlineMusic.ts`、`playerCap.ts`、`remoteControl.ts`、`videoExport.ts`、`webLyricSource.ts`、`lyricApi.ts`
- 本地化：`src/i18n/locales/en.ts`、`zh-CN.ts`、`in.ts`，配置在 `src/i18n/config.ts`；新增用户可见文案要三份同步

## 外部与服务端边界

- Stage：`hooks/useStagePlaybackController.ts`、`utils/appStageHelpers.ts`、`utils/stagePlayerSnapshot.ts`、`utils/stageClientDemo.ts`、`electron/stageApi.cjs`
- 歌词接口：`hooks/useLyricApiPublisher.ts`、`types/lyricApi.ts`、`electron/lyricApi.cjs`
- Electron：`electron/main.cjs`、`preload.cjs`、`kugouApiBridge.cjs`、`qqApiStartup.cjs`、`neteaseApiStartup.cjs`、`updateChannels.cjs`、`windowPlaybackHandoff.cjs`
- Web API handlers：`api-ts/`（源码）编译到 `api/`（Vercel 部署入口）；`worker/` 是 Cloudflare 版本，公共代码在 `shared/`
- Sync Server：`sync-server/src/app.ts`（路由与协议）、`src/node.ts`、`src/cloudflare.ts`、`src/d1-emulator.ts`；Worker 包装在根 `worker/index.ts`

## 改动通常落在哪里

1. 先用 `git ls-files` 验证路径，再用 `rg -n` 搜确切 symbol。
2. UI 结构改 `components`；app-level props / 导航 / 展示派生改相邻 `components/app/*/build*.ts` 或 `create*.ts`。
3. 生命周期、副作用、用户动作编排改 `hooks`；跨组件状态改 `stores`。
4. 请求、缓存、解析、provider 和播放流程改 `services`；纯计算改 `utils`。
5. 在线歌曲先经过 `services/onlineMusic/omni.ts`，不要从组件直接调用 provider adapter。
6. visualizer 只消费解析后的 `LyricData` / `Line` / `Word`，不要把格式解析或 provider 逻辑塞进模式组件。
7. 新用户可见文案同步三份 locale；新增设置同时检查视觉导入导出和 command palette。

## 文档维护建议

如果后续继续从主仓库同步内容到文档站点，比较稳的方式是：

- 先读主仓库 `docs/CODEMAP.md`（自动生成，结构上不会过期）确认区域分布和枢纽模块
- 用户功能说明优先读 `SettingsModal` 与各个 settings subview，再读 `src/i18n/locales/zh-CN.ts`：所有用户可见文案（含命令面板每条命令的中文标题和说明、以及 `releaseNotes` 里的版本更新说明）都在那里
- 开发者导向内容优先读主仓库 `docs/technical.md`、`src/README.md`、`src/components/visualizer/README.md` 和 `src/services/onlineMusic/README.md`
- 某个具体功能页再补读对应 `services`、`hooks`、`visualizer` 或 `electron` 文件

这样文档会更贴近真实实现，而不是只停留在 README 层面的概述。
