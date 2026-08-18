# 歌词动画视觉效果器

Folia 的核心舞台效果来自歌词动画视觉效果器（Visualizer）。它负责把已经解析好的歌词时间轴、主题和音频能量，转换成播放页里看到的动态背景、逐字高亮、分栏排版、聊天气泡或文章式镜头。

当前主项目里已经接入 11 个模式，均通过 `src/components/visualizer/<mode>/entry.tsx` 注册：

| mode | 中文名 | 英文名 | 主要 renderer |
| --- | --- | --- | --- |
| `classic` | 流光 | Luminous | `classic/Visualizer.tsx` |
| `cadenza` | 心象 | Mindscape | `cadenza/VisualizerCadenza.tsx` |
| `partita` | 云阶 | Partita | `partita/VisualizerPartita.tsx` |
| `fume` | 浮名 | Fume | `fume/VisualizerFume.tsx` |
| `monet` | 莫奈 | Monet | `monet/VisualizerMonet.tsx` |
| `cappella` | 群唱 | Cappella | `cappella/VisualizerCappella.tsx` |
| `tilt` | 倾诉 | Tilt | `tilt/VisualizerTilt.tsx` |
| `claddagh` | 回环 | Claddagh | `claddagh/VisualizerCladdagh.tsx` |
| `diorama` | 镜台 | Diorama | `diorama/VisualizerDiorama.tsx` |
| `pendolo` | 时计 | Pendolo | `pendolo/VisualizerPendolo.tsx` |
| `sonnet` | 商籁 | Sonnet | `sonnet/VisualizerSonnet.tsx` |

`registry.tsx` 的默认模式是 `classic`。模式枚举与共享 tuning map 见 `src/types.ts`、`definition.ts` 和 `tuningRegistry.ts`。

各模式的渲染技术并不统一：多数模式基于 DOM + Framer Motion，`diorama` 走 React Three Fiber，`sonnet` 走 Pixi runtime，`pendolo` 有独立的时钟机械 canvas，`cadenza` 与 `fume` 依赖 `@chenglou/pretext` 做文字测量与布局。

对开发者来说，Visualizer 这一层的重点不是“怎么解析歌词”，而是“拿到统一歌词对象后，如何稳定地做排版、预热和过场动画”。

# 歌词数据结构

Visualizer 不直接处理原始 `.lrc`、`.vtt`、`yrc` 或 `qrc` 文本。它接收的是歌词流水线已经整理好的统一对象。

::: info 输入边界
如果你正在写新的 visualizer，优先假设输入已经是可直接渲染的 `LyricData`，不要把歌词格式识别、翻译对齐、纯音乐判断之类逻辑重新塞回 renderer。
行内字符动画同样不应在 renderer 里自行推断时间。请使用歌词层提供的 `graphemeTiming` 工具；它会把解析器的词级或 TTML 音节级 timing 映射到可渲染的 grapheme（用户感知的字符）时间轴，并处理空格、标点、组合字符和重复文本。
:::

主项目里的核心类型大致如下：

```ts
interface Word {
  text: string;
  startTime: number;
  endTime: number;
  syllables?: LyricSyllable[];
}

interface LyricSyllable {
  text: string;
  startTime: number;
  endTime: number;
}

interface Line {
  words: Word[];
  startTime: number;
  endTime: number;
  fullText: string;
  translation?: string;
  renderHints?: LineRenderHints;
  isChorus?: boolean;
  chorusEffect?: 'bars' | 'circles' | 'beams';
}

interface LyricData {
  lines: Line[];
  title?: string;
  artist?: string;
}
```

可以把它理解成三层：

- `Word`：解析器给出的词级时间单位；TTML 时可附带更细的 `syllables`
- `Line`：渲染时最常用的单位，一般以“当前句 / 下一句”为核心
- `LyricData`：整首歌的歌词对象

其中 `renderHints` 很关键。它不是歌词文本本身的一部分，而是歌词流水线为了 visualizer 预先补充的时序提示，例如：

- 这句歌词是正常长度、短句还是极短句
- 逐字 reveal 应该用正常、快速还是瞬时模式
- 这句歌词最晚可以在屏幕上停留到什么时候

