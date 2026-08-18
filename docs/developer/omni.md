# Omni 在线音乐服务层

`src/services/onlineMusic/omni.ts` 是 Folia 的 Online Music Network Interface（Omni），也是普通在线歌曲数据的唯一公开入口。它向 UI、Hooks 和业务 Store 提供统一的在线音乐操作，并把 Provider 差异隔离在实现层。

当前 registry 注册三个 Provider：网易云（`netease`）、酷狗（`kugou`）、QQ 音乐（`qq`）。Navidrome 是独立的 Subsonic 服务，入口是 `src/services/navidromeService.ts`，不属于 Omni provider。

## 使用规则

组件、hook、store 和普通 app service 不得直接调用具体 provider、registry、transport 或 raw API。只有两种例外：

- 明确的跨 Provider 编排（歌词匹配、本地元数据匹配、联邦搜索、fallback、比较与迁移）
- provider adapter / transport 自身

这样新 Provider 只需实现统一契约，页面不需要为平台差异堆条件分支。

```ts
import { omni } from '@/services/onlineMusic/omni';

const page = await omni.searchSongs('Folia', { limit: 30, offset: 0 });
const lyrics = await omni.getLyrics(song);
const source = await omni.getAudioSource(song, 'high');
```

## 分层与路由

```text
UI / hooks / stores / app services
        ↓
      omni.ts
        ↓
providerRegistry.ts + providerAccountCache / providerStorage
        ↓
neteaseProvider ── kugouProvider → kugouTransport ── qqProvider → qqTransport
        ↓
src/types/onlineMusic.ts（共享合同）
```

- `providerRegistry.ts`：注册、查找、按歌曲 `sourceRef` 选择 provider、能力检查。
- `omni.ts`：按当前活跃 Provider、歌曲归属或集合归属路由请求，统一返回 `UnifiedSong`、`OmniCollection`、`OmniPage<T>`、`OmniLyricsResult`、`OmniAudioSource` 等模型。
- `useOnlineProviderAccountStore`：维护当前 Provider、登录账号、集合快照、点赞状态和水合 / 新鲜度状态。
- `providerAccountCache.ts`：按 provider 保存用户、集合、点赞 ID 与 hydration / freshness 快照；刷新失败时保留旧快照。
- `providerStorage.ts`：renderer 侧 session / account 持久化边界。
- `resourceCache.ts` / `resourceKeys.ts`：在线资源缓存键与缓存层。
- `catalogRefs.ts`：歌曲、歌单、专辑、歌手的 provider-aware catalog 引用。

`searchSongs()` 等“当前 Provider”方法通过请求代数（request generation）防止切换账号或平台后，旧请求的延迟响应覆盖新界面。切换 Provider 时应调用 `omni.invalidateActiveRequests()`；调用方收到 `AbortError` 时不应把它当作普通请求失败提示，也不要在调用处再实现一套取消 / 晚到响应防护。

## 主要能力

| 范畴 | 常用方法 |
| --- | --- |
| Provider 状态 | `getProviderSummaries()`、`getActiveProviderSummary()`、`getActiveCapabilities()`、`getProviderCapabilities()`、`getProviderAvailability()`、`getProviderLabel()` |
| 认证 | `getLoginStatus()`、`logout()`、`getQrLoginMethods()`、`createQrLogin()`、`checkQrLogin()`、`cancelQrLogin()`、`getQrTtlMs()` |
| 搜索 | `searchSongs()`、`searchProviderSongs()` |
| 音乐库 | `getUserPlaylists()`、`getProviderUserPlaylists()`、`refreshProviderPlaylists()`、`getUserAlbums()`、`getLikedSongIds()`、`getProviderLikedSongIds()`、`getCloudCollection()`、`getProviderCloudCollection()` |
| 推荐 | `getHomeFeed()`、`getPersonalFm()`、`getDailySongs()`、`getRecommendationHistory()`、`getRecommendationHistoryDates()`、`getRecommendationHistorySongs()`、`dislikeSong()` |
| 播放与歌词 | `getSongDetail()`、`canPlaySong()`、`getAudioSource()`、`getLyrics()`、`getChorusRanges()` |
| 可用性 | `getSongAvailability()`、`getSongReplacement()` |
| 目录 | `getCollectionTracks()`、`getCollectionDetail()`、`getAlbumDetail()`、`getArtistDetail()`、`getArtistSongs()`、`getArtistAlbums()` |
| 用户操作 | `likeSong()`、`toggleSongLike()`、`addSongToPlaylist()`、`getSubscriptionStatus()`、`subscribe()`、`updateCollectionTracks()` |
| 外链与引用 | `canResolveCatalogRef()`、`resolveCatalogRefs()`、`getSongPageUrl()` |

