<script lang="ts">
  import type { Suit, Rank } from '../types';

  export let rank: Rank = 'jack';
  export let suit: Suit | null = null;
  export let isPurified: boolean = false;
  export let isLowHealth: boolean = false;

  $: isRedSuit = suit === 'hearts' || suit === 'diamonds';
  $: isBlackSuit = suit === 'clubs' || suit === 'spades';

  // Reusable SVG path centered at (0, 0) within a ~32x32 box for the chosen suit
  const SUIT_PATHS: Record<Suit, string> = {
    hearts:
      'M 0 13 C 0 13 -13 4 -13 -5.5 C -13 -10.5 -9 -13.5 -5 -13.5 C -2.2 -13.5 -0.6 -11.8 0 -9.8 C 0.6 -11.8 2.2 -13.5 5 -13.5 C 9 -13.5 13 -10.5 13 -5.5 C 13 4 0 13 0 13 Z',
    diamonds:
      'M 0 -14 C 3 -8 7.5 -3.5 13 0 C 7.5 3.5 3 8 0 14 C -3 8 -7.5 3.5 -13 0 C -7.5 -3.5 -3 -8 0 -14 Z',
    clubs:
      'M 0 -14 C -3.8 -14 -6.8 -11 -6.8 -7.2 C -6.8 -5.4 -6 -3.8 -4.8 -2.7 C -5.9 -3.1 -7.1 -3.4 -8.4 -3.4 C -12.2 -3.4 -15.2 -0.4 -15.2 3.4 C -15.2 7.2 -12.2 10.2 -8.4 10.2 C -5.5 10.2 -3 8.4 -2 5.8 L -5 14.5 H 5 L 2 5.8 C 3 8.4 5.5 10.2 8.4 10.2 C 12.2 10.2 15.2 7.2 15.2 3.4 C 15.2 -0.4 12.2 -3.4 8.4 -3.4 C 7.1 -3.4 5.9 -3.1 4.8 -2.7 C 6 -3.8 6.8 -5.4 6.8 -7.2 C 6.8 -11 3.8 -14 0 -14 Z',
    spades:
      'M 0 -14 C 0 -14 -13 -3.5 -13 4.5 C -13 8.6 -9.8 11.5 -6 11.5 C -3.8 11.5 -2 10.3 -1.2 8.7 L -4.8 15 H 4.8 L 1.2 8.7 C 2 10.3 3.8 11.5 6 11.5 C 9.8 11.5 13 8.6 13 4.5 C 13 -3.5 0 -14 0 -14 Z'
  };
</script>

<div
  class="noble-backdrop"
  class:rank-jack={rank === 'jack'}
  class:rank-queen={rank === 'queen'}
  class:rank-king={rank === 'king'}
  class:accent-red={isRedSuit}
  class:accent-black={isBlackSuit}
  class:accent-neutral={suit === null}
  class:state-purified={isPurified}
  class:accent-low-hp={isLowHealth && !isPurified}
  aria-hidden="true"
