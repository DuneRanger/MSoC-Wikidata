<script lang="ts">
    import InitialButton from "./InitialButton.svelte";
    import NumberInput from "./NumberInput.svelte";
    import DateInput from "./DateInput.svelte";
    import StringInput from "./StringInput.svelte";
    import GlobalVariables from "./GlobalVariables";

    export let id;
    export let highestID;
    export let initialItems = GlobalVariables.queryItemVariables;

    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();

    function tripleStateChange(state) {
        dispatch("stateChange", {
            id: id,
            state: state
        })
    }
    
    let selectedItem = "";
    function receiveItemChange(event) {
        selectedItem = event.detail.newValue;
        //The browser will change this according to the last ID selected, but this stops the !selectedProperty if statement from disabling the input box
        selectedProperty =  selectedItem ? Object.keys(GlobalVariables.queryPropertyVariables[selectedItem].properties)[0] : ""
    }

    let selectedProperty = "";
    function receivePropertyChange(event) {
        selectedProperty = event.detail.newValue;
    }

    let selectedTimePeriod = "";
    function receiveTimePeriodChange(event) {
        selectedTimePeriod = event.detail.newValue;
    }
    
    $: itemsProperties = selectedItem ? GlobalVariables.queryPropertyVariables[selectedItem].properties : undefined
    $: TypeOfPropertyValue = selectedProperty ? itemsProperties[selectedProperty].valueType : undefined;

    $: if (selectedProperty) {tripleStateChange("filled")} else {tripleStateChange("empty")};
    
</script>

<div style="padding: 8px; z-index:1">
    <InitialButton items={initialItems} on:change={receiveItemChange} desc="Hledám: "></InitialButton>
    {#if !selectedItem}
        <InitialButton items={[]} desc="Který ..."></InitialButton>
    {:else}    
        <InitialButton items={Object.keys(itemsProperties)} on:change={receivePropertyChange} defaultValue={Object.keys(itemsProperties)[0]} desc="Který má/je/se: "></InitialButton>
        {#if !itemsProperties[selectedProperty]}
            <input disabled>
        {:else if TypeOfPropertyValue == "string"}
            <StringInput examples={itemsProperties[selectedProperty].examples} id={id} highestID={highestID}></StringInput>
        {:else if TypeOfPropertyValue == "date"}
            <DateInput on:change={receiveTimePeriodChange}></DateInput>
        {:else if TypeOfPropertyValue == "number"}
            <NumberInput></NumberInput>
        {:else if TypeOfPropertyValue == "link"}
            <input disabled value="Výsledek bude ve formě odkazu" style="width:250px">
        <!-- An else block isn't required, because everything is default "string" -->
        {/if}
    {/if}
</div>
    