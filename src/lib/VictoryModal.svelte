<script lang="ts">
  import Icons from './Icons.svelte';

  export let onNewGame: () => void;
  export let onClose: () => void;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-backdrop victory-backdrop" on:click={onClose}>
  <div class="victory-dialog" on:click|stopPropagation>
    <div class="victory-rays-bg" aria-hidden="true"></div>

    <!-- 1) Triumphant Victory Illustration -->
    <div class="victory-image-wrap">
      <img src="./victory.svg" alt="Victory" class="victory-artwork" />
    </div>

    <!-- 2) VICTORY Title -->
    <h2 class="victory-heading">VICTORY</h2>

    <!-- 3) New Game Button -->
    <button type="button" class="victory-newgame-btn" on:click={onNewGame}>
      <span class="victory-btn-icon">
        <Icons name="reset" />
      </span>
      <span>NEW GAME</span>
    </button>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .victory-backdrop {
    background: radial-gradient(circle, rgba(25, 18, 6, 0.85) 0%, rgba(5, 4, 8, 0.94) 100%);
    backdrop-filter: blur(10px);
  }

  .victory-dialog {
    position: relative;
    overflow: hidden;
    background: radial-gradient(circle at 50% 25%, #2e2210 0%, #14100b 75%, #0c0a08 100%);
    border: 3px solid #f5c542;
    box-shadow:
      0 20px 55px rgba(0, 0, 0, 0.95),
      0 0 45px rgba(245, 197, 66, 0.45),
      inset 0 0 28px rgba(245, 197, 66, 0.18);
    border-radius: 24px;
    padding: clamp(18px, 3.8vmin, 32px) clamp(22px, 4.5vmin, 38px);
    max-width: min(440px, 92dvw);
    max-height: 92dvh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(10px, 2.2dvh, 18px);
    animation: victoryPopupEntrance 0.52s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .victory-rays-bg {
    position: absolute;
    width: 220%;
    height: 220%;
    top: -60%;
    left: -60%;
    background: repeating-conic-gradient(
      from 0deg,
      rgba(255, 215, 85, 0.1) 0deg 12deg,
      transparent 12deg 24deg
    );
    pointer-events: none;
    z-index: 0;
    animation: victoryRaysSpin 28s linear infinite;
  }

  .victory-image-wrap {
    position: relative;
    z-index: 2;
    width: clamp(150px, 42vmin, 250px);
    height: clamp(115px, 32vmin, 190px);
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.8));
    animation: victoryCrestFloat 3s ease-in-out infinite;
  }

  .victory-artwork {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .victory-heading {
    position: relative;
    z-index: 2;
    font-family: var(--font-gothic-num);
    font-weight: 400;
    font-size: clamp(3.4rem, 12vmin, 5.4rem);
    line-height: 0.9;
    letter-spacing: 0.08em;
    color: #fff6cc;
    text-shadow:
      0 2px 0 #ffffff,
      0 5px 0 #b87b12,
      0 10px 22px rgba(0, 0, 0, 0.9),
      0 0 32px rgba(255, 210, 76, 0.85);
    margin: 2px 0;
  }

  .victory-newgame-btn {
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    padding: clamp(11px, 2.2dvh, 16px) 24px;
    border-radius: 14px;
    font-family: var(--font-btn);
    font-size: clamp(1.5rem, 4.5vmin, 2rem);
    letter-spacing: 0.06em;
    color: #140e04;
    background: linear-gradient(180deg, #fff3b8 0%, #f5c238 50%, #c98812 100%);
    border: 2px solid #fff9db;
    box-shadow:
      0 6px 0 #5e3b04,
      0 12px 24px rgba(0, 0, 0, 0.75),
      0 0 24px rgba(245, 194, 56, 0.55);
    transition:
      transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.16s ease,
      filter 0.16s ease;
  }

  .victory-newgame-btn:hover {
    transform: translateY(-2px) scale(1.02);
    filter: brightness(1.08);
  }

  .victory-newgame-btn:active {
    transform: translateY(3px) scale(0.97);
    box-shadow:
      0 3px 0 #5e3b04,
      0 6px 14px rgba(0, 0, 0, 0.75);
  }

  .victory-btn-icon {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes victoryPopupEntrance {
    0% {
      opacity: 0;
      transform: scale(0.75) translateY(20px);
    }
    70% {
      opacity: 1;
      transform: scale(1.03) translateY(-2px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes victoryRaysSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes victoryCrestFloat {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-6px) scale(1.03); }
  }
</style>
