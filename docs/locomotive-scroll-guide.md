# Locomotive Scroll v5 開發指南

> 🚀 輕量級（9.4kB gzipped）、高效能的滾動動畫庫，基於 Lenis 構建

---

## 📦 安裝

### NPM（推薦）
```bash
npm install locomotive-scroll
```

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/locomotive-scroll/bundled/locomotive-scroll.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/locomotive-scroll/bundled/locomotive-scroll.css" />
```

---

## 🚀 快速開始

### JavaScript
```javascript
import LocomotiveScroll from 'locomotive-scroll';

const scroll = new LocomotiveScroll();
```

### CSS
```css
@import 'locomotive-scroll/dist/locomotive-scroll.css';
```

### HTML
```html
<div data-scroll data-scroll-speed="0.5">我以一半速度移動</div>
```

---

## ⚙️ 初始化選項

```javascript
const scroll = new LocomotiveScroll({
  // Lenis 選項
  lenisOptions: {
    wrapper: window,                    // 滾動容器（預設 window）
    content: document.documentElement,  // 內容元素
    lerp: 0.1,                          // 線性插值強度 (0-1)
    duration: 1.2,                      // 動畫持續時間
    orientation: 'vertical',            // 滾動方向：'vertical' | 'horizontal'
    gestureOrientation: 'vertical',     // 手勢方向
    smoothWheel: true,                  // 平滑滾輪
    smoothTouch: false,                 // 平滑觸控（預設關閉，因無法模擬原生觸控體驗）
    wheelMultiplier: 1,                 // 滾輪速度倍數
    touchMultiplier: 2,                 // 觸控速度倍數
    normalizeWheel: true,               // 標準化滾輪輸入
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 緩動函數
  },
  
  // 觸發器的 root margin（元素進入視窗時觸發）
  triggerRootMargin: '-1px -1px -1px -1px',
  
  // RAF 動畫的 root margin（用於 data-scroll-speed 等）
  rafRootMargin: '100% 100% 100% 100%',
  
  // 是否自動啟動
  autoStart: true,
  
  // 滾動回調
  scrollCallback: ({ scroll, limit, velocity, direction, progress }) => {
    console.log('滾動進度:', progress);
  }
});
```

---

## 🏷️ HTML 屬性（Data Attributes）

### 基礎屬性

| 屬性 | 說明 |
|------|------|
| `data-scroll` | **必須** - 啟用元素的視窗偵測 |
| `data-scroll-speed="0.5"` | 視差速度（相對於容器大小，非像素）|
| `data-scroll-class="custom-class"` | 元素進入視窗時添加的 class（預設 `is-inview`）|
| `data-scroll-repeat` | 允許重複觸發進入/離開動畫 |

### 位置與偏移

| 屬性 | 說明 |
|------|------|
| `data-scroll-position="start,end"` | 觸發位置：`start`、`middle`、`end` |
| `data-scroll-offset="100,50%"` | 偏移量（像素或百分比）|

### 進度追蹤

| 屬性 | 說明 |
|------|------|
| `data-scroll-css-progress` | 添加 CSS 變數 `--progress`（0-1）|
| `data-scroll-event-progress="eventName"` | 觸發自訂事件並傳遞進度 |

### 事件觸發

| 屬性 | 說明 |
|------|------|
| `data-scroll-call="eventName"` | 元素進入視窗時觸發自訂事件 |

### 導航

| 屬性 | 說明 |
|------|------|
| `data-scroll-to` | 點擊時滾動到目標（配合 `href` 或 `data-scroll-to-href`）|
| `data-scroll-to-href="#target"` | 指定滾動目標 |
| `data-scroll-to-offset="100"` | 滾動偏移量 |
| `data-scroll-to-duration="2"` | 滾動動畫時長（秒）|

### 觸控裝置

| 屬性 | 說明 |
|------|------|
| `data-scroll-enable-touch-speed` | 在觸控裝置上啟用視差效果（預設關閉）|
| `data-scroll-ignore-fold` | 忽略折疊區域的偏移調整 |

---

## 📐 視差速度計算

```
位移 = progress × containerSize × speed × -1
```

- `containerSize`：Lenis 滾動容器的高度（或水平滾動時的寬度）
- `progress`：元素在視窗中的進度（-1 到 1，折疊內元素為 0 到 1）
- `speed`：你指定的值

### 速度範例

| 速度值 | 效果 |
|--------|------|
| `0.5` | 以一半速度移動（向下滾動時向上飄移）|
| `1` | 完整視差效果 |
| `-0.3` | 反向移動 |
| `0` | 正常速度（無視差）|

> 💡 建議從 `0.1` ~ `0.5` 的小值開始，效果會更自然

---

## 🎯 使用 CSS 變數追蹤進度

```html
<div 
  data-scroll 
  data-scroll-css-progress
  style="transform: scale(calc(0.5 + var(--progress) * 0.5))"
>
  隨滾動縮放
