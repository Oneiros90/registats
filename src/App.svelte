<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { Noble, Suit, Rank, FloatingDelta } from './types';
  import Icons from './lib/Icons.svelte';
  import BalatroBackground from './lib/BalatroBackground.svelte';

  const STORAGE_KEY = 'registats_game_state_v1';
  const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const RANK_TIERS: Rank[] = ['jack', 'queen', 'king'];

  const RANK_LETTERS: Record<Rank, string> = {
    jack: 'J',
    queen: 'Q',
    king: 'K'
  };

  const RANK_STATS: Record<Rank, { health: number; attack: number }> = {
    jack: { health: 20, attack: 10 },
    queen: { health: 30, attack: 15 },
    king: { health: 40, attack: 20 }
  };

  // Zero-gravity omnidirectional black fog particles expanding in all 360° directions from the corrupted card
  const FOG_PARTICLES = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2 + (i % 3) * 0.18;
    const dist = 24 + (i % 4) * 9;
    const startX = 50 + Math.cos(angle) * (16 + (i % 3) * 10);
    const startY = 50 + Math.sin(angle) * (16 + (i % 3) * 10);
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    return {
      id: i,
      left: `${startX.toFixed(1)}%`,
      top: `${startY.toFixed(1)}%`,
      tx: `${tx.toFixed(1)}px`,
      ty: `${ty.toFixed(1)}px`,
      delay: `${(i * 0.11).toFixed(2)}s`,
      duration: `${1.5 + (i % 5) * 0.32}s`,
      size: `${18 + (i % 4) * 7}px`
    };
  });

  function createInitialNobles(): Noble[] {
    const list: Noble[] = [];
    let id = 0;
    for (const rank of RANK_TIERS) {
      const { health, attack } = RANK_STATS[rank];
      for (let tierIndex = 0; tierIndex < 4; tierIndex++) {
        list.push({
          id,
          rank,
          tierIndex,
          maxHealth: health,
          health,
          maxAttack: attack,
          attack,
          suit: null
        });
        id++;
      }
    }
    return list;
  }

  function loadInitialState(): { nobles: Noble[]; selectedId: number } {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            parsed &&
            Array.isArray(parsed.nobles) &&
            parsed.nobles.length === 12 &&
            typeof parsed.selectedId === 'number' &&
            parsed.selectedId >= 0 &&
            parsed.selectedId < 12
          ) {
            return {
              nobles: parsed.nobles,
              selectedId: parsed.selectedId
            };
          }
        }
      } catch {
        // Fallback to default state
      }
    }
    return {
      nobles: createInitialNobles(),
      selectedId: 0
    };
  }

  const initialState = loadInitialState();
  let nobles: Noble[] = initialState.nobles;
  let selectedId: number = initialState.selectedId;
  let hasMounted = false;

  // Floating suit selector visibility state
  let isSuitPopoverVisible: boolean = nobles[selectedId].suit === null;
  let suitPopoverTimer: ReturnType<typeof setTimeout> | null = null;

  // Menu & Reset confirmation modal states
  let showMenuModal: boolean = false;
  let showResetConfirmStep: boolean = false;

  // Animation states
  let healthBump: 'up' | 'down' | null = null;
  let attackBump: 'up' | 'down' | null = null;
  let cardTransitionKey: number = 0;
  let isPurifyingAnimation: boolean = false;
  let purifyingNobleId: number | null = null;
  let deathTimer: ReturnType<typeof setTimeout> | null = null;
  let bumpTimeoutH: ReturnType<typeof setTimeout> | null = null;
  let bumpTimeoutA: ReturnType<typeof setTimeout> | null = null;

  // Floating delta popups (+1 / -1 / +5 / -5)
  let floatingDeltas: FloatingDelta[] = [];
  let deltaCounter = 0;

  // Tap (±1) vs Hold (±5) state
  let holdTimeout: ReturnType<typeof setTimeout> | null = null;
  let holdInterval: ReturnType<typeof setInterval> | null = null;
  let activeHold: { stat: 'health' | 'attack'; dir: 1 | -1; triggeredFive: boolean } | null = null;

  onMount(() => {
    hasMounted = true;
  });

  // Persist game state to localStorage whenever nobles or selectedId changes
  $: if (hasMounted && typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ nobles, selectedId })
      );
    } catch {
      // Ignore quota errors
    }
  }

  $: currentNoble = nobles[selectedId];
  $: isCurrentPurified = currentNoble.health <= 0;
  $: isLightPurifiedScreen = isCurrentPurified || isPurifyingAnimation;
  // When purified, display the noble's maximum attack; if re-corrupted (health >= 1), display its saved attack value
  $: displayedAttack = isCurrentPurified ? currentNoble.maxAttack : currentNoble.attack;
  // Low health activates starting at 5 HP (health > 0 && health <= 5)
  $: isLowHealth = !isCurrentPurified && currentNoble.health > 0 && currentNoble.health <= 5;
  $: lowHealthIntensity = isLowHealth ? 6 - currentNoble.health : 0; // 1..5
  $: isRedSuit = currentNoble.suit === 'hearts' || currentNoble.suit === 'diamonds';
  $: isBlackSuit = currentNoble.suit === 'clubs' || currentNoble.suit === 'spades';

  // Only suits NOT already taken by another noble of the same rank tier
  $: availableSuitsForCurrent = SUITS.filter(
    (s) => !isSuitUsedByOther(s, currentNoble, nobles)
  );

  function isSuitUsedByOther(suit: Suit, activeNoble: Noble, allNobles: Noble[]): boolean {
    return allNobles.some(
      (n) => n.rank === activeNoble.rank && n.id !== activeNoble.id && n.suit === suit
    );
  }

  // If a noble is activated and all previous/other nobles in the same rank category already have a suit assigned,
  // automatically assign the single remaining suit and do NOT show the floating menu!
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
    cancelHold();
    if (deathTimer) {
      clearTimeout(deathTimer);
      deathTimer = null;
      isPurifyingAnimation = false;
      purifyingNobleId = null;
    }

    if (selectedId !== id) {
      selectedId = id;
      cardTransitionKey++;
      clearSuitPopoverTimer();

      const autoAssigned = tryAutoAssignRemainingSuit(id);
      if (autoAssigned) {
        isSuitPopoverVisible = false;
      } else if (nobles[id].suit === null) {
        isSuitPopoverVisible = true;
      } else {
        isSuitPopoverVisible = false;
      }
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
    floatingDeltas = [...floatingDeltas.slice(-8), { id, value, type, xOffset }];
    setTimeout(() => {
      floatingDeltas = floatingDeltas.filter((d) => d.id !== id);
    }, 750);
  }

  function triggerBump(stat: 'health' | 'attack', dir: 'up' | 'down') {
    if (stat === 'health') {
      healthBump = null;
      if (bumpTimeoutH) clearTimeout(bumpTimeoutH);
      requestAnimationFrame(() => {
        healthBump = dir;
        bumpTimeoutH = setTimeout(() => {
          healthBump = null;
        }, 240);
      });
    } else {
      attackBump = null;
      if (bumpTimeoutA) clearTimeout(bumpTimeoutA);
      requestAnimationFrame(() => {
        attackBump = dir;
        bumpTimeoutA = setTimeout(() => {
          attackBump = null;
        }, 240);
      });
    }
  }

  function changeStat(stat: 'health' | 'attack', delta: number) {
    if (isPurifyingAnimation && delta < 0 && stat === 'health') return;
    // Prevent modifying attack while the noble is purified
    if (stat === 'attack' && nobles[selectedId].health <= 0) return;

    const target = nobles[selectedId];
    const prevVal = target[stat];
    const maxLimit = stat === 'health' ? target.maxHealth : target.maxAttack;
    const nextVal = Math.max(0, Math.min(maxLimit, prevVal + delta));

    if (nextVal === prevVal) return;

    // If raising health from 0 back to >= 1, cancel any pending auto-advance and re-corrupt the noble
    if (stat === 'health' && prevVal === 0 && nextVal > 0 && deathTimer) {
      clearTimeout(deathTimer);
      deathTimer = null;
      isPurifyingAnimation = false;
      purifyingNobleId = null;
    }

    nobles = nobles.map((n) =>
      n.id === selectedId ? { ...n, [stat]: nextVal } : n
    );

    const actualDelta = nextVal - prevVal;
    const dir = actualDelta > 0 ? 'up' : 'down';
    triggerBump(stat, dir);
    spawnDelta(actualDelta, stat);

    if (stat === 'health' && prevVal > 0 && nextVal === 0) {
      cancelHold();
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
        cardTransitionKey++;
        const autoAssigned = tryAutoAssignRemainingSuit(nextCorruptedId);
        isSuitPopoverVisible = !autoAssigned && nobles[nextCorruptedId].suit === null;
      }
    }, 1450);
  }

  function onStepPointerDown(stat: 'health' | 'attack', dir: 1 | -1, e: PointerEvent) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    cancelHold();

    activeHold = { stat, dir, triggeredFive: false };

    holdTimeout = setTimeout(() => {
      if (!activeHold) return;
      activeHold.triggeredFive = true;
      changeStat(stat, dir * 5);

      holdInterval = setInterval(() => {
        changeStat(stat, dir * 5);
      }, 420);
    }, 320);
  }

  function onStepPointerUp() {
    if (activeHold && !activeHold.triggeredFive) {
      changeStat(activeHold.stat, activeHold.dir * 1);
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

  function openMenu() {
    cancelHold();
    showResetConfirmStep = false;
    showMenuModal = true;
  }

  function closeMenu() {
    showMenuModal = false;
    showResetConfirmStep = false;
  }

  function askResetConfirmation() {
    showResetConfirmStep = true;
  }

  function confirmReset() {
    showMenuModal = false;
    showResetConfirmStep = false;
    cancelHold();
    clearSuitPopoverTimer();
    if (deathTimer) {
      clearTimeout(deathTimer);
      deathTimer = null;
    }
    isPurifyingAnimation = false;
    purifyingNobleId = null;
    nobles = createInitialNobles();
    selectedId = 0;
    isSuitPopoverVisible = true;
    cardTransitionKey++;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }

  onDestroy(() => {
    cancelHold();
    clearSuitPopoverTimer();
    if (deathTimer) clearTimeout(deathTimer);
  });
</script>

<div
  class="app-shell"
  class:suit-red={isRedSuit}
  class:suit-black={isBlackSuit}
  class:suit-none={currentNoble.suit === null}
  class:state-low-health={isLowHealth}
  class:state-purified-light={isLightPurifiedScreen}
  class:state-purifying={isPurifyingAnimation}
  style="--low-hp-level: {lowHealthIntensity};"
>
  <!-- 3 Distinct Rank-Specific Backgrounds (Dark when Corrupted, Light when Purified, keeping Suit & Accent) -->
  <BalatroBackground
    rank={currentNoble.rank}
    suit={currentNoble.suit}
    isPurified={isLightPurifiedScreen}
    isLowHealth={isLowHealth}
  />

  <!-- LOW HEALTH (<= 5 HP) FULL-PAGE CRIMSON BLEEDING FRAME -->
  {#if isLowHealth}
    <div class="blood-bleed-frame" aria-hidden="true">
      <div class="blood-pulse-vignette"></div>
      <div class="blood-edge blood-top"></div>
      <div class="blood-edge blood-bottom"></div>
      <div class="blood-edge blood-left"></div>
      <div class="blood-edge blood-right"></div>
      <div class="blood-corner tl"></div>
      <div class="blood-corner tr"></div>
      <div class="blood-corner bl"></div>
      <div class="blood-corner br"></div>
    </div>
  {/if}

  <!-- PURIFICATION FROM EVIL ANIMATION OVERLAY (Radiant Beams + Sacred Sunburst Emblem) -->
  {#if isPurifyingAnimation}
    <div class="purify-cinematic-overlay" aria-hidden="true">
      <div class="purify-ring"></div>
      <div class="purify-beam beam-1"></div>
      <div class="purify-beam beam-2"></div>
      <div class="purify-star-burst">
        <Icons name="purify" size="100%" />
      </div>
    </div>
  {/if}

  <!-- MENU & ENGLISH RESET CONFIRMATION POPUP MODAL -->
  {#if showMenuModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-backdrop" on:click={closeMenu}>
      <div class="modal-dialog" on:click|stopPropagation>
        {#if !showResetConfirmStep}
          <p class="modal-title">REGISTATS</p>

          <div class="menu-list">
            <button type="button" class="menu-item-btn reset-trigger-btn" on:click={askResetConfirmation}>
              <span class="menu-item-icon">
                <Icons name="reset" />
              </span>
              <span>Reset Game</span>
            </button>

            <a
              href="https://lorenzo.valente.my"
              target="_blank"
              rel="noopener noreferrer"
              class="menu-item-btn link-item-btn"
            >
              <span class="menu-item-icon">
                <Icons name="globe" />
              </span>
              <span>Author Website</span>
            </a>

            <a
              href="https://github.com/Oneiros90/registats"
              target="_blank"
              rel="noopener noreferrer"
              class="menu-item-btn link-item-btn"
            >
              <span class="menu-item-icon">
                <Icons name="github" />
              </span>
              <span>GitHub Repository</span>
            </a>
          </div>

          <button type="button" class="modal-btn cancel-btn full-width-btn" on:click={closeMenu}>
            Close
          </button>
        {:else}
          <p class="modal-title">Reset current game?</p>
          <p class="modal-subtitle">Are you sure you want to reset all nobles to full health and attack?</p>
          <div class="modal-actions">
            <button type="button" class="modal-btn cancel-btn" on:click={() => (showResetConfirmStep = false)}>
              Cancel
            </button>
            <button type="button" class="modal-btn confirm-btn" on:click={confirmReset}>
              Reset
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- MAIN RESPONSIVE LAYOUT WITH SAFE-AREA PADDING FOR IPHONE STANDALONE PWA -->
  <div class="layout-grid">
    <!-- TOP BAR: 12 NOBLES LIST + TOP-RIGHT MENU BUTTON -->
    <header class="top-deck">
      <nav class="nobles-bar" aria-label="12">
        {#each RANK_TIERS as rankTier, tierIdx}
          {@const tierHasActive = selectedId >= tierIdx * 4 && selectedId < tierIdx * 4 + 4}
          <div class="noble-tier-group" class:tier-has-active={tierHasActive} data-tier={rankTier}>
            {#each nobles.slice(tierIdx * 4, tierIdx * 4 + 4) as noble (noble.id)}
              {@const purified = noble.health <= 0}
              {@const active = noble.id === selectedId}
              {@const low = !purified && noble.health <= 5}
              {@const hasSuit = noble.suit !== null}
              {@const nobleIsRed = noble.suit === 'hearts' || noble.suit === 'diamonds'}
              {@const isDiscovered = active || hasSuit || noble.health < noble.maxHealth || noble.attack < noble.maxAttack}
              {@const isUndiscovered = !purified && !isDiscovered}
              {@const isCorrupted = !purified && isDiscovered}
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
                  class:just-purified={purifyingNobleId === noble.id}
                  on:click={() => selectNoble(noble.id)}
                >
                  <!-- 1) CORRUPTED NOBLE (Active OR any discovered alive noble): Zero-Gravity Omnidirectional Black Fog -->
                  {#if isCorrupted}
                    <span class="corrupted-fog-layer" aria-hidden="true">
                      {#each active ? FOG_PARTICLES : FOG_PARTICLES.filter((_, idx) => idx % 3 === 0) as p (p.id)}
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

                  <!-- Vitality Bar only on alive corrupted nobles (Purified cards stay clean simple white) -->
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
                {#if active && isSuitPopoverVisible && availableSuitsForCurrent.length > 0}
                  <div
                    class="floating-suits-popover"
                    class:align-left={noble.tierIndex === 0}
                    class:align-right={noble.tierIndex === 3 && tierIdx === 2}
                  >
                    <div class="floating-suits-arrow"></div>
                    {#each availableSuitsForCurrent as suit (suit)}
                      {@const isSelected = currentNoble.suit === suit}
                      {@const suitRed = suit === 'hearts' || suit === 'diamonds'}
                      <button
                        type="button"
                        class="suit-pill-btn"
                        class:suit-red={suitRed}
                        class:suit-black={!suitRed}
                        class:is-selected={isSelected}
                        on:click={(e) => selectSuit(suit, e)}
                      >
                        <span class="suit-pill-symbol">
                          <Icons name={suit} />
                        </span>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/each}
      </nav>

      <!-- Top-Right Menu Button -->
      <button
        type="button"
        class="top-menu-btn"
        aria-label="Open menu"
        on:click={openMenu}
      >
        <Icons name="menu" />
      </button>
    </header>

    <!-- 3) THE TWO MAIN PIECES: MASSIVE GOTHIC HEALTH (GREEN) & ATTACK (RED) NUMBERS + ICON BESIDE PROGRESS BAR -->
    {#key cardTransitionKey}
      <main class="battle-stage" class:stage-purified-light={isLightPurifiedScreen}>
        <!-- MASSIVE HEALTH COUNTER (Emerald Green Theme) -->
        <section
          class="stat-zone health-zone"
          class:is-low={isLowHealth}
          class:is-purified={isCurrentPurified}
        >
          <!-- Fixed-Geometry Row taking the full upper & middle space -->
          <div class="fixed-counter-row">
            <button
              type="button"
              class="step-btn minus-btn health-step"
              disabled={currentNoble.health <= 0 || isPurifyingAnimation}
              on:pointerdown={(e) => onStepPointerDown('health', -1, e)}
              on:pointerup={onStepPointerUp}
              on:pointerleave={cancelHold}
              on:pointercancel={cancelHold}
            >
              <span class="step-btn-face">−</span>
            </button>

            <div class="fixed-number-slot">
              <div
                class="giant-number health-number"
                class:bump-up={healthBump === 'up'}
                class:bump-down={healthBump === 'down'}
              >
                {currentNoble.health}
              </div>

              {#each floatingDeltas.filter((d) => d.type === 'health') as delta (delta.id)}
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
              class="step-btn plus-btn health-step"
              disabled={currentNoble.health >= currentNoble.maxHealth || isPurifyingAnimation}
              on:pointerdown={(e) => onStepPointerDown('health', 1, e)}
              on:pointerup={onStepPointerUp}
              on:pointerleave={cancelHold}
              on:pointercancel={cancelHold}
            >
              <span class="step-btn-face">+</span>
            </button>
          </div>

          <!-- Bottom Bar Row: Health Symbol right next to its Progress Bar -->
          <div class="stat-bar-row">
            <div class="bar-side-icon health-side-icon" class:heartbeat={isLowHealth}>
              {#if isCurrentPurified}
                <Icons name="purify" />
              {:else}
                <Icons name="health" />
              {/if}
            </div>
            <div class="stat-progress-track health-track">
              <div
                class="stat-progress-fill health-fill"
                class:critical={isLowHealth}
                style="width: {Math.min(100, (currentNoble.health / currentNoble.maxHealth) * 100)}%"
              ></div>
            </div>
          </div>
        </section>

        <!-- MASSIVE ATTACK COUNTER (Crimson Red Theme; hides + and - and shows maxAttack when purified) -->
        <section
          class="stat-zone attack-zone"
          class:is-zero={displayedAttack === 0}
          class:is-purified={isCurrentPurified}
        >
          <!-- Fixed-Geometry Row taking the full upper & middle space -->
          <div class="fixed-counter-row">
            <button
              type="button"
              class="step-btn minus-btn attack-step"
              class:hidden-when-purified={isCurrentPurified}
              disabled={currentNoble.attack <= 0 || isCurrentPurified}
              on:pointerdown={(e) => onStepPointerDown('attack', -1, e)}
              on:pointerup={onStepPointerUp}
              on:pointerleave={cancelHold}
              on:pointercancel={cancelHold}
            >
              <span class="step-btn-face">−</span>
            </button>

            <div class="fixed-number-slot">
              <div
                class="giant-number attack-number"
                class:bump-up={attackBump === 'up'}
                class:bump-down={attackBump === 'down'}
              >
                {displayedAttack}
              </div>

              {#each floatingDeltas.filter((d) => d.type === 'attack') as delta (delta.id)}
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
              class="step-btn plus-btn attack-step"
              class:hidden-when-purified={isCurrentPurified}
              disabled={currentNoble.attack >= currentNoble.maxAttack || isCurrentPurified}
              on:pointerdown={(e) => onStepPointerDown('attack', 1, e)}
              on:pointerup={onStepPointerUp}
              on:pointerleave={cancelHold}
              on:pointercancel={cancelHold}
            >
              <span class="step-btn-face">+</span>
            </button>
          </div>

          <!-- Bottom Bar Row: Attack Symbol right next to its Progress Bar -->
          <div class="stat-bar-row">
            <div class="bar-side-icon attack-side-icon">
              <Icons name="attack" />
            </div>
            <div class="stat-progress-track attack-track">
              <div
                class="stat-progress-fill attack-fill"
                style="width: {Math.min(100, (displayedAttack / currentNoble.maxAttack) * 100)}%"
              ></div>
            </div>
          </div>
        </section>
      </main>
    {/key}
  </div>
</div>

<style>
  /* ==========================================================================
     APP SHELL (Full-bleed fixed container extending through iOS safe-area-inset-bottom)
     ========================================================================== */
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
    transition: transform 0.3s ease;
  }

  .app-shell.suit-red {
    --suit-accent: rgba(217, 27, 46, 0.7);
  }

  .app-shell.suit-black {
    --suit-accent: rgba(245, 239, 226, 0.55);
  }

  .app-shell.state-purifying {
    animation: purifyScreenPulse 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* ==========================================================================
     LOW-HEALTH (<= 5 HP) FULL-APP RED BLEEDING BORDER & HEARTBEAT PULSE
     ========================================================================== */
  .app-shell.state-low-health {
    animation: lowHealthAppThrob calc(1.1s - var(--low-hp-level, 1) * 0.12s) infinite ease-in-out;
  }

  .blood-bleed-frame {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    pointer-events: none;
    overflow: hidden;
  }

  .blood-pulse-vignette {
    position: absolute;
    inset: 0;
    box-shadow:
      inset 0 0 calc(32px + var(--low-hp-level, 1) * 14px) calc(10px + var(--low-hp-level, 1) * 5px) rgba(220, 0, 25, 0.85),
      inset 0 0 110px 28px rgba(120, 0, 10, 0.65);
    animation: bloodVignettePulse calc(1s - var(--low-hp-level, 1) * 0.1s) infinite alternate ease-in-out;
  }

  .blood-edge {
    position: absolute;
    filter: blur(4px);
    animation: bloodDripPulse 1.1s infinite alternate ease-in-out;
  }

  .blood-top {
    top: -12px;
    left: 0;
    right: 0;
    height: calc(20px + var(--low-hp-level, 1) * 5px);
    background:
      radial-gradient(ellipse 8% 100% at 10% 0%, rgba(255, 20, 45, 0.95) 0%, transparent 100%),
      radial-gradient(ellipse 12% 130% at 28% 0%, rgba(220, 0, 30, 0.95) 0%, transparent 100%),
      radial-gradient(ellipse 9% 110% at 50% 0%, rgba(255, 25, 50, 0.95) 0%, transparent 100%),
      radial-gradient(ellipse 14% 140% at 73% 0%, rgba(210, 0, 25, 0.95) 0%, transparent 100%),
      radial-gradient(ellipse 10% 115% at 91% 0%, rgba(255, 20, 45, 0.95) 0%, transparent 100%),
      linear-gradient(to bottom, rgba(220, 0, 28, 0.95), transparent);
  }

  .blood-bottom {
    bottom: -12px;
    left: 0;
    right: 0;
    height: calc(20px + var(--low-hp-level, 1) * 5px);
    background:
      radial-gradient(ellipse 11% 120% at 16% 100%, rgba(255, 20, 45, 0.95) 0%, transparent 100%),
      radial-gradient(ellipse 14% 135% at 42% 100%, rgba(220, 0, 30, 0.95) 0%, transparent 100%),
      radial-gradient(ellipse 10% 115% at 67% 100%, rgba(255, 20, 45, 0.95) 0%, transparent 100%),
      radial-gradient(ellipse 12% 130% at 86% 100%, rgba(220, 0, 30, 0.95) 0%, transparent 100%),
      linear-gradient(to top, rgba(220, 0, 28, 0.95), transparent);
  }

  .blood-left {
    top: 0;
    bottom: 0;
    left: -10px;
    width: calc(18px + var(--low-hp-level, 1) * 5px);
    background: linear-gradient(to right, rgba(230, 0, 30, 0.92), transparent);
  }

  .blood-right {
    top: 0;
    bottom: 0;
    right: -10px;
    width: calc(18px + var(--low-hp-level, 1) * 5px);
    background: linear-gradient(to left, rgba(230, 0, 30, 0.92), transparent);
  }

  .blood-corner {
    position: absolute;
    width: 68px;
    height: 68px;
    background: radial-gradient(circle, rgba(255, 0, 35, 0.92) 0%, transparent 72%);
  }
  .blood-corner.tl { top: -22px; left: -22px; }
  .blood-corner.tr { top: -22px; right: -22px; }
  .blood-corner.bl { bottom: -22px; left: -22px; }
  .blood-corner.br { bottom: -22px; right: -22px; }

  /* ==========================================================================
     PURIFICATION FROM EVIL CINEMATIC OVERLAY
     ========================================================================== */
  .purify-cinematic-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle, rgba(255, 250, 235, 0.55) 0%, rgba(240, 230, 210, 0.25) 100%);
    animation: purifyOverlayFade 1.45s ease-out forwards;
  }

  .purify-ring {
    position: absolute;
    width: clamp(120px, 32vmin, 240px);
    height: clamp(120px, 32vmin, 240px);
    border-radius: 50%;
    border: 4px solid #fff8e7;
    box-shadow: 0 0 40px 12px rgba(255, 235, 175, 0.9);
    animation: purifyRingExpand 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .purify-beam {
    position: absolute;
    width: 140vmax;
    height: 6px;
    background: linear-gradient(90deg, transparent, #fffdf7, #ffe8a3, transparent);
    box-shadow: 0 0 32px 8px rgba(255, 240, 190, 0.95);
  }

  .purify-beam.beam-1 {
    transform: rotate(-35deg) scaleX(0);
    animation: beamStrike1 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .purify-beam.beam-2 {
    transform: rotate(35deg) scaleX(0);
    animation: beamStrike2 0.55s 0.08s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .purify-star-burst {
    width: clamp(100px, 28vmin, 185px);
    height: clamp(100px, 28vmin, 185px);
    color: #d49b24;
    filter:
      drop-shadow(0 0 24px rgba(255, 255, 255, 0.98))
      drop-shadow(0 0 55px rgba(255, 215, 110, 0.9));
    animation: purifyEmblemBurst 1.38s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  /* ==========================================================================
     MENU & RESET CONFIRMATION POPUP MODAL
     ========================================================================== */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(7px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: fadeInModal 0.18s ease-out;
  }

  .modal-dialog {
    background: #15161b;
    border: 2px solid rgba(245, 239, 226, 0.35);
    box-shadow:
      0 18px 42px rgba(0, 0, 0, 0.95),
      0 6px 0 #07080a;
    border-radius: 18px;
    padding: clamp(18px, 3.5vmin, 26px) clamp(20px, 4vmin, 32px);
    max-width: 390px;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .modal-title {
    font-family: var(--font-btn);
    font-size: clamp(1.9rem, 5.2vmin, 2.5rem);
    letter-spacing: 0.06em;
    color: var(--card-ivory);
  }

  .modal-subtitle {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: clamp(0.92rem, 2.4vmin, 1.05rem);
    color: rgba(245, 239, 226, 0.75);
    line-height: 1.38;
  }

  .menu-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .menu-item-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    font-family: var(--font-btn);
    font-size: clamp(1.25rem, 3.6vmin, 1.55rem);
    letter-spacing: 0.04em;
    background: #22242c;
    border: 2px solid rgba(245, 239, 226, 0.22);
    color: var(--card-ivory);
    box-shadow: 0 4px 0 #0a0b0e;
    transition:
      transform 0.14s ease,
      border-color 0.15s ease,
      background-color 0.15s ease;
  }

  .menu-item-btn:hover {
    border-color: var(--card-ivory);
    background: #2b2e38;
  }

  .menu-item-btn:active {
    transform: translateY(2px) scale(0.98);
  }

  .menu-item-btn.reset-trigger-btn {
    background: rgba(217, 27, 46, 0.22);
    border-color: rgba(245, 40, 60, 0.55);
    color: #ffd6da;
  }

  .menu-item-btn.reset-trigger-btn:hover {
    background: rgba(217, 27, 46, 0.35);
    border-color: #ff5c6e;
  }

  .menu-item-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 6px;
  }

  .modal-btn {
    font-family: var(--font-btn);
    font-size: clamp(1.25rem, 3.6vmin, 1.6rem);
    letter-spacing: 0.04em;
    padding: 10px 16px;
    border-radius: 11px;
    transition: transform 0.15s ease, background-color 0.15s ease;
  }

  .full-width-btn {
    width: 100%;
    margin-top: 2px;
  }

  .modal-btn.cancel-btn {
    background: #282a32;
    border: 2px solid rgba(245, 239, 226, 0.25);
    color: var(--card-ivory);
    box-shadow: 0 4px 0 #0d0e12;
  }

  .modal-btn.confirm-btn {
    background: var(--card-red);
    border: 2px solid #ff6b7a;
    color: #ffffff;
    box-shadow: 0 4px 0 #4d0710;
  }

  .modal-btn:active {
    transform: translateY(2px) scale(0.97);
  }

  /* ==========================================================================
     MAIN LAYOUT GRID WITH SAFE-AREA INSETS FOR IPHONE PWA (Landscape & Portrait)
     ========================================================================== */
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

  /* ==========================================================================
     TOP BAR: 12 NOBLE BUTTONS + TOP-RIGHT MENU BUTTON
     ========================================================================== */
  .top-deck {
    width: 100%;
    position: relative;
    z-index: 30;
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

  .noble-slot {
    position: relative;
    width: 100%;
  }

  .noble-slot.slot-active {
    z-index: 25;
  }

  /* ==========================================================================
     NOBLE BUTTON STATES:
     1) Undiscovered -> Classic Playing Card Back
     2) Corrupted (Any discovered undefeated noble) -> Always Black & Corrupted
     3) Active Selected Card -> Smoothly scales up even larger (scale(1.36))
     4) Purified (Defeated) -> Clean Simple White Card (Red for ♥/♦, Black for ♣/♠)
     ========================================================================== */
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

  /* 2) CORRUPTED NOBLE (Any discovered undefeated noble stays black & corrupted even when another card is selected) */
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

  /* 3) ACTIVE SELECTED CORRUPTED NOBLE: Even Larger Scale with Smooth Transition */
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

  /* Zero-Gravity Omnidirectional Black Smoke Particle Layer (Expands in all 360° directions) */
  .corrupted-fog-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: visible;
  }

  .fog-wisp {
    position: absolute;
    width: var(--size, 22px);
    height: var(--size, 22px);
    margin-left: calc(var(--size, 22px) * -0.5);
    margin-top: calc(var(--size, 22px) * -0.5);
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(4, 2, 8, 0.96) 0%,
      rgba(26, 10, 44, 0.76) 45%,
      rgba(48, 18, 78, 0) 75%
    );
    filter: blur(4px);
    opacity: 0;
    animation: zeroGravityFogExpand var(--dur, 1.8s) var(--delay, 0s) ease-out infinite;
  }

  /* 4) PURIFIED (DEFEATED) NOBLE: Clean Simple White Playing Card (Keeping Red for ♥ & ♦!) */
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

  /* J, Q, K Letter in Bebas Neue */
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

  /* Alive Mini Vitality Bar on Corrupted Noble Button */
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

  /* Top-Right Menu Button */
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

  /* ==========================================================================
     FLOATING SUIT SELECTOR POPOVER UNDER ACTIVE NOBLE
     ========================================================================== */
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

  /* ==========================================================================
     3) BATTLE STAGE: MASSIVE FULL-SPACE NUMBERS + ICON NEXT TO PROGRESS BAR
     ========================================================================== */
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
    animation: stageCardDeal 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  }

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

  /* FIXED-GEOMETRY COUNTER ROW FILLING ALL UPPER & MIDDLE SPACE */
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

  /* MASSIVE GOTHIC NUMBERS (Green for Vita, Red for Attacco) */
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

  /* High-contrast shadows when viewing a Purified noble on the light background */
  .battle-stage.stage-purified-light .health-number {
    color: #16b850;
    text-shadow:
      0 2px 0 #ffffff,
      0 8px 0 #083d1b,
      0 14px 24px rgba(0, 0, 0, 0.32);
  }

  .battle-stage.stage-purified-light .attack-number {
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

  /* Floating Delta Popups in Gothic Font (+1 / -1 / +5 / -5) */
  .floating-delta {
    position: absolute;
    top: 2%;
    left: calc(50% + var(--x-offset, 0px));
    transform: translateX(-50%);
    font-family: var(--font-gothic-num);
    font-size: clamp(2.6rem, 12vmin, 5.2rem);
    pointer-events: none;
    z-index: 15;
    text-shadow: 0 4px 0 #000;
    animation: deltaFloatAway 0.72s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .floating-delta.positive {
    color: var(--health-color);
  }

  .floating-delta.negative {
    color: var(--attack-color);
  }

  /* ENORMOUS TOUCH-AREA BOXLESS [−] AND [+] BUTTONS WITH DOUBLE-SIZED SYMBOLS */
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

  /* Hide Attack + and - buttons when noble is purified while preserving fixed layout geometry */
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

  /* Crisp dark-charcoal button symbol on the light purified screen */
  .battle-stage.stage-purified-light .step-btn-face {
    color: #1c1a17;
    text-shadow:
      0 3px 0 rgba(255, 255, 255, 0.85),
      0 6px 14px rgba(0, 0, 0, 0.25);
  }

  .step-btn.health-step:not(:disabled):hover .step-btn-face {
    color: #82f7ae;
  }

  .battle-stage.stage-purified-light .step-btn.health-step:not(:disabled):hover .step-btn-face {
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

  /* ==========================================================================
     ICON + PROGRESS BAR ROW AT BOTTOM OF STAT ZONE
     ========================================================================== */
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

  .battle-stage.stage-purified-light .health-side-icon {
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

  .battle-stage.stage-purified-light .attack-side-icon {
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

  /* ==========================================================================
     RESPONSIVE ADAPTATION: PORTRAIT MODE (3 rows of 4 nobles + stacked giant counters)
     ========================================================================== */
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

    .noble-btn {
      height: clamp(38px, 5.2dvh, 48px);
    }

    .noble-btn.is-corrupted.is-active {
      transform: translateY(-1px) scale(1.28);
    }

    .noble-btn.is-purified.is-active {
      transform: translateY(-1px) scale(1.26);
    }

    .top-menu-btn {
      width: clamp(44px, 11dvw, 56px);
      height: 100%;
    }

    .floating-suits-popover.align-right {
      left: auto;
      right: 0;
      transform: translateX(0);
    }

    .battle-stage {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 4px;
    }

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
    .noble-btn,
    .top-menu-btn {
      height: clamp(36px, 12.5dvh, 46px);
      min-height: clamp(36px, 12.5dvh, 46px);
    }

    .suit-pill-btn {
      width: 34px;
      height: 34px;
    }

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

  /* ==========================================================================
     KEYFRAME ANIMATIONS
     ========================================================================== */
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

  @keyframes fadeInModal {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
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

  @keyframes stageCardDeal {
    0% { opacity: 0.35; transform: scale(0.96) translateY(6px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
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

  @keyframes lowHealthAppThrob {
    0%, 100% { transform: scale(1); }
    18% { transform: scale(1.005); }
    32% { transform: scale(1); }
    48% { transform: scale(1.003); }
  }

  @keyframes bloodVignettePulse {
    0% { opacity: 0.72; transform: scale(1); }
    100% { opacity: 1; transform: scale(1.02); }
  }

  @keyframes bloodDripPulse {
    0% { transform: scaleY(0.92); opacity: 0.82; }
    100% { transform: scaleY(1.14); opacity: 1; }
  }

  @keyframes purifyScreenPulse {
    0% { transform: scale(1); }
    25% { transform: scale(1.015); }
    100% { transform: scale(1); }
  }

  @keyframes nobleCardPurifyBurst {
    0% { transform: scale(1.3); filter: brightness(2); }
    50% { transform: scale(0.94); filter: brightness(1.4); }
    100% { transform: scale(1); filter: brightness(1); }
  }

  @keyframes purifyRingExpand {
    0% { transform: scale(0.3); opacity: 1; }
    100% { transform: scale(2.6); opacity: 0; }
  }

  @keyframes beamStrike1 {
    0% { transform: rotate(-35deg) scaleX(0); opacity: 1; }
    40% { transform: rotate(-35deg) scaleX(1); opacity: 1; }
    100% { transform: rotate(-35deg) scaleX(1.15); opacity: 0; }
  }

  @keyframes beamStrike2 {
    0% { transform: rotate(35deg) scaleX(0); opacity: 1; }
    40% { transform: rotate(35deg) scaleX(1); opacity: 1; }
    100% { transform: rotate(35deg) scaleX(1.15); opacity: 0; }
  }

  @keyframes purifyEmblemBurst {
    0% { opacity: 0; transform: scale(0.4) rotate(-45deg); }
    28% { opacity: 1; transform: scale(1.15) rotate(8deg); }
    65% { opacity: 1; transform: scale(1) rotate(0deg); }
    100% { opacity: 0; transform: scale(1.35) rotate(15deg); }
  }

  @keyframes purifyOverlayFade {
    0%, 72% { opacity: 1; }
    100% { opacity: 0; }
  }
</style>
