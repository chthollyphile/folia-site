# 桌面版功能

桌面版是 Folia 功能最完整的运行形态。除了播放器本体外，它还把本地 API、系统窗口能力、遥控窗、更新、录制和若干外部集成都收进了同一个应用里。

## 适合谁

桌面版尤其适合这些场景：

- 想开箱即用，不想先部署 Web 版
- 想稳定使用本地音乐、缓存和音频设备切换
- 想启用 Stage API、Now Playing、OBS Browser Source、遥控窗
- 想把 Folia 当作录屏、直播、桌面美化或陪伴式播放器使用

## 安装方式概览

### Windows

直接下载 `.exe` 安装包即可。

### macOS

当前主要提供 Apple Silicon 的 `.dmg` 安装包。

如果第一次打开被系统拦截，可以到“系统设置/安全性与隐私”里允许该应用继续运行，或者参考 [macOS App 已损坏指南](/guide/macos-app-damaged)。

### Linux

桌面版在 Linux 下提供多种分发方式：

- Arch / Manjaro：AUR 包 `folia-major-bin`
- Debian / Ubuntu / Linux Mint：`.deb`
- Fedora / RHEL / openSUSE：`.rpm`
- 其他发行版：`tar.gz`

`tar.gz` 包里还附带图标和 `.desktop` 模板，方便你自己补启动项。

### 发布通道

当前桌面版可以选择跟随三个发布通道：

| 通道 | 面向对象 | 更新来源 | 网盘下载 |
| --- | --- | --- | --- |
| Realeco | 正式版 | `latest` | 提供 |
| Limo | Nightly | `beta`，也可升级到 Realeco | 不提供 |
| Cielo | Canary | `alpha`，也可升级到 Limo / Realeco | 不提供 |

Realeco 跟踪正式发布的主线正式版，推荐所有用户使用

Limo 跟踪main分支每日自动构建的nightly版本，适合想要第一时间体验最新功能的用户（注意，此版本可能包含一些潜在bug）

Cielo 跟踪Canary rolling构建版本，可能含有实验性功能和破坏性改动，请勿用于测试和开发之外的用途


## 遥控窗

桌面版可以从标题栏左侧按钮打开一个独立的 `Folia Remote` 小窗，用来控制当前播放。

![alt text](../public/screenshots/guide/desktop/image.png)

它比较适合这些场景：

- 主窗口全屏播放歌词时，用小窗切歌和暂停
- 录屏时把控制界面单独放到另一侧
- 做桌面陪伴窗口，不想频繁切回主界面

可用能力包括：

