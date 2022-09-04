# MSoC Projekt - Querying to Wikidata

## Abstract
A webpage which allows users to build their own SPARQL query, querying to wikidata.com, with a simplified and limited UI

3 initial Items/Entities
For each there is a list of properties that can be chosen
These properties can be numbers, dates, coordinates, strings, image urls, webpage urls

When you select an Item and a Property
Latter Triples only allow allwo you to work with the Item and properties that you have selected
(i.e. you cannot choose to look for a person and a unrelated building)
You can however look for a person, his residency, and choose a property for the residency (i.e country, coordinates)
Proeprties for each Item/property are saved in a local database which was generated through broad, generalised queries
which were manually filtered through, to ensure the quality and correctness of each property
(i.e Currency won't have the property convert to SI units)
A detailed explanasion of how the database was generated will be given later

When selecting a property, a input box will pop up, which allows you to search for a concrete value
For images and weblinks, you cannot input a value, due to their nature and chances of ruining a query
The same applies for coordinates, due to the fact that they are saved as a Point(-0, 0) function and have no way to simply convert to a label like 0°N 0°E

In wikidata, numbers are saved without units, so users have to input their value in whatever they believe to be the saved units
This is told to the user with the help of a small i icon in the input box
You can also choose the interval of the value.
So you can choose less than, less than or equal, greater than, greater than or equal or exactly
If the user wants to confine values into an interval from 10 to 50, they can choose the property, set value greater than 10
And then choose the property again and set the value less than 50

When choosing a date, users can choose intervals, similarly to numerical values
They can also choose a precision of the date. This is because the date type input only sends an on:input event when a full date is given
This is told to the user with the help of a small i icon in the input box
This means the user cannot set a date --/--/2000
So a created another button where they can set the precision of the wanted value (as year, month or day)
This allows users to set a date 01/01/2000 with a precision of month and it will find all dates with --/01/2000 in them

Finally, when users select a property which has string values an input box will appear where they can normally type the value they are looking for
To help give users an example of what they can input, a query is sent containing 100, then 2000 possible values for that triple.
This allows users to possible search for a value from the ones that are loaded and to realise that there are multiple possible values (i.e. for citizenship - Němci, Baltští Němci, Sudetští Němci)
Of course, if the user types in their own wanted value, then it cannot be guaranteed that the value is in the wikidata database
This is told to the user with the help of a small i icon in the input box