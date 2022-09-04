# MSoC Projekt - Querying to Wikidata

## Abstract

This webpage allows users to construct simple SPARQL queries and display their results from querying to wikidata.org.
Chosen query entities are limited by the local database, which can be expanded at any time.
This project was written in html and typescript, with the help of the Svelte framework.

## Detailed Explanation

### Creating an RDFS Triple

There are currently 3 initial Items/Entities.
For each of them, there is a list of properties that can be chosen.
These properties can be numbers, dates, coordinates, strings, image urls, webpage urls.

When a user selects an Item and a Property, latter RDFS Triples only allow them to work with the Item and properties that they selected.
(i.e. they cannot choose to look for a person and a unrelated building)
The user may however look for a person, his residency, and choose a property for the residency (i.e country, coordinates).
Properties for each Item/property are saved in a local database which was generated through broad, generalised queries, which were manually filtered through, to ensure the quality and correctness of each property.
(i.e "Currency" won't have the property "convert to SI units")
An in depth explanasion of how the database was generated will be given later.

#### Selecting a property

When selecting a property, an input box will pop up, which allows the user to search for a concrete value.
For images and weblinks, the user is not allowed to input a value, due to the nature of url values and chances of them ruining a query.
The same applies for coordinates, due to the fact that they are saved as a Point(-0, 0) function and have no way to simply convert to a label like 0°N 0°E within the wikidata iframe.

##### Numerical values

Unfortunately, numbers in wikidata are saved without any units.
This means that the user must input their value in whatever they believe to be the saved units.
The user is informed with the help of a small *i* icon in the input box.
The user is also able to choose the interval of the value (either *less than*, *less than or equal*, *greater than*, *greater than or equal* or *exactly*).
If the user wants to confine values into an interval from 10 to 50, they may choose the property, set value greater than 10 and then choose the property again and set the value less than 50.

##### Date values

When choosing a date, similarly to numerical valuesm the user is able to choose an interval.
They can also choose the precision of the date.
This is because the date type input only sends an on:input event when a full date is given (again, the user is informed with the help of a small *i* icon in the input box).
This means the user cannot set a date of --/--/2000.
Because of this, another button wa created where they can set the precision of the wanted value (*year*, *month* or *day*)
This allows the user to set a date of 01/01/2000 with a precision of month and it will find all dates with --/01/2000 in them

##### String values

When the user selects a property which has string values, an input box will appear where they can normally type the value they are looking for (if they are looking for one).
To help give the user an example of what they can input, a query is sent containing 100, then 500 and finally up to 2500 possible values for that triple.
This allows the user to search for a value from the ones that are loaded and to realise that there is a multitude of possible values (i.e. for citizenship - Němci, Baltští Němci, Sudetští Němci).
Of course, if the user types in their own wanted value, then it cannot be guaranteed that the value is in the wikidata database.
The user is informed of this with the help of a small *i* icon in the input box.
