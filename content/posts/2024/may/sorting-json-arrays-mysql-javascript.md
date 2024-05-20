---
title: Sorting JSON Arrays in MySQL with JavaScript
date: 2024-05-16T06:00:00
image: /assets/images/2024/sorting-json-arrays-mysql-javascript/header.jpg
tags: ["MySQL", "JavaScript", "JSON"]
related:
  - /posts/2024/may/searching-arrays-in-mysql-with-javascript/
  - /posts/2024/may/filtering-arrays-javascript-mysql/
  - /posts/2024/may/using-intl-in-mysql/
  - /posts/2024/may/more-javascript-in-mysql/
  - /posts/2024/may/debugging-javascript-stored-functions-mysql/

---

In some previous posts, I discussed how we can use JavaScript in [MySQL HeatWave](https://www.mysql.com/cloud/) and [MySQL Enterprise](https://www.mysql.com/products/enterprise/) to [search](/posts/2024/may/searching-arrays-in-mysql-with-javascript/) and [filter](/posts/2024/may/filtering-arrays-javascript-mysql/) JSON array data. Today, I am going to show how we can sort JSON array data using JavaScript in MySQL.

## The Problem

I have worked on applications that ingested data from third-party APIs. In most cases, we stored this data as JSON in the database. One drawback of using JSON like this is that we do not control the schema, nor can we dictate the order in which the array data will be sorted. We may need the data sorted in a different order. This sorting can be done on the client side, but, as I noted in the past, I prefer to return data based on how it will be used as it trims down client-side processing. I am also a firm believer that manipulating data is often handled better in the database.

## Create Simple Sorting Function

As I did in the search and filtering posts, I am going to start with a function that sorts simple data. Here is the complete code for this function. I will break this down next.

```sql
create function sortArray(items varchar(10000))
returns varchar(10000) language javascript as $$
const arr = JSON.parse(items)
function compare(a,b){
if(a < b) return -1
else if (a > b) return 1

        return 0
    }
    return JSON.stringify(arr.sort(compare))
$$;
```

The first line of the function definition tells MySQL we are creating a function named `sortArray`. This function accepts one argument named `items`, and the data type is `varchar(10000)`.

```sql
create function sortArray(items varchar(10000))
```

The second line defines the data type that will be returned, `varchar(10000)`, and specifies that the language used for the stored function is `javascript`. Lastly, we use `$$` to delimit the body of our function from the rest of the statement. Using this method, we do not need to change the delimiter to get MySQL to interpret the function correctly.

```sql
returns varchar(10000) language javascript as $$
```

Inside the function body, we first create a JavaScript array named `arr` from the value of `items`. 

```javascript
    const arr = JSON.parse(items)
```

The next block of code might seem a little odd because it defines a JavaScript function inside our stored function. This function, named `compare()` is used to sort our array data. This function is only available inside our stored function and cannot be accessed from any other stored function. The function is a standard method of sorting data. It accepts arguments named `a` and `b` and has logic to return a value based on whether these values are equal or greater than the other.

* If `a' is less than `b`, we return `-1`.
* If `a' is greater than `b`, we return `1`.
* If `a' and `b` are equal, we return 0.

```javascript
function compare(a,b){
if(a < b) return -1
else if (a > b) return 1

        return 0
    }
```

If you have been following along in this series, you should know that I love 'one-liners'. The last line of code in the body of our function is a one-liner that returns our data. From the inside out: we call `sort()` on the `arr` variable and pass `compare` as a callback function. When the array is being sorted, `compare()` will be called. The sorted array is then passed to `JSON.stringify()` to change it back into a string.

```javascript
return JSON.stringify(arr.sort(compare))
```

The last line of our function includes `$$` to tell MySQL we are done defining our function.

```sql
$$;
```

## Run Simple Sorting Function

This new function can be used in the same manner as any other MySQL function. Let's look at sorting numeric data.

```sql
select sortArray('[1,10,4,23,2,55,100]') sorted_array;
```

When we run this query, we will see the following results:

```text
+----------------------+
| sorted_array         |
+----------------------+
| [1,2,4,10,23,55,100] |
+----------------------+
```

This sorting 'algorithm' will even work if we have an array of data that looks like:  `[1,10,4,23, "2",55,100]`. Let's run the following query:

```sql
select sortArray('[1,10,4,23,"2",55,100]') sorted_array;
```

The results show that `"2``` was sorted correctly, even though it is still, technically, a string.

```text
+------------------------+
| sorted_array           |
+------------------------+
| [1, "2",4,10,23,55,100] |
+------------------------+
```

For the following example, we will sort an array of strings.

```sql
select sortArray('["Scott", "Jessica", "Tyler", "Ryan"]') sorted_array ;
```

The results of this query will be:

```text
+------------------------------------+
| sorted_array                       |
+------------------------------------+
| ["Jessica", "Ryan", "Scott", "Tyler"] |
+------------------------------------+
```

## Sorting an Array Of Objects

JSON arrays do not always contain simple values. Each element in the array is often a JSON object with its own properties. Let's take a look at a function that allows us to sort an array based on the value of a given property of an object in the array. Here is a function that can handle this:

```sql
create function sortArrayByProperty(items varchar(10000), prop varchar(100))
    returns varchar(10000) language javascript as $$
    const arr = JSON.parse(items)
    function compare(a,b){
        if(a[prop] < b[prop]) return -1
        else if (a[prop] > b[prop]) return 1

        return 0
    }
    return JSON.stringify(arr.sort(compare))
$$;
```

This new function is very similar to the previous one. I will only discuss the differences.

First, we have an additional argument. This argument is named `prop` and is of data type `varchar(100)`. This value represents the property we want to sort by.

The second (and final) difference is that in the `compare()` function, we get the value of the property we want to sort by using array notation. If we wanted to sort by a property named `name`, we would pass the value 'name' as the second argument. By using `a[prop]` and `b[prop]`, we are getting the value of the `a.name` and `b.name` properties.

## Run Sorting By Object Properties

To make these examples more straightforward to read, let's first set a variable to the JSON array we want to sort.

```sql
set @team = '[
{"name": "Fred", "country": "BE"},
{"name": "Scott", "country": "US"},
{"name": "Lenka", "country": "CZ"},
{"name": "Heather", "country": "US"}
]';
```

This array contains four elements, each with a `name` and a `country` property.

First, we are going to sort by the `name` property.

```sql
select sortArrayByProperty(@team, 'name') sorted_array;
```

The results of this query show the elements sorted by the `name` property.

```text
+------------------------------------------------------------------------------------------------------------------------------------+
| sorted_array                                                                                                                       |
+------------------------------------------------------------------------------------------------------------------------------------+
| [{"name": "Fred", "country": "BE"},{"name": "Heather", "country": "US"},{"name": "Lenka", "country": "CZ"},{"name": "Scott", "country": "US"}] |
+------------------------------------------------------------------------------------------------------------------------------------+
```

We see that the elements have been ordered based on the `name` property.

To sort the array by the `country` property, we use the following query:

```sql
select sortArrayByProperty(@team, 'country') sorted_array;
```

The results of this query will be:

```text
+------------------------------------------------------------------------------------------------------------------------------------+
| sorted_array                                                                                                                       |
+------------------------------------------------------------------------------------------------------------------------------------+
| [{"name": "Fred", "country": "BE"},{"name": "Lenka", "country": "CZ"},{"name": "Scott", "country": "US"},{"name": "Heather", "country": "US"}] |
+------------------------------------------------------------------------------------------------------------------------------------+
```

Now, we see the elements sorted by country. The object for Lenka is the second element, and the object for Scott appears before the object for Heather (this is because we do not have any logic to sort on more than one property).

## Wrap-Up

Like all the other examples of using JavaScript to create stored functions in MySQL, sorting array data can be done in pure SQL. In my opinion, the JavaScript code is less verbose and easier to understand. In future posts, I plan on sharing examples of using JavaScript in MySQl to solve problems more efficiently.

Photo by <a href="https://unsplash.com/@pawel_czerwinski?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Pawel Czerwinski</a> on <a href="https://unsplash.com/photos/four-assorted-color-trash-bins-beside-gray-wall-RkIsyD_AVvc?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  