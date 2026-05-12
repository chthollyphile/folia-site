<template>
  <div class="folia-landing">
    <!-- Fume 风格动态背景: 包含大量几何元素和光效 -->
    <div class="fume-background">
      <!-- 主光晕 -->
      <div class="glow glow-1" :style="{ transform: `translateY(${scrollY * 0.4}px) translateX(${Math.sin(scrollY * 0.003) * 100}px)` }"></div>
      <div class="glow glow-2" :style="{ transform: `translateY(${scrollY * 0.2}px) translateX(${Math.cos(scrollY * 0.002) * 80}px)` }"></div>
      <div class="glow glow-3" :style="{ transform: `translateY(${scrollY * -0.3}px) translateX(${Math.sin(scrollY * 0.001) * -60}px)` }"></div>
      <div class="glow glow-4" :style="{ transform: `translateY(${scrollY * 0.1}px)` }"></div>

      <!-- 几何漂浮物 (高密度视差阵列) -->
      <div
        v-for="item in geoItems"
        :key="item.key"
        class="geo geo-cluster"
        :class="item.className"
        :style="{
          top: item.top,
          left: item.left,
          width: item.width,
          height: item.height,
          opacity: item.opacity,
          '--geo-size': item.size,
          transform: `translate(${scrollY * item.parallaxX}px, ${scrollY * item.parallaxY}px) rotate(${scrollY * item.rotate}deg) scale(${item.scale})`
        }"
      ></div>
      
      <!-- 光点星屑 -->
      <div v-for="n in 56" :key="'star-'+n" class="star" 
           :style="{ 
             top: `${(n * 11) % 100}%`, 
             left: `${(n * 17) % 100}%`,
             transform: `translate(${scrollY * (((n % 6) - 3) * 0.03)}px, ${scrollY * (-0.08 - (n % 7) * 0.04)}px)`,
             opacity: 0.08 + Math.sin(scrollY * 0.01 + n) * 0.24
           }">
      </div>
    </div>

    <!-- 巨型背景文字排版 (Typography PV) 脱离 fixed，覆盖全页 -->
    <div class="typography-layer">
      <div class="typo typo-1" :style="{ transform: `translateY(${scrollY * 0.2}px) translateX(${scrollY * 0.05}px)` }">君の言葉が光る</div>
      <div class="typo typo-2" :style="{ transform: `translateY(${scrollY * 0.4}px) translateX(${scrollY * -0.05}px)` }">Beyond the void, the limit of the pen.</div>
      <div class="typo typo-3" :style="{ transform: `translateY(${scrollY * 0.15}px)` }">私は虚無の先　筆の限界</div>
      <div class="typo typo-4" :style="{ transform: `translateY(${scrollY * 0.3}px)` }">I could never hold love, so I kept creating it.</div>
      <div class="typo typo-5" :style="{ transform: `translateY(${scrollY * 0.1}px) translateX(${scrollY * -0.02}px)` }">键盘上编织着神的文字</div>
      <div class="typo typo-6" :style="{ transform: `translateY(${scrollY * 0.25}px) translateX(${scrollY * 0.03}px)` }">Divine words are woven across the keyboard.</div>
      <div class="typo typo-7" :style="{ transform: `translateY(${scrollY * 0.05}px)` }">在虚无的尽头寻找到了爱，从那之后虚无消失了。</div>
      <div class="typo typo-8" :style="{ transform: `translateY(${scrollY * -0.02}px) translateX(${scrollY * 0.02}px)` }">Only love remained after the void was gone.</div>
    </div>

    <!-- 滚动内容区 -->
    <div class="scroll-content">
      
      <!-- Hero Section -->
      <section class="section hero-section" :style="{ opacity: 1 - getProgress(0, 50), transform: `translateY(${scrollY * 0.3}px)` }">
        <div class="hero-content">
          <h1 class="title">Folia</h1>
          <p class="subtitle">Lyrics Reimagined.</p>
          <div class="cta-actions hero-actions">
            <a href="https://github.com/chthollyphile/folia-major/releases" target="_blank" class="btn btn-primary">立即下载</a>
            <a href="/guide/" class="btn btn-secondary glass">查看文档</a>
            <a href="https://github.com/chthollyphile/folia-major" target="_blank" class="btn btn-secondary glass">GitHub 仓库</a>
          </div>
          <div class="scroll-indicator">
            <span class="mouse">
              <span class="wheel"></span>
            </span>
            向下滑动探索
          </div>
        </div>
      </section>

      <!-- Feature 1: 沉浸式歌词 -->
      <section class="section feature-section">
        <div class="feature-container">
          <div class="text-content" :style="{ 
            opacity: getProgress(30, 80), 
            transform: `translateX(${(1 - getProgress(30, 80)) * -100}px)` 
          }">
            <h2 class="feature-title">沉浸式歌词体验</h2>
            <p class="feature-desc">打破传统播放器的枯燥，Folia 将歌词本身作为视觉的核心。多种 Visualizer 模式与全屏动态排版，让每一次听歌都像在欣赏一部精心制作的 PV。</p>
            
            <!-- 装饰性几何小元素 -->
            <div class="feature-deco" :style="{ transform: `rotate(${scrollY * 0.1}deg)` }">✦</div>
          </div>
          <div class="visual-content" :style="{ 
            opacity: getProgress(40, 90), 
            transform: `translateX(${(1 - getProgress(40, 90)) * 100}px) scale(${0.8 + getProgress(40, 90) * 0.2})` 
          }">
            <!-- 兼容图片的卡片容器 -->
            <div class="glass-card image-card preview-rotator">
              <transition name="preview-fade">
                <img
                  :key="currentPreviewSrc"
                  :src="currentPreviewSrc"
                  class="feature-img preview-img"
                  alt="Lyrics UI Preview"
                />
              </transition>
              <!-- 卡片内的动态装饰 -->
              <div class="card-glow" :style="{ opacity: getProgress(50, 100) }"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature 2: 简洁专注的体验 -->
      <section class="section feature-section reverse">
        <div class="feature-container">
          <div class="text-content" :style="{ 
            opacity: getProgress(130, 180), 
            transform: `translateX(${(1 - getProgress(130, 180)) * 100}px)` 
          }">
            <h2 class="feature-title">简洁专注的体验</h2>
            <p class="feature-desc">Folia 没有社交动态、推荐流和打断注意力的噪音，界面的重心始终只有音乐本身。播放页的 UI 元素可以按需全部隐藏，把屏幕完整交还给封面、歌词与情绪，让专注聆听重新成为主角。</p>
            <div class="feature-deco" :style="{ transform: `rotate(${scrollY * -0.1}deg)` }">●</div>
          </div>
          <div class="visual-content stacked-cards">
            <!-- 根据滚动进度展开的三张卡片 (支持替换为图片) -->
            <div class="glass-card src-card card-1 image-card" :style="{ 
              opacity: getProgress(120, 170),
              transform: `translateY(${(1 - getProgress(120, 170)) * 100}px) rotate(${getProgress(120, 170) * -5}deg)`
            }">
              <div class="mockup-placeholder">无社交</div>
            </div>
            <div class="glass-card src-card card-2 image-card" :style="{ 
              opacity: getProgress(140, 190),
              transform: `translate(${(1 - getProgress(140, 190)) * 50}px, ${(1 - getProgress(140, 190)) * 150}px) rotate(${getProgress(140, 190) * 0}deg)`
            }">
              <div class="mockup-placeholder">极简界面</div>
            </div>
            <div class="glass-card src-card card-3 image-card" :style="{ 
              opacity: getProgress(160, 210),
              transform: `translate(${(1 - getProgress(160, 210)) * 100}px, ${(1 - getProgress(160, 210)) * 200}px) rotate(${getProgress(160, 210) * 5}deg)`
            }">
              <div class="mockup-placeholder">歌词即舞台</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature 3: 跨平台部署 -->
      <section class="section feature-section">
        <div class="feature-container">
          <div class="text-content" :style="{ 
            opacity: getProgress(230, 280), 
            transform: `translateX(${(1 - getProgress(230, 280)) * -100}px)` 
          }">
            <h2 class="feature-title">跨平台部署</h2>
            <p class="feature-desc">可将 Folia 部署到 Vercel 作为 Web 应用，或使用 Electron 桌面客户端，皆能获得完整的体验。在 Linux 环境下也可以稳定、顺滑地使用，并原生支持 SMTC 与 MPRIS 媒体控制协议，让系统级播放控制、快捷键和外设联动都自然融入日常工作流。</p>
            <div class="feature-deco" :style="{ transform: `rotate(${scrollY * 0.08}deg)` }">◆</div>
          </div>
          <div class="visual-content stacked-cards">
            <div class="glass-card src-card card-1 image-card" :style="{ 
              opacity: getProgress(220, 270),
              transform: `translateY(${(1 - getProgress(220, 270)) * 100}px) rotate(${getProgress(220, 270) * -5}deg)`
            }">
              <div class="mockup-placeholder">Vercel / Cloudflare</div>
            </div>
            <div class="glass-card src-card card-2 image-card" :style="{ 
              opacity: getProgress(240, 290),
              transform: `translate(${(1 - getProgress(240, 290)) * 50}px, ${(1 - getProgress(240, 290)) * 150}px) rotate(${getProgress(240, 290) * 0}deg)`
            }">
              <div class="mockup-placeholder">MacOS / Windows / Linux</div>
            </div>
            <div class="glass-card src-card card-3 image-card" :style="{ 
              opacity: getProgress(260, 310),
              transform: `translate(${(1 - getProgress(260, 310)) * 100}px, ${(1 - getProgress(260, 310)) * 200}px) rotate(${getProgress(260, 310) * 5}deg)`
            }">
              <div class="mockup-placeholder">一次部署，多端运行</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature 4: AI 配色推断 -->
      <section class="section feature-section center-align">
        <div class="feature-container-center" :style="{ 
          opacity: getProgress(330, 380),
          transform: `translateY(${(1 - getProgress(330, 380)) * 100}px)`
        }">
          <h2 class="feature-title">AI 配色推断</h2>
          <p class="feature-desc">AI主题生成功能会结合歌词语义、情绪走向与歌曲氛围，推断出更贴合内容的主题配色。它不仅能为整首歌生成统一的视觉主题，还能进一步按照歌词的情感层次进行着色，让文字本身也拥有情绪温度与画面感。</p>
          
          <div
            ref="themeCompareRef"
            class="theme-compare"
            :style="{
              opacity: getProgress(360, 410),
              transform: `translateY(${(1 - getProgress(360, 410)) * 50}px) scale(${0.9 + getProgress(360, 410) * 0.1})`
            }"
            @pointerdown="startThemeCompareDrag"
            @mousedown.prevent="startThemeCompareDrag"
            @touchstart.prevent="startThemeCompareDrag"
          >
            <div class="glass-card image-card theme-compare-card">
              <img src="/screens/theme-colors2.png" class="feature-img theme-compare-img" alt="AI Theme Colors Preview 2" draggable="false" />
              <div class="theme-compare-overlay" :style="{ clipPath: `inset(0 ${100 - themeComparePosition}% 0 0)` }">
                <img src="/screens/theme-colors1.png" class="feature-img theme-compare-img" alt="AI Theme Colors Preview 1" draggable="false" />
              </div>
              <div class="theme-compare-divider" :style="{ left: `${themeComparePosition}%` }">
                <div class="theme-compare-handle">
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div class="theme-compare-label theme-compare-label-left">AI 配色</div>
              <div class="theme-compare-label theme-compare-label-right">默认配色</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature 5: 多来源整合 -->
      <section class="section feature-section reverse">
        <div class="feature-container">
          <div class="text-content" :style="{ 
            opacity: getProgress(430, 480), 
            transform: `translateX(${(1 - getProgress(430, 480)) * 100}px)` 
          }">
            <h2 class="feature-title">多来源整合</h2>
            <p class="feature-desc">无论是网易云的在线曲库、私人搭建的 Navidrome，还是本地珍藏的高清无损，Folia 皆可将其编排成歌词动画。轻点主菜单Tab，即可在不同来源之间切换，音乐来源可以不同，体验却始终统一、流畅而连贯。</p>
            <div class="feature-deco" :style="{ transform: `rotate(${scrollY * -0.1}deg)` }">●</div>
          </div>
          <div class="visual-content stacked-cards">
            <div class="glass-card src-card card-1 image-card" :style="{ 
              opacity: getProgress(420, 470),
              transform: `translateY(${(1 - getProgress(420, 470)) * 100}px) rotate(${getProgress(420, 470) * -5}deg)`
            }">
              <div class="mockup-placeholder">网易云</div>
            </div>
            <div class="glass-card src-card card-2 image-card" :style="{ 
              opacity: getProgress(440, 490),
              transform: `translate(${(1 - getProgress(440, 490)) * 50}px, ${(1 - getProgress(440, 490)) * 150}px) rotate(${getProgress(440, 490) * 0}deg)`
            }">
              <div class="mockup-placeholder">Navidrome</div>
            </div>
            <div class="glass-card src-card card-3 image-card" :style="{ 
              opacity: getProgress(460, 510),
              transform: `translate(${(1 - getProgress(460, 510)) * 100}px, ${(1 - getProgress(460, 510)) * 200}px) rotate(${getProgress(460, 510) * 5}deg)`
            }">
              <div class="mockup-placeholder">本地音乐</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const scrollY = ref(0)
