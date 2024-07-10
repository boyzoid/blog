---
title: More Regular Expressions in MySQL
date: 2024-07-11T06:00:00
image: /assets/images/2024/more-regular-expressions-mysql/header.jpg
tags: [ "MySQL", "Regular-Expressions" ]
series: reg-ex-mysql
description: A practical use of regular expressions in MySQL
---

Regular expressions are used to match patterns in a given block of text. In a [previous post](/posts/2024/june/regular-expressions-mysql/), I discussed some regular expression features of MySQL. The examples I provided allowed us to return rows based on a pattern match and replace instances of our pattern with another substring. In this post, I will discuss some other regular expression functions.

## The Requirement

Let's assume we are working on a software project and need to return rows from a database where the word 'Ipsum' is followed by a space and then a five- or six-letter word. Instead of returning the entire text or a substring from the beginning of the text, we need to return the matching text and up to six characters before and after the match.

## The Match

I like tackling regular expression solutions using an iterative process. First, I want a regular expression that matches the requirement correctly. During the first iteration, I get the pattern that matches `'ipsum` followed by a space.

```sql
select 
    id, 
    name, 
    substr(sample, 1, 50) sample 
from ipsum 
where regexp_like(sample, 'ipsum\\s');
```

The results from this query match the text below.

```text
+----+--------------+----------------------------------------------------+
| id | name         | sample                                             |
+----+--------------+----------------------------------------------------+
|  1 | Lorem Ipsum  | Lorem ipsum dolor sit amet, consectetur adipiscing |
|  2 | Zombie Ipsum | Zombie ipsum reversus ab viral inferno             |
|  6 | Cat Ipsum    | Cat ipsum dolor sit amet, who's the baby yet bury  |
|  8 | Pirate Ipsum | Sink me landlubber or just lubber scallywag coxswa |
| 10 | Dog Ipsum    | Doggo ipsum thicc puggo yapper heck bork borkdrive |
| 11 | Pizza Ipsum  | Pizza ipsum dolor amet string cheese bbq rib onion |
| 13 | Trek Ipsum   | We're acquainted with the wormhole phenomenon, but |
| 14 | Hacker Ipsum | Haxx0r ipsum tunnel in terminal back door bubble s |
| 15 | 90's Ipsum   | Union jack dream team phat renting movies at a sto |
+----+--------------+----------------------------------------------------+
9 rows in set (0.0045 sec)
```
We are off to a good start. We can see that the substrings we return contain several instances where 'ipsum' is followed by a five or six-letter word. We also have some rows where we can't see where the instance of 'ipsum' exists.

To complete our pattern, we use a character set with a range.

```sql
select id, 
       name,
       substr(sample, 1, 50) sample
from ipsum
where regexp_like(sample, 'ipsum\\s[a-zA-Z]{5,6}');
```

The pattern we match here is the word 'ipsum', followed by a space and then five or six characters that are lowercase or uppercase letters. The results of this query look like the following:

```text
+----+--------------+----------------------------------------------------+
| id | name         | sample                                             |
+----+--------------+----------------------------------------------------+
|  1 | Lorem Ipsum  | Lorem ipsum dolor sit amet, consectetur adipiscing |
|  2 | Zombie Ipsum | Zombie ipsum reversus ab viral inferno             |
|  6 | Cat Ipsum    | Cat ipsum dolor sit amet, who's the baby yet bury  |
|  8 | Pirate Ipsum | Sink me landlubber or just lubber scallywag coxswa |
| 10 | Dog Ipsum    | Doggo ipsum thicc puggo yapper heck bork borkdrive |
| 11 | Pizza Ipsum  | Pizza ipsum dolor amet string cheese bbq rib onion |
| 14 | Hacker Ipsum | Haxx0r ipsum tunnel in terminal back door bubble s |
| 15 | 90's Ipsum   | Union jack dream team phat renting movies at a sto |
+----+--------------+----------------------------------------------------+
8 rows in set (0.0050 sec)
```

We have seven rows returned, but look closely at some of the data. There are items in the list where 'Ipsum' is followed by words with more than five or six letters. The issue is that our pattern needs to be more specific. Because a word with eight characters after 'Ipsum' matches our pattern, we need to tweak our pattern to get the match correct.

```sql
select id, 
       name,
       substr(sample, 1, 50) sample
from ipsum
where regexp_like(sample, 'ipsum\\s[a-zA-Z]{5,6}\\b');
```

We changed our regular expression to add `\\b` to the end of our range. This adds a word boundary character to our pattern and changes the logic to: 'ipsum' followed by a space, then five or six characters, and finally a word boundary. A 'word boundary' character signifies the start or end of a word; this includes spaces and other punctuation that would not usually be considered part of a word.

Here are the results of this query.

