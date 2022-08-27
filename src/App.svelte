<script lang="ts">
    import RDFSTripleSet from "./components/queryBuilder/IndividualTripleManager.svelte";
    import ResultsDisplay from "./components/queryResults/finalDisplay.svelte"
    import GlobalVariables from "./components/GlobalVariables";
    import type {selectedTripleDetails} from "./components/GlobalVariables";
    let queryResults:number|string = 0;




    let resultsVisibility:boolean = false;
    function toggleResults():void {
        resultsVisibility = !resultsVisibility;
    }
    

    let triples:Array<selectedTripleDetails> = [];
    const maxTriples:number = 8;
    for (let x = 0; x < maxTriples; x++) {
        triples.push({
            "tripleID":x,
            "visibility":false,
            "items":[],
            "selectedItem":"",
            "selectedProperty":"",
            "selectedNumberInterval": "Méně než",
            "selectedTimePeriod": "Před",
            "selectedTimePrecision": "Rok",
            "selectedValue":""})
        // Default values are pushed for all possibilities to simplify default selectors for each input box 
    }

    triples[0].items = GlobalVariables.queryItemVariables;
    triples[0].visibility = true;
    
    let ActivatorForResultCount = 0;

    function updatePossibleItemsForTriples():void {
        triples[0].items = GlobalVariables.queryItemVariables;
        if (triples[0].items.indexOf(triples[0].selectedItem) < 0) {
            triples[0].selectedItem = "";
            triples[0].selectedProperty = "";
        }
        let possibleItems:Set<string> = new Set();
        for (let x = 0; x < maxTriples-1; x++) {
            if (triples[x].selectedItem) possibleItems.add(triples[x].selectedItem);
            //Used to get rid of the option to used wanted values as items
            // if (!triples[x].selectedValue && triples[x].selectedProperty) {
            if (triples[x].selectedProperty) {
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

        for (let x = 0; x <= lastVisible; x++) {
            updatePossibleItemsForTriples();

            lastVisible = triples.map(x => x.visibility).lastIndexOf(true);
            for (let x in triples) {
                if (triples[x].visibility && !triples[x].selectedItem && +x != lastVisible) {
                    triples[x].visibility = false;
                }
            }
            triples.sort((a, b) => +b.visibility - +a.visibility);
            triples[0].items = GlobalVariables.queryItemVariables;
            ActivatorForResultCount++
        }
        
    }

    import type {queryTriple} from "./components/GlobalVariables"
    import {SPARQLQueryDispatcher} from "./components/SPARQLQueryDispatcher";
import InfoSign from "./components/queryBuilder/InfoSign.svelte";
    let lastResultQueryID:number = +new Date(); //Ensures that the last query sent will be the one displayed
    let lastResultQuery:string; //Ensures that the same query isn't being sent every 5 seconds
    setInterval(resultsCounter, 5000)
    function resultsCounter() {
        const queryDispatcher = new SPARQLQueryDispatcher('https://query.wikidata.org/sparql');


        let validTriples:Array<selectedTripleDetails> = [...triples].filter(x => x.selectedProperty);

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
        let resultCountQuery:string;
        let queryValidity:boolean = (validTriples.length != 0);

        if (queryValidity) {
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


            resultCountQuery = `SELECT (COUNT(*) AS ?resultsNum)
WHERE {
    ${[...uniqueVariables][0]} wdt:P31 ${GlobalVariables.queryEntityInfo[validTriples[0].selectedItem].id} .
    ${nameLine?.wantedValue ? `${nameLine.item} ${nameLine.property} "${nameLine.wantedValue}"@cs .`: ""}
    ${queryLines.map(formatTripleAndFilter).join("")}
}`;

            
            let now = +new Date();
            if (resultCountQuery != lastResultQuery) {
                lastResultQueryID = now;
                lastResultQuery = resultCountQuery;
                
                queryResults = "...";
                console.log("Query for estimated result count: " + lastResultQueryID + "\n" + resultCountQuery);

                queryDispatcher.query(resultCountQuery, now).then(queryJSON => {
                    // console.log ("\n\n\n=================\n\n\n", queryJSON.queryID, "\n", lastResultQuery.toString(), "\n\n", queryJSON.data.results.bindings[0]["resultsNum"].value)
                    if (queryJSON.data == "Timeout") {
                        queryResults = "Přílíš moc aby se rychle našli"; // Buď žádný nebo velmi mnoho
                    } else if (typeof queryJSON.data == "string") {
                        throw queryJSON.data
                    } else if (queryJSON.queryID == lastResultQueryID.toString()) {
                        queryResults = queryJSON.data.results.bindings[0]["resultsNum"].value;
                    }
                }).catch(err => {
                    console.log("Error for estimated result count\n" + err);
                    queryResults = "Nastala zvláštní chyba při načtení";
                });
            }
        }
    }
</script>

<style>
    main {
        background-color: rgb(176, 176, 176);
        min-height: 100vh;
    }
    
    #displayButton {
        position: sticky;
        scroll-behavior: auto;
        background-color: #81e62e;
        border-color: #105321;
        color:black;
        border-radius: 5px;
        border-width: 2px;
        transform: scale(1.3);
        margin: 1em;
        padding-right:5px;
        top: 92vh;
        left: 92vw;
    }

    #displayButton:disabled {
        background-color: #6ca042;
        color: black;
    }
</style>

<main>
    {#if resultsVisibility}
        <ResultsDisplay validTriples={[...triples].filter(x => x.selectedProperty)} on:toggleResults={toggleResults}></ResultsDisplay>
    {:else}
        {#each triples as triple}
            {#if triple.visibility}
                <RDFSTripleSet tripleDetails={triple} on:tripleDetailsChange={handleTripleDetailsChange}></RDFSTripleSet>
            {/if}
        {/each}
        <p style="margin-left: 8px">Přibližný počet výsledků: {queryResults}</p>
        {#if triples[maxTriples-1].visibility}
            <p style="color:darkred; font-size:24px; margin: 8px 10px 0 10px">Dosáhli jste limitu řádků!</p>
            <p style="padding-left: 8px; margin: 0">(Pravděpodobně by se nenašly žádné výsledky)</p>
        {/if}
        {#if !triples[0].selectedProperty}
            <button id="displayButton" on:click={toggleResults} disabled><img src="./display.png" width="20px" height="15px" alt="">Zobrazit</button>
        {:else}
            <button id="displayButton" on:click={toggleResults}><img src="./display.png" width="20px" height="15px" alt="">Zobrazit</button>
        {/if}
    {/if}
</main>
  