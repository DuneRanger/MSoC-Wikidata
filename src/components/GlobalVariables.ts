export type wikidataEntitiesObject = {
    [key:string]: {
        "id":string,
        "properties"?:wikidataPropertiesObject
    }
};

export type wikidataPropertiesObject = {
    [key:string]: {
        "id":string,
        "properties"?:wikidataPropertiesObject
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

class GlobalVariables{
    queryPropertyVariables:{[key:string]:wikidataEntitiesObject};
    constructor(){}
    static get queryItemVariables():Array<string> {
        return Object.keys(GlobalVariables.queryPropertyVariables)
    }

    static queryPropertyVariables:wikidataEntitiesObject = {
        "Člověk": {
            "id":"Q5",
            "properties": {
                "Bydliště":{"id":"P551", "valueType":"string", get properties() {return GlobalVariables.queryPropertyVariables.Budova.properties}},
                "Choť":{"id":"P26", "valueType":"string", get properties() {return GlobalVariables.queryPropertyVariables.Člověk.properties}},
                "Datum křtu":{"id":"P1636", "valueType":"date"},
                "Datum narození":{"id":"P569", "valueType":"date"},
                "Datum pohřbu nebo kremace":{"id":"P4602", "valueType":"date"},
                "Datum úmrtí":{"id":"P570", "valueType":"date"},
                "Dílo":{"id":"P800", "valueType":"string"},
                "Dítě":{"id":"P40", "valueType":"string"},
                "Hmotnost":{"id":"P2067", "valueType":"number"},
                "Jméno při narození":{"id":"P1477", "valueType":"string"},
                "Jméno v rodném jazyce":{"id":"P1559", "valueType":"string"},
                "Mateřský jazyk":{"id":"P103", "valueType":"string"},
                "Matka":{"id":"P25", "valueType":"string"},
                "Místo narození":{"id":"P19", "valueType":"string"},
                "Místo působení":{"id":"P937", "valueType":"string"},
                "Místo úmrtí":{"id":"P20", "valueType":"string"},
                "Národnost":{"id":"P172", "valueType":"string"},
                "Období působení":{"id":"P1317", "valueType":"date"},
                "Obrázek":{"id":"P18", "valueType":"link"},
                "Otec":{"id":"P22", "valueType":"string"},
                "Ovlivněn (kým)":{"id":"P737", "valueType":"string"},
                "Ovládané jazyky":{"id":"P1412", "valueType":"string"},
                "Pohlaví":{"id":"P21", "valueType":"string"},
                "Povolání":{"id":"P106", "valueType":"string"},
                "Pseudonym":{"id":"P742", "valueType":"string"},
                "Přezdívka":{"id":"P1449", "valueType":"string"},
                "Příjmení":{"id":"P734", "valueType":"string"},
                "Příčina smrti":{"id":"P509", "valueType":"string"},
                "Rodné jméno":{"id":"P735", "valueType":"string"},
                "Sourozenec":{"id":"P3373", "valueType":"string"},
                "Stranická příslušnost":{"id":"P102", "valueType":"string"},
                "Státní občanství":{"id":"P27", "valueType":"string"},
                "Ve funkci":{"id":"P39", "valueType":"string"},
                "Vyznání":{"id":"P140", "valueType":"string"},
                "Významná osoba":{"id":"P3342", "valueType":"string"},
                "Výška":{"id":"P2048", "valueType":"number"},
                "Zaměstnavatel":{"id":"P108", "valueType":"string"},
                "Zaměření":{"id":"P101", "valueType":"string"},
                "Zdravotní postižení":{"id":"P1050", "valueType":"string"},
                "Zkráceně":{"id":"P1813", "valueType":"string"},
                "Způsob smrti":{"id":"P1196", "valueType":"string"},
                "Člen (čeho)":{"id":"P463", "valueType":"string"},
                "Škola":{"id":"P69", "valueType":"string"},
                "Životní partner":{"id":"P451", "valueType":"string"}
            }
        },
        "Budova": {
            "id":"Q41176",
            "properties": {
                "Architekt":{"id":"P84", "valueType":"string"},
                "Architektonický styl":{"id":"P149", "valueType":"string"},
                "Barva":{"id":"P462", "valueType":"string"},
                "Do":{"id":"P582", "valueType":"date"},
                "Kategorie na Commons":{"id":"P373", "valueType":"string"},
                "Kód Emporis":{"id":"P455", "valueType":"number"},
                "Kód Structurae":{"id":"P454", "valueType":"number"},
                "Nachází se v administrativní jednotce":{"id":"P131", "valueType":"number"},
                "Nadzemní podlaží":{"id":"P1101", "valueType":"number"},
                "Nemá část":{"id":"P3113", "valueType":"string"},
                "Oficiální web":{"id":"P856", "valueType":"link"},
                "Plná poštovní adresa":{"id":"P6375", "valueType":"string"},
                "Podzemní podlaží":{"id":"P1139", "valueType":"number"},
                "Použitý materiál":{"id":"P186", "valueType":"string"},
                "Poštovní směrovací číslo":{"id":"P281", "valueType":"number"},
                "Skládá se z":{"id":"P527", "valueType":"string"},
                "Stav užívání":{"id":"P5817", "valueType":"string"},
                "Stát":{"id":"P17", "valueType":"string"},
                "Tvar":{"id":"P1419", "valueType":"string"},
                "Ulice":{"id":"P669", "valueType":"string"},
                "Uživatel budovy":{"id":"P466", "valueType":"string"},
                "Zeměpisné souřadnice":{"id":"P625", "valueType":"string"},
                "Zhotovitel":{"id":"P193", "valueType":"string"}
            }
        },
        "Státní území": {
            "id":"Q6256",
            "properties": {
                "Gini koeficient":{"id":"P1125", "valueType":"number"},
                "ID relace OpenStreetMap":{"id":"P402", "valueType":"number"},
                "Diplomatický vztah":{"id":"P530", "valueType":"string"},
                "Dluh ústřední vlády jako procento HDP":{"id":"P1689", "valueType":"number"},
                "Doména nejvyššího řádu":{"id":"P78", "valueType":"string"},
                "Erb":{"id":"P237", "valueType":"string"},
                "Forma vlády":{"id":"P122", "valueType":"string"},
                "Galerie na Commons":{"id":"P935", "valueType":"string"},
                "Hlava státu":{"id":"P35", "valueType":"string"},
                "Hlavní město":{"id":"P36", "valueType":"string"},
                "Hraničí s":{"id":"P47", "valueType":"string"},
                "Hymna":{"id":"P85", "valueType":"string"},
                "Identifikátor GeoNames":{"id":"P1566", "valueType":"number"},
                "Index lidského rozvoje":{"id":"P1081", "valueType":"number"},
                "Kategorie lidí spojených s tímto místem":{"id":"P1792", "valueType":"string"},
                "Kategorie lidí zde narozených":{"id":"P1464", "valueType":"string"},
                "Kategorie lidí zde pohřbených":{"id":"P1791", "valueType":"string"},
                "Kategorie lidí zde zemřelých":{"id":"P1465", "valueType":"string"},
                "Kontinent":{"id":"P30", "valueType":"string"},
                // "Kód FIPS 10-4":{"id":"P901", "valueType":"string"},
                // "Kód země (ISO 3166-1 alpha-2)":{"id":"P297", "valueType":"string"},
                // "Kód země (ISO 3166-1 alpha-3)":{"id":"P298", "valueType":"string"},
                // "Kód země (ISO 3166-1 numeric)":{"id":"P299", "valueType":"number"},
                // "Kód země podle GS1":{"id":"P3067", "valueType":"number"},
                // "Kód země podle Mezinárodního olympijského výboru":{"id":"P984", "valueType":"string"},
                "Mapa polohy":{"id":"P242", "valueType":"link"},
                "Maritime identification digits":{"id":"P2979", "valueType":"number"},
                "Mezinárodní telefonní předvolba":{"id":"P474", "valueType":"string"},
                "Měna":{"id":"P38", "valueType":"string"},
                "Nahrávka výslovnosti":{"id":"P443", "valueType":"link"},
                "Nejjižnější bod":{"id":"P1333", "valueType":"string"},
                "Nejnižší bod":{"id":"P1589", "valueType":"string"},
                "Nejsevernější bod":{"id":"P1332", "valueType":"string"},
                "Nejvyšší bod":{"id":"P610", "valueType":"string"},
                "Nejvýchodnější bod":{"id":"P1334", "valueType":"string"},
                "Nejzápadnější bod":{"id":"P1335", "valueType":"string"},
                "Nižší správní celky":{"id":"P150", "valueType":"string"},
                "Obrázek erbu":{"id":"P94", "valueType":"link"},
                "Obrázek vlajky":{"id":"P41", "valueType":"link"},
                "Oficiální web":{"id":"P856", "valueType":"link"},
                "Plošná výměra":{"id":"P2046", "valueType":"number"},
                "Pojmenováno po":{"id":"P138", "valueType":"string"},
                "Počet obyvatel":{"id":"P1082", "valueType":"number"},
                "Představitel":{"id":"P6", "valueType":"string"},
                "Strana silničního provozu":{"id":"P1622", "valueType":"string"},
                "Stát":{"id":"P17", "valueType":"string"},
                "Užívaný jazyk":{"id":"P2936", "valueType":"string"},
                "Vlajka":{"id":"P163", "valueType":"string"},
                "Vrcholný orgán soudní moci":{"id":"P209", "valueType":"string"},
                "Zeměpisné souřadnice":{"id":"P625", "valueType":"string"},
                "Úřední jazyk":{"id":"P37", "valueType":"string"},
                "Časové pásmo":{"id":"P421", "valueType":"string"},
                "Člen (čeho)":{"id":"P463", "valueType":"string"}
            }
        },
        "Událost": {
            "id":"",
            "properties": {
                
            }
        }
    }
}

export default GlobalVariables