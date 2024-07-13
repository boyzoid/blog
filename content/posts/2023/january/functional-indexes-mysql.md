---
title: Functional Indexes in MySQL
date: 2023-01-12T06:00:00
image: 2023/functional-indexes/header.jpg
tags: [ "MySQL", "Indexes" ]
related:
    - /posts/2023/january/indexing-json-mysql.md/
---
Database indexes are used to help query performance. Database indexes typically contain information about data in a specific column of the database table. With the introduction of [functional indexes](https://dev.mysql.com/doc/refman/8.0/en/create-index.html#create-index-functional-key-parts) in [MySQL](https://www.mysql.com/downloads/) 8.0.13, we can now create indexes based on the result of an expression or function.

## The Setup

Before talking about functional indexes, let's get some data set up.
Download [this file](https://objectstorage.us-ashburn-1.oraclecloud.com/n/idmqjyw9i2ib/b/blog/o/test_data.zip) and run the SQL script it contains to get your table created and data inserted.

When you are done, you should have a table named `test_data` with the following structure:

![test_data table structure]({{ "2023/functional-indexes/img1.png" | imgurl }}  "test_data Table Structure")

This table should also contain 2000 rows of data.

## The Problem

As you can see, our table structure is basic. It contains three columns: an `id` and two columns that contain integers.
If we wanted to count how many rows exist where the sum of these two integers is 10, it would look something like this:

```sql
select count(*) from test_data where col1 + col2 = 10;
```

And the result would look like this:

![query results]({{ "2023/functional-indexes/img2.png" | imgurl }}  "Query Results")

We can take a look at the explain plan for this query by executing this SQL command:

```sql
explain select count(*) from test_data where col1 + col2 = 10\G
```

***Note:*** We use `\G` at the end of the command to get more readable output in the command line interface.

The result of this command will look like the following:

![explain plan result]({{ "2023/functional-indexes/img3.png" | imgurl }}  "Explain Plan Results")

The red arrows indicate that there are no indexes that we can use in this query.
The yellow arrow indicates that the query did a full table scan.

The performance of this query is acceptable in the given data set, but if this table had substantially more data doing a full table scan would hurt performance.

## The Solution

You probably have already figured out that the solution to this problem is to create a functional index - and you would be correct!

The syntax for creating a functional index is similar to creating a standard index.
The command to create an index for our demonstration would be the following:

```sql
alter table test_data
    add index col_sum((col1 + col2));
```

Now that we have an index that can help our query let's look at the explain plan again:
![explain plan result 2]({{ "2023/functional-indexes/img4.png" | imgurl }}  "Explain Plan Result - 2")
Here, the red arrows show some indexes are used, and the yellow arrow indicates only 177 rows were scanned. Even in this small data set, that is quite an improvement.

### The Rules

Functional indexes can increase query performance without having to rewrite the query to address any bottlenecks. However, there are some rules that we need to follow.

* Expressions MUST be contained in parentheses to differentiate them from columns.
  * `INDEX((col1 + col2))` vs `INDEX( col1, col2)`
  * We can create an index that has functional and non-functional definitions.
    * `INDEX((col1 + col2), col1)`
* Functional index definitions cannot contain only column names.
  * `INDEX ((col1), (col2))` will throw an error.
* Functional index definitions are not allowed in foreign key columns.
* The index will only be used when a query uses the same expression.
  * `select count(*) from test_data where col1 - col2 = 0` will NOT use the index we created.
    * We would need to create a new index using the expression `(col1-col2)`.
### The Implications
Before we go out and create functional indexes to accommodate all our queries that use expressions in the `WHERE` clause, there are some things to keep in mind.
When a functional index is added, a hidden virtual column is created. As a result, the following implications exist:
* The generated column counts against the limit on the number of tables allowed.
* Only functions allowed for generated columns may be used in an expression for a functional index.
* The following are not allowed in functional indexes:
  * Subqueries
  * Parameters
  * Variables
  * Stored functions
  * Loadable functions

## The Wrap-Up

As we have shown, functional indexes can help performance in queries that use expressions in the `WHERE` clause.
However, we need to consider the ramifications of these indexes on our underlying database structure.

Photo by [Pixabay](https://www.pexels.com/photo/multi-colored-folders-piled-up-159519/)
