<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import InfoSign from "./InfoSign.svelte";
    const dispatch:any = createEventDispatcher();
    
    function handleInputChange(event):void {
        dispatch("InputChange", {
            inputValue: event.srcElement.value
        })
    }
</script>

<style>
    div {
        display: inline-block;
        position: absolute;
        margin: 0 0 0 5px;
    }
</style>

<div>
    <input type="number" style="width:120px" on:change={handleInputChange} placeholder="000">
    <InfoSign text="Zadejte číslo ve standardních jednotkách"></InfoSign>
</div>