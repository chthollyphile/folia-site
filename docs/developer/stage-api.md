# Stage API

Stage API 是 Folia 桌面版暴露出的本地 HTTP / WebSocket 接口，目标不是只做“推一段歌词进去”，而是把外部程序集成、播放器状态读取、队列控制和沉浸式歌词展示连成一套完整链路。

如果你只是想知道 Stage 和 Now Playing 在用户视角下怎么用，先看 [Stage 与 Now Playing](/guide/stage-and-now-playing)。这一页更偏开发者对接。

## 先理解两个层次

主仓库里的 Stage API 现在实际上分成两层：

1. `stage input`
2. `player playback`

还有一个同样重要、但更容易被忽略的概念：

3. `direction`

### 1. Stage Input

这层表示“外部程序往 Folia 注入了什么”。

典型接口：

- `GET /stage/status`
- `POST /stage/lyrics`
- `POST /stage/session`
- `DELETE /stage/state`

它适合做：

- 直接推送一份歌词对象
- 推送一段外部媒体会话
- 让 Folia 作为外部歌词/媒体展示前端

### 2. Player Playback

这层表示“Folia 主播放器自己现在是什么状态，以及你能不能控制它”。

典型接口：

- `GET /stage/player/status`
- `GET /stage/player/time`
- `POST /stage/player/control`
- `GET /stage/player/queue`
- `POST /stage/player/queue`
- `WS /stage/player/ws`

它适合做：

- 外部面板读取当前曲目、进度、播放状态
- 外部程序控制暂停、继续、切歌、跳转
- 外部程序读写队列
- 订阅播放器事件而不是轮询

这个区分很重要：

- `/stage/status` 读的是“外部注入状态”
- `/stage/player/status` 读的是“Folia 真实播放器状态”

两者不是同一个概念。

## `direction` 是什么

Stage API 的很多响应里都会带一个 `direction` 字段。它不是装饰字段，而是在告诉你：这份数据的流向到底是“流进 Folia”，还是“从 Folia 流出来”。

当前主要有两种：

- `outside-in`
- `inside-out`

这是理解 Stage API 最重要的概念之一，因为同样是“状态对象”，如果你没分清方向，就很容易把“外部推给 Folia 的会话”和“Folia 自己真实播放器的播放状态”混为一谈。

### `outside-in`

字面意思是：`外部 -> 内部`。

也就是：

- 外部程序、脚本、联调页、Now Playing 或其他来源
- 把数据推给 Folia

它强调的是“进入 Folia 的输入”。

在文档和返回对象里，`outside-in` 通常表示：

- 这是一份外部注入状态
- 或这是一份由外部主动发起的播放器请求结果

典型场景：

- `POST /stage/lyrics`
- `POST /stage/session`
- `DELETE /stage/state`
- `POST /stage/player/search`
- `POST /stage/player/play`
- `POST /stage/player/control`
- `POST /stage/player/queue`

其中又可以分成两类理解：

1. `stage-input + outside-in`
2. `player-playback + outside-in`

#### `stage-input + outside-in`

这表示：

- 外部把“歌词 / 媒体会话”注入给 Folia
- Folia 回你一份“我现在接收到的外部输入状态”

典型例子就是：

- `GET /stage/status`
- `POST /stage/lyrics`
- `POST /stage/session`
- `DELETE /stage/state`

这些接口返回的对象里，通常会看到：

```json
{
  "domain": "stage-input",
  "direction": "outside-in"
}
```

它的语义不是“播放器现在在播什么”，而是：

- “外部现在往 Stage 塞了什么”

#### `player-playback + outside-in`

这表示：

- 外部正在请求 Folia 主播放器做一件事
- 返回的是一次“外部驱动播放器”的结果

比如：

- `POST /stage/player/search`
- `POST /stage/player/play`
- `POST /stage/player/control`
- `POST /stage/player/queue`

这些接口虽然属于 `player playback` 领域，但方向仍然是 `outside-in`，因为动作的发起者是外部。

所以你会看到类似：

```json
{
  "domain": "player-playback",
  "direction": "outside-in"
}
```

它的含义是：

- “这是外部对播放器发起的一次请求的结果”

### `inside-out`

字面意思是：`内部 -> 外部`。

也就是：

- Folia 自己的主播放器
- 把它当前真实的播放状态向外暴露出来

它强调的是“从 Folia 内部流出来的播放器事实”。

典型接口：

