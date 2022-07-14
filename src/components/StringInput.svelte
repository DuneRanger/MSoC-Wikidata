<script lang="ts">
    export let examples;
    export let id;
    export let highestID;
    $: console.log(id, highestID)
    $: if (examples) {
        examples = Object.keys(examples)
    }
    setTimeout(() => {
        let inputBox:any = document.getElementById("stringInput"+id);
        let exampleValues:any = document.getElementById("examplesDatalist"+id);
        let formattingBreak:any = document.getElementById("secretLineBreak"+id)
        let container:any = document.getElementById("stringInputContainer"+id)
        let currentFocus = -1;
        // var boxWidth = 350;

        for (let option of exampleValues.options) {
            option.onclick = function () {
                inputBox.value = option.value;
                container.style.zIndex = 0;
                formattingBreak.style.display = 'block';
                exampleValues.style.display = 'none';
                inputBox.style.borderRadius = "3px";
            }
        };

        inputBox.onfocus = function () {
            container.style.zIndex = 100-id;
            formattingBreak.style.display = 'none';
            exampleValues.style.display = 'block';
            inputBox.style.borderRadius = "3px 3px 0 0";  
        };

        inputBox.oninput = function() {
            currentFocus = -1;
            let text = inputBox.value.toUpperCase();
            for (let option of exampleValues.options) {
                if(option.value.toUpperCase().indexOf(text) > -1){
                    container.style.zIndex = 100-id;
                    formattingBreak.style.display = 'none';
                    option.style.display = "block";
                }else{
                    container.style.zIndex = 0;
                    formattingBreak.style.display = 'block';
                    option.style.display = "none";
                }
            };
        }

        inputBox.onkeydown = function(e) {
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
    
        function addActive(x) {
            if (!x) return false;
            console.log(x)
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            x[currentFocus].classList.add("active");
        }
        function removeActive(x) {
            for (var i = 0; i < x.length; i++) {
                x[i].classList.remove("active");
            }
        }
    });
</script>

<style>
    input {
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

    p {
        display: inline;
        background-color: rgba(128, 128, 128, 1)
    }
</style>


<div style="display:none" class="active"></div> 
<!-- This has to exist, so that svelte compiles the css for .active -->

<div id={"stringInputContainer"+id}>
    <input list="" id={"stringInput"+id} role="combobox" placeholder="Prázdné pole = Jakákoliv hodnota">
    <!-- Its important that you keep list attribute empty to hide the default dropdown icon and the browser's default datalist -->

    
    <datalist id={"examplesDatalist"+id}>
        <option value="Chrome">Chrome</option>
        <option value="Firefox">Firefox</option>
        {#if examples}
            {#each examples as example}
                <option value={example}>{example}</option>
            {/each}
        {/if}
    </datalist>
    
    {#if id>=highestID}
        <p>
            <br id={"secretLineBreak"+id}>
            (Pozor, je možné, že uložené data nebudou pod stejným názvem, který zadáte)
        </p>
    {/if}

</div>
