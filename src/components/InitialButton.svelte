<script lang="ts">
    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();
    
    export let items;
    export let desc;
    export let defaultValue = "";

    function handleEvent(event) {
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