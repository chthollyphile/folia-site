# Stage 与 Now Playing

这一部分面向两类用户：

- 想让外部程序把歌词或媒体推送到 Folia
- 想把 Folia 作为外部播放器的沉浸式歌词显示层

## Stage/舞台 是什么

Stage Mode 是桌面版提供的一套本地集成能力。启用后，Folia 会在本机启动一个带 Token 的 HTTP API。

外部程序可以通过它：

- 推送一段歌词
- 推送一段媒体会话
- 搜索歌曲
- 让 Folia 直接点歌或追加进队列

适合：

- 自定义歌词工具
- 串流或舞台展示工具
- 自动化脚本
- 需要把 Folia 当成“歌词前端”的本地程序

## Now Playing 是什么

Now Playing (https://github.com/Widdit/now-playing-service) 是一个开源的「正在播放」歌曲展示工具。支持检测 20+ 款音乐软件的歌曲信息，并通过 WebSocket 把它们推送到本地服务。

## 如何启用 Stage Mode

1. 使用桌面版启动 Folia。
2. 在设置里开启 `Stage Mode`。
3. 选择模式来源：
   - `Stage API` (仅桌面版可用)
   - `Now Playing`

### Stage API 模式

需要复制本地地址和 Bearer Token。

默认情况下，本地地址形如：

```text
http://127.0.0.1:32107
```

然后可以进行二次开发，做出适合自己的工具。

### Now Playing 模式

Now Playing 模式下，folia 会尝试连接本机正在运行的 Now Playing WebSocket 接口：

```text
ws://localhost:9863/api/ws/lyric
```

连接后可以把其他播放器的当前歌曲、暂停状态、进度和歌词同步到 Folia，而音频处理，播放控制仍然由原播放器负责。

## Stage API 和 Now Playing 的区别

> [!TIP]
> Stage API 仅支持桌面版，Now Playing 模式支持所有平台。

| 模式 | 适合场景 | 数据入口 |
| --- | --- | --- |
| Stage API | 你自己控制歌词、音频、封面或点歌流程 | 本地 HTTP |
| Now Playing | 你已经有独立播放器，只想用 Folia 作为歌词动画 | 本地 WebSocket |

## 安全说明

- Stage API 仅为桌面本地集成设计，不要暴露到局域网或互联网。
- 大多数接口都需要 Bearer Token
- 公开探活接口只有健康检查

如果你要对接具体请求结构，请看 [Stage API](/developer/stage-api)。
