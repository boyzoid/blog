---
title: Indexing JSON Data in MySQL
date: 2023-01-10T06:00:00
image: /assets/images/2023/index-json/header.jpg
tags: [ "MySQL", "JSON", "Indexes" ]
---
Storing JSON in a relational database is something developers have done for quite some time. There are a variety of reasons why you would want to store JSON in a database table - user preferences and configuration data are two good examples.   The [JSON Data Type](https://dev.mysql.com/doc/refman/8.0/en/json.html) was introduced to MySQL in version 5.7.8. This data type allows us to store valid JSON in a database column and run queries based on the values in the JSON.

## The Potential Issue

When storing JSON data in MySQL, we can query the database based on values within that JSON. We can accomplish this using a variety of [JSON specific MySQL functions](https://dev.mysql.com/doc/refman/5.7/en/json-function-reference.html).
The potential issue is that query performance can degrade over time as the number of rows increases.
When this happens with other data types, one solution to help query performance is to add an index to one or more columns.
Since MySQL 8.0.13, we have had the ability to create [functional indexes](https://dev.mysql.com/doc/refman/8.0/en/create-index.html#create-index-functional-key-parts).
Functional indexes allow us to create indexes based on expressions, not column data.
We can leverage this feature to create an index based on JSON values.

## Getting Started

Before creating an index, let's create a simple table with a column containing JSON data.

```sql
CREATE TABLE `vehicle` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `vehicle_data` JSON NOT NULL,
  PRIMARY KEY (`id`));
```

Once we have the table created, let's add some data.

```sql
INSERT INTO vehicle(vehicle_data) values('{"first_name":"Austine","last_name":"Okill","gender":"Polygender","manufacturer":"GMC","model":"Sierra Hybrid","year":2006,"vin":"5TDBK3EH7BS492643","color":"Maroon"}');
INSERT INTO vehicle(vehicle_data) values('{"first_name":"Carrissa","last_name":"McGowing","gender":"Female","manufacturer":"Dodge","model":"Avenger","year":2000,"vin":"WBAPM7C53AE594359","color":"Maroon"}');
INSERT INTO vehicle(vehicle_data) values('{"first_name":"Mirabella","last_name":"O''Tuohy","gender":"Female","manufacturer":"Mercury","model":"Mountaineer","year":1997,"vin":"YV4902DZ7E2611356","color":"Red"}');
INSERT INTO vehicle(vehicle_data) values('{"first_name":"Marni","last_name":"Fratczak","gender":"Female","manufacturer":"Ford","model":"F150","year":2005,"vin":"WAUVT68EX5A254703","color":"Indigo"}');
INSERT INTO vehicle(vehicle_data) values('{"first_name":"Marcelo","last_name":"Cellone","gender":"Male","manufacturer":"Dodge","model":"Dakota","year":2004,"vin":"WBAPH5C55BF851378","color":"Turquoise"}');
INSERT INTO vehicle(vehicle_data) values('{"first_name":"Wilden","last_name":"Norwell","gender":"Bigender","manufacturer":"Mercury","model":"Sable","year":1996,"vin":"WAUHFAFL1EA004615","color":"Turquoise"}');
INSERT INTO vehicle(vehicle_data) values('{"first_name":"York","last_name":"Hemerijk","gender":"Male","manufacturer":"Dodge","model":"Dakota","year":2002,"vin":"JTDZN3EU7FJ032100","color":"Teal"}');
INSERT INTO vehicle(vehicle_data) values('{"first_name":"Paquito","last_name":"Chappelow","gender":"Male","manufacturer":"Ford","model":"Falcon","year":1967,"vin":"WA1EY94L67D885695","color":"Crimson"}');
INSERT INTO vehicle(vehicle_data) values('{"first_name":"Klarrisa","last_name":"Ryott","gender":"Female","manufacturer":"Mitsubishi","model":"Tredia","year":1988,"vin":"1GD12YEG1FF019807","color":"Teal"}');
INSERT INTO vehicle(vehicle_data) values('{"first_name":"Maurice","last_name":"Minot","gender":"Male","manufacturer":"Acura","model":"Vigor","year":1992,"vin":"3C63DRLL0CG858281","color":"Indigo"}');
```

Here is a more readable example of the JSON we are storing.

````json
{
  "first_name":"Austine",
  "last_name":"Okill",
  "gender":"Polygender",
  "manufacturer":"GMC",
  "model":"Sierra Hybrid",
  "year":2006,
  "vin":"5TDBK3EH7BS492643",
  "color":"Maroon"
}
````

## Running a Query

Here is a query we can use to filter our data based on the vehicle manufacturer.

```sql
select * from vehicle where vehicle_data->>"$.manufacturer" = 'Ford';
```

***Note:*** The `->>` is shorthand for `JSON_EXTRACT()` within `JSON_UNQUOTE()`

While there are no performance issues with this query for our small dataset, there could be when more data is inserted into our table.

Let's see what the explain plan for this query looks like by running the following:

```sql
explain select * from vehicle where vehicle_data->>"$.manufacturer" = 'Ford'\G
```
***Note:*** We use `\G` at the end of the command to get more readable output in the command line interface.

Here are the results:

```text
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: vehicle
   partitions: NULL
         type: ALL
possible_keys: NULL
          key: NULL
      key_len: NULL
          ref: NULL
         rows: 10
     filtered: 100
        Extra: Using where
1 row in set, 1 warning (0.0008 sec)
```
The portions of the results we are interested in are the values of `possible_keys` and `key`.
As we can see, these values are `NULL`, meaning no indexes exist that can be used for this query.

## Adding the Index

To address the potential performance issues with this query, we can create an index based on the values of our JSON. Here is what this SQL command would look like:

```sql
ALTER TABLE vehicle
    ADD INDEX manufacturer((
        CAST(vehicle_data->>"$.manufacturer" as CHAR(255))
    COLLATE utf8mb4_bin
    ));
```

After we have run this command, we can look at the index definition by using this command:

```sql
show indexes from vehicle\G
```

The results of this command should list two indexes - the index for our primary key and the index we just created.

```text
*************************** 1. row ***************************
        Table: vehicle
   Non_unique: 0
     Key_name: PRIMARY
 Seq_in_index: 1
  Column_name: id
    Collation: A
  Cardinality: 9
     Sub_part: NULL
       Packed: NULL
         Null:
   Index_type: BTREE
      Comment:
Index_comment:
      Visible: YES
   Expression: NULL
*************************** 2. row ***************************
        Table: vehicle
   Non_unique: 1
     Key_name: manufacturer
 Seq_in_index: 1
  Column_name: NULL
    Collation: A
  Cardinality: 6
     Sub_part: NULL
       Packed: NULL
         Null: YES
   Index_type: BTREE
      Comment:
Index_comment:
      Visible: YES
   Expression: (cast(json_unquote(json_extract(`vehicle_data`,_utf8mb4\'$.manufacturer\')) as char(255) charset utf8mb4) collate utf8mb4_bin)
```

When we look at the `expression` property of our new index, we can see that the text `vehicle_data->>"$.manufacturer"` has been replaced with `json_unquote(json_extract(vehicle_data,_utf8mb4\'$.manufacturer\'))`.

You may wonder why we used `CAST()` and `COLLATE` to create this index.

First, the function `JSON_UNQUOTE()` returns a data type of `LONGTEXT`.
The data type `LONGTEXT` cannot be used in an index, so we need to `CAST()` the results to a data type that can be indexed.
In this example, `CHAR(255)`.

Next, we use `COLLATE` because the functions used to extract data (used in the `WHERE` statement in our query) are collated to `utf8mb4_bin`.
However, when we cast a string without using `COLLATE,` it is cast to `utf8mb4_0900_ai_ci`.
When the collation of what is stored in the index does not match the collation of the string in our `WHERE` clause, the index will not get used.

## Checking Our Work

After we create the index, let's check on our explain plan by rerunning this command:

```sql
explain select * from vehicle where vehicle_data->>"$.manufacturer" = 'Ford'\G
```

The result should look similar to this:
```text
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: vehicle
   partitions: NULL
         type: ref
possible_keys: manufacturer
          key: manufacturer
      key_len: 1023
          ref: const
         rows: 2
     filtered: 100
        Extra: NULL
1 row in set, 1 warning (0.0085 sec)
```
We can see that `possible_key` and `key` now have a value indicating that our new index is being used to execute this query.

## Wrap up

Storing JSON data in a relational database is something developers have been doing long before a `JSON` data type existed.
The JSON data type allows us to store valid JSON data and run queries based on the values in the JSON object.
By using functional indexes, we can help the performance of those queries in the same way an index on other data types helps boost performance.

Photo by [Maksym Kaharlytskyi](https://unsplash.com/@qwitka?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/Q9y3LRuuxmg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
