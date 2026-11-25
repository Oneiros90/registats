<script lang="ts">
  import Icons from './Icons.svelte';
</script>

<div class="purify-cinematic-overlay" aria-hidden="true">
  <div class="purify-ring"></div>
  <div class="purify-beam beam-1"></div>
  <div class="purify-beam beam-2"></div>
  <div class="purify-star-burst">
    <div class="purify-star-halo"></div>
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
    background: radial-gradient(circle, rgba(255, 250, 235, 0.5) 0%, rgba(240, 230, 210, 0.2) 100%);
    will-change: opacity;
    animation: purifyOverlayFade 1.25s ease-out forwards;
  }

  .purify-ring {
    position: absolute;
    width: clamp(120px, 32vmin, 240px);
    height: clamp(120px, 32vmin, 240px);
    border-radius: 50%;
    border: 4px solid #fff8e7;
    will-change: transform, opacity;
    animation: purifyRingExpand 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .purify-beam {
    position: absolute;
    width: 110vmax;
    height: 6px;
    background: linear-gradient(90deg, transparent, #fffdf7, #ffe8a3, transparent);
    will-change: transform, opacity;
  }

  .purify-beam.beam-1 {
    transform: rotate(-35deg) scaleX(0);
    animation: beamStrike1 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .purify-beam.beam-2 {
    transform: rotate(35deg) scaleX(0);
    animation: beamStrike2 0.5s 0.06s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* Pure GPU transform + opacity (Zero dynamic filter: drop-shadow re-blurring on scale!) */
  .purify-star-burst {
    position: relative;
    width: clamp(100px, 28vmin, 185px);
    height: clamp(100px, 28vmin, 185px);
    color: #d49b24;
    will-change: transform, opacity;
    animation: purifyEmblemBurst 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .purify-star-halo {
    position: absolute;
    inset: -35%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 245, 200, 0.9) 0%, rgba(255, 215, 110, 0.4) 45%, transparent 72%);
    z-index: -1;
  }

  @keyframes purifyRingExpand {
    0% { transform: scale3d(0.3, 0.3, 1); opacity: 1; }
    100% { transform: scale3d(2.4, 2.4, 1); opacity: 0; }
  }

  @keyframes beamStrike1 {
    0% { transform: rotate(-35deg) scaleX(0); opacity: 1; }
    40% { transform: rotate(-35deg) scaleX(1); opacity: 1; }
    100% { transform: rotate(-35deg) scaleX(1.1); opacity: 0; }
  }

  @keyframes beamStrike2 {
    0% { transform: rotate(35deg) scaleX(0); opacity: 1; }
    40% { transform: rotate(35deg) scaleX(1); opacity: 1; }
    100% { transform: rotate(35deg) scaleX(1.1); opacity: 0; }
  }

  @keyframes purifyEmblemBurst {
    0% { opacity: 0; transform: scale3d(0.4, 0.4, 1) rotate(-45deg); }
    28% { opacity: 1; transform: scale3d(1.12, 1.12, 1) rotate(8deg); }
    65% { opacity: 1; transform: scale3d(1, 1, 1) rotate(0deg); }
    100% { opacity: 0; transform: scale3d(1.3, 1.3, 1) rotate(15deg); }
  }

  @keyframes purifyOverlayFade {
    0%, 70% { opacity: 1; }
    100% { opacity: 0; }
  }
</style>
