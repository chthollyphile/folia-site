# 部署 Web 版

这篇是给普通用户看的版本，会尽量把每一步都写清楚。

如果你不想折腾部署，最省事的方式仍然是直接使用桌面版。Web 版更适合这些情况：

- 想在浏览器里使用
- 想在手机和平板上使用
- 想对外分享一个可直接打开的页面

## 先说结论

要让 Web 版正常工作，你至少要准备两样东西：

1. 一个部署 Folia 前端的网站
2. 一个可用的网易云 API 地址

如果你还想使用 AI 主题，还要再准备：

3. 一组 AI 接口配置

目前常用的部署路线有两条：

- `Vercel`：更适合普通用户，界面友好，步骤更省心
- `Cloudflare`：也支持，适合本来就在用 Cloudflare 的用户

如果你只是想最快部署成功，建议优先选 Vercel。

## 开始前你要准备什么

请先确认自己已经有这些账号或信息：

- 一个 GitHub 账号
- 一个可访问的网易云 API 地址
- 如果要用 AI 主题：
  - Gemini Key，或者
  - OpenAI / DeepSeek / 其他兼容接口的 Key、URL、模型名

如果你走不同平台，还分别需要：

- Vercel 路线：一个 Vercel 账号
- Cloudflare 路线：一个 Cloudflare 账号，以及本机可运行 Node.js

## 你可能最容易卡住的地方

Folia Web 版不会自己提供网易云 API。你必须先准备一个 `VITE_NETEASE_API_BASE`。

也就是说，部署成功后，如果这个地址没填对，网页通常还是打不开完整功能，或者搜歌会失败。

## 先部署网易云 API

如果你现在手里还没有 `VITE_NETEASE_API_BASE`，可以先把这个 API 部署好，再回来部署 Folia。

Folia 现在依赖的是 NeteaseCloudMusicApiEnhanced 项目：

- [NeteaseCloudMusicApiEnhanced 官方仓库](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced)

如果你想直接看官方自己的说明文档，可以先打开这里：

