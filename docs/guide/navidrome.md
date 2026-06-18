# Navidrome

Folia 支持把 Navidrome 作为独立音乐来源接入。接入后，你可以在同一个播放器里浏览私人曲库，同时继续使用 Folia 的歌词和视觉能力。

## 需要准备什么

- 一个可访问的 Navidrome 服务器地址
- 账号用户名
- 账号密码

## 在 Folia 中配置

1. 打开设置中的集成或服务相关页面。
2. 启用 `Navidrome`。
3. 输入：
   - `Server URL`
   - `Username`
   - `Password`
4. 测试连接。
5. 连接成功后保存。

## 接入后可用的能力

- 浏览专辑列表
- 浏览歌手与歌手下专辑
- 搜索曲库
- 浏览与管理播放列表
- 随机歌曲
- 收藏歌曲与歌单（支持双向同步 Navidrome 收藏状态）
- 读取流媒体地址与封面

## 歌词策略

Navidrome 歌曲有两种常见歌词来源：

- Navidrome / OpenSubsonic 返回的歌词
- 通过在线匹配得到的歌词

推荐给 Navidrome 用户的做法是：将歌词嵌入到音频文件的标签里，这样 Folia 就能直接从 Navidrome 获取到带时间轴的歌词，获得最佳体验。

你可以把在线匹配当作补充方案，尤其在这些场景下很有用：

- Navidrome 只提供纯文本歌词
- 歌词没有时间轴
- 想获得更完整的逐字歌词

## 接口基础

Folia 对接的是 Subsonic / OpenSubsonic 风格接口，内部会用这些能力：

- `ping`
- `getAlbumList2`
- `getAlbum`
- `getArtists`
- `getArtist`
- `getPlaylists`
- `getPlaylist`
- `createPlaylist`
- `updatePlaylist`
- `deletePlaylist`
- `search3`
- `getLyrics`
- `getLyricsBySongId`
- `stream`
- `getCoverArt`

## 适合怎样的用户

Navidrome 接入比较合适：

- 你已经在使用 Navidrome 来管理你的私人曲库
- 你希望远离在线平台的可用性波动
- 你对自托管有偏好

如果你只是想快速导入本机文件，优先看 [本地音乐](/guide/local-music)。

