---
title: Regular Expressions in MySQL
date: 2024-06-27T06:00:00
image: /assets/images/2024/regular-expressions-mysql/header.jpg
tags: [ "MySQL", "Regular-Expressions" ]
series: reg-ex-mysql
---

There is an old developer joke: "If you have a problem, and you decide to use regular expressions to solve it...you now have two problems." Regular expressions (regex) often get a bad name because they can be difficult to decipher and implement. However, in skilled hands, regex can be extremely powerful. In this post, we will discuss how to use regular expressions in MySQL.

## Regular Expressions Definition

In a nutshell, regular expressions are used to match patterns in text. A regular expression we would use in code defines the pattern we seek. These patterns can be simple—such as matching any three consecutive numbers—or complex—such as checking if the second word in a line of text matches a given string.

Typically, the more complex the pattern we must match, the more complicated the regular expressions will be.

In this post, I will cover some basic regular expression concepts. If you want to learn more, I suggest the book Sams Teach Yourself Regular Expressions in 10 Minutes by Ben Forta. I have owned this book for over a decade and use it often when I need to use regular expressions.

## The Sample Data

Regular expressions are often used to match patterns in large strings. I am using some samples from various 'Lorem Ipsum' generators for the demos in this post. For those who may not know, a lorem ipsum generator produces filler text (often just gibberish). There are quite a few different generators you can use depending on the project or your style.

When I run the following query:

```sql
select id, name, substr(sample, 1, 50) sample from ipsum;
```

I get the following results:

```text
+----+----------------+----------------------------------------------------+
| id | name           | sample                                             |
+----+----------------+----------------------------------------------------+
|  1 | Lorem Ipsum    | Lorem ipsum dolor sit amet, consectetur adipiscing |
|  2 | Zombie Ipsum   | Zombie ipsum reversus ab viral inferno             |
|  3 | Cupcake Ipsum  | Icing tootsie roll dessert bear claw shortbread sh |
|  4 | Delorean Ipsum | Calvin, why do you keep calling me Calvin? No, Bif |
|  5 | Space Ipsum    | There is no strife ipsum, no prejudice, no nationa |
|  6 | Cat Ipsum      | Cat ipsum dolor sit amet, who's the baby yet bury  |
|  7 | Cheese Ipsum   | Feta rubber cheese taleggio. Mascarpone roquefort  |
|  8 | Pirate Ipsum   | Sink me landlubber or just lubber scallywag coxswa |
|  9 | Golf Ipsum     | Looking for a new angle of attack Ostrich Take a m |
| 10 | Dog Ipsum      | Doggo ipsum thicc puggo yapper heck bork borkdrive |
| 11 | Pizza Ipsum    | Pizza ipsum dolor amet string cheese bbq rib onion |
| 12 | Code Ipsum     | Domain Ada Lovelace imperative-mood hardcoded full |
| 13 | Trek Ipsum     | We're acquainted with the wormhole phenomenon, but |
| 14 | Hacker Ipsum   | Haxx0r ipsum tunnel in terminal back door bubble s |
| 15 | 90's Ipsum     | Union jack dream team phat renting movies at a sto |
+----+----------------+----------------------------------------------------+
```

The first row contains text from the original Lorem Ipsum generator, and the other rows are from generators I find interesting or funny.

## Matching a Simple String

When creating a regular expression, it is a good idea to start simple and add complexity as you go along. This iterative process makes it easier to identify where you may have issues with your pattern.

Many lorem ipsum generators will include the word 'ipsum' in the text. We will start with a simple pattern match of a single word. We will return all rows containing the word 'ipsum'.

```sql
select id, name, substr(sample, 1, 50) sample from ipsum where regexp_like(sample, 'ipsum');
```

When using the `regexp_like()` function, the first argument is the text we are searching for, and the second is the regular expression we want to match. We want to match the simple string 'ipsum' for this example.

This query gives us the following results:

```text
+----+--------------+----------------------------------------------------+
| id | name         | sample                                             |
+----+--------------+----------------------------------------------------+
|  1 | Lorem Ipsum  | Lorem ipsum dolor sit amet, consectetur adipiscing |
|  2 | Zombie Ipsum | Zombie ipsum reversus ab viral inferno             |
|  5 | Space Ipsum  | There is no strife ipsum, no prejudice, no nationa |
|  6 | Cat Ipsum    | Cat ipsum dolor sit amet, who's the baby yet bury  |
|  8 | Pirate Ipsum | Sink me landlubber or just lubber scallywag coxswa |
| 10 | Dog Ipsum    | Doggo ipsum thicc puggo yapper heck bork borkdrive |
| 11 | Pizza Ipsum  | Pizza ipsum dolor amet string cheese bbq rib onion |
| 13 | Trek Ipsum   | We're acquainted with the wormhole phenomenon, but |
| 14 | Hacker Ipsum | Haxx0r ipsum tunnel in terminal back door bubble s |
+----+--------------+----------------------------------------------------+
```