>
  <!-- =========================================================================
       1) JACKS: THE GARRISON ARMORY
       ========================================================================= -->
  {#if rank === 'jack'}
    <div class="scrolling-pattern-layer speed-jack">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="jack-pattern" width="160" height="160" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
            <!-- Stone Masonry Grid -->
            <rect x="2" y="2" width="156" height="156" fill="none" class="bg-grid-line" />
            <path d="M0 80 H160 M80 0 V160" class="bg-grid-faint" />

            <!-- Cracked Stone Hairlines -->
            <path d="M12 18 L28 36 L22 52 M140 120 L124 135 L132 150" fill="none" class="corruption-crack-1" />

            <!-- Crossed Halberds / Pikes behind Knight Shield -->
            <path d="M30 130 L130 30 M30 30 L130 130" class="emblem-stroke-bold" />
            <path d="M118 24 C132 20 138 30 126 42 L114 34 Z" class="emblem-fill-faint" />
            <path d="M42 24 C28 20 22 30 34 42 L46 34 Z" class="emblem-fill-faint" />

            <!-- Visored Knight Helmet in Center -->
            <path
              d="M54 70 C54 50 65 42 80 42 C95 42 106 50 106 70 V102 L80 120 L54 102 Z"
              class="emblem-fill-dark"
            />
            <path
              d="M54 70 C54 50 65 42 80 42 C95 42 106 50 106 70 V102 L80 120 L54 102 Z"
              fill="none"
              class="emblem-stroke-main"
            />
            <!-- Helmet Visor Slits -->
            <path d="M60 76 L76 81 M100 76 L84 81" class="accent-glow-stroke" />
            <path d="M80 82 V118" class="emblem-stroke-faint" />

            <!-- Chosen Suit Symbol clearly emblazoned on the Knight's Helmet Crest & Corner Shield -->
            {#if suit}
              <path d={SUIT_PATHS[suit]} transform="translate(80, 61) scale(0.95)" class="accent-fill-glow" />
              <path d={SUIT_PATHS[suit]} transform="translate(80, 140) scale(0.65)" class="accent-fill-subtle" />
            {/if}

            <!-- Corner Rings -->
            <circle cx="0" cy="0" r="10" fill="none" class="emblem-stroke-faint" />
            <circle cx="160" cy="0" r="10" fill="none" class="emblem-stroke-faint" />
            <circle cx="0" cy="160" r="10" fill="none" class="emblem-stroke-faint" />
            <circle cx="160" cy="160" r="10" fill="none" class="emblem-stroke-faint" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#jack-pattern)" />
      </svg>
    </div>

  <!-- =========================================================================
       2) QUEENS: THE BRIER SANCTUM
       ========================================================================= -->
  {:else if rank === 'queen'}
    <div class="scrolling-pattern-layer speed-queen">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="queen-pattern" width="180" height="180" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
            <!-- Gothic Cathedral Arch & Vines -->
            <path
              d="M15 170 V78 C15 36 90 10 90 10 C90 10 165 36 165 78 V170"
              fill="none"
              class="emblem-stroke-faint"
            />
            <path
              d="M15 140 C38 118 22 86 48 62 C72 40 108 40 132 62 C158 86 142 118 165 140"
              fill="none"
              class="corruption-crack-2"
            />

            <!-- Queen's Pointed Tiara / Coronet -->
            <path
              d="M42 108 L52 62 L73 84 L90 46 L107 84 L128 62 L138 108 Z"
              class="emblem-fill-dark"
            />
            <path
              d="M42 108 L52 62 L73 84 L90 46 L107 84 L128 62 L138 108 Z"
              fill="none"
              class="emblem-stroke-main"
            />

            <!-- Chosen Suit Symbol clearly embedded inside the Queen's Tiara & Tips -->
            {#if suit}
              <path d={SUIT_PATHS[suit]} transform="translate(90, 88) scale(1.05)" class="accent-fill-glow" />
              <path d={SUIT_PATHS[suit]} transform="translate(90, 34) scale(0.55)" class="accent-fill-glow" />
              <path d={SUIT_PATHS[suit]} transform="translate(50, 51) scale(0.45)" class="accent-fill-subtle" />
              <path d={SUIT_PATHS[suit]} transform="translate(130, 51) scale(0.45)" class="accent-fill-subtle" />
            {/if}

            <!-- Ritual Chalice below Tiara -->
            <path
              d="M68 122 C68 138 90 144 90 144 C90 144 112 138 112 122 Z M90 144 V164 M74 164 H106"
              fill="none"
              class="emblem-stroke-main"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#queen-pattern)" />
      </svg>
    </div>

  <!-- =========================================================================
       3) KINGS: THE THRONE ROOM
       ========================================================================= -->
  {:else}
    <div class="scrolling-pattern-layer speed-king">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="king-pattern" width="210" height="210" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
            <!-- Floor Fissures / Tracery -->
            <path
              d="M0 105 L45 88 L72 115 L105 95 L142 122 L175 96 L210 105"
              fill="none"
              class="corruption-crack-3"
            />
            <path
              d="M105 0 L92 48 L118 76 L105 125 L88 168 L105 210"
              fill="none"
              class="corruption-crack-3"
            />

            <!-- Towering Throne Backrest -->
            <path
              d="M48 186 V56 L68 26 L86 62 L105 16 L124 62 L142 26 L162 56 V186 Z"
              class="emblem-fill-dark"
            />
            <path
              d="M48 186 V56 L68 26 L86 62 L105 16 L124 62 L142 26 L162 56 V186 M32 150 H178 M40 186 H170"
              fill="none"
              class="emblem-stroke-main"
            />

            <!-- Grand Imperial Crown on the Throne -->
            <path
              d="M52 140 L44 82 L78 106 L105 60 L132 106 L166 82 L158 140 Z"
              class="emblem-fill-crown"
            />
            <path
              d="M52 140 L44 82 L78 106 L105 60 L132 106 L166 82 L158 140 Z"
              fill="none"
              class="accent-glow-stroke"
            />

            <!-- Chosen Suit Symbol prominently set inside the King's Crown & on the Crown Tips -->
            {#if suit}
              <path d={SUIT_PATHS[suit]} transform="translate(105, 114) scale(1.35)" class="accent-fill-glow" />
              <path d={SUIT_PATHS[suit]} transform="translate(105, 45) scale(0.62)" class="accent-fill-glow" />
              <path d={SUIT_PATHS[suit]} transform="translate(44, 68) scale(0.5)" class="accent-fill-subtle" />
              <path d={SUIT_PATHS[suit]} transform="translate(166, 68) scale(0.5)" class="accent-fill-subtle" />
              <path d={SUIT_PATHS[suit]} transform="translate(72, 166) scale(0.55)" class="accent-fill-subtle" />
              <path d={SUIT_PATHS[suit]} transform="translate(138, 166) scale(0.55)" class="accent-fill-subtle" />
            {/if}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#king-pattern)" />
      </svg>
    </div>
  {/if}

  <!-- Ambient Vignette -->
  <div class="corruption-vignette"></div>
</div>

<style>
  .noble-backdrop {
    position: fixed;
    top: calc(-1 * env(safe-area-inset-top, 0px));
    left: calc(-1 * env(safe-area-inset-left, 0px));
    right: calc(-1 * env(safe-area-inset-right, 0px));
    bottom: calc(-1 * env(safe-area-inset-bottom, 0px));
    width: calc(100vw + env(safe-area-inset-left, 0px) + env(safe-area-inset-right, 0px));
    height: calc(100lvh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px));
    min-height: calc(100vh + env(safe-area-inset-bottom, 0px));
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    /* Default Neutral Accents (Sober antique gold/brass) */
    --accent-stroke: rgba(215, 180, 105, 0.32);
    --accent-fill: rgba(215, 180, 105, 0.38);
    --accent-faint: rgba(215, 180, 105, 0.16);
    --accent-aura: rgba(215, 180, 105, 0.08);
    transition:
      background-color 0.45s ease,
      box-shadow 0.45s ease;
  }

  /* ==========================================================================
     CORRUPTED (DARK) PALETTES BY RANK
     ========================================================================== */
  .noble-backdrop.rank-jack {
    background-color: #131519;
    --base-line: rgba(235, 228, 215, 0.075);
    --base-faint: rgba(235, 228, 215, 0.038);
    --dark-fill: rgba(10, 11, 14, 0.72);
    --vignette-spread: 55%;
    --vignette-dark: rgba(4, 5, 7, 0.78);
  }

  .noble-backdrop.rank-queen {
    background-color: #0e0c12;
    --base-line: rgba(235, 225, 228, 0.088);
    --base-faint: rgba(235, 225, 228, 0.042);
    --dark-fill: rgba(7, 5, 10, 0.78);
    --vignette-spread: 44%;
    --vignette-dark: rgba(3, 2, 6, 0.88);
  }

  .noble-backdrop.rank-king {
    background-color: #08070a;
    --base-line: rgba(240, 230, 225, 0.1);
    --base-faint: rgba(240, 230, 225, 0.048);
    --dark-fill: rgba(4, 3, 6, 0.86);
    --vignette-spread: 34%;
    --vignette-dark: rgba(0, 0, 0, 0.94);
  }

  /* Suit Accents on Dark Corrupted Backgrounds */
  .noble-backdrop.accent-red {
    --accent-stroke: rgba(225, 32, 54, 0.52);
    --accent-fill: rgba(238, 38, 62, 0.65);
    --accent-faint: rgba(225, 32, 54, 0.28);
    --accent-aura: rgba(217, 27, 46, 0.14);
  }

  .noble-backdrop.accent-black {
    --accent-stroke: rgba(238, 232, 218, 0.42);
    --accent-fill: rgba(245, 239, 226, 0.52);
    --accent-faint: rgba(238, 232, 218, 0.22);
    --accent-aura: rgba(235, 228, 215, 0.09);
  }

  /* ==========================================================================
     PURIFIED (LIGHT) PALETTES BY RANK — Keeping Suit & Accent!
     ========================================================================== */
  .noble-backdrop.state-purified.rank-jack {
    background-color: #ece6da;
    --base-line: rgba(55, 48, 38, 0.15);
    --base-faint: rgba(55, 48, 38, 0.08);
    --dark-fill: rgba(255, 252, 245, 0.82);
    --vignette-spread: 58%;
    --vignette-dark: rgba(185, 172, 148, 0.45);
  }

  .noble-backdrop.state-purified.rank-queen {
    background-color: #e8e0d2;
    --base-line: rgba(55, 45, 38, 0.16);
    --base-faint: rgba(55, 45, 38, 0.085);
    --dark-fill: rgba(255, 252, 245, 0.85);
    --vignette-spread: 54%;
    --vignette-dark: rgba(175, 160, 136, 0.5);
  }

  .noble-backdrop.state-purified.rank-king {
    background-color: #e4dac8;
    --base-line: rgba(50, 40, 30, 0.18);
    --base-faint: rgba(50, 40, 30, 0.09);
    --dark-fill: rgba(255, 252, 245, 0.88);
    --vignette-spread: 50%;
    --vignette-dark: rgba(165, 148, 120, 0.55);
  }

  /* Suit Accents on Light Purified Backgrounds (Keeping Red for ♥/♦ and Black for ♣/♠!) */
  .noble-backdrop.state-purified.accent-neutral {
    --accent-stroke: rgba(180, 134, 36, 0.55);
    --accent-fill: rgba(196, 146, 38, 0.65);
    --accent-faint: rgba(180, 134, 36, 0.3);
    --accent-aura: rgba(255, 225, 140, 0.35);
  }

  .noble-backdrop.state-purified.accent-red {
    --accent-stroke: rgba(217, 27, 46, 0.65);
    --accent-fill: rgba(217, 27, 46, 0.78);
    --accent-faint: rgba(217, 27, 46, 0.38);
    --accent-aura: rgba(217, 27, 46, 0.16);
  }

  .noble-backdrop.state-purified.accent-black {
    --accent-stroke: rgba(24, 24, 28, 0.62);
    --accent-fill: rgba(18, 18, 22, 0.76);
    --accent-faint: rgba(24, 24, 28, 0.36);
    --accent-aura: rgba(30, 30, 36, 0.12);
  }

  /* Slow Diagonal Scrolling Pattern Layer */
  .scrolling-pattern-layer {
    position: absolute;
    inset: -220px;
    width: calc(100% + 440px);
    height: calc(100% + 440px);
  }

  .speed-jack {
    animation: driftJack 36s linear infinite;
  }

  .speed-queen {
    animation: driftQueen 32s linear infinite;
  }

  .speed-king {
    animation: driftKing 26s linear infinite;
  }

  /* SVG Pattern Classes */
  .bg-grid-line {
    stroke: var(--base-faint);
    stroke-width: 1.5;
    transition: stroke 0.45s ease;
  }

  .bg-grid-faint {
    stroke: var(--base-faint);
    stroke-width: 1;
    stroke-dasharray: 6 6;
    transition: stroke 0.45s ease;
  }

  .emblem-stroke-main {
    stroke: var(--base-line);
    stroke-width: 2;
    transition: stroke 0.45s ease;
  }

  .emblem-stroke-bold {
    stroke: var(--base-line);
    stroke-width: 3;
    stroke-linecap: round;
    transition: stroke 0.45s ease;
  }

  .emblem-stroke-faint {
    stroke: var(--base-faint);
    stroke-width: 1.5;
    transition: stroke 0.45s ease;
  }

  .emblem-fill-dark {
    fill: var(--dark-fill);
    transition: fill 0.45s ease;
  }

  .emblem-fill-faint {
    fill: var(--base-line);
    transition: fill 0.45s ease;
  }

  .emblem-fill-crown {
    fill: var(--dark-fill);
    transition: fill 0.45s ease;
  }

  .corruption-crack-1 {
    stroke: var(--accent-faint);
    stroke-width: 1.5;
    stroke-linecap: round;
    transition: stroke 0.45s ease;
  }

  .corruption-crack-2 {
    stroke: var(--accent-stroke);
    stroke-width: 1.8;
    stroke-dasharray: 12 4;
    transition: stroke 0.45s ease;
  }

  .corruption-crack-3 {
    stroke: var(--accent-stroke);
    stroke-width: 2.2;
    transition: stroke 0.45s ease;
  }

  .accent-glow-stroke {
    stroke: var(--accent-stroke);
    stroke-width: 2.2;
    stroke-linecap: round;
    transition: stroke 0.45s ease;
  }

  .accent-fill-glow {
    fill: var(--accent-fill);
    transition: fill 0.45s ease;
  }

  .accent-fill-subtle {
    fill: var(--accent-faint);
    transition: fill 0.45s ease;
  }

  /* Vignette */
  .corruption-vignette {
    position: absolute;
    inset: 0;
    z-index: 2;
    background:
      radial-gradient(circle at 50% 15%, var(--accent-aura) 0%, transparent 55%),
      radial-gradient(circle at 50% 54%, transparent var(--vignette-spread), var(--vignette-dark) 100%);
    transition: background 0.45s ease, box-shadow 0.45s ease;
  }

  .noble-backdrop:not(.state-purified).rank-queen .corruption-vignette {
    box-shadow: inset 0 0 65px 14px rgba(0, 0, 0, 0.78);
  }

  .noble-backdrop:not(.state-purified).rank-king .corruption-vignette {
    box-shadow:
      inset 0 0 110px 32px rgba(0, 0, 0, 0.92),
      inset 0 0 40px 6px var(--accent-faint);
  }

  @keyframes driftJack {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-160px, -160px, 0); }
  }

  @keyframes driftQueen {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-180px, -180px, 0); }
  }

  @keyframes driftKing {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-210px, -210px, 0); }
  }
</style>