- `GET /stage/player/status`
- `GET /stage/player/time`
- `GET /stage/player/queue`
- `WS /stage/player/ws`

这些接口返回的对象里，通常会看到：

```json
{
  "domain": "player-playback",
  "direction": "inside-out"
}
```

它的语义是：

- “这是 Folia 当前真实播放器状态，对外公开出来给你看”

不是：

- “这是外部刚刚注入给我的会话”

### 一句话记忆

可以直接这样记：

- `outside-in`：外部在推我 / 控我
- `inside-out`：我把自己的真实状态告诉外部

### 为什么这个概念这么重要

因为 Stage API 里最容易犯的错误就是把下面两件事混为一谈：

1. 外部注入了一份歌词或媒体会话
2. Folia 主播放器当前真实正在播放什么

这两者很多时候可能相同，但概念上完全不同。

比如：

- 你调用 `POST /stage/session` 成功了，只能说明 Folia 接收了一份外部媒体会话
- 不代表 `GET /stage/player/status` 一定等于那份会话

同样地：

- `GET /stage/status` 返回了 `lyricsSession`
- 也不代表主播放器现在就在正常主队列里播放那首歌

### 最容易混淆的四组接口

#### `GET /stage/status`

- `domain: "stage-input"`
- `direction: "outside-in"`

含义：

- 外部注入状态

#### `GET /stage/player/status`

- `domain: "player-playback"`
- `direction: "inside-out"`

含义：

- Folia 主播放器真实状态

#### `POST /stage/player/play`

- `domain: "player-playback"`
- `direction: "outside-in"`

含义：

- 外部正在请求 Folia 主播放器去播放 / 加队列

#### `WS /stage/player/ws`

- `domain: "player-playback"`
- `direction: "inside-out"`

含义：

- Folia 持续向外推送自己的真实播放器事件

### 推荐的使用心智

如果你在写外部程序集成，最稳的心智模型是：

- 你向 Folia 发请求时，优先把它当 `outside-in`
- 你从 Folia 读状态或订阅事件时，优先把它当 `inside-out`

换句话说：

- “我在推什么进去” 看 `outside-in`
- “Folia 现在到底是什么状态” 看 `inside-out`

## 基本信息

- 默认地址：`http://127.0.0.1:32107`
- 作用范围：本地桌面集成
- 授权方式：Bearer Token
- WebSocket 地址：`ws://127.0.0.1:32107/stage/player/ws`

说明：

- `GET /stage/health` 不需要鉴权
- 除 `GET /stage/health` 外，其余 HTTP 接口都需要 `Authorization: Bearer <token>`
- `WS /stage/player/ws` 既支持 `Authorization: Bearer <token>`，也支持 `?token=<token>`

## 快速开始

1. 在桌面版设置里开启 `Stage Mode`
2. 选择来源为 `Stage API`
3. 复制本地地址和 Token
4. 先请求 `GET /stage/health`
5. 再根据你的集成目标选择：
   - 推歌词：`POST /stage/lyrics`
   - 推媒体：`POST /stage/session`
   - 控制主播放器：`/stage/player/*`
   - 订阅播放器事件：`WS /stage/player/ws`

## 通用约定

### 请求头

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### 时间字段

以下字段都用毫秒：

- `positionMs`
- `durationMs`
- `sampledAtMs`
- `updatedAt`

其中：

- `sampledAtMs` 表示该播放时间快照是在什么时刻采样的
- `updatedAt` 更偏向服务端写入该对象的时间

### CORS

Stage API 自带基础 CORS 头，适合本机工具、嵌入页或浏览器调试页调用。

### 常见错误形态

大多数业务错误会类似这样：

```json
{
  "error": "Unsupported Stage player queue action.",
  "code": "INVALID_STAGE_PLAYER_QUEUE_ACTION",
  "details": {
    "action": "unknown"
  }
}
```

也有少数更基础的拒绝路径只返回：

```json
{
  "error": "Unauthorized"
}
```

## 核心对象

### StageStatus

`GET /stage/status`、`POST /stage/lyrics`、`POST /stage/session`、`DELETE /stage/state` 返回的都是这一类对象。

```json
{
  "domain": "stage-input",
  "direction": "outside-in",
  "enabled": true,
  "modeEnabled": true,
  "source": "stage-api",
  "port": 32107,
  "token": "******",
  "activeEntryKind": "lyrics",
  "lyricsSession": {},
  "mediaSession": null
}
```

关键字段：

