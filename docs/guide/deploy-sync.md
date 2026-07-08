# 部署同步服务 (Cloudflare D1)

这篇是给普通用户看的版本，会尽量把每一步都写清楚。

Folia 支持在多台设备之间同步数据，但为了保证你的数据隐私和控制权，Folia 不提供官方中心化服务器，而是提供了一个基于 Cloudflare D1 的模板，让你可以**免费**、**私有**地部署自己的同步服务。

它能够同步的数据包括：
- 外观设置
- AI 主题记录

它**不会**同步的内容：音频文件、封面、本地音乐文件、账号登录状态、上传的字体或图片。

## 先说结论

要让同步服务正常工作，你需要：

1. 一个 Cloudflare 账号（免费版即可）
2. 在电脑上运行几行命令完成部署
3. 在 Folia 设置中填入部署好的地址和密钥

如果你以前没有碰过命令行，不用担心，跟着下面的步骤一步一步复制粘贴即可。

## ⚠️ 数据同步风险提示

多设备相互同步数据在本质上存在一定风险。由于网络延迟、设备时钟不同步或并发写入冲突，极端情况下可能会意外造成设置或主题数据丢失、甚至被旧版本覆盖。**强烈建议在首次启用同步功能前，先通过 Folia 导出一份本地全量备份**，以防万一。

## 开始前你要准备什么

