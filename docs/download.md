---
title: 下载 Folia
sidebar: false
aside: false
prev: false
next: false
pageClass: download-page
---

<script setup>
import { githubReleaseUrl, netdiskLinks } from './.vitepress/theme/downloadLinks'
</script>

# 下载 Folia

## 下载地址

<ul>
  <li><a :href="githubReleaseUrl" target="_blank" rel="noopener"><strong>GitHub Releases</strong></a>：Windows / macOS / Linux 全部安装包</li>
  <li v-for="link in netdiskLinks" :key="link.name">
    <a v-if="link.url" :href="link.url" target="_blank" rel="noopener"><strong>{{ link.name }}</strong></a>
    <strong v-else>{{ link.name }}</strong><template v-if="link.code">（提取码 <code>{{ link.code }}</code>）</template>
  </li>
</ul>

网盘仅提供 Windows（x64 `.exe`）与 macOS Apple Silicon（arm64 `.dmg`）的正式版安装包，其他平台请从 GitHub Releases 下载。

## macOS 安装说明

当前 macOS 版本没有 Apple 签名与公证，首次打开时可能提示“`Folia.app` 已损坏，无法打开”。这不是安装包损坏，按下面处理即可：

1. 打开 `dmg`，把 `Folia.app` 拖到“应用程序”（`Applications`），不要直接在 dmg 里运行。
2. 在终端执行以下命令移除下载隔离属性：

```bash
xattr -dr com.apple.quarantine /Applications/Folia.app
```

3. 重新打开 Folia。

也可以不用终端：在“应用程序”里按住 `Control` 点击 `Folia.app` 选择“打开”，或到“系统设置 → 隐私与安全性”底部点击“仍要打开”。更多说明见 [macOS App 已损坏](/guide/macos-app-damaged)。

## Arch Linux（AUR）

```bash
yay -S folia-major-bin
```

AUR 包页面：[folia-major-bin](https://aur.archlinux.org/packages/folia-major-bin)