Omni 还提供一组同步判定方法供 UI 决定是否展示入口，例如 `isSongLiked()`、`canLikeSong()`、`canAddSongToPlaylist()`、`canEditCollectionTracks()`、`canDislikeSong()`、`canSubscribeCollection()`、`getPlaylistsForSong()`。

每项能力都由 Provider 的 `capabilities` 和实际实现共同决定。`OmniProviderCapabilities` 当前包含 `search`、`playback`、`lyrics`、`auth`、`userLibrary`、`playlists`、`albums`、`artists`、`recommendations`、`mutations`、`wordByWordLyrics`，以及可选的 `userCloud`、`historyRecommendations`、`playlistSubscription`、`playlistTrackMutations`、`likes`、`userAlbums`。

能力不支持时，Omni 会返回空页 / 空值，或在需要明确失败的操作上抛出 `OnlineProviderError`（对外别名 `OmniError`）。它的 `code` 取值为 `auth-required`、`unsupported`、`unavailable`、`not-playable`、`network`、`invalid-response`，UI 应据此区分“未登录”“该音源不支持”“歌曲不可播放”等语义，而不是统一显示为网络错误。

## 歌曲、集合与歌词的归属

Omni 不会假定“当前活跃 Provider”拥有所有对象：

- 以歌曲自身的 `sourceRef` 决定播放、歌词、可用性、点赞和外链应路由到哪个 Provider。
- 以 `OmniCollection.providerId` 决定歌单、专辑、艺人和订阅操作的 Provider。
- `getLyrics(song)` 在 Provider 获取歌词后会统一解析副歌语义：优先采用 Provider / TTML 的信息，其次才回退到文本检测，因此 Visualizer 只需消费 `Line.isChorus` 和 `chorusEffect`。

跨 Provider 的歌词匹配、在线元数据匹配等属于显式编排：应使用 `searchProviderSongs(providerId, ...)` 或 registry 指定目标 Provider，不能使用会随活跃 Provider 变化的 `searchSongs()`。

### 播放身份

在线歌曲身份是 `(sourceRef.kind === 'online', sourceRef.providerId, sourceRef.mediaId)`，不是 `song.id` 单值。比较、去重、替代和入队前优先使用：

- `src/utils/appPlaybackGuards.ts`：`getPlaybackSourceRef`、`getPlaybackSongKey`、`isSamePlaybackSong`
- `src/utils/appPlaybackHelpers.ts`：播放结构和来源相关派生

跨 Provider 的数字 id 不可直接去重：`online:netease:123` 与 `online:kugou:123` 默认是两个播放身份。

## Provider 实现要点

- `neteaseProvider.ts`：网易云 adapter，归一化到 Omni contract。
- `kugouProvider.ts`：酷狗 adapter，请求细节在 `kugouTransport.ts`。Web 版依赖 `VITE_KUGOU_API_BASE` 指向的 KuGouMusicApi 实例；Electron 版直接调用主进程内置模块，只在 renderer 保留非敏感的 `userid` 提示，`token`、Cookie 与 `dfid` 由主进程加密持有。
- `qqProvider.ts`：QQ 音乐 adapter，请求与 opaque session 细节在 `qqTransport.ts`，归一化在 `qqNormalize.ts`。集合身份一律使用 mid，数字 `albumid` / `singer.id` 会被上游拒收（返回 HTTP 200 但 `code` 非 0，表现为空白页）。后端由 `VITE_QQ_API_BASE` 指向的 QQ 音乐 API 提供，未配置时该 Provider 不可用；renderer 只保存 opaque 的 `qqmusic_session`。

## 新增 Provider 时

1. 在 `src/types/onlineMusic.ts` 实现 `OnlineMusicProvider` 契约与 `capabilities`。
2. 在 `src/services/onlineMusic/providerRegistry.ts` 用 `registerOnlineMusicProvider()` 注册。
3. 将搜索、播放、歌词、账号、目录和变更能力按需实现；不支持的能力保持缺失并正确声明 capability。
4. 通过 Omni 验证搜索、歌曲归属路由、Provider 切换中止、账号快照和错误回退。

页面代码不应为了新增 Provider 直接调用实现文件。若确有跨 Provider 工作流，需在调用处显式标注目标 `providerId`，避免意外依赖当前活跃 Provider。若 Omni 缺少某项能力，应扩展 `types/onlineMusic.ts`、`omni.ts` 和对应 adapter，而不是新增第二条公开旁路。
