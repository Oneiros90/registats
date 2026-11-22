<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { FloatingDelta } from '../types';
  import Icons from './Icons.svelte';

  export let type: 'health' | 'attack';
  export let value: number;
  export let maxValue: number;
  export let isPurified: boolean = false;
  export let isLowHealth: boolean = false;
  export let isPurifyingAnimation: boolean = false;
  export let hideButtons: boolean = false;
  export let bump: 'up' | 'down' | null = null;
  export let deltas: FloatingDelta[] = [];
  export let onChange: (delta: number) => void;

  let holdTimeout: ReturnType<typeof setTimeout> | null = null;
  let holdInterval: ReturnType<typeof setInterval> | null = null;
  let activeHold: { dir: 1 | -1; triggeredFive: boolean } | null = null;

  $: minusDisabled = value <= 0 || isPurifyingAnimation || hideButtons;
  $: plusDisabled = value >= maxValue || isPurifyingAnimation || hideButtons;
  $: fillPercent = Math.min(100, (value / maxValue) * 100);

  function onStepPointerDown(dir: 1 | -1, e: PointerEvent) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    cancelHold();

    activeHold = { dir, triggeredFive: false };

    holdTimeout = setTimeout(() => {
      if (!activeHold) return;
      activeHold.triggeredFive = true;
      onChange(dir * 5);

      holdInterval = setInterval(() => {
        onChange(dir * 5);
      }, 420);
    }, 320);
  }

  function onStepPointerUp() {
    if (activeHold && !activeHold.triggeredFive) {
      onChange(activeHold.dir * 1);
    }
    cancelHold();
  }

  function cancelHold() {
    if (holdTimeout) {
      clearTimeout(holdTimeout);
      holdTimeout = null;
    }
    if (holdInterval) {
      clearInterval(holdInterval);
      holdInterval = null;
    }
    activeHold = null;
  }

  onDestroy(() => {
    cancelHold();
  });
</script>

<section
  class="stat-zone"
  class:health-zone={type === 'health'}
  class:attack-zone={type === 'attack'}
  class:is-low={type === 'health' && isLowHealth}
  class:is-purified={isPurified}
