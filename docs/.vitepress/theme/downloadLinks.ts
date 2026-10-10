// 首页下载按钮使用的链接，集中在这里维护。
// url 留空的网盘会在菜单里显示为“链接待补充”且不可点击。

export const githubReleaseUrl = "https://github.com/chthollyphile/folia-major/releases/latest";

export interface NetdiskLink {
  name: string;
  url: string;
  // 提取码，没有就留空
  code?: string;
}

export const netdiskLinks: NetdiskLink[] = [
  {
    name: "百度网盘",
    url: "", // TODO: 待补充百度网盘链接
    code: ""
  },
  {
    name: "夸克网盘",
    url: "https://pan.quark.cn/s/6e4c6fa3bc6f",
    code: ""
  }
];
