---
title: Viewing MySQL Document Store Queries in MySQL Database Services
date: 2023-03-30T06:00:00
image: /assets/images/2023/doc-store-under-covers-mds/header.jpeg
tags: [ "MySQL", "MySQL-Document-Store", "Oracle-Cloud" ]

---

In a [previous post](/posts/2023/february/document-store-under-the-covers/), we talked about how you can view the underlying queries that are run when we make calls to the [MySQL Document Store](https://www.mysql.com/products/enterprise/document_store.html) API. While this solution works well on a local or other on-premise instance of MySQL, it is not a viable option for viewing those same queries on a [MySQL Database Service](https://docs.oracle.com/en-us/iaas/mysql-database/doc/overview-mysql-database-service.html) (MDS) instance running in [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) (OCI). We are going to talk about how to view those queries in MDS.

## The Problem

The [previous solution](/posts/2023/february/document-store-under-the-covers/) does not work in MDS because it requires access to the general log file, which is not available in MDS.
Fear not. We can still see those queries using the [`performance_schema`](https://dev.mysql.com/doc/refman/8.0/en/performance-schema.html). There are a few more steps involved, but they are simple.

***Note:** To follow along, you will need command line access to an MDS instance running in OCI.
If you need to set up an MDS instance and access that instance, take a look at [this post](/posts/2023/february/myql-database-service-over-internet/) that walks you through both of those steps.*

## The Setup

First, connect to our MDS instance using [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) and specify the schema you want to use. For this demo, we are using a schema named `doc-store`.

Using the following syntax, we can connect to a MySQL instance and schema when starting MySQL Shell.

```shell
mysqlsh {MySQL user}@{IP address of server}/{schema name}
```
This command will start MySQL Shell in JavaScript mode. It is essential to stay in this mode. Otherwise, the results may be different from what we expect.

### Checking `performance_schema`

Before we can start looking at the queries run with the Document Store API, we need to ensure the instance is configured in the way we need.

By default, MDS instances have the `performance_schema` enabled. Let's run the following command in MySQL Shell to verify the `events_statements_history` is enabled.

```shell
\sql SELECT enabled FROM performance_schema.setup_consumers WHERE NAME = 'events_statements_history';
```
***Note:** While we are in Python mode or JavaScript mode, we can use `\sql` to execute a SQL command without switching to SQL mode.*

The results should resemble the following:

![Query Results](/assets/images/2023/doc-store-under-covers-mds/img01.png "Query Results")

### Checking Instruments

Next, we need to ensure that all instruments report data to the consumer by running this command.

```shell
\sql SELECT NAME, ENABLED, TIMED FROM performance_schema.setup_instruments WHERE NAME LIKE 'statement/%' AND NOT (ENABLED and TIMED)
```
This command should return an empty set. If it does not, we need to enable instruments. Please see the [Performance Schema Runtime Configuration page](https://dev.mysql.com/doc/refman/8.0/en/performance-schema-runtime-configuration.html) for more details.

### Get Thread ID

The last step in our setup process is to set the thread ID to a MySQL variable to be used in a little while. Run the following command.

```shell
\sql SELECT thread_id INTO @id FROM performance_schema.threads WHERE processlist_id=connection_id()
```

We can see that we are setting the value of `thread_id` to a variable named `@id`.

## The Results

Now that we have everything set, let's start by making a call to the Document Store API.

### Get Some Documents

In this example, we call `find()` to return the `name` and `borough` properties from the top 3 results of the restaurant collection where the `cuisine` property is `Bakery` sorted by the `name` property.

```shell
db.restaurant.find("cuisine = 'Bakery'").fields(['name', 'borough']).sort('name').limit(3)
```

The results look like this:

![API Call Results](/assets/images/2023/doc-store-under-covers-mds/img02.png "API Call Results")

### Get the Raw SQL

Now that we have made a call to the Document Store API, we can run this command to see what query was actually executed against the database.

```shell
\sql SELECT THREAD_ID,SQL_TEXT FROM performance_schema.events_statements_history WHERE THREAD_ID=@id ORDER BY TIMER_START DESC LIMIT 1\G
```

***Note:** We use `\G` at the end of the SQL statement so the result is output to the console in a format that is easier to read.*

This statement will return the result of the last query that was executed. In our case, that result will look like the following:

![Raw SQL Check Results](/assets/images/2023/doc-store-under-covers-mds/img03.png "Raw SQL Check Results")

Keep in mind that I formatted the results a bit to make them easier to read.
The yellow highlighted portion is the actual query that was executed.
As we can see, the query includes quite a few built-in [JSON functions](https://dev.mysql.com/doc/refman/8.0/en/json-functions.html).

### Run the Raw SQL

Now that we have the raw SQL let's look at the results returned when we run it.
Run the command:

```shell
\sql SELECT JSON_OBJECT('name', JSON_EXTRACT(doc,'$.name'),'borough', JSON_EXTRACT(doc,'$.borough')) AS doc FROM `doc-store`.`restaurant` WHERE (JSON_EXTRACT(doc,'$.cuisine') = 'Bakery') ORDER BY JSON_EXTRACT(doc,'$.name') LIMIT 0, 3;
```
And we will see the following results.

![Raw SQL Results](/assets/images/2023/doc-store-under-covers-mds/img04.png "Raw SQL Results")

The X-plugin would take these results and send them back as raw JSON.

Try other calls to the Document Store API and see what SQL is executed.

## The Wrap-Up

Seeing what queries are being executed when we make calls to the MySQL Document Store API can help us manage our Document Store.
We can get an explain plan from the raw SQL to see if we need to [create indexes on properties in our documents](/posts/2022/october/mysql-document-store-indexes/).
We can use the `preformance_schema` and the above examples to retrieve the raw SQL when running MySQL Database Service instances in Oracle Cloud Infrastructure.

Photo by <a href="https://unsplash.com/@anikeevxo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Vladimir Anikeev</a> on <a href="https://unsplash.com/images/nature/cloud?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