如果只看 `startTime` 和 `endTime`，很多模式会在短句、尾迹、退场动画上表现不稳定，所以现在 visualizer 普遍依赖 `renderHints`。

::: warning 关于 `renderHints`
`renderHints` 不是可有可无的附加信息。对需要做切句、尾迹、退场动画的模式来说，它基本属于运行时契约的一部分。
:::

## 字符时间轴：由歌词流水线提供

Visualizer 可以按字符做排版或动画，但不能再在 renderer 中按 `word.text` 的长度二次切分并猜测时间。统一入口位于 `src/utils/lyrics/graphemeTiming.ts`：

- `buildWordGraphemeTimings(word, wordIndex)`：用于已经按 `Word` 布局的模式。
- `buildLineGraphemeTimeline(line)`：用于要按整句文本排版的模式；它会把 `Line.words` 对齐回 `fullText`，补齐空格和标点。

时间来源按优先级工作：TTML 转换层会把原始音节 / 音素时间保留为 `Word.syllables`，工具会将每个音节内部的 grapheme 均分到该音节时间段；没有音节时间时，才会将该 `Word` 的 grapheme 均分到 `word.startTime` 到 `word.endTime`。如果整行没有 `words`，才会均分整行时间。

因此，Visualizer 的职责是基于已给出的 grapheme timing 设计 reveal、pass、trail、位置和颜色曲线，不是重新决定字符的时间边界。若实现仅需词级效果，直接消费 `Word` timing 即可。

::: warning 不要重新切分时间
可以为了布局用 `Intl.Segmenter` 或 `Array.from` 取得显示字符，但不要据此重新计算字符开始或结束时间，也不要把英文按字符串长度再次均分。应保留 `graphemeTiming` 返回的 `startTime` / `endTime`。
:::

## 关键词着色

AI 主题可以通过 `theme.wordColors` 为关键词或短语提供颜色。Visualizer 不应自行用字符串包含关系匹配关键词，而应复用 `src/components/visualizer/wordColoring.ts`，以保持中英文、重复短语、重叠范围和 fallback 的行为一致。

- 按 `Word` 渲染时，调用 `resolveWordColor(word.text, theme.wordColors, theme.accentColor)`。
- 按字符、grapheme 或自定义 token 渲染时，先使用 `prepareWordColorMatchers` 和 `buildWordColorRangesFromMatchers` 生成文本范围，再用 `resolveTokenColorMap` 将范围映射到实际 token。

关键词着色只改变颜色，不应覆盖逐字 timing、当前行状态或副歌效果；找不到匹配项时必须回退到模式原有的主题色。

## 副歌行是额外的视觉语义

歌词流水线会在进入 Visualizer 前补充 `Line.isChorus`，并可能附带 `chorusEffect`（`bars`、`circles` 或 `beams`）。标记可来自 TTML 的 `songPart="chorus"`、Provider 给出的副歌时间区间，或重复文本检测。

若模式支持副歌行，应为激活中的副歌准备独立于普通行的强化表现，例如更强的 glow、不同的排版、额外粒子、色彩混合或更明显的音频响应。`chorusEffect` 可以作为模式自己的变体提示，但副歌效果不得改变行索引和字符时间轴；缺少 `isChorus` 或 `chorusEffect` 时必须自然回退为普通行，不能影响正常歌词渲染。

下面是一段真实的统一歌词对象样例。这个结果是直接用主项目现有歌词流水线解析 `songId: 2018447139` 后得到的，流程包括：

- 读取网易云歌词 payload
- 提取主歌词和翻译歌词
- 识别歌词格式
- 走 `parserCore`
- 应用 chorus 标记
- 补齐 `renderHints`

::: details 这段样例是怎么拿到的
文档里的这段 JSON 不是手写示意图，而是直接调用主项目现有代码，对 `songId: 2018447139` 执行完整歌词流水线后截取得到的结果。
:::

这首歌当前走的是 `lrc + translation` 分支。下面展示的是解析完成后、进入 visualizer 前的真实 `LyricData` 形状节选：