- `enabled`：Stage API 服务是否启用
- `modeEnabled`：Folia 舞台模式是否启用
- `source`：当前舞台来源，通常是 `stage-api` 或 `now-playing`
- `activeEntryKind`：当前外部注入的是 `lyrics`、`media`，还是空状态
- `lyricsSession`：当前歌词会话
- `mediaSession`：当前媒体会话

### StageLyricsSession

这表示当前由外部注入的歌词上下文。

常见字段：

- `title`
- `artist`
- `album`
- `lyricSource`
- `updatedAt`

### StageMediaSession

这表示当前由外部注入的媒体会话。

常见字段：

- `id`
- `title`
- `artist`
- `album`
- `durationMs`
- `coverUrl`
- `coverArtUrl`
- `audioUrl`
- `audioSrc`
- `lyricsText`
- `lyricsFormat`
- `updatedAt`

特别注意：

- `audioUrl` 是你请求里传入的原始外部 URL
- `audioSrc` 是 Folia 最终实际使用的播放地址

如果你上传的是本地文件，`audioSrc` 通常会变成一个本地 Stage media URL，而不再是原始外部地址。

### StagePlayerSnapshot

`GET /stage/player/status` 返回的是播放器快照，不是 Stage 输入状态。

常见字段：

- `domain: "player-playback"`
- `direction: "inside-out"`
- `playbackContext`
- `current`
- `playerState`
- `positionMs`
- `durationMs`
- `sampledAtMs`
- `updatedAt`
- `controlCapabilities`
- `queueCapabilities`
- `queue`

其中：

- `playbackContext` 可能是：
  - `normal-playback`
  - `stage-session`
  - `external-playback-source`

这会直接影响哪些控制或队列操作是允许的。

## 健康检查

### `GET /stage/health`

用途：最轻量的探活，不要求鉴权。

示例响应：

```json
{
  "enabled": true,
  "modeEnabled": true,
  "source": "stage-api",
  "port": 32107,
  "activeEntryKind": "lyrics"
}
```

这个接口适合：

- 工具启动时先判断本地服务在不在
- UI 上显示“Folia 已连接 / 未连接”
- 避免一上来就带 token 发业务请求

## Stage Input 接口

### `GET /stage/status`

用途：读取当前外部注入状态。

它回答的是：

- 现在有没有外部注入的歌词或媒体
- 当前注入的是歌词还是媒体
- 上一次注入的会话对象长什么样

返回内容通常包含：

- `enabled`
- `modeEnabled`
- `source`
- `port`
- `token`
- `activeEntryKind`
- `lyricsSession`
- `mediaSession`

### `POST /stage/lyrics`

用途：推送一份 parser-compatible 的歌词对象。

注意：这个接口更接近“让 Folia 播放一个无音频歌词会话”，而不是给当前主播放器歌曲临时追加歌词。

示例请求：

```json
{
  "title": "Stage Lyrics",
  "artist": "Folia",
  "album": "Demo",
  "lyricSource": {
    "type": "local",
    "lrcContent": "[00:00.00]Hello world",
    "tLrcContent": "[00:00.00]你好，世界",
    "formatHint": "lrc"
  }
}
```

#### 支持的 `lyricSource` 形态

主仓库 schema 里主要支持这些变体：

- `local`
- `embedded`
- `navidrome`
- `netease`
- `qrc`

常见理解方式：

- `local`：直接给文本歌词内容
- `embedded`：模拟音频标签里带出来的歌词
- `navidrome`：模拟 Navidrome 侧歌词结构
- `netease`：模拟网易云歌词分支结构
- `qrc`：直接给 QRC 文本

#### 行为

成功后：

- `activeEntryKind` 会变成 `lyrics`
- `lyricsSession` 会被替换成当前注入内容
- `mediaSession` 会被清空

#### 常见错误

- JSON 无法解析
- `lyricSource` 缺失
- `lyricSource.type` 不合法
- 对应歌词变体缺少必要字段

### `POST /stage/session`

用途：推送一段媒体会话。

它既支持：

- `application/json`
- `multipart/form-data`

也就是说，你既可以只给 URL，也可以直接上传音频、歌词、封面文件。

#### JSON 模式示例

```json
{
  "title": "Folia Demo Tone",
  "artist": "Folia",
  "audioUrl": "https://example.com/demo.mp3",
  "lyricsText": "[00:00.00]Folia demo line one",
  "lyricsFormat": "lrc",
  "coverUrl": "https://example.com/demo.jpg"
}
```

#### Multipart 关键字段

