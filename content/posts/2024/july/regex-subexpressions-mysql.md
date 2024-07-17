---
title: Using RegEx Subexpressions in MySQL
date: 2024-07-18T06:00:00
image: 2024/regex-subexpressions-mysql/header.jpg
image-path: 2024/regex-subexpressions-mysql/
tags: [ "MySQL", "Regular-Expressions" ]
series: reg-ex-mysql
description: Using subexpressions as part of a regular expression in MySQL
---

As I have discussed, regular expressions can be a powerful tool for developers. When we use regular expressions to match a pattern and need to replace part of that pattern, subexpressions make it much easier. Subexpressions are specific parts of a pattern that we can reference elsewhere in the process.

## The Requirement

The requirement for this exercise is simple. If the word 'ipsum' exists in our string, and there is a word before the instance of 'ipsum', replace that word with four asterisks. For example, if we had a string that contained the text `...Scott ipsum...`, or solution must return `...**** ipsum...`.

## The Setup

This exercise will use the following query as our starting point.

```sql
select
    id,
    name,
    substr(sample, 1, 50) sample
from ipsum
where id in (1,2,6,10,11);
```

I chose those specific rows because `ipsum` is the second word in each of them. The result of this query resembles the following:

```text
+----+--------------+----------------------------------------------------+
| id | name         | sample                                             |
+----+--------------+----------------------------------------------------+
|  1 | Lorem Ipsum  | Lorem ipsum dolor sit amet, consectetur adipiscing |
|  2 | Zombie Ipsum | Zombie ipsum reversus ab viral inferno             |
|  6 | Cat Ipsum    | Cat ipsum dolor sit amet, who's the baby yet bury  |
| 10 | Dog Ipsum    | Doggo ipsum thicc puggo yapper heck bork borkdrive |
| 11 | Pizza Ipsum  | Pizza ipsum dolor amet string cheese bbq rib onion |
+----+--------------+----------------------------------------------------+
5 rows in set (0.0033 sec)
```

## The Solution

As I said above, a subexpression is an annotated portion of our pattern in regex. In our regular expression, we separate subexpressions by wrapping them in parentheses `( )`. Each subexpression can then be referenced using a dollar sign `$` followed by the subexpression number you want (numbered from left to right).

Let's take a look at a query that satisfies our requirements.

```sql
select
    id,
    name,
    substr(regexp_replace(sample, '(\\b.+\\b)(ipsum)', '**** $2'), 1, 50) snippet
from ipsum
where id in (1,2,6,10,11);
```

The second argument of `regexp_replace()` shows that two regex parts are wrapped in parentheses. This annotation means that we will have two subexpressions. Let's break these down individually. We will start with `(\\b.*\\b)`.

* `(` : The left parenthesis indicates the start of our subexpression. It is **NOT** used as part of the pattern match.
* `\\b` : This part of the regex says we want to match a word boundary.
* `.+` : Next, we specify we want to match one or more characters.
  * The `.` indicates any character.
  * The `+` indicates one or more.
* `\\b` : This part of the regex says we want to match a word boundary.
* `)` : The right parenthesis indicates the end of our subexpression. It is **NOT** used as part of the pattern match.

The second subexpression, `(ipsum)`, is easier to read.

* `(` : The left parenthesis indicates the start of our subexpression. It is **NOT** used as part of the pattern match.
* `ipsum` : Indicates we want to match the literal string 'ipsum'.
* `)` : The right parenthesis indicates the end of our subexpression. It is **NOT** used as part of the pattern match.

When we combine these two, our pattern translates to a word boundary followed by one or more characters, followed by another word boundary, followed by the text 'ipsum'.

We reference the second subexpression using `$2` in the third argument. Now, `regexp_repalce()` will replace our matching pattern with the literal string `****` and the value of our second subexpression.

Here are the results of this query:

