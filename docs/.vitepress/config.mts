import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Folia",
  description: "folia-major 的主页与文档站点",
  lang: "zh-CN",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", href: "/icon.svg" }],
    ["meta", { name: "theme-color", content: "#111827" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "Folia" }],
    ["meta", { property: "og:description", content: "沉浸式歌词播放器，支持网易云、Navidrome 与本地音乐。" }],
    ["meta", { property: "og:image", content: "/hero.png" }]
  ],
  themeConfig: {
    logo: "/icon.svg",
    nav: [
      { text: "首页", link: "/" },
      { text: "文档", link: "/guide/" },
      { text: "Vercel 部署", link: "/guide/deploy-vercel" },
      { text: "GitHub", link: "https://github.com/chthollyphile/folia-major" }
    ],
    sidebar: {
      "/guide/": [
        {
          text: "开始使用",
          items: [
            { text: "概览", link: "/guide/" },
            { text: "快速开始", link: "/guide/quick-start" },
            { text: "部署到 Vercel", link: "/guide/deploy-vercel" }
          ]
        },
        {
          text: "功能说明",
          items: [
            { text: "桌面端", link: "/guide/desktop" },
            { text: "本地音乐", link: "/guide/local-music" },
            { text: "AI 主题", link: "/guide/ai-theme" }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/chthollyphile/folia-major" }
    ],
    search: {
      provider: "local"
    },
    footer: {
      message: "Released under AGPL-3.0",
      copyright: "Copyright © Folia contributors"
    },
    outline: {
      label: "本页内容"
    },
    docFooter: {
      prev: "上一页",
      next: "下一页"
    },
    darkModeSwitchLabel: "外观",
    sidebarMenuLabel: "文档",
    returnToTopLabel: "回到顶部"
  }
});
