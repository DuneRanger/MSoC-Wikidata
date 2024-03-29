class SPARQLQueryDispatcher {
    endpoint;
    constructor( endpoint ) {
        this.endpoint = endpoint;
    }

    async baseQuery(idForQuery) {

        const sparqlQuery = `SELECT DISTINCT
?propertyAsEntity
?propertyAsEntityLabel
?propertyAsProperty
?exampleItemWithProperty
?exampleValueOfPropertyLabel
WHERE {
    wd:${idForQuery} wdt:P1963 ?propertyAsEntity . #Gets all common properties for the item
    ?propertyAsEntity wdt:P1855 ?exampleItemWithProperty . #Gets examples of items that have this property (this unfortunately gets all examples listed and I can't figure out how to limit it)
    BIND(iri(replace(str(?propertyAsEntity), "entity", "prop/direct")) as ?propertyAsProperty) #This line changes each property uri from an entity to a prop/direct (usable as a wdt:P___)
    ?exampleItemWithProperty ?propertyAsProperty ?exampleValueOfProperty . #Gets the value of the property for the example
        
    SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "cs" .
        ?propertyAsEntity rdfs:label ?propertyAsEntityLabel .
        ?exampleValueOfProperty rdfs:label ?exampleValueOfPropertyLabel .
    }
  #Filtering labels also tends to filter numbers and dates, so no filters are set and the choosing of value is done in main.js
} ORDER BY(?propertyAsEntityLabel) #Orders alphabetically
`;
        const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
        const headers = { 'Accept': 'application/sparql-results+json' };

        return await fetch(fullUrl, {headers}).then(body => body.json()).catch(err => {throw err});
    }

    async propertyQuery(idForQuery) {

        const sparqlQuery = `SELECT DISTINCT
        ?propertyAsEntity
        ?propertyAsEntityLabel
        ?propertyAsProperty
        ?exampleItemWithProperty
        ?exampleValueOfPropertyLabel
        ?subclass3Label
        ?subclassLabel
        WHERE {
            wd:${idForQuery} wdt:P1629 ?item .
            {
            ?item wdt:P1963 ?propertyAsEntity . #Gets all common properties for the item
            ?propertyAsEntity wdt:P1855 ?exampleItemWithProperty . #Gets examples of items that have this property (this unfortunately gets all examples listed and I can't figure out how to limit it)
            BIND(iri(replace(str(?propertyAsEntity), "entity", "prop/direct")) as ?propertyAsProperty) #This line changes each property uri from an entity to a prop/direct (usable as a wdt:P___)
            ?exampleItemWithProperty ?propertyAsProperty ?exampleValueOfProperty . #Gets the value of the property for the example
            }
            Union
            {
              ?item wdt:P279 ?subclass .
              ?subclass wdt:P1963 ?propertyAsEntity . #Gets all common properties for the item
              ?propertyAsEntity wdt:P1855 ?exampleItemWithProperty . #Gets examples of items that have this property (this unfortunately gets all examples listed and I can't figure out how to limit it)
              BIND(iri(replace(str(?propertyAsEntity), "entity", "prop/direct")) as ?propertyAsProperty) #This line changes each property uri from an entity to a prop/direct (usable as a wdt:P___)
              ?exampleItemWithProperty ?propertyAsProperty ?exampleValueOfProperty . #Gets the value of the property for the example
            }
            Union
            {
              ?item wdt:P279 ?subclass .
              ?subclass wdt:P279 ?subclass3 .
              ?subclass3 wdt:P1963 ?propertyAsEntity . #Gets all common properties for the item
              ?propertyAsEntity wdt:P1855 ?exampleItemWithProperty . #Gets examples of items that have this property (this unfortunately gets all examples listed and I can't figure out how to limit it)
              BIND(iri(replace(str(?propertyAsEntity), "entity", "prop/direct")) as ?propertyAsProperty) #This line changes each property uri from an entity to a prop/direct (usable as a wdt:P___)
              ?exampleItemWithProperty ?propertyAsProperty ?exampleValueOfProperty . #Gets the value of the property for the example
            }
            SERVICE wikibase:label { 
                bd:serviceParam wikibase:language "cs" .
                ?propertyAsEntity rdfs:label ?propertyAsEntityLabel .
        #         ?exampleValueOfProperty rdfs:label ?exampleValueOfPropertyLabel .
            }
          #Filtering labels also tends to filter numbers and dates, so no filters are set and the choosing of value is done in main.js
        } ORDER BY(?propertyAsEntityLabel) #Orders alphabetically
`;
        const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
        const headers = { 'Accept': 'application/sparql-results+json' };

        return await fetch(fullUrl, {headers}).then(body => body.json()).catch(err => {throw err});
    }
}

const queryDispatcher = new SPARQLQueryDispatcher("https://query.wikidata.org/sparql");


