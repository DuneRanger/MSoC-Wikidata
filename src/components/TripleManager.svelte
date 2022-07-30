<script lang="ts">
    import InitialButton from "./SingleSelect.svelte";
    import NumberInput from "./NumberInput.svelte";
    import DateInput from "./DateInput.svelte";
    import SearchInput from "./SearchInput.svelte";
    // import StringInput from "./StringInput.svelte";
    import GlobalVariables from "./GlobalVariables";
    import type {wikidataEntitiesObject, wikidataPropertiesObject, selectedTripleDetails} from "./GlobalVariables";
    
    export let tripleDetails:selectedTripleDetails;
    let selectedPropertyIndex = -1;

    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();

    function tripleDetailsChange():void {
        dispatch("tripleDetailsChange", tripleDetails)
    }
    
    function receiveItemChange(event):void {
        tripleDetails.selectedItem = event.detail.newValue;
        //The browser will change this according to the last ID selected, but this stops the !selectedProperty if statement from disabling the input box
        // tripleDetails.selectedProperty =  (tripleDetails.selectedItem && selectedPropertyIndex > -1) ? Object.keys(GlobalVariables.queryPropertyVariables[tripleDetails.selectedItem].properties)[selectedPropertyIndex] : "";
        tripleDetails.selectedProperty = "";
        tripleDetails.selectedValue = "";
        tripleDetailsChange();
    }

    function receivePropertyChange(event):void {
        tripleDetails.selectedProperty = event.detail.newValue;
        selectedPropertyIndex = event.detail.index;
        if (selectedPropertyIndex == -1) tripleDetails.selectedValue = "";
        tripleDetailsChange();
    }

    function receiveTimePeriodChange(event):void {
        tripleDetails["selectedTimePeriod"] = event.detail.newValue;
        tripleDetailsChange();
    }

    function receiveValueChange(event):void {
        tripleDetails.selectedValue = event.detail.inputValue;
        tripleDetailsChange();
    }

    let itemsProperties:wikidataPropertiesObject|undefined;
    let TypeOfPropertyValue:string|undefined;

    $: itemsProperties = tripleDetails.selectedItem ? GlobalVariables.queryPropertyVariables[tripleDetails.selectedItem].properties : undefined;
    $: TypeOfPropertyValue = tripleDetails.selectedProperty ? itemsProperties[tripleDetails.selectedProperty].valueType : undefined;
    
</script>

<div style="padding: 8px; z-index:1">
    <InitialButton items={tripleDetails.items} defaultValue={tripleDetails.selectedItem} on:change={receiveItemChange} desc="Hledám: "></InitialButton>
    {#if !tripleDetails.selectedItem}
        <InitialButton items={[]} desc="Který ..."></InitialButton>
    {:else}    
        <InitialButton items={Object.keys(itemsProperties)} defaultValue={tripleDetails.selectedProperty} on:change={receivePropertyChange} desc="Který má/je/se: "></InitialButton>
        {#if !itemsProperties[tripleDetails.selectedProperty]}
            <input disabled>
        {:else if TypeOfPropertyValue == "string"}
            <SearchInput tripleDetails={tripleDetails} on:InputChange={receiveValueChange}></SearchInput>
        {:else if TypeOfPropertyValue == "date"}
            <DateInput defaultValue={tripleDetails.selectedValue} defaultPeriod={tripleDetails.selectedTimePeriod} on:PeriodChange={receiveTimePeriodChange} on:InputChange={receiveValueChange}></DateInput>
        {:else if TypeOfPropertyValue == "number"}
            <NumberInput defaultValue={tripleDetails.selectedValue} on:InputChange={receiveValueChange}></NumberInput>
        {:else if TypeOfPropertyValue == "link"}
            <input disabled placeholder="Výsledek bude ve formě odkazu" style="width:250px">
        <!-- An else block isn't required, because everything is default "string" -->
        {/if}
    {/if}
</div>
    