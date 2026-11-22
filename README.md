<div align="center">

# 👑 REGISTATS ⚔️

### **The Tactical Dark-Medieval Companion App for Regicide**

[![Svelte 5](https://img.shields.io/badge/Svelte_5-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Mobile PWA Ready](https://img.shields.io/badge/Mobile_PWA-Safe--Area_Ready-22e66b?style=for-the-badge&logo=apple&logoColor=white)](#)

<p align="center">
  <em>Purify the 12 corrupted monarchs. Track Vitality & Attack from across the table with zero localization clutter—only bold gothic numerals, visceral card physics, and dark medieval atmosphere.</em>
</p>

[🌐 **Author Website (lorenzo.valente.my)**](https://lorenzo.valente.my) &nbsp;•&nbsp; [🐙 **GitHub Repository**](https://github.com/Oneiros90/registats)

</div>

---

## ✨ Highlights & Design Philosophy

**Registats** is purpose-built to sit at the center of your gaming table on a phone in **Landscape** (or **Portrait**) mode during a session of the cooperative card game **Regicide**.

- **🪧 Zero-Text Gameplay Interface**: Outside the title bar and system menu, the entire battlefield uses pure universal iconography and numbers—no localization needed.
- **🃏 Three Card States in the Royal Deck**:
  - **Undiscovered Nobles**: Displayed face-down with an authentic French playing-card lattice back and rank medallion (`J`, `Q`, `K`).
  - **Active Corrupted Monarch**: Scales up prominently (`1.22x`) and erupts with an abyssal **Black Fog & Dark Miasma particle system** swirling around the card.
  - **Purified Monarchs**: Defeating a noble liberates them from corruption so they can join your Tavern deck—triggering a radiant **Sacred Purification** burst and transforming their card into a clean white playing card (preserving classic **Red** for `♥` / `♦` and **Black** for `♣` / `♠`).
- **🧠 Smart Suit Exclusivity & Auto-Assignment**:
  - Suits (`♥`, `♦`, `♣`, `♠`) are mutually exclusive within each royal tier (4 Jacks, 4 Queens, 4 Kings).
  - A floating popover appears directly beneath the active noble showing **only the remaining available suits**, and hides automatically once selected.
  - **4th Noble Auto-Deduction**: When the 4th noble of a tier is activated and the previous 3 already have their suits assigned, **Registats** automatically assigns the last remaining suit and skips the popover.
- **🏰 Three Progressively Corrupted Dynamic Backgrounds**:
  - **Stage I — Jacks (`J`)**: *The Corrupted Garrison* — crossed halberds, visored knight helms, dungeon chains, and the first fractures of corruption.
  - **Stage II — Queens (`Q`)**: *The Cursed Brier Sanctum* — gothic cathedral arches strangled by thorny vines, wicked pointed tiaras, and ritual chalices.
  - **Stage III — Kings (`K`)**: *The Abyssal Throne Room* — pitch-black void fissures, towering spiked iron thrones, and corrupted imperial crowns dynamically inlaid with the active monarch's suit (`♥`, `♦`, `♣`, `♠`).
- **🩸 Critical Low-Health (`≤ 5` HP) Bleeding Frame**:
  - When a monarch drops to **5 Health or below**, the entire viewport throbs with an accelerating heartbeat and a crimson **blood-bleed border vignette**.
- **🎯 Fixed-Geometry Giant Touch Controls**:
  - **Tap** `−` or `+` to step by **`±1`**; **Hold** `−` or `+` to step rapidly by **`±5`**.
  - The center Gothic numeral slot has a strictly locked width so the oversized `−` and `+` touch zones **never shift position** when crossing between 2-digit (`20`, `10`) and 1-digit (`9`, `0`) values.
- **📱 iOS & Android Home Screen Web App Ready**:
  - Built with full-bleed fixed viewport geometry and CSS `env(safe-area-inset-*)` padding so buttons never hide beneath iPhone rounded corners/Dynamic Island in landscape and never leave an empty bar at the bottom in portrait.
  - Automatic **`localStorage` persistence** preserves your game state across reloads.

---

## 📊 Regicide Royal Stats Reference

| Royal Tier | Count | Default Health (🟢) | Default Attack (🔴) | Background Stage |
| :--- | :---: | :---: | :---: | :--- |
| **Jack (`J`)** | 4 (`♥ ♦ ♣ ♠`) | **20** | **10** | *I. The Corrupted Garrison* |
| **Queen (`Q`)** | 4 (`♥ ♦ ♣ ♠`) | **30** | **15** | *II. The Cursed Brier Sanctum* |
| **King (`K`)** | 4 (`♥ ♦ ♣ ♠`) | **40** | **20** | *III. The Abyssal Throne Room* |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 18`
- **npm** or **pnpm**

### Installation & Local Development

```bash
# Clone the repository
git clone https://github.com/Oneiros90/registats.git
cd registats

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Type-Checking & Production Build

```bash
# Run Svelte & TypeScript diagnostics
npm run check

# Build optimized production bundle into /dist
npm run build
```

---

## 👤 Author & Links

Crafted by **Lorenzo Valente**

- 🌐 **Website**: [lorenzo.valente.my](https://lorenzo.valente.my)
- 💻 **GitHub**: [github.com/Oneiros90/registats](https://github.com/Oneiros90/registats)

