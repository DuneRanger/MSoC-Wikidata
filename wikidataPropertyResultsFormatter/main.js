class SPARQLQueryDispatcher {
    endpoint;
    constructor( endpoint ) {
        this.endpoint = endpoint;
    }

    async labelQuery(idForQuery) {

        const sparqlQuery = `SELECT ?label
        WHERE {
           SERVICE wikibase:label { 
             bd:serviceParam wikibase:language "cs" .
              wd:${idForQuery} rdfs:label ?label .
           }
        }
        
`;
        const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
        const headers = { 'Accept': 'application/sparql-results+json' };

        return await fetch(fullUrl, {headers}).then(body => body.json()).then(dataJson => dataJson.results.bindings).then(data => data[0].label.value[0].toUpperCase() + data[0].label.value.substr(1)).catch(err => {throw err});
    }

    async baseQuery(idForQuery) {

        const sparqlQuery = `SELECT DISTINCT
        ?entityIDLabel
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
                wd:${idForQuery} rdfs:label ?entityIDLabel .
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
        ?propertyLabel
        ?propertyAsEntity
        ?propertyAsEntityLabel
        ?propertyAsProperty
        ?exampleItemWithProperty
        ?exampleValueOfPropertyLabel
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
                ?exampleValueOfProperty rdfs:label ?exampleValueOfPropertyLabel .
                wd:${idForQuery} rdfs:label ?propertyLabel .
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


// let buttonForDetails = document.createElement("button");
// buttonForDetails.innerHTML = "Click to query for property details";
// buttonForDetails.onclick = () => {queryForArgument()};
// document.body.appendChild(buttonForDetails);

function processFirstEntityQuery(data) {
    let queryPropertyVariables = [];
    let queryVariableInfo = new Set();
    
    for (let x in data) {
        if (x > 0 && data[x].propertyAsEntityLabel.value == data[x-1].propertyAsEntityLabel.value) continue; //if this isn't the first example given, skip
        if (data[x].propertyAsEntityLabel.value.match(/^P\d+$/)) continue; //if the property doesn't have a czech label, skip
        if (data[x].exampleValueOfPropertyLabel.value.match(/^Q\d+$/)) continue; //if the example value doesn't have a czech label, skip (rare to skip this)
        
        let valueType
        let upperCaseLabel = data[x].propertyAsEntityLabel.value[0].toUpperCase() + data[x].propertyAsEntityLabel.value.substr(1);
        let propertyID = data[x].propertyAsEntity.value.match(/P\d+/)[0];

        if (data[x].exampleValueOfPropertyLabel.value.match(/^http/)) valueType = "link";
        else if (data[x].exampleValueOfPropertyLabel.value.match(/^\d+-\d+-\d+/)) valueType = "date";
        else if (data[x].exampleValueOfPropertyLabel.value.match(/^[0-9.,+eE-]+$/)) valueType = "number";
        else valueType = "string" //since the string input box is always the safest option, it is the default valueType to fall back on

        queryPropertyVariables.push(upperCaseLabel);
        queryVariableInfo.add({label:upperCaseLabel, id:propertyID, valueType:valueType})
    }
    // output = output.slice(0, -2);
    return [queryPropertyVariables, queryVariableInfo];
}

async function processSecondEntityQuery(data) {
    let queryPropertyVariables = [""];
    let queryVariableInfo = new Set();
    let properties = []
    
    for (let x in data) {
        if (x > 0 && data[x].propertyAsEntityLabel.value == data[x-1].propertyAsEntityLabel.value) continue; //if this isn't the first example given, skip
        if (data[x].propertyAsEntityLabel.value.match(/^P\d+$/)) continue; //if the property doesn't have a czech label, skip
        if (data[x].exampleValueOfPropertyLabel.value.match(/^Q\d+$/)) continue; //if the example value doesn't have a czech label, skip (rare to skip this)
        
        let upperCaseLabel = data[x].propertyAsEntityLabel.value[0].toUpperCase() + data[x].propertyAsEntityLabel.value.substr(1);
        let propertyID = data[x].propertyAsEntity.value.match(/P\d+/)[0];

        properties.push([upperCaseLabel, propertyID]);
    }
    // properties = [properties[0]]
    for (let y of properties) {
        // await queryDispatcher.labelQuery(y)
        // .then(label => {})
        queryPropertyVariables += '&nbsp;&nbsp;&nbsp;&nbsp;"' + y[0] + '": [';
        y = y[1];
        await queryDispatcher.propertyQuery(y)
        .then(dataJson => dataJson.results.bindings)
        .then(data => {
            let queryPropertyVariables = [];
            let queryVariableInfo = new Set();
            
            for (let x in data) {
                if (x > 0 && data[x].propertyAsEntityLabel.value == data[x-1].propertyAsEntityLabel.value) continue; //if this isn't the first example given, skip
                if (data[x].propertyAsEntityLabel.value.match(/^P\d+$/)) continue; //if the property doesn't have a czech label, skip
                if (data[x].exampleValueOfPropertyLabel.value.match(/^Q\d+$/)) continue; //if the example value doesn't have a czech label, skip (rare to skip this)
                
                let valueType
                let upperCaseLabel = data[x].propertyAsEntityLabel.value[0].toUpperCase() + data[x].propertyAsEntityLabel.value.substr(1);
                let propertyID = data[x].propertyAsEntity.value.match(/P\d+/)[0];
        
                if (data[x].exampleValueOfPropertyLabel.value.match(/^http/)) valueType = "link";
                else if (data[x].exampleValueOfPropertyLabel.value.match(/^\d+-\d+-\d+/)) valueType = "date";
                else if (data[x].exampleValueOfPropertyLabel.value.match(/^[0-9.,+eE-]+$/)) valueType = "number";
                else valueType = "string" //since the string input box is always the safest option, it is the default valueType to fall back on
        
                queryPropertyVariables.push(upperCaseLabel);
                queryVariableInfo.add({label:upperCaseLabel, id:propertyID, valueType:valueType})
            }
            return [queryPropertyVariables, queryVariableInfo];
        })
        .then(temp => {
            if (temp[0].length) {
                for (let x of temp[0]) {
                    queryPropertyVariables += '"' + x + '",';
                }
                queryPropertyVariables = queryPropertyVariables.slice(0, -1);
            }
            
            for (let x of temp[1]) {
                queryVariableInfo.add(x);
            }
        });
        queryPropertyVariables += "],\n";
    }

    return [queryPropertyVariables, queryVariableInfo];
}

async function main() {
    document.body.style = "font-size: 24px";
    document.body.innerHTML = "Processing query...";
    const baseIDs = ["Q5", "Q41176", "Q6256"] //Člověk, Bydliště, Státní území
    let queryPropertyVariables = "export const queryEntityProperties =  {\n"
    let queryVariableInfo = "export const queryVariableInfo =  {\n"
    let AllProperties = new Set();
    for (let x of baseIDs) {
        await queryDispatcher.labelQuery(x)
        .then(label => {queryVariableInfo += '&nbsp;&nbsp;&nbsp;&nbsp;"' + label + '": {id:"' + x + '"},\n'})
    }
    document.body.innerHTML = "Processing base entities...";
    for (let x of baseIDs) {
        await queryDispatcher.labelQuery(x)
        .then(label => {queryPropertyVariables += '&nbsp;&nbsp;&nbsp;&nbsp;"' + label + '": '})
        
        await queryDispatcher.baseQuery(x)
        .then(dataJson => dataJson.results.bindings)
        .then(data => {
            let temp = processFirstEntityQuery(data);
            queryPropertyVariables += "[";
            for (let x of temp[0]) {
                queryPropertyVariables += '"' + x + '",';
            }
            queryPropertyVariables = queryPropertyVariables.slice(0, -1);
            queryPropertyVariables += "],\n";

            for (let x of temp[1]) {
                AllProperties.add(x);
            }
        })
    }
    document.body.innerHTML = "Processing properties...";
    for (let x of baseIDs) {
        await queryDispatcher.baseQuery(x)
        .then(dataJson => dataJson.results.bindings)
        .then(data => processSecondEntityQuery(data))
        .then(temp => {
            queryPropertyVariables += temp[0]

            for (let x of temp[1]) {
                let z = true;
                for (let y of AllProperties) {
                    if (y.label == x.label){
                        console.log()
                        z = false;
                        break;
                    }
                }
                if (z) AllProperties.add(x);
            }
        });
    }

    for (let x of AllProperties) {
        queryVariableInfo += '&nbsp;&nbsp;&nbsp;&nbsp;"' + x.label + '": {id:"' + x.id + '", valueType:"' + x.valueType + '"},\n'
    }
    // console.log([...AllProperties][0])

    queryVariableInfo = queryVariableInfo.slice(0, -2) + "\n}";
    queryPropertyVariables = queryPropertyVariables.slice(0, -2) + "\n}";

    document.body.style = "font-size: 12px";
    document.body.innerHTML = queryPropertyVariables.replace(/\n/g, "<br>") + "<br><br>" + queryVariableInfo.replace(/\n/g, "<br>");

}

main();