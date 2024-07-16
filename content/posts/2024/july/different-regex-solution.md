---
title: A Different RegEx Solution
date: 2024-07-16T06:00:00
image: 2024/different-regex-solution/header.jpg
tags: [ "MySQL", "Regular-Expressions" ]
series: reg-ex-mysql
description: A different regex solution for a problem discussed in a previous post.
---

In my [last post](/posts/2024/july/more-regular-expressions-mysql/) about regular expressions (regex), I offered up a solution to requirements to extract text a substring from a larger blob of text. Over the weekend, I was thinking about this solution and wanted to know if it was possible to meet the requirements using a solution based solely on a regular expression. It turns out it is.

## The Requirement

For a refresher, here is what the requirement was:

> Let's assume we are working on a software project and need to return rows from a database where the word 'Ipsum' is followed by a space and then a five- or six-letter word. Instead of returning the entire text or a substring from the beginning of the text, we need to return the matching text and up to six characters before and after the match.

Here is the query we used to solve this requirement.

```sql
select id,
       name,
       substr(
               sample,
               greatest(
                       1,
                       (regexp_instr(sample, 'ipsum\\s[a-zA-Z]{5,6}\\b') -6)
               ),
               length(regexp_substr(sample, 'ipsum\\s[a-zA-Z]{5,6}\\b')) + 6
       ) as snippet
from ipsum
where regexp_like(sample, 'ipsum\\s[a-zA-Z]{5,6}\\b')
```

I was pretty happy with this solution, but the more I thought about it, the more it seemed like something Rube Goldberg would create. I realized we could solve this requirement by trimming out a lot of fluff.

## The Full RegEx Way

Here is the query I came up with. It is more elegant and likely offers better performance.

```sql
select id,
            name,
            regexp_substr(sample, '.{0,6}ipsum\\s[a-zA-Z]{5,6}.{0,6}') `snippet`
     from ipsum
     where regexp_like(sample, 'ipsum\\s[a-zA-Z]{5,6}\\b')
```

Here, I am adding a range (`.{0,6}`) at our original match's beginning and end. This range translates into: "zero to six characters". So, instead of using the starting position of our match along with the match itself and`substr()` (and other functions), we can make the pattern match all the text we want returned.

The complete translation of this pattern is now: zero to six characters, followed by the word `ipsum`, followed by a five to six-letter word, followed by zero to six characters. You may be wondering why I used `0,6`. I used this range because `ipsum` could be the start of the string, and the trailing five or six-letter word might be at the very end of the string.

## The Result

The results from this query resemble the output below:

```text
+----+--------------+--------------------------+
| id | name         | snippet                  |
+----+--------------+--------------------------+
|  1 | Lorem Ipsum  | Lorem ipsum dolor sit a  |
|  6 | Cat Ipsum    | Cat ipsum dolor sit a    |
|  8 | Pirate Ipsum | nsign ipsum avast chand  |
| 10 | Dog Ipsum    | Doggo ipsum thicc puggo  |
| 11 | Pizza Ipsum  | Pizza ipsum dolor amet   |
| 14 | Hacker Ipsum | axx0r ipsum tunnel in te |
| 15 | 90's Ipsum   | agels ipsum moody        |
+----+--------------+--------------------------+
7 rows in set (0.0022 sec)
```

The snippet in this query does not exactly match our previous example, but if you count the characters, you can see that this example better meets the requirements.


## Wrap Up

Like many things in a developer's toolkit, using regular expressions to solve problems is not an exact science. There can be more than one way to tackle a problem. In this post, I showed how we can meet our requirements using a solution purely based on regular expressions. For more information on regular expressions in MySQL, check out the [documentation](https://dev.mysql.com/doc/refman/8.4/en/regexp.html).

Photo by <a href="https://unsplash.com/@jjying?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">JJ Ying</a> on <a href="https://unsplash.com/photos/white-and-gray-optical-illusion-7JX0-bfiuxQ?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  