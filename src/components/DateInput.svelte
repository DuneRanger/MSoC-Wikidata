<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import InfoSign from "./InfoSign.svelte";
    const dispatch = createEventDispatcher();
    
    export let defaultValue:string|number;
    export let defaultPeriod:string;


    function handleInputChange(event) {
        dispatch("InputChange", {
            inputValue: event.srcElement.value
        })
    }

    function handlePeriodChange(event) {
        dispatch("PeriodChange", {
            newValue: event.srcElement.value
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
    <select on:change={handlePeriodChange} value={defaultPeriod ? defaultPeriod : "Před"}>
        <option value="Před">Před</option>
        <option value="Po">Po</option>
        <option value="Přesně">Přesně</option>
    </select>
    <input type="date" value={defaultValue}   on:change={handleInputChange} placeholder="">
    <InfoSign text="Musíte zadat celý datum, aby se uložil"></InfoSign>
</div>
