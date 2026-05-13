# AI 主题接口

Web 版通过 `api/` 目录下的服务端接口生成 AI 主题。项目中同时提供 Gemini 和 OpenAI 兼容接口两套实现。

`api/` 目录是为 Vercel 提供的服务器端接口实现。为了兼容 Cloudflare 部署，这两份 API 实现还会在 `worker/` 目录下保留一份对应副本，供 Cloudflare Worker 运行时使用

也就是说，接口语义上仍然只看这两类能力：

- Gemini 版本
- OpenAI 兼容版本

只是仓库文件上会同时存在：

- `api/` 下的实现，供 Vercel 部署使用
- `worker/` 下为了 Cloudflare 运行时复制过去的对应实现

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

错误处理：

- 非 `POST` 返回 `405`
- 缺少 `lyricsText` 返回 `400`
- 服务端缺少 `GEMINI_API_KEY` 返回 `500`

成功响应示例：

```json
{
  "light": {
    "name": "Melancholic Dawn",
    "backgroundColor": "#f6efe8",
    "primaryColor": "#231f20",
    "accentColor": "#c96e4f",
    "secondaryColor": "#5c4d48",
    "wordColors": [
      { "word": "love", "color": "#d36c7d" }
    ],
    "lyricsIcons": ["Heart", "Cloud"],
    "fontStyle": "sans",
    "provider": "Google Gemini"
  },
  "dark": {
    "name": "Melancholic Midnight",
    "backgroundColor": "#101217",
    "primaryColor": "#f6f3ef",
    "accentColor": "#d88d6e",
    "secondaryColor": "#b9aea7",
    "wordColors": [
      { "word": "love", "color": "#d36c7d" }
    ],
    "lyricsIcons": ["Heart", "Cloud"],
    "fontStyle": "sans",
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

接口内部会：

- 自动补全 `chat/completions` 地址
- 兼容不同 OpenAI 风格供应商
- 在必要时清理代码块包裹的 JSON 文本

返回结构与 Gemini 版本一致，但 `provider` 会标记为 `OpenAI Compatible`。

## 字段说明

主题对象中的关键字段如下：

| 字段 | 说明 |
| --- | --- |
| `name` | 主题名 |
| `backgroundColor` | 背景色 |
| `primaryColor` | 主文本色 |
| `accentColor` | 强调色 |
| `secondaryColor` | 次级文本色 |
| `wordColors` | 关键词及其颜色 |
| `lyricsIcons` | Lucide 图标名数组 |
| `fontStyle` | 项目内固定补成 `sans` |
| `provider` | 生成来源 |

## 设计约束

从实现上看，这两个接口都会要求模型：

- 同时输出明暗两套主题
- 两套主题共享同一批情绪词和图标意象
- 对 `secondaryColor` 保持可读对比度
- 将输入文本裁切到前 2000 字符以内

## 适合什么时候直接调用

- 你要做自己的前端界面，但想复用 Folia 的主题生成逻辑
- 你要在部署后的服务端复用这套双主题输出格式
- 你要调试不同模型在歌词语义配色上的表现
