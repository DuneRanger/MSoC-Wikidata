export class SPARQLQueryDispatcher {
    endpoint:string;
    constructor( endpoint ) {
        this.endpoint = endpoint;
    }

    async query(sparqlQuery, queryID):Promise<{queryID:string,data:any}> {
        const fullUrl:string = this.endpoint + '?query=' + encodeURIComponent(sparqlQuery);
        const headers = { 'Accept': 'application/sparql-results+json' };

        let output:{queryID:string,data:any} = {
            //returns some sort of way to identify each query sent
            queryID: queryID,
            //Returns either a json of the data, Timeout in case of a timeout, or an error in case of a query error
            //I am not sure how to differentiate between a normal object and an error object
            //So there is currently no way to process a direct error, apart from letting it catch in the promise itself
            data: await fetch(fullUrl, {headers}).then(body => body.status == 500 ? "Timeout" : body.json())
            .catch(err => {console.log("Error from QueryDispatcher", err); return err})
        };
        
        return output;
    }
}