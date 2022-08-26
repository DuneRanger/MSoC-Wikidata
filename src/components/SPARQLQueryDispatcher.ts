export class SPARQLQueryDispatcher {
    endpoint:string;
    constructor( endpoint ) {
        this.endpoint = endpoint;
    }

    async query(sparqlQuery, entityID):Promise<{propertyID:string,data:any}> {
        const fullUrl:string = this.endpoint + '?query=' + encodeURIComponent(sparqlQuery);
        const headers = { 'Accept': 'application/sparql-results+json' };

        let output:{
            propertyID:string,
            data:any
        } = {
            propertyID: entityID,
            data: await fetch(fullUrl, {headers}).then(body => body.json()).catch(err => {console.log("sdtst", err); throw err})
        }
        return output;
    }
}