const windowHeight = ref(1000)
const previewImages = [
  '/screens/preview-fume.png',
  '/screens/preview-cad.png',
  '/screens/preview-lumi.png',
  '/screens/preview-pat.png'
]
const currentPreviewIndex = ref(0)
const currentPreviewSrc = computed(() => previewImages[currentPreviewIndex.value])
const geoTypes = ['geo-circle-hollow', 'geo-square-hollow', 'geo-triangle', 'geo-dots']
const geoItems = Array.from({ length: 28 }, (_, index) => {
  const type = geoTypes[index % geoTypes.length]
  const baseSize = 48 + (index % 5) * 28

  return {
    key: `geo-${index}`,
    className: type,
    top: `${4 + ((index * 9) % 88)}%`,
    left: `${2 + ((index * 13) % 94)}%`,
    width: type === 'geo-triangle' ? '0' : `${baseSize}px`,
    height: type === 'geo-triangle' ? '0' : `${baseSize}px`,
    size: `${Math.round(baseSize * 0.7)}px`,
    opacity: `${0.06 + (index % 4) * 0.035}`,
    parallaxX: ((index % 7) - 3) * 0.08,
    parallaxY: -0.18 + (index % 6) * 0.11,
    rotate: ((index % 8) - 4) * 0.12,
    scale: 0.8 + (index % 5) * 0.1
  }
})
const themeCompareRef = ref(null)
const themeComparePosition = ref(52)
const isThemeCompareDragging = ref(false)

