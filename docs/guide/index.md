> [!TIP]
> 文档建设中，欢迎提交 Pull Request 来完善它！[文档 GitHub 地址](https://github.com/chthollyphile/folia-site)

# 用户指南

Folia 是一款以歌词为中心的播放器。它把在线音乐、本地音乐、Subsonic / OpenSubsonic 曲库、舞台模式和 AI 主题整合到同一套播放体验里。

> [!TIP]
> 先前往 [基本用法](/guide/basic) 查看最基本的操作说明


> [!TIP]
> 如果你遇到问题，可以先查看 [常见问题](/guide/faq)

## 这份文档适合谁

- 普通用户：想快速上手播放、导入本地音乐、切换视觉模式。
- 桌面端用户：想使用遥控窗、视频录制、壁纸模式、Stage Mode、Now Playing 接入。
- 进阶用户：想把 Navidrome、自建 API 或外部工具接入 Folia。

## 你可以在 Folia 里做什么

| 能力 | 说明 |
| --- | --- |
| 在线播放 | 在网易云、酷狗、QQ 音乐之间切换音源，搜索并直接播放、查看歌词和封面。 |
| 本地音乐库 | 导入文件夹，自动读取音频标签、封面、内嵌歌词和同目录歌词文件，可开启自动增量扫描。 |
| 自建服务器接入 | 通过 Subsonic / OpenSubsonic API 连接 Navidrome 等服务端，浏览专辑、歌手、播放列表和随机歌曲。 |
| 两个播放视图 | `可视化`播放页专注当前这一首；`Lattice`队列拼贴把整条队列铺成海报墙。点击播放后进入哪个可以自选。 |
| 多种歌词视觉模式 | 内置 `静止`、`流光`、`心象`、`云阶`、`浮名`、`莫奈`、`群唱`、`倾诉`、`回环`、`镜台`、`时计`、`商籁`、`凝彩` 等模式。 |
| 全局命令面板 | 在任意界面用 `Ctrl/Cmd + K` 搜索并执行命令，支持拼音检索、队列批量操作、网格操作、执行模式和自定义快捷键。 |
| Folia 智能过渡 | 分析相邻两首歌的节拍、调性与段落结构自动混音，也可退回固定交叉淡化。 |
| AI 主题 | 根据歌词或纯音乐标题生成明暗双主题配色。 |
| 舞台模式 | 接收外部歌词或媒体输入，驱动 Folia 的沉浸式播放页。 |
| 桌面增强 | 提供独立遥控窗、视频录制、Windows / macOS 壁纸模式、系统更新和平台级窗口控制。 |
| 音频效果器 | 十段均衡器加饱和、混响、压缩等后处理效果链，带多个预设。 |
| 模组系统 | 实验性的桌面端模组加载器，可扩展命令、视觉器与视频导出能力。 |
| 本机集成接口 | 桌面端可开放只读的歌词接口和带鉴权的 Stage API，供外部程序对接。 |
| 多端同步 | 通过自建的同步服务同步视觉设置与 AI 主题。 |

## 推荐阅读顺序

0. [基本用法](/guide/basic)
1. [快速开始](/guide/quick-start)
2. [播放、歌词与视觉模式](/guide/playback-and-lyrics)
3. [Lattice（队列拼贴）](/guide/lattice)
4. [设置说明](/guide/settings)
5. [命令面板](/guide/command-palette)
6. [功能地图与 GUI 位置](/guide/feature-map)
7. [本地音乐](/guide/local-music)
8. [Navidrome / OpenSubsonic](/guide/navidrome)
9. [Docker 全栈部署](/guide/deploy-docker)
10. [部署同步服务](/guide/deploy-sync)
11. [Stage 与 Now Playing](/guide/stage-and-now-playing)

想知道某个功能是哪一版加的，看 [更新记录](/guide/changelog)。

如果你准备自己部署或二次接入，请继续看 [开发者文档](/developer/)。
