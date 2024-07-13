---
title: Using JavaScript to Search JSON Arrays in MySQL
date: 2024-05-02T06:00:00
image: 2024/searching-arrays-in-mysql-with-javascript/header.jpg
tags: [ "MySQL", "JSON", "JavaScript" ]
related:
  - /posts/2024/may/filtering-arrays-javascript-mysql/
  - /posts/2024/may/using-intl-in-mysql/
  - /posts/2024/may/more-javascript-in-mysql/
  - /posts/2024/may/sorting-json-arrays-mysql-javascript/
  - /posts/2024/may/debugging-javascript-stored-functions-mysql/

---

A few months ago, it was announced that MySQL now supports [writing stored functions and stored procedures using JavaScript](https://blogs.oracle.com/mysql/post/introducing-javascript-support-in-mysql). This post will discuss a case in which JavaScript searches values in an array. Please note that this functionality is only available in MySQL Enterprise Edition or MySQL HeatWave.

## The Problem

We can search values in arrays using built-in MySQL functions. Coming from a developer background, the 'problem' is that these solutions are often not intuitive and involve nested functions. We can use built-in JavaScript array methods to handle the search in a way that is easier to read and understand.

## Creating a JavaScript-Based Stored Function

We are going to demonstrate two functions to search arrays. The first function will return `1` or `0` if a value that is passed exists in an array of simple values. If the value exists, the function will return `1`, and if the value does nto exist in the array, it will return `0`. Let's look at the code to create a function named `arrayContainsValue`.

```sql
create function arrayContainsValue(items varchar(10000), str varchar(100))
    returns tinyint language javascript as $$
    const arr = JSON.parse(items)
    return arr.indexOf(str) !== -1
$$;
```

This looks straightforward, but we are going to examine each part of this function definition in more detail.

```sql
create function arrayContainsValue(items varchar(10000), str varchar(100))
```

This line states we are creating a function named `arrayContainsValue` and that it accepts two arguments: `items`, which is type `varchar(10000)`, and `str`, which is type `varchar(100)`. The argument `items` is the string representation of the array we will search for, and `str` is the value we are looking for. If we have a column that contains JSON, which is an array (or includes an array),  and we pass that array into the function, it will be a string.

```sql
 returns tinyint language javascript as $$
```

The second line of our function definition specifies that we are returning a `tinyint` value and that the language will be `javascript`. Lastly, we use `$$` to delimit the body of our function from the rest of the statement. Using this method, we do not need to change the delimiter to get MySQL to interpret the function correctly.

```javascript
    const arr = JSON.parse(items)
```

This line is the first bit of JavaScript we use. Here, we use the global object `JSON` to parse the `items` string into a JSON array.

```javascript
    return arr.indexOf(str) !== -1
```

The last line of our function body calls `indexOf` on the array. If the value does not exist in the array, `-1` is returned. The way we write this line says, "If the value returned from `indexOf(str)` is not `-1`, return true. Otherwise, return false."

```sql
$$;
```

The last line of our function includes `$$` to tell MySQL we are done defining our function.

To my developer-centric brain, the JavaScript portion of this function is easier to read and understand.

## Calling the Function

This function can be used in the same way as any other MySQL function. I will use it in a simple `SELECT` statement for our purposes. Run this SQL statement.

```sql
select arrayContainsValue('["Fred", "Lenka", "Scott"]', 'Fred') as arrayContains;
```

We will see the following result:

```text
+---------------+
| arrayContains |
+---------------+
|             1 |
+---------------+
1 row in set (0.0087 sec)
```

If we run this command:

```sql
select arrayContainsValue('["Fred", "Lenka", "Scott"]', 'Heather') as arrayContains;
```

We will get the following results:

```text
+---------------+
| arrayContains |
+---------------+
|             0 |
+---------------+
```

In both of these examples, we pass in a string. Let's look at another example to show that this function will work with a JSON array in MySQL.

```sql
select arrayContainsValue(json_array("Fred", "Lenka", "Scott"), 'Fred') as arrayContains;
```

In this example, we use the function `json_array()` to build an array and pass it as the first argument. When we run this command, we get the following result.

```text
+---------------+
| arrayContains |
+---------------+
|             1 |
+---------------+
1 row in set (0.0079 sec)
```

## A More Complex Example

This example works great for an array that only contains simple values, but what if we wanted to determine if an array of objects contains an object where a property of one of the objects was a given value? Believe it or not, we can handle this easily in JavaScript and with the same number of lines of code.

Here is the definition of a function named `arrayContainsPropertyValue`.

```sql
create function arrayContainsPropertyValue(items varchar(10000), str varchar(100), prop varchar(100))
    returns tinyint language javascript as $$
    const arr = JSON.parse(items)
    return arr.find((item) => item[prop] == str) != null
$$;
```

The syntax is very similar to our last example. I will highlight the differences.

* The first line adds a new argument named `prop`. This new argument is the name of the property we will check for the value of `str`.
* We use `find()` instead of `indexOf()` because `find()` allows us to pass a callback function.
  * This function checks if the property `prop` exists in the `item` during each iteration.
  * `find()` returns the first element that matches and `null` if no elements match.

Let's take a look at an example of using this function.

```sql
select arrayContainsPropertyValue('[{"name":"Fred", "beers":2}, {"name":"Scott", "beers":3}, {"name":"Lenka", "beers":1}]', 'Lenka', 'name') as arrayPropContains;
```

This example is checking if the array contains an object where the `name` property of an object is "Lenka".

This example will show the following results:

```text
+-------------------+
| arrayPropContains |
+-------------------+
|                 1 |
+-------------------+
1 row in set (0.0116 sec)
```

Here is an example where the value of "Heather" does not exist in the `name` property for any objects in the array.

```sql
select arrayContainsPropertyValue('[{"name":"Fred", "beers":2}, {"name":"Scott", "beers":3}, {"name":"Lenka", "beers":1}]', 'Heather', 'name') as arrayPropContains;
```

This query will have the following result:

```text
+-------------------+
| arrayPropContains |
+-------------------+
|                 0 |
+-------------------+
1 row in set (0.0070 sec)
```

## Wrap-Up

I love SQL. It is awesome. But the syntax is difficult to mentally parse at times. By using JavaScript to write MySQL stored functions and procedures, we can have functions that are easier to read and tap into JavaScript's strengths. Array manipulation and searching are much easier in JavaScript than in SQL. Also, allowing stored functions and procedures to be written in JavaScript makes it easier for those more familiar with JavaScript to write their own stored functions and procedures.


Photo by <a href="https://unsplash.com/@katekerdi?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Katerina Kerdi</a> on <a href="https://unsplash.com/photos/woman-walking-on-sand-dunes-during-daytime-_OyMf5BbAxA?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  