```json
{
  "lines": [
    {
      "startTime": 0.5,
      "endTime": 27.74,
      "fullText": "......",
      "words": [
        { "text": ".", "startTime": 0.5, "endTime": 5.04 },
        { "text": ".", "startTime": 5.04, "endTime": 9.58 },
        { "text": ".", "startTime": 9.58, "endTime": 14.120000000000001 },
        { "text": ".", "startTime": 14.120000000000001, "endTime": 18.66 },
        { "text": ".", "startTime": 18.66, "endTime": 23.2 },
        { "text": ".", "startTime": 23.2, "endTime": 27.740000000000002 }
      ],
      "renderHints": {
        "rawDuration": 27.24,
        "timingClass": "normal",
        "renderEndTime": 28.12,
        "lineTransitionMode": "normal",
        "wordRevealMode": "normal"
      }
    },
    {
      "startTime": 28.24,
      "endTime": 35.08,
      "fullText": "グルグル 機械仕掛けのun deux trois",
      "translation": "一二三，机械装置开始转动",
      "words": [
        { "text": "グ", "startTime": 28.24, "endTime": 28.641042345276873 },
        { "text": "ル", "startTime": 28.641042345276873, "endTime": 29.042084690553747 },
        { "text": "グ", "startTime": 29.042084690553747, "endTime": 29.44312703583062 },
        { "text": "ル", "startTime": 29.44312703583062, "endTime": 29.844169381107495 },
        { "text": "機", "startTime": 29.844169381107495, "endTime": 30.24521172638437 },
        { "text": "械", "startTime": 30.24521172638437, "endTime": 30.646254071661243 },
        { "text": "仕", "startTime": 30.646254071661243, "endTime": 31.047296416938117 },
        { "text": "掛", "startTime": 31.047296416938117, "endTime": 31.44833876221499 },
        { "text": "け", "startTime": 31.44833876221499, "endTime": 31.849381107491865 },
        { "text": "の", "startTime": 31.849381107491865, "endTime": 32.250423452768736 },
        { "text": "u", "startTime": 32.250423452768736, "endTime": 32.65146579804561 },
        { "text": "n", "startTime": 32.65146579804561, "endTime": 33.05250814332248 },
        { "text": "deux", "startTime": 33.05250814332248, "endTime": 33.694175895765476 },
        { "text": "trois", "startTime": 33.694175895765476, "endTime": 34.396 }
      ],
      "renderHints": {
        "rawDuration": 6.84,
        "timingClass": "normal",
        "renderEndTime": 35.08,
        "lineTransitionMode": "normal",
        "wordRevealMode": "normal"
      }
    },
    {
      "startTime": 35.08,
      "endTime": 41.94,
      "fullText": "絡まる 糸 解いて 動き出す",
      "translation": "缠绕的线被解开，开始运作",
      "words": [
        { "text": "絡", "startTime": 35.08, "endTime": 35.64127272727273 },
        { "text": "ま", "startTime": 35.64127272727273, "endTime": 36.20254545454546 },
        { "text": "る", "startTime": 36.20254545454546, "endTime": 36.76381818181819 },
        { "text": "糸", "startTime": 36.76381818181819, "endTime": 37.32509090909092 },
        { "text": "解", "startTime": 37.32509090909092, "endTime": 37.88636363636365 },
        { "text": "い", "startTime": 37.88636363636365, "endTime": 38.44763636363638 },
        { "text": "て", "startTime": 38.44763636363638, "endTime": 39.00890909090911 },
        { "text": "動", "startTime": 39.00890909090911, "endTime": 39.57018181818184 },
        { "text": "き", "startTime": 39.57018181818184, "endTime": 40.13145454545457 },
        { "text": "出", "startTime": 40.13145454545457, "endTime": 40.692727272727296 },
        { "text": "す", "startTime": 40.692727272727296, "endTime": 41.254000000000026 }
      ],
      "renderHints": {
        "rawDuration": 6.859999999999999,
        "timingClass": "normal",
        "renderEndTime": 41.94,
        "lineTransitionMode": "normal",
        "wordRevealMode": "normal"
      }
    }
  ]
}
```

读这个对象时，可以直接拿这三句来理解统一歌词对象的几个关键约定：

1. 第一句 `......`
   这不是~~压缩毛巾~~原歌词，而是流水线在间奏空窗期补出的占位行，visualizer 应该信任歌词流水线产生的 `lines`是稳定的结构。