</div>
```

### 進度驅動動畫範例

```css
[data-scroll] {
  /* 使用 --progress (0-1) 做動畫 */
  opacity: var(--progress);
  transform: translateY(calc((1 - var(--progress)) * 50px));
}
```

---

## 📡 事件監聽

### 滾動事件（data-scroll-call）

```html
<div data-scroll data-scroll-call="myEvent">觸發事件</div>
```

```javascript
window.addEventListener('myEvent', (e) => {
  const { target, way, from } = e.detail;
  // way: 'enter' | 'leave'
  // from: 'start' | 'end'
  console.log(`${way} from ${from}`);
});
```

### 進度事件（data-scroll-event-progress）

```html
<div data-scroll data-scroll-event-progress="progressEvent">追蹤進度</div>
```

```javascript
window.addEventListener('progressEvent', (e) => {
  const { target, progress } = e.detail;
  console.log('進度:', progress); // 0-1
});
```

---

## 🔧 方法（Methods）

```javascript
const scroll = new LocomotiveScroll();

// 滾動到指定位置
scroll.scrollTo('#target');
scroll.scrollTo(500); // 像素位置
scroll.scrollTo(document.querySelector('.element'));

// 滾動到指定位置（帶選項）
scroll.scrollTo('#target', {
  offset: -100,      // 偏移量
  duration: 2,       // 動畫時長（秒）
  immediate: false,  // 是否立即跳轉
});

// 開始/停止
scroll.start();
scroll.stop();

// 銷毀實例
scroll.destroy();

// 重新計算尺寸（當 DOM 變更時）
scroll.resize();
```

---

## 🔄 與 GSAP 整合

### 使用 GSAP Ticker

```javascript
import LocomotiveScroll from 'locomotive-scroll';
import { gsap } from 'gsap/all';

const scroll = new LocomotiveScroll({
  initCustomTicker: (render) => {
    gsap.ticker.add(render);
  },
  destroyCustomTicker: (render) => {
    gsap.ticker.remove(render);
  }
});
```

### 與 ScrollTrigger 整合

```javascript
import LocomotiveScroll from 'locomotive-scroll';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const scroll = new LocomotiveScroll();

// 同步 ScrollTrigger
scroll.on('scroll', ScrollTrigger.update);

ScrollTrigger.scrollerProxy(document.body, {
  scrollTop(value) {
    return arguments.length 
      ? scroll.scrollTo(value, { immediate: true }) 
      : scroll.scroll;
  },
  getBoundingClientRect() {
    return { 
      top: 0, 
      left: 0, 
      width: window.innerWidth, 
      height: window.innerHeight 
    };
  }
});
```

---

## ⚛️ React 整合

```tsx
import { useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

function App() {
  const scrollRef = useRef<LocomotiveScroll | null>(null);

  useEffect(() => {
    scrollRef.current = new LocomotiveScroll();

    return () => {
      scrollRef.current?.destroy();
    };
  }, []);

  return (
    <main>
      <div data-scroll data-scroll-speed="0.5">
        視差元素
      </div>
    </main>
  );
}
```

### 動態內容處理

```tsx
useEffect(() => {
  // 當內容變更時重新計算
  scrollRef.current?.resize();
}, [dynamicContent]);
```

---

## 📱 響應式處理

### 觸控裝置

預設情況下，`data-scroll-speed` 在觸控裝置上會自動停用以保持原生滾動體驗。

若要在觸控裝置上啟用：
```html
<div data-scroll data-scroll-speed="0.5" data-scroll-enable-touch-speed>
  在所有裝置上都有視差效果
</div>
```

> ⚠️ 注意：在低階行動裝置上可能影響滾動流暢度

---

## 🎨 CSS 動畫範例

### 進入視窗淡入

```css
[data-scroll] {
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

[data-scroll].is-inview {
  opacity: 1;
  transform: translateY(0);
}
```

### 交錯動畫（Stagger）

```css
[data-scroll]:nth-child(1) { transition-delay: 0.1s; }
[data-scroll]:nth-child(2) { transition-delay: 0.2s; }
[data-scroll]:nth-child(3) { transition-delay: 0.3s; }
/* ... */
```

### 從左/右滑入

```css
[data-scroll].from-left {
  transform: translateX(-50px);
}
[data-scroll].from-right {
  transform: translateX(50px);
}
[data-scroll].from-left.is-inview,
[data-scroll].from-right.is-inview {
  transform: translateX(0);
}
```

---

## 🐛 常見問題

### 1. 元素不動畫
- 確認有加 `data-scroll` 屬性
- 確認 CSS 有設定初始狀態和 `.is-inview` 狀態
- 檢查是否有 `overflow: hidden` 影響

### 2. 視差效果抖動
- 降低 `data-scroll-speed` 值
- 確認 `lerp` 值適當（建議 0.1）
- 使用 `will-change: transform` 優化效能

### 3. 動態內容不更新
- 內容變更後呼叫 `scroll.resize()`

### 4. 與其他滾動庫衝突
- 確保只有一個滾動管理器
- 正確設定 `lenisOptions.wrapper`

---

## 📚 資源連結

- [官方文檔](https://scroll.locomotive.ca/docs)
- [GitHub](https://github.com/locomotivemtl/locomotive-scroll)
- [Lenis（底層引擎）](https://github.com/darkroomengineering/lenis)
- [CodeSandbox 範例](https://scroll.locomotive.ca/docs/examples)

---

## 💡 最佳實踐

1. **從小值開始**：`data-scroll-speed` 建議 0.1-0.5
2. **善用 CSS**：優先用 CSS transition + `is-inview` class
3. **效能優先**：觸控裝置預設停用視差是有原因的
4. **漸進增強**：確保沒有 JS 時網站仍可用
5. **測試各裝置**：不同瀏覽器和裝置行為可能不同

---

*最後更新：2026/01/27*
