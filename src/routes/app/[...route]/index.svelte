<script lang=ts>
    import RPS from '$lib/RPS.svelte';
    import { username } from '$lib/store';
    export let route: string
    import { io } from 'socket.io-client';
    import { onMount } from 'svelte';
    import { derived, writable } from 'svelte/store';
    import { scale } from 'svelte/transition';
    import { Confetti } from "svelte-confetti"

    type Resolve = 'owin' | 'pwin' | 'draw' | string

    // jesus christ
    const game = writable(false)
    const owner = writable(false)
    const opponent = writable(null)
    const playing = writable(false)
    const client = io(`/${route}`)
    const ready = writable(false)
    const error = writable(false)
    const res = writable<Resolve>('')
    
    const restring = derived(res, (res) => {
        switch(res) {
            case 'draw':
                return 'tie'
            case 'owin':
                if($owner) return 'win'
                return 'loss'
            case 'pwin':
                if($owner) return 'lose'
                return 'win'
            default:
                return res
        }
    })
    const score = writable([0, 0])

    let ublock: RPS;
    let oblock: RPS;

    client.on('ready', () => {
        error.set(false)
        ready.set(true)
        console.log('ready!', client.connected)
    })

    client.on('game:owner', () => owner.set(true))
    client.on('game:join', (o) => {
        opponent.set(o)
    })

    client.on('game', () => {
        console.log('game')
        game.set(true)
    })

    client.on('join', (id) => {
        playing.set(true)
        client.emit('start')
        opponent.set(id)
    })

    client.on('start', () => {
        playing.set(true)
    })

    client.on('score', (arr) => {
        setTimeout(() => {
            score.set(arr)
        }, 2000)
    })

    client.on('end', (win: boolean) => {
        setInterval(() => {
            ublock.disable()
        }, 100)
        setTimeout(() => {
                if(win) {
                res.set('victory')
                setTimeout(() => {
                    document.location.replace('/app')
                }, 1000)
            } else {
                res.set('defeat')
                setTimeout(() => {
                    document.location.replace('/app')
                }, 1000)
            }
        }, 4000)
    })

    const wait = (t: number) => new Promise((r) => {
        setTimeout(r, t)
    })

    client.on('round', async (ch, reso) => {
        ublock.disable()
        res.set('rock')
        await wait(500)
        res.set('paper')
        await wait(500)
        res.set('scissors')
        await wait(500)
        res.set('shoot')
        await wait(500)
        oblock.opponentchoice(ch)
        res.set(reso)
        setTimeout(() => {
            ublock.enable()
            ublock.reset()
            oblock.reset()
            res.set("")
        }, 1000)
    })

    onMount(() => {
        setTimeout(() => {
            if($ready) return
            error.set(true)
        }, 1000)
    })
    
    function creategame() {
        client.emit('create', $username, (id: string) => {
            console.log(id)
            document.location.replace(`/app/play:${id}`)
        })
    }

    function choose(e: CustomEvent<string>) {
        client.emit('choice', e.detail)
    }

    const tabs = [
        'Join',
        'Create'
    ]

    const currenttab = writable('Join')
    const listofgames = writable<Array<{ id: string, name: string }>>([])
    client.on('update', (g) => {
        console.log(g)
        listofgames.set(g)
    })

    function wraptab(id: string) {
        return () => {
            currenttab.set(id)
        }
    }

    function wrapjoin(id: string) {
        return () => {
            document.location.replace(`/app/play:${id}`)
        }
    }

    restring.subscribe(console.log)
</script>

{#if $restring === 'victory'}
<div class="fixed -top-[50px] left-0 h-screen w-screen flex justify-center overflow-hidden">
    <Confetti x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} infinite duration=1000 amount=200 fallDistance="100vh" />
</div>
{/if}

<div class="flex flex-grow items-center justify-center">
        {#if $ready}
                {#if $game}
                    {#if !$playing}
                        Waiting For players...
                    {:else}
                    <div class="flex-grow flex flex-col items-center justify-center">
                        {#if $res}
                            <span transition:scale class="absolute uppercase -rotate-12 text-9xl font-extrabold text-accent">
                                {$restring?.toUpperCase()}!
                            </span>
                        {/if}
                        <RPS bind:this={oblock} score={$score[1]} disabled />
                        <div class="h-10 min-w-full flex items-center" >
                            <div class="max-h-2 min-h-2 h-2 w-full bg-base-300"></div>
                        </div>
                        <RPS bind:this={ublock} score={$score[0]} on:change={choose} />
                    </div>
                    {/if}
                {:else}
                    <div class="h-40 max-h-40 flex flex-col items-center justify-center bg-base-200 shadow-lg rounded-2xl">
                        <div class="tabs">
                            {#each tabs as tab}
                                <span on:click={wraptab(tab)} class="tab tab-bordered" class:tab-active={$currenttab === tab}>{tab}</span> 
                            {/each}
                        </div>
                        <input type="text" class="input" placeholder="Username" bind:value={$username}>
                        <div class="flex-grow"></div>
                        {#if $currenttab === "Create"}
                        <button class="btn btn-ghost" disabled={!$username} on:click={creategame}>Create</button>
                        {:else}
                        <div class="overflow-y-scroll nobar rounded-2xl w-full h-full bg-base-300">
                            {#each $listofgames as game}
                                <button class="btn btn-ghost w-full" disabled={!$username} on:click={wrapjoin(game.id)}>{game.name}</button>
                            {/each}
                        </div>
                        {/if}
                        <div class="flex-grow"></div>
                    </div>
                {/if}
        {:else if $error}
        <span>
            Couldnt connect to server.
        </span>
        {:else}
        <span>
            <progress class="progress w-56"></progress>
        </span>
        {/if}
</div>
