<script lang="ts">
    export let triples;

    const iframeURL:string = 'https://query.wikidata.org/embed.html#';
    let mainQuery:string = `SELECT ?prop ?propname
        WHERE
        {
        wd:Q5 wdt:P1963 ?prop .
        
        SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "cs" .
        ?prop rdfs:label ?propname .
        }
        } ORDER BY(?propname)`;
    let encodedLink:string;
    $: encodedLink = iframeURL + encodeURIComponent(mainQuery);
</script>

<style>
    #wikidataIframe {
        position: absolute;
        left: 50%;
        top: 30%;
        transform: translate(-50%, -30%);
    }
</style>



<iframe id="wikidataIframe" style="width: 90vw; height: 90vh; border: none;" title="wikidata" src={encodedLink} referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups">
</iframe>