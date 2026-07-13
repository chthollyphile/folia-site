import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Folia",
  description: "Folia 播放器文档站点，包含用户指南、部署说明与接口参考。",
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
      { text: "用户指南", link: "/guide/" },
      { text: "开发者", link: "/developer/" },
      { text: "GitHub", link: "https://github.com/chthollyphile/folia-major" }
    ],
    sidebar: {
      "/guide/": [
        {
          text: "开始使用",
          items: [
            { text: "概览", link: "/guide/" },
            { text: "快速开始", link: "/guide/quick-start" },
            { text: "部署同步服务", link: "/guide/deploy-sync" },
            { text: "桌面版功能", link: "/guide/desktop" },
            { text: "设置说明", link: "/guide/settings" },
            { text: "功能地图与 GUI 位置", link: "/guide/feature-map" },
            { text: "LLM 直达导航", link: "/guide/llm-routing" }
          ]
        },
        {
          text: "功能说明",
          items: [
            { text: "播放、歌词与视觉模式", link: "/guide/playback-and-lyrics" },
            { text: "歌词动画参数说明", link: "/guide/lyrics-animation-tuning" },
            { text: "本地音乐", link: "/guide/local-music" },
            { text: "Navidrome", link: "/guide/navidrome" },
            { text: "Stage 与 Now Playing", link: "/guide/stage-and-now-playing" },
            { text: "AI 主题", link: "/guide/ai-theme" },
            { text: "常见问题", link: "/guide/faq" },
            { text: "macOS App 已损坏", link: "/guide/macos-app-damaged" }
          ]
        }
      ],
      "/developer/": [
        {
          text: "开发与部署",
          items: [
            { text: "开发者概览", link: "/developer/" },
            { text: "部署指南", link: "/developer/deploy" },
            { text: "技术说明", link: "/developer/technical" },
            { text: "配置说明", link: "/developer/configuration" },
            { text: "项目结构速查", link: "/developer/project-map" },
            { text: "已知非 Bug 问题", link: "/developer/known-non-bug-issues" },
            { text: "旧视图弃用计划", link: "/developer/legacy-view-deprecation" }
          ]
        },
        {
          text: "接口说明",
          items: [
            { text: "Stage API", link: "/developer/stage-api" },
            { text: "AI 主题接口", link: "/developer/ai-theme-api" }
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
