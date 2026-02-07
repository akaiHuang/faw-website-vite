# FAW Website (Vite Edition)

### AI-Collaborative Brand Experience

The Universal FAW Labs brand site -- a high-performance web experience built on Vite, powered by real-time shader-based generative visuals, Three.js 3D scenes, and smooth scroll-driven animations. This is where brand strategy meets creative technology: a living demonstration of what the studio builds for clients, built as a client experience itself.

> **Note on AI Collaboration**: This project was co-designed with AI -- after analyzing the creator's technical capabilities and brand strategy needs, AI recommended this as an optimal approach to rapid deployment. Currently in active development.

## 📋 Quick Summary

> ⚡ **FAW Website (Vite Edition)** 是 Universal FAW Labs 的品牌官網，以 Vite 7 為建構工具打造的高效能網頁體驗。🎨 核心視覺採用 ShaderGradient 即時 GPU 渲染的生成式漸層背景，搭配 Three.js 的 3D 圓柱網格與粒子系統，創造出具深度與維度感的頁面體驗。🎯 獨特的受眾自適應內容系統——根據訪客身份（廣告代理商或品牌方）動態呈現不同的能力展示與價值主張。🔧 內建互動式 Shader 編輯器，可即時調整生成式背景參數。🌊 整合 Locomotive Scroll 實現動量式平滑捲動與滾動觸發動畫。🛠️ 技術棧包含 React 19、TypeScript、React Three Fiber、GSAP、Tailwind CSS 4、Firebase 後端與 Cloud Functions。🤖 專案由 AI 協作設計，從技術能力分析到品牌策略需求，展現 AI 輔助快速部署的最佳實踐。適合需要展示創意科技實力的品牌網站場景。

---

## 💡 Why This Exists

A creative technology studio's website is its most important proof of concept. It cannot simply describe capabilities -- it must demonstrate them. This site merges shader-based generative backgrounds, interactive 3D elements, and narrative-driven content to create a brand experience that communicates FAW Labs' value proposition through the medium itself.

The site addresses two distinct audiences -- agencies seeking an AI growth engine, and brands seeking direct creative technology partnerships -- with tailored capability presentations for each.

---

## 🏗️ Architecture

```
faw-website-vite/
  src/
    App.tsx                     -- Main application (audience-adaptive content, navigation, contact)
    Admin.tsx                   -- Admin dashboard
    main.tsx                    -- Entry point
    index.css                   -- Global styles
    components/
      ShaderBackground.tsx      -- ShaderGradient-powered generative background
      ThreeBackground.tsx       -- Three.js 3D scene background
      CylinderGrid.tsx          -- 3D cylinder grid visual element
      ui.tsx                    -- Shared UI (LoadingScreen, TransitionOverlay, SplitText, etc.)
      editor/                   -- Visual editor components
    pages/
      ShaderEditor.tsx          -- Interactive shader parameter editor
    config/                     -- App configuration
    context/                    -- React context providers
    lib/
      firebase.ts               -- Firebase auth, Firestore, contact form submission
    assets/                     -- Static assets
  functions/                    -- Firebase Cloud Functions (serverless backend)
  public/                       -- Public static files
  docs/                         -- Project documentation
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite 7 |
| Framework | React 19 with TypeScript |
| 3D Engine | Three.js via React Three Fiber + Drei |
| Shader Visuals | ShaderGradient |
| Animation | GSAP, Locomotive Scroll |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Backend | Firebase (Auth, Firestore, Cloud Functions) |
| Icons | Lucide React |

---

## 🚀 Key Features

**Generative Shader Backgrounds** -- Real-time GPU-rendered gradient backgrounds using the ShaderGradient library, creating organic, evolving visual environments that respond to scroll position and user interaction.

**Three.js Visual Elements** -- 3D cylinder grids, particle systems, and scene compositions rendered via React Three Fiber, providing depth and dimensionality to the page experience.

**Audience-Adaptive Content** -- The site dynamically presents different capability sets depending on whether the visitor identifies as an agency or a brand, with tailored messaging, benefit frameworks, and case positioning for each.

**Interactive Shader Editor** -- A built-in tool for real-time shader parameter manipulation, allowing live visual exploration of generative backgrounds.

**Smooth Scroll Architecture** -- Locomotive Scroll integration for momentum-based, section-snapping navigation with scroll-triggered animations.

---

## 🏁 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type-check and build for production
npm run build

# Preview production build
npm run preview
```

---

## 👤 Author

**Huang Akai (Kai)**
Founder @ Universal FAW Labs | Creative Technologist | Ex-Ogilvy | 15+ years experience
