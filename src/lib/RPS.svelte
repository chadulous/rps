<script lang=ts>
    import Icon from "$lib/Icon.svelte";
    import { createEventDispatcher, onMount } from "svelte";
    import { writable } from "svelte/store";
    const choice = writable("")
    import type { IconName } from "./icon";
    export let score: number;

    const ev = createEventDispatcher()
    choice.subscribe((c) => {
        if(!c.length) return
        ev('change', c)
    })
    export let disabled = false;
    export function opponentchoice(ch: string) {
        choice.set(ch)
    }
    
    export function reset() {
        choice.set("")
    }

    function wrap(ch: string) {
        return () => {
            if(disabled) return
            choice.set(ch)
        }
    }

    export function disable() {
        disabled = true
    }

    export function enable() {
        disabled = false
    }

    let icons: Array<IconName> = ["rock", "paper", "scissors"]
</script>

<div class="flex flex-grow items-center">
    <div class="absolute left-4 text-3xl md:text-6xl">
        <span class="countdown">
            <span style="--value:{score};"></span>
        </span>
    </div>
    {#each icons as icon}
        <button class="mx-4 RPS text-9xl kbd kbd-lg rounded-full transition-all" on:click={wrap(icon)} class:bg-neutral={disabled} class:bg-accent-focus={$choice === icon} class:hover:shadow-2xl={!disabled} class:hover:border-8={!disabled} disabled={disabled}>
            <Icon name={icon} />
        </button>
    {/each}
</div>