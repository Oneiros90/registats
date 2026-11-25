<script lang="ts">
  import type { Noble, Suit } from '../types';
  import { FOG_PARTICLES, RANK_LETTERS } from './constants';
  import Icons from './Icons.svelte';

  export let noble: Noble;
  export let active: boolean;
  export let tierIdx: number;
  export let justPurified: boolean;
  export let showSuitPopover: boolean;
  export let availableSuits: Suit[];
  export let onSelectNoble: (id: number) => void;
  export let onSelectSuit: (suit: Suit, e?: MouseEvent) => void;

  $: purified = noble.health <= 0;
  $: low = !purified && noble.health <= 5;
  $: hasSuit = noble.suit !== null;
  $: nobleIsRed = noble.suit === 'hearts' || noble.suit === 'diamonds';
  $: isDiscovered = active || hasSuit || noble.health < noble.maxHealth || noble.attack < noble.maxAttack;
  $: isUndiscovered = !purified && !isDiscovered;
  $: isCorrupted = !purified && isDiscovered;
  $: activeParticles = active ? FOG_PARTICLES.filter((_, idx) => idx % 2 === 0) : FOG_PARTICLES.filter((_, idx) => idx % 6 === 0);
</script>

<div class="noble-slot" class:slot-active={active}>
  <button
    type="button"
    class="noble-btn"
    class:is-active={active}
    class:is-corrupted={isCorrupted}
    class:is-purified={purified}
    class:is-undiscovered={isUndiscovered}
    class:is-low={low}
    class:has-suit={hasSuit}
    class:suit-is-red={hasSuit && nobleIsRed}
    class:suit-is-black={hasSuit && !nobleIsRed}
    class:just-purified={justPurified}
    on:click={() => onSelectNoble(noble.id)}
  >
    <!-- 1) CORRUPTED NOBLE: Zero-Gravity Omnidirectional Black Fog -->
    {#if isCorrupted}
      <span class="corrupted-fog-layer" aria-hidden="true">
        {#each activeParticles as p (p.id)}
          <span
            class="fog-wisp"
            style="left: {p.left}; top: {p.top}; --tx: {p.tx}; --ty: {p.ty}; --delay: {p.delay}; --dur: {p.duration}; --size: {p.size};"
          ></span>
        {/each}
      </span>
    {/if}

    <!-- 2) UNDISCOVERED NOBLE: Classic Playing Card Back Pattern -->
    {#if isUndiscovered}
      <span class="card-back-design" aria-hidden="true">
        <span class="card-back-inner-frame">
          <span class="card-back-medallion">{RANK_LETTERS[noble.rank]}</span>
        </span>
      </span>
    {:else}
      <!-- Discovered Corrupted or Purified Simple White Card Face -->
      <span class="noble-letter">
        {RANK_LETTERS[noble.rank]}
      </span>

      {#if noble.suit}
        <span class="noble-suit-icon">
          <Icons name={noble.suit} />
        </span>
      {/if}
    {/if}

    <!-- Vitality Bar only on alive corrupted nobles -->
    {#if isCorrupted}
      <span class="noble-mini-hp-track">
        <span
          class="noble-mini-hp-fill"
          class:critical={low}
          style="width: {Math.min(100, (noble.health / noble.maxHealth) * 100)}%"
        ></span>
      </span>
    {/if}
  </button>

  <!-- FLOATING SUIT SELECTOR UNDER ACTIVE NOBLE -->
  {#if active && showSuitPopover && availableSuits.length > 0}
    <div
      class="floating-suits-popover"
      class:align-left={noble.tierIndex === 0}
      class:align-right={noble.tierIndex === 3 && tierIdx === 2}
    >
      <div class="floating-suits-arrow"></div>
      {#each availableSuits as suit (suit)}
        {@const isSelected = noble.suit === suit}
        {@const suitRed = suit === 'hearts' || suit === 'diamonds'}
        <button
          type="button"
          class="suit-pill-btn"
          class:suit-red={suitRed}
          class:suit-black={!suitRed}
          class:is-selected={isSelected}
          on:click={(e) => onSelectSuit(suit, e)}
        >
          <span class="suit-pill-symbol">
            <Icons name={suit} />
          </span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .noble-slot {
    position: relative;
    width: 100%;
  }

  .noble-slot.slot-active {
    z-index: 25;
  }

  .noble-btn {
    position: relative;
    width: 100%;
    height: clamp(44px, 13.5dvh, 66px);
    border-radius: 9px;
    background: var(--card-ivory);
    border: 2px solid var(--card-ivory-border);
    box-shadow: 0 4px 0 #090a0c;
    color: var(--card-black);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(3px, 0.45dvw, 6px);
    padding: 2px 4px 6px;
    overflow: hidden;
    transform: translateY(0) scale(1);
    will-change: transform;
    transition:
      transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.25s ease,
      box-shadow 0.3s ease,
      background-color 0.28s ease,
      color 0.25s ease;
  }

  /* 1) UNDISCOVERED NOBLE: Classic Playing Card Back */
  .noble-btn.is-undiscovered {
    background: #f4eee1;
    border: 2px solid #d5c7ad;
    padding: 3px;
  }

  .card-back-design {
    width: 100%;
    height: 100%;
    border-radius: 5px;
    background-color: #7c1722;
    background-image:
      repeating-linear-gradient(
        45deg,
        rgba(245, 235, 215, 0.22) 0px,
        rgba(245, 235, 215, 0.22) 2px,
        transparent 2px,
        transparent 7px
      ),
      repeating-linear-gradient(
        -45deg,
        rgba(245, 235, 215, 0.22) 0px,
        rgba(245, 235, 215, 0.22) 2px,
        transparent 2px,
        transparent 7px
      );
    border: 1.5px solid #520d15;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
  }

  .card-back-inner-frame {
    width: 100%;
    height: 100%;
    border: 1px solid rgba(245, 235, 215, 0.45);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-back-medallion {
    font-family: var(--font-btn);
    font-size: clamp(0.95rem, 3.2dvh, 1.4rem);
    line-height: 1;
    color: rgba(245, 235, 215, 0.72);
    background: rgba(65, 10, 17, 0.82);
    border: 1px solid rgba(245, 235, 215, 0.4);
    border-radius: 50%;
    width: clamp(20px, 4.5dvh, 30px);
    height: clamp(20px, 4.5dvh, 30px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 2) CORRUPTED NOBLE */
  .noble-btn.is-corrupted {
    background: radial-gradient(circle at 50% 50%, #1e112a 0%, #050408 74%);
    border-width: 2px;
    border-color: #4b306a;
    color: #f5efe2;
    box-shadow:
      0 4px 10px rgba(0, 0, 0, 0.85),
      inset 0 0 12px #000000;
    overflow: visible;
  }

  .noble-btn.is-corrupted.suit-is-red {
    color: #ff3850;
    border-color: #961628;
  }

  .noble-btn.is-corrupted.suit-is-black {
    color: #f5efe2;
    border-color: #635478;
  }

  /* 3) ACTIVE SELECTED CORRUPTED NOBLE */
  .noble-btn.is-corrupted.is-active {
    transform: translateY(-2px) scale(1.36);
    border-width: 2.5px;
    border-color: #7c4bb8;
    box-shadow:
      0 12px 24px rgba(0, 0, 0, 0.92),
      inset 0 0 16px #000000;
    z-index: 25;
  }

  .noble-btn.is-corrupted.suit-is-red.is-active {
    border-color: #e01f38;
  }

  .noble-btn.is-corrupted.suit-is-black.is-active {
    border-color: #9e8cb8;
  }

  .corrupted-fog-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: visible;
  }

  .fog-wisp {
    position: absolute;
    width: calc(var(--size, 22px) * 1.35);
    height: calc(var(--size, 22px) * 1.35);
    margin-left: calc(var(--size, 22px) * -0.675);
    margin-top: calc(var(--size, 22px) * -0.675);
    border-radius: 50%;
    /* Soft multi-stop radial gradient requires zero CSS filter:blur() passes on iOS WebKit */
    background: radial-gradient(
      circle,
      rgba(4, 2, 8, 0.92) 0%,
      rgba(22, 9, 38, 0.65) 36%,
      rgba(42, 16, 70, 0.24) 62%,
      rgba(48, 18, 78, 0) 82%
    );
    opacity: 0;
    will-change: transform, opacity;
    animation: zeroGravityFogExpand var(--dur, 1.8s) var(--delay, 0s) ease-out infinite;
  }

  /* 4) PURIFIED (DEFEATED) NOBLE */
  .noble-btn.is-purified {
    background: #ffffff !important;
    border: 2px solid #dcdcdc !important;
    color: var(--card-black) !important;
    box-shadow:
      0 3px 0 rgba(0, 0, 0, 0.35),
      0 0 12px rgba(255, 255, 255, 0.22);
    padding-bottom: 2px;
  }

  .noble-btn.is-purified.suit-is-red {
    color: var(--card-red) !important;
    border-color: rgba(217, 27, 46, 0.55) !important;
  }

  .noble-btn.is-purified.is-active {
    transform: translateY(-2px) scale(1.34);
    border-width: 2.5px !important;
    border-color: #111113 !important;
    box-shadow:
      0 10px 22px rgba(0, 0, 0, 0.55),
      0 0 18px rgba(255, 255, 255, 0.85);
    z-index: 25;
  }

  .noble-btn.is-purified.suit-is-red.is-active {
    border-color: var(--card-red-bright) !important;
    box-shadow:
      0 10px 22px rgba(0, 0, 0, 0.55),
      0 0 22px rgba(217, 27, 46, 0.75);
  }

  .noble-btn.just-purified {
    animation: nobleCardPurifyBurst 0.7s cubic-bezier(0.22, 1, 0.36, 1) both !important;
  }

  .noble-letter {
    position: relative;
    z-index: 2;
    font-family: var(--font-btn);
    font-size: clamp(1.55rem, 5.2dvh, 2.45rem);
    line-height: 1;
    letter-spacing: 0.02em;
  }

  .noble-suit-icon {
    position: relative;
    z-index: 2;
    width: clamp(15px, 3.6dvh, 24px);
    height: clamp(15px, 3.6dvh, 24px);
    flex-shrink: 0;
    animation: suitBadgePop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .noble-mini-hp-track {
    position: absolute;
    bottom: 3px;
    left: 5px;
    right: 5px;
    height: 4px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 99px;
    overflow: hidden;
    z-index: 2;
  }

  .noble-mini-hp-fill {
    display: block;
    height: 100%;
    background: var(--health-color);
    border-radius: 99px;
    transition: width 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .noble-mini-hp-fill.critical {
    background: #ff0022;
    animation: criticalBarBlink 0.45s infinite alternate;
  }

  /* FLOATING SUIT SELECTOR POPOVER */
  .floating-suits-popover {
    position: absolute;
    top: calc(100% + 16px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 60;
    display: flex;
    align-items: center;
    gap: clamp(5px, 0.8dvw, 9px);
    background: rgba(18, 19, 23, 0.96);
    border: 2px solid rgba(245, 239, 226, 0.35);
    box-shadow:
      0 10px 24px rgba(0, 0, 0, 0.88),
      0 4px 0 #07080a;
    border-radius: 12px;
    padding: clamp(4px, 0.9dvh, 7px) clamp(6px, 0.9dvw, 10px);
    backdrop-filter: blur(8px);
    animation: popoverDropIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .floating-suits-popover.align-left {
    left: 0;
    transform: translateX(0);
    animation-name: popoverDropInEdge;
  }

  .floating-suits-popover.align-right {
    left: auto;
    right: 0;
    transform: translateX(0);
    animation-name: popoverDropInEdge;
  }

  .floating-suits-arrow {
    position: absolute;
    top: -7px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 11px;
    height: 11px;
    background: #121317;
    border-left: 2px solid rgba(245, 239, 226, 0.35);
    border-top: 2px solid rgba(245, 239, 226, 0.35);
  }

  .floating-suits-popover.align-left .floating-suits-arrow {
    left: 24px;
  }

  .floating-suits-popover.align-right .floating-suits-arrow {
    left: auto;
    right: 24px;
  }

  .suit-pill-btn {
    position: relative;
    width: clamp(36px, 6.5dvw, 48px);
    height: clamp(36px, 9.5dvh, 48px);
    border-radius: 8px;
    background: var(--card-ivory);
    border: 2px solid var(--card-ivory-border);
    box-shadow: 0 3px 0 #080706;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
      border-color 0.18s ease,
      box-shadow 0.18s ease;
  }

  .suit-pill-btn.suit-red {
    color: var(--card-red);
  }

  .suit-pill-btn.suit-black {
    color: var(--card-black);
  }

  .suit-pill-symbol {
    width: clamp(19px, 4.6dvh, 28px);
    height: clamp(19px, 4.6dvh, 28px);
    display: flex;
  }

  .suit-pill-btn.is-selected {
    transform: translateY(-2px) scale(1.08);
    border-width: 2.5px;
    border-color: var(--card-red-bright);
    box-shadow:
      0 5px 0 #080706,
      0 0 12px rgba(255, 255, 255, 0.55);
  }

  .suit-pill-btn:active {
    transform: translateY(1px) scale(0.94);
  }

  @media (orientation: portrait) {
    .noble-btn {
      height: clamp(38px, 5.2dvh, 48px);
    }

    .noble-btn.is-corrupted.is-active {
      transform: translateY(-1px) scale(1.28);
    }

    .noble-btn.is-purified.is-active {
      transform: translateY(-1px) scale(1.26);
    }
  }

  @media (orientation: landscape) and (max-height: 430px) {
    .noble-btn {
      height: clamp(36px, 12.5dvh, 46px);
      min-height: clamp(36px, 12.5dvh, 46px);
    }

    .suit-pill-btn {
      width: 34px;
      height: 34px;
    }
  }

  @keyframes zeroGravityFogExpand {
    0% {
      opacity: 0;
      transform: translate3d(0, 0, 0) scale(0.45);
    }
    35% {
      opacity: 0.95;
      transform: translate3d(calc(var(--tx, 16px) * 0.48), calc(var(--ty, 16px) * 0.48), 0) scale(1.25);
    }
    100% {
      opacity: 0;
      transform: translate3d(var(--tx, 16px), var(--ty, 16px), 0) scale(1.85);
    }
  }

  @keyframes popoverDropIn {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(-8px) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  @keyframes popoverDropInEdge {
    0% {
      opacity: 0;
      transform: translateY(-8px) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes suitBadgePop {
    0% { transform: scale(0) rotate(-25deg); opacity: 0; }
    75% { transform: scale(1.18) rotate(5deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  @keyframes criticalBarBlink {
    0% { opacity: 0.5; }
    100% { opacity: 1; }
  }

  @keyframes nobleCardPurifyBurst {
    0% { transform: scale3d(1.28, 1.28, 1); }
    50% { transform: scale3d(0.95, 0.95, 1); }
    100% { transform: scale3d(1, 1, 1); }
  }
</style>
