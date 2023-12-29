# MSoC Projekt - Querying to Wikidata

## Abstract

This webpage allows users to construct simple SPARQL queries and display their results from querying to wikidata.org.
Chosen query entities are limited by the local database, which can be expanded at any time.
This project was written in html and typescript, with the help of the Svelte framework.

## User Intruction Manual

TODO

## A Detailed Explanation

### Creating an RDFS Triple

There are currently 3 initial Items/Entities.
For each of them, there is a list of properties that can be chosen.
These properties can be numbers, dates, coordinates, strings, image urls, webpage urls.

When a user selects an Item and a Property, latter RDFS Triples only allow them to work with the Item and properties that they selected.
(i.e. they cannot choose to look for a person and a unrelated building)
The user may however look for a person, his residency, and choose a property for the residency (i.e. country, coordinates).
Properties for each Item/property are saved in a local database which was generated through broad, generalised queries, which were manually filtered through, to ensure the quality and correctness of each property.
(i.e. "Currency" won't have the property "convert to SI units")
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

#### Features on the main page

There are only 2 notable features on the main page of the website.
At the very top is a bar which acts as extra space for any possible options that the user may want or need to change.
Currently there is only 1 option there, which allows the user to change the way possible examples are queried for search values.
The default option looks for 100, 500, then 2500 results that fit that single RDFS Triple line.
It first searches for results that fulfill the property and then it filters them depending on if they have a czech label or not.
This method is rather fast, but can result in some unusual or uncommon results.
However thanks to it's speed and nature, it is usually capable of querying for most major values.
(this tested with the residency property and judged according to the amount of results that were countries visible on a globe)
The other method creates a query that includes all RDFS triple before it and has a valid czech label.
This query severely limits the amount of valid results and thus results in a much longer query time.
Despite this, the query itself is not nested and the filter for a valid label is within the same block.
This was done because of the vastly different results that were return with a nested query.
This method also ensues that there will almost always be the maximum number of examples
All 3 of these methods were tested with a simple query of a person with a residency.
The results were as followed (all queries had a limit of 2500 results):
- Nested simple query (default) -> 1914 results in 4918 ms with both useful, popular results and uncommon results
- Nested thorough query (not used) -> 1760 results in 12587 ms with most, if not all results being uncommon (i.e. Germany is never queried)
- Unnested thorough query (second option) -> 2500 results in 51889 ms with very popular and useful results (all well know countries were first)

The other notable feature is a small results counter, which runs a quick and simple query that returns the number of results returned.
It is displayed as an estimated count due to the fact that some filters had to be removed instead of a more reliable speed (i.e. searching and filtering for labels).

### The options screen

After clicking in the green button *Display*, the user will be shown some options that they may use to fine tune the query itself.
At the very top is the result counter from the main page.
Right underneath it is a number input box which allows the user to limit the amount of result they will get (the default is 100).
A small *i* icon informs the user that this is recommened if the query takes too long to load.

The next option allows for the results to be in different languages.
A small *i* icon informs the user of some of the languages (from which they can deduce which language has priority).

The option underneath it changes the query format for wanted values that were inputted by the user.
Specifically it changes the line from **?subject rdfs:label "inputted value"@cs .** to **FILTER(CONTAINS(?subject, "inputted value"))**
This query will take longer depending on its complexity, but it is recommended in the case that the user has inputted a value thay may not be the complete name of what it is stored as in wikidata.
The user is informed of the recommended use with a small *i* icon.

The last individual option is a simple toggle that adds a line in the query, which will return results with a wikipedia article.
This can alter the results by a suprising amount, but is very useful if the user intends on learning significant amounts of information about the results.

If the user chose a property which has url or coordinate values, an option to change the default view of the iframe will appear.
The 2 possibilities are defaultView:ImageGrid and defaultView:Map. The map view option will overwrite the image grid option, due to the fact that the map view has the capability to show images as well.

Lastly, above the *continue* button, there is a checklist of which variables in the query will actually be displayed
This will change the way results are diplayed, due to the nature of wikidata SPARQL queries.
If the original Entity has multiple values for a property, then it will take up multiple results for each value.
By turning off the value that has the most duplicates, the user will be able to view more results with unique Entities at the price of having slightly less information.

### The results page

After clicking on the *continue* button, an iframe from wikidata will load itself up in the middle of the page.
Depending on the default view, the iframe will either load up as a table, an image grid, or a map.
No matter the view mode, if the user hovers their mouse to the left edge of the iframe, they will se a menu popup, which will allow them to change the view mode to whatever wikidata is capable of with the query.
For example, a query without images cannot be displayed as an image grid.

## Database expansion

### Initial Items I wanted to add

- War (Q198)
    - Doesn't have any properties saved under "properties for this type" (very surprising considering the low ID number)
- Organisms known by a particular common name (Q55983715)
    - Doesn't have any properties saved under "properties for this type"
    - Other options (such as organism or animal) have the same problem and additionally, their instances were not the targeted results

### Possible additions

- Chemical element (Q11344)
    - Not added yet, due to only having 9 common properties, which at the time of writing is not deemed enough to be useful
- Historical period (Q11514315)
    - Despite containing very popular topics, it only has 3 common properties, all related by time (this would limit the query to 1 line)
- Sport (Q349)/Type of sport (Q31629)
    - Whilst Type of sport has ideal instance values, neither it, nor Sport have any saved common properties

### Conclusion

After reading through ~500 results from Wikipedia:List of articles all languages should have (Q5460604),
I have come to the conclusion that despite 3 initial items being a very low amount, these 3 items are surprisingly the best fit
in terms of requirements for how the program currently worksd



# Bug List
After selecting "Budova", then next line "Budova", then next line "Budova", then change the first line to "Člověk", only the second line is reset, not the third line. After choosing a topic for the first line, it will still allow you to try the query, but it will instantly crash