let previewTimer = null

const getClientX = (event) => {
  if (typeof event.clientX === 'number') return event.clientX
  if (event.touches && event.touches[0]) return event.touches[0].clientX
  if (event.changedTouches && event.changedTouches[0]) return event.changedTouches[0].clientX
  return null
}

const updateThemeComparePosition = (clientX) => {
  if (clientX === null) return

  const container = themeCompareRef.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  if (rect.width === 0) return

  const nextPosition = ((clientX - rect.left) / rect.width) * 100
  themeComparePosition.value = Math.min(100, Math.max(0, nextPosition))
}

const startThemeCompareDrag = (event) => {
  event.preventDefault?.()
  isThemeCompareDragging.value = true
  updateThemeComparePosition(getClientX(event))
}

const onThemeComparePointerMove = (event) => {
  if (!isThemeCompareDragging.value) return
  event.preventDefault?.()
  updateThemeComparePosition(getClientX(event))
}

const stopThemeCompareDrag = () => {
  isThemeCompareDragging.value = false
}

const updateScroll = () => {
  if (typeof window !== 'undefined') {
    scrollY.value = window.scrollY
    windowHeight.value = window.innerHeight || 1000
  }
}

// 核心插值函数：根据滚动百分比 (相对于视口高度 vh) 计算进度 0 -> 1
// 例如 getProgress(50, 100) 表示当页面向下滚动 50vh 时进度为 0，滚动到 100vh 时进度达到 1
const getProgress = (startVh, endVh) => {
  if (windowHeight.value === 0) return 0;
  const startPx = (startVh / 100) * windowHeight.value;
  const endPx = (endVh / 100) * windowHeight.value;
  
  if (scrollY.value <= startPx) return 0;
  if (scrollY.value >= endPx) return 1;
  return (scrollY.value - startPx) / (endPx - startPx);
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', updateScroll, { passive: true })
    window.addEventListener('pointermove', onThemeComparePointerMove, { passive: true })
    window.addEventListener('pointerup', stopThemeCompareDrag, { passive: true })
    window.addEventListener('pointercancel', stopThemeCompareDrag, { passive: true })
    window.addEventListener('mousemove', onThemeComparePointerMove, { passive: true })
    window.addEventListener('mouseup', stopThemeCompareDrag, { passive: true })
    window.addEventListener('touchmove', onThemeComparePointerMove, { passive: false })
    window.addEventListener('touchend', stopThemeCompareDrag, { passive: true })
    window.addEventListener('touchcancel', stopThemeCompareDrag, { passive: true })
    updateScroll()

    previewTimer = window.setInterval(() => {
      currentPreviewIndex.value = (currentPreviewIndex.value + 1) % previewImages.length
    }, 2800)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', updateScroll)
    window.removeEventListener('resize', updateScroll)
    window.removeEventListener('pointermove', onThemeComparePointerMove)
    window.removeEventListener('pointerup', stopThemeCompareDrag)
    window.removeEventListener('pointercancel', stopThemeCompareDrag)
    window.removeEventListener('mousemove', onThemeComparePointerMove)
    window.removeEventListener('mouseup', stopThemeCompareDrag)
    window.removeEventListener('touchmove', onThemeComparePointerMove)
    window.removeEventListener('touchend', stopThemeCompareDrag)
    window.removeEventListener('touchcancel', stopThemeCompareDrag)

    if (previewTimer !== null) {
      window.clearInterval(previewTimer)
    }
  }
})
</script>

