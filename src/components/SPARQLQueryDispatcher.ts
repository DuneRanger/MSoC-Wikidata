export class SPARQLQueryDispatcher {
    endpoint:string;
    constructor( endpoint ) {
        this.endpoint = endpoint;
    }

    async query(sparqlQuery, queryID):Promise<{queryID:string,data:any}> {
        const fullUrl:string = this.endpoint + '?query=' + encodeURIComponent(sparqlQuery);
        const headers = { 'Accept': 'application/sparql-results+json' };

        let output:{queryID:string,data:any} = {
            queryID: queryID,
            data: await fetch(fullUrl, {headers}).then(body => body.status == 500 ? "Timeout" : body.json())
            .catch(err => {console.log("Error from QueryDispatcher", err); return err})
        };
        
        return output;
    }
}