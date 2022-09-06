<script lang="ts">
    import InitialButton from "./BasicSelectInput.svelte";
    import NumberInput from "./NumberInput.svelte";
    import DateInput from "./DateInput.svelte";
    import SearchInput from "./SearchInput.svelte";
    import GlobalVariables from "./../GlobalVariables";
    import type {selectedTripleDetails} from "./../GlobalVariables";
    
    export let searchInputValuesOption:number = 0;
    export let allTriples:Array<selectedTripleDetails>; //exported only for smarter searchInput querying
    export let tripleDetails:selectedTripleDetails;

    import {createEventDispatcher} from "svelte";
    const dispatch:any = createEventDispatcher();

    function tripleDetailsChange():void {
        dispatch("tripleDetailsChange", tripleDetails);
    }
    
    function receiveItemChange(event):void {
        tripleDetails.selectedItem = event.detail.newValue;
        tripleDetails.selectedProperty = "";
        tripleDetails.selectedValue = "";
        tripleDetailsChange();
    }

    function receivePropertyChange(event):void {
        tripleDetails.selectedProperty = event.detail.newValue;
        tripleDetails.selectedValue = "";
        tripleDetailsChange();
    }

    function receiveTimePeriodChange(event):void {
        tripleDetails["selectedTimePeriod"] = event.detail.newValue;
        tripleDetailsChange();
    }

    function receiveNumberIntervalChange(event):void {
        tripleDetails["selectedNumberInterval"] = event.detail.newValue;
        tripleDetailsChange();
    }

    function receiveValueChange(event):void {
        tripleDetails.selectedValue = event.detail.inputValue;
        tripleDetailsChange();
    }

    function receiveTimePrecisionChange(event):void {
        tripleDetails["selectedTimePrecision"] = event.detail.newValue;
        tripleDetailsChange();
    }

    let itemsProperties:Array<string>|undefined;
    let TypeOfPropertyValue:"string"|"number"|"date"|"link"|"coordinates"|"image"|undefined;

    //These variables will update whenever tripleDetails is changed
    $: itemsProperties = tripleDetails.selectedItem ? GlobalVariables.queryEntityProperties[tripleDetails.selectedItem] : undefined;
    $: TypeOfPropertyValue = tripleDetails.selectedProperty ? GlobalVariables.queryEntityInfo[tripleDetails.selectedProperty].valueType : undefined;
    
</script>

<style>
    input:disabled {
        background-color: rgb(195, 195, 195);
    }
    input::placeholder {
        color: rgb(37, 37, 37);
    }
</style>

<div style="padding: 8px; z-index:1">
    <InitialButton items={tripleDetails.items} defaultValue={tripleDetails.selectedItem} on:change={receiveItemChange} desc="Hledám: "></InitialButton>
    {#if !tripleDetails.selectedItem}
        <InitialButton items={[]} desc="Který ..."></InitialButton>
    {:else}    
        <InitialButton items={itemsProperties} defaultValue={tripleDetails.selectedProperty} on:change={receivePropertyChange} desc="Který má/je/se: "></InitialButton>
        <!-- At this point itemsProperties will always be defined -->
        {#if !itemsProperties.includes(tripleDetails.selectedProperty)}
            <input disabled>
        {:else if TypeOfPropertyValue == "string"}
            <SearchInput {allTriples} {tripleDetails} {searchInputValuesOption} on:InputChange={receiveValueChange}></SearchInput>
        {:else if TypeOfPropertyValue == "date"}
            <DateInput {tripleDetails} on:PeriodChange={receiveTimePeriodChange} on:InputChange={receiveValueChange} on:PrecisionChange={receiveTimePrecisionChange}></DateInput>
        {:else if TypeOfPropertyValue == "number"}
            <NumberInput {tripleDetails} on:IntervalChange={receiveNumberIntervalChange} on:InputChange={receiveValueChange}></NumberInput>
        {:else if TypeOfPropertyValue == "link" || TypeOfPropertyValue == "image"}
            <input disabled placeholder="Výsledek bude ve formě odkazu" style="width:250px">
        {:else if TypeOfPropertyValue == "coordinates"}
            <input disabled placeholder="Poloha souřadnic se objeví na mapě" style="width:270px">
        <!-- An else block isn't required, because everything is default "string" -->
        {/if}
    {/if}
</div>
    