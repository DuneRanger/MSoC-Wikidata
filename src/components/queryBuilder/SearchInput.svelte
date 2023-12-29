<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import InfoSign from "./InfoSign.svelte";
    import GlobalVariables from "./../GlobalVariables";
    import type {selectedTripleDetails, queryTriple} from "./../GlobalVariables";
    import { SPARQLQueryDispatcher } from "./../SPARQLQueryDispatcher";
    const dispatch:any = createEventDispatcher();
    
    function handleInputChange(event):void {
        dispatch("InputChange", {
            inputValue: event.srcElement.value
        });
    }

    export let searchInputValuesOption:number;
    export let allTriples:Array<selectedTripleDetails>; //For smarter querying
    export let tripleDetails:selectedTripleDetails;

    const queryDispatcher:any = new SPARQLQueryDispatcher('https://query.wikidata.org/sparql');
    let examples:Array<string>|undefined = undefined;
    let LoadingExamples:boolean = true;

    //Will trigger this function when the triple's property or the query option changes
    $: temp = tripleDetails.selectedProperty;
    $: temp, searchInputValuesOption, queryExampleValues();
    //Creates a query for example values for the property
    //And subsequently sets variables to the array of results
    async function queryExampleValues() {
        if (!tripleDetails.selectedItem || !tripleDetails.selectedProperty) return;
        examples = [];
        LoadingExamples = true;
        let propertyID:string = GlobalVariables.queryEntityInfo[tripleDetails.selectedProperty].id;
        //Creates a different query depending on the option selected
        switch (searchInputValuesOption) {
            //This is a fast and simple query, but has a wide variety of results
            case 0:
                //creates and processes 3 queries with increasing limits
                for (let x = 0; x < 3; x++) {
                    await queryDispatcher.query(`select distinct ?value ?valueLabel\n`
                    + `where {\n`
                    + `{\n`
                    + `    select distinct ?value \n`
                    + `    where {\n`
                    + `    ?subject ${propertyID} ?value.\n`
                    + `    \n`
                    + `    }group by ?value limit ${[100, 500, 2500][x]}\n`
                    + `} \n`
                    + `service wikibase:label { \n`
                    + `    bd:serviceParam wikibase:language "cs". \n`
                    + `    ?value rdfs:label ?valueLabel\n`
                    + `}\n`
                    + `filter (lang(?valueLabel) = "cs")\n`
                    + `}`, propertyID)
                    .then(queryJson => {
                        if (queryJson.data == "Timeout") {
                            console.log(`Timeout for fast${["small", "medium", "big"][x]} query for: ${tripleDetails.selectedProperty} (${propertyID})`)
                        }
                        else if (queryJson.queryID == GlobalVariables.queryEntityInfo[tripleDetails.selectedProperty].id) {
                            examples = queryJson.data.results.bindings.map(x => x.valueLabel.value);
                            console.log(`Fast ${["small", "medium", "big"][x]} query for ${tripleDetails.selectedProperty} (${propertyID}) was loaded`);
                        }
                    })
                    .catch(err => {
                        console.log(`Unexpected error for fast ${["small", "medium", "big"][x]} query for: ${tripleDetails.selectedProperty} (${propertyID}):
                        ${err}`);
                    });
                    renewOnclickEvents();
                }
                break;
            //This case creates a full query containing each preceding line, but is significantly slower
            case 1:
                //Put only in this case because it is guaranteed to be slower and possibly rewrite the results when switching to the faster method
                let currentOption = searchInputValuesOption; 

                let validTriples:Array<selectedTripleDetails> = [...allTriples].filter(x => x.selectedProperty);
                let nameLine:queryTriple;
                let tripleIndex:number;
                //A check for a custom property (currently only "Jméno")
                for (let x = validTriples.length-1; x > -1 ; x--) {
                    if (validTriples[x].selectedProperty == "Jméno" || validTriples[x].selectedProperty == "Název") {
                        nameLine = {item:"?0", property:GlobalVariables.queryEntityInfo[validTriples[x].selectedProperty].id, value:"", wantedValue:validTriples[x].selectedValue}
                        validTriples.splice(x, 1);
                    }
                }

                let queryValidity:boolean = (validTriples.length != 0);

                let queryLines:Array<queryTriple> = [];
                let uniqueVariables:Set<string> = new Set();

                //Formats each triple into equal lines for the query
                //There are different cases based on the type of value and if there is a wanted value
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
                                let intervalSymbol:string = {"Méně nebo rovno": "<=", "Méně než": "<", "Více nebo rovno": ">=", "Více než": ">", "Rovno": "="}[validTriples[lineIndex].selectedNumberInterval];
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
                
                //This doesn't have to be put in a function, but is left in one in case the need of updating the query is ever needed multiple times
                function updateQueryTriples() {
                    if (!queryValidity) {
                    } else {
                        //Gives each component in a triple the correct variable
                        for (let x = 0; x < validTriples.length; x++) {
                            let item:string = "";
                            //Checks if the item was already given a variable
                            for (let y = 0; y < x; y++) {
                                if (validTriples[x].selectedItem == validTriples[y].selectedItem) {
                                    item = queryLines[y].item;
                                    break;
                                }
                            }
                            //checks if the property (now an item) was already given a variable
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
                            if (validTriples[x].tripleID == tripleDetails.tripleID) tripleIndex = x;

                            queryLines.push({item:item, property:GlobalVariables.queryEntityInfo[validTriples[x].selectedProperty].id, value:value, wantedValue:validTriples[x].selectedValue});
                        }

                        //Adds each variable that was created into an easy Set to iterate through later
                        for (let x of queryLines) {
                            uniqueVariables.add(x.item);
                            if (x.value[0] == "?") uniqueVariables.add(x.value);
                        }
                    }
                }
                updateQueryTriples();
                //Creates 3 queries of increasing limits
                for (let x = 0; x < 3; x++) {
                    await queryDispatcher.query(`select distinct ?value ?valueLabel\n`
                    + `where {\n`
                    + `    ${[...uniqueVariables][0]} wdt:P31 ${GlobalVariables.queryEntityInfo[validTriples[0].selectedItem].id} .\n`
                    + `    ${nameLine?.wantedValue ? `${nameLine.item} ${nameLine.property} "${nameLine.wantedValue}"@cs .`: ""}\n`
                    + `    ${queryLines.map(formatTripleAndFilter).join("")}\n`
                    + `    bind(${queryLines[tripleIndex].value} as ?value)\n`
                    + `    service wikibase:label { \n`
                    + `        bd:serviceParam wikibase:language "cs" .\n`
                    + `        ?value rdfs:label ?valueLabel .\n`
                    + `    }\n`
                    + `    filter(lang(?valueLabel) = "cs")\n`
                    + `} limit ${[100, 500, 2000][x]}`, propertyID)
                    .then(queryJson => {
                        //I am not sure why the condition here is unique compared to others, but it shouldn't make a difference
                        //Unless unique steps need to  be taken in case of a timeout
                        if (!("results" in queryJson.data)) {
                            console.log(`Error for slow ${["small", "medium", "big"][x]} query for: ${tripleDetails.selectedProperty} (${propertyID}):\n`
                            + `${queryJson.data}\n`
                            + `TripleDetails for debugging:\n`
                            + `select distinct ?value ?valueLabel\n`
                            + `where {\n`
                            + `    ${[...uniqueVariables][0]} wdt:P31 ${GlobalVariables.queryEntityInfo[validTriples[0].selectedItem].id} .\n`
                            + `    ${nameLine?.wantedValue ? `${nameLine.item} ${nameLine.property} "${nameLine.wantedValue}"@cs .`: ""}\n`
                            + `    ${queryLines.map(formatTripleAndFilter).join("")}\n`
                            + `    bind(${queryLines[tripleIndex].value} as ?value)\n`
                            + `    service wikibase:label { \n`
                            + `        bd:serviceParam wikibase:language "cs" .\n`
                            + `        ?value rdfs:label ?valueLabel .\n`
                            + `    }\n`
                            + `    filter(lang(?valueLabel) = "cs")\n`
                            + `} limit ${[50, 250, 1500][x]}`);
                        } else if (queryJson.queryID == GlobalVariables.queryEntityInfo[tripleDetails.selectedProperty].id && currentOption == searchInputValuesOption) {
                            examples = queryJson.data.results.bindings.map(x => x.valueLabel.value);
                        }
                        console.log(`Slow ${["small", "medium", "big"][x]} query for ${tripleDetails.selectedProperty} (${propertyID}) was loaded`);
                    })
                    .catch(err => {
                        console.log(`Unexpected error for slow ${["small", "medium", "big"][x]} query for: ${tripleDetails.selectedProperty} (${propertyID}):\n`
                        + `${err}`);
                    });
                    renewOnclickEvents();
                }
                break;
            }
        LoadingExamples = false;
    }

    //Gives each option an onClick event when the options are reset
    function renewOnclickEvents():void {
        //HTML type is not used due to each element not having the same amount of properties
        let inputBox:any/*HTMLInputElement*/ = document.getElementById("stringInput"+tripleDetails.tripleID);
        let exampleValues:any/*HTMLDataListElement*/ = document.getElementById("examplesDatalist"+tripleDetails.tripleID);
        let container:any/*HTMLDivElement*/ = document.getElementById("stringInputContainer"+tripleDetails.tripleID);

        //Set as a timeout to ensure that the html elements have been loaded
        setTimeout(() => {
            for (let option of exampleValues.options) {
                option.onclick = function ():void {
                    inputBox.value = option.value;
                    inputBox.dispatchEvent(new Event("change"));
                    container.style.zIndex = "0";
                    exampleValues.style.display = 'none';
                    inputBox.style.borderRadius = "3px";
                }
            };
        });
    }

    //Set as a timeout to ensure that the html elements have been loaded
    setTimeout(() => {
        //True types are commented, becuase of ridiculous type requirements (e.g. 56 more required properties)
        let inputBox:any/*HTMLInputElement*/ = document.getElementById("stringInput"+tripleDetails.tripleID);
        let exampleValues:any/*HTMLDataListElement*/ = document.getElementById("examplesDatalist"+tripleDetails.tripleID);
        let container:any/*HTMLDivElement*/ = document.getElementById("stringInputContainer"+tripleDetails.tripleID);
        let currentFocus:number = -1;

        renewOnclickEvents();

        inputBox.onfocus = function ():void {
            container.style.zIndex = (100-tripleDetails.tripleID).toString();
            exampleValues.style.display = 'block';
            inputBox.style.borderRadius = "3px 3px 0 0";
        };

        //onblur disrupts options.onclick, so this method of unfocusing was chosen instead
        //It can theoretically overload the element with listeners, but the user would have to be incredibly indecisive for a long period of time
        document.addEventListener("click", function(e):void {
            if (!container.contains(e.target)) {
                container.style.zIndex = "0";
                exampleValues.style.display = "none";
                inputBox.style.borderRadius = "3px";
            }
        });

        //Takes care of filtering options according to user input
        inputBox.oninput = function():void {
            currentFocus = -1;
            let text:string = inputBox.value.toUpperCase();
            for (let option of exampleValues.options) {
                if(option.value.toUpperCase().indexOf(text) > -1){
                    option.style.display = "block";
                }else{
                    option.style.display = "none";
                }
            };
        }

        //Adds the possibility of using the keyboard to navigate the options
        inputBox.onkeydown = function(e):void {
            if(e.keyCode == 40){
                currentFocus++;
                addActive(exampleValues.options);
            }
            else if(e.keyCode == 38){
                currentFocus--;
                addActive(exampleValues.options);
            }
            else if(e.keyCode == 13){
                e.preventDefault();
                if (currentFocus > -1) {
                    /*simulate a click on the "active" item:*/
                    if (exampleValues.options) exampleValues.options[currentFocus].click();
                }
            }
        }
    
        function addActive(x):void {
            if (!x) return;
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            x[currentFocus].classList.add("active");
        }

        function removeActive(x):void {
            for (var i = 0; i < x.length; i++) {
                x[i].classList.remove("active");
            }
        }
    });
