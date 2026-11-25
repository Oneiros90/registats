<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { Noble, Suit, FloatingDelta } from './types';
  import {
    SUITS,
    createInitialNobles,
    loadInitialState,
    saveGameState,
    clearGameState,
    isSuitUsedByOther
  } from './lib/constants';
  import BalatroBackground from './lib/BalatroBackground.svelte';
  import LowHealthFrame from './lib/LowHealthFrame.svelte';
  import PurifyOverlay from './lib/PurifyOverlay.svelte';
  import VictoryModal from './lib/VictoryModal.svelte';
  import MenuModal from './lib/MenuModal.svelte';
  import TopDeck from './lib/TopDeck.svelte';
  import StatCounter from './lib/StatCounter.svelte';

  const initialState = loadInitialState();
  let nobles: Noble[] = initialState.nobles;
  let selectedId: number = initialState.selectedId;
  let hasMounted = false;

  // Floating suit selector visibility state
  let isSuitPopoverVisible: boolean = nobles[selectedId].suit === null;
  let suitPopoverTimer: ReturnType<typeof setTimeout> | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  // Modal states
  let showMenuModal: boolean = false;
  let showVictoryModal: boolean = false;
  let victoryShownForCurrentClear: boolean = false;

  // Animation states
  let healthBump: 'up' | 'down' | null = null;
  let attackBump: 'up' | 'down' | null = null;
  let isPurifyingAnimation: boolean = false;
  let purifyingNobleId: number | null = null;
  let deathTimer: ReturnType<typeof setTimeout> | null = null;
  let bumpTimeoutH: ReturnType<typeof setTimeout> | null = null;
  let bumpTimeoutA: ReturnType<typeof setTimeout> | null = null;

  // Floating delta popups (+1 / -1 / +5 / -5)
  let floatingDeltas: FloatingDelta[] = [];
  let deltaCounter = 0;

  onMount(() => {
    hasMounted = true;
  });

  // Debounce localStorage writes so synchronous disk I/O never blocks animation frames
  $: if (hasMounted) {
    const snapshotNobles = nobles;
    const snapshotId = selectedId;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveGameState(snapshotNobles, snapshotId);
    }, 180);
  }

  $: currentNoble = nobles[selectedId];
  $: isCurrentPurified = currentNoble.health <= 0;
  $: isLightPurifiedScreen = isCurrentPurified || isPurifyingAnimation;
  $: allNoblesPurified = nobles.every((n) => n.health <= 0);
  $: if (!allNoblesPurified) {
    victoryShownForCurrentClear = false;
  }
  $: if (hasMounted && allNoblesPurified && !isPurifyingAnimation && !victoryShownForCurrentClear) {
    victoryShownForCurrentClear = true;
    showVictoryModal = true;
  }
  $: displayedAttack = isCurrentPurified ? currentNoble.maxAttack : currentNoble.attack;
  $: isLowHealth = !isCurrentPurified && currentNoble.health > 0 && currentNoble.health <= 5;
  $: lowHealthIntensity = isLowHealth ? 6 - currentNoble.health : 0;
  $: isRedSuit = currentNoble.suit === 'hearts' || currentNoble.suit === 'diamonds';
  $: isBlackSuit = currentNoble.suit === 'clubs' || currentNoble.suit === 'spades';
  $: availableSuitsForCurrent = SUITS.filter((s) => !isSuitUsedByOther(s, currentNoble, nobles));
  $: healthDeltas = floatingDeltas.filter((d) => d.type === 'health');
  $: attackDeltas = floatingDeltas.filter((d) => d.type === 'attack');

  function tryAutoAssignRemainingSuit(nobleId: number): boolean {
    const target = nobles[nobleId];
    if (target.suit !== null) return false;

    const sameRankPeers = nobles.filter((n) => n.rank === target.rank && n.id !== target.id);
    const previousPeers = nobles.filter((n) => n.rank === target.rank && n.id < target.id);
    const remainingSuits = SUITS.filter((s) => !isSuitUsedByOther(s, target, nobles));

    if (
      remainingSuits.length === 1 &&
      (sameRankPeers.every((n) => n.suit !== null) ||
        (previousPeers.length === 3 && previousPeers.every((n) => n.suit !== null)))
    ) {
      const autoSuit = remainingSuits[0];
      nobles = nobles.map((n) => (n.id === nobleId ? { ...n, suit: autoSuit } : n));
      isSuitPopoverVisible = false;
      return true;
    }
    return false;
  }

  function clearSuitPopoverTimer() {
    if (suitPopoverTimer) {
      clearTimeout(suitPopoverTimer);
      suitPopoverTimer = null;
    }
  }

  function showSuitPopoverTemporarily(ms = 3200) {
    clearSuitPopoverTimer();
    isSuitPopoverVisible = true;
    suitPopoverTimer = setTimeout(() => {
      isSuitPopoverVisible = false;
      suitPopoverTimer = null;
    }, ms);
  }

  function selectNoble(id: number) {
    if (deathTimer) {
      clearTimeout(deathTimer);
      deathTimer = null;
      isPurifyingAnimation = false;
      purifyingNobleId = null;
    }

    if (selectedId !== id) {
      selectedId = id;
      clearSuitPopoverTimer();

      const autoAssigned = tryAutoAssignRemainingSuit(id);
      isSuitPopoverVisible = !autoAssigned && nobles[id].suit === null;
    } else {
      showSuitPopoverTemporarily(3200);
    }
  }

  function selectSuit(suit: Suit, e?: MouseEvent) {
    if (e) e.stopPropagation();
    if (isSuitUsedByOther(suit, currentNoble, nobles)) return;
    const newSuit = currentNoble.suit === suit ? null : suit;
    nobles = nobles.map((n) => (n.id === currentNoble.id ? { ...n, suit: newSuit } : n));

    clearSuitPopoverTimer();
    if (newSuit !== null) {
      isSuitPopoverVisible = false;
    } else {
      showSuitPopoverTemporarily(3200);
    }
  }

  function spawnDelta(value: number, type: 'health' | 'attack') {
    const id = ++deltaCounter;
    const xOffset = (Math.random() - 0.5) * 32;
    floatingDeltas = [...floatingDeltas.slice(-6), { id, value, type, xOffset }];
    setTimeout(() => {
      floatingDeltas = floatingDeltas.filter((d) => d.id !== id);
    }, 700);
  }

  function triggerBump(stat: 'health' | 'attack', dir: 'up' | 'down') {
    if (stat === 'health') {
      if (bumpTimeoutH) clearTimeout(bumpTimeoutH);
      healthBump = dir;
      bumpTimeoutH = setTimeout(() => (healthBump = null), 200);
    } else {
      if (bumpTimeoutA) clearTimeout(bumpTimeoutA);
      attackBump = dir;
      bumpTimeoutA = setTimeout(() => (attackBump = null), 200);
    }
  }

  function changeStat(stat: 'health' | 'attack', delta: number) {
    if (isPurifyingAnimation && delta < 0 && stat === 'health') return;
    if (stat === 'attack' && nobles[selectedId].health <= 0) return;

    const target = nobles[selectedId];
    const prevVal = target[stat];
    const maxLimit = stat === 'health' ? target.maxHealth : target.maxAttack;
    const nextVal = Math.max(0, Math.min(maxLimit, prevVal + delta));

    if (nextVal === prevVal) return;

    if (stat === 'health' && prevVal === 0 && nextVal > 0 && deathTimer) {
      clearTimeout(deathTimer);
      deathTimer = null;
      isPurifyingAnimation = false;
      purifyingNobleId = null;
    }

    nobles = nobles.map((n) => (n.id === selectedId ? { ...n, [stat]: nextVal } : n));

    const actualDelta = nextVal - prevVal;
    const dir = actualDelta > 0 ? 'up' : 'down';
    triggerBump(stat, dir);
    spawnDelta(actualDelta, stat);

    if (stat === 'health' && prevVal > 0 && nextVal === 0) {
      triggerPurificationSequence(selectedId);
    }
  }

  function triggerPurificationSequence(purifiedId: number) {
    if (deathTimer) clearTimeout(deathTimer);
    isPurifyingAnimation = true;
    purifyingNobleId = purifiedId;
    clearSuitPopoverTimer();
    isSuitPopoverVisible = false;

    deathTimer = setTimeout(() => {
      isPurifyingAnimation = false;
      purifyingNobleId = null;
      deathTimer = null;

      let nextCorruptedId: number | null = null;
      for (let i = purifiedId + 1; i < nobles.length; i++) {
        if (nobles[i].health > 0) {
          nextCorruptedId = i;
          break;
        }
      }
      if (nextCorruptedId === null) {
        for (let i = 0; i < purifiedId; i++) {
          if (nobles[i].health > 0) {
            nextCorruptedId = i;
            break;
          }
        }
      }

      if (nextCorruptedId !== null && selectedId === purifiedId) {
        selectedId = nextCorruptedId;
        const autoAssigned = tryAutoAssignRemainingSuit(nextCorruptedId);
        isSuitPopoverVisible = !autoAssigned && nobles[nextCorruptedId].suit === null;
      }
    }, 1250);
  }

  function confirmReset() {
    showMenuModal = false;
    showVictoryModal = false;
    victoryShownForCurrentClear = false;
    clearSuitPopoverTimer();
    if (deathTimer) {
      clearTimeout(deathTimer);
      deathTimer = null;
    }
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    isPurifyingAnimation = false;
    purifyingNobleId = null;
    nobles = createInitialNobles();
    selectedId = 0;
    isSuitPopoverVisible = true;
    clearGameState();
  }

  function handleWindowKeydown(e: KeyboardEvent) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'k' || e.key === 'K') {
      const target = nobles[selectedId];
      if (target && target.health > 0 && !isPurifyingAnimation) {
        e.preventDefault();
        changeStat('health', -target.health);
      }
    }
  }

  onDestroy(() => {
    clearSuitPopoverTimer();
    if (deathTimer) clearTimeout(deathTimer);
    if (saveTimer) clearTimeout(saveTimer);
  });
