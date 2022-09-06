<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import InfoSign from "./InfoSign.svelte";
    const dispatch:any = createEventDispatcher();

    export let validity:boolean; //validity of the query itself
    export let resultsLimit:string|number = 100;
    export let queryResultsCount:string|number;

    export let languageOption:boolean;
    export let thoroughFilterOption:boolean;

    export let viewImageOption:boolean;
    export let viewMapOption:boolean;

    export let labels:Array<string>;
    export let labelsDisplayParity:Array<boolean>;

    export let displayWikiArticle:boolean;

    function toggleIframe() {
        dispatch("toggleIframe");
    }

    function toggleLanguageOption(event) {
        dispatch("toggleLanguageOption", {
            parity: event.srcElement.checked
        });
    }

    function toggleFilterOption(event) {
        dispatch("toggleFilterOption", {
            parity: event.srcElement.checked
        });
    }

    function toggleWikiArticleOption(event) {
        dispatch("toggleWikiArticleOption", {
            parity: event.srcElement.checked
        });
    }

    function toggleMapView(event) {
        dispatch("toggleMapView", {
            parity: event.srcElement.checked
        });
    }

    function toggleImageView(event) {
        dispatch("toggleImageView", {
            parity: event.srcElement.checked
        });
    }

    function toggleVariableDisplay(event) {
        dispatch("toggleVariableDisplay", {
            id: event.srcElement.id.slice(8),
            parity: event.srcElement.checked
        });
    }

    function changeResultsLimit(event) {
        dispatch("updateResultsLimit", {
            resultsLimit: event.srcElement.value
        });
    }
</script>

<style>
    #main {
        text-align: center;
    }

    input[type=checkbox] {
        height: auto;
        margin: 0 5px 0 0;
    }

    .displayOptions ul {
        list-style: none;
        padding: 0px;
        display: contents;
    }

    .displayOptions li {
        padding:3px;
    }

    label[for=displayVariables] {
        font-size: 18px;
        font-weight: 500;
    }

    #continueButton {
        width:100px;
        margin-top: 3vh;
    }

    p {
        font-size: 16px;
        margin: 4px;
    }
</style>

<div id="main">
    <p style="font-weight: 500">
        Počet výsledků bez filterů: {queryResultsCount}
    </p>

    <!-- <span style="font-size:14px; margin-top:30px;">Doporučeno v případě že načítaní trvá moc dlouho</span>
    <br> -->
    
    Limit na počet výsledků: <input type="number" value={resultsLimit} on:change={changeResultsLimit} style="width: 100px">
    <InfoSign text="Doporučeno v případě že načítaní trvá moc dlouho"></InfoSign>
    <br>

    <div class="displayOptions">
        <ul>
            <li>
                <input type="checkbox" id="languageOption" on:change={toggleLanguageOption} checked={languageOption}>
                <label for="languageOption">Hledat výsledky i v ostatních jazycích <InfoSign text="Angličtina, němčina, španělština, ..."></InfoSign></label>
            </li>
            <li>
                <input type="checkbox" id="thoroughFilterOption" on:change={toggleFilterOption} checked={thoroughFilterOption}>
                <label for="thoroughFilterOption">Důkladnější hledání zadaných hodnot <InfoSign text="Pomalejší, ale vhodné když jste zadali jen část jména nebo názvu"></InfoSign></label>
            </li>
            <li>
                <input type="checkbox" id="wikiArticleOption" on:change={toggleWikiArticleOption} checked={displayWikiArticle}>
                <label for="wikiArticleOption">Najít výsledky se stránkou ve Wikipédii</label>
            </li>
            {#if viewMapOption}
                <li>
                    <input type="checkbox" id="viewMapOption" on:change={toggleMapView} checked={viewMapOption}>
                    <label for="viewMapOption">Zobrazit hned jako mapu <InfoSign text="Zobrazení lze zmenit v levé části mapy"></InfoSign></label>
                </li>
            {:else if viewImageOption}
                <li>
                    <input type="checkbox" id="viewImageOption" on:change={toggleImageView} checked={viewImageOption}>
                    <label for="viewImageOption">Zobrazit hned s obrázky <InfoSign text="Zobrazení lze zmenit v levé části tabulky"></InfoSign></label>
                </li>
            {/if}
        </ul>
    </div>
    <br>
    <div class="displayOptions" id="diplayVariables">
        <label for="displayVariables">Vyberte které proměny uvidíte</label>
        <ul>
            {#each labels as x, i}
                <li><input type="checkbox" id={"variable" + i} checked={labelsDisplayParity[i]} on:change={toggleVariableDisplay}><label for={"variable" + i}>{x.slice(1,)}</label></li>
            {/each}
        </ul>
    </div>

    {#if validity}
        <button id="continueButton" on:click={toggleIframe}>Pokračovat</button>
    {:else}
        <button id="continueButton" on:click={toggleIframe} disabled>Pokračovat</button>
    {/if}
</div>