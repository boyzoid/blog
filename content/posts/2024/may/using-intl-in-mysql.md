---
title: Using the Global `Intl` JavaScript Object in MySQL
date: 2024-05-09T06:00:00
image: 2024/using-intl-in-mysql/header.jpg
tags: [ "MySQL", "JSON", "JavaScript" ]
related:
  - /posts/2024/may/searching-arrays-im-mysql-with-javascript/
  - /posts/2024/may/filtering-arrays-javascript-mysql/
  - /posts/2024/may/more-javascript-in-mysql/
  - /posts/2024/may/sorting-json-arrays-mysql-javascript/
  - /posts/2024/may/debugging-javascript-stored-functions-mysql/

---

As I mentioned in some [previous]( /posts/2024/may/searching-arrays-im-mysql-with-javascript/) [posts](/posts/2024/may/filtering-arrays-javascript-mysql/), MySQ: HeatWave and MySQL Enterprise support writing stored functions using JavaScript. When I started playing around with this feature, I wanted to know how much support there was for global JavaScript objects. There is a lot of support for these, and in this post, we will talk about using the global `Intl` object.

## About `Intl`

If you have never used the `Intl` object in JavaScript, check out the [documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) on [MDN](https://developer.mozilla.org/). This object can be used to handle a variety of internationalization. I will use the `NumberFormat()` method for this demo to return a "compact" formatted number. I mean that instead of returning a value of `4999`, it will return `5k`. This formatting can be useful when you don't need the exact number. Take a look at the image below that is taken from the [MySQL Shorts](https://www.youtube.com/playlist?list=PLWx5a9Tn2EvG4C90YFJ9eU61IpALeE0SN) playlist page. It shows the rounded number of views in a compact format.

![MySQL Shorts Playlist View Count]({{ "2024/using-intl-in-mysql/img_01.png" | imgurl }})

## The Data

Before we start with the function definition, let's create a table and populate it with some data we can use for this demo. We will use a table named `scores` using the following statement:

```sql
create table if not exists scores
(
    id    int auto_increment
        primary key,
    name  varchar(25) not null,
    score int         not null
);
```

This statement creates a simple table with three columns:

* `id`, which is the primary key
* `name`, which is the name of a player
* `score`, which is the player's score

We are going to populate the table using the following data:

```sql
insert into scores(name,score)
values
    ('Scott', 53976),
    ('Jessica', 134234),
    ('Ryan', 345123),
    ('Kate', 450912),
    ('Ray', 99876),
    ('Lindy', 123987)
```

Let's look at the data sorted by the value of `score` in descending value.

```sql
select * from scores order by score desc;
```

We can see that Kate has the highest score, while Scott has the lowest.

```text
+----+---------+--------+
| id | name    | score  |
+----+---------+--------+
|  4 | Kate    | 450912 |
|  3 | Ryan    | 345123 |
|  2 | Jessica | 134234 |
|  6 | Lindy   | 123987 |
|  5 | Ray     |  99876 |
|  1 | Scott   |  53976 |
+----+---------+--------+
```

Let's assume we have a requirement to return the value of `score` in a format that matches `53k` instead of `53000` and `1m` instead of `1000000`.

## Creating a JavaScript-Based Stored Function

As I noted above, `Intl` can handle this requirement with the `NumberFormat()` method much easier than we could using a function defined using SQL. Here is the code to create the function. I'll break this down into more manageable chunks below.

```sql
create function compactNumberFormat(num int)
    returns varchar(256) language javascript as $$
    return new Intl.NumberFormat('en-US',
        {
            notation:'compact',
            maximumSignificantDigits: 3
        }).format(num)
$$;
```

The first line of our function definition tells MySQL we are creating a function named `compactNumberFormat()`. This function accepts a single argument named `num`, which is the `int` data type.

```sql
create function compactNumberFormat(num int)
```

The second line of our function definition specifies that we are returning a `varchar(256)` value and that the language will be `javascript`. We want to return `varchar` because our result may include text such as `'K` or `M`. Lastly, we use `$$` to delimit the body of our function from the rest of the statement. Using this method, we do not need to change the delimiter to get MySQL to interpret the function correctly.

```sql
    returns varchar(256) language javascript as $$
```

The body of the function consists of a chained method call. We return the value from `Intl.NumberFormat().format()`. The arguments passed to `NumberFormat()` are:

* `en-US` - the locale for which we want our number to be formatted.
* A JSON object that contains:
  * `notation` - we set this to `compact` to get a format similar to `65K` instead of `65000`.
  * `maximumSignificantDigits` - the maximum number of digits appearing in our result. This includes any values to the right of a decimal point.

We then call the `format()` method and pass in the number we wish to format.

```javascript
    return new Intl.NumberFormat('en-US',
        {
            notation:'compact',
            maximumSignificantDigits: 3
        }).format(num)
```

The last line of our function includes `$$` to tell MySQL we are done defining our function.

```sql
$$;
```

## Using the Function

We can use this function the same way we can use any other MySQL function. We are going to use it in a simple select statement.

```sql
select
    name,
    score,
    compactNumberFormat(score) compact_score
from scores
order by score desc;
```

This query gives us the following result:

```text
+---------+----------+---------------+
| name    | score    | compact_score |
+---------+----------+---------------+
| Kate    | 45091912 | 45.1M         |
| Ryan    | 34512233 | 34.5M         |
| Jessica |   534234 | 534K          |
| Lindy   |   423987 | 424K          |
| Ray     |    99876 | 99.9K         |
| Scott   |    53976 | 54K           |
+---------+----------+---------------+
```

Notice that some returned values have a decimal (`45,1M`), and some do not (`534K`). This behavior is due to the `maximumSignificantDigits` property.

I know that `Intl` can be used on the front end to accomplish the same result, but I am a fan of letting the database do what it is intended to do: manipulate data. Returning this value from the database in the correct format can streamline any frontend code displaying this data.

You can learn more about the functionality of `Intl` by checking out the [documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).

## Wrap-up

By using JavaScript to create stored functions and procedures, we can tap into many of its features—including global objects such as `Intl`. This allows us to provide formatted data directly from the database without needing to format it on the front end of an application. In future posts, I plan on exploring more use cases for using JavaScript to create stored functions and using global JavaScript objects inside these functions.

Photo by <a href="https://unsplash.com/@splashabout?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Nareeta Martin</a> on <a href="https://unsplash.com/photos/assorted-color-flags-iPp_KIsFBnI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>