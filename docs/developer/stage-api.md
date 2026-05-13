# Stage API

Stage API 是桌面版暴露出的本地 HTTP 接口，用于把歌词、媒体或点歌请求推送到 Folia。

## 基本信息

- 默认地址：`http://127.0.0.1:32107`
- 作用范围：本地桌面集成
- 授权方式：Bearer Token

说明：

- `GET /stage/health` 不需要鉴权
- 其余主要接口都需要 `Authorization: Bearer <token>`

## 快速开始

1. 在桌面版设置里开启 `Stage Mode`
2. 复制本地地址和 Token
3. 发送请求到对应接口

## 健康检查

### `GET /stage/health`

用途：探活，确认 Stage 服务是否启动。

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

## 读取状态

### `GET /stage/status`

用途：读取当前 Stage 状态、当前激活条目和当前会话数据。

返回内容会包含类似这些信息：

- `enabled`
- `modeEnabled`
- `source`
- `port`
- `token`
- `activeEntryKind`
- `lyricsSession`
- `mediaSession`

## 推送歌词

### `POST /stage/lyrics`

用途：推送歌词并展示

注意这个接口等同于播放一首无音频的歌曲，适合作为看板展示的场景，**不是**为当前歌曲追加歌词

请求体：

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

`lyricSource.type` 可对应项目内部支持的多类来源，例如：

- `embedded`
- `local`
- `netease`
- `navidrome`
- `qrc`

## 推送媒体会话

### `POST /stage/session`

用途：推送媒体播放会话，可以是 URL，也可以是上传本地文件。

支持两种传输方式：

- `application/json`
- `multipart/form-data`

### 关键字段

| 字段 | 说明 |
| --- | --- |
| `audioUrl` | 音频 URL |
| `audioFile` | 音频文件上传 |
| `lyricsText` | 直接传歌词文本 |
| `lyricsFile` | 上传歌词文件 |
| `lyricsFormat` | `lrc` / `enhanced-lrc` / `vtt` / `yrc` |
| `coverUrl` | 封面 URL |
| `coverFile` | 封面文件上传 |
| `title` / `artist` / `album` | 元数据补充 |

约束：

- `audioUrl` 和 `audioFile` 必须二选一
- `lyricsText` 和 `lyricsFile` 最多提供一种

### JSON 示例

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

### 行为说明

如果上传的是本地音频文件，Folia 会额外尝试读取：

- 内嵌标题、歌手、专辑
- 内嵌歌词
- 内嵌封面

## 搜索歌曲

### `POST /stage/search`

用途：通过 Folia 当前可用的在线搜索能力返回歌曲列表。

请求体：

```json
{
  "query": "Mili world.execute (me)",
  "limit": 5
}
```

返回示例：

```json
{
  "query": "Mili world.execute (me)",
  "songs": [
    {
      "songId": 123,
      "title": "world.execute(me);",
      "artists": ["Mili"],
      "album": "Album",
      "durationMs": 240000,
      "coverUrl": "https://..."
    }
  ]
}
```

## 触发点歌

### `POST /stage/play`

用途：让 Folia 主播放器播放指定歌曲，或仅追加到队列。

请求体：

```json
{
  "songId": 123456,
  "appendToQueue": false
}
```

成功响应：

```json
{
  "ok": true,
  "songId": 123456,
  "appendToQueue": false
}
```

## 清空状态

### `DELETE /stage/state`

用途：清空当前 Stage 输入状态。

执行后会清除当前 lyrics session 或 media session，并返回最新状态对象。

## 相关资源

- 本地联调台：`npm run stage:client`
- 用户使用说明：[/guide/stage-and-now-playing](/guide/stage-and-now-playing)

