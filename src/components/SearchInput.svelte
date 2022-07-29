<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import InfoSign from "./InfoSign.svelte";
    import GlobalVariables from "./GlobalVariables";
    import type {selectedTripleDetails} from "./GlobalVariables";
    import { SPARQLQueryDispatcher } from "./SPARQLQueryDispatcher";
    const dispatch:any = createEventDispatcher();
    
    function handleInputChange(event):void {
        dispatch("InputChange", {
            inputValue: event.srcElement.value
        })
    }

    export let tripleDetails:selectedTripleDetails;
    // let examples:Array<string> = Object.keys(GlobalVariables.queryPropertyVariables[tripleDetails.selectedItem].properties[tripleDetails.selectedProperty].examples)
    const queryDispatcher = new SPARQLQueryDispatcher('https://query.wikidata.org/sparql');
    let examples:Array<string>|undefined = undefined;
    let LoadingExamples:boolean = true;
    $: temp = tripleDetails.selectedProperty
    $: temp, queryExampleValues();
    async function queryExampleValues() {
        examples = undefined;
        LoadingExamples = true;
        let sparqlQuery = `select distinct ?value ?valueLabel
            where {
            {
                select distinct ?value 
                where {
                ?subject wdt:${GlobalVariables.queryPropertyVariables[tripleDetails.selectedItem].properties[tripleDetails.selectedProperty].id} ?value.
                
                }group by ?value limit 100
            } 
            SERVICE wikibase:label { 
                bd:serviceParam wikibase:language "cs". 
                ?value rdfs:label ?valueLabel
            }
            filter (lang(?valueLabel) = "cs")
            #   filter (contains(?valueLabel, "Král"@cs))
            }
            `;
        let bigSparqlQuery = `select distinct ?value ?valueLabel
            where {
            {
                select distinct ?value 
                where {
                ?subject wdt:${GlobalVariables.queryPropertyVariables[tripleDetails.selectedItem].properties[tripleDetails.selectedProperty].id} ?value.
                
                }group by ?value limit 2500
            } 
            SERVICE wikibase:label { 
                bd:serviceParam wikibase:language "cs". 
                ?value rdfs:label ?valueLabel
            }
            filter (lang(?valueLabel) = "cs")
            }`
        let smallOutput = queryDispatcher.query(sparqlQuery).then(data => {examples = data.results.bindings.map(x => x.valueLabel.value); console.log("small", examples.length, examples[0])});
        let bigOutput = queryDispatcher.query(bigSparqlQuery);
        
        await smallOutput;
        renewOnclickEvents();
        await bigOutput.then(data => {examples = data.results.bindings.map(x => x.valueLabel.value); console.log("big", examples.length, examples[0])});
        renewOnclickEvents();
        LoadingExamples = false;
    }

    function renewOnclickEvents() {
        let inputBox:any/*HTMLInputElement*/ = document.getElementById("stringInput"+tripleDetails.tripleID);
        let exampleValues:any/*HTMLDataListElement*/ = document.getElementById("examplesDatalist"+tripleDetails.tripleID);
        let container:any/*HTMLDivElement*/ = document.getElementById("stringInputContainer"+tripleDetails.tripleID);

        setTimeout(() => {
            for (let option of exampleValues.options) {
                option.onclick = function (event):void {
                    console.log(event)
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
        /* Changing this with requires changing datalist.width and the css in InfoSign.svelt */
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
    <input list="" id={"stringInput"+tripleDetails.tripleID} role="combobox" placeholder="Prázdné pole = Jakákoliv hodnota" on:change={handleInputChange}>
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
            {#each examples as example}
                <option value={example}>{example}</option>
            {/each}
        {/if}
    </datalist>

    <InfoSign text="Můžete zadat jiné hodnoty, ale uložené data nemusí být pod stejným názvem!"></InfoSign>
</div>