Only nine of the 15 rows in the 'sample' column contain the word 'ipsum'.

*Yes, we could have used a query with `WHERE sample LIKE '%ipsum%'` to get the same results, but then we would not build on this to do more complex pattern matching.*

## Matching the Start of a String

Most of the values in the `sample` column contain more than one line of text delimited by line breaks. One feature of regex I often use is matching a pattern at the beginning or end of a string.

To match a pattern at the beginning of a string, we use `^` at the beginning of our regular expression. In this example, we are also using `.*`, which signifies we are looking for zero or more instances of any character. The `.` signifies any character, and the `*` represents zero or more instances.

```sql
select id, name, substr(sample, 1, 50) sample from ipsum where regexp_like(sample, '^.*ipsum');
```

In simpler terms, we want to match the value of the `sample` when the first line of text starts with zero or more characters and then contains the word 'ipsum'. The result for this query would be:

```text
+----+--------------+----------------------------------------------------+
| id | name         | sample                                             |
+----+--------------+----------------------------------------------------+
|  1 | Lorem Ipsum  | Lorem ipsum dolor sit amet, consectetur adipiscing |
|  2 | Zombie Ipsum | Zombie ipsum reversus ab viral inferno             |
|  5 | Space Ipsum  | There is no strife ipsum, no prejudice, no nationa |
|  6 | Cat Ipsum    | Cat ipsum dolor sit amet, who's the baby yet bury  |
| 10 | Dog Ipsum    | Doggo ipsum thicc puggo yapper heck bork borkdrive |
| 11 | Pizza Ipsum  | Pizza ipsum dolor amet string cheese bbq rib onion |
| 14 | Hacker Ipsum | Haxx0r ipsum tunnel in terminal back door bubble s |
+----+--------------+----------------------------------------------------+
```

This query returns seven rows, but looking at the `sample` column from Space Ipsum (`id` of `5`), we can see that while 'ipsum' is in the first line, it is not the second word. Can we use regular expressions to filter this list even more? We sure can.

## POSIX Character Classes

It might be easier to understand how to filter results where the `sample` column has the word 'ipsum' as the second word in the first line by providing the query first.

```sql
select id, name, substr(sample, 1, 50) sample from ipsum where regexp_like(sample, '^[^[:space:]]+[:space:]ipsum');
```

As we can see, this got more complex. Let's break down this regular expression into more straightforward language.

* We start with `^` again to specify we want to match our pattern at the beginning of a line.
* Next, we use `[^[:space:]]` to define a character set that contains all characters other than white space characters.
    * A character set is defined by `[ ]`.
    * The `^` inside the character set is like saying 'not'. So this says, 'not a white space character'.
    * The `[:space:]` is a PSOX character class for any white space characters.
* Next, we use a `+` to state we want one or more instances of the character set.
* We then use `[:space:]` again to show there must be a single space after the matching character set at the beginning of the first line.
* Finally, we use the literal string 'ipsum'.

Here are the results of this query.

```text
+----+--------------+----------------------------------------------------+
| id | name         | sample                                             |
+----+--------------+----------------------------------------------------+
|  1 | Lorem Ipsum  | Lorem ipsum dolor sit amet, consectetur adipiscing |
|  2 | Zombie Ipsum | Zombie ipsum reversus ab viral inferno             |
|  6 | Cat Ipsum    | Cat ipsum dolor sit amet, who's the baby yet bury  |
| 10 | Dog Ipsum    | Doggo ipsum thicc puggo yapper heck bork borkdrive |
| 11 | Pizza Ipsum  | Pizza ipsum dolor amet string cheese bbq rib onion |
| 14 | Hacker Ipsum | Haxx0r ipsum tunnel in terminal back door bubble s |
+----+--------------+----------------------------------------------------+
```

Now, six rows are returned, all with 'ipsum' as the second word in the first line.

We can write this regular expression using a slightly different syntax.

