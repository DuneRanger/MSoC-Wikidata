<script lang="ts">
    import type {queryTriple, selectedTripleDetails} from "./../GlobalVariables";
    import GlobalVariables from "./../GlobalVariables";
    import OptionsScreen from "./OptionsScreen.svelte";
    import {createEventDispatcher} from "svelte";
    const dispatch:any = createEventDispatcher();


    export let validTriples:Array<selectedTripleDetails>;
    let coordinateTriples:Array<selectedTripleDetails> = [];
    for (let x = 0; x < validTriples.length; x++) {
        if (GlobalVariables.queryEntityInfo[validTriples[x].selectedProperty].valueType == "coordinates") {
            coordinateTriples.push(...validTriples.splice(x, 1))
        }
    }
    console.log(coordinateTriples)
    let queryLines:Array<queryTriple> = [];
    let uniqueVariables:Set<string> = new Set();
    let labels:Array<string> = [];
    let mainQuery:string;
    let encodedMainQueryLink:string;
    let coordinatesQuery:string;
    let encodedCoordinatesQueryLink:string;
    const iframeURL:string = 'https://query.wikidata.org/embed.html#';

    
    $: encodedCoordinatesQueryLink = iframeURL + encodeURIComponent(coordinatesQuery);
    $: encodedMainQueryLink = iframeURL + encodeURIComponent(mainQuery);
    console.log(validTriples.length)

    if (validTriples.length == 0) {
        toggleResults();
    } else {
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

        for (let x of queryLines) {
            uniqueVariables.add(x.item);
            if (x.value[0] == "?") uniqueVariables.add(x.value);
        }

        
        labels.push("?" + validTriples[0].selectedItem);

        for (let x of validTriples) {
            labels.push(("?" + x.selectedProperty + `··˃${x.selectedItem}`).replaceAll(" ", "_"));
        }

        function formatTripleAndFilter(queryLine:queryTriple, lineIndex:number):string {
            let output:string = "";
            switch (GlobalVariables.queryEntityInfo[validTriples[lineIndex].selectedProperty].valueType) {
                case "string":
                    output += `${queryLine.item} wdt:${queryLine.property} ${queryLine.value} .\n\t`
                    if (queryLine.wantedValue != "") output += `${queryLine.value} rdfs:label "${queryLine.wantedValue}"@cs .\n\t`;
                    break;
                case "date":
                    output += `${queryLine.item} wdt:${queryLine.property} ${queryLine.value} .\n\t`;
                    if (queryLine.wantedValue != "") {
                        if (validTriples[lineIndex].selectedTimePeriod == "Přesně") {
                            switch (validTriples[lineIndex].selectedTimePrecision) {
                                case "Den":
                                    output+=`FILTER(DAY(${queryLine.value}) = DAY("${queryLine.wantedValue}T00:00:00Z"^^xsd:dateTime))\n\t`;
                                case "Měsíc":
                                    output+=`FILTER(MONTH(${queryLine.value}) =  MONTH("${queryLine.wantedValue}T00:00:00Z"^^xsd:dateTime))\n\t`;
                                case "Rok":
                                    output+=`FILTER(YEAR(${queryLine.value}) = YEAR("${queryLine.wantedValue}T00:00:00Z"^^xsd:dateTime))\n\t`;
                            }
                        } else {
                            let periodIntervalSymbol:string = {"Po": ">", "Před": "<"}[validTriples[lineIndex].selectedTimePeriod];
                            switch (validTriples[lineIndex].selectedTimePrecision) {
                                case "Rok":
                                    output+=`FILTER(${queryLine.value} ${periodIntervalSymbol} "${queryLine.wantedValue.slice(0,4)}-01-01T00:00:00Z"^^xsd:dateTime)\n\t`;
                                    break;
                                case "Měsíc":
                                    output+=`FILTER(${queryLine.value} ${periodIntervalSymbol} "${queryLine.wantedValue.slice(0,7)}-01T00:00:00Z"^^xsd:dateTime)\n\t`;
                                    break;
                                case "Den":
                                    output+=`FILTER(${queryLine.value} ${periodIntervalSymbol} "${queryLine.wantedValue}T00:00:00Z"^^xsd:dateTime)\n\t`;
                            }
                        }
                    }
                    break;
                case "number":
                    output += `${queryLine.item} wdt:${queryLine.property} ${queryLine.value} .`;
                    if (queryLine.wantedValue != "") {
                        let intervalSymbol:string = {"Méně nebo rovno": "<=", "Méně než": "<", "Více nebo rovno": ">=", "Více než": ">", "Rovno": "="}[validTriples[lineIndex].selectedNumberInterval]
                        output+=`FILTER(${queryLine.value} ${intervalSymbol} ${queryLine.wantedValue})\n\t`;
                    }
                    break;
            }
            console.log(output)
            return output;
        }

        console.log(validTriples)

        mainQuery = `SELECT DISTINCT ${labels.join(" ")}
WHERE {
    ${[...uniqueVariables][0]} wdt:P31 wd:${GlobalVariables.queryEntityInfo[validTriples[0].selectedItem].id} .
    ${queryLines.map(formatTripleAndFilter).join("")}
        
    SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "cs" .
        ${[...uniqueVariables].map((x, i) => `${x} rdfs:label ${labels[i]} .`).join("\n\t\t")}
    }
    FILTER(LANG(${labels[0]}) = "cs")
    ${validTriples.map((x, i) => GlobalVariables.queryEntityInfo[x.selectedProperty].valueType == "string"  ? `FILTER(LANG(${labels[i+1]}) = "cs")\n\t`: "").join("")}
    ${validTriples.map((x, i) => GlobalVariables.queryEntityInfo[x.selectedProperty].valueType == "date" ? `BIND(${[...uniqueVariables][i+1]} AS ${labels[i+1]})\n\t`: "").join("")}
} LIMIT 10`; //Dočasný limit pro testy

        console.log(mainQuery)

        let coordinateLines:Array<queryTriple> = [];
        for (let x = 0; x < coordinateTriples.length; x++) {
            let item:string = "";
            for (let y = 0; y < validTriples.length; y++) {
                if (coordinateTriples[x].selectedItem == validTriples[y].selectedItem) {
                    item = queryLines[y].item;
                    break;
                }
            }
            if (!item) continue; //Something weird and impossible must have happened in this case
            let value:string = `?10${x}`;
            coordinateLines.push({item:item, property:GlobalVariables.queryEntityInfo[validTriples[x].selectedProperty].id, value:value, wantedValue:""});
        }

        coordinatesQuery = `SELECT DISTINCT ${coordinateLines.map(x => x.item).join(" ")}
WHERE {
    ${[...uniqueVariables][0]} wdt:P31 wd:${GlobalVariables.queryEntityInfo[validTriples[0].selectedItem].id} .
    ${queryLines.map(formatTripleAndFilter).join("")}
    ${coordinateLines.map(x => `${x.item} wdt:${x.property} ${x.value}`)}  
} LIMIT 10`; //Dočasný limit pro testy

        console.log(coordinatesQuery)
    }

    let iframeVisibilty:boolean = false;

    function toggleIframe() {
        iframeVisibilty = !iframeVisibilty;
    }

    function toggleResults() {
        dispatch("toggleResults");
    }
