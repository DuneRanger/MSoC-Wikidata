<script lang="ts">
    import type {queryTriple, selectedTripleDetails} from "./../GlobalVariables";
    import GlobalVariables from "./../GlobalVariables";
    import OptionsScreen from "./OptionsScreen.svelte";
    import {createEventDispatcher} from "svelte";
    const dispatch:any = createEventDispatcher();


    export let validTriples:Array<selectedTripleDetails>;

    let queryLines:Array<queryTriple> = [];

    for (let x = 0; x < validTriples.length; x++) {
        let item:string = "";
        for (let y = 0; y < x; y++) {
            if (validTriples[x].selectedItem == validTriples[y].selectedItem) {
                item = queryLines[y].item;
                break;
            }
        }
        if (!item) {
            for (let y = 0; y < x; y++) {
                if (validTriples[x].selectedItem == validTriples[y].selectedProperty) {
                    item = queryLines[y].value;
                    break;
                }
            }
        }
        if (!item) item = `?${x*2}`;

        let value:string = `?${x*2+1}`;

        queryLines.push({item:item, property:GlobalVariables.queryEntityInfo[validTriples[x].selectedProperty].id, value:value, wantedValue:validTriples[x].selectedValue});
    }

    let uniqueVariables:Set<string> = new Set();
    for (let x of queryLines) {
        uniqueVariables.add(x.item);
        if (x.value[0] == "?") uniqueVariables.add(x.value);
    }

    let labels:Array<string> = [];
    
    labels.push("?" + validTriples[0].selectedItem);

    for (let x of validTriples) {
        labels.push(("?" + x.selectedProperty + `··˃${x.selectedItem}`).replaceAll(" ", "_"));
    }

    const iframeURL:string = 'https://query.wikidata.org/embed.html#';
    console.log(validTriples)

    let mainQuery:string = `SELECT DISTINCT ${labels.join(" ")}
WHERE {
    ${queryLines.map((x) => `${x.item} wdt:${x.property} ${x.value} .` + (x.wantedValue ? `\n\t${x.item} rdsf:label "${x.wantedValue}"@cs` : "")).join("\n\t")}
        
    SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "cs" .
        ${[...uniqueVariables].map((x, i) => `${x} rdfs:label ${labels[i]} .`).join("\n\t\t")}
    }
    ${validTriples.map((x, i) => GlobalVariables.queryEntityInfo[x.selectedProperty].valueType == "string"  ? `FILTER(LANG(${labels[i+1]}) = "cs")\n\t`: "").join("")}
    ${validTriples.map((x, i) => GlobalVariables.queryEntityInfo[x.selectedProperty].valueType == "date" ? `BIND(${[...uniqueVariables][i+1]} AS ${labels[i+1]})\n\t`: "").join("")}
} LIMIT 10`;

    console.log(mainQuery)
    let encodedLink:string;
    $: encodedLink = iframeURL + encodeURIComponent(mainQuery);

    let iframeVisibilty:boolean = false;

    function toggleIframe() {
        iframeVisibilty = !iframeVisibilty;
    }

    function toggleResults() {
        dispatch("toggleResults")
    }
</script>

<style>
    #wikidataIframe {
        position: absolute;
        left: 50%;
        top: 30%;
        transform: translate(-50%, -30%);
    }
</style>


<div>
    {#if iframeVisibilty}
        <button id="backButton" on:click={toggleIframe}>🔙</button>
        <iframe id="wikidataIframe" style="width: 90vw; height: 90vh; border: none;" title="wikidata" src={encodedLink} referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups">
        </iframe>
    {:else}
        <button id="backButton" on:click={toggleResults}>🔙</button>
        <OptionsScreen on:toggleIframe={toggleIframe}></OptionsScreen>
    {/if}
</div>