<style>
/* 破解 VitePress 默认容器限制，实现全宽页面 */
.VPDoc {
  padding: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
}
.VPDoc .container {
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}
.VPDoc .content {
  max-width: 100% !important;
  padding: 0 !important;
}

/* Light Mode Variables */
:root {
  --fh-bg: #ffffff;
  --fh-text: #171717;
  --fh-glow-1: rgba(0, 0, 0, 0.05);
  --fh-glow-2: rgba(0, 0, 0, 0.03);
  --fh-glow-3: rgba(0, 0, 0, 0.04);
  --fh-glow-4: rgba(0, 0, 0, 0.02);
  --fh-geo-border: rgba(0, 0, 0, 0.24);
  --fh-geo-dots: radial-gradient(rgba(0, 0, 0, 0.3) 2px, transparent 2px);
  --fh-star-bg: rgba(0, 0, 0, 0.82);
  --fh-star-shadow: rgba(0, 0, 0, 0.16);
  --fh-typo-color: #000000;
  --fh-typo-opacity: 0.08;
  --fh-title-color: #171717;
  --fh-title-3d: #d4d4d4;
  --fh-title-shadow: rgba(0, 0, 0, 0.2);
  --fh-subtitle-color: rgba(0, 0, 0, 0.6);
  --fh-glass-bg: rgba(0, 0, 0, 0.02);
  --fh-glass-border: rgba(0, 0, 0, 0.08);
  --fh-btn-primary-bg: #171717;
  --fh-btn-primary-text: #ffffff;
  --fh-btn-primary-hover: #333333;
  --fh-btn-secondary-hover: rgba(0, 0, 0, 0.05);
  --fh-card-glow: radial-gradient(circle at center, rgba(0, 0, 0, 0.05) 0%, transparent 50%);
  --fh-scroll-border: rgba(0, 0, 0, 0.3);
  --fh-scroll-wheel: rgba(0, 0, 0, 0.3);
}

