export type entityPropertiesObject = {
    [key:string]: Array<string>
}

export type entityInfoObject = {
    [key:string]: {
        "id":string,
        "valueType"?:string
    }
};

export type selectedTripleDetails = {
    "tripleID":number,
    "visibility":boolean,
    "items":Array<string>,
    "selectedItem":string,
    "selectedProperty":string,
    "selectedTimePeriod"?:string|undefined,
    "selectedValue":string|number
}

import {queryEntityProperties, queryVariableInfo} from "./data.js"

class GlobalVariables{

    constructor(){}
    static get queryItemVariables():Array<string> {
        return Object.keys(queryVariableInfo).filter(x => queryVariableInfo[x].id[0] == "Q");
    }

    static queryEntityProperties:entityPropertiesObject = queryEntityProperties;
    static queryEntityInfo:entityInfoObject = queryVariableInfo;
}

export default GlobalVariables