# AI 主题接口

Web 版通过服务端接口生成 AI 主题，项目中同时提供 Gemini 和 OpenAI 兼容接口两套实现。

## 代码位置与三份实现的关系

| 目录 | 作用 |
| --- | --- |
| `api-ts/` | TypeScript 源码，改接口时改这里 |
| `api/` | 由 `npm run build:vercel-api`（`tsc -p api-ts/tsconfig.json`）编译产出，是 Vercel 实际部署的函数目录 |
| `worker/` | Cloudflare Worker 运行时的对应实现，入口是 `worker/index.ts` |
| `shared/` | 两条链路共用的主题清洗代码 `themeSanitizer` |

`npm run build` 会先编译 `api-ts/` 再执行 `vite build`，所以不要只修改 `api/` 下的产物。

接口语义上只有两类主题生成能力（Gemini 与 OpenAI 兼容），另有一个歌词代理接口。Cloudflare Worker 当前接管这三条路由，其余请求回落到静态资源：

- `/api/generate-theme`
- `/api/generate-theme_openai`
- `/api/lyric-proxy`

## 目标

根据歌词文本或纯音乐标题，返回一组明暗双主题：

- `light`
- `dark`

## 接口一：Gemini

### `POST /api/generate-theme`

请求体：

```json
{
  "lyricsText": "歌词或纯音乐标题",
  "isPureMusic": false,
  "songTitle": "可选的歌曲标题"
}
```

服务端依赖：

- `GEMINI_API_KEY`

错误处理：

- 非 `POST` 返回 `405`
- 缺少 `lyricsText` 返回 `400`
- 服务端缺少 `GEMINI_API_KEY` 返回 `500`
- 上游调用或 JSON 解析失败返回 `500`，响应体是 `{ "error": "..." }`

成功响应示例：

```json
{
  "light": {
    "name": "忧郁破晓",
    "description": "戴上耳机的那一刻，喧嚣的世界瞬间消失了。",
    "backgroundColor": "#f6efe8",
    "primaryColor": "#231f20",
    "accentColor": "#c96e4f",
    "secondaryColor": "#5c4d48",
    "wordColors": [
      { "word": "love", "color": "#d36c7d" }
    ],
    "lyricsIcons": ["Heart", "Cloud"],
    "fontStyle": "sans",
    "animationIntensity": "normal",
    "provider": "Google Gemini"
  },
  "dark": {
    "name": "忧郁子夜",
    "description": "戴上耳机的那一刻，喧嚣的世界瞬间消失了。",
    "backgroundColor": "#101217",
    "primaryColor": "#f6f3ef",
    "accentColor": "#d88d6e",
    "secondaryColor": "#b9aea7",
    "wordColors": [
      { "word": "love", "color": "#d36c7d" }
    ],
    "lyricsIcons": ["Heart", "Cloud"],
    "fontStyle": "sans",
    "animationIntensity": "normal",
    "provider": "Google Gemini"
  }
}
```

## 接口二：OpenAI 兼容

### `POST /api/generate-theme_openai`

请求体与 Gemini 版本保持一致：

```json
{
  "lyricsText": "歌词或纯音乐标题",
  "isPureMusic": false,
  "songTitle": "可选的歌曲标题"
}
```

服务端依赖：

- `OPENAI_API_KEY`
- `OPENAI_API_URL`
- `OPENAI_API_MODEL`
- `OPENAI_API_TEMPERATURE`（可选，取值 `0`–`2`，留空或无效时按 `0.7` 处理）

接口内部会：

- 自动补全 `chat/completions` 地址（`OPENAI_API_URL` 可填 base URL 或完整端点）
- 识别兼容供应商并选择合适的结构化输出方式：官方 OpenAI 走 JSON Schema structured outputs，其他供应商回退到 JSON 模式加提示约束
- 对 `api.deepseek.com` 在未显式设置模型时回退到 `deepseek-v4-flash`，其余情况默认 `gpt-4o`
- 在必要时清理代码块包裹的 JSON 文本

返回结构与 Gemini 版本一致，但 `provider` 会标记为 `OpenAI Compatible`。该 handler 使用 edge runtime。

## 接口三：歌词代理

### `/api/lyric-proxy`

用于在 Web 版绕开浏览器跨域限制拉取第三方歌词资源。它只放行固定白名单主机：

- `qq.com` 及其子域、`y.gtimg.cn`
- `kugou.com` 及其子域
- `amll-ttml-db.stevexmh.net`

代理会剥离 `cookie`、`authorization` 等敏感转发头，并附带 CORS 响应头。它不是通用代理，不要用于白名单以外的地址。

## 字段说明

主题对象中的关键字段如下：

| 字段 | 说明 |
| --- | --- |
| `name` | 主题名，中文，模型被要求不超过 10 字 |
| `description` | 一句话中文氛围描述，模型被要求 15–30 字 |
| `backgroundColor` | 背景色 |
| `primaryColor` | 主文本色 |
| `accentColor` | 强调色 |
| `secondaryColor` | 次级文本色 |
| `wordColors` | 关键词及其颜色 |
| `lyricsIcons` | Lucide 图标名数组 |
| `fontStyle` | 项目内固定补成 `sans` |
| `animationIntensity` | 动画强度，未给出时补成 `normal` |
| `provider` | 生成来源，`Google Gemini` 或 `OpenAI Compatible` |

## 服务端清洗规则

两个接口在返回前都会走 `shared/themeSanitizer` 的 `sanitizeDualTheme()`，因此客户端拿到的结构是稳定的：

- 颜色字段必须是 `#RGB` 或 `#RRGGBB`，否则替换为该模式的 fallback 颜色
- `wordColors` 中非法颜色会回落到 `accentColor`
- `lyricsIcons` 只保留字符串并截断到 12 个
- `light` / `dark` 任一缺失或不是对象时，用内置 fallback 主题补齐
- `fontStyle` 与 `provider` 在清洗后仍会被 handler 强制覆写

也就是说，即使模型输出残缺，接口也不会返回缺字段的主题对象。

## 设计约束

从实现上看，这两个接口都会要求模型：

- 同时输出明暗两套主题
- 两套主题共享同一批情绪词和图标意象（`wordColors` 与 `lyricsIcons` 保持一致）
- 提取 10–20 个情绪词，拉丁文词条不得包含标点、空格或连字符
- 对 `secondaryColor` 保持至少 4.5:1 的可读对比度
- 避免纯黑 / 纯白这类默认配色
- 将输入文本裁切到前 2000 字符以内

## 适合什么时候直接调用

- 你要做自己的前端界面，但想复用 Folia 的主题生成逻辑
- 你要在部署后的服务端复用这套双主题输出格式
- 你要调试不同模型在歌词语义配色上的表现
