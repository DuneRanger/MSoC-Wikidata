<script lang="ts">
    import type {queryTriple, selectedTripleDetails} from "./../GlobalVariables";
    import GlobalVariables from "./../GlobalVariables";
    import OptionsScreen from "./OptionsScreen.svelte";
    import {createEventDispatcher} from "svelte";
    import {SPARQLQueryDispatcher} from "./../SPARQLQueryDispatcher";
    const dispatch:any = createEventDispatcher();
    const queryDispatcher = new SPARQLQueryDispatcher('https://query.wikidata.org/sparql');


    export let validTriples:Array<selectedTripleDetails>;
    let coordinateTriples:Array<selectedTripleDetails> = [];
    for (let x = 0; x < validTriples.length; x++) {
        if (GlobalVariables.queryEntityInfo[validTriples[x].selectedProperty].valueType == "coordinates") {
            coordinateTriples.push(...validTriples.splice(x, 1))
        }
    }
    console.log(coordinateTriples);

    let nameLine:queryTriple;
    //A check for a custom property
    for (let x = validTriples.length-1; x > -1 ; x--) {
        if (validTriples[x].selectedProperty == "Jméno") {
            nameLine = {item:"?0", property:GlobalVariables.queryEntityInfo[validTriples[x].selectedProperty].id, value:"", wantedValue:validTriples[x].selectedValue}
            validTriples.splice(x, 1);
        }
    }

    let queryLines:Array<queryTriple> = [];
    let uniqueVariables:Set<string> = new Set();
    let labels:Array<string> = [];
    let mainQuery:string;
    let encodedMainQueryLink:string;
    let coordinatesQuery:string;
    let encodedCoordinatesQueryLink:string;
    const iframeURL:string = 'https://query.wikidata.org/embed.html#';
    let queryValidity:boolean = (validTriples.length != 0);
    console.log(queryValidity, validTriples)

    
    $: encodedCoordinatesQueryLink = iframeURL + encodeURIComponent(coordinatesQuery);
    $: encodedMainQueryLink = iframeURL + encodeURIComponent(mainQuery);

    if (!queryValidity) {
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
                    output += `${queryLine.item} ${queryLine.property} ${queryLine.value} .\n\t`
                    if (queryLine.wantedValue != "") output += `${queryLine.value} rdfs:label "${queryLine.wantedValue}"@cs .\n\t`;
                    break;
                case "date":
                    output += `${queryLine.item} ${queryLine.property} ${queryLine.value} .\n\t`;
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
                    output += `${queryLine.item} ${queryLine.property} ${queryLine.value} .`;
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

        mainQuery = `SELECT ${labels.join(" ")}
WHERE {
    ${[...uniqueVariables][0]} wdt:P31 ${GlobalVariables.queryEntityInfo[validTriples[0].selectedItem].id} .
    ${queryLines.map(formatTripleAndFilter).join("")}
        
    SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "cs" .
        ${[...uniqueVariables].map((x, i) => `${x} rdfs:label ${labels[i]} .`).join("\n\t\t")}
    }
    FILTER(LANG(${labels[0]}) = "cs")
    ${validTriples.map((x, i) => GlobalVariables.queryEntityInfo[x.selectedProperty].valueType == "string"  ? `FILTER(LANG(${labels[i+1]}) = "cs")\n\t`: "").join("")}
    ${validTriples.map((x, i) => GlobalVariables.queryEntityInfo[x.selectedProperty].valueType == "date" ? `BIND(${[...uniqueVariables][i+1]} AS ${labels[i+1]})\n\t`: "").join("")}
} LIMIT 100`; //Dočasný limit pro testy

        console.log(mainQuery);
        
        let coordinateLines:Array<queryTriple> = [];
        for (let x = 0; x < coordinateTriples.length; x++) {
            let item:string = "";
            for (let y = 0; y < validTriples.length; y++) {
                console.log(coordinateTriples[x].selectedItem, validTriples[y].selectedItem)
                if (coordinateTriples[x].selectedItem == validTriples[y].selectedItem) {
                    item = queryLines[y].item;
                    break;
                }
                if (coordinateTriples[x].selectedItem == validTriples[y].selectedProperty) {
                    item = queryLines[y].value;
                    break;
                }
            }
            if (!item) continue; //Something weird and impossible must have happened in this case
            let value:string = `?10${x}`;
            coordinateLines.push({item:item, property:GlobalVariables.queryEntityInfo[coordinateTriples[x].selectedProperty].id, value:value, wantedValue:""});
        }
        console.log(coordinateLines);

        queryDispatcher.query(mainQuery, "redundant").then(queryJSON => {
            let temp:Array<string> = queryJSON.data.results.bindings.map(x => x["Bydliště··˃Člověk"].value);
            coordinatesQuery = `#defaultView:Map
SELECT ${coordinateLines.map(x => x.value).join(" ")}
WHERE {
    VALUES ?possibleLabels {${temp.filter((x, i) => temp.indexOf(x) == i).map(x => `"${x}"@cs`).join(" ")}}
    ${coordinateLines.map(x => `${x.item} rdfs:label ?possibleLabels .\n\t${x.item} ${x.property} ${x.value} .`)}   
} GROUP BY ${coordinateLines.map(x => x.value).join(" ")} LIMIT 100`; //Dočasný limit pro testy
// ${[...uniqueVariables][0]} rdfs:label ?possibleLabels .
// ${queryLines.map(formatTripleAndFilter).join("")}

            console.log(coordinatesQuery)
        });

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
        position: relative;
    }
</style>


<div>
    {#if iframeVisibilty}
        <button id="backButton" on:click={toggleIframe}>🔙</button>
        <div style="width:99vw; height:93vh; translate:1%">
            {#if coordinateTriples.length == 0}
                <iframe class="wikidataIframeSolo" style="width: 90vw; height: 90vh; border: none;" title="wikidata" src={encodedMainQueryLink} referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups">
                </iframe>
            {:else}
                <iframe class="wikidataIframeDuo" style="width: 56vw; height: 90vh; border: none;" title="wikidata" src={encodedMainQueryLink} referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups">
                </iframe>
                <iframe class="wikidataIframeDuo" style="width: 42vw; height: 90vh; border: none;" title="wikidata" src={encodedCoordinatesQueryLink} referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups">
                </iframe>
            {/if}
        </div>
    {:else}
        <button id="backButton" on:click={toggleResults}>🔙</button>
        <OptionsScreen on:toggleIframe={toggleIframe} validity={queryValidity}></OptionsScreen>
        {#if !queryValidity}
            <p style="color:#663333; font-size:20px; text-align:center;">Vyplňtě prosím alespoň jednu vlastnot které není: Jméno, Zeměpisné souřadnice</p>
        {/if}
    {/if}
</div>