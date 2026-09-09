# Stage 与 Now Playing

这一部分面向两类用户：

- 想让外部程序把歌词、媒体状态或点歌请求推给 Folia
- 想让 Folia 充当别的播放器的沉浸式歌词显示层

这套能力本质上是“把播放和展示拆开”。谁负责出声、谁负责推歌词、谁负责渲染大屏效果，都可以分开。

## Stage 是什么

Stage Mode 是桌面版提供的一套本地集成能力。启用后，Folia 会在本机维持一组可供外部程序使用的状态与接口。

它适合这些场景：

- 你自己写一个歌词控制工具
- 你有串流 / 舞台展示 / 自动化脚本
- 你想把 Folia 当成“歌词动画前端”
- 你希望外部程序决定当前歌曲、歌词或队列

## Stage API 模式

Stage API 模式下，Folia 会启动一个本机 HTTP 服务，并提供 Bearer Token。

默认地址通常是：

```text
http://127.0.0.1:32107
```

外部程序可以通过它做的事，不只是简单推歌词，还包括：

- 健康检查
- 读取当前状态
- 推送歌词会话或媒体会话
- 搜索歌曲
- 发起外部播放请求
- 读取或控制播放队列

从代码上看，Stage API 已经覆盖了比“演示接口”更完整的一层 player 交互，所以它很适合做真正的桌面联动工具。

## Now Playing 模式

Now Playing 模式下，Folia 会尝试连接本机的 Now Playing 服务，让别的播放器继续负责播放，而 Folia 只负责把歌曲、进度和歌词渲染成沉浸式界面。

常见连接地址是：

```text
ws://localhost:9863/api/ws/lyric
```

接入后，Folia 可以拿到：

- 当前歌曲标题和艺人
- 播放 / 暂停状态
- 当前进度
- 外部歌词信息

这很适合“你已经有主播放器，但不满意它的歌词展示效果”的情况。

## Nexus PlayerCap 模式

除了 Now Playing，Folia 还可以接入 Nexus PlayerCap 作为外部歌词来源。在`连接与集成`设置里填写 PlayerCap 地址即可，留空时默认使用本机 `localhost:8765`，失焦后自动保存并重连。

这个模式额外提供几个选项：

- 播放器：选择跟随哪一个播放器，或`跟随默认`。
- 时间轴：`play_time` 会按 PlayerCap 内针对各播放器调教过的提前量提前显示歌词，并保留 offset；`timestamp` 使用原始时间轴 on-beat，忽略提前量，可以再用歌词偏移手动微调。
- 忽略播放器清除：暂停、空闲或关窗时保留歌词，只在真正切换播放器时刷新。

## 它们的区别

| 模式 | 谁负责播放音频 | 谁负责提供数据 | 更适合什么 |
| --- | --- | --- | --- |
| Stage API | 视你的外部程序集成方式而定 | 你自己的程序或脚本 | 深度定制、自动化、二次开发 |
| Now Playing | 原播放器 | Now Playing 服务 | 已有主播放器，只想把 Folia 当显示层 |
| Nexus PlayerCap | 原播放器 | PlayerCap | 已经在用 PlayerCap，想让 Folia 跟随它的歌词时间轴 |

更简单地说：

- Stage API 偏“你自己控制整个流程”
- Now Playing 和 PlayerCap 偏“你已经有流程，只借用 Folia 渲染画面”

## 只想读歌词的话

如果你的需求反过来——不是往 Folia 推数据，而是想把 Folia 当前的歌词读出去给别的程序用——不需要开 Stage API。桌面版另有一个更轻的只读接口：

```text
GET http://127.0.0.1:32109/v1/lyric
```

它固定端口、无需鉴权、只监听回环地址，返回当前歌词的精简 JSON。开关在 `设置 > 选项 > 连接与集成 > 歌词接口`，字段说明见[歌词接口](/developer/lyric-api)。

## 如何启用

1. 使用桌面版启动 Folia。
2. 打开设置中的“连接与集成”。
3. 开启 `Stage Mode`。
4. 选择来源：
   - `Stage API`
   - `Now Playing`
   - `Nexus PlayerCap`
5. 按需要复制地址、Token，或观察连接状态。

如果你选的是 Stage API，设置页里还会提供：

- 本机地址
- Token
- 重新生成 Token
- 清理状态

## 和 OBS Browser Source 的关系

这三者经常会一起出现，但职责不同：

- Stage API：负责“数据和控制”
- Now Playing / Nexus PlayerCap：负责“从别的播放器接数据”
- OBS Browser Source：负责“把渲染结果交给 OBS”

也就是说，你完全可以这样组合：

- 用 Now Playing 读取外部播放器状态
- 用 Folia 渲染歌词动画
- 再通过 OBS Browser Source 把画面送进直播场景

## 安全说明

- Stage API 仅为桌面本地集成设计，不要主动暴露到局域网或互联网。
- 大多数接口都需要 Bearer Token。
- 通常只有健康检查接口不要求鉴权。

如果你要对接具体请求结构、状态字段或队列接口，请继续看 [Stage API](/developer/stage-api)。