```sql
select id, name, substr(sample, 1, 50) sample from ipsum where regexp_like(sample, '^[^\\s]+\\sipsum');
```

We replace the POSIX `[:space:]` with `\\s` in this query. In many regular expression engines, we would use `\s`, but we need to escape the `\` in the query, so we use `\\`.

The result of this query is the same as the previous one.

```text
+----+--------------+----------------------------------------------------+
| id | name         | sample                                             |
+----+--------------+----------------------------------------------------+
|  1 | Lorem Ipsum  | Lorem ipsum dolor sit amet, consectetur adipiscing |
|  2 | Zombie Ipsum | Zombie ipsum reversus ab viral inferno             |
|  6 | Cat Ipsum    | Cat ipsum dolor sit amet, who's the baby yet bury  |
| 10 | Dog Ipsum    | Doggo ipsum thicc puggo yapper heck bork borkdrive |
| 11 | Pizza Ipsum  | Pizza ipsum dolor amet string cheese bbq rib onion |
| 14 | Hacker Ipsum | Haxx0r ipsum tunnel in terminal back door bubble s |
+----+--------------+----------------------------------------------------+
```

You can find more information about using `regex_like()` in the [MySQL Documentation Site](https://dev.mysql.com/doc/refman/8.4/en/regexp.html#function_regexp-like).

## Replacing a Pattern

Using `regexp_like()` is a great way to filter the results of a query based on regular expression matches. But what if we want to replace the matched pattern with another string? In that case, we would use `regexp_replace()`.

Here is a query that replaces a pattern that matches where the second word at the beginning of the first line is 'ipsum' with the text 'MySQL'.

```sql
select id, name, substr(regexp_replace(sample, '^[^\\s]+\\sipsum', 'MySQL'), 1, 50) sample from ipsum;
```

Inside the `regex_replace()` function, we specify the text we want to search - in this case, the `sample` column in the `ipsum` table, the regex pattern we want to match, and the text we want to replace the matched pattern with. The results of this query will resemble the following output:

```text
+----+----------------+----------------------------------------------------+
| id | name           | sample                                             |
+----+----------------+----------------------------------------------------+
|  1 | Lorem Ipsum    | MySQL dolor sit amet, consectetur adipiscing elit, |
|  2 | Zombie Ipsum   | MySQL reversus ab viral inferno                    |
|  3 | Cupcake Ipsum  | Icing tootsie roll dessert bear claw shortbread sh |
|  4 | Delorean Ipsum | Calvin, why do you keep calling me Calvin? No, Bif |
|  5 | Space Ipsum    | There is no strife ipsum, no prejudice, no nationa |
|  6 | Cat Ipsum      | MySQL dolor sit amet, who's the baby yet bury the  |
|  7 | Cheese Ipsum   | Feta rubber cheese taleggio. Mascarpone roquefort  |
|  8 | Pirate Ipsum   | Sink me landlubber or just lubber scallywag coxswa |
|  9 | Golf Ipsum     | Looking for a new angle of attack Ostrich Take a m |
| 10 | Dog Ipsum      | MySQL thicc puggo yapper heck bork borkdrive puppe |
| 11 | Pizza Ipsum    | MySQL dolor amet string cheese bbq rib onions pork |
| 12 | Code Ipsum     | Domain Ada Lovelace imperative-mood hardcoded full |
| 13 | Trek Ipsum     | We're acquainted with the wormhole phenomenon, but |
| 14 | Hacker Ipsum   | MySQL tunnel in terminal back door bubble sort bar |
| 15 | 90's Ipsum     | Union jack dream team phat renting movies at a sto |
+----+----------------+----------------------------------------------------+
```

Notice that the value of `sample` has been updated for Lorem Ipsum, Zombie Ipsum, Cat Ipsum, Dog Ipsum, Pizza Ipsum, and Hacker Ipsum. When 'ipsum' is the second word in the first line, the first two words are replaced with the text 'MySQL'.

## Wrap Up

Regular Expressions are a very powerful tool for developers. Unfortunately, that power is often misunderstood, which has led to regular expressions' lousy reputation as being difficult to use. If you are starting out learning regular expressions, take an iterative approach similar to what we did in this post, and you will find them easier to understand. Head over to the [MySQL Documentation]() to learn more about using regular expressions in MySQL.

Photo by <a href="https://unsplash.com/@aridley88?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Andrew Ridley</a> on <a href="https://unsplash.com/photos/a-multicolored-tile-wall-with-a-pattern-of-small-squares-jR4Zf-riEjI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  