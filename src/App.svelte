<script lang="ts">
    import RDFSTripleSet from "./components/TripleManager.svelte";
    import GlobalVariables from "./components/GlobalVariables";
    import type {selectedTripleDetails} from "./components/GlobalVariables";
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
    let encodedLink:string;
    $: encodedLink = iframeURL + encodeURIComponent(mainQuery);


    let iframeVisibility:boolean = false;
    function toggleIframe():void {
        iframeVisibility = !iframeVisibility;
    }
    

    let triples:Array<selectedTripleDetails> = [];
    const maxTriples = 3;
    for (let x = 0; x < maxTriples; x++) {
        triples.push({
            "tripleID":x,
            "visibility":false,
            "items":[],
            "selectedItem":"",
            "selectedProperty":"",
            "selectedValue":""})
    }

    triples[0].items = GlobalVariables.queryItemVariables;
    triples[0].visibility = true;

    // let possibleItems = [];
    
    function handleTripleDetailsChange(event):void {
        triples[event.detail.tripleID] = event.detail;
        let possibleItems:Array<string> = [];
        for (let triple of triples) {
            if (triple.selectedItem) possibleItems.push(triple.selectedItem);
            if (!triple.selectedValue && triple.selectedProperty) possibleItems.push(triple.selectedProperty);
        }
        for (let x = 1; x < maxTriples; x++) {
            triples[x].items = possibleItems;
        }
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
        {#each triples as triple, i}
            <RDFSTripleSet tripleDetails={triple} on:tripleDetailsChange={handleTripleDetailsChange}></RDFSTripleSet>
        {/each}
        {#if triples.length == maxTriples}
            <p style="color:darkred; font-size:24px">Dosáhli jste limitu řádků!</p>
        {/if}
        <button id="displayButton" on:click={toggleIframe}><img src="./display.png" width="20px" height="15px" style="padding-right:5px" alt="">Zobrazit</button>
    {/if}
</body>
  