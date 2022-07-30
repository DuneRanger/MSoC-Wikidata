export class SPARQLQueryDispatcher {
    endpoint:string;
    constructor( endpoint ) {
        this.endpoint = endpoint;
    }

    async query(sparqlQuery, dataType):Promise<{propertyID:string,data:any}> {
        const fullUrl:string = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
        const headers = { 'Accept': 'application/sparql-results+json' };

        let output:{
            propertyID:string,
            data:any
        } = {
            propertyID: dataType,
            data: await fetch(fullUrl, {headers}).then(body => body.json()).catch(err => {throw err})
        }
        return output;
    }
}