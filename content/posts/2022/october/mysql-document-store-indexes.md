---
title: Indexing Data in MySQL Document Store
date: 2022-10-07T06:00:00
image: /assets/images/2022/doc-store-indexes/header.jpg
tags: ["MySQL", "MySQL-Shell", "MySQL-Document-Store", "NoSQL"]
---
MySQL Document Store is a JSON document storage solution built on top of MySQL. One feature of MySQL Document Store that can help speed up searches is the ability to create indexes of data contained within our JSON documents. In this post, we will demonstrate creating an index and look at the changes made to our collection after we create the index.

## Getting Started

Before we get started, we need a set of JSON documents. As luck would have it, there is data available in this [GitHub repo](https://github.com/boyzoid/mysql-doc-store-data).
You can get the data into a MySQL Document Store table in one of two ways:

1. Use the file named `restaurants.json` to import the data using the instructions in this [blog post](/posts/2022/september/import-mongodb-to-mysql-document-store/).
2. Use the file named `restaurants.sql` to import the data directly into your MySQL server using a command similar to the following:
```shell
mysql -u {username} import_demo < {path to restaurants.sql}
```

In this command:
* `{username}` is a MySQL username
* `{path to restaurants.sql}` is the path on your system to the restaurants.sql file. We can specify an absolute or relative path.

**Note:** You will need to create a schema named `import_demo` to use option 2 above.

You must also have [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) installed.

## Connecting to the Database

Before creating an index on our collection, we need to connect to the database using MySQL Shell. When you have MySQL Shell started, you can connect to the MySQL Server using the following command:
```shell
\c \c mysqlx://{username}@{server address or domain name}:33060
```
If you specify the protocol as `mysqlx`, you can leave off the `33060`. However, I include it here to show that when using MySQL Document Store, we need to connect over the X-Protocol port.

Once connected to the server, we need to specify what schema to use. We can accomplish this using the following:
```shell
\u import_demo
```

## Table Structure

Before we create our new index, let's look at the table structure of the `restaurants` collection.

Run this command when in JavaScript mode of MySQL Shell:
```javascript
session.runSql('describe import_demo.restaurants')
```
We should now see the following:

```text
+---------------------------------------------------+---------------+------+-----+---------+-------------------+
| Field                                             | Type          | Null | Key | Default | Extra             |
+---------------------------------------------------+---------------+------+-----+---------+-------------------+
| doc                                               | json          | YES  |     | NULL    |                   |
| _id                                               | varbinary(32) | NO   | PRI | NULL    | STORED GENERATED  |
| _json_schema                                      | json          | YES  |     | NULL    | VIRTUAL GENERATED |
+---------------------------------------------------+---------------+------+-----+---------+-------------------+
```

The table that stores our collection data consists of three columns.

* `doc` - where the JSON documents are stored
* `_id` - the generated ID of the document
* `_json_schema` - a JSON schema that can validate JSON documents when they are inserted or updated

Let's take a look at what indexes exist by executing this command:
```javascript
session.runSql('show indexes from import_demo.restaurants')
```

This command will show the response below.
```text
+-------------+------------+----------------+--------------+---------------------------------------------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| Table       | Non_unique | Key_name       | Seq_in_index | Column_name                                       | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Visible | Expression |
+-------------+------------+----------------+--------------+---------------------------------------------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| restaurants |          0 | PRIMARY        |            1 | _id                                               | A         |        2450 |     NULL | NULL   |      | BTREE      |         |               | YES     | NULL       |
+-------------+------------+----------------+--------------+---------------------------------------------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
```

There is a single index, which specifies the primary key is the `_id` column.

## Creating the index

If we expect a lot of queries to our document store will be searching the `name` property of our JSON documents, we would add an index using the following:
```javascript
db.restaurants .createIndex( 'restaurantName', { fields:[ { field: '$.nmame', type: "TEXT(100)" } ] } )
```

There are 2 arguments passed to `createIndex()`.
The first is a text value that is the name of the index.
The second is a JSON object that contains an array of fields to use in the index.
In our example, we are using:
* `field`, which is the path in our JSON object that contains the data we want to index. `$` is the document's root, so `$.name` specifies we want to index the property named `name` that is in the document's root.
* `type` specifies the data type for indexed values.

Here is a list of data types supported for indexing values in a JSON document:

* INT
* TINYINT
* SMALLINT
* MEDIUMINT
* INTEGER
* BIGINT
* REAL
* FLOAT
* DOUBLE
* DECIMAL
* NUMERIC
* DATE
* TIME
* TIMESTAMP
* DATETIME
* TEXT(length)
* GEOJSON

These values are case-insensitive when used as part of the `type` property. Also, numeric data types (INT, TINYINT, etc.) can bed followed by `UNSIGNED`.

After we created the index, you should see a response similar to what is below:
```text
Query OK, 0 rows affected (0.1098 sec)
```

## Revisiting the Table Structure

Now that we have created our index let's look at how our table structure was altered.

We need to run this command to see the new table structure again.
```javascript
session.runSql('describe import_demo.restaurants')
```

The results should look something like this:
```text
+---------------------------------------------------+---------------+------+-----+---------+-------------------+
| Field                                             | Type          | Null | Key | Default | Extra             |
+---------------------------------------------------+---------------+------+-----+---------+-------------------+
| doc                                               | json          | YES  |     | NULL    |                   |
| _id                                               | varbinary(32) | NO   | PRI | NULL    | STORED GENERATED  |
| _json_schema                                      | json          | YES  |     | NULL    | VIRTUAL GENERATED |
| $ix_t100_B3AC7318DE27048F8C6BC1E11300F08DCEE60FA7 | text          | YES  | MUL | NULL    | VIRTUAL GENERATED |
+---------------------------------------------------+---------------+------+-----+---------+-------------------+
```

We now have a new virtual column with a name that starts with `$ix_` of type `TEXT`.
The data type of our new column is determined by the value specified in the `type` property when we created the index.

If we take a look at the indexes that exist after creating our index by running:

```javascript
session.runSql('show indexes from import_demo.restaurants')
```

We will now see an additional index added.
```text
+-------------+------------+----------------+--------------+---------------------------------------------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| Table       | Non_unique | Key_name       | Seq_in_index | Column_name                                       | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Visible | Expression |
+-------------+------------+----------------+--------------+---------------------------------------------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| restaurants |          0 | PRIMARY        |            1 | _id                                               | A         |        2450 |     NULL | NULL   |      | BTREE      |         |               | YES     | NULL       |
| restaurants |          1 | restaurantName |            1 | $ix_t100_B3AC7318DE27048F8C6BC1E11300F08DCEE60FA7 | A         |           1 |      100 | NULL   | YES  | BTREE      |         |               | YES     | NULL       |
+-------------+------------+----------------+--------------+---------------------------------------------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
```

As we can see, the new index is named `restaurantName`, which we provided when we created the index. The column name is the new column created in the table that holds our documents.

To see what data is populated in this new column, run this query:
```sql
select
    doc -» '$._ld ' as id, 
    doc -» '$.name' as name,
    $lx_tl00_2BAA686C5604372BA51E965E6346198F5072C3D7 as _tdxl 
from restaurants 
limit 15;
```
**Note** - The new column for your indexed data may be different from what is shown above

In this query, we use the JSON path operator to extract the `_id` and `name` properties of our JSON document and the value in the column used for our index.
The results will look like the following:

![Demo query results](/assets/images/2022/doc-store-indexes/img3.png "Demo query results")

As you can see, when we created our index, it extracted the value of the `name` property and stored it in this new column.
The value in this column is populated when a new document is added to our collection. This value is also updated when a document is updated.

### The Benefits

The results below are, in no way, an official benchmark. Still, on the relatively small data set in the `restaurants` collection running on my development machine, there was a boost in performance.
Before creating the index, I ran the following command:
```javascript
db.restaurants.find("name like 'B%'")
```
This query returned 1134 documents in 0.1098 seconds.

After adding the index, the same query returned 1134 documents in 0.0058 seconds. 

Your mileage may vary.

## Deleting an Index
If you ever need to delete an index you created in a collection, you can use the `dropIndex()` method. This command will drop the index we created.
```javascript
db.restaurants.dropIndex('restaurantName')
```

When we use `dropIndex()`, the index is deleted, and the column tied to the index is also dropped.

## Wrap Up

MySQL Document Store allows you to store JSON documents using a solution based on  MySQL. Because of this, we have some of the same performance-enhancing functionality, such as indexes, at our disposal.
Adding an index to a collection in a MySQL Document Store offers many of the same benefits as adding an index to a column in other relational database tables.
You may need to experiment with the index definition to ensure the best performance.

Photo by [Maksym Kaharlytskyi](https://unsplash.com/@qwitka?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/index?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
