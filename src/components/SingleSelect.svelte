<script lang="ts">
    import {createEventDispatcher} from "svelte";
    const dispatch:any = createEventDispatcher();
    
    export let items:Array<string>;
    export let desc:string = "";
    export let defaultValue:string = "";

    function handleEvent(event):void {
        dispatch("change", {
            newValue: event.srcElement.value
        })
    }
</script>

{desc}
<select on:change={handleEvent} value={defaultValue}>
    <option value="">Klikni pro výběr</option>
    {#each items as item}
        <option value={item}>{item}</option>
    {/each}
</select>