/* Dark Mode Variables */
html.dark {
  --fh-bg: #000000;
  --fh-text: #ffffff;
  --fh-glow-1: rgba(255, 255, 255, 0.15);
  --fh-glow-2: rgba(255, 255, 255, 0.1);
  --fh-glow-3: rgba(200, 200, 200, 0.12);
  --fh-glow-4: rgba(255, 255, 255, 0.08);
  --fh-geo-border: rgba(255, 255, 255, 0.3);
  --fh-geo-dots: radial-gradient(rgba(255, 255, 255, 0.4) 2px, transparent 2px);
  --fh-star-bg: #ffffff;
  --fh-star-shadow: rgba(255, 255, 255, 0.3);
  --fh-typo-color: #ffffff;
  --fh-typo-opacity: 0.08;
  --fh-title-color: #ffffff;
  --fh-title-3d: #333333;
  --fh-title-shadow: rgba(0, 0, 0, 0.8);
  --fh-subtitle-color: rgba(255, 255, 255, 0.7);
  --fh-glass-bg: rgba(255, 255, 255, 0.05);
  --fh-glass-border: rgba(255, 255, 255, 0.1);
  --fh-btn-primary-bg: #ffffff;
  --fh-btn-primary-text: #000000;
  --fh-btn-primary-hover: #e0e0e0;
  --fh-btn-secondary-hover: rgba(255, 255, 255, 0.1);
  --fh-card-glow: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  --fh-scroll-border: rgba(255, 255, 255, 0.5);
  --fh-scroll-wheel: rgba(255, 255, 255, 0.5);
}

