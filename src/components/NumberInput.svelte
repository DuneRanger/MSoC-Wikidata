<script lang="ts">
    import {createEventDispatcher} from "svelte";
    const dispatch:any = createEventDispatcher();
    import InfoSign from "./InfoSign.svelte";

    export let defaultValue:string|number;

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
    <input type="number" style="width:120px" value={defaultValue} on:change={handleInputChange} placeholder="000">
    <InfoSign text="Zadejte číslo ve standardních jednotkách (e.g. cm, kg, km)"></InfoSign>
</div>