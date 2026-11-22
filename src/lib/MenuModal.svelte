<script lang="ts">
  import Icons from './Icons.svelte';

  export let onConfirmReset: () => void;
  export let onClose: () => void;

  let showConfirmStep = false;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-backdrop" on:click={onClose}>
  <div class="modal-dialog" on:click|stopPropagation>
    {#if !showConfirmStep}
      <p class="modal-title">REGISTATS</p>

      <div class="menu-list">
        <button
          type="button"
          class="menu-item-btn reset-trigger-btn"
          on:click={() => (showConfirmStep = true)}
        >
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

      <button type="button" class="modal-btn cancel-btn full-width-btn" on:click={onClose}>
        Close
      </button>
    {:else}
      <p class="modal-title">Reset current game?</p>
      <p class="modal-subtitle">Are you sure you want to reset all nobles to full health and attack?</p>
      <div class="modal-actions">
        <button type="button" class="modal-btn cancel-btn" on:click={() => (showConfirmStep = false)}>
          Cancel
        </button>
        <button type="button" class="modal-btn confirm-btn" on:click={onConfirmReset}>
          Reset
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
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

  @keyframes fadeInModal {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
</style>
