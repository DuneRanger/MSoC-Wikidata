<script lang="ts">
    import RDFSTripleSet from "./components/queryBuilder/IndividualTripleManager.svelte";
    import ResultsDisplay from "./components/queryResults/finalDisplay.svelte"
    import GlobalVariables from "./components/GlobalVariables";
    import type {selectedTripleDetails} from "./components/GlobalVariables";


    let resultsVisibility:boolean = false;
    function toggleIframe():void {
        resultsVisibility = !resultsVisibility;
    }
    

    let triples:Array<selectedTripleDetails> = [];
    const maxTriples:number = 9;
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
    
    function updatePossibleItemsForTriples():void {
        triples[0].items = GlobalVariables.queryItemVariables;
        if (triples[0].items.indexOf(triples[0].selectedItem) < 0) {
            triples[0].selectedItem = "";
            triples[0].selectedProperty = "";
        }
        let possibleItems:Set<string> = new Set();
        for (let x = 0; x < maxTriples-1; x++) {
            if (triples[x].selectedItem) possibleItems.add(triples[x].selectedItem);
            if (!triples[x].selectedValue && triples[x].selectedProperty) {
                if (GlobalVariables.queryEntityProperties.hasOwnProperty(triples[x].selectedProperty)) {
                    possibleItems.add(triples[x].selectedProperty);
                }
            }
            triples[x+1].items = [...possibleItems];
            if (!GlobalVariables.queryItemVariables.includes(triples[x+1].selectedItem) && triples[x+1].items.indexOf(triples[x+1].selectedItem) < 0) {
                triples[x+1].selectedItem = "";
                triples[x+1].selectedProperty = "";
            }
        }
    }



    function handleTripleDetailsChange(event):void {
        let currentID:number = triples.map(x => x.tripleID).indexOf(event.detail.tripleID);
        triples[currentID] = event.detail;
        if (!triples[currentID].selectedItem && !triples[currentID].selectedProperty) {
            triples[currentID].visibility = false;
        }
        triples.sort((a, b) => +b.visibility - +a.visibility);
        
        triples[0].items = GlobalVariables.queryItemVariables;
        triples[0].visibility = true;

        // Has to be its own if statement, to ensure that another triple will be visible
        let lastVisible:number = triples.map(x => x.visibility).lastIndexOf(true);
        if (triples[lastVisible].selectedProperty) {
            if (lastVisible < maxTriples-1) {
                triples[lastVisible+1].visibility = true;
            }
        }
        triples.sort((a, b) => +b.visibility - +a.visibility);

        updatePossibleItemsForTriples();

        lastVisible = triples.map(x => x.visibility).lastIndexOf(true);
        for (let x in triples) {
            if (triples[x].visibility && !triples[x].selectedItem && +x != lastVisible) {
                triples[x].visibility = false;
            }
        }
        triples.sort((a, b) => +b.visibility - +a.visibility);
        triples[0].items = GlobalVariables.queryItemVariables;
    }


</script>

<style>
    main {
        background-color: grey;
        min-height: 100vh;
    }
    
    #displayButton {
        position: sticky;
        scroll-behavior: auto;
        background-color: #81e62e;
        border-color: #105321;
        border-radius: 5px;
        border-width: 2px;
        transform: scale(1.3);
        margin: 1em;
        padding-right:5px;
        top: 92vh;
        left: 92vw;
    }
</style>

<main>
    {#if resultsVisibility}
        <button id="backButton" on:click={toggleIframe}>🔙</button>
        <ResultsDisplay triples={triples}></ResultsDisplay>
    {:else}
        {#each triples as triple}
            {#if triple.visibility}
                <RDFSTripleSet tripleDetails={triple} on:tripleDetailsChange={handleTripleDetailsChange}></RDFSTripleSet>
            {/if}
        {/each}
        {#if triples[maxTriples-1].visibility}
            <p style="color:darkred; font-size:24px; position: absolute; margin: 10px;">Dosáhli jste limitu řádků!</p>
        {/if}
        <button id="displayButton" on:click={toggleIframe}><img src="./display.png" width="20px" height="15px" alt="">Zobrazit</button>
    {/if}
</main>
  