- 一个 [Cloudflare](https://dash.cloudflare.com/sign-up) 账号
- 你的电脑上安装了 Node.js（推荐 24 或更高版本）
- Folia 仓库源码（你可以直接在 GitHub 下载 ZIP 并解压，或者使用 git clone）

## 第一阶段：准备环境与登录

### 第 1 步：找到 Worker 所在的目录

解压或 clone 完 Folia 源码后，你需要进入存放同步服务的专用文件夹。

这个文件夹的路径是：
`folia-major/docs/sync/cloudflare-d1-worker`

请在你的电脑上找到这个文件夹，然后在这个文件夹里**打开终端（命令行 / PowerShell）**。
（Windows 用户可以在该文件夹空白处按住 Shift 键并点击右键，选择“在此处打开 PowerShell 窗口”或“在终端中打开”）

### 第 2 步：安装 Wrangler 工具

Wrangler 是 Cloudflare 官方的命令行工具。在终端里输入并回车：

```bash
npm install -g wrangler
```

等待安装完成。

### 第 3 步：登录 Cloudflare

继续在终端中输入：

```bash
wrangler login
```

这会自动在浏览器中打开 Cloudflare 的授权页面。请点击允许（Allow），授权成功后就可以关掉浏览器页面，回到终端。

## 第二阶段：创建与配置数据库

### 第 1 步：复制本地配置文件

我们需要创建一个只属于你的本地配置文件，以防以后更新代码时覆盖掉你的配置。

在终端中输入（如果是 macOS / Linux）：
```bash
cp wrangler.toml wrangler.local.toml
```
如果是 Windows (PowerShell)：
```bash
copy wrangler.toml wrangler.local.toml
```

这个 `wrangler.local.toml` 就是你接下来的“专属配置文件”。

### 第 2 步：在云端创建数据库

接下来让 Cloudflare 帮你创建一个名为 `folia-sync` 的数据库。在终端中输入：

```bash
wrangler d1 create folia-sync --config wrangler.local.toml
```

**⚠️ 重点注意：** 往后的每一步，都要带上 `--config wrangler.local.toml`，否则工具可能会跑错地方去读取外层的配置。

命令执行成功后，终端会打印出一块类似这样的信息：

```text
✅ Successfully created DB 'folia-sync'

[[d1_databases]]
binding = "DB"
database_name = "folia-sync"
database_id = "xxxx-xxxx-xxxx-xxxx"
```

请把 `database_id` 复制下来。

### 第 3 步：把 ID 填进你的配置

使用任何文本编辑器（比如记事本、VS Code）打开刚刚创建的 `wrangler.local.toml` 文件。

把文件最下方的 `database_id` 替换成你刚复制的那一串字符。**并确保 binding 是 `FOLIA_SYNC_DB`**（不能是直接照抄输出结果里的 `DB` 或其他名字）。

修改后，这部分看起来应该像这样：

```toml
[[d1_databases]]
binding = "FOLIA_SYNC_DB"
database_name = "folia-sync"
database_id = "你的_database_id_写在这里"
```

保存并关闭文件。

## 第三阶段：设置密钥与部署

### 第 1 步：设置一个同步密码（Token）

为了不让别人随便读取或写入你的同步数据，你需要设置一个属于自己的密码（Token）。

在终端中输入：

```bash
wrangler secret put SYNC_TOKEN --config wrangler.local.toml
```

回车后，终端会提示你输入内容（Enter the secret text you'd like assigned to the variable SYNC_TOKEN on the script named folia-sync:）。

在这里输入一段**你自己想好的复杂密码**（例如：`MySuperSecretToken2026`），然后回车。

*注：输入密码时终端里可能不会显示字符，这是正常的，输入完直接回车即可。*

### 第 2 步：正式部署

一切就绪！现在把你的服务部署到云端：

```bash
wrangler deploy --config wrangler.local.toml
```

稍等片刻，部署成功后，终端的末尾会给出一个以 `workers.dev` 结尾的网址，这就是你的 **Sync Server URL**。

## 部署完之后

现在你的同步服务已经在云端运行了。请打开 Folia：

1. 进入 `设置 -> 存储 -> 同步服务`
2. 填写 **Sync Server URL**：你刚刚部署完成后得到的网址
3. 填写 **Bearer Token**：你刚才自己设置的密码（Token）

保存之后，点击立即同步，就会开始同步数据了。Folia客户端会在启动的时候自动尝试同步数据，每次有新的主题生成的时候，也会自动上传到你的同步服务。

## 国内网络访问问题

Cloudflare Workers 默认提供的 `*.workers.dev` 域名在国内部分地区可能访问不佳，甚至完全无法连接。如果你遇到同步失败、网络超时等情况，可以尝试以下方案：
1. **绑定自定义域名**：在 Cloudflare 后台为该 Worker 绑定一个你自己的域名，并设置使用 Cloudflare 的CDN来访问（将 DNS 记录的“云朵”图标设为橙色）。
2. **使用代理**：在你的设备和系统上配置网络代理以顺利访问 Worker 域名。
3. **部署到其他地方**：如果有自己的国内服务器，也可以考虑自托管方案。

## 自托管（面向技术用户）

Folia 客户端不强制绑定 Cloudflare D1，它只依赖这套基于 HTTP 的同步 API。
如果你有自己的服务器，完全可以**自己实现并托管同步服务**。你只需要使用 Docker + SQLite / PostgreSQL、或是任何你熟悉的后端语言（Node.js, Go, Python 等），暴露出与这个 Worker 行为一致的接口（如 `/settings`, `/themes/manifest`, `/themes/put` 等）即可。只要接口兼容，在 Folia 客户端中填入你的自建 URL 和约定好的 Token，它同样能正常工作。

## 一句话排错表

| 问题 | 最先检查什么 |
| --- | --- |
| 无法通过 `wrangler d1 create` 创建数据库 | 终端是否在 `folia-major/docs/sync/cloudflare-d1-worker` 文件夹内 |
| 部署失败，提示 binding 错误 | 检查 `wrangler.local.toml` 里的 `binding` 是否为 `"FOLIA_SYNC_DB"` |
| Folia 提示同步失败 / 未授权 | 检查 Folia 设置里的 Token 是否和刚才通过 `wrangler secret put` 填的一致 |
| 担心数据覆盖问题 | Worker 会自动对比数据的 `updated_at` 时间戳，只有新数据才能覆盖旧数据，无需担心误覆盖。 |
