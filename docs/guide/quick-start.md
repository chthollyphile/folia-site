# 快速开始

本页按照“最快能听到歌”的思路来写。

## 方式一：直接使用桌面版

适合大多数用户，功能最完整。

> [!TIP] 网盘链接
> 如果你打不开 GitHub Releases 页面或者觉得太慢了，可以尝试使用以下网盘链接下载桌面版安装包：
>
> 链接：https://pan.quark.cn/s/557520d4f2f0
>
> 提取码：LaaV

1. 打开 [GitHub Releases](https://github.com/chthollyphile/folia-major/releases)。
2. 下载适合你系统的安装包。
3. 启动后进入主页，搜索歌曲或导入本地音乐。
4. 点击歌曲卡片进入播放页，展开右侧面板调节视觉与歌词选项。

Windows 用户直接下载 `.exe` 安装包（x64 架构）。

macOS 用户直接下载 `.dmg` 安装包（arm64 架构，Apple Silicon 芯片）。

如果你在 macOS 上遇到无法打开应用的情况，通常是安全设置阻止了未认证开发者应用。可以先尝试打开一次，再到“系统设置/安全性与隐私”里允许继续打开。

Linux 用户可选择：

- Arch / Manjaro：`yay -S folia-major-bin`
- Debian / Ubuntu / Linux Mint：下载 `.deb`
- Fedora / RHEL / openSUSE：下载 `.rpm`
- 其他发行版：下载 `tar.gz` 后解压运行 `folia-major`

Linux 下当前主要提供 x64 架构版本。

## 方式二：部署 Web 版

适合想在浏览器、多设备或自托管环境中使用的人。

你需要准备：

- 一个可用的网易云 API 服务
- 一组 AI 接口配置，用于 AI 主题生成

建议直接看这份按步骤写好的教程：

- Web 版部署教程：[/guide/deploy-vercel](/guide/deploy-vercel)
- 如果你想看更偏工程的说明：[/developer/deploy](/developer/deploy)

## 首次使用建议

第一次打开后，建议先做这几件事：

1. 在 [设置说明](/guide/settings) 里把你常用的视觉、歌词源和桌面选项看一遍。
2. 再看一遍 [功能地图与 GUI 位置](/guide/feature-map)，先建立“某个功能在哪个界面里”的整体印象。
3. 先在设置中确认 AI 提供商与 Key，避免生成主题时报错。
4. 选一个喜欢的歌词动画模式，再决定是否要开启透明背景或自动隐藏控制栏。
5. 如果你主要听本地音乐，优先阅读 [本地音乐](/guide/local-music)。
6. 如果你有私人曲库，优先阅读 [Navidrome](/guide/navidrome)。
7. 如果你想让外部播放器或外部程序驱动 Folia，阅读 [Stage 与 Now Playing](/guide/stage-and-now-playing)。

## 常见入口

| 你想做什么 | 建议阅读 |
| --- | --- |
| 先弄清楚每个功能在界面哪里 | [功能地图与 GUI 位置](/guide/feature-map) |
| 调整歌词动效和配色 | [播放、歌词与视觉模式](/guide/playback-and-lyrics) |
| 查看各类设置项 | [设置说明](/guide/settings) |
| 导入本地歌曲文件夹 | [本地音乐](/guide/local-music) |
| 连接 Navidrome | [Navidrome](/guide/navidrome) |
| 打开遥控窗或录制视频 | [桌面版功能](/guide/desktop) |
| 连接 Now Playing 或 Stage API | [Stage 与 Now Playing](/guide/stage-and-now-playing) |