html.dark .glass-card {
  box-shadow: 0 30px 60px rgba(0,0,0,0.4) !important;
}

html.dark .card-2 { background: rgba(255, 255, 255, 0.03) !important; }
html.dark .card-3 { background: rgba(255, 255, 255, 0.02) !important; }
</style>

<style scoped>
.folia-landing {
  position: relative;
  width: 100%;
  background-color: var(--fh-bg);
  color: var(--fh-text);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Fume Background */
.fume-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}

/* 光晕效果 */
.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.4;
  will-change: transform;
  transition: background 0.3s ease;
}

.glow-1 {
  top: -10%;
  left: -10%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, var(--fh-glow-1) 0%, rgba(0, 0, 0, 0) 70%);
}

.glow-2 {
  bottom: -20%;
  right: -10%;
  width: 50vw;
  height: 50vw;
  background: radial-gradient(circle, var(--fh-glow-2) 0%, rgba(0, 0, 0, 0) 70%);
}

.glow-3 {
  top: 40%;
  left: 30%;
  width: 40vw;
  height: 40vw;
  background: radial-gradient(circle, var(--fh-glow-3) 0%, rgba(0, 0, 0, 0) 70%);
}

.glow-4 {
  top: 80%;
  left: 10%;
  width: 30vw;
  height: 30vw;
  background: radial-gradient(circle, var(--fh-glow-4) 0%, rgba(0, 0, 0, 0) 70%);
}

/* 几何背景元素 */
.geo {
  position: absolute;
  opacity: 0.18;
  border: 1px solid var(--fh-geo-border);
  will-change: transform;
  transition: border-color 0.3s ease;
}

.geo-cluster {
  transform-origin: center;
}

.geo-circle-hollow {
  border-radius: 50%;
  border-width: 2px;
}

.geo-square-hollow {
  border-width: 2px;
}

