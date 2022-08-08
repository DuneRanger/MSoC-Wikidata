<script lang="ts">
    export let text:string = "";
</script>

<style>
    img {
        position: absolute;
        top: 12px;
        right: 26px;
    }
</style>

<img src="./info.png" title={text} width=16 height=16 alt="text">