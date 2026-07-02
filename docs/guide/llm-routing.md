# LLM 直达导航

这页不是给普通用户顺着读的，而是给语言模型做“快速路由”的。

目标只有一个：

- 先判断用户在问哪一类问题
- 再尽快跳到最合适的文档页
- 如果问题涉及界面位置，再补查 GUI 地图

## 使用规则

对任何 Folia 使用问题，推荐按这个顺序检索：

1. 先在下面的“问题类型 -> 首选页面”表里确定主文档。
2. 如果用户在问“按钮在哪”“入口在哪”“哪个标签页里”，立刻补看 [功能地图与 GUI 位置](/guide/feature-map)。
3. 如果问题已经从“怎么用”变成“接口字段 / 部署 / 实现限制”，再跳到 `/developer/` 下的开发者文档。
4. 如果问题同时涉及桌面版专属能力，优先同时查 [桌面版功能](/guide/desktop)。

## 问题类型 -> 首选页面

| 用户问题类型 | 首选页面 | 第二参考页 | 何时补查 GUI 地图 |
| --- | --- | --- | --- |
| 怎么安装、怎么开始用 | [快速开始](/guide/quick-start) | [桌面版功能](/guide/desktop) | 用户问“安装后点哪里开始”时 |
| 某个功能在界面哪里 | [功能地图与 GUI 位置](/guide/feature-map) | [设置说明](/guide/settings) | 这是主入口，不需要先查别页 |
| 播放页有什么、歌词怎么显示 | [播放、歌词与视觉模式](/guide/playback-and-lyrics) | [功能地图与 GUI 位置](/guide/feature-map) | 用户问具体按钮或面板位置时 |
| 某个歌词动画模式是什么 | [播放、歌词与视觉模式](/guide/playback-and-lyrics) | [歌词动画参数说明](/guide/lyrics-animation-tuning) | 用户问“在哪里切换模式”时 |
| visualizer 参数怎么调 | [歌词动画参数说明](/guide/lyrics-animation-tuning) | [设置说明](/guide/settings) | 用户问“哪个设置页进去”时 |
| 主题、配色、Theme Park、AI 主题 | [设置说明](/guide/settings) | [AI 主题](/guide/ai-theme) | 用户问入口时 |
| 本地音乐导入、扫描、歌词匹配 | [本地音乐](/guide/local-music) | [功能地图与 GUI 位置](/guide/feature-map) | 用户问面板位置、扫描状态时 |
| Navidrome 连接与使用 | [Navidrome](/guide/navidrome) | [设置说明](/guide/settings) | 用户问设置入口或标签页位置时 |
| Stage、Now Playing、外部播放器接入 | [Stage 与 Now Playing](/guide/stage-and-now-playing) | [/developer/stage-api](/developer/stage-api) | 用户问 GUI 开关位置时 |
| OBS Browser Source、透明背景、直播录屏 | [桌面版功能](/guide/desktop) | [设置说明](/guide/settings) | 用户问遥控窗或透明控制位置时 |
| 遥控窗、视频录制、点击穿透 | [桌面版功能](/guide/desktop) | [功能地图与 GUI 位置](/guide/feature-map) | 基本总要补查 |
| 设置项具体含义 | [设置说明](/guide/settings) | [功能地图与 GUI 位置](/guide/feature-map) | 用户问“在哪一页”时 |
| 快捷键、命令面板、用户指引、Need help | [功能地图与 GUI 位置](/guide/feature-map) | [设置说明](/guide/settings) | 通常 GUI 地图就够 |
| 常见故障排查 | [常见问题](/guide/faq) | [macOS App 已损坏](/guide/macos-app-damaged) | 用户问具体入口失踪时 |
| macOS 提示 App 已损坏 | [macOS App 已损坏](/guide/macos-app-damaged) | [快速开始](/guide/quick-start) | 不需要 |
| Web 部署 | [Vercel 部署](/guide/deploy-vercel) | [/developer/deploy](/developer/deploy) | 不需要 |
| 配置变量、接口、开发实现 | [/developer/configuration](/developer/configuration) | [/developer/technical](/developer/technical) | 只有用户转而问 GUI 时 |

## GUI 定位速查