.geo-triangle {
  width: 0;
  height: 0;
  border-left: var(--geo-size) solid transparent;
  border-right: var(--geo-size) solid transparent;
  border-bottom: calc(var(--geo-size) * 1.65) solid var(--fh-geo-border);
  border-top: none;
  background: transparent;
  opacity: 0.14;
  transition: border-bottom-color 0.3s ease;
}

.geo-dots {
  background-image: var(--fh-geo-dots);
  background-size: 16px 16px;
  border: none;
  opacity: 0.28;
  transition: background-image 0.3s ease;
}

html:not(.dark) .geo-circle-hollow,
html:not(.dark) .geo-square-hollow {
  border-width: 2.5px;
}

/* 星屑光点 */
.star {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--fh-star-bg);
  border-radius: 50%;
  box-shadow: 0 0 10px 2px var(--fh-star-shadow);
  will-change: transform, opacity;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

/* Typography PV 层 */
.typography-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 600vh;
  pointer-events: none;
  z-index: 1;
  overflow: visible;
}

.typo {
  position: absolute;
  font-weight: 900;
  color: var(--fh-typo-color);
  opacity: var(--fh-typo-opacity);
  white-space: nowrap;
  letter-spacing: -0.05em;
  user-select: none;
  will-change: transform;
  transition: color 0.3s ease, opacity 0.3s ease;
}

.typo-1 { top: 5%; left: -5%; font-size: 15vw; }
.typo-2 { top: 18%; right: -10%; font-size: 12vw; }
.typo-3 { top: 30%; left: 10%; font-size: 10vw; }
.typo-4 { top: 42%; left: 30%; font-size: 8vw; font-family: 'Inter', sans-serif; }
.typo-5 { top: 55%; left: -5%; font-size: 12vw; font-family: 'Inter', sans-serif; }
.typo-6 { top: 70%; right: -5%; font-size: 10vw; }
.typo-7 { top: 80%; left: 15%; font-size: 9vw; font-family: 'Inter', sans-serif; }
.typo-8 { top: 90%; right: 10%; font-size: 11vw; }

/* Scroll Content Layer */
.scroll-content {
  position: relative;
  z-index: 10;
  width: 100%;
}

/* Sections */
.section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 10vw;
  will-change: transform, opacity;
}

.hero-section {
  flex-direction: column;
  text-align: center;
}

.title {
  font-size: clamp(5rem, 15vw, 12rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  margin: 0;
  color: var(--fh-title-color);
  text-shadow: 
    1px 1px 0 var(--fh-title-3d),
    2px 2px 0 var(--fh-title-3d),
    3px 3px 0 var(--fh-title-3d),
    4px 4px 0 var(--fh-title-3d),
    5px 5px 0 var(--fh-title-3d),
    6px 6px 0 var(--fh-title-3d),
    8px 8px 15px var(--fh-title-shadow);
  line-height: 1;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.subtitle {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 500;
  color: var(--fh-subtitle-color);
  margin-top: 1rem;
  transition: color 0.3s ease;
}

.hero-actions {
  justify-content: center;
  margin-top: 2rem;
}

.scroll-indicator {
  position: absolute;
  bottom: 10vh;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.9rem;
  color: var(--fh-subtitle-color);
  gap: 8px;
  transition: color 0.3s ease;
}

.mouse {
  width: 24px;
  height: 36px;
  border: 2px solid var(--fh-scroll-border);
  border-radius: 12px;
  position: relative;
  transition: border-color 0.3s ease;
}

.wheel {
  width: 4px;
  height: 8px;
  background: var(--fh-scroll-wheel);
  border-radius: 2px;
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  animation: scrollWheel 2s infinite;
  transition: background 0.3s ease;
}

@keyframes scrollWheel {
  0% { top: 6px; opacity: 1; }
  100% { top: 18px; opacity: 0; }
}

/* Feature Sections */
.feature-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  align-items: center;
  gap: 4rem;
}

.feature-section.reverse .feature-container {
  flex-direction: row-reverse;
}

@media (max-width: 768px) {
  .feature-container,
  .feature-section.reverse .feature-container {
    flex-direction: column;
    text-align: center;
  }
}

.text-content {
  flex: 1;
  position: relative;
  will-change: transform, opacity;
}

.feature-title {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.feature-desc {
  font-size: 1.2rem;
  color: var(--fh-subtitle-color);
  line-height: 1.6;
  transition: color 0.3s ease;
}

.feature-deco {
  position: absolute;
  top: -40px;
  left: -20px;
  font-size: 4rem;
  color: var(--fh-typo-color);
  opacity: 0.05;
  pointer-events: none;
  transition: color 0.3s ease;
}

.visual-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  will-change: transform, opacity;
}

/* Glassmorphism */
.glass-card {
  background: var(--fh-glass-bg);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid var(--fh-glass-border);
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.1);
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.image-card {
  width: 100%;
  max-width: 500px;
  position: relative;
  overflow: hidden;
  padding: 0;
}

.preview-rotator {
  aspect-ratio: 2521 / 1358;
}

.feature-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  border-radius: 24px;
}