- [NeteaseCloudMusicApiEnhanced 官方文档入口](https://docs-neteasecloudmusicapi.focalors.ltd/#/?id=neteasecloudmusicapienhanced)

对普通用户来说，最常见的两种做法是：

- 把 API 单独部署到 Vercel
- 在你自己的电脑或服务器上跑一个 Node 服务

### 方法 A：把 API 部署到 Vercel

这是最省事的方案之一。

#### 第 1 步：打开 API 项目

先打开官方仓库：

[NeteaseCloudMusicApiEnhanced/api-enhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced)

#### 第 2 步：Fork 这个仓库

1. 登录 GitHub
2. 点击页面右上角的 `Fork`
3. 把这个仓库 fork 到你自己的 GitHub 账号下

#### 第 3 步：在 Vercel 里导入这个 API 仓库

1. 打开 [Vercel](https://vercel.com/)
2. 点击 `New Project`
3. 选择你刚刚 fork 的 `api-enhanced` 仓库
4. 点击导入

根据官方文档，这个 API 项目已经带有 Vercel 配置，可以直接部署。通常 `Framework Preset` 选 `Other` 即可。

注意：`api-enhanced`的环境变量里需要写明：

```bash
ENABLE_GENERAL_UNBLOCK=false
```

- 如果你把 API 部署在 Vercel，就到这个 API 项目的 `Environment Variables` 里添加

#### 第 4 步：等待部署完成

部署成功后，你会得到一个类似下面的地址：

```text
https://your-api-project.vercel.app
```

这个地址就是你后面要填进 Folia 的 `VITE_NETEASE_API_BASE`。

#### 第 5 步：先自己测试一下 API

你可以直接在浏览器里打开这个地址测试一下：

```text
https://your-api-project.vercel.app/
```

如果能看到一个完整的网页，说明基本已经成功。

#### Vercel 部署 API 的注意事项

官方文档特别提到：

- Vercel 版接口在某些请求里可能需要额外传 `realIP`
- 如果访问异常，绑定一个国内可正常访问的自定义域名可能更稳定

如果你后面在 Folia 里遇到某些歌无法正常拉取资源，这一点值得优先排查。
此外，由于 Vercel 的服务器在国外，访问网易云的接口可能会比较慢，甚至偶尔会有访问失败的情况。如果你发现这个问题比较严重，可以考虑把 API 部署到国内的服务器上，或者使用一些加速服务。

接下来请跳转到 [API 部署完之后，回到 Folia](/guide/deploy-vercel#api部署完之后)，继续完成 Folia 的部署。

### 方法 B：在你自己的电脑或服务器上运行 API

如果你有自己的服务器，或者只想先在本机测试，这是另一种很常见的做法。

#### 第 1 步：安装 Node.js

先确保你的电脑或服务器已经安装 Node.js。

#### 第 2 步：下载 API 项目代码

可以直接克隆官方仓库：

```bash
git clone https://github.com/neteasecloudmusicapienhanced/api-enhanced.git
cd api-enhanced
```

#### 第 3 步：安装依赖

官方文档给出的安装方式是：

```bash
pnpm i
```

如果你平时主要用 `npm`，也可以先尝试 `npm install`，但最贴近官方说明的还是 `pnpm`。

#### 第 3.5 步：先准备环境变量

如果你是在自己电脑或服务器上运行这个 API，也需要设置：

```bash
ENABLE_GENERAL_UNBLOCK=false
```

要注意：

- 这是 `网易云 API 服务` 的环境变量
- 不是 `Folia Web 前端` 的环境变量

#### 第 4 步：启动 API

最基本的启动方式是：

```bash
node app.js
```

根据官方文档：

- 默认端口是 `3000`
- 默认 host 是 `localhost`

也就是说，本机运行成功后，默认地址通常就是：

```text
http://localhost:3000
```

#### 第 5 步：如果你想改端口

Mac / Linux 可以这样启动：

```bash
PORT=4000 node app.js
```

Windows 可以这样启动：

```bash
set PORT=4000 && node app.js
```

#### 第 6 步：如果你想改 host

Mac / Linux：

```bash
HOST=127.0.0.1 node app.js
```

Windows：

```bash
set HOST=127.0.0.1 && node app.js
```

如果你想在启动时一并带上这项配置，可以这样理解：

Mac / Linux：

```bash
ENABLE_GENERAL_UNBLOCK=false node app.js
```

Windows：

```bash
set ENABLE_GENERAL_UNBLOCK=false && node app.js
```

#### 第 7 步：测试 API 是否成功

启动后，先在浏览器打开：

```text
http://localhost:3000/
```

如果能看到一个完整的网页，说明这个 API 基本已经跑起来了。

#### 什么时候适合用这种方式

这条路线适合：

- 你只是本机测试
- 你自己有云服务器
- 你愿意长期维护一个单独的 Node 服务

## API 部署完之后

当你已经拿到 API 地址后：

- 如果你本机运行 API，就把 `http://localhost:3000` 之类的地址填进去
- 如果你把 API 部署到了 Vercel，就把 `https://your-api-project.vercel.app` 填进去

这个值就是：

```bash
VITE_NETEASE_API_BASE=你的网易云API地址
```

## 方案一：部署到 Vercel

这是最推荐给普通用户的做法。

### 第 1 步：登录 GitHub 和 Vercel

1. 打开 [GitHub](https://github.com/) 并登录。
2. 打开 [Vercel](https://vercel.com/) 并登录。
3. 如果 Vercel 提示你绑定 GitHub，按页面提示授权即可。

完成后，你应该能进入自己的 Vercel 控制台。

### 第 2 步：打开一键部署入口

直接打开这个链接：

[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https://github.com/chthollyphile/folia-major)

打开后，Vercel 一般会显示一个新建项目页面。

你通常会看到这些内容：

- 仓库来源：`chthollyphile/folia-major`
- 项目名称输入框
- 部署按钮

### 第 3 步：创建项目

1. 在 `Project Name` 里填一个你喜欢的名字。
   - 例如：`folia-player`
   - 这个名字会影响默认访问地址
2. 如果页面让你选择 Team，就选你自己的个人账户。
3. 先不要急着点完成，继续往下看环境变量部分。

### 第 4 步：填写环境变量

这是最关键的一步。

在 Vercel 创建项目页面里，找到 `Environment Variables` 区域，把下面需要的变量一项一项填进去。

#### 必填变量

| 变量名 | 作用 | 是否必须 |
| --- | --- | --- |
| `VITE_NETEASE_API_BASE` | 网易云 API 地址 | 是 |
| `VITE_AI_PROVIDER` | AI 提供商，`google` 或 `openai` | 是 |

#### 只有使用 Gemini 时才需要

| 变量名 | 作用 |
| --- | --- |
| `GEMINI_API_KEY` | Gemini API Key |

#### 只有使用 OpenAI 兼容接口时才需要

| 变量名 | 作用 |
| --- | --- |
| `OPENAI_API_KEY` | 接口 Key |
| `OPENAI_API_URL` | 接口地址 |
| `OPENAI_API_MODEL` | 模型名 |

### 第 5 步：照着示例填写

下面给你三个最常见的填写模板。

#### 情况 A：你用 Gemini

```bash
VITE_NETEASE_API_BASE=https://你的网易云API地址
VITE_AI_PROVIDER=google
GEMINI_API_KEY=你的_Gemini_Key
```

#### 情况 B：你用 OpenAI 官方接口

```bash
VITE_NETEASE_API_BASE=https://你的网易云API地址
VITE_AI_PROVIDER=openai
OPENAI_API_KEY=你的_OpenAI_Key
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_API_MODEL=gpt-4o
```

#### 情况 C：你用 DeepSeek 或其他兼容接口

```bash
VITE_NETEASE_API_BASE=https://你的网易云API地址
VITE_AI_PROVIDER=openai
OPENAI_API_KEY=你的_API_Key
OPENAI_API_URL=https://api.deepseek.com
OPENAI_API_MODEL=deepseek-v4-flash
```

### 第 6 步：重点检查这几个字段有没有填错

部署前，建议你再核对一次：

- `VITE_NETEASE_API_BASE` 是完整可访问地址
- `VITE_AI_PROVIDER` 只填 `google` 或 `openai`
- 如果填的是 `google`，就一定要有 `GEMINI_API_KEY`
- 如果填的是 `openai`，就一定要有：
  - `OPENAI_API_KEY`
  - `OPENAI_API_URL`
  - `OPENAI_API_MODEL`

### 第 7 步：点击部署

确认无误后：

1. 点击 `Deploy`
2. 等待 Vercel 构建完成

正常情况下，Vercel 会经历这些阶段：

- 拉取仓库
- 安装依赖
- 构建项目
- 发布到线上

如果一切顺利，最后会出现：

- `Deployment completed`
- 一个可以点击打开的网址

### 第 8 步：第一次打开站点

打开部署好的网址后，建议马上做这几件事：

1. 看首页是否能正常打开
2. 随便搜索一首歌，确认网易云 API 可用
3. 打开一首歌，确认播放页能进入
4. 试一下 AI 主题，确认 AI 环境变量是否正确

### 如果搜索失败，先看这里

最常见原因就是：

- `VITE_NETEASE_API_BASE` 填错了
- 你的 API 地址外部无法访问
- API 本身挂了

这时候你应该：

1. 回到 Vercel 项目后台
2. 打开 `Settings`
3. 打开 `Environment Variables`
4. 检查 `VITE_NETEASE_API_BASE`
5. 修改后重新部署

### 如果 AI 主题失败，先看这里

常见原因：

- `VITE_AI_PROVIDER` 填错
- API Key 填错
- `OPENAI_API_URL` 不是兼容的地址
- `OPENAI_API_MODEL` 填了不存在的模型名

你可以按下面思路排查：

#### 你用 Gemini

确认：

- `VITE_AI_PROVIDER=google`
- `GEMINI_API_KEY` 已填写

#### 你用 OpenAI 兼容接口

确认：

- `VITE_AI_PROVIDER=openai`
- `OPENAI_API_KEY` 已填写
- `OPENAI_API_URL` 可访问
- `OPENAI_API_MODEL` 正确

### 第 9 步：修改环境变量后怎么重新生效

Vercel 改了环境变量之后，通常需要重新部署一次。

操作方法：

1. 进入你的 Vercel 项目
2. 打开 `Deployments`
3. 找到最新一次部署
4. 点击 `Redeploy`

这样新的环境变量才会真正进入线上版本。

### 第 10 步：换成你自己的域名

如果你不想使用 `*.vercel.app` 地址，可以绑定自己的域名。

操作通常是：

1. 进入 Vercel 项目
2. 打开 `Settings`
3. 打开 `Domains`
4. 添加你的域名
5. 按 Vercel 提示去你的域名服务商那里配置解析

## 方案二：部署到 Cloudflare

如果你本来就在使用 Cloudflare，也可以走这条路线。

这条路线更适合：

- 你已经有 Cloudflare 账号
- 你熟悉 Cloudflare Workers / Pages
- 你愿意在自己电脑上执行几条命令

### 第 1 步：准备账号和电脑环境

请先准备：

- 一个 GitHub 账号
- 一个 Cloudflare 账号
- 电脑上安装好 Node.js

如果你还没有安装 Node.js，建议先安装 `Node.js 24` 或更高版本。

### 第 2 步：下载项目代码

你可以用两种方式选一种：

1. 直接下载 GitHub 仓库压缩包并解压
2. 用 Git 克隆仓库

如果你会用 Git，命令通常是：

```bash
git clone https://github.com/chthollyphile/folia-major.git
cd folia-major
```

### 第 3 步：安装依赖

在项目目录里执行：

```bash
npm install
```

### 第 4 步：登录 Cloudflare

在项目目录执行：

```bash
npx wrangler login
```

浏览器会自动打开 Cloudflare 授权页面。按提示授权即可。

### 第 5 步：准备环境变量

Cloudflare 部署同样需要和 Vercel 一样的关键变量：

- `VITE_NETEASE_API_BASE`
- `VITE_AI_PROVIDER`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `OPENAI_API_URL`
- `OPENAI_API_MODEL`

另外，如果你是把 `网易云 API` 本身部署到 Cloudflare 或别的平台，也同样建议在那个 API 项目里配置：

```bash
ENABLE_GENERAL_UNBLOCK=false
```

你可以先在本地整理好自己要用的值，例如：

```bash
VITE_NETEASE_API_BASE=https://你的网易云API地址
VITE_AI_PROVIDER=google
GEMINI_API_KEY=你的_Gemini_Key
```

或者：

```bash
VITE_NETEASE_API_BASE=https://你的网易云API地址
VITE_AI_PROVIDER=openai
OPENAI_API_KEY=你的_API_Key
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_API_MODEL=gpt-4o
```

然后把这些变量配置到你的 Cloudflare 项目环境里。

如果你是通过 Cloudflare 控制台管理项目，就在项目设置里的环境变量区域逐项填写。

### 第 6 步：构建项目

在本地执行：

```bash
npm run build
```

### 第 7 步：部署到 Cloudflare

项目里已经带有 Cloudflare 相关配置，可以直接尝试：

```bash
npx wrangler deploy
```

正常情况下，Cloudflare 会读取：

- `dist/` 里的前端构建结果
- `worker/index.ts` 作为 Worker 入口

部署成功后，终端会输出一个可访问的网址。

### 第 8 步：打开部署后的网站检查

建议和 Vercel 一样检查这几件事：

1. 首页能否打开
2. 搜歌是否正常
3. 播放页能否进入
4. AI 主题是否可用

### Cloudflare 路线最容易卡住的地方

常见问题通常是：

- 没有先登录 `wrangler`
- 环境变量没配全
- `VITE_NETEASE_API_BASE` 填错
- AI 相关变量没有同步到 Cloudflare

如果网站能打开但搜不到歌，优先检查还是 `VITE_NETEASE_API_BASE`。

## 什么时候适合用 Web 版

Web 版更适合：

- 你主要在浏览器里听歌
- 你希望多设备访问同一个地址
- 你想对外分享一个可直接打开的页面

## 什么时候不适合用 Web 版

下面这些场景更推荐桌面版：

- 想直接开箱即用
- 想使用遥控窗口
- 想录制视频
- 想使用 Stage API 的完整桌面集成
- 不想自己准备网易云 API 和 AI 配置

## 一句话排错表

| 问题 | 最先检查什么 |
| --- | --- |
| 网站能开，但搜不到歌 | `VITE_NETEASE_API_BASE` |
| AI 主题报错 | AI 提供商、Key、URL、模型名 |
| 改了环境变量没生效 | 是否重新部署 |
| Cloudflare 部署命令失败 | 是否已执行 `npx wrangler login` |
| 手机能开，播放器功能不正常 | API 地址是否真的能公网访问 |

## 相关文档

- 开发者版部署说明：[/developer/deploy](/developer/deploy)
- 环境变量说明：[/developer/configuration](/developer/configuration)
- 快速开始：[/guide/quick-start](/guide/quick-start)
