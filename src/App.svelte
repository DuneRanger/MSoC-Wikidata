<script lang="ts">
    import InitialButtonManager from "./components/InitialButtonManager.svelte";
    const iframeURL:string = 'https://query.wikidata.org/embed.html#';
    let mainQuery:string = `SELECT ?prop ?propname
        WHERE
        {
        wd:Q5 wdt:P1963 ?prop .
        
        SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "cs" .
        ?prop rdfs:label ?propname .
        }
        } ORDER BY(?propname)`;
    $: encodedLink = iframeURL + encodeURIComponent(mainQuery);


    let iframeVisibility:boolean = false;

    function toggleIframe():void {
        iframeVisibility = !iframeVisibility;
    }


</script>

<style>
    body {
        background-color: grey;
    }
    
    #displayButton {
        position: absolute;
        background-color: #81e62e;
        border-color: #105321;
        border-radius: 5px;
        border-width: 2px;
        transform: scale(1.3);
        margin: 1em;
        right:    1%;
        bottom:   1%;
    }

    #wikidataIframe {
        position: absolute;
        left: 50%;
        top: 30%;
        transform: translate(-50%, -30%);
    }
</style>

<body>
    {#if iframeVisibility}
        <button id="backButton" on:click={toggleIframe}>🔙</button>
        <iframe id="wikidataIframe" style="width: 90vw; height: 90vh; border: none;" title="wikidata" src={encodedLink} referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups">
        </iframe>
    {:else}
        <InitialButtonManager></InitialButtonManager>
        <button id="displayButton" on:click={toggleIframe}><img src="./display.png" width="20px" height="15px" style="padding-right:5px" alt="">Zobrazit</button>
    {/if}
</body>
  