2. 第二句 `グルグル 機械仕掛けのun deux trois`
   这句同时包含 CJK 和拉丁文本。`words` 的粒度可随来源而不同，`deux`、`trois` 仍可能是整词；需要字符级效果时应调用 `buildWordGraphemeTimings` 或 `buildLineGraphemeTimeline`，而不是让 renderer 自己重建字母时间。
3. 第三句 `絡まる 糸 解いて 動き出す`
   这句的 `words` 里仅有 CJK 字符，但 `fullText` 里仍然包含空格。也就是说，`fullText` 不一定等于 `words.map(w => w.text).join('')`，它更接近“原始歌词文本”，而 `words` 则是为了动画方便切分过的时间片段。两者不一定完全对齐，renderer 需要考虑如何处理这种不对齐的情况。

基于这三句，再看下面这些字段会更直观：

- `format` 表示这次解析最终走的是哪条 parser 分支；这首歌是 `lrc`
- `fullText` 是整句文本，适合做整句布局
- `words` 是歌词流水线产出的最小时间片段，但它不保证一定细到“单个字符”
- `translation` 是已经对齐到当前句的翻译，不需要 renderer 再自己匹配
- `renderHints.rawDuration` 是这句的原始时长
- `renderHints.renderEndTime` 是这句允许继续留在屏幕上的最晚时间，visualizer 可以用它做退场和尾迹，但不能假定它一定不会被下一句截断

::: tip 看样例时最值得注意的 3 个点
1. 统一歌词对象里可能包含流水线补出的占位行，而不只是原始歌词文本。
2. `words` 的切分粒度依赖歌词内容和来源，不保证永远细到单字符。
3. visualizer 真正关心的不只是 `startTime` / `endTime`，还包括 `renderHints` 给出的过场时序。
:::

::: warning 词与字符的粒度不同
`words` 不保证是单字符；拉丁文本通常是整词，TTML 还可能在一个词上附带多个 `syllables`。字符级模式应通过 `graphemeTiming` 获取统一时间轴。标点、空格、连字符等无法映射到词的字符会得到零时长占位 timing，布局可以保留它们，动画则应按模式需要平滑处理。
:::

如果你在调试 visualizer 的切句、尾迹或下一句预热问题，这类真实对象会比只看原始 `.lrc` 更有帮助。

## 从 parserCore 到 visualizer

数据流可以简化成下面这条链路：

```text
歌词文本 / 在线接口 / 本地侧车文件
-> parserCore / 各种 adapter
-> 统一 LyricData
-> graphemeTiming（按需构建字符时间轴）
-> renderHints 标注与迁移
-> App / 播放控制器
-> VisualizerRenderer
-> 具体 visualizer 模式
```

更具体一点：

1. `parserCore` 按格式解析歌词，产出 `LyricData`
2. 本地歌词、Navidrome、Now Playing、Stage API 等来源通过各自 adapter 接到同一条歌词流水线
3. TTML 转换会保留音节 / 音素 timing；字符级模式按需经 `graphemeTiming` 构建时间轴
4. 流水线会补齐 `renderHints` 和副歌标记
5. `App.tsx` 把 `currentTime`、`currentLineIndex`、`lines`、主题、音频能量一起传给 `VisualizerRenderer`
6. `VisualizerRenderer` 再根据当前模式，把同一份共享 props 交给对应模式组件

也就是说，visualizer 应该把自己当成“渲染层”，而不是“歌词解析层”。

::: tip 调试顺序
当结果看起来“不像歌词文件里写的那样”时，先看统一 `LyricData`，再看 renderer。很多问题其实发生在“解析后对象长什么样”，而不是动画本身。
:::

## 统一歌词对象数据结构

虽然不同来源的歌词差异很大，但进入 visualizer 前会尽量被压平成统一结构。这样做的好处是：

- 模式不需要分别适配 `lrc`、`vtt`、`yrc`
- 播放页和预览面板可以复用同一套 renderer
- 新增 visualizer 时，不必重新发明歌词输入协议

当前 visualizer 最常直接消费的字段有：

- `lines`
- `currentLineIndex`
- `currentTime`
- `line.translation`
- `line.renderHints`

其中有几个约定值得特别注意：

