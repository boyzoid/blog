---
title: Filtering JSON Arrays with JavaScript in MySQL
date: 2024-05-02T06:00:00
image: /assets/images/2024/filtering-arrays-javascript-mysql/header.jpg
tags: [ "MySQL", "JSON", "JavaScript" ]
related:
  - /posts/2024/may/searching-arrays-in-mysql-with-javascript/
  - /posts/2024/may/using-intl-in-mysql/
  - /posts/2024/may/more-javascript-in-mysql/
  - /posts/2024/may/sorting-json-arrays-mysql-javascript/
---

In my last [post](/posts/2024/may/searching-arrays-in-mysql-with-javascript/), I discussed using JavaScript to write MySQL stored functions that could search the values in a JSON array to determine if any of the elements matched a given value. In this demonstration, I will show how you can use JavaScript to filter the elements of an array and only return elements that match a value.

## The Problem

Once again, this is not a 'problem' as we can do this in MySQL already, but the syntax is just a bit too verbose for my liking. I am a big fan of 'one-liners' in code, and often, one-liners in SQL are challenging to read (yes, I know, they can in JavaScript, too). The best way to return just elements in an array involves using `json_table()` (which has interesting syntax). Let's see how we can do this with JavaScript.

## Creating the Function

Here is the definition of the function that will filter our array.

```sql
create function filterArrayByProperty(items varchar(10000), str varchar(100), prop varchar(100))
    returns varchar(10000) language javascript as $$
    const arr = JSON.parse(items)
    return JSON.stringify(arr.filter((item) => item.country == str))
$$;
```

If you read my [previous post](/posts/2024/may/searching-arrays-in-mysql-with-javascript/), you will see that the syntax is **very** similar. It includes a nifty one-liner in the `return`. Let's break this code down line by line.

```sql
create function filterArrayByProperty(items varchar(10000), str varchar(100), prop varchar(100))
```

This line defines the function name, `filterArrayByProperty` and its three arguments.

1. `items` is `varchar(10000)` and contains the string that defines our array.
2. `str` is `varchar(100)` and is the value we will search for.
3. `prop` is `varchar(100)` and is the property name we will check for the value of `str`.

```sql
    returns varchar(10000) language javascript as $$
```

The second line defines the data type that will be returned, `varchar(10000)`, and specifies that the language used for the stored function is `javascript`. Lastly, we use `$$` to delimit the body of our function from the rest of the statement. Using this method, we do not need to change the delimiter to get MySQL to interpret the function correctly.

```javascript
    const arr = JSON.parse(items)
```

Now we get into the Javascript. The third line uses the global `JSON` object to parse the value of `items` into a JSON array.

```javascript
    return JSON.stringify(arr.filter((item) => item.country == str))
```

A lot is going on in this line (I told you I liked one-liners). First, we use `filter()` on the array we just created. This method will iterate over the array and return every element where a property with a name that matches the value of `prop` equals the value of `str`. This new array is then passed to the `stringify()` method of the global `JSON` object. We need to do this last part because the `JSON` datatype is not supported for arguments or return values in stored functions written in JavaScript.

```sql
$$;
```

The last line of our function includes `$$` to tell MySQL we are done defining our function.

As I have noted in the past, to my developer-centric brain, the JavaScript portion of this function is easier to read and understand.

## Running the Function

To make the JSON we use in this example a little easier to read on this page, I will first create a variable named `@team` and set it to the value of a string representing a JSON array.

```sql
set @team = '[  
    {"name": "Fred", "country": "BE"}, 
    {"name": "Scott", "country": "US"},
    {"name": "Lenka", "country": "CZ"},
    {"name": "Heather", "country": "US"}
    ]';
```

This array contains four elements. The value of `country` in two of them is "US," and the other two have values of "BE" and "CZ." After running this command, we can reference this data by using `@team`.

Next, we run the following query to get filtered versions of the array.

```sql
select 
    filterArrayByProperty(@team, 'US', 'country') as usEmployees,         
    filterArrayByProperty(@team, 'BE', 'country') as beEmployees,         
    filterArrayByProperty(@team, 'CZ', 'country') as czEmployees\G
```

Each time we call `filterArrayByProperty()`, we pass in a different value for `str` ('US', 'BE', and 'CZ'). I used `\G` at the end of the statement so the results were easier to read.

Here is the result of this query:

```text
*************************** 1. row ***************************
usEmployees: [{"name":"Scott","country":"US"},{"name":"Heather","country":"US"}]
beEmployees: [{"name":"Fred","country":"BE"}]
czEmployees: [{"name":"Lenka","country":"CZ"}]
1 row in set (0.0077 sec)
```

The first column contains the elements for `Scott` and `Heather`, the second column contains the element for `Fred`, and the third column contains the element for `Lenka`.

## Wrap-up

JavaScript is good at manipulating complex objects. By leveraging that strength, we can use JavaScript to create functions that are easier to read and understand than their SQL counterparts. In the future, I will post more use cases where using JavaScript to write stored functions or procedures might be beneficial.

Photo by <a href="https://unsplash.com/@dibella?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Di Bella Coffee</a> on <a href="https://unsplash.com/photos/shallow-focus-photo-coffee-decanter-Ko7PFAommGE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  