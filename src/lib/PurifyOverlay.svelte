<script lang="ts">
  import Icons from './Icons.svelte';
</script>

<div class="purify-cinematic-overlay" aria-hidden="true">
  <div class="purify-ring"></div>
  <div class="purify-beam beam-1"></div>
  <div class="purify-beam beam-2"></div>
  <div class="purify-star-burst">
    <Icons name="purify" size="100%" />
  </div>
</div>

<style>
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
