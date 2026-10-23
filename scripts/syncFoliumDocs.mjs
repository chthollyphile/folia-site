// 把主仓库 folia-major 的 Folium 文档同步成站点页面：改写相对链接，把 GitHub 的锚点换成 VitePress 的。
// 用法：node scripts/syncFoliumDocs.mjs <folia-major 的本地路径>
import fs from "node:fs";
import path from "node:path";

const REPO_BLOB = "https://github.com/chthollyphile/folia-major/blob/main/";
const REPO_TREE = "https://github.com/chthollyphile/folia-major/tree/main/";

// 主仓库里的文档 → 站点路由
const PAGES = {
  "mods/README.md": "/developer/folium-spec",
  "docs/folium/api.md": "/developer/folium-api",
  "docs/folium/contributing.md": "/developer/folium-contributing",
  "docs/folium/quickstart.md": "/developer/folium-quickstart",
  "docs/folium/home-tabs.md": "/developer/folium-home-tabs"
};

const SYNC_NOTE = "<!-- 本页由 folia-site 的 `node scripts/syncFoliumDocs.mjs` 从主仓库 folia-major 的 {src} 同步，请在主仓库修改后重新同步。 -->";

// 与 VitePress 自带的 slugify 相同（vitepress/dist/node 里的 slugify）
const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g;
const rCombining = /[̀-ͯ]/g;
const vitepressSlug = (str) => str.normalize("NFKD").replace(rCombining, "").replace(rControl, "").replace(rSpecial, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "").replace(/^(\d)/, "_$1").toLowerCase();

// GitHub 渲染 Markdown 时的标题锚点（github-slugger 的做法）
const githubSlug = (str) => str.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "").replace(/ /g, "-");

// 标题渲染后的纯文本：去掉行内代码的反引号、链接只留文字、去掉强调符号
const headingText = (raw) => raw
  .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
  .replace(/`([^`]*)`/g, "$1")
  .replace(/\*\*([^*]*)\*\*/g, "$1")
  .trim();

// 逐行遍历，跳过围栏代码块
function eachProseLine(lines, fn) {
  let fence = null;
  lines.forEach((line, i) => {
    const m = line.match(/^\s*(```+|~~~+)/);
    if (m) {
      if (!fence) fence = m[1];
      else if (m[1].startsWith(fence[0]) && m[1].length >= fence.length) fence = null;
      return;
    }
    if (!fence) fn(line, i);
  });
}

// VitePress 把正文里的 `<名字` 当成 Vue 模板标签。主仓库的这几份文档不写 HTML，行内代码之外的这类尖括号一律转义
const escapeStrayTags = (line) => line.split(/(`+[^`]*`+)/).map((part, i) => (i % 2 === 1 ? part : part.replace(/<(?=[A-Za-z/])/g, "&lt;"))).join("");

// 一份文档的 GitHub 锚点 → VitePress 锚点
function anchorMap(text) {
  const map = new Map();
  const ghSeen = new Map();
  const vpSeen = new Map();
  const unique = (seen, slug, sep) => {
    const n = seen.get(slug) ?? 0;
    seen.set(slug, n + 1);
    return n === 0 ? slug : `${slug}${sep}${n}`;
  };
  eachProseLine(text.split("\n"), (line) => {
    const m = line.match(/^#{1,6}\s+(.*?)\s*#*\s*$/);
    if (!m) return;
    const plain = headingText(m[1]);
    const gh = unique(ghSeen, githubSlug(plain), "-");
    const vp = unique(vpSeen, vitepressSlug(plain), "-");
    map.set(gh, vp);
  });
  return map;
}

function main() {
  const root = process.argv[2];
  if (!root) {
    console.error("用法：node scripts/syncFoliumDocs.mjs <folia-major 的本地路径>");
    process.exit(1);
  }
  const sources = Object.fromEntries(Object.keys(PAGES).map((src) => [src, fs.readFileSync(path.join(root, src), "utf8")]));
  const anchors = Object.fromEntries(Object.entries(sources).map(([src, text]) => [src, anchorMap(text)]));
  const missing = [];

  const mapAnchor = (src, hash, from) => {
    if (!hash) return "";
    const decoded = decodeURIComponent(hash);
    const vp = anchors[src].get(decoded);
    if (!vp) {
      missing.push(`${from} → ${src}#${decoded}`);
      return `#${decoded}`;
    }
    return `#${vp}`;
  };

  for (const [src, route] of Object.entries(PAGES)) {
    const dir = path.posix.dirname(src);
    const lines = sources[src].split("\n");
    eachProseLine(lines, (line, i) => {
      lines[i] = line.replace(/\]\(([^)\s]+)\)/g, (whole, target) => {
        if (/^[a-z]+:/i.test(target)) return whole;
        const [file, hash] = target.split("#");
        if (!file) return `](${mapAnchor(src, hash, src)})`;
        const resolved = path.posix.normalize(path.posix.join(dir, decodeURIComponent(file))).replace(/\/$/, "");
        if (PAGES[resolved]) return `](${PAGES[resolved]}${mapAnchor(resolved, hash, src)})`;
        const isDir = fs.existsSync(path.join(root, resolved)) && fs.statSync(path.join(root, resolved)).isDirectory();
        return `](${isDir ? REPO_TREE : REPO_BLOB}${resolved}${hash ? `#${hash}` : ""})`;
      });
      lines[i] = escapeStrayTags(lines[i]);
    });
    let out = lines.join("\n");
    const note = SYNC_NOTE.replace("{src}", `\`${src}\``);
    out = out.startsWith("<!--") ? out.replace(/^<!--[\s\S]*?-->/, note) : `${note}\n\n${out}`;
    const dest = path.join("docs", `${route}.md`);
    fs.writeFileSync(dest, out.endsWith("\n") ? out : `${out}\n`);
    console.log(`[syncFoliumDocs] ${src} → ${dest}`);
  }

  if (missing.length) {
    console.warn(`[syncFoliumDocs] ${missing.length} 个锚点在目标文档里找不到：`);
    for (const m of missing) console.warn(`  ${m}`);
  }
}

main();