| 字段 | 说明 |
| --- | --- |
| `audioUrl` | 外部音频 URL |
| `audioFile` | 上传音频文件 |
| `lyricsText` | 直接给歌词文本 |
| `lyricsFile` | 上传歌词文件 |
| `lyricsFormat` | `lrc` / `enhanced-lrc` / `vtt` / `yrc` |
| `coverUrl` | 外部封面 URL |
| `coverFile` | 上传封面文件 |
| `title` / `artist` / `album` | 元数据补充 |

#### 约束

- `audioUrl` 和 `audioFile` 必须二选一
- `lyricsText` 和 `lyricsFile` 最多提供一种
- `lyricsFormat` 只接受 `lrc`、`enhanced-lrc`、`vtt`、`yrc`

#### 文件上传时的额外行为

如果上传的是本地音频文件，Stage 会尝试直接读取音频 metadata，从而复用 Folia 现有链路：

- 内嵌标题、歌手、专辑
- 内嵌歌词
- 内嵌封面
- 音频时长

如果你没有额外传歌词，但音频文件里本身带歌词，Folia 也可能直接拿这份内嵌歌词作为 `lyricsText`。

#### 成功后的状态变化

成功后：

- `activeEntryKind` 会变成 `media`
- `mediaSession` 会更新
- `lyricsSession` 会被清空

### `DELETE /stage/state`

用途：清空当前 Stage 输入状态。

执行后通常会：

- 清掉当前外部歌词会话
- 清掉当前媒体会话
- 清掉相关临时状态

返回结果仍然是 `StageStatus`，只是：

- `activeEntryKind` 变成 `null`
- `lyricsSession` 变成 `null`
- `mediaSession` 变成 `null`

## 播放器搜索与点播

### `POST /stage/player/search`

用途：把外部搜索请求转交给 Folia 当前接入的搜索能力。

示例请求：

```json
{
  "query": "Mili world.execute (me)",
  "limit": 5
}
```

示例响应：

```json
{
  "domain": "player-playback",
  "direction": "outside-in",
  "query": "Mili world.execute (me)",
  "songs": [
    {
      "songId": 123,
      "title": "world.execute(me);",
      "artists": ["Mili"],
      "album": "Album",
      "durationMs": 240000,
      "coverUrl": "https://example.com/cover.jpg"
    }
  ]
}
```

说明：

- `songId` 就是后续点播或追加队列时要传的 ID
- 默认实现会走 Folia 当前可用的在线搜索链路
- `limit` 服务端会做归一化，不会无限放大

### `POST /stage/player/play`

用途：请求 Folia 主播放器播放一首歌，或只把这首歌加进队列。

示例请求：

```json
{
  "songId": 123456,
  "appendToQueue": false
}
```

成功响应示例：

```json
{
  "domain": "player-playback",
  "direction": "outside-in",
  "ok": true,
  "songId": 123456,
  "appendToQueue": false
}
```

如果是队列追加模式，响应里还可能出现：

- `changed`
- `deduplicated`
- `affectedCount`

这几个字段很有用：

- `changed`：这次操作有没有真的改到队列
- `deduplicated`：有没有触发队列去重 / 移位
- `affectedCount`：实际影响了多少队列项

> Folia 当前存在严格的队列去重逻辑。
>
> 同一歌曲通常不会在主队列里出现两次；如果你追加的是已经存在的歌曲，它更可能被移动到目标位置，而不是复制一份。

## 播放器状态读取

### `GET /stage/player/status`

用途：读取主播放器状态。

这比 `/stage/status` 更适合做：

- 外部遥控器 UI
- 播放器状态镜像
- 队列状态栏
- 直播控制面板

返回重点：

- 当前曲目 `current`
- 当前状态 `playerState`
- 当前上下文 `playbackContext`
- 可用控制能力 `controlCapabilities`
- 可用队列能力 `queueCapabilities`
- 队列摘要 `queue`

注意：这里的 `queue` 默认只是摘要，不包含完整 `items`。

### `GET /stage/player/time`

用途：主动校准播放时间。

它适合高频刷新场景，因为比完整状态更轻。

典型返回内容：

- `playbackContext`
- `playerState`
- `positionMs`
- `durationMs`
- `sampledAtMs`

如果你自己做一个外部进度条，这个接口会比不停读 `/stage/player/status` 更顺手。

## 播放器控制

### `POST /stage/player/control`

用途：发送播放器控制动作。

当前主要支持：

