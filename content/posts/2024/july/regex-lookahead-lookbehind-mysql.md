---
title: Using Lookahead & Lookbehind in MySQL Regular Expressions
date: 2024-07-30T06:00:00
image: 2024/regex-lookahead-lookbehind-mysql/header.jpg
image-path: regex-lookahead-lookbehind-mysql/
tags: [ "MySQL", "Regular-Expressions" ]
series: reg-ex-mysql
description: Using lookahead and lookbehind as part of a regular expression in MySQL.
---

Regular expressions are powerful but often misunderstood tools for developers. In recent posts, we have discussed [subexpressions](/posts/2024/july/regex-subexpressions-mysql) and [back references](/posts/2024/july/regex-back-references-mysql) (which are special types of subexpressions). This post will show examples of two other special subexpressions: look ahead and look behind.

## The Requirement

Using the same data we have used in the past, we now have a requirement to return just the word that precedes the text `ipsum` when that word is separated from `ipsum` by a space. The kicker here is that the text `ipsum` should be part of our pattern match but should not be returned. This requirement may sound daunting, but it is pretty simple if we use `lookahead` pattern matching.

## Lookahead?

In a nutshell, a `lookahead` defines a pattern that is matched but is not returned. Lookahead matches are a special type of subexpression and are formatted as such. The syntax of a lookahead is a subexpression (using `( )`) with  `?=` preceding the text we want to match.

## The Solution

It might be easier to understand the syntax if we saw an example. Here is the solution that meets our requirements.

```sql
select
    id,
    name,
    regexp_substr(sample, '[^ ]+(?=[ ]+ipsum)') `snippet`
from ipsum
where regexp_like(sample, '[^ ]+(?=[ ]+ipsum)')
```

The regular expression we use is `[^ ]+(?=[ ]+ipsum)`. Let's break this down and put it in human-readable terms.

* `[^ ]+` - The first part of the regex is a character set that says we want one or more characters that are not spaces.
    * The `+` signifies that we want one or more of the preceding characters or character sets.
* `(` - The left parenthesis starts our subexpression.
* `?=` - The first part of our subexpression signifies we are using a lookahead.
* `[ ]+` - This character set indicates that out match pattern must start with one or more spaces.
    * The `+` signifies that we want one or more of the preceding characters or character sets.
* `ipsum` - This text shows that we want to match the literal text `ipsum`.
* `)` - The right parenthesis ends our subexpression.

Putting this in English, our pattern wants to match one or more characters that are not spaces, followed by one or more spaces, followed by the text `ipsum`. While this is the pattern we wish to match, the only part that gets returned is the pattern outside the lookahead, which is one or more characters that are not spaces.

The results of this query resemble the following:

```text
+----+--------------+---------+
| id | name         | snippet |
+----+--------------+---------+
|  1 | Lorem Ipsum  | Lorem   |
|  2 | Zombie Ipsum | Zombie  |
|  5 | Space Ipsum  | strife  |
|  6 | Cat Ipsum    | Cat     |
|  8 | Pirate Ipsum | ensign  |
| 10 | Dog Ipsum    | Doggo   |
| 11 | Pizza Ipsum  | Pizza   |
| 14 | Hacker Ipsum | Haxx0r  |
| 15 | 90's Ipsum   | bagels  |
+----+--------------+---------+
9 rows in set (0.0064 sec)
```

Nine rows match our pattern, and what we see returned from our call to `regexp_substr()` is the word that precedes `ipsum` in each `sample`.

## Lookbehind

As we have seen, a lookahead is a special subexpression that matches a pattern that follows another part of our pattern. But what if we wanted to match (but not return) a pattern that precedes another part of our overall pattern? For that, we can use lookbehind. The syntax is slightly different (`?<=` instead of `?=`), but the effect is the same. The lookbehind will be used to match a pattern but will not be returned as part of the match.

## New Requirement

We have been given a new requirement. Now, we need to return the word that follows the text `ipsum`, but only if a space separates them.

Here is a query that meets this new requirement:

```sql
select
    id,
    name,
    regexp_substr(sample, '(?<=ipsum[ ])[^ ]+') `snippet`
from ipsum
where regexp_like(sample, '(?<=ipsum[ ])[^ ]+')
```

Let's break down the regex, `(?<=ipsum[ ])[^ ]+`.

* `(` - The left parenthesis starts our subexpression.
* `?=` - The first part of our subexpression signifies we are using a lookbehind.
* `ipsum` - This text shows that we want to match the literal text `ipsum`.
* `[ ]` - This character set indicates that our match pattern must end with a single space.
* `)` - The right parenthesis ends our subexpression.
* `[^ ]+` - The last part of the regex is a character set that says we want one or more characters that are not spaces.
    * The `+` signifies that we want one or more of the preceding characters or character sets.

Putting this in plain language: we want to match the text `ipsum` followed by a single space, followed by one or more characters that are not spaces. Because we use a lookbehind, the text `ipsum` and a space after `ipsum` will be matched but not returned. The results of this query look like the following text:

```text
+----+--------------+----------+
| id | name         | snippet  |
+----+--------------+----------+
|  1 | Lorem Ipsum  | dolor    |
|  2 | Zombie Ipsum | reversus |
|  6 | Cat Ipsum    | dolor    |
|  8 | Pirate Ipsum | avast    |
| 10 | Dog Ipsum    | thicc    |
| 11 | Pizza Ipsum  | dolor    |
| 13 | Trek Ipsum   | is       |
| 14 | Hacker Ipsum | tunnel   |
| 15 | 90's Ipsum   | moody    |
+----+--------------+----------+
9 rows in set (0.0067 sec)
```

## Wrap Up

When using regular expressions, we can use special subexpressions, called lookahead and lookbehind, to define part of a pattern we wish to match but not return. These subexpressions are helpful when we want to find text in a string that precedes or follows a pattern we wish to match. For more information on regular expressions in MySQL, check out the [documentation](https://dev.mysql.com/doc/refman/8.4/en/regexp.html).

Photo by <a href="https://unsplash.com/@sumnerm?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Sumner Mahaffey</a> on <a href="https://unsplash.com/photos/sand-dune-7Y0NshQLohk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
