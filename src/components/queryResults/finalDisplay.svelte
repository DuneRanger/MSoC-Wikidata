<script lang="ts">
    import type {queryTriple, selectedTripleDetails} from "./../GlobalVariables";
    import GlobalVariables from "./../GlobalVariables";
    import OptionsScreen from "./OptionsScreen.svelte";
    import {createEventDispatcher} from "svelte";
    const dispatch:any = createEventDispatcher();
    import { SPARQLQueryDispatcher } from "../SPARQLQueryDispatcher";
    const queryDispatcher = new SPARQLQueryDispatcher('https://query.wikidata.org/sparql');


    export let validTriples:Array<selectedTripleDetails>;

    let resultsLimit:number = 100;

    let viewMapOption:boolean = false;
    let viewImageOption:boolean = false;
    let defaultViewOption:string = "#";
    for (let x of validTriples) {
        if (GlobalVariables.queryEntityInfo[x.selectedProperty].valueType == "image") {
            viewImageOption = true;
            continue;
        }
        if (GlobalVariables.queryEntityInfo[x.selectedProperty].valueType == "coordinates") {
            viewMapOption = true;
            continue;
        }
    }

    let labelLanguages:string = "cs";
    let displayWikiArticle:boolean = false;


    let nameLine:queryTriple;
    //A check for a custom property (currently only "Jméno")
    for (let x = validTriples.length-1; x > -1 ; x--) {
        if (validTriples[x].selectedProperty == "Jméno") {
            nameLine = {item:"?0", property:GlobalVariables.queryEntityInfo[validTriples[x].selectedProperty].id, value:"", wantedValue:validTriples[x].selectedValue}
            validTriples.splice(x, 1);
        }
    }

    let queryValidity:boolean = (validTriples.length != 0);

    let queryLines:Array<queryTriple> = [];
    let uniqueVariables:Set<string> = new Set();
    let labels:Array<string> = [];
    let labelsDisplayParity:Array<boolean> = [];
    

    let mainQuery:string;
    let resultCountQuery:string;
    let queryResultsCount:string|number;
    const iframeURL:string = 'https://query.wikidata.org/embed.html#';

    $: encodedMainQueryLink = iframeURL + encodeURIComponent(mainQuery);

    function formatTripleAndFilter(queryLine:queryTriple, lineIndex:number):string {
                let output:string = "";
                switch (GlobalVariables.queryEntityInfo[validTriples[lineIndex].selectedProperty].valueType) {
                    case "string":
                        output += `${queryLine.item} ${queryLine.property} ${queryLine.value} .\n\t`;
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
                    case "link":
                    case "image":
                    case "coordinates":
                        output += `${queryLine.item} ${queryLine.property} ${queryLine.value} .\n\t`;
                        break;
                }
                return output;
            }

    function updateMainQuery() {
        mainQuery = `SELECT ${labels.map((x, i) => labelsDisplayParity[i] ? x : "").join(" ")} ${displayWikiArticle ? "?Stránka" : ""}
WHERE {
    ${[...uniqueVariables][0]} wdt:P31 ${GlobalVariables.queryEntityInfo[validTriples[0].selectedItem].id} .
    ${displayWikiArticle ? "?Stránka schema:about ?0. ?Stránka schema:isPartOf <https://en.wikipedia.org/>." : ""}
    ${nameLine?.wantedValue ? `${nameLine.item} ${nameLine.property} "${nameLine.wantedValue}"@cs .`: ""}
    ${queryLines.map(formatTripleAndFilter).join("")}
        
    SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "${labelLanguages}" .
        ${[...uniqueVariables].map((x, i) => `${x} rdfs:label ${labels[i]} .`).join("\n\t\t")}
    }
    FILTER(LANG(${labels[0]}) = "cs")
    ${validTriples.map((x, i) => GlobalVariables.queryEntityInfo[x.selectedProperty].valueType == "string" 
    ? labelLanguages.length < 5 ? `FILTER(LANG(${labels[i+1]}) = "cs")\n\t` : ""
    : `BIND(${[...uniqueVariables][i+1]} AS ${labels[i+1]})\n\t`).join("")}
}
LIMIT ${resultsLimit}
${defaultViewOption}`;

            console.log("Main query for Iframe Display:\n" + mainQuery);
    }
    function updateQueryTriples() {
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

            labelsDisplayParity = labels.map(x => true);

            updateMainQuery();


            resultCountQuery = `SELECT (COUNT(*) AS ?resultsNum)
WHERE {
    ${[...uniqueVariables][0]} wdt:P31 ${GlobalVariables.queryEntityInfo[validTriples[0].selectedItem].id} .
    ${nameLine?.wantedValue ? `${nameLine.item} ${nameLine.property} "${nameLine.wantedValue}"@cs .`: ""}
    ${queryLines.map(formatTripleAndFilter).join("")}
}`;

            queryResultsCount = "...";
            console.log("Query for estimated result count\n" + resultCountQuery);

            queryDispatcher.query(resultCountQuery, "redundant").then(queryJSON => {
                console.log(queryJSON.data.results.bindings)
                queryResultsCount = queryJSON.data.results.bindings[0]["resultsNum"].value;
            }).catch(err => {
                console.log("Error for estimated result count\n" + err);
                queryResultsCount = "Nastala chyba při načtení";
            });
        }
    }
    updateQueryTriples();

    let iframeVisibilty:boolean = false;

    function toggleIframe() {
        iframeVisibilty = !iframeVisibilty;
    }

    function toggleVariableDisplay(event) {
        labelsDisplayParity[event.detail.id] = event.detail.parity;
        updateMainQuery();
    }

    function toggleLanguageOption(event) {
        if (event.detail.parity) {
            labelLanguages = "cs,en,de,es,fr,it";
        } else labelLanguages = "cs";
        updateMainQuery();
    }

    function toggleWikiArticleOption(event) {
        displayWikiArticle = event.detail.parity;
        updateMainQuery();
    }

    function toggleImageView(event) {
        if (event.detail.parity) {
            defaultViewOption = "#defaultView:ImageGrid";
        } else defaultViewOption = "";
        updateMainQuery();
    }

    function toggleMapView(event) {
        if (event.detail.parity) {
            defaultViewOption = "#defaultView:Map";
        } else defaultViewOption = "";
        updateMainQuery();
    }
    
    function updateResultsLimit(event) {
        resultsLimit = event.detail.resultsLimit;
        updateMainQuery();
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
</style>


<div>
    {#if iframeVisibilty}
        <button id="backButton" on:click={toggleIframe}>🔙</button>
        <iframe class="wikidataIframeSolo" style="width: 90vw; height: 94vh; border: none;" title="wikidata" src={encodedMainQueryLink} referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups">
        </iframe>
    {:else}
        <button id="backButton" on:click={toggleResults}>🔙</button>
        <OptionsScreen on:toggleIframe={toggleIframe} on:updateResultsLimit={updateResultsLimit} on:toggleVariableDisplay={toggleVariableDisplay}
        on:toggleWikiArticleOption={toggleWikiArticleOption} on:toggleLanguageOption={toggleLanguageOption} on:toggleImageView={toggleImageView} on:toggleMapView={toggleMapView}
        validity={queryValidity} {queryResultsCount} {resultsLimit} languageOption={labelLanguages.length>4} {viewMapOption} {viewImageOption} {labels} {labelsDisplayParity} {displayWikiArticle}></OptionsScreen>
        {#if !queryValidity}
            <p style="color:#663333; font-size:20px; text-align:center;">Vyplňtě prosím alespoň jednu vlastnot které není: Jméno</p>
        {/if}
    {/if}
</div>