- `next`
- `prev`
- `pause`
- `resume`
- `seek`

示例请求：

```json
{
  "action": "seek",
  "positionMs": 90000
}
```

说明：

- `seek` 时必须提供合法的非负整数 `positionMs`
- 某些上下文下，控制能力可能不开放
- 能不能调用，不要靠猜，先看 `controlCapabilities`

常见失败原因：

- `action` 不合法
- `seek` 缺少 `positionMs`
- 当前 `playbackContext` 不支持该动作
- 渲染进程超时或拒绝请求

## 队列读取与编辑

### `GET /stage/player/queue`

用途：分页读取主播放器队列详情。

支持查询参数：

- `offset`
- `limit`
- `around=current`

说明：

- 默认最多返回 100 条
- `limit` 最大 500
- `around=current` 会围绕当前播放项计算窗口，更适合做“当前项上下文队列”

返回结果会包含：

- `queue.items`
- `queue.currentIndex`
- `queue.length`
- `queue.revision`
- `queue.offset`
- `queue.limit`
- `queue.returned`
- `queue.hasMore`
- `queue.nextOffset`

如果你需要“无限滚动加载更多队列项”，`nextOffset` 很适合直接拿来做分页游标。

### `POST /stage/player/queue`

用途：编辑主播放器队列。

当前支持的 `action`：

- `append`
- `insert-next`
- `remove`
- `move`
- `select`
- `clear`

#### 常见动作示例

追加一首歌：

```json
{
  "action": "append",
  "songId": 123456
}
```

插到下一首：

```json
{
  "action": "insert-next",
  "songIds": [123, 456]
}
```

删除某个队列项：

```json
{
  "action": "remove",
  "queueItemId": "netease:123456:4"
}
```

移动某个队列项：

```json
{
  "action": "move",
  "fromIndex": 8,
  "toIndex": 1
}
```

切到某个队列项播放：

```json
{
  "action": "select",
  "index": 3
}
```

清空队列：

```json
{
  "action": "clear"
}
```

#### 参数约束

- `append` / `insert-next`：至少提供 `songId` 或非空 `songIds`
- `remove`：至少提供 `queueItemId` 或 `index`
- `move`：至少提供 `fromQueueItemId` 或 `fromIndex`，并且必须提供 `toIndex`
- `select`：至少提供 `queueItemId` 或 `index`
- `clear`：不需要额外字段

#### 队列能力不是永远开放的

某些情况下，Stage 外部媒体会话或外部播放源上下文可能让队列变成只读。

稳妥做法是始终先读：

- `queueCapabilities.append`
- `queueCapabilities.insertNext`
- `queueCapabilities.remove`
- `queueCapabilities.move`
- `queueCapabilities.select`
- `queueCapabilities.clear`

## WebSocket 事件订阅

### `WS /stage/player/ws`

用途：订阅播放器状态事件，而不是依赖轮询。

连接示例：

```text
ws://127.0.0.1:32107/stage/player/ws?token=<token>
```

或在握手时带：

```http
Authorization: Bearer <token>
```

### 连接成功后的事件顺序

连接成功后会立刻收到一次：

- `STATUS`

之后在曲目、播放语义或队列发生变化时，按需推送：

- `TRACK_CHANGED`
- `PLAYBACK_UPDATED`
- `QUEUE_UPDATED`

### 事件语义

#### `STATUS`

初始全量状态。

特点：

- 是完整播放器快照
- 但 `queue` 仍然只是摘要，不含完整 `items`

#### `TRACK_CHANGED`

当前曲目或播放语义发生变化时触发。

通常包含：

- 当前曲目
- 播放状态
- 控制能力
- 队列能力
- 队列摘要

但不包含：

- `positionMs`
- `durationMs`

#### `PLAYBACK_UPDATED`

播放时间或播放状态更新时触发。

通常包含：

- `positionMs`
- `durationMs`
- `sampledAtMs`
- `playerState`

但不包含：

- 当前曲目详情
- 队列详情

#### `QUEUE_UPDATED`

队列变化时触发。

通常包含：

- 队列能力
- 队列摘要

但不包含完整 `items`。如果你需要完整队列，请再调用 `GET /stage/player/queue`。

## 兼容旧接口

主仓库里仍保留了旧入口，但已经标记兼容用途：

- `POST /stage/search`
- `POST /stage/play`

对应新接口分别是：

- `POST /stage/player/search`
- `POST /stage/player/play`

旧接口响应里会额外带：