>
  <div class="fixed-counter-row">
    <button
      type="button"
      class="step-btn minus-btn"
      class:health-step={type === 'health'}
      class:attack-step={type === 'attack'}
      class:hidden-when-purified={hideButtons}
      disabled={minusDisabled}
      on:pointerdown={(e) => onStepPointerDown(-1, e)}
      on:pointerup={onStepPointerUp}
      on:pointerleave={cancelHold}
      on:pointercancel={cancelHold}
    >
      <span class="step-btn-face">−</span>
    </button>

    <div class="fixed-number-slot">
      <div
        class="giant-number"
        class:health-number={type === 'health'}
        class:attack-number={type === 'attack'}
        class:bump-up={bump === 'up'}
        class:bump-down={bump === 'down'}
      >
        {value}
      </div>

      {#each deltas as delta (delta.id)}
        <span
          class="floating-delta"
          class:positive={delta.value > 0}
          class:negative={delta.value < 0}
          style="--x-offset: {delta.xOffset}px;"
        >
          {delta.value > 0 ? `+${delta.value}` : delta.value}
        </span>
      {/each}
    </div>

    <button
      type="button"
      class="step-btn plus-btn"
      class:health-step={type === 'health'}
      class:attack-step={type === 'attack'}
      class:hidden-when-purified={hideButtons}
      disabled={plusDisabled}
      on:pointerdown={(e) => onStepPointerDown(1, e)}
      on:pointerup={onStepPointerUp}
      on:pointerleave={cancelHold}
      on:pointercancel={cancelHold}
    >
      <span class="step-btn-face">+</span>
    </button>
  </div>

  <!-- Bottom Bar Row: Stat Symbol right next to its Progress Bar -->
  <div class="stat-bar-row">
    <div
      class="bar-side-icon"
      class:health-side-icon={type === 'health'}
      class:attack-side-icon={type === 'attack'}
      class:heartbeat={type === 'health' && isLowHealth}
    >
      {#if type === 'health' && isPurified}
        <Icons name="purify" />
      {:else}
        <Icons name={type} />
      {/if}
    </div>
    <div
      class="stat-progress-track"
      class:health-track={type === 'health'}
      class:attack-track={type === 'attack'}
    >
      <div
        class="stat-progress-fill"
        class:health-fill={type === 'health'}
        class:attack-fill={type === 'attack'}
        class:critical={type === 'health' && isLowHealth}
        style="width: {fillPercent}%"
      ></div>
    </div>
  </div>
</section>

<style>
  .stat-zone {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    display: grid;
    grid-template-rows: 1fr auto;
    align-items: center;
    justify-items: center;
    padding: clamp(4px, 1.2dvh, 14px) 0 clamp(6px, 2dvh, 22px);
  }

  .fixed-counter-row {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr clamp(185px, 27dvw, 380px) 1fr;
    align-items: center;
    justify-items: center;
    gap: 0px;
  }

  .fixed-number-slot {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .giant-number {
    font-family: var(--font-gothic-num);
    font-weight: 400;
    font-size: clamp(13.5rem, 70dvh, 35rem);
    line-height: 0.74;
    font-variant-numeric: tabular-nums;
    text-align: center;
    white-space: nowrap;
    transition:
      transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1),
      color 0.2s ease,
      text-shadow 0.3s ease;
  }

  .health-number {
    color: var(--health-color);
    text-shadow:
      0 3px 0 #e2ffec,
      0 12px 0 #042912,
      0 20px 38px rgba(0, 0, 0, 0.88),
      0 0 36px var(--health-glow);
  }

  .attack-number {
    color: var(--attack-color);
    text-shadow:
      0 3px 0 #ffe6ea,
      0 12px 0 #2e040b,
      0 20px 38px rgba(0, 0, 0, 0.88),
      0 0 36px var(--attack-glow);
  }

  .stat-zone.is-purified .health-number {
    color: #16b850;
    text-shadow:
      0 2px 0 #ffffff,
      0 8px 0 #083d1b,
      0 14px 24px rgba(0, 0, 0, 0.32);
  }

  .stat-zone.is-purified .attack-number {
    color: #d91b2e;
    text-shadow:
      0 2px 0 #ffffff,
      0 8px 0 #42060c,
      0 14px 24px rgba(0, 0, 0, 0.32);
  }

  .giant-number.bump-up {
    animation: numberPopUp 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .giant-number.bump-down {
    animation: numberPopDown 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* Floating Delta Popups in Gothic Font — Always above everything including noble buttons */
  .floating-delta {
    position: absolute;
    top: 2%;
    left: calc(50% + var(--x-offset, 0px));
    transform: translateX(-50%);
    font-family: var(--font-gothic-num);
    font-size: clamp(2.6rem, 12vmin, 5.2rem);
    pointer-events: none;
    z-index: 95;
    text-shadow: 0 4px 0 #000;
    animation: deltaFloatAway 0.72s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .floating-delta.positive {
    color: var(--health-color);
  }

  .floating-delta.negative {
    color: var(--attack-color);
  }

  .step-btn {
    position: relative;
    z-index: 5;
    width: 100%;
    height: 100%;
    min-height: clamp(130px, 54dvh, 320px);
    background: transparent;
    border: none;
    box-shadow: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      transform 0.1s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.2s ease;
  }

  .step-btn.hidden-when-purified {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
  }

  .step-btn.minus-btn {
    justify-content: flex-end;
    padding-right: clamp(4px, 0.8dvw, 14px);
  }

  .step-btn.plus-btn {
    justify-content: flex-start;
    padding-left: clamp(4px, 0.8dvw, 14px);
  }

  .step-btn-face {
    font-family: var(--font-btn);
    font-size: clamp(6rem, 22vmin, 10.5rem);
    line-height: 0.8;
    color: var(--card-ivory);
    text-shadow:
      0 6px 0 rgba(0, 0, 0, 0.9),
      0 10px 24px rgba(0, 0, 0, 0.75);
    transition:
      transform 0.1s cubic-bezier(0.34, 1.56, 0.64, 1),
      color 0.25s ease,
      text-shadow 0.25s ease;
  }

  .stat-zone.is-purified .step-btn-face {
    color: #1c1a17;
    text-shadow:
      0 3px 0 rgba(255, 255, 255, 0.85),
      0 6px 14px rgba(0, 0, 0, 0.25);
  }

  .step-btn.health-step:not(:disabled):hover .step-btn-face {
    color: #82f7ae;
  }

  .stat-zone.is-purified .step-btn.health-step:not(:disabled):hover .step-btn-face {
    color: #16b850;
  }

  .step-btn.attack-step:not(:disabled):hover .step-btn-face {
    color: #ff8096;
  }

  .step-btn.health-step:not(:disabled):active .step-btn-face {
    transform: scale(0.84) translateY(4px);
    color: var(--health-color);
    text-shadow:
      0 3px 0 rgba(0, 0, 0, 0.9),
      0 0 28px var(--health-glow);
  }

  .step-btn.attack-step:not(:disabled):active .step-btn-face {
    transform: scale(0.84) translateY(4px);
    color: var(--attack-color);
    text-shadow:
      0 3px 0 rgba(0, 0, 0, 0.9),
      0 0 28px var(--attack-glow);
  }

  .step-btn:disabled {
    opacity: 0.16;
    pointer-events: none;
  }

  .stat-bar-row {
    width: min(88%, 480px);
    display: flex;
    align-items: center;
    gap: clamp(10px, 1.8dvw, 18px);
    z-index: 4;
  }

  .bar-side-icon {
    width: clamp(32px, 7.2dvh, 52px);
    height: clamp(32px, 7.2dvh, 52px);
    flex-shrink: 0;
  }

  .health-side-icon {
    color: var(--health-color);
    filter:
      drop-shadow(0 3px 0 rgba(0, 0, 0, 0.85))
      drop-shadow(0 0 12px var(--health-glow));
  }

  .stat-zone.is-purified .health-side-icon {
    color: #16b850;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
  }

  .health-side-icon.heartbeat {
    animation: urgentHeartbeat 0.55s ease-in-out infinite;
  }

  .attack-side-icon {
    color: var(--attack-color);
    filter:
      drop-shadow(0 3px 0 rgba(0, 0, 0, 0.85))
      drop-shadow(0 0 12px var(--attack-glow));
  }

  .stat-zone.is-purified .attack-side-icon {
    color: #d91b2e;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
  }

  .stat-progress-track {
    flex: 1;
    height: clamp(14px, 3.2dvh, 22px);
    background: rgba(8, 9, 12, 0.85);
    border: 2px solid rgba(245, 239, 226, 0.25);
    border-radius: 99px;
    overflow: hidden;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.75),
      inset 0 2px 6px rgba(0, 0, 0, 0.85);
  }

  .health-track {
    border-color: rgba(34, 230, 107, 0.5);
  }

  .attack-track {
    border-color: rgba(255, 42, 75, 0.5);
  }

  .stat-progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .health-fill {
    background: linear-gradient(90deg, #0b7a34 0%, #22e66b 60%, #88ffaf 100%);
    box-shadow: 0 0 14px var(--health-glow);
  }

  .health-fill.critical {
    background: #ff0026;
    box-shadow: 0 0 18px #ff0026;
    animation: criticalBarBlink 0.45s infinite alternate;
  }

  .attack-fill {
    background: linear-gradient(90deg, #9e0b24 0%, #ff2a4b 60%, #ff758c 100%);
    box-shadow: 0 0 14px var(--attack-glow);
  }

  @media (orientation: portrait) {
    .stat-zone {
      padding: clamp(2px, 0.8dvh, 8px) 0 clamp(6px, 1.4dvh, 14px);
    }

    .fixed-counter-row {
      grid-template-columns: 1fr clamp(175px, 48dvw, 270px) 1fr;
    }

    .giant-number {
      font-size: clamp(10.5rem, 27dvh, 18.5rem);
    }

    .step-btn {
      min-height: clamp(85px, 20dvh, 150px);
    }

    .step-btn-face {
      font-size: clamp(5.5rem, 20vmin, 8.5rem);
    }

    .stat-bar-row {
      width: min(88%, 400px);
    }

    .bar-side-icon {
      width: clamp(28px, 4.5dvh, 40px);
      height: clamp(28px, 4.5dvh, 40px);
    }

    .stat-progress-track {
      height: clamp(12px, 2dvh, 18px);
    }
  }

  @media (orientation: landscape) and (max-height: 430px) {
    .stat-zone {
      padding: 2px 0 6px;
    }

    .fixed-counter-row {
      grid-template-columns: 1fr clamp(150px, 24dvw, 250px) 1fr;
    }

    .giant-number {
      font-size: clamp(9.5rem, 64dvh, 18rem);
    }

    .step-btn {
      min-height: clamp(90px, 48dvh, 165px);
    }

    .step-btn-face {
      font-size: clamp(4.8rem, 22dvh, 7.5rem);
    }

    .bar-side-icon {
      width: 28px;
      height: 28px;
    }
  }

  @keyframes numberPopUp {
    0% { transform: scale(1); }
    45% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  @keyframes numberPopDown {
    0% { transform: scale(1); }
    35% { transform: scale(1.12); }
    100% { transform: scale(1); }
  }

  @keyframes deltaFloatAway {
    0% { opacity: 1; transform: translate(-50%, 8px) scale(0.6); }
    25% { opacity: 1; transform: translate(-50%, -18px) scale(1.15); }
    100% { opacity: 0; transform: translate(-50%, -62px) scale(0.85); }
  }

  @keyframes urgentHeartbeat {
    0%, 100% { transform: scale(1); }
    20% { transform: scale(1.25); }
    40% { transform: scale(1.05); }
    60% { transform: scale(1.22); }
  }

  @keyframes criticalBarBlink {
    0% { opacity: 0.5; }
    100% { opacity: 1; }
  }
</style>
