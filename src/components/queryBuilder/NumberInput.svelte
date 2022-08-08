<script lang="ts">
    import {createEventDispatcher} from "svelte";
    const dispatch:any = createEventDispatcher();
    import InfoSign from "./InfoSign.svelte";
    import type {selectedTripleDetails} from "./../GlobalVariables";

    export let tripleDetails:selectedTripleDetails;

    let defaultValue:string|number = tripleDetails.selectedValue;
    let defaultInterval:string = tripleDetails.selectedNumberInterval;

    function handleInputChange(event):void {
        dispatch("InputChange", {
            inputValue: event.srcElement.value
        });
    }

    function handleIntervalChange(event):void {
        dispatch("IntervalChange", {
            newValue: event.srcElement.value
        });
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
    <select on:change={handleIntervalChange} value={defaultInterval ? defaultInterval : "Méně než"}>
        <option value="Méně než">Méně než</option>
        <option value="Méně nebo rovno">Méně nebo rovno</option>
        <option value="Více než">Více než</option>
        <option value="Více nebo rovno">Více nebo rovno</option>
        <option value="Rovno">Rovno</option>
    </select>
    <input type="number" style="width:120px" value={defaultValue} on:change={handleInputChange} placeholder="000">
    <InfoSign text="Zadejte číslo ve standardních jednotkách (e.g. cm, kg, km)"></InfoSign>
</div>