- `deprecated: true`
- `replacement`

如果你现在开始写新集成，直接用 `/stage/player/*` 即可。

## 联调建议

### 本地联调页

主仓库内置了联调页，可以直接跑：

```bash
npm run stage:client
```

这个页面适合：

- 填 Stage 地址和 token
- 手工试每个 endpoint
- 看请求预览和响应
- 模拟搜索、点歌、队列、媒体会话和歌词会话

### 推荐的对接顺序

如果你在写一个新的外部程序集成，建议按这个顺序来：

1. `GET /stage/health` 确认服务在不在
2. `GET /stage/status` 确认当前 Stage 输入状态
3. `GET /stage/player/status` 确认播放器状态和 capabilities
4. 需要监听时接 `WS /stage/player/ws`
5. 需要搜索和点歌时接 `/stage/player/search` 与 `/stage/player/play`
6. 需要深度控制时再接 `/stage/player/control` 和 `/stage/player/queue`

### 什么时候该用哪组接口

如果你的目标是：

- “让 Folia 显示我给的歌词”：
  用 `POST /stage/lyrics`

- “让 Folia 播放我给的一段外部媒体”：
  用 `POST /stage/session`

- “把 Folia 当成正常播放器去搜歌、点歌、控队列”：
  用 `/stage/player/*`

- “做一个实时外部遥控器”：
  用 `GET /stage/player/status` + `WS /stage/player/ws`

## 常见坑

### `/stage/status` 不是播放器真实状态

这是最容易混淆的一点。

- `/stage/status`：外部注入状态
- `/stage/player/status`：真实播放器状态

### WebSocket 不会替你返回完整队列

WebSocket 主要发事件增量和队列摘要。如果你需要完整 `items`，仍然要调用 `GET /stage/player/queue`。

### 队列和控制动作要先看 capabilities

不要默认所有动作都能执行。`stage-session` 或 `external-playback-source` 上下文里，一些能力可能是关闭的。

### 文件上传模式和 URL 模式返回的 media 地址不一定一样

上传文件时：

- `audioSrc` 往往会变成本地 Stage media URL
- `coverUrl` / `coverArtUrl` 也可能变成本地可访问地址

所以不要假设返回对象里的地址一定还是你最初传入的 URL。

## 歌词流水线

如果你要稳定对接 `POST /stage/lyrics`、`POST /stage/session`，只知道请求 schema 还不够，最好顺手理解一下 Folia 当前的歌词流水线。

它的大致顺序是：

1. 外部输入进入 Stage API
2. Stage 把输入整理成 parser-compatible 的歌词来源对象
3. `LyricParserFactory` 按来源类型分发到对应 adapter
4. adapter 调用 worker 或解析核心
5. `parserCore` 产出统一 `LyricData`
6. 过滤、render hints、布局辅助继续加工
7. visualizer runtime 和各模式渲染最终画面

### 1. Stage 输入层

和歌词相关的 Stage 输入主要来自两条路：

- `POST /stage/lyrics`
- `POST /stage/session`

其中：

- `POST /stage/lyrics` 更像“我直接给你一份歌词会话”
- `POST /stage/session` 更像“我给你一段媒体，会不会带歌词由你继续判断”

当你用 `POST /stage/session` 上传音频文件时，Stage 还会主动尝试读取：

- 内嵌歌词
- 内嵌封面
- 元数据

也就是说，歌词并不一定非要由调用方显式传 `lyricsText`。

### 2. 来源归一化

在 Folia 里，歌词不是只按“文件格式”区分，而是先按“来源类型”区分。

常见来源有：

- `local`
- `embedded`
- `navidrome`
- `netease`
- `qrc`
- `now-playing` 相关输入最终也会被整理成可解析源

这一层的好处是：同样是一份 `lrc` 文本，从本地文件、音频标签、网易云或 Navidrome 过来，前处理可能完全不同，但最后都能汇入统一解析链。

### 3. `LyricParserFactory`

入口文件：

- `src/utils/lyrics/LyricParserFactory.ts`

它的职责是：

- 根据来源类型选择 adapter
- 统一解析入口
- 在解析前后套上通用选项和过滤流程

如果你在看 Stage 接口返回的 `lyricSource` 到底会走哪条代码路径，这个文件是第一站。

### 4. adapters

目录：

- `src/utils/lyrics/adapters/*`

这层负责把不同来源的歌词载荷翻译成解析器更容易消费的形态。

常见分工：

