<script lang="ts">
    import InitialButton from "./InitialButton.svelte";
    import NumberInput from "./NumberInput.svelte";
    import DateInput from "./DateInput.svelte";
    import StringInput from "./StringInput.svelte";
    import GlobalVariables from "./GlobalVariables";

    
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
    
    $: TypeOfPropertyValue = selectedProperty ? GlobalVariables.queryPropertyVariables[selectedItem].properties[selectedProperty].valueType : undefined;
</script>

<div style="padding: 8px">
    <InitialButton items={GlobalVariables.queryItemVariables} on:change={receiveItemChange} desc="Hledám: "></InitialButton>
    {#if !selectedItem || !selectedItem}
        <InitialButton items={[]} desc="Který ..."></InitialButton>
    {:else}    
        <InitialButton items={Object.keys(GlobalVariables.queryPropertyVariables[selectedItem].properties)} on:change={receivePropertyChange} defaultValue={Object.keys(GlobalVariables.queryPropertyVariables[selectedItem].properties)[0]} desc="Který má/je/se: "></InitialButton>
        {#if !selectedProperty}
            <input disabled>
        {:else if TypeOfPropertyValue == "string"}
            <StringInput></StringInput>
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
    