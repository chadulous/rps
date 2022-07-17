<script lang=ts>
    import Icon from "$lib/Icon.svelte";
    import { createEventDispatcher, onMount } from "svelte";
    import { writable } from "svelte/store";
    const choice = writable("")
    import { tweened } from 'svelte/motion';
	import { backOut } from 'svelte/easing';
import type { IconName } from "./icon";
    
	const size = tweened(0, {
		duration: 300,
		easing: backOut
	});

    export let score: number;

    size.subscribe(console.log)

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
    size.set(80)

    let icons: Array<IconName> = ["rock", "paper", "scissors"]
</script>

<div class="flex flex-grow items-center">
    <div class="absolute left-0 text-9xl">
        <span class="countdown">
            <span style="--value:{score};"></span>
        </span>
    </div>
    {#each icons as icon}
        <button style='width: {$size * 0.25}rem !important;
        height: {$size * 0.25}rem !important;
        min-width: {$size * 0.25}rem !important;
        min-height: {$size * 0.25}rem !important;' class="mx-4 text-9xl kbd kbd-lg rounded-full transition-all" on:click={wrap(icon)} class:bg-neutral={disabled} class:bg-accent-focus={$choice === icon} class:hover:shadow-2xl={!disabled} class:hover:border-8={!disabled} disabled={disabled}>
            <Icon name={icon} />
        </button>
    {/each}
</div>