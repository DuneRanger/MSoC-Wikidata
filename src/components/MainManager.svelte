<script lang="ts">
    import InitialButton from "./SingleSelect.svelte";
    import NumberInput from "./NumberInput.svelte";
    import DateInput from "./DateInput.svelte";
    import StringInput from "./StringInput.svelte";
    import GlobalVariables, {wikidataEntitiesObject, wikidataPropertiesObject} from "./GlobalVariables";

    export let id:number;
    export let initialItems:Array<string> = GlobalVariables.queryItemVariables;

    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();

    function tripleStateChange(state):void {
        dispatch("stateChange", {
            id: id,
            state: state,
            selectedItem: selectedItem,
            selectedProperty: selectedProperty
        })
    }
    
    let selectedItem:string|undefined = "";
    function receiveItemChange(event):void {
        selectedItem = event.detail.newValue;
        //The browser will change this according to the last ID selected, but this stops the !selectedProperty if statement from disabling the input box
        selectedProperty =  selectedItem ? Object.keys(GlobalVariables.queryPropertyVariables[selectedItem].properties)[0] : ""
    }

    let selectedProperty:string|undefined = "";
    function receivePropertyChange(event):void {
        selectedProperty = event.detail.newValue;
    }

    let selectedTimePeriod:string|undefined = "";
    function receiveTimePeriodChange(event):void {
        selectedTimePeriod = event.detail.newValue;
    }

    let inputBoxValue:string|undefined = "";
    function receiveValueChange(event):void {
        inputBoxValue = event.detail.inputValue;
    }

    let itemsProperties:wikidataPropertiesObject|undefined;
    let TypeOfPropertyValue:string|undefined;

    $: itemsProperties = selectedItem ? GlobalVariables.queryPropertyVariables[selectedItem].properties : undefined
    $: TypeOfPropertyValue = selectedProperty ? itemsProperties[selectedProperty].valueType : undefined;

    $: if (selectedProperty) {
        tripleStateChange("filled");
    } else {
        tripleStateChange("empty");
        inputBoxValue = "";
    };
    
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
            <StringInput examples={itemsProperties[selectedProperty].examples ? Object.keys(itemsProperties[selectedProperty].examples) : []} id={id} on:InputChange={receiveValueChange}></StringInput>
        {:else if TypeOfPropertyValue == "date"}
            <DateInput on:Periodchange={receiveTimePeriodChange} on:InputChange={receiveValueChange}></DateInput>
        {:else if TypeOfPropertyValue == "number"}
            <NumberInput on:InputChange={receiveValueChange}></NumberInput>
        {:else if TypeOfPropertyValue == "link"}
            <input disabled placeholder="Výsledek bude ve formě odkazu" style="width:250px">
        <!-- An else block isn't required, because everything is default "string" -->
        {/if}
    {/if}
</div>
    