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

<style>
  .blood-bleed-frame {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    pointer-events: none;
    overflow: hidden;
    will-change: opacity;
    animation: bloodVignettePulse calc(0.95s - var(--low-hp-level, 1) * 0.1s) infinite alternate ease-in-out;
  }

  .blood-pulse-vignette {
    position: absolute;
    inset: 0;
    box-shadow:
      inset 0 0 calc(32px + var(--low-hp-level, 1) * 14px) calc(10px + var(--low-hp-level, 1) * 5px) rgba(220, 0, 25, 0.85),
      inset 0 0 90px 24px rgba(120, 0, 10, 0.6);
  }

  /* Pure gradient softness — Zero CSS filter:blur() overhead */
  .blood-edge {
    position: absolute;
  }

  .blood-top {
    top: -8px;
    left: 0;
    right: 0;
    height: calc(22px + var(--low-hp-level, 1) * 5px);
    background:
      radial-gradient(ellipse 8% 100% at 10% 0%, rgba(255, 20, 45, 0.9) 0%, transparent 100%),
      radial-gradient(ellipse 12% 130% at 28% 0%, rgba(220, 0, 30, 0.9) 0%, transparent 100%),
      radial-gradient(ellipse 9% 110% at 50% 0%, rgba(255, 25, 50, 0.9) 0%, transparent 100%),
      radial-gradient(ellipse 14% 140% at 73% 0%, rgba(210, 0, 25, 0.9) 0%, transparent 100%),
      radial-gradient(ellipse 10% 115% at 91% 0%, rgba(255, 20, 45, 0.9) 0%, transparent 100%),
      linear-gradient(to bottom, rgba(220, 0, 28, 0.9), transparent);
  }

  .blood-bottom {
    bottom: -8px;
    left: 0;
    right: 0;
    height: calc(22px + var(--low-hp-level, 1) * 5px);
    background:
      radial-gradient(ellipse 11% 120% at 16% 100%, rgba(255, 20, 45, 0.9) 0%, transparent 100%),
      radial-gradient(ellipse 14% 135% at 42% 100%, rgba(220, 0, 30, 0.9) 0%, transparent 100%),
      radial-gradient(ellipse 10% 115% at 67% 100%, rgba(255, 20, 45, 0.9) 0%, transparent 100%),
      radial-gradient(ellipse 12% 130% at 86% 100%, rgba(220, 0, 30, 0.9) 0%, transparent 100%),
      linear-gradient(to top, rgba(220, 0, 28, 0.9), transparent);
  }

  .blood-left {
    top: 0;
    bottom: 0;
    left: -8px;
    width: calc(20px + var(--low-hp-level, 1) * 5px);
    background: linear-gradient(to right, rgba(230, 0, 30, 0.88), transparent);
  }

  .blood-right {
    top: 0;
    bottom: 0;
    right: -8px;
    width: calc(20px + var(--low-hp-level, 1) * 5px);
    background: linear-gradient(to left, rgba(230, 0, 30, 0.88), transparent);
  }

  .blood-corner {
    position: absolute;
    width: 68px;
    height: 68px;
    background: radial-gradient(circle, rgba(255, 0, 35, 0.9) 0%, transparent 72%);
  }
  .blood-corner.tl { top: -22px; left: -22px; }
  .blood-corner.tr { top: -22px; right: -22px; }
  .blood-corner.bl { bottom: -22px; left: -22px; }
  .blood-corner.br { bottom: -22px; right: -22px; }

  @keyframes bloodVignettePulse {
    0% { opacity: 0.72; }
    100% { opacity: 1; }
  }
</style>
