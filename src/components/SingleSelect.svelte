<script lang="ts">
    import {createEventDispatcher} from "svelte";
    const dispatch:any = createEventDispatcher();
    
    export let items:Array<string>;
    export let desc:string = "";
    export let defaultValue:string = "";

    function handleEvent(event):void {
        dispatch("change", {
            newValue: event.srcElement.value,
            index: items.indexOf(event.srcElement.value)
        });
    }
</script>

{desc}
<select on:input={handleEvent} style="width:auto">
    {#if items}
        {#if !defaultValue}
            <option value="default" selected disabled hidden>Klikni pro výběr</option>
            <option value="" >-</option>
            {#each items as item}
                <option value={item}>{item}</option>
            {/each}
        {:else}
            <option value="" >-</option>
            {#each items as item}
                {#if item == defaultValue}
                    <option value={item} selected>{item}</option>
                {:else}
                    <option value={item}>{item}</option>                
                {/if}
            {/each}
        {/if}
    {/if}
</select>