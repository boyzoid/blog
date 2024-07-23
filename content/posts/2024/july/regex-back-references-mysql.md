---
title: RegEx Backreferences in MySQL
date: 2024-07-23T06:00:00
image: 2024/regex-back-references-mysql/header.jpg
image-path: 2024/regex-back-references-mysql/
tags: [ "MySQL", "Regular-Expressions" ]
series: reg-ex-mysql
description: Using backreferences as part of a pattern match in MySQL
---

In [my last regular expressions post](/posts/2024/july/regex-subexpressions-mysql/), we discussed subexpressions and how to isolate specific parts of our pattern match. We can then use those subexpressions to replace parts of our pattern with other text. This post will discuss backreferences and how we can use them as part of our pattern match.

## Backreferences?

In regular expressions, backreferences are a way to match text already matched elsewhere. In other words, backreferences are a way to use a previously defined subexpression as part of our pattern match. It might be easier to understand with an example.

## The Requirement

For this post, we want to find all the rows in which the `sample` column in our `ipsum` table contains text where a word is repeated right after itself—such as '...and then then she won...'.

When searching for a second occurrence of a word, we need to know the word. Backreferences allow us to do this.

## The Solution

As I have done in the past, I will provide the solution and then break down the regex to make it more 'readable'.

Here is a query that will get all the rows where the `sample` column contains consecutively repeated words and returns the first instance of a repeated word.

```sql
select
    id,
    name,
    regexp_substr(sample, '[ ]+(\\w+)[ ]+\\1') `snippet`
from ipsum
where sample regexp '[ ]+(\\w+)[ ]+\\1'
```

The regex we use as part of the `select` and `where` clauses is the same - `[ ]+(\\w+)[ ]+\\1`. It is just used in different MySQL functions. Let's take a look at this regex.

* `[ ]+` : This segment of our pattern says we want to match one or more spaces.
* `(\\w+)` : This segment notes that we want to match one or more characters in the character set designated by `\\w`.
  * The `\\w` character set is any alphanumeric character, digit, or underscore
  * Note that we wrapped this in `( )`. This notation makes this part of the pattern a subexpression.
* `[ ]+` : This segment of our pattern says we want to match one or more spaces.
* `\\1` : This part of our pattern is the backreference. Here, we want to use the value of the first subexpression as part of our match.
  * Backreferences are numbered in the same way subexpressions are numbered.

When we put this all together, our regex pattern is: One or more spaces, followed by one or more alphanumeric characters, digits, or underscores, followed by one or more spaces, followed by the matched alphanumeric characters, digits, or underscores.

We get the following results when I run this query against my demo database.

```text
+----+----------------+------------------------+
| id | name           | snippet                |
+----+----------------+------------------------+
|  3 | Cupcake Ipsum  |  shortbread shortbread |
|  4 | Delorean Ipsum |  No no                 |
|  6 | Cat Ipsum      |  furry furry           |
|  7 | Cheese Ipsum   |  halloumi halloumi     |
|  9 | Golf Ipsum     |  Jigger Jigger         |
| 10 | Dog Ipsum      |  bork bork             |
| 11 | Pizza Ipsum    |  bacon bacon           |
| 12 | Code Ipsum     |  me Me                 |
| 15 | 90's Ipsum     |  team team             |
+----+----------------+------------------------+
```

These results show that nine rows contain repeated words in the `sample` column. Please note that the way we crafted our regex is case-insensitive. We can see this in the results from Delorean Ipsum and Code Ipsum.

## Wrap Up

When we need to use a subexpression as part of our pattern match, we can use backreferences in our pattern to point to the value of those subexpressions. There are many use cases for backreferences, but finding repeated words in a string is a basic example that shows the basic usage of backreferences in a pattern match. For more information on regular expressions in MySQL, check out the [documentation](https://dev.mysql.com/doc/refman/8.4/en/regexp.html).


Photo by <a href="https://unsplash.com/@teowithacamera?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Teo D</a> on <a href="https://unsplash.com/photos/brown-surface-4op9_2Bt2Eg?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  