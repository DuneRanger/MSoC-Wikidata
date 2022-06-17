<script lang="ts">
	let baseLink = 'https://query.wikidata.org/embed.html#';
	let code = `#Largest cities of the world
#defaultView:BubbleChart
SELECT DISTINCT ?cityLabel ?population ?gps
WHERE
{
  ?city wdt:P31/wdt:P279* wd:Q515 .
  ?city wdt:P1082 ?population .
  ?city wdt:P625 ?gps .
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en" .
  }
}
ORDER BY DESC(?population) LIMIT 100`
let encodedLink = baseLink + encodeURIComponent(code)
</script>

<iframe style="width: 100vw; height: 100vh; border: none;" title="shutup" src={encodedLink} referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-popups">
</iframe>