</script>

<style>
    .wikidataIframeSolo {
        position: absolute;
        left: 50%;
        top: 30%;
        transform: translate(-50%, -30%);
    }
    .wikidataIframeDuo {
        position: absolute;
        left: 50%;
        top: 10%;
        transform: translate(-50%, -10%);
    }
</style>


<div>
    {#if iframeVisibilty}
        <button id="backButton" on:click={toggleIframe}>🔙</button>
        {#if coordinateTriples.length = 0}
            <iframe class="wikidataIframeSolo" style="width: 90vw; height: 90vh; border: none;" title="wikidata" src={encodedMainQueryLink} referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups">
            </iframe>
        {:else}
            <iframe class="wikidataIframeDuo" style="width: 90vw; height: 40vh; border: none;" title="wikidata" src={encodedMainQueryLink} referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups">
            </iframe>
            <iframe class="wikidataIframeDuo" style="width: 90vw; height: 40vh; border: none;" title="wikidata" src={encodedCoordinatesQueryLink} referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups">
            </iframe>
        {/if}
    {:else}
        <button id="backButton" on:click={toggleResults}>🔙</button>
        <OptionsScreen on:toggleIframe={toggleIframe} validity={mainQuery ? true : false}></OptionsScreen>
    {/if}
</div>