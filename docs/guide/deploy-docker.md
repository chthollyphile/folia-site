# Docker 全栈部署

本指南使用 Docker Compose 一次部署完整的 Folia Web 服务：Web 网关、Folia Web API、网易云与酷狗音乐接口，以及独立的同步服务。

适合 NAS、VPS、软路由或已有 Docker 环境的自托管用户。部署完成后，只有 Web 网关和同步服务会开放宿主机端口；其余服务仅在 Docker 网络中互通。

## 开始前准备

- Docker Engine 24 或更高版本
- Docker Compose v2
- 一台可运行 Docker 的服务器或 NAS

不需要克隆 Folia 源码。新建一个空目录并下载 Compose 文件与环境变量模板：

```bash
mkdir folia-docker
cd folia-docker

curl -fL \
  https://raw.githubusercontent.com/chthollyphile/folia-major/main/deploy/docker/compose.yaml \
  -o compose.yaml
curl -fL \
  https://raw.githubusercontent.com/chthollyphile/folia-major/main/deploy/docker/.env.example \
  -o .env
```

也可以直接在浏览器下载这两个文件，放到同一个目录中：

```text
folia-docker/
├── compose.yaml
└── .env
```

## 配置并启动

先生成同步服务 Token：

```bash
openssl rand -hex 32
```

编辑 `.env`，把上一步生成的值填入 `SYNC_TOKEN`。至少要确认以下配置存在：

```env
FOLIA_IMAGE_NAMESPACE=papersman
SYNC_TOKEN=粘贴至少八位的随机字符串
```

AI 配置可以先留空，不影响搜索、播放和歌词等功能；需要生成 AI 主题时，再在 `.env` 中填写相应的 API Key。未设置 `FOLIA_STACK_VERSION` 和 `FOLIA_SYNC_VERSION` 时，将使用 `latest` 镜像标签。

验证配置并启动全部服务：

```bash
docker compose config
docker compose pull
docker compose up -d --wait
docker compose ps
```

默认访问地址：

- Folia Web：`http://服务器 IP:18080`
- 同步服务健康检查：`http://服务器 IP:13000/health`

网易云、酷狗与 Folia Web API 不会暴露宿主机端口，不能绕过 Web 网关直接访问。同步服务也与 Web 内部服务隔离。

## 环境变量说明

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `FOLIA_IMAGE_NAMESPACE` | 模板为 `papersman` | Docker Hub 镜像命名空间，必填 |
| `FOLIA_STACK_VERSION` | `latest` | 四个 Web 堆栈镜像共用的版本 |
| `FOLIA_SYNC_VERSION` | `latest` | Sync Server 的独立版本 |
| `FOLIA_HTTP_BIND` / `FOLIA_HTTP_PORT` | `0.0.0.0` / `18080` | Web 网关监听地址与端口 |
| `FOLIA_AI_PROVIDER` | `google` | AI 提供商：`google`、`gemini` 或 `openai` |
| `GEMINI_API_KEY` | 空 | Gemini / Google AI 的 API Key |
| `OPENAI_API_KEY` | 空 | OpenAI 兼容接口的 API Key |
| `OPENAI_API_URL` | `https://api.openai.com/v1` | OpenAI 兼容接口地址 |
| `OPENAI_API_MODEL` | `gpt-4o` | 使用的模型名称 |
| `OPENAI_API_TEMPERATURE` | `0.7` | AI 主题生成温度 |
| `FOLIA_FORWARD_CLIENT_IP` | `false` | 是否向音乐平台转发浏览器 IP |
| `ENABLE_GENERAL_UNBLOCK` | `false` | 网易云 API 的通用解锁开关 |
| `FOLIA_SYNC_BIND` / `FOLIA_SYNC_PORT` | `0.0.0.0` / `13000` | 同步服务监听地址与端口 |
| `FOLIA_SYNC_DATA_DIR` | `./data/sync` | Sync Server SQLite 数据持久化目录 |
| `SYNC_TOKEN` | 无 | 同步客户端 Bearer Token，至少八位，必填 |
| `DASHBOARD_TOKEN` | 空 | 同步服务隐藏看板的 Token |

## 配置 AI 主题

AI 主题仅在生成主题时需要；不配置不会影响音乐播放。选择一种提供商，在 `.env` 中填写相应的变量即可。

### Gemini / Google

`FOLIA_AI_PROVIDER` 可以填 `google` 或 `gemini`，两者都会使用 Gemini。当前服务端使用 `gemini-3-flash-preview` 模型：

```env
FOLIA_AI_PROVIDER=google
GEMINI_API_KEY=你的_Gemini_API_Key
```

### OpenAI 或兼容接口

