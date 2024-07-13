---
title: Debugging JavaScript Stored Functions in MySQL
date: 2024-05-21T06:00:00
image: 2024/debugging-javascript-stored-functions-mysql/header.jpg
tags: ["MySQL", "JavaScript", "Debugging"]
related:
  - /posts/2024/may/searching-arrays-in-mysql-with-javascript/
  - /posts/2024/may/filtering-arrays-javascript-mysql/
  - /posts/2024/may/using-intl-in-mysql/
  - /posts/2024/may/more-javascript-in-mysql/
  - /posts/2024/may/sorting-json-arrays-mysql-javascript/

---

Recently, I have written extensively about using JavaScript to create stored functions in MySQL. I have talked about [searching](/posts/2024/may/searching-arrays-in-mysql-with-javascript/), [filtering](/posts/2024/may/filtering-arrays-javascript-mysql/), and [sorting](/posts/2024/may/sorting-json-arrays-mysql-javascript/) JSON array data. I have discussed using top-level JavaScript objects such as [Intl](/posts/2024/may/using-intl-in-mysql/) and [Math](/posts/2024/may/more-javascript-in-mysql/). Today, I will talk about debugging stored functions written in JavaScript.

## The Problem

Debugging MySQL stored functions, even those written in SQL, can be arduous. Debugging JavaScript, on the other hand, can be pretty straightforward. When debugging JavaScript code, `console.log()` can be a developer's best friend. Like many other JavaScript features, `console.log()` is available when creating stored functions in MySQL using JavaScript. The only drawback is that we must take another step to view this debug data.

## Our Requirements

We will assume that we have a requirement to write a function that divides two numbers. One requirement is that if the denominator (or divisor) is `0`, we do not throw an error but return `null`. To address these requirements, we come up with the following function.

```sql
create function division(a int, b int)
    returns double language javascript as $$
    function validDenominator(num){
        console.log("Validating input value: ", num)
        return num !== 0
    }
    return validDenominator(b) ? a/b : null
$$;
```

## Breaking Down the Code

Let's break this down into more manageable chunks.

The first two lines define the function name as `division`—which has two arguments named `a` and `b`, both of which are of data type `int`—and specify that the value returned is of data type `double` and that the function body will be written in JavaScript. The last part of our second line uses `$$` to tell MySQL we are about to start defining the function body.

```sql
create function division(a int, b int)
    returns double language javascript as $$
```

The first code block seems odd because it defines a JavaScript function inside our stored function. This function, named `validDenominator()`, is used to check that the value of `num` is not `0`. This function is only available inside our stored function and cannot be accessed from any other function. The first line inside this function calls `console.log()` and we return whether the value of `num` does NOT equal `0`.

```javascript
    function validDenominator(num){
    console.log("Validating input value: ", num)
    return num !== 0
}
```

The only other line in our store function is a `return` statement that uses a [ternary operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator) to determine what we return from our stored function.

```javascript
return validDenominator(b) ? a/b : null
```

This means that if the value of `b` returns `true` from `validDenominator()` (meaning it is NOT `0`), we return the value of `a` divided by `b`. If the value of `b` returns false from `validDenominator()` (meaning it IS `0`), we return `null`.

## Using the Function

We can use this function in the same manner we cna use any MySQL function. For this example, we will use it in a simple `select` statement.

```sql
select division(5,2) demo_1, division(2,0) demo_2;
```

We call `division()` twice with different number sets. The result for this query will be:

```text
+--------+--------+
| demo_1 | demo_2 |
+--------+--------+
|    2.5 |   NULL |
+--------+--------+
```

The value for `demo_2` is `null` because the value of `b` passed to `division()` is '0'.

## Viewing the Debug Info

Now that we have called the function a few times, we can look at the output from our call to `console.log()`. To see this information, we run the following query:

```sql
select mle_session_state("stdout")\G
```

I used `\G` to make the query result easier to read. The output form this query is:

```text
*************************** 1. row ***************************
mle_session_state("stdout"): Validating input value:  2
Validating input value:  0
```

The results of this query show the output from our calls to `console.log()`.

## Wrap-Up

Debugging is a normal part of software development. One powerful debugging tool JavaScript developers have at their disposal is `console.log()`. When using JavaScript to create stored functions in MySQL, we can log information using `console.log()`. While the information will not be displayed in the console as it would in JavaScript-based applications, we can view the output of our `console.log()` statements by running a simple query.


Photo by <a href="https://unsplash.com/@sigmund?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">rivage</a> on <a href="https://unsplash.com/photos/man-in-black-t-shirt-sitting-on-white-chair-TVxYoWzqdjs?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  