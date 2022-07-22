<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import InfoSign from "./InfoSign.svelte";
    const dispatch = createEventDispatcher();
    
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
    <select on:change={handlePeriodChange}>
        <option value="Před">Před</option>
        <option value="Po">Po</option>
        <option value="Přesně">Přesně</option>
    </select>
    <input type="date" on:change={handleInputChange} placeholder="">
    <InfoSign text="Musíte zadat celý datum, aby byl validní"></InfoSign>
</div>
