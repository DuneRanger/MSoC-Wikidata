<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import InfoSign from "./InfoSign.svelte";
    const dispatch:any = createEventDispatcher();
    import type {selectedTripleDetails} from "./../GlobalVariables";

    export let tripleDetails:selectedTripleDetails;

    let defaultValue:string|number = tripleDetails.selectedValue;
    let defaultPeriod:string = tripleDetails.selectedTimePeriod;
    let defaultPrecision:string = tripleDetails.selectedTimePrecision;

    function handleInputChange(event):void {
        dispatch("InputChange", {
            inputValue: event.srcElement.value
        });
    }

    function handlePeriodChange(event):void {
        dispatch("PeriodChange", {
            newValue: event.srcElement.value
        });
    }

    function handlePrecisionChange(event):void {
        dispatch("PrecisionChange", {
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
    S přesností:
    <select on:change={handlePrecisionChange} value={defaultPrecision ? defaultPrecision : "Rok"}>
        <option value="Rok">Rok</option>
        <option value="Měsíc">Měsíc</option>
        <option value="Den">Den</option>
    </select>
    <select on:change={handlePeriodChange} value={defaultPeriod ? defaultPeriod : "Před"}>
        <option value="Před">Před</option>
        <option value="Po">Po</option>
        <option value="Přesně">Přesně</option>
    </select>
    <input type="date" value={defaultValue}   on:change={handleInputChange} placeholder="">
    <InfoSign text="Musíte zadat celý datum, aby se uložil"></InfoSign>
</div>
