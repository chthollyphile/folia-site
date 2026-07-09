# 部署同步服务

这篇指南将帮助你**免费**、**私有**地部署属于你自己的同步服务。Folia 本身不提供官方中心化服务器以保证你的数据隐私和控制权。

同步服务负责同步的数据包括：
- 外观与应用设置
- AI 主题记录

它**不会**同步：音频文件、封面、本地音乐、账号登录状态。

## ⚠️ 数据同步风险提示

多设备相互同步数据在本质上存在一定风险。由于网络延迟、设备时钟不同步或并发写入冲突，极端情况下可能会意外造成设置或主题数据丢失、甚至被旧版本覆盖。**强烈建议在首次启用同步功能前，先通过 Folia 导出一份本地全量备份**，以防万一。

## 开始前的准备

请先在你的电脑或服务器上获取 Folia 的源码库。你可以直接在 GitHub 下载 ZIP 并解压，或者使用 git clone：
```bash
git clone https://github.com/chthollyphile/folia-major.git
cd folia-major/sync-server
```
**以后的所有操作都在 `folia-major/sync-server` 目录下进行。**

---

## 部署方案一：自托管部署 (Node.js / Docker)

如果你有自己的服务器（VPS、群晖、软路由等），我们推荐使用自托管方案。服务端提供了一个简单的 SQLite 数据库实现。

### 方式 A：使用 Docker Compose (推荐)

最简单干净的部署方式。我们已经准备好了 `docker-compose.yml`。

1. 配置环境变量：
   复制 `.env.example`（或自己创建 `.env`），填入你自定义的同步密码：
   ```env
   SYNC_TOKEN="MySuperSecretToken2026"
   # 注意：Docker 模式下内部端口固定为 3000，外部映射在 docker-compose 中修改
   ```

2. 启动服务：
   ```bash
   docker-compose up -d
   ```
   默认服务会运行在 `13000` 端口。你可以通过配置反向代理（如 Nginx 或 Caddy）将其暴露到公网。

### 方式 B：使用一键安装脚本 (Linux VPS)

如果你没有 Docker，我们在目录下提供了一个 `install.sh`。
```bash
chmod +x install.sh
./install.sh
```
脚本会自动检查并安装 Node.js、PM2，编译项目，并引导你设置密码。

### 方式 C：手动 Node.js 部署

1. 安装依赖并编译：
   ```bash
   npm install
   npm run build:node
   ```
2. 创建 `.env` 文件并填入：
   ```env
   SYNC_TOKEN="你的自定义密码"
   PORT=3000
   DB_PATH="./folia-sync.db"
   ```
3. 启动（推荐使用 pm2 守护进程）：
   ```bash
   npx pm2 start dist/node.js --name "folia-sync"
   ```

---

## 部署方案二：Cloudflare D1 部署 (适合白嫖党)

如果你没有服务器，可以使用 Cloudflare Workers + D1 数据库完全免费部署。

### 第 1 步：安装与登录

确保电脑上安装了 Node.js。在终端里输入：
```bash
npm install -g wrangler
wrangler login
```
这会在浏览器中打开授权页面，允许后即可。

### 第 2 步：创建与配置数据库

1. 创建本地专属配置文件（防止后续更新代码覆盖）：
   ```bash
   # Windows PowerShell
   copy wrangler.toml wrangler.local.toml
   
   # macOS / Linux
   cp wrangler.toml wrangler.local.toml
   ```

2. 在云端创建数据库：
   ```bash
   wrangler d1 create folia-sync --config wrangler.local.toml
   ```
   终端会输出类似下方的信息，请复制其中的 `database_id`：
   ```text
   [[d1_databases]]
   binding = "DB"
   database_name = "folia-sync"
   database_id = "xxxx-xxxx-xxxx-xxxx"
   ```

3. 打开 `wrangler.local.toml` 文件，将最下方的 `database_id` 替换为你刚刚复制的内容，并**务必将 `binding` 改为 `FOLIA_SYNC_DB`**：
   ```toml
   [[d1_databases]]
   binding = "FOLIA_SYNC_DB"
   database_name = "folia-sync"
   database_id = "你的_database_id_写在这里"
   ```

### 第 3 步：设置密钥与部署

1. 设置一个同步密码（Token）：
   ```bash
   wrangler secret put SYNC_TOKEN --config wrangler.local.toml
   ```
   终端会提示你输入密码，输入一段**你自己想好的复杂密码**并回车（输入时屏幕不显示字符是正常的）。

2. 正式部署到云端：
   ```bash
   npm run deploy:cf -- --config wrangler.local.toml
   ```
   *注意命令里的额外 `--`，它是为了将参数传给底层的 wrangler。*

稍等片刻，部署成功后终端会输出一个以 `workers.dev` 结尾的网址，这就是你的 **Sync Server URL**。

---

## 部署完之后

现在你的同步服务已经运行了。请打开 Folia：

1. 进入 `设置 -> 存储 -> 同步服务`
2. **Sync Server URL**：填写你服务器的网址或 Cloudflare 分配的域名（记得带上 `http://` 或 `https://`）。
3. **Bearer Token**：填写你在 `.env` 里或通过 `wrangler secret` 设置的那个密码。

保存之后，点击“立即同步”即可开始。Folia 客户端也会在启动及主题生成时自动尝试同步。

> **网页看板**：你可以直接在浏览器访问你的同步服务网址。如果是 Cloudflare 部署，访问 `https://你的域名/?token=你的SYNC_TOKEN` 即可查看同步看板状态。

## 一句话排错表

| 问题 | 解决方法 |
| --- | --- |
| 无法通过 `wrangler d1 create` 创建数据库 | 终端是否在 `folia-major/sync-server` 文件夹内 |
| 部署失败，提示 binding 错误 | 检查 `wrangler.local.toml` 里的 `binding` 是否严格大写为 `"FOLIA_SYNC_DB"` |
| Folia 提示同步失败 / 未授权 | 检查 Folia 设置里的 Token 是否和服务器环境变量 `.env` / `wrangler` 设置的完全一致 |
| 担心数据覆盖问题 | 服务端会自动对比数据的 `updated_at` 时间戳，只有最新数据才能覆盖旧数据，无需担心误覆盖。 |
