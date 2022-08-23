<script lang="ts">
    import {createEventDispatcher} from "svelte";
    const dispatch:any = createEventDispatcher();

    export let validity:boolean;
    export let resultsLimit:string|number = 100;

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
    Limit na počet výsledků: <input type="number" value={resultsLimit} style="width: 100px"><br>
    {#if resultsLimit < 10}
        <div style="color:#773333; font-size:12px">Doporučujeme </div>
    {/if}
    <input type="checkbox"> Hledat i v ostatních jazycích (angličtina, němčina)<br>
    <input type="checkbox"> Důkladnější hledání zadaných hodnot (Doporučeno pro nejistotu správně zadané hodnoty)<br>
    {#if validity}
        <button id="continueButton" on:click={toggleIframe}>Pokračovat</button>
    {:else}
        <button id="continueButton" on:click={toggleIframe} disabled>Pokračovat</button>
    {/if}
</div>