- `currentLineIndex` 可能是 `-1`，表示当前没有激活歌词
- `lines[currentLineIndex]` 不一定存在，renderer 需要自己兜底
- `translation` 可能为空，此时底部字幕层通常会退化成“显示下一句提示”
- `renderHints.renderEndTime` 不等于“保证能显示到这个时间”，它只是“允许 visualizer 最晚占用到这里”；如果下一句更早开始，当前句仍然应该让位

::: warning 最容易误解的一点
`renderHints.renderEndTime` 不是“这句歌词一定会显示到这个时间点”。它更接近“如果没有被下一句打断，这句最多还可以继续占用时间轴到这里”。
:::

# Visualizer 结构

当前主项目里的 visualizer 已经收敛成“共享基座 + 模式 renderer”的结构，而不是每个模式各自从头搭一整套播放页。

几层核心职责如下：

- `definition.ts`：定义共享 props、registry entry 契约、设置面板接口
- `registry.tsx`：自动发现每个模式的 `entry.tsx`，生成模式注册表
- `VisualizerRenderer.tsx`：根据 `mode` 从 registry 里取出当前 renderer
- `runtime.ts`：提供当前句、最近完成句、下一句、预热窗口这些共享运行时工具
- `VisualizerShell.tsx`：负责外层容器、背景层、返回按钮、字体注入
- `VisualizerSubtitleOverlay.tsx`：负责底部翻译和下一句提示
- `VisualizerHarmonyOverlay.tsx`：负责副歌 / 音频响应的和声叠加层
- `tuningRegistry.ts`：汇总各模式 tuning 默认值，由 `VisualizerRenderer` 的 `applyVisualizerTuning` 统一注入
- `backgrounds/registry.tsx`：背景层注册表，与模式注册表相互独立
- `<mode>/`：各自的主渲染器与 `tuning.ts`

这套结构的重点是“共享外壳和运行时，不强行统一渲染算法”。不同模式仍然可以：

- 用 DOM
- 用 Framer Motion
- 用 Canvas
- 做自由散点布局、文章排版、聊天气泡或镜头追焦

但它们最好复用同一套外层契约。

::: info 共享什么，不共享什么
共享的是壳层、runtime、字幕层、注册方式和设置面板挂载方式。

不共享的是具体排版算法、镜头语法和每个模式自己的动画美学。
:::

## 组件树

在播放器实际运行时，可以把组件树近似理解成下面这样：

```tsx
<App>
  <VisualizerRenderer mode={visualizerMode} {...sharedProps} />
</App>
```

`VisualizerRenderer` 自己很薄，只做一件事：根据模式从 registry 中找到对应 entry，然后调用它的 `render(props)`。

而一个具体模式内部，当前推荐保留这层组合关系：

```tsx
<VisualizerShell ...>
  {/* 模式自己的主渲染层 */}
  <VisualizerSubtitleOverlay ... />
</VisualizerShell>
```

这棵树里每层职责比较固定：

- `VisualizerShell`
  负责背景底色、封面取色流体背景、几何背景、返回按钮、外层字体和舞台容器
- 模式自己的主渲染层
  负责当前句怎么排版、逐字如何 reveal、尾迹如何退场、下一句是否预热
- `VisualizerSubtitleOverlay`
  负责底部翻译字幕，以及无翻译时的下一句 / 下两句提示

::: tip 写新模式时的默认姿势
优先保留 `VisualizerShell -> 你的 renderer -> VisualizerSubtitleOverlay` 这个组合关系。除非你非常确定要推翻它，否则不要从零再搭一套外层舞台。
:::

如果你要新增一个 visualizer，最稳妥的做法通常不是直接改 `VisualizerRenderer.tsx`，而是：

1. 新建 `src/components/visualizer/foo/VisualizerFoo.tsx`
2. 新建 `src/components/visualizer/foo/entry.tsx`
3. 用 `defineVisualizer(...)` 导出 registry entry
4. 让 `registry.tsx` 通过 `import.meta.glob('./*/entry.tsx', { eager: true })` 自动发现它

这样播放器、模式选择器、`VisPlayground` 预览面板和主题预览都能继续共用同一份注册表，不需要再手动接线。