let buttonForProperties = document.createElement("button");
buttonForProperties.innerHTML = "Click to query for basic property labels";
buttonForProperties.onclick = () => {queryForArgument("Properties")};
document.body.appendChild(buttonForProperties);

let buttonForDetails = document.createElement("button");
buttonForDetails.innerHTML = "Click to query for property details";
buttonForDetails.onclick = () => {queryForArgument("Details")};
document.body.appendChild(buttonForDetails);

async function temp(data) {
    let output = "";
    
        for (let x in data) {
            if (x > 0 && data[x].propertyAsEntityLabel.value == data[x-1].propertyAsEntityLabel.value) continue; //if this isn't the first example given, skip
            if (data[x].propertyAsEntityLabel.value.match(/^P\d+$/)) continue; //if the property doesn't have a czech label, skip
            if (data[x].exampleValueOfPropertyLabel.value.match(/^Q\d+$/)) continue; //if the example value doesn't have a czech label, skip
            
            let valueType
            let upperCaseLabel = data[x].propertyAsEntityLabel.value[0].toUpperCase() + data[x].propertyAsEntityLabel.value.substr(1);
            let propertyID = data[x].propertyAsEntity.value.match(/P\d+/);
    
            if (data[x].exampleValueOfPropertyLabel.value.match(/^http/)) valueType = "link";
            else if (data[x].exampleValueOfPropertyLabel.value.match(/^\d+-\d+-\d+/)) valueType = "date";
            else if (data[x].exampleValueOfPropertyLabel.value.match(/^\d+/)) valueType = "number";
            else valueType = "string" //since the string input box is always the safest option, it is the default valueType to fall back on
    
            let properties = await queryDispatcher.propertyQuery(propertyID)
            .then(dataJson => dataJson.results.bindings)
            .then(data => {
                let output = "";
            
                for (let x in data) {
                    if (x > 0 && data[x].propertyAsEntityLabel.value == data[x-1].propertyAsEntityLabel.value) continue; //if this isn't the first example given, skip
                    if (data[x].propertyAsEntityLabel.value.match(/^P\d+$/)) continue; //if the property doesn't have a czech label, skip
                    if (data[x].exampleValueOfPropertyLabel?.value.match(/^Q\d+$/)) continue; //if the example value doesn't have a czech label, skip
                    
                    let valueType
                    let upperCaseLabel = data[x].propertyAsEntityLabel.value[0].toUpperCase() + data[x].propertyAsEntityLabel.value.substr(1);
                    let propertyID = data[x].propertyAsEntity.value.match(/P\d+/);
            
                    if (data[x].exampleValueOfPropertyLabel?.value.match(/^http/)) valueType = "link";
                    else if (data[x].exampleValueOfPropertyLabel?.value.match(/^\d+-\d+-\d+/)) valueType = "date";
                    else if (data[x].exampleValueOfPropertyLabel?.value.match(/^\d+/)) valueType = "number";
                    else valueType = "string" //since the string input box is always the safest option, it is the default valueType to fall back on
            
                    output += '&nbsp;&nbsp;&nbsp;&nbsp;"' + upperCaseLabel + '":{"id":"' + propertyID + '", "valueType":"' + valueType + '"},\n';
                }
                output = output.slice(0, -2);
                return output });
            output += '"' + upperCaseLabel + '":{"id":"' + propertyID + '", "valueType":"' + valueType + '", "properties":{' + (properties ? ("\n" + properties) : "") + '}\n},\n';
        }
        output = output.slice(0, -3) + "}";

        document.body.style = "font-size: 12px";
        document.body.innerHTML = output.replace(/\n/g, "<br>") + "<br>";
    
        // let copyButton = document.createElement("button");
        // copyButton.innerHTML = "Click to copy"
        // copyButton.onclick = () => {
        //     const elem = document.createElement('textarea');
        //     elem.value = output;
        //     document.body.appendChild(elem);
        //     elem.select();
        //     document.execCommand('copy');
        //     document.body.removeChild(elem);
        //     window.prompt("Query Results Copied", output)
        // }
        // document.body.append(copyButton)

        // let backButton = document.createElement("button");
        // backButton.innerHTML = "Click to go back";
        // backButton.onclick = () => {
        //     document.body.innerHTML = ""
        //     document.body.appendChild(buttonForProperties);
        //     document.body.appendChild(buttonForDetails);
        // }
        // document.body.appendChild(backButton);
}

async function queryForArgument(arg = "") {
    document.body.style = "font-size: 24px";
    document.body.innerHTML = "Processing query...";
    queryDispatcher.baseQuery("Q6256")
    .then(dataJson => dataJson.results.bindings)
    .then(data => temp(data));
}


//This isn't a perfect solution, but it fits my needs for now, until I have time to work on it
