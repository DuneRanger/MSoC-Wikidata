<script lang="ts">
    import {createEventDispatcher} from "svelte";
    const dispatch:any = createEventDispatcher();

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
    <button id="continueButton" on:click={toggleIframe}>Pokračovat</button>
</div>