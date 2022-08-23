export type entityPropertiesObject = {
    [key:string]: Array<string>
}

export type queryTriple = {
    item:string,
    property:string,
    value:string,
    wantedValue:string
}

export type entityInfoObject = {
    [key:string]: {
        "id":string,
        "valueType"?:"string"|"number"|"date"|"link"|"coordinates"|"image"
    }
};

export type selectedTripleDetails = {
    "tripleID":number,
    "visibility":boolean,
    "items":Array<string>,
    "selectedItem":string,
    "selectedProperty":string,
    "selectedTimePeriod"?:"Před"|"Po"|"Přesně",
    "selectedTimePrecision"?:"Rok"|"Měsíc"|"Den",
    "selectedNumberInterval"?:"Méně než"|"Méně nebo rovno"|"Více než"|"Více nebo rovno"|"Rovno",
    "selectedValue":string
}

import {queryEntityProperties, queryVariableInfo} from "./data.js";

class GlobalVariables{

    constructor(){}
    static get queryItemVariables():Array<string> {
        return Object.keys(queryVariableInfo).filter(x => queryVariableInfo[x].id.slice(0, 4) == "wd:Q");
    }

    static queryEntityProperties:entityPropertiesObject = queryEntityProperties;
    static queryEntityInfo:entityInfoObject = queryVariableInfo;
}

export default GlobalVariables