- 播放 / 暂停
- 上一首 / 下一首
- 拖动进度条
- 收藏当前歌曲
- 切换遥控窗背景模式（默认 / 封面色彩 / 透明）
- 固定遥控窗置顶
- 打开透明控制面板
- 打开[视频录制面板](/guide/desktop#视频录制)

![alt text](../public/screenshots/guide/desktop/image-1.png)

遥控窗里还有两组比较容易被忽略、但很实用的桌面专属能力：

- `透明控制`：可直接切主窗口到透明模式、隐藏或恢复播放页 UI、切换边框、点击穿透、主窗口置顶。
- `歌词浮层`：当鼠标不悬停在遥控窗上时，控件区域会临时让位给当前歌词显示。

### Hyprland / Wayland 提示

遥控窗会以稳定窗口标题 `Folia Remote` 打开。在 Hyprland 下，如果你希望它固定以浮窗方式出现，可以使用类似规则：

```ini
windowrule {
  name = folia-remote
  float = on
  size = 520 315
  center = on
  pin = on
  no_blur = on
  border_size = 0
  no_shadow = on
  match:class = ^(folia-major)$
  match:title = ^(Folia Remote)$
}
```

如果没有生效，建议先用 `hyprctl clients` 查看当前窗口的真实 `class` 和 `title` 再调整。

## 视频录制

桌面版支持把主播放窗口录制成 WebM 视频。

![alt text](../public/screenshots/guide/desktop/image-2.png)

内置预设通常包括：

- `1280 x 720`
- `1920 x 1080`
- `2560 x 1440`
- `900 x 1600 (竖屏/Shorts)`
- 其他多分辨率和正方形预设

使用方式：

1. 打开遥控窗。
2. 点击视频按钮。
3. 选择录制尺寸。
4. 选择从整首歌开始，或从当前进度开始。
5. 开始录制，结束后保存为 `.webm`。

录制时主窗口会临时切到目标尺寸，结束后自动恢复。

除了预设分辨率外，遥控窗里的录制面板还支持：

- `整首歌 / 从此` 两种起录方式
- 横屏、竖屏、方屏等多种预设
- 手动修改宽高，快速做短视频或特殊比例导出

> 这个录制功能更像“内置便捷导出”，不是专业后期方案。
>
> 如果你追求更高质量、更稳定的码率控制，或需要复杂场景合成，仍然建议用 OBS 直接抓取窗口。

## 透明背景与 OBS

如果你想把 Folia 叠到直播、视频或其他视觉画面上，桌面版很适合配合透明背景和 OBS 使用。

### 透明播放页背景

在视觉设置中开启 `播放页透明背景` 后：

- 主播放页会切成透明窗口模式
- 更适合 OBS 做无底叠加
- 更适合做桌面歌词覆盖或装饰性窗口

### OBS Browser Source

桌面版还支持单独启用 OBS Browser Source。它会生成一个本机 URL 和 Token，让 OBS 直接以浏览器源接入歌词动画。

这种方式的优点是：

- 可以把画面渲染和音频播放解耦
- 适合直播、录播和多机位场景
- 接入后主窗口会停掉较重的 visualizer 渲染，减少重复开销

如果你想更系统地了解桌面端所有 GUI 入口，可以再看 [功能地图与 GUI 位置](/guide/feature-map)。

## Stage Mode

桌面版可以在设置中开启 Stage 相关模式。它主要解决“让外部程序驱动 Folia”的问题。

### Stage API 模式

- 启动本地 `Stage API`
- 生成 Bearer Token
- 允许外部程序读取当前播放状态，或向 Folia 推送歌词、媒体会话、点歌请求

### Now Playing 模式

- 对接 [Now Playing](https://github.com/Widdit/now-playing-service) 服务
- 把外部播放器的当前歌曲、进度、歌词和暂停状态同步给 Folia
- 由外部播放器负责音频播放，Folia 负责大屏歌词与舞台展示

更多见 [Stage 与 Now Playing](/guide/stage-and-now-playing) 和 [Stage API](/developer/stage-api)。

## 音频与本地能力

桌面版比 Web 版更适合以下事情：

- 读取和管理本地音乐索引
- 缓存媒体文件并反复播放
- 切换音频输出设备
- 使用系统级窗口与托盘能力

如果你主要听本地音乐，或者希望 Folia 像原生播放器一样长期驻留，桌面版通常会更省心。

## 更新与系统集成

桌面版还包含这些增强能力：

- 最小化到托盘
- 隐藏任务栏图标
- 启动后直接进入播放页
- 应用内检查更新
- 自动下载更新（支持的平台上）
- 本地音频缓存目录管理
- Discord Rich Presence

这些选项都可以在 [设置说明](/guide/settings) 对应章节里看到更细的解释。

## Linux 图形兼容补充

主仓库里还提供了更保守的 Linux 图形模式，用于排查 Wayland、Vulkan、驱动或 GPU 兼容问题，例如使用 SwiftShader 或软件渲染启动桌面版。

如果你在 Linux 上遇到黑屏、窗口异常、移动卡顿或录制问题，可以优先参考开发者侧的 [部署指南](/developer/deploy)。

## 什么时候更适合 Web 版

以下情况更适合直接用 Web 版：

- 你只想在浏览器里快速试用
- 你希望手机、平板和其他设备也能直接访问
- 你更偏好把服务部署到自己的服务器或云平台上
- 你暂时不需要托盘、OBS、Stage API、录制或本地系统集成
