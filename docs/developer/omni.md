# Omni 在线音乐服务层

`src/services/onlineMusic/omni.ts` 是 Folia 的 Online Music Network Interface（Omni）。它向 UI、Hooks 和业务 Store 提供统一的在线音乐操作入口，并将具体 Provider（当前包括网易云、酷狗等）的差异隔离在 Provider 层。

## 使用规则

除非是明确的跨 Provider 编排，或必须调用某个 Provider 的底层能力，前端 UI、Hooks 和业务 Store 都应通过 `omni` 访问在线音乐能力，不要直接 import 某个 Provider 的实现。

这样新 Provider 可以只实现统一契约，页面不需要为了平台差异堆积条件分支。

```ts
import { omni } from '@/services/onlineMusic/omni';

const page = await omni.searchSongs('Folia', { limit: 30, offset: 0 });
const lyrics = await omni.getLyrics(song);
const source = await omni.getAudioSource(song, quality);
```

## 分层与路由

```text
UI / Hooks / Store
        ↓
      omni.ts
        ↓
providerRegistry + active provider account store
        ↓
Netease / KuGou / future providers
```

- `providerRegistry.ts`：注册、查找并校验 Provider 能力。
- `omni.ts`：按当前活跃 Provider、歌曲归属或集合归属路由请求，统一返回 `UnifiedSong`、`OmniCollection`、`OmniPage<T>`、`OmniLyricsResult` 等模型。
- `useOnlineProviderAccountStore`：维护当前 Provider、登录账号、集合快照、点赞状态和水合 / 新鲜度状态。

`searchSongs()` 等“当前 Provider”方法会通过请求代数防止切换账号或平台后，旧请求的延迟响应覆盖新界面。切换 Provider 时应调用 `omni.invalidateActiveRequests()`；调用方收到 `AbortError` 时不应将它当作普通请求失败提示。

## 主要能力

| 范畴 | 常用方法 |
| --- | --- |
| Provider 状态 | `getProviderSummaries()`、`getActiveCapabilities()`、`getProviderAvailability()` |
| 认证 | `getLoginStatus()`、`createQrLogin()`、`checkQrLogin()`、`logout()` |
| 搜索 | `searchSongs()`、`searchProviderSongs()` |
| 音乐库 | `getUserPlaylists()`、`getLikedSongIds()`、`getCloudCollection()`、`refreshProviderPlaylists()` |
| 推荐 | `getHomeFeed()`、`getPersonalFm()`、`getDailySongs()`、`dislikeSong()` |
| 播放与歌词 | `canPlaySong()`、`getAudioSource()`、`getLyrics()`、`getChorusRanges()`、`getSongAvailability()` |
| 目录 | `getCollectionTracks()`、`getCollectionDetail()`、`getArtistSongs()`、`getArtistAlbums()` |
| 用户操作 | `toggleSongLike()`、`addSongToPlaylist()`、`subscribe()`、`updateCollectionTracks()` |

每项能力都由 Provider 的 `capabilities` 和实际实现共同决定。能力不支持时，Omni 会返回空页 / 空值，或在需要明确失败的操作上抛出 `OnlineProviderError`。UI 应根据 `getActiveCapabilities()` 和可用性状态决定是否展示入口。

## 歌曲、集合与歌词的归属

Omni 不会假定“当前活跃 Provider”拥有所有对象：

- 以歌曲自身的 `sourceRef` 决定播放、歌词、可用性、点赞和外链应路由到哪个 Provider。
- 以 `OmniCollection.providerId` 决定歌单、专辑、艺人和订阅操作的 Provider。
- `getLyrics(song)` 在 Provider 获取歌词后会统一解析副歌语义：优先采用 Provider / TTML 的信息，其次才回退到文本检测，因此 Visualizer 只需消费 `Line.isChorus` 和 `chorusEffect`。

跨 Provider 的歌词匹配、在线元数据匹配等属于显式编排：应使用 `searchProviderSongs(providerId, ...)` 或 registry 指定目标 Provider，不能使用会随活跃 Provider 变化的 `searchSongs()`。

## 新增 Provider 时

1. 在 `src/types/onlineMusic.ts` 实现 `OnlineMusicProvider` 契约与 `capabilities`。
2. 在 `src/services/onlineMusic/providerRegistry.ts` 注册 Provider。
3. 将搜索、播放、歌词、账号、目录和变更能力按需实现；不支持的能力保持缺失并正确声明 capability。
4. 通过 Omni 验证搜索、歌曲归属路由、Provider 切换中止、账号快照和错误回退。

页面代码不应为了新增 Provider 直接调用实现文件。若确有跨 Provider 工作流，需在调用处显式标注目标 `providerId`，避免意外依赖当前活跃 Provider。
