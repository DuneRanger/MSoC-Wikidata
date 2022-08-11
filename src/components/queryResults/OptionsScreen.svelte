<script lang="ts">
    import {createEventDispatcher} from "svelte";
    const dispatch:any = createEventDispatcher();

    export let validity:boolean;

    function toggleIframe() {
        dispatch("toggleIframe")
    }
</script>

<style>
    div {
        text-align: center;
    }
    #continueButton {
        width:100px;
        margin-top: 5vh;
    }
</style>

<div>
    {#if validity}
        <button id="continueButton" on:click={toggleIframe}>Pokračovat</button>
    {:else}
        <button id="continueButton" on:click={toggleIframe} disabled>Pokračovat</button>
    {/if}
</div>