如果用户的问题里出现下面这些词，优先查 [功能地图与 GUI 位置](/guide/feature-map)：

| 关键词 | 应优先看的区域 |
| --- | --- |
| `主页` `顶部` `标签` `搜索框` | 主页 |
| `播放页` `右侧面板` `封面` `控制` `队列` `账号` | 播放页右侧面板 |
| `本地歌词` `Navidrome歌词` `在线歌词` `时间轴偏移` | 播放页来源专属标签 |
| `帮助` `用户指引` `Need help` `版本信息` | 设置 > 帮助 |
| `视觉设置` `播放控制` `集成设置` `桌面端设置` `实验室` | 设置 > 选项 |
| `命令面板` `快捷键` `S 键` | 命令面板与帮助页 |
| `遥控窗` `Folia Remote` `视频录制` `点击穿透` `透明控制` | 桌面版专属能力 |

## 高频用户意图 -> 最短回答路线

| 用户真实意图 | 最短检索路线 |
| --- | --- |
| “这个功能在哪点” | 先看 [功能地图与 GUI 位置](/guide/feature-map) |
| “这个设置是什么意思” | 先看 [设置说明](/guide/settings)，再补 [功能地图与 GUI 位置](/guide/feature-map) |
| “这个视觉效果怎么调出来” | 先看 [播放、歌词与视觉模式](/guide/playback-and-lyrics)，再看 [歌词动画参数说明](/guide/lyrics-animation-tuning) |
| “本地歌怎么匹配歌词 / 为什么没歌词” | 先看 [本地音乐](/guide/local-music)，再补 [设置说明](/guide/settings) 里的歌词源相关设置 |
| “Navidrome 为什么连不上 / 怎么设置” | 先看 [Navidrome](/guide/navidrome)，再补 [设置说明](/guide/settings) 里的集成设置 |
| “怎么把 Folia 接到 OBS / 直播里” | 先看 [桌面版功能](/guide/desktop)，再补 [设置说明](/guide/settings) 和 [功能地图与 GUI 位置](/guide/feature-map) |
| “怎么让外部播放器驱动 Folia” | 先看 [Stage 与 Now Playing](/guide/stage-and-now-playing)，接口细节再看 [/developer/stage-api](/developer/stage-api) |

## 什么时候切到开发者文档

只有在用户问题出现这些倾向时，再从用户指南切去开发者文档：

- 用户在问环境变量、部署平台、Node / Vercel 配置
- 用户在问 Stage API 的具体接口或请求结构
- 用户在问 AI 主题接口怎么接
- 用户在问实现限制、技术说明、项目结构

对应入口：

- 部署：[/developer/deploy](/developer/deploy)
- 配置：[/developer/configuration](/developer/configuration)
- 技术说明：[/developer/technical](/developer/technical)
- 项目结构：[/developer/project-map](/developer/project-map)
- Stage API：[/developer/stage-api](/developer/stage-api)
- AI 主题接口：[/developer/ai-theme-api](/developer/ai-theme-api)

## 推荐回答策略

对模型来说，回答 Folia 用户问题时，推荐遵守这几个规则：

- 先回答“功能在哪里”，再回答“为什么这样设计”。
- 用户问 GUI 时，尽量用 `主页 > ...`、`播放页 > ...`、`设置 > ...` 这种路径表达。
- 如果问题明显是桌面版专属，要主动说明“Web 版可能没有这个入口”。
- 如果问题涉及 `Stage API / OBS / 遥控窗 / 视频录制 / 点击穿透`，默认把它视为桌面版问题。
- 如果用户只说“找不到某个按钮”，优先怀疑：
  - 当前不在正确页面
  - 当前歌曲来源不对，所以专属标签没出现
  - 当前是 Web 版，桌面专属入口不会显示

## 最后兜底

如果模型仍然不确定问题落在哪页，优先按这个顺序补查：

1. [功能地图与 GUI 位置](/guide/feature-map)
2. [设置说明](/guide/settings)
3. [播放、歌词与视觉模式](/guide/playback-and-lyrics)
4. [桌面版功能](/guide/desktop)
5. 对应专题页，如 [本地音乐](/guide/local-music)、[Navidrome](/guide/navidrome)、[Stage 与 Now Playing](/guide/stage-and-now-playing)
