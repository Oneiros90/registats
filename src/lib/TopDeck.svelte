<script lang="ts">
  import type { Noble, Suit } from '../types';
  import { RANK_TIERS } from './constants';
  import Icons from './Icons.svelte';
  import NobleCardButton from './NobleCardButton.svelte';

  export let nobles: Noble[];
  export let selectedId: number;
  export let purifyingNobleId: number | null;
  export let isSuitPopoverVisible: boolean;
  export let availableSuitsForCurrent: Suit[];
  export let onSelectNoble: (id: number) => void;
  export let onSelectSuit: (suit: Suit, e?: MouseEvent) => void;
  export let onOpenMenu: () => void;
</script>

<header class="top-deck">
  <nav class="nobles-bar" aria-label="12">
    {#each RANK_TIERS as rankTier, tierIdx}
      {@const tierHasActive = selectedId >= tierIdx * 4 && selectedId < tierIdx * 4 + 4}
      <div class="noble-tier-group" class:tier-has-active={tierHasActive} data-tier={rankTier}>
        {#each nobles.slice(tierIdx * 4, tierIdx * 4 + 4) as noble (noble.id)}
          <NobleCardButton
            {noble}
            active={noble.id === selectedId}
            {tierIdx}
            justPurified={purifyingNobleId === noble.id}
            showSuitPopover={isSuitPopoverVisible}
            availableSuits={availableSuitsForCurrent}
            {onSelectNoble}
            {onSelectSuit}
          />
        {/each}
      </div>
    {/each}
  </nav>

  <button
    type="button"
    class="top-menu-btn"
    aria-label="Open menu"
    on:click={onOpenMenu}
  >
    <Icons name="menu" />
  </button>
</header>

<style>
  .top-deck {
    width: 100%;
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: stretch;
    gap: clamp(8px, 1.2dvw, 16px);
  }

  .nobles-bar {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(8px, 1.5dvw, 18px);
    background: rgba(14, 15, 18, 0.84);
    border: 1.5px solid var(--suit-accent);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7);
    border-radius: 14px;
    padding: clamp(6px, 1.1dvh, 10px) clamp(8px, 1.2dvw, 14px);
    transition: border-color 0.35s ease;
  }

  .noble-tier-group {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: clamp(5px, 0.8dvw, 11px);
    position: relative;
    z-index: 1;
  }

  .noble-tier-group.tier-has-active {
    z-index: 20;
  }

  .noble-tier-group:not(:last-child)::after {
    content: '';
    position: absolute;
    right: calc(clamp(8px, 1.5dvw, 18px) * -0.52);
    top: 15%;
    bottom: 15%;
    width: 2px;
    background: rgba(245, 239, 226, 0.18);
  }

  .top-menu-btn {
    width: clamp(42px, 5.4dvw, 56px);
    min-height: clamp(44px, 13.5dvh, 66px);
    border-radius: 12px;
    background: rgba(18, 20, 24, 0.88);
    border: 1.5px solid rgba(245, 239, 226, 0.28);
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.7);
    color: var(--card-ivory);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(8px, 1.8vmin, 13px);
    transition:
      transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
      border-color 0.2s ease;
  }

  .top-menu-btn:hover {
    border-color: var(--card-ivory);
  }

  .top-menu-btn:active {
    transform: scale(0.92);
  }

  @media (orientation: portrait) {
    .nobles-bar {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(3, auto);
      gap: 7px;
      padding: 7px;
    }

    .noble-tier-group {
      gap: 7px;
    }

    .noble-tier-group:not(:last-child)::after {
      display: none;
    }

    .top-menu-btn {
      width: clamp(44px, 11dvw, 56px);
      height: 100%;
    }
  }

  @media (orientation: landscape) and (max-height: 430px) {
    .top-menu-btn {
      height: clamp(36px, 12.5dvh, 46px);
      min-height: clamp(36px, 12.5dvh, 46px);
    }
  }
</style>