- `LocalFileLyricAdapter`：本地文件歌词
- `EmbeddedLyricAdapter`：音频标签内嵌歌词
- `NavidromeLyricAdapter`：Navidrome / OpenSubsonic 歌词
- `NeteaseLyricAdapter`：网易云歌词结构
- `QrcLyricAdapter`：QRC 相关输入

这也是为什么 Stage 文档里强调“传 parser-compatible 的歌词对象”而不是只说“传一段字符串”。

### 5. worker 层

相关入口：

- `src/utils/lyrics/workerClient.ts`
- `src/workers/lyricsParser.worker.ts`

这层的作用是把相对重的歌词解析搬到 worker 里做，减少主线程压力。

对于外部集成来说，这意味着：

- Stage 对接拿到的歌词最终不是简单正则一下就完
- 大文本歌词、复杂增强格式、格式判断等逻辑会经过异步解析链

### 6. `parserCore`

核心文件：

- `src/utils/lyrics/parserCore.ts`

这是歌词解析真源，也是最值得读的文件。

它负责的事情包括：

- 识别不同歌词格式
- 统一把原始文本转成 `LyricData`
- 解析逐行 / 逐字时间轴
- 推断缺失的结束时间或持续时间
- 处理某些格式里的 token 切分
- 生成后续 visualizer 需要的基础结构

当前项目里很多 wrapper 或兼容层最后都会汇到这里，所以如果你要判断某种 Stage 歌词输入最终会不会被正确消费，优先看它，不要只看上层接口文档。

### 7. 解析后加工

解析不是终点。`LyricData` 产出后，通常还会继续经过几层处理：

- 过滤
- render hints 标注
- 语义切分 / 布局辅助
- 特定来源增强

这几层决定了“为什么两份都能解析的歌词，最后显示效果却不一样”。

### 8. visualizer 消费层

当统一歌词数据就绪后，visualizer runtime 和各个 visualizer 模式才会真正开始渲染。

相关入口通常包括：

- `src/components/visualizer/runtime.ts`
- `src/components/visualizer/registry.tsx`
- `src/components/visualizer/<mode>/*`

这也是 Stage API 的一个核心价值点：

- 外部程序不需要自己做歌词动画
- 只要把歌词喂进 Folia 的统一流水线，就能直接复用现有 visualizer

## 和 Stage 关系最紧的歌词 utils

下面这些工具对理解 Stage 对接尤其有帮助。

### `utils/lyrics/parserCore.ts`

职责：

- 统一歌词解析核心
- 格式识别后的真正解析入口
- 生成统一 `LyricData`

适合在这些时候读：

- 某种 Stage 输入歌词为什么没解析出来
- 某种增强 LRC / YRC / VTT 到底支持到什么程度
- 逐字 token 是怎么推出来的

### `utils/lyrics/LyricParserFactory.ts`

职责：

- 按来源分发解析逻辑
- 统一 adapter 入口
- 串起解析前后的公共处理

适合在这些时候读：

- `lyricSource.type` 最终进了哪条链
- Stage `lyricsSession` 和本地 / Navidrome / 网易云共不共用解析入口

### `utils/lyrics/workerClient.ts`

职责：

- 对接歌词解析 worker
- 把主线程调用转成异步 worker 解析请求

它本身逻辑不复杂，但能帮助你快速确认“解析到底是不是走 worker”。

### `utils/lyrics/filtering.ts`

职责：

- 解析前后处理歌词过滤规则
- 应用显示级过滤
- 和 `renderHints` 配合修正过滤后的显示数据

它和设置中心里的“歌词过滤正则”直接相关。

### `utils/lyrics/renderHints.ts`

职责：

- 为歌词行生成渲染提示
- 补充 line transition、word reveal、render end time 等展示语义

这层很关键，因为它已经不是“解析文本”，而是在为 visualizer 提供动画侧提示。

### `utils/lyrics/cjkSemanticLayout.ts`

职责：

- 面向 CJK 文本做更合理的语义布局切分
- 处理标点、词组、显示单元拼接

它会直接影响一些模式里中文、日文、韩文歌词的观感。

### `utils/lyrics/sentenceLayout.ts`

职责：

- 做更偏句法 / 行内单元的布局辅助
- 为某些视觉模式提供更可控的文本排布结构

如果你在看为什么某个 visualizer 把同一行歌词拆成了不同展示片段，这一层值得顺着读。

### `utils/lyrics/formatDetection.ts`

职责：

- 辅助判断歌词文本像哪种格式

