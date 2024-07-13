---
title: Using Aggregate Functions With MySQL Document Store
date: 2023-04-12T06:00:00
image: 2023/doc-store-aggregate/header.jpg
tags: [ "MySQL", "MySQL-Document-Store", "Aggregate-Functions" ]

---

[MySQL Document](https://www.mysql.com/products/enterprise/document_store.html) Store is a JSON document storage solution built on MySQL. One of the advantages of using MySQL Document Store for JSON document storage is when we need to run complex queries for analytics or reporting we can use raw SQL to retrieve data from our JSON documents. But what if we want to view basic aggregate data, such as [average](https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html#function_avg), [minimum](https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html#function_min), [maximum](https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html#function_max), etc.? Can we get that data while still using the Document Store API? Yes, we can, and in this post, we will show you how it can be done.

## Simple vs. Complex Values

We can only aggregate values from properties where all the values are 'simple'.
When we talk about 'simple' property values, we mean properties that contain simple values, like numbers or strings.
In other words, these properties do not have values that are arrays or objects.
Let's take a look at an example.

![Simple vs Complex Values]({{ "2023/doc-store-aggregate/img-01.png" | imgurl }}  "Simple vs Complex Values")

The properties `firstName`, `lastName`, `date`, and `score` are simple values because they only contain strings or numbers.
The property `course` has a complex value because its value is an object.

## Aggregating Root Properties

When using the MySQL Document Store API, we can aggregate data using the `fields()` and `groupBy()` methods.
Let's look at this example to get the average score for a single user (who happens to be me).

```shell
db.scores.find("lastName = 'Stroz' and year(date) = 2022").fields(['firstName', 'lastName']).groupBy(['lastName', 'firstName'])
```
By examining our call to `find()`, we see that we are filtering our results where the lastName property is equal to 'Stroz' and the date was from 2022.
If we do not wish to return all the properties of a document, we can use `fields()` to specify which properties we want to return.
In this example, we are returning just the `firstName` and `lastName` properties (we will add more fields in the next section).
Also, the call to `groupBy()` shows we want to group our results by the `lastName` and `firstName` properties.
When we run this command, we will see the following results.

![Basic Grouping with Fields]({{ "2023/doc-store-aggregate/img-02.png" | imgurl }}  "Basic Grouping with Fields")

### Using `avg()`

If we wanted to get the average score, we would use `avg()` in the call to `fields()`.
In this example, we also use `round()` to round the result to two decimal places.

```shell
db.scores.find("lastName = 'Stroz' and year(date) = 2022").fields(['firstName', 'lastName', 'round(avg(score),2) as avg_score']).groupBy(['lastName', 'firstName'])
```

Executing this command gives us the following results:

![Score Average]({{ "2023/doc-store-aggregate/img-03.png" | imgurl }}  "Score Average")

### Using `count()`

If we wanted to add a property that counted the number of scores, the command would look like this:

```shell
db.scores.find("lastName = 'Stroz' and year(date) = 2022").fields(['firstName', 'lastName', 'round(avg(score),2) as avg_score', 'count(score) as score_count']).groupBy(['lastName', 'firstName'])
```

We can see in the results that I had 20 scores for 2022.

![Score Count]({{ "2023/doc-store-aggregate/img-04.png" | imgurl }}  "Score Count")

### Using `min()` and `max()`

If we wanted to find the lowest and highest scores, we would use `min()` and `max()`, respectively.
However, because of an issue with how Document Store uses JSON functions on the backend, we need to massage the data a little (The problem has been reported).
The issue is that the value returned from the calls to `min()` and `max()` return strings instead of numbers.
This may not be an issue, but if we compared `123` and  `32` as strings, `123` would be returned by `min()`.

The way we massage this data is to use `cast()` to cast the value as an unsigned integer inside of `min()` (or `max()`).
Don't worry. Even when this issue is addressed, using code like the sample below will still work.

```shell
db.scores.find("lastName = 'Stroz' and year(date)=2022").fields(['firstName', 'lastName', 'round(avg(score),2) as avg_score', 'count(score) as round_count', 'min(cast(score as unsigned)) as low_score', 'max(cast(score as unsigned)) as high_score']).groupBy(['lastName', 'firstName'])
```

When we run this command, we will see the results below.

![Score Min and Max]({{ "2023/doc-store-aggregate/img-05.png" | imgurl }}  "Score Min and Max")

***Note:** You may have noticed that the properties are not returned in the same order specified in `fields()`.
This is due to how the data is stored in the database table.*

## Aggregating Array Data

If we want to aggregate data that is in an array, we usually would need to use raw SQL to extract those values using [`json_table()`](https://dev.mysql.com/doc/refman/8.0/en/json-table-functions.html#function_json-table) and aggregate them.
Remember, the reason behind this post is to show how we can handle this by using the Document Store API.

### The New Data Schema

To demonstrate how we would handle this, we need to use a different set of data.
Instead of each document containing the name and score information, we will use documents where the scores are stored in an array for each person.
Take a look at the sample schema below.

![New Schema]({{ "2023/doc-store-aggregate/img-06.png" | imgurl }}  "New Schema")

In this new schema, we see that each document contains properties with simple values for `firstName` and `lastName` and a property named `scores` that contains an array of objects.
Each object has two properties with simple values, `score` and `date`.

## The Problem

When researching methods of getting the data from an array, as we have above, I could not find a combination that worked inside the call to `fields()` the way I wanted.
I even tried using a subquery in fields that used `json_table()`.


## The Solution

While we cannot do this natively in the API, we can use [user-defined functions](https://dev.mysql.com/doc/refman/8.0/en/create-procedure.html) to give us the functionality we need and use them as we did in the above examples.

### Creating the User-Defined Function

To get started, I created the user-defined function below.

```sql
DELIMITER $$
CREATE FUNCTION `JSON_ARRAY_AVG`(arr JSON) 
    RETURNS float DETERMINISTIC
begin
    declare val float;
    select avg(ar.item) into val 
        from json_table( 
            arr, 
            '$[*]' columns(
                item float path '$'
                )
            ) ar;
    return val; 
end$$
DELIMITER ;
```
Let's break down the syntax of the SQL command.

* `DELIMITER $$` - This command tells MySQL that we want to change the command delimiter. We need to do this because we have commands in the function's body that need to be ended with a semicolon.
* `CREATE FUNCTION `JSON_ARRAY_AVG`(arr JSON)` - This line tells MySQL that we are creating a function named `JSON_ARRAY_AVG`, and the function expects one argument that should be of type `JSON`.
* `RETURNS float DETERMINISTIC` - This line defines what data type is returned by the function and that the value is `DETERMINISTIC`.
  * A function is deterministic if it always produces the same result for the same input parameters.
* `begin` - This line starts the function definition.
* `declare val float;` - This line declares a variable that will be used in the function and specifies its data type as `float`.
* `select avg(ar.item) into val from json_table( arr, '$[*]' columns(item float path '$')) ar;` - This line does all the heavy lifting. We will break this down into smaller pieces.
  * `select avg(ar.item) into val`  - sets the value of a variable named `val` to the result of the call to `avg(ar.item)`.
  * `from json_table( arr, '$[*]' columns(item float path '$')) ar` - uses `json_table()` to put the values in our array into a virtual table that can be used in a query.
    * The `arr` is the array we passed into the function.
    * The `'$[*]` specifies that we are using all the values in the root of the array.
      * This function expects to get an array of simple values. We will see how to get that data in a bit.
    * The `columns(item float path '$')` defines the columns in our virtual table.
      * This example has a single column named `item`, a float data type.
      * The `path` to this value is the root of the current element of the array, which is identified with `'$'`.
    * Whenever we use `json_table()` we must use an alias. In this example, the alias name is `ar`
* `return val; ` - This line returns the value of our variable named `val`.
* `end$$` - This line specifies the end of our function. We use `$$` at the end because this is the new delimiter we specified.
* `DELIMITER ;` - This line returns the delimiter to a semicolon.

### Using Our Function

Now that we have our user-defined function created to get the average of values in the array passed to the function, let's put it to work.
Here is a command that uses this function in the call to `fields()`.
I'll break down the syntax below.

```shell
db.scores2.find("lastName = 'Stroz'").fields(['firstName', 'lastName', 'round(json_array_avg(scores[*].score),2) as avg_score'])
```

The call to `find()` shows we want documents where the `lastName` property is equal to 'Stroz'.
In the call to `fileds()`, we can see that we want to return the `firstName` and `lastName` properties and that we want to return the rounded result of our call to `json_array_avg()`.
Here are the results from the command above:

![User-Defined Function results]({{ "2023/doc-store-aggregate/img-07.png" | imgurl }}  "User-Defined Function results")

Note that what we pass to `json_array_avg()`, `scores[*].score` is a JSON path. This path tells MySQL to use all the elements of the scores array but only return values for the `score` property.
The values will be populated into a JSON array which can be used by `json_array_avg()`.
If we had specified the path as `scores[*]`, what would be passed to `json_array_avg()` would be the full array of score objects.


We can create similar user-defined functions to return the lowest and highest scores.

## The Wrap-up

When using the MySQL Document Store API, we can specify the results of MySQL functions in the `fields()` method.
We can use aggregate functions such as `avg()` to return the average of simple values in the document root.
To return this same value for properties stored in an array in our document while still using the Document Store API, we need to create user-defined functions to handle aggregating the data for us.
Yes, we still need to write our own SQL commands to define the user-defined functions, but at least we can use those functions in the API.

*P.S. - For those who may not understand why I chose the header image for this post: The rock around railroad ties is called 'aggregate'.*


Photo by <a href="https://unsplash.com/es/@orrbarone?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">James Orr</a> on <a href="https://unsplash.com/photos/u3ToHqQFrT4?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
