<script lang="ts">
  export let name:
    | 'hearts'
    | 'diamonds'
    | 'clubs'
    | 'spades'
    | 'health'
    | 'attack'
    | 'purify'
    | 'reset'
    | 'menu'
    | 'github'
    | 'globe';
  export let size: string = '100%';
</script>

{#if name === 'hearts'}
  <!-- Classic French Playing Card Heart Suit -->
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" class="svg-icon">
    <path
      d="M32 56C32 56 8 40.5 8 22.5C8 13.5 15 8 22.5 8C27.5 8 30.5 11 32 14.5C33.5 11 36.5 8 41.5 8C49 8 56 13.5 56 22.5C56 40.5 32 56 32 56Z"
      fill="currentColor"
    />
  </svg>
{:else if name === 'diamonds'}
  <!-- Classic French Playing Card Diamond Suit -->
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" class="svg-icon">
    <path
      d="M32 6C37 16 44 25 54 32C44 39 37 48 32 58C27 48 20 39 10 32C20 25 27 16 32 6Z"
      fill="currentColor"
    />
  </svg>
{:else if name === 'clubs'}
  <!-- Classic French Playing Card Club Suit -->
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" class="svg-icon">
    <path
      d="M32 7C25.5 7 20.5 12 20.5 18.5C20.5 21.5 21.7 24.2 23.6 26.2C21.8 25.4 19.7 25 17.5 25C11 25 6 30 6 36.5C6 43 11 48 17.5 48C22.4 48 26.6 44.9 28.2 40.5L23 56H41L35.8 40.5C37.4 44.9 41.6 48 46.5 48C53 48 58 43 58 36.5C58 30 53 25 46.5 25C44.3 25 42.2 25.4 40.4 26.2C42.3 24.2 43.5 21.5 43.5 18.5C43.5 12 38.5 7 32 7Z"
      fill="currentColor"
    />
  </svg>
{:else if name === 'spades'}
  <!-- Classic French Playing Card Spade Suit -->
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" class="svg-icon">
    <path
      d="M32 6C32 6 10 24 10 37.5C10 44.5 15.5 49.5 22 49.5C25.8 49.5 28.8 47.5 30.2 44.8L24 57H40L33.8 44.8C35.2 47.5 38.2 49.5 42 49.5C48.5 49.5 54 44.5 54 37.5C54 24 32 6 32 6Z"
      fill="currentColor"
    />
  </svg>
{:else if name === 'health'}
  <!-- Detailed Heraldic Shielded Heart Emblem for Vita (Green) -->
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" class="svg-icon">
    <path
      d="M32 60C32 60 5 43.5 5 22C5 11.8 12.8 5 21.8 5C27.2 5 30.4 8.2 32 12C33.6 8.2 36.8 5 42.2 5C51.2 5 59 11.8 59 22C59 43.5 32 60 32 60Z"
      fill="currentColor"
      opacity="0.22"
    />
    <path
      d="M32 55.5C32 55.5 9 40.5 9 22.5C9 13.8 15.6 8.2 22.8 8.2C27.5 8.2 30.5 11 32 14.8C33.5 11 36.5 8.2 41.2 8.2C48.4 8.2 55 13.8 55 22.5C55 40.5 32 55.5 32 55.5Z"
      fill="currentColor"
      stroke="#e2ffec"
      stroke-width="2.8"
      stroke-linejoin="round"
    />
    <path
      d="M32 18L36 27L45 30L36 33L32 43L28 33L19 30L28 27L32 18Z"
      fill="#ffffff"
      opacity="0.28"
    />
    <path
      d="M16 21C16 16.5 19.2 13.8 23 13.8"
      stroke="#ffffff"
      stroke-width="3.2"
      stroke-linecap="round"
      opacity="0.85"
    />
  </svg>
{:else if name === 'attack'}
  <!-- Detailed Crossed Medieval Broadswords Emblem for Attacco (Red) -->
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" class="svg-icon">
    <path
      d="M8 8L20 10L48 38L40 46L12 18L8 8Z"
      fill="currentColor"
      stroke="#ffe6ea"
      stroke-width="2.4"
      stroke-linejoin="round"
    />
    <path d="M13 13L41 41" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.75" />
    <path d="M35 49L51 33" stroke="#ffd166" stroke-width="4.8" stroke-linecap="round" />
    <path d="M44 42L53 51" stroke="currentColor" stroke-width="5.2" stroke-linecap="round" />
    <circle cx="55.5" cy="53.5" r="3.8" fill="#ffd166" stroke="#ffe6ea" stroke-width="1.8" />

    <path
      d="M56 8L44 10L16 38L24 46L52 18L56 8Z"
      fill="currentColor"
      stroke="#ffe6ea"
      stroke-width="2.4"
      stroke-linejoin="round"
    />
    <path d="M51 13L23 41" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.75" />
    <path d="M13 33L29 49" stroke="#ffd166" stroke-width="4.8" stroke-linecap="round" />
    <path d="M20 42L11 51" stroke="currentColor" stroke-width="5.2" stroke-linecap="round" />
    <circle cx="8.5" cy="53.5" r="3.8" fill="#ffd166" stroke="#ffe6ea" stroke-width="1.8" />
  </svg>
{:else if name === 'purify'}
  <!-- Sacred Purification from Evil Emblem (Radiant Divine Sunburst & Halo Star) -->
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" class="svg-icon">
    <circle cx="32" cy="32" r="22" stroke="currentColor" stroke-width="2.5" stroke-dasharray="5 4" opacity="0.75" />
    <circle cx="32" cy="32" r="15" stroke="currentColor" stroke-width="2.2" opacity="0.9" />
    <path
      d="M32 2 L36.5 22.5 L52 12 L41.5 27.5 L62 32 L41.5 36.5 L52 52 L36.5 41.5 L32 62 L27.5 41.5 L12 52 L22.5 36.5 L2 32 L22.5 27.5 L12 12 L27.5 22.5 Z"
      fill="currentColor"
    />
    <polygon points="32,22 42,32 32,42 22,32" fill="#ffffff" />
  </svg>
{:else if name === 'reset'}
  <!-- Circular Reset Icon -->
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" class="svg-icon">
    <path
      d="M14 24C17.5 15.8 25.6 10 35 10C47.7 10 58 20.3 58 33C58 45.7 47.7 56 35 56C23.5 56 14 47.6 12.3 36.5"
      stroke="currentColor"
      stroke-width="5.5"
      stroke-linecap="round"
    />
    <polygon points="8,14 24,16 14,29" fill="currentColor" />
  </svg>
{:else if name === 'menu'}
  <!-- Medieval-Modern Menu Icon -->
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" class="svg-icon">
    <path d="M12 18H52" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" />
    <path d="M12 32H52" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" />
    <path d="M12 46H52" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" />
    <polygon points="32,12 36,18 32,24 28,18" fill="currentColor" />
  </svg>
{:else if name === 'github'}
  <!-- GitHub Octocat Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="svg-icon">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
{:else if name === 'globe'}
  <!-- Author Website Globe/Portal Icon -->
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" class="svg-icon">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
{/if}

<style>
  .svg-icon {
    display: block;
    overflow: visible;
  }
</style>
