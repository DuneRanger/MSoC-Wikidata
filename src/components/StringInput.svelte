<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import InfoSign from "./InfoSign.svelte";
    const dispatch:any = createEventDispatcher();
    
    function handleInputChange(event):void {
        dispatch("InputChange", {
            inputValue: event.srcElement.value
        })
    }

    export let examples:Array<string>;
    export let id:number;

    setTimeout(() => {
        //True types are commented, becuase of ridiculous type requirements (e.g. 56 more required properties)
        let inputBox:any/*HTMLInputElement*/ = document.getElementById("stringInput"+id);
        let exampleValues:any/*HTMLDataListElement*/ = document.getElementById("examplesDatalist"+id);
        let container:any/*HTMLDivElement*/ = document.getElementById("stringInputContainer"+id);
        let currentFocus:number = -1;

        for (let option of exampleValues.options) {
            option.onclick = function ():void {
                inputBox.value = option.value;
                inputBox.dispatchEvent(new Event("change"));
                container.style.zIndex = "0";
                exampleValues.style.display = 'none';
                inputBox.style.borderRadius = "3px";
            }
        };

        inputBox.onfocus = function ():void {
            container.style.zIndex = (100-id).toString();
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
                    container.style.zIndex = (100-id).toString();
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
        max-height: 11rem;
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

<div id={"stringInputContainer"+id}>
    <input list="" id={"stringInput"+id} role="combobox" placeholder="Prázdné pole = Jakákoliv hodnota" on:change={handleInputChange}>
    <!-- Its important that you keep list attribute empty to hide the default dropdown icon and the browser's default datalist -->

    
    <datalist id={"examplesDatalist"+id}>
        <option value="Chrome">Chrome</option>
        <option value="Chrome">Chrome</option>
        <option value="Chrome">Chrome</option>
        <option value="Firefox">Firefox</option>
        {#if examples}
            {#each examples as example}
                <option value={example}>{example}</option>
            {/each}
        {/if}
    </datalist>

    <InfoSign text="Pozor! Je možné, že uložené data nebudou pod stejným názvem, který zadáte"></InfoSign>
</div>