::: warning 不推荐的接入方式
不要为了加一个新模式，直接去 `VisualizerRenderer.tsx` 里手写一串 `if / switch` 分支。当前架构已经把模式发现收敛到 `entry.tsx + registry.tsx` 这条链路里了。
:::

## 背景层是独立的注册表

背景不属于任何单个模式。背景 entry 位于 `src/components/visualizer/backgrounds/<name>/entry.tsx`，由 `backgrounds/registry.tsx` 用同样的 glob 方式发现，实际渲染在 `backgrounds/VisualizerBackgroundRenderer.tsx`，共享 props 与默认值在 `backgrounds/definition.ts`。

当前背景 entry：

| 背景 | 实现 |
| --- | --- |
| `common` | `FluidBackground.tsx`、`GeometricBackground.tsx`，带 `CommonBackgroundSettingsCard.tsx` |
| `latent` | `LatentBackground.tsx` 与设置卡 |
| `monet` | `MonetBackgroundLayer.tsx` 与设置卡 |
| `nomand` | `NomandBackgroundLayer.tsx` 与设置卡 |
| `sora` | `SoraBackground.tsx` |
| `url` | `UrlBackgroundLayer.tsx` 与设置卡 |

新增背景时走背景注册表，不要在单个 visualizer 内联一套背景实现。

## 共享运行时工具

`runtime.ts` 统一了“当前行、上一句、下一句、预热窗口”的计算，新模式不要再自己扫描 `lines`：

- `useVisualizerRuntime`
- `getRecentCompletedLine`
- `getUpcomingLine` / `getUpcomingLines`
- `shouldPreheatLine`
- `prepareActiveAndUpcoming`

字体与颜色同样有共享入口：`src/utils/fontStacks.ts` 保证 DOM、Canvas、pretext 和光栅化路径使用同一套字重 / 字体栈，`colorMix.ts` 负责主题色 alpha 与混合。字体测量和最终渲染必须使用同一个 `resolveThemeFontWeight` 结果，否则布局会与实际绘制错位。

## 不要只在播放页验证

统一 renderer 目前被多个宿主复用，它们会传入不同的 `staticMode`、背景、面板和字幕 props：

- `src/App.tsx`
- `src/components/modal/ThemePark.tsx`
- `src/components/visualizer/VisPlayground.tsx`
- `src/components/obs/ObsBrowserSourceApp.tsx`
- `src/components/obs/ObsWebSourceApp.tsx`

改动共享层时，至少要在播放页与 `VisPlayground` 两处验证；涉及背景、字幕或透明度时还要看 OBS 源。

## 运行时约束

这些是主仓库 `frontend-runtime-guardrails` skill 的硬性要求，PR 会按它审查：

- 连续播放时间优先使用 MotionValue、ref、CSS / Motion、canvas 或 Pixi draw loop，不要每帧写 React state / store。
- React state 只保存当前行、播放状态、可见段落等离散变化；高频 `requestAnimationFrame`、`useMotionValueEvent`、`ResizeObserver` 必须有相等保护和 cleanup。
- 布局 cache key 要包含歌词内容、主题、最终字重、窗口尺寸和 mode tuning。
- Pixi runtime、Three 场景、纹理和 RAF 必须在卸载时销毁。
- 单个模式文件继续明显膨胀时，把 layout、canvas / Pixi、tuning 和纯计算拆到同目录文件。

## Visualizer 贡献规则

Visualizer 模式允许自由发挥创意；项目不会要求每个模式都使用相同的排版或动画语言。逐字 / 字符动画、关键词着色和副歌行强化都是可选的高级能力，不是新模式的合并前置条件，但强烈鼓励在设计合适时尽可能支持全部三项，并为未提供相关歌词元数据的情况保留稳定回退。

以下设计属于反模式，相关 PR 不会被主仓库合并：

- 完全照抄 Apple Music 的视觉方案，未形成明显差异化设计。
- 大量依赖必须随安装包分发的二进制素材。
- 完全不使用歌词文字作为视觉内容。
- 存在严重性能问题或持续阻塞主线程。
- 无视 Dual Theme 的主题配色与明暗切换，使用固定颜色或只适配单一主题。

提交前应在真实播放页与预览页验证：歌词可读性、无歌词 / 无高级元数据时的回退、明暗主题切换，以及长歌词和高频切句下的主线程与帧率表现。
