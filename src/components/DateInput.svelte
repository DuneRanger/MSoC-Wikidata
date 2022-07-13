<script lang="ts">
    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();
    
    function handleEvent(event) {
        dispatch("change", {
            newValue: event.srcElement.value
        })
    }
</script>

<select on:change={handleEvent}>
    <option value="Před">Před</option>
    <option value="Po">Po</option>
    <option value="Přesně">Přesně</option>
</select>
<input type="date">