</script>

<style>
    input {
        /* Changing this width requires changing datalist.width */
        width: 362px;
        margin: 0;
        outline: 1px;
    }
    datalist {
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 0 0 5px 5px;
        border-top: none;
        font-family: sans-serif;
        width: 350px;
        padding: 5px;
        max-height: 14rem;
        overflow-y: auto;
    }

    option {
        background-color: white;
        padding: 4px;
        color: rgb(53, 53, 53);
        margin-bottom: 1px;
        font-size: 18px;
        cursor: pointer;
    }

    option:hover,.active{
        background-color: lightblue;
    }

    div {
        position: absolute;
        display: inline-block;
        margin: 0 0 0 5px;
    }

</style>


<div style="display:none" class="active"></div> 
<!-- This has to exist, so that svelte compiles the css for .active -->

<div id={"stringInputContainer"+tripleDetails.tripleID}>
    <input list="" id={"stringInput"+tripleDetails.tripleID} value={tripleDetails.selectedValue} placeholder="Prázdné pole = Jakákoliv hodnota" on:change={handleInputChange}>
    <!-- Its important that the list is attribute empty to hide the default dropdown icon and the browser's default datalist -->

    
    <datalist id={"examplesDatalist"+tripleDetails.tripleID}>
        {#if LoadingExamples}
            <option value="" disabled>Načítají se další možnosti...</option>  
            {#if examples}
                {#each examples as example}
                    <option value={example}>{example}</option>
                {/each}
            {/if}
        {:else}
            <!-- examples will always exist at this point-->
            {#if examples?.length == 0}
                <option value="" disabled>Nastala chyba při hledání možností</option>
                <option value="" disabled>Stále můžete zadat hodnoty, které hledáte</option>
            {:else}
                {#each examples as example}
                    <option value={example}>{example}</option>
                {/each}
            {/if}
        {/if}
    </datalist>

    <InfoSign text="Můžete zadat vlastní hodnoty, ale není zaručeno, že je v databázi pod stejným názvem"></InfoSign>
</div>
