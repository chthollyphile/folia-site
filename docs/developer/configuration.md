# 配置说明

## 环境变量

来自项目根目录 `.env.example` 的核心变量如下。

| 变量名 | 是否必需 | 说明 |
| --- | --- | --- |
| `VITE_NETEASE_API_BASE` | 是 | 网易云 API 基地址 |
| `VITE_KUGOU_API_BASE` | 否 | Web 版 KuGouMusicApi 基地址；Electron 版使用内置模块 |
| `VITE_AI_PROVIDER` | 是 | `google` 或 `openai` |
| `GEMINI_API_KEY` | 使用 Gemini 时必需 | Gemini Key |
| `OPENAI_API_KEY` | 使用 OpenAI 兼容接口时必需 | OpenAI 兼容 Key |
| `OPENAI_API_URL` | 使用 OpenAI 兼容接口时建议设置 | 可填 base URL 或完整 `chat/completions` 地址 |
| `OPENAI_API_MODEL` | 使用 OpenAI 兼容接口时建议设置 | 模型名 |

## 示例

### Gemini

```bash
VITE_NETEASE_API_BASE=http://localhost:3000
VITE_KUGOU_API_BASE=
VITE_AI_PROVIDER=google
GEMINI_API_KEY=your_gemini_api_key_here
```

### Web 版酷狗 API

Web 版的酷狗搜索、播放、歌词和登录功能通过独立的 [KuGouMusicApi](https://github.com/MakcRe/KuGouMusicApi) 服务提供。主仓库不提供默认公共实例，部署后将服务根地址填入 `VITE_KUGOU_API_BASE`。Electron 版在主进程中直接调用内置模块，不需要配置这个变量。

注意: 本项目使用概念版接口，在 API 项目的环境变量中添加 `platform=lite`

### OpenAI 官方接口

```bash
VITE_NETEASE_API_BASE=http://localhost:3000
VITE_AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_API_MODEL=gpt-4o
```

### 兼容接口示例

```bash
VITE_NETEASE_API_BASE=http://localhost:3000
VITE_AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_API_URL=https://api.deepseek.com
OPENAI_API_MODEL=deepseek-v4-flash
```

## 桌面版设置项

桌面版除了读取运行环境外，还会在本地设置中持久化一些选项，例如：

- AI 提供商与 Key
- 是否为 AI 请求使用系统代理
- Stage Mode 是否启用
- Stage Mode 来源
- Stage API Token
- Stage API 端口
- 更新检查和自动更新开关
- 音频缓存目录

## Navidrome 配置

Navidrome 在前端侧保存这些信息：

- `serverUrl`
- `username`
- `password`

接入时会按 Subsonic / OpenSubsonic 方式生成认证参数。

## 本地音乐运行条件

本地音乐功能依赖浏览器或桌面运行环境的文件访问能力。桌面版体验会更完整；Web 版则依赖宿主环境是否支持文件系统访问接口。
