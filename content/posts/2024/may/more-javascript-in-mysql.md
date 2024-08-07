---
title: More JavaScript in MySQL
date: 2024-05-14T06:00:00
image: 2024/more-javascript-in-mysql/header.jpg
tags: [ "MySQL", "JavaScript" ]
related:
  - /posts/2024/may/searching-arrays-in-mysql-with-javascript/
  - /posts/2024/may/filtering-arrays-javascript-mysql/
  - /posts/2024/may/using-intl-in-mysql/
  - /posts/2024/may/sorting-json-arrays-mysql-javascript/
  - /posts/2024/may/debugging-javascript-stored-functions-mysql/

---

In my last three posts, I discussed [searching JSON array data](/posts/2024/may/searching-arrays-in-mysql-with-javascript/), [filtering JSON array data](/posts/2024/may/filtering-arrays-javascript-mysql/), and [using the global `Intl` object](/posts/2024/may/using-intl-in-mysql/) when creating [MySQL](https://www.mysql.com) stored functions. These examples were relatively simple functions and, essentially, `one-liners`. In this post, I will create another stored function with more complex business logic.

## The Business Rules

Let's assume we have a requirement to return a given number of seconds in a format that includes the number of hours, minutes, and seconds represented by this number. We also need to have two different formats. The first format is a `short` format that would return the data using the following format: `hh:mm:ss`. The second, `long`, format would return the data using `h hours m minutes s seconds`. Additional requirements for the `long` format include:

* If the number of hours, minutes, or seconds is `0`, do not include it in the output.
* If the number of hours, minutes, or seconds is `1`, use the singular version of the word; otherwise, use the plural.

Creating a MySQL stored function to handle this would be possible, but it might be longer and more involved. Using Javascript is fairly straightforward.

## The Function

Let's examine the command to create this function and then break down each part.

```sql
create function secondsToHoursMinsSecs(seconds double, format varchar(5))
    returns varchar(256) language javascript as $$
    if(format !== 'long') format = 'short'
    const hrs = Math.floor(seconds/3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = (seconds % 60)
    switch(format.toLowerCase()){
        case 'short':
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
            break
        case 'long':
            let lng = ''
            if(hrs > 0) lng += `${hrs} hour${hrs > 1 ? 's' : ''} `
            if(mins > 0) lng += `${mins} minute${mins > 1 ? 's' : ''} `
            if(secs > 0) lng += `${secs} second${secs > 1 ? 's' : ''}`
            return lng.trim()
            break
    }
$$;
```

The first line defines the function name and its arguments. Here, the function's name is `secondsToHoursMinsSecs`, and it accepts two arguments. The first argument is named `seconds` and is of type `double`. This value is the number of seconds that we will covert. The second argument is named `format` and is of type `varchar(5)`. This value is the format, `short` or `long`, that we will return.

```sql
create function secondsToHoursMinsSecs(seconds double, format varchar(5))
```

The second line of our function definition specifies that we are returning a `varchar(256)` value and that the language will be `javascript`. Lastly, we use `$$` to delimit the body of our function from the rest of the statement. Using this method, we do not need to change the delimiter to get MySQL to interpret the function correctly.

```sql
returns varchar(256) language javascript as $$
```

Inside the function's body, we first perform some primitive validation by forcing any value for `format` to `short` if it is not equal to `long`.

```javascript
if(format !== 'long') format = 'short'
```

In the next block of code, we set the values for the number of `hours`, `minutes`, and `seconds` represented by the value of `seconds`. For those who may not be familiar with the modulo (`%`) operator, it is the same as asking for the remainder when doing a division problem. For example, `5 % 3` would equal `2`. We use the `floor()` method of the global `Math` object for the number of hours and minutes.

```javascript
const hrs = Math.floor(seconds/3600)
const mins = Math.floor((seconds % 3600) / 60)
const secs = (seconds % 60)
```

Next, we define a `switch/case` statement based on the value of `format` after forcing the value to lowercase.

```javascript
switch(format.toLowerCase()){
```

The first case we define is if the `format` value (forced to lowercase) is `short`. In this case, we are using [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) to create a string using inline variables. Template literals are easier to read than string concatenation, making one-liners easier. For each variable (`hours`, `minutes`, and `seconds`), we call the `toString()` method and then chain the `padStart()` method to left pad a `0` for any value less than `10`. Lastly, we separate these in the template with a colon (`:`). The string generated by the template literal is returned, and we use `break` to signify the case is complete.

```javascript
case 'short':
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    break
```

The second (and final) case is used when the value of `format` (forced to lowercase) is `long`. Here, we first set a variable named `lng` to an empty string. Then we check each variable (`hours`, `minutes`, and `seconds`) to see if it is greater than `0`. If it is, we use string concatenation (`+=`) of `lng` to add that segment to our output. Again, we use a template literal to build this string and use logic to include the `s` if the value is more than 1. Note that we have added a space at the end of the `hours` and `minutes` lines. This space is so the output is easier to read. Finally, return `lng.trim()` to eliminate trailing spaces if they exist.

```javascript
case 'long':
    let lng = ''
    if(hrs > 0) lng += `${hrs} hour${hrs > 1 ? 's' : ''} `
    if(mins > 0) lng += `${mins} minute${mins > 1 ? 's' : ''} `
    if(secs > 0) lng += `${secs} second${secs > 1 ? 's' : ''}`
    return lng.trim()
    break
```

We close the switch statement, and the last line of our function includes `$$` to tell MySQL we are done defining our function.

```sql
    }
$$;
```

## Running the Function

We can now use this function the same as we can any other MySQL function. Let's look at some examples.

```sql
select secondsToHoursMinsSecs(1234, 'short') as result;
```

The result for this query will be:

```text
+----------+
| result   |
+----------+
| 00:20:34 |
+----------+
```

Let's take a look at what the long format looks like for this value. Run the following command:

```sql
select secondsToHoursMinsSecs(1234, 'long') as result;
```

The result of this query will be:

```text
+-----------------------+
| result                |
+-----------------------+
| 20 minutes 34 seconds |
+-----------------------+
```

The `hours` block is left off because the value was `0`.

Here is another example.

```sql
select secondsToHoursMinsSecs(18105, 'short') as result;
```

The output from this query will be:

```text
+----------+
| result   |
+----------+
| 05:01:45 |
+----------+
```

To see the `long` format for `18105` seconds, run this command:

```sql
select secondsToHoursMinsSecs(18105, 'long') as result;
```

The result for this query will be:

```text
+-----------------------------+
| result                      |
+-----------------------------+
| 5 hours 1 minute 45 seconds |
+-----------------------------+
```

In this example, we see that all three segments exist and that the `minute` segment uses the singular form of the word `minute`.

## Wrap-Up

I am a fan of returning data from the database in the format it will be used. This lightens the load on whatever front-end process will be using the data. By using JavaScript to write MySQL stored functions, we can harness some of JavaScript's more powerful features to accomplish this. These include (but are not limited to) template literals and global objects. The examples above show how to use the features to write more readable and manageable code.

Photo by <a href="https://unsplash.com/@aronvisuals?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Aron Visuals</a> on <a href="https://unsplash.com/photos/selective-focus-photo-of-brown-and-blue-hourglass-on-stones-BXOXnQ26B7o?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  