```text
+----+--------------+----------------------------------------------------+
| id | name         | snippet                                            |
+----+--------------+----------------------------------------------------+
|  1 | Lorem Ipsum  | **** ipsum dolor sit amet, consectetur adipiscing  |
|  2 | Zombie Ipsum | **** ipsum reversus ab viral inferno               |
|  6 | Cat Ipsum    | **** ipsum dolor sit amet, who's the baby yet bury |
| 10 | Dog Ipsum    | **** ipsum thicc puggo yapper heck bork borkdrive  |
| 11 | Pizza Ipsum  | **** ipsum dolor amet string cheese bbq rib onions |
+----+--------------+----------------------------------------------------+
5 rows in set (0.0447 sec)
```

The word before `ipsum` in each row has been replaced with `****`.

## Having Some Fun

The solution above satisfies our requirements, but let's see how else we can use these subexpressions.

If we wanted to replace `ipsum` with `****`, we could use this query:

```sql
select
    id,
    name,
    substr(regexp_replace(sample, '(\\b.+\\b)(ipsum)', '$1 ****'), 1, 50) snippet
from ipsum
where id in (1,2,6,10,11);
```

The only change we made was to the text we want to use as a replacement. We are using the value of the first subexpression followed by `****`. The results of this query look like:

```text
+----+--------------+----------------------------------------------------+
| id | name         | snippet                                            |
+----+--------------+----------------------------------------------------+
|  1 | Lorem Ipsum  | Lorem  **** dolor sit amet, consectetur adipiscing |
|  2 | Zombie Ipsum | Zombie  **** reversus ab viral inferno             |
|  6 | Cat Ipsum    | Cat  **** dolor sit amet, who's the baby yet bury  |
| 10 | Dog Ipsum    | Doggo  **** thicc puggo yapper heck bork borkdrive |
| 11 | Pizza Ipsum  | Pizza  **** dolor amet string cheese bbq rib onion |
+----+--------------+----------------------------------------------------+
5 rows in set (0.0599 sec)
```

This example shows how to use subexpressions, but we would not need regex to replace the text `ipsum` with `****`. But what if we wanted to swap the words that match our pattern?

We can accomplish that simply by updating our replacement text to `$2 $1` like in the query below:

```sql
select
    id,
    name,
    substr(regexp_replace(sample, '(\\b.+\\b)(ipsum)', '$2 $1'), 1, 50) snippet
from ipsum
where id in (1,2,6,10,11);
```

The result of this query would be:

```text
+----+--------------+----------------------------------------------------+
| id | name         | snippet                                            |
+----+--------------+----------------------------------------------------+
|  1 | Lorem Ipsum  | ipsum Lorem  dolor sit amet, consectetur adipiscin |
|  2 | Zombie Ipsum | ipsum Zombie  reversus ab viral inferno            |
|  6 | Cat Ipsum    | ipsum Cat  dolor sit amet, who's the baby yet bury |
| 10 | Dog Ipsum    | ipsum Doggo  thicc puggo yapper heck bork borkdriv |
| 11 | Pizza Ipsum  | ipsum Pizza  dolor amet string cheese bbq rib onio |
+----+--------------+----------------------------------------------------+
5 rows in set (0.0559 sec)
```

Now, each snippet starts with `ipsum` and is followed by the word that preceded it in the original text.

If this were a real-life scenario, I would probably add logic to ensure the capitalization made sense, but I think this is good enough for this example.

## Wrap Up

Subexpressions in regex can help isolate parts of a pattern so we can reuse them as part of a replacement process. In this post, I showed how we can use each of two subexpressions in different configurations. For more information on regular expressions in MySQL, check out the [documentation](https://dev.mysql.com/doc/refman/8.4/en/regexp.html).

Photo by <a href="https://unsplash.com/@fellowferdi?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Ferdinand Stöhr</a> on <a href="https://unsplash.com/photos/teal-and-pink-artwork-NFs6dRTBgaM?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
  