```text
+----+--------------+----------------------------------------------------+
| id | name         | sample                                             |
+----+--------------+----------------------------------------------------+
|  1 | Lorem Ipsum  | Lorem ipsum dolor sit amet, consectetur adipiscing |
|  6 | Cat Ipsum    | Cat ipsum dolor sit amet, who's the baby yet bury  |
|  8 | Pirate Ipsum | Sink me landlubber or just lubber scallywag coxswa |
| 10 | Dog Ipsum    | Doggo ipsum thicc puggo yapper heck bork borkdrive |
| 11 | Pizza Ipsum  | Pizza ipsum dolor amet string cheese bbq rib onion |
| 14 | Hacker Ipsum | Haxx0r ipsum tunnel in terminal back door bubble s |
| 15 | 90's Ipsum   | Union jack dream team phat renting movies at a sto |
+----+--------------+----------------------------------------------------+
7 rows in set (0.0013 sec)
```

Notice that the row from Zombie Ipsum is now excluded from our result.

## Getting the Position

Now that we have the pattern we need, we need to figure out where the pattern exists in our string. We can use the `regexp_instr()` function to do this. A query uses this function to return the place in the string where the pattern starts.

```sql
select id,
       name,
       regexp_instr(sample, 'ipsum\\s[a-zA-Z]{5,6}\\b') start_pos
from ipsum
where regexp_like(sample, 'ipsum\\s[a-zA-Z]{5,6}\\b');
```

By default, `regexp_instr()` will start the pattern match from the first character and return info for the first match.

This query gives us the following results:

```text
+----+--------------+-----------+
| id | name         | start_pos |
+----+--------------+-----------+
|  1 | Lorem Ipsum  |         7 |
|  6 | Cat Ipsum    |         5 |
|  8 | Pirate Ipsum |       280 |
| 10 | Dog Ipsum    |         7 |
| 11 | Pizza Ipsum  |         7 |
| 14 | Hacker Ipsum |         8 |
| 15 | 90's Ipsum   |      1385 |
+----+--------------+-----------+
7 rows in set (0.0013 sec)
```

Another function we will need to use as part of our solution is `regexp_substr()`. This function returns a substring that matches our pattern. This function also defaults the search from the first character in the string and returns the first match.

```sql
select id,
       name,
       regexp_instr(sample, 'ipsum\\s[a-zA-Z]{5,6}\\b') start_pos,
       regexp_substr(sample, 'ipsum\\s[a-zA-Z]{5,6}\\b') `match`
from ipsum
where regexp_like(sample, 'ipsum\\s[a-zA-Z]{5,6}\\b')
```

The results for this query are:

```text
+----+--------------+-----------+--------------+
| id | name         | start_pos | match        |
+----+--------------+-----------+--------------+
|  1 | Lorem Ipsum  |         7 | ipsum dolor  |
|  6 | Cat Ipsum    |         5 | ipsum dolor  |
|  8 | Pirate Ipsum |       280 | ipsum avast  |
| 10 | Dog Ipsum    |         7 | ipsum thicc  |
| 11 | Pizza Ipsum  |         7 | ipsum dolor  |
| 14 | Hacker Ipsum |         8 | ipsum tunnel |
| 15 | 90's Ipsum   |      1385 | ipsum moody  |
+----+--------------+-----------+--------------+
7 rows in set (0.0026 sec)
```

## Putting it Together

We now have all the necessary information to grab the substring that matches our requirements. All we need to do is put them all together. Here is the query that meets our requirements.

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

To get the snippet of text that matches our pattern and then six characters on either side, we need to use the `substr()` function. We pass the column `sample` as the first argument.

The second argument is the starting position for the substring. We use `greatest()` because if there are fewer than six characters before 'lipsum' in the string, we need to start at `1` rather than the result of `regexp_instr()` minus six.

The third argument for `substr()` is how many characters we want to return. We take the string length that matches the pattern and add six.

Here is the data returned by this query:

```text
+----+--------------+------------------------+
| id | name         | snippet                |
+----+--------------+------------------------+
|  1 | Lorem Ipsum  | Lorem ipsum dolor sit  |
|  6 | Cat Ipsum    | Cat ipsum dolor sit a  |
|  8 | Pirate Ipsum | nsign ipsum avast cha  |
| 10 | Dog Ipsum    | Doggo ipsum thicc pug  |
| 11 | Pizza Ipsum  | Pizza ipsum dolor ame  |
| 14 | Hacker Ipsum | axx0r ipsum tunnel in  |
| 15 | 90's Ipsum   | agels ipsum moody      |
+----+--------------+------------------------+
7 rows in set (0.0092 sec)
```

## Wrap Up

These results match our (admittedly bizarre) requirements. We have returned every row where the `sample` column contains the string 'ipsum' followed by a space and a word with five or six characters. With this example, we can see we used information returned from regular expression functions in other functions to get a snippet of text that contains our match and text surrounding the matched text.

We also showed why it is helpful to use an iterative process to ensure our regular expressions match our expectations. For more information on regular expressions in MySQL, check out the [documentation](https://dev.mysql.com/doc/refman/8.4/en/regexp.html).

Photo by <a href="https://unsplash.com/@koushikc?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Koushik Chowdavarapu</a> on <a href="https://unsplash.com/photos/brown-white-and-yellow-floral-pattern-aWBPk_GBaCk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
  