.preview-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.55s ease, transform 0.55s ease;
}

.preview-fade-enter-active,
.preview-fade-leave-active {
  position: absolute;
  inset: 0;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

.mockup-placeholder {
  width: 100%;
  height: 100%;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--fh-subtitle-color);
  background: rgba(128, 128, 128, 0.05);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: var(--fh-card-glow);
  pointer-events: none;
  transition: background 0.3s ease;
}

/* Stacked Cards for Feature 2 */
.stacked-cards {
  position: relative;
  width: 100%;
  height: 400px;
}

.src-card {
  position: absolute;
  width: 250px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  will-change: transform, opacity;
}

.card-1 {
  top: 10%;
  left: 10%;
  z-index: 3;
}
.card-2 {
  top: 35%;
  left: 25%;
  z-index: 2;
  background: rgba(128, 128, 128, 0.05);
}
.card-3 {
  top: 60%;
  left: 40%;
  z-index: 1;
  background: rgba(128, 128, 128, 0.03);
}

/* Feature 3: AI Themes */
.center-align .feature-container-center {
  max-width: 800px;
  text-align: center;
  will-change: transform, opacity;
}

.theme-compare {
  display: flex;
  justify-content: center;
  margin-top: 48px;
  will-change: transform, opacity;
  cursor: ew-resize;
  user-select: none;
  touch-action: none;
}

.theme-compare-card {
  width: min(100%, 920px);
  max-width: 920px;
  position: relative;
  overflow: hidden;
}

.theme-compare-img {
  display: block;
  width: 100%;
}

.theme-compare-overlay {
  position: absolute;
  inset: 0;
}

.theme-compare-overlay .theme-compare-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left center;
}

.theme-compare-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
  transform: translateX(-50%);
  border-left: 2px solid rgba(255, 255, 255, 0.9);
  pointer-events: none;
}

.theme-compare-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
  transform: translate(-50%, -50%);
}

.theme-compare-handle span {
  width: 2px;
  height: 18px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
}

.theme-compare-label {
  position: absolute;
  top: 20px;
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.theme-compare-label-left {
  left: 20px;
}

.theme-compare-label-right {
  right: 20px;
}

@media (max-width: 768px) {
  .theme-compare {
    margin-top: 36px;
  }

  .theme-compare-card {
    width: 100%;
  }

  .theme-compare-overlay .theme-compare-img {
    width: 100%;
  }

  .theme-compare-handle {
    width: 48px;
    height: 48px;
  }

  .theme-compare-label {
    top: 14px;
    padding: 7px 12px;
    font-size: 0.8rem;
  }
}

.cta-actions {
  display: flex;
  gap: 20px;
}

.btn {
  padding: 16px 40px;
  border-radius: 40px;
  font-size: 1.2rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--fh-btn-primary-bg);
  color: var(--fh-btn-primary-text);
}

.btn-primary:hover {
  background: var(--fh-btn-primary-hover);
  transform: translateY(-2px);
}

.btn-secondary:hover {
  background: var(--fh-btn-secondary-hover);
  transform: translateY(-2px);
}
</style>