它在 `POST /stage/session` 这种“调用方没明确告诉我歌词格式”的场景里尤其有价值。

### `utils/lyrics/embeddedLrcNormalization.ts`

职责：

- 处理内嵌歌词的格式规整
- 降低标签歌词和独立侧车歌词之间的差异

如果你主要走上传音频文件到 Stage 的路径，这个工具会比普通本地 `.lrc` 路径更相关。

### `utils/lyrics/neteaseProcessing.ts`

职责：

- 处理网易云歌词结构
- 把网易云原始歌词分支整理进统一解析链
- 结合副歌等增强信息

如果你把 Stage 当“播放器控制接口”而不是纯歌词接口，这个文件能帮助你理解在线点歌之后歌词是怎么补全的。

### `utils/lyrics/nowPlayingSource.ts`

职责：

- 把 Now Playing 侧输入映射成 Stage 能消费的歌词来源对象

它是连接 `Now Playing` 和 `Stage` 语义的重要桥梁。

### `utils/lyrics/searchQuery.ts`

职责：

- 构造歌词搜索关键词

在这些场景里有用：

- 自动匹配歌词
- 用歌曲元数据拼更稳妥的检索词

### `utils/lyrics/duration.ts`

职责：

- 归一化歌曲时长
- 修正常见的秒 / 毫秒混淆

看起来小，但对自动匹配和搜索打分很关键。

### `utils/lyrics/matchScore.ts`

职责：

- 给候选歌词匹配结果打分
- 综合标题、艺人、专辑、时长等因素

如果你在排查“为什么自动选中了 A 而不是 B”，这是高价值文件。

### `utils/lyrics/autoMatchBestLyric.ts`

职责：

- 协调多歌词源自动匹配最佳结果
- 结合搜索、打分和候选比较

它解释了“更多歌词源”和“自动使用最佳歌词”背后的实际实现方向。

## 项目里一些高价值 utils 工具

除了歌词相关工具，下面这些 utils 也很值得开发者知道，尤其是要补文档、排查功能或做二次开发时。

### `utils/appPlaybackGuards.ts`

职责：

- 判断当前歌曲属于本地、Navidrome、Stage 或其他播放来源

它能帮助你快速搞清楚某段逻辑到底是对哪类播放上下文生效。

### `utils/appStageHelpers.ts`

职责：

- 收纳 Stage 模式下的一些顶层辅助逻辑
- 例如歌词时间边界、循环模式切换、Stage 条目标识等

适合在看 App 顶层如何接 Stage 状态时配合阅读。

### `services/playbackAdapters.ts`

虽然它在 `services` 下，不在 `utils` 下，但和工具层关系很近。

职责：

- 把本地 / Navidrome 歌曲转成统一播放结构
- 统一构造队列项

如果你要理解为什么 `/stage/player/queue` 能在不同来源下共用一套播放器接口，这个文件很关键。

### `utils/frameRateLimiter.ts`

职责：

- 管理实验性动画帧率限制

和歌词解析无关，但和 visualizer 性能调优直接相关，做展示或性能排查时常会碰到。

### `utils/urlBackground.ts`

职责：

- 规整和校验 URL 背景配置

对外部集成本身关系不大，但如果你在写“展示场景”文档或调试播放页背景配置，它很有用。

### `components/visualizer/wordColoring.ts`

虽然不在 `utils/` 目录下，但它是歌词展示层很核心的共用工具。

职责：

- 处理关键字着色
- 给某些模式复用统一的词级颜色匹配逻辑

如果你在解释 AI 主题、关键词高亮和某些 visualizer 的表现差异，这个文件很值得提。

## 推荐阅读顺序

如果你要从 Stage API 一路追到歌词渲染，推荐顺序是：

1. `docs/developer/stage-api.md`
2. `electron/stageApi.cjs`
3. `src/utils/lyrics/LyricParserFactory.ts`
4. `src/utils/lyrics/adapters/*`
5. `src/utils/lyrics/workerClient.ts`
6. `src/utils/lyrics/parserCore.ts`
7. `src/utils/lyrics/renderHints.ts`
8. `src/components/visualizer/runtime.ts`
9. `src/components/visualizer/<mode>/*`

## 相关资源

- Stage 请求与响应 Schema：主仓库 `test/manual/stage-client/API_SCHEMA.md`
- 本地联调台：`npm run stage:client`
- 用户使用说明：[/guide/stage-and-now-playing](/guide/stage-and-now-playing)
