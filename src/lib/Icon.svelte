<script lang=ts>
    import type { IconName } from "$lib/icon";
    import { icotheme } from "$lib/store";

    export let name: IconName;
</script>
{#if $icotheme === 'hand'}

{#if name === 'paper'}
&#x270b
{:else if name === 'rock'}
&#x270a
{:else if name === 'scissors'}
&#x270c
{/if}


{:else if $icotheme === 'item'}

{#if name === 'paper'}
&#x1f4dc
{:else if name === 'rock'}
&#x1faa8
{:else if name === 'scissors'}
&#x2702
{/if}

{/if}