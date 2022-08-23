<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import InfoSign from "./InfoSign.svelte";
    import GlobalVariables from "./../GlobalVariables";
    import type {selectedTripleDetails} from "./../GlobalVariables";
    import { SPARQLQueryDispatcher } from "./../SPARQLQueryDispatcher";
    const dispatch:any = createEventDispatcher();
    
    function handleInputChange(event):void {
        dispatch("InputChange", {
            inputValue: event.srcElement.value
        });
    }

    export let tripleDetails:selectedTripleDetails;

    const queryDispatcher:any = new SPARQLQueryDispatcher('https://query.wikidata.org/sparql');
    let examples:Array<string>|undefined = undefined;
    let LoadingExamples:boolean = true;

    $: temp = tripleDetails.selectedProperty;
    $: temp, queryExampleValues();
    async function queryExampleValues() {
        if (!tripleDetails.selectedItem || !tripleDetails.selectedProperty) return;
        examples = undefined;
        LoadingExamples = true;
        let propertyID:string = GlobalVariables.queryEntityInfo[tripleDetails.selectedProperty].id;
        let sparqlQuery:string = `select distinct ?value ?valueLabel
            where {
            {
                select distinct ?value 
                where {
                ?subject ${propertyID} ?value.
                
                }group by ?value limit 100
            } 
            SERVICE wikibase:label { 
                bd:serviceParam wikibase:language "cs". 
                ?value rdfs:label ?valueLabel
            }
            filter (lang(?valueLabel) = "cs")
            }`;
        let bigSparqlQuery:string = `select distinct ?value ?valueLabel
            where {
            {
                select distinct ?value 
                where {
                ?subject ${propertyID} ?value.
                
                }group by ?value limit 2500
            } 
            SERVICE wikibase:label { 
                bd:serviceParam wikibase:language "cs". 
                ?value rdfs:label ?valueLabel
            }
            filter (lang(?valueLabel) = "cs")
            }`;
        let smallOutput:Promise<{propertyID:string,data:any}> = queryDispatcher.query(sparqlQuery, propertyID).then(queryJson => {
            if (queryJson.propertyID == GlobalVariables.queryEntityInfo[tripleDetails.selectedProperty].id) {
                examples = queryJson.data.results.bindings.map(x => x.valueLabel.value);
            }
            console.log("small query for: " + tripleDetails.selectedProperty + " (" + propertyID + ")");
        })
        .catch(err => {
            examples = [];
            console.log(err, tripleDetails);
        });
        let bigOutput:Promise<{propertyID:string,data:any}> = queryDispatcher.query(bigSparqlQuery, propertyID);
        
        await smallOutput;
        renewOnclickEvents();
        await bigOutput.then(queryJson => {
            if (queryJson.propertyID == GlobalVariables.queryEntityInfo[tripleDetails.selectedProperty].id) {
                examples = queryJson.data.results.bindings.map(x => x.valueLabel.value);
            }
            console.log("big query for " + tripleDetails.selectedProperty + " (" + propertyID + ")");
        })
        .catch(err => {
            examples = [];
            console.log(err, tripleDetails);
        });
        renewOnclickEvents();
        LoadingExamples = false;
    }

    function renewOnclickEvents():void {
        //HTML type is not used due to each element not having the same amount of properties
        let inputBox:any/*HTMLInputElement*/ = document.getElementById("stringInput"+tripleDetails.tripleID);
        let exampleValues:any/*HTMLDataListElement*/ = document.getElementById("examplesDatalist"+tripleDetails.tripleID);
        let container:any/*HTMLDivElement*/ = document.getElementById("stringInputContainer"+tripleDetails.tripleID);

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

        // onblur disrupts options.onclick, so this method of unfocusing was chosen instead
        document.addEventListener("click", function(e):void {
            if (!container.contains(e.target)) {
                container.style.zIndex = "0";
                exampleValues.style.display = "none";
                inputBox.style.borderRadius = "3px";  
            }
        });

        inputBox.oninput = function():void {
            currentFocus = -1;
            let text:string = inputBox.value.toUpperCase();
            for (let option of exampleValues.options) {
                if(option.value.toUpperCase().indexOf(text) > -1){
                    container.style.zIndex = (100-tripleDetails.tripleID).toString();
                    option.style.display = "block";
                }else{
                    container.style.zIndex = "0";
                    option.style.display = "none";
                }
            };
        }

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
    <!-- Its important that you keep list attribute empty to hide the default dropdown icon and the browser's default datalist -->

    
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
            {#if examples.length == 0}
                <option value="" disabled>Nastala chyba při hledání možností</option>
                <option value="" disabled>Stále můžete zadat hodnoty, které hledáte</option>
            {:else}
                {#each examples as example}
                    <option value={example}>{example}</option>
                {/each}
            {/if}
        {/if}
    </datalist>

    <InfoSign text="Můžete zadat vlastní hodnoty, ale není zaručeno, že je v databázi pod stejným názvem!"></InfoSign>
</div>
