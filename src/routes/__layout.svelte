<script lang=ts>
  import type { IconType } from "$lib/icon";
  import { icotheme } from "$lib/store";
  import "../app.css";
  // Mobile detection
  import { onMount } from "svelte";
  import Detector from 'svelte-device-detector'
  let standalone = false;
  let landscape = false;
  let mount = new Promise((r) => onMount(r))
  onMount(() => {
    standalone = window.navigator?.standalone || false
    landscape = window.matchMedia('(orientation: landscape)').matches
    window.matchMedia('(orientation: landscape)').onchange = (e) => {
      landscape = e.matches
    }
  })

  const iconthemes: Array<{ name: string, id: IconType }> = [
    {
      name: "Items",
      id: 'item'
    },
    {
      name: "Hands",
      id: 'hand'
    }
  ]

  function changetheme(id: IconType) {
    return () => {
      icotheme.set(id)
    }
  }
</script>

{#await mount then}
<Detector showInDevice="mobile">
  {#if !standalone}
  <div class="absolute h-screen w-screen flex items-center justify-center bg-base-200 z-50">
    <span>
      For a better experience, Tap share, then add to home screen.
    </span>
  </div>
  {/if}
  {#if !landscape}
  <div class="absolute h-screen w-screen flex items-center justify-center bg-base-200 z-40">
    <span>
      Please rotate device to landscape mode.
    </span>
  </div>
  {/if}
</Detector>
{/await}
<div class="w-screen h-screen flex flex-col nobar">
  <div class="navbar bg-base-200">
    <a href="/" class="btn btn-ghost">ROKS</a>
    <div class="dropdown">
      <label tabindex="0" for="iconselector" class="btn btn-ghost normal-case m-1">
        Icon Theme
        <svg width="12px" height="12px" class="ml-1 hidden h-3 w-3 fill-current opacity-60 sm:inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" /></svg>
      </label>
      <ul tabindex="0" id="iconselector" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
        {#each iconthemes as icontheme }
          <li>
            <button class:theme-active={$icotheme === icontheme.id} on:click={changetheme(icontheme.id)}>
              {icontheme.name}
            </button>
          </li>
        {/each}
      </ul>
    </div>
    <a class="btn btn-ghost" href="/app">Play</a>
  </div>
  <slot />
</div>

<style lang=postcss>
  .theme-active {
    @apply bg-primary-focus
  }
</style>