OpenAI、DeepSeek 等兼容 Chat Completions API 的服务都使用以下变量。`OPENAI_API_URL` 可填写 API Base URL，也可填写完整的 `chat/completions` 地址；`OPENAI_API_TEMPERATURE` 的有效范围是 `0` 到 `2`，省略或填写无效值时使用 `0.7`。

OpenAI 官方接口示例：

```env
FOLIA_AI_PROVIDER=openai
OPENAI_API_KEY=你的_API_Key
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_API_MODEL=gpt-4o
OPENAI_API_TEMPERATURE=0.7
```

其他 OpenAI 兼容服务示例：

```env
FOLIA_AI_PROVIDER=openai
OPENAI_API_KEY=你的_API_Key
OPENAI_API_URL=https://api.deepseek.com
OPENAI_API_MODEL=deepseek-v4-flash
OPENAI_API_TEMPERATURE=0.7
```

部分模型会限制温度值；例如模型要求固定温度时，请按其服务商文档调整该项。AI 密钥只会传给后端容器，不会写入前端静态文件。修改 `FOLIA_AI_PROVIDER` 后，可只重建 Web 网关：

```bash
docker compose up -d --force-recreate gateway
```

通常应保持 `FOLIA_FORWARD_CLIENT_IP=false`，避免登录地点显示为局域网或未知。只有为了兼容旧部署行为时，才建议改为 `true`。

## 配置 HTTPS

`http://服务器 IP:18080` 可以用于在线搜索、播放、歌词和大部分视觉功能，但局域网 IP 上的普通 HTTP 不属于浏览器安全上下文。以下功能会不可用或降级：

- 本地音乐目录导入、重扫与授权恢复
- PWA 安装和离线运行
- 封面二进制持久缓存
- 音频输出设备选择
- 标准剪贴板 API

若要正式使用本地音乐，建议通过 NAS 或服务器现有的反向代理终止 HTTPS：

```text
https://folia.example.com/  ->  http://127.0.0.1:18080
https://sync.example.com/   ->  http://127.0.0.1:13000
```

反向代理应传递以下请求头，并把 HTTP 重定向到 HTTPS：

```text
Host
X-Forwarded-Host
X-Forwarded-Proto: https
X-Forwarded-For
```

如果反向代理运行在宿主机上，可以将 `FOLIA_HTTP_BIND` 和 `FOLIA_SYNC_BIND` 改为 `127.0.0.1`，避免服务被绕过。请使用浏览器信任的完整证书链；未安装根证书的自签名证书仍不属于可信安全上下文。应用也不支持部署在 `/folia/` 这类子路径下，建议使用独立域名或子域名。

> [!TIP]
> HTTPS 也不能让不支持 File System Access API 的浏览器获得目录选择能力。需要导入本地目录时，请使用桌面版 Chromium 系浏览器。

HTTP 与 HTTPS 是不同的 origin。切换到 HTTPS 后，HTTP 下保存的登录态、设置、本地曲库索引和 IndexedDB 数据不会自动迁移。

## 在 Folia 中接入同步服务

部署完成后，在 Folia 的同步设置中填写同步服务地址，例如 `https://sync.example.com`，并填入 `.env` 中的 `SYNC_TOKEN`。具体设置步骤可参考 [部署同步服务](/guide/deploy-sync#部署完成后如何接入-folia)。

## 更新、回滚与备份

拉取 `.env` 指定版本的最新镜像并更新服务：

```bash
docker compose pull
docker compose up -d
```

默认的 `latest` 不会自动更新，仍需手动执行上述命令。需要回滚时，在 `.env` 中设置此前使用的 `FOLIA_STACK_VERSION` 或 `FOLIA_SYNC_VERSION`（如 `A.B.C`），然后再次执行更新命令。

同步服务数据保存在 `FOLIA_SYNC_DATA_DIR`。备份前建议先停止同步服务：

```bash
docker compose stop sync-server
tar -czf folia-sync-backup.tar.gz ./data/sync
docker compose start sync-server
```

## 排查问题

查看容器状态、日志和健康检查：

```bash
docker compose ps
docker compose logs --tail=200 gateway backend netease-api kugou-api sync-server
curl http://127.0.0.1:18080/healthz
curl http://127.0.0.1:18080/api/healthz
curl http://127.0.0.1:13000/health
```

如果浏览器能打开网页但目录导入或音频设备选择不可用，优先检查是否正通过可信 HTTPS 域名访问。若容器无法启动，先执行 `docker compose config` 检查 `.env` 是否已填写 `FOLIA_IMAGE_NAMESPACE` 与 `SYNC_TOKEN`。

更多 Web 部署路线可查看 [部署 Web 版](/guide/deploy-vercel)，仅部署同步服务可查看 [部署同步服务](/guide/deploy-sync)。