</script>

<svelte:window on:keydown={handleWindowKeydown} />

<div
  class="app-shell"
  class:suit-red={isRedSuit}
  class:suit-black={isBlackSuit}
  class:suit-none={currentNoble.suit === null}
  class:state-low-health={isLowHealth}
  class:state-purified-light={isLightPurifiedScreen}
  style="--low-hp-level: {lowHealthIntensity};"
>
  <BalatroBackground
    rank={currentNoble.rank}
    suit={currentNoble.suit}
    isPurified={isLightPurifiedScreen}
    isLowHealth={isLowHealth}
  />

  {#if isLowHealth}
    <LowHealthFrame />
  {/if}

  {#if isPurifyingAnimation}
    <PurifyOverlay />
  {/if}

  {#if showVictoryModal}
    <VictoryModal
      onNewGame={confirmReset}
      onClose={() => (showVictoryModal = false)}
    />
  {/if}

  {#if showMenuModal}
    <MenuModal
      onConfirmReset={confirmReset}
      onClose={() => (showMenuModal = false)}
    />
  {/if}

  <div class="layout-grid">
    <TopDeck
      {nobles}
      {selectedId}
      {purifyingNobleId}
      {isSuitPopoverVisible}
      {availableSuitsForCurrent}
      onSelectNoble={selectNoble}
      onSelectSuit={selectSuit}
      onOpenMenu={() => (showMenuModal = true)}
    />

    <main class="battle-stage" class:stage-purified-light={isLightPurifiedScreen}>
      <StatCounter
        type="health"
        value={currentNoble.health}
        maxValue={currentNoble.maxHealth}
        isPurified={isCurrentPurified}
        {isLowHealth}
        {isPurifyingAnimation}
        bump={healthBump}
        deltas={healthDeltas}
        onChange={(d) => changeStat('health', d)}
      />

      <StatCounter
        type="attack"
        value={displayedAttack}
        maxValue={currentNoble.maxAttack}
        isPurified={isCurrentPurified}
        hideButtons={isCurrentPurified}
        bump={attackBump}
        deltas={attackDeltas}
        onChange={(d) => changeStat('attack', d)}
      />
    </main>
  </div>
</div>

<style>
  .app-shell {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: calc(-1 * env(safe-area-inset-bottom, 0px));
    width: 100vw;
    height: calc(100% + env(safe-area-inset-bottom, 0px));
    min-height: 100vh;
    min-height: 100lvh;
    overflow: hidden;
    --suit-accent: rgba(212, 178, 108, 0.45);
  }

  .app-shell.suit-red {
    --suit-accent: rgba(217, 27, 46, 0.7);
  }

  .app-shell.suit-black {
    --suit-accent: rgba(245, 239, 226, 0.55);
  }

  .layout-grid {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100dvh;
    display: grid;
    grid-template-rows: auto 1fr;
    padding-top: max(clamp(8px, 1.6dvh, 16px), calc(env(safe-area-inset-top, 0px) + 6px));
    padding-right: max(clamp(12px, 2.2dvw, 26px), calc(env(safe-area-inset-right, 0px) + 12px));
    padding-bottom: max(clamp(10px, 2dvh, 20px), calc(env(safe-area-inset-bottom, 0px) + 10px));
    padding-left: max(clamp(12px, 2.2dvw, 26px), calc(env(safe-area-inset-left, 0px) + 12px));
  }

  .battle-stage {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(8px, 2dvw, 28px);
    align-items: stretch;
    justify-items: center;
  }

  @media (orientation: portrait) {
    .battle-stage {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 4px;
    }
  }
</style>
