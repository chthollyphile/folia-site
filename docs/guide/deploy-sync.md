# 部署同步服务

这篇指南会带你部署自己的 Folia 同步服务，用来在多台设备之间同步设置与 AI 主题记录。

Folia 不提供官方中心化同步服务器，这样做是为了把数据控制权留在你自己手里。

同步服务目前会同步：

- 视觉设置
- AI 主题记录

它不会同步：

- 音频文件
- 封面
- 本地音乐库内容
- 账号登录状态

## ⚠️ 同步前的风险提示

多设备同步本质上仍然有数据覆盖风险。网络延迟、设备时钟不一致、并发写入冲突，都可能导致新旧数据互相覆盖。

强烈建议你在第一次启用同步前，先在 Folia 里导出一份本地完整备份。

> [!TIP]
> 你可以在这里观看 [视频教程](https://www.bilibili.com/video/BV1G3Nw6GEY7)

## 开始前准备

先获取主仓库源码，然后进入 `sync-server` 目录：

```bash
git clone https://github.com/chthollyphile/folia-major.git
cd folia-major/sync-server
```

后面的命令都默认在 `folia-major/sync-server` 目录里执行。

## 先认识两个 Token

无论你选哪种部署方式，最好先理解这两个密钥：

| Token | 用途 | 是否必填 | 建议长度 | 忘记后怎么办 |
| --- | --- | --- | --- | --- |
| `SYNC_TOKEN` | 给 Folia 客户端鉴权。客户端必须带这个 Token 才能读写同步数据。 | 必填 | 8 到 32 位随机字符 | 重新生成并覆盖原配置 |
| `DASHBOARD_TOKEN` | 给浏览器访问网页看板用。 | 选填 | 至少 16 位随机字符 | 重新生成并覆盖原配置 |

> [!IMPORTANT]
> 尤其是 Cloudflare 部署时，部署后的 Secret 无法直接回读。部署完成后请把 Token 保存到密码管理器里。

### 如何生成随机 Token

可以任选一种：

浏览器控制台：

```javascript
crypto.randomUUID()
```

Node.js 终端：

```bash
node -e "console.log(crypto.randomBytes(16).toString('hex'))"
```

OpenSSL：

```bash
openssl rand -hex 16
```

> [!WARNING]
> 服务端要求 `SYNC_TOKEN` 长度至少为 8 位。太短会被拒绝启动。若服务暴露在公网，也建议你在 Cloudflare 或反向代理层加上限流。

---

## 方案一：Cloudflare Workers 部署（推荐）

如果你不想自己维护服务器，这是目前最省心的方案。主仓库已经提供安装脚本，推荐优先使用脚本流程。

### 前置要求

- 一个 Cloudflare 账号
- 本机可用 `npm`

### 方式 A：使用安装脚本（推荐）

进入 `sync-server` 目录后，按系统执行：

Linux / macOS / WSL / Git Bash：

```bash
bash ./install.sh
```

Windows PowerShell / PowerShell 7：

```powershell
.\install.ps1
```

如果 PowerShell 阻止执行，可以改用：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

脚本启动后会显示部署菜单：

```text
1) Node (PM2)
2) Docker
3) Cloudflare Workers
```

输入 `3` 后，脚本会自动完成这些事：

- 安装项目依赖
- 创建或查询 D1 数据库
- 生成 `wrangler.local.toml`
- 写入真实的 `database_id`
- 提示你输入 `SYNC_TOKEN`
- 自动生成 `DASHBOARD_TOKEN`
- 把两个 Token 注入 Cloudflare Secret
- 执行部署命令并发布 Worker

首次运行时，Wrangler 可能会在浏览器里要求你登录 Cloudflare，这是正常的。

### 方式 B：手动部署

如果你不想用脚本，也可以手动执行。

#### 1. 安装依赖并登录 Cloudflare

```bash
npm install
npx wrangler login
```

#### 2. 创建 D1 数据库

```bash
npx wrangler d1 create folia-sync -c wrangler.toml
```

执行成功后，记下输出里的 `database_id`。

如果你已经创建过同名数据库，也可以先查看列表：

```bash
npx wrangler d1 list
```

#### 3. 生成本地部署配置

Windows PowerShell：

```powershell
Copy-Item wrangler.toml wrangler.local.toml
```

macOS / Linux：

```bash
cp wrangler.toml wrangler.local.toml
```

然后打开 `wrangler.local.toml`，把：

```toml
database_id = "replace-with-your-d1-database-id"
```

替换成真实的 `database_id`。

#### 4. 注入 Cloudflare Secrets

```bash
npx wrangler secret put SYNC_TOKEN --config wrangler.local.toml
npx wrangler secret put DASHBOARD_TOKEN --config wrangler.local.toml
```

执行后终端会提示你分别输入两个 Token。

#### 5. 部署到 Workers

```bash
npm run deploy:cf -- --config wrangler.local.toml
```

部署成功后，Wrangler 会输出你的 Worker 域名。

#### 6. 后续更新

如果只是更新代码，通常不用重建数据库，也不用重新设置 Secret，直接再次执行：

```bash
npm run deploy:cf -- --config wrangler.local.toml
```

### Cloudflare 部署完成后你会得到什么

- 一个 Worker 域名，作为同步服务地址
- 一个 `DASHBOARD_TOKEN`，用于访问网页看板
- 一个本地 `wrangler.local.toml` 文件，供后续重复部署使用

`wrangler.local.toml` 已经被 `.gitignore` 忽略，不要提交到仓库。

---

## 方案二：Docker 部署

如果你有自己的服务器、NAS、VPS 或软路由，Docker 是最干净的部署方式。

### 1. 准备 `docker-compose.yml`

新建一个目录，在里面创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  sync-server:
    image: papersman/folia-sync-server:latest
    container_name: folia-sync
    restart: unless-stopped
    ports:
      - "13000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - PORT=3000
      - DB_PATH=/app/data/folia-sync.db
    env_file:
      - .env
```

### 2. 创建 `.env`

```env
SYNC_TOKEN="你的_SYNC_TOKEN"
DASHBOARD_TOKEN="你的_DASHBOARD_TOKEN"
```

其中：

- `SYNC_TOKEN` 必填，至少 8 位
- `DASHBOARD_TOKEN` 选填，建议 16 位以上

### 3. 启动服务

```bash
docker compose up -d
```

启动后，数据库会持久化到当前目录下的 `./data` 文件夹。

---

## 方案三：Node.js 自托管部署

如果你不想用 Docker，也可以直接用 Node.js 运行。

### 前置要求

- Node.js 18 或更高版本
- `npm` 或 `pnpm`

### 1. 创建 `.env`

```env
SYNC_TOKEN="你的_SYNC_TOKEN"
DASHBOARD_TOKEN="你的_DASHBOARD_TOKEN"
PORT=3000
DB_PATH="./folia-sync.db"
```

### 2. 安装并启动

```bash
npm install
npm run start:node
```

如果你希望长期运行，建议再配合 PM2、systemd 或 Docker 做进程守护。

---

## 部署完成后，如何接入 Folia

打开 Folia，然后进入：

`设置 -> 存储 -> 同步服务`

按下面填写：

1. `Sync Server URL`：填写你的服务地址，记得带 `http://` 或 `https://`
2. `Bearer Token`：填写你设置的 `SYNC_TOKEN`

保存后点击“立即同步”即可开始。Folia 也会在启动和主题生成时自动尝试同步。

## 网页看板怎么访问

如果你配置了 `DASHBOARD_TOKEN`，可以直接在浏览器访问：

```text
https://你的服务域名/?token=你的_DASHBOARD_TOKEN
```

这个页面只用于查看服务状态、数据库统计和最近更新时间。

```bash
wrangler d1 create folia-sync
```

| 问题 | 解决方法 |
| --- | --- |
| `wrangler d1 create` 失败 | 确认终端当前就在 `folia-major/sync-server` 目录 |
| 部署时提示找不到数据库或 `database_id` 错误 | 检查 `wrangler.local.toml` 里是不是填了真实的 `database_id` |
| Folia 提示同步失败 / 未授权 | 检查客户端里填写的 Token 是否和服务端 `SYNC_TOKEN` 完全一致 |
| 想访问网页看板却显示未授权 | 检查 URL 里带的是 `DASHBOARD_TOKEN`，不是 `SYNC_TOKEN` |
| 担心多设备覆盖数据 | 先导出本地备份，再开始启用同步 |
