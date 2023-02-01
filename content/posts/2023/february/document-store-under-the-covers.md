---
title: MySQL Document Store - Peeking Under the Covers
date: 2023-02-02T06:00:00
image: /assets/images/2023/document-store-under-covers/header.jpg
tags: [ "MySQL", "MySQL-Document-Store" ]

---
[MySQL Document Store](https://www.mysql.com/products/enterprise/document_store.html) is a 'NoSQL' solution built on top of [MySQL](https://www.mysql.com/). Last month, I gave a talk at [THAT Conference](https://that.us/events/tx/2023/) about using [MySQL Document Store with Node.js](https://that.us/activities/M866zZfqVqnKiErwIUOh). During that talk, one of the attendees asked if it was possible to see the underlying queries executed when we use the CRUD API in Document Store.
I did some poking around, and there is a way to see this information. Read on to find out how.

**Note:** - You will need to have [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) installed to follow along.

## The Setup
Before we get started, there are a few things we need to take care of.
First, we need to connect to an instance of MySQL.
To do this, we start up MySQL Shell using the following command.

```shell
mysqlsh
```
After we start MySQL Shell, we should see something like this:
![MySQL Shell Startup](/assets/images/2023/document-store-under-covers/img1.png "MySQL Shell Start Up")

Next, we need to connect to an instance of MySQL using a command similar to:
```shell
\c mysqlx://{user}:{password}@{hostname}
```
Where `{user}` is a MySQL user, `{password}` is the password for the user, and `{hostname}` is the IP address or domain name for the server.
If you connect to a remote server, you may need to open port 33060 on your firewall.
Port 33060 is the port for the [X Protocol](https://dev.mysql.com/doc/dev/mysql-server/latest/page_mysqlx_protocol.html) that we use to talk to MySQL when using MySQL Document Store.

Once we are connected to MySQL, you should see something that looks like the image below:
![MySQL Shell Connected](/assets/images/2023/document-store-under-covers/img2.png "MySQL Shell Start Connected")

In this case, I am connecting to an instance of MySQL that is running on my local machine, and I am using a user named `scott` that can connect without a password.

Next, we need to make sure we have logging turned on. Run the following command in MySQL Shell:
```shell
session.runSql("show variables like '%general_log%'")
```
We should see something that looks like this image:
![General Log Query](/assets/images/2023/document-store-under-covers/img3.png "General Log Query")

The method `session.runSql()` allows us to run SQL commands against the database.
If you see that the value for `general_log` is set to `OFF`, we need to turn it on using this command:
```shell
session.runSql("SET GLOBAL general_log = 'ON';")
```
Once we have run this command, we check to make sure the general log was turned on:
```shell
session.runSql("show variables like '%general_log%'")
```
And now, the results should look like the following:
![General Log Query](/assets/images/2023/document-store-under-covers/img4.png "General Log Query")

With logging turned on, open up, or 'tail', the log file is denoted by the value of the `general_log_file` variable.

## The Code
Before using the CRUD API for MySQL Document Store, we need to set up a schema and a collection.

### The Schema
To create a schema with MySQL Document Store, we use this command:
```shell
session.createSchema('log_test')
```
This command will create a new schema named `log_test`.
Once we have run this command, we can look at the log file and see that the following query was logged:
```sql
create schema `log_test` charset='utf8mb4'
```

With the new schema created, we need to tell MySQL Shell to use this schema. This can be done by using the following command:
```shell
\u log_test
```
We should see the following output in the console:
![MySQL Shell use result](/assets/images/2023/document-store-under-covers/img5.png "MySQL Shell Use Result")
Note the message that the schema named `log_test` is available in a variable named `db`.

We will also see the following entries in our log file.
```sql
SHOW WARNINGS
use `log_test`
show databases like 'log\\_test'
SHOW TABLES FROM `log_test`
SELECT @@sql_mode
SELECT T.table_name AS name, IF(ANY_VALUE(T.table_type) LIKE '%VIEW', IF(COUNT(*)=1 AND COUNT(CASE WHEN (column_name = 'doc' AND data_type = 'json') THEN 1 ELSE NULL END)=1, 'COLLECTION_VIEW', 'VIEW'), IF(COUNT(CASE WHEN (column_name != '_json_schema') THEN 1 ELSE NULL END)-2 = COUNT(CASE WHEN (column_name != '_id' AND column_name != 'doc' AND column_name != '_json_schema' AND generation_expression RLIKE 'json_extract\\(`doc`,(_[[:alnum:]]+)?\\\\''\\$((\\*{2})?(\\[([[:digit:]]+|\\*)\\]|\\.([[:alpha:]_\\$][[:alnum:]_\\$]*|\\*|\\".*\\"|`.*`)))*\\\\''\\)') THEN 1 ELSE NULL END) AND COUNT(CASE WHEN (column_name = 'doc' AND data_type = 'json') THEN 1 ELSE NULL END)=1 AND COUNT(CASE WHEN (column_name = '_id' AND generation_expression RLIKE '^json_unquote\\(json_extract\\(`doc`,(_[[:alnum:]]+)?\\\\''\\$\\._id\\\\''\\)\\)$') THEN 1 ELSE NULL END)=1, 'COLLECTION', 'TABLE')) AS type FROM information_schema.tables AS T LEFT JOIN information_schema.columns AS C ON (T.table_schema = C.table_schema AND T.table_name = C.table_name) WHERE T.table_schema = 'log_test' GROUP BY name ORDER BY name
```
The query `use log_test` may have been expected, but what are the other queries for?
MySQL Shell fetches the table names in a schema to help with command completion.

### The Collection
To create a collection in our new schema, we use the command:
```shell
db.createCollection('my_data')
```
If we look at the log file, we will see entries that look like the following:
```sql
SELECT @@lower_case_table_names
CREATE TABLE `log_test`.`my_data` (doc JSON,_id VARBINARY(32) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(doc, '$._id'))) STORED PRIMARY KEY, _json_schema JSON GENERATED ALWAYS AS ('{"type":"object"}'), CONSTRAINT `$val_strict_8EBF4E60E272309A2A6FF682EBFF0CA1AD07AA9F` CHECK (JSON_SCHEMA_VALID(_json_schema, doc)) NOT ENFORCED) CHARSET utf8mb4 ENGINE=InnoDB
```
The interesting part here is the `CREATE TABLE` command.

### Adding Documents
With our collection created, let's add a simple document.
```shell
db.my_data.add({"firstName": "Scott", "lastName": "Stroz"})
```
We will see the following added to our log file:
```sql
SELECT @@mysqlx_document_id_unique_prefix,@@auto_increment_offset,@@auto_increment_increment
INSERT INTO `log_test`.`my_data` (doc) VALUES (JSON_SET(JSON_OBJECT('firstName','Scott','lastName','Stroz'), '$._id', '000063d936710000000000000002'))
```
The first query generates the value for the `_id` column.
The second query inserts the document into our collection.
Notice how several JSON-specific functions are used.

Let's try adding multiple documents at the same time. To do that, we pass an array of documents to the `add()` method as below:
```shell
db.my_data.add([{"firstName": "Lenka", "lastName": "Kasparova"}, {"firstName": "Fred", "lastName": "Descamps"}])
```

Our log file will now show the following:

```sql
SELECT @@mysqlx_document_id_unique_prefix,@@auto_increment_offset,@@auto_increment_increment
INSERT INTO `log_test`.`my_data` (doc) VALUES (JSON_SET(JSON_OBJECT('firstName','Lenka','lastName','Kasparova'), '$._id', '000063d936710000000000000003')),(JSON_SET(JSON_OBJECT('firstName','Fred','lastName','Descamps'), '$._id', '000063d936710000000000000004'))
```

### Finding Documents
We now have some documents we can search for using the `find()` method.
If we want to return all the documents, we will use this command:
```shell
db.my_data.find()
```
Our results will look something like this:
![Results of find](/assets/images/2023/document-store-under-covers/img6.png "Results of find")

And our log file will have this new entry:
```sql
SELECT doc FROM `log_test`.`my_data`
```
When we add a condition to the `find()` method, we can filter our results.
```shell
db.my_data.find("lastName = 'Stroz'")
```
Our results will resemble this image:
![Results of find with condition](/assets/images/2023/document-store-under-covers/img7.png "Results of find with condition")
And our log file will have this new entry:
```sql
SELECT doc FROM `log_test`.`my_data` WHERE (JSON_EXTRACT(doc,'$.lastName') = 'Stroz')
```
You can see that adding a condition to the `find()` method added a `WHERE` clause to our query.

Let's use a few more features of `find()` to see what the resulting query looks like.
```shell
db.my_data.find("firstName in ('Lenka', 'Scott')").fields("lastName").sort("lastName")
```
With this command, we are telling MySQL that we want to return just the `lastName` property (instead of the complete document) for all documents where the `firstName` property equals 'Lenka' or 'Scott' and that we should sort the results by the `lastName` property.
Here is what the result will look like:
![Results of find with other conditions](/assets/images/2023/document-store-under-covers/img8.png "Results of find with other conditions")
This is what the new entry in the log file looks like:
```text
SELECT JSON_OBJECT('lastName', JSON_EXTRACT(doc,'$.lastName')) AS doc FROM `log_test`.`my_data` WHERE (JSON_UNQUOTE(JSON_EXTRACT(doc,'$.firstName')) IN ('Lenka','Scott')) ORDER BY JSON_EXTRACT(doc,'$.lastName')
```

### Updating Documents
Now we will look at what the underlying queries look like when we update data in our documents.
First, we will update all the documents by adding a new property and setting a value.
```shell
db.my_data.modify('firstName is not null').set("isHuman", true)
```
With this command, we are adding a new property named `isHuman` to each document where the `firstName` property is not null and setting the value of the new property to `true`.
The following is the query that MySQL executed against our database with this command:?
```SQL
UPDATE `log_test`.`my_data` SET doc=JSON_SET(JSON_SET(doc,'$.isHuman',TRUE),'$._id',JSON_EXTRACT(`doc`,'$._id')) WHERE (NOT (JSON_EXTRACT(doc,'$.firstName') IS NULL))
```
If we run `db.my_data.find()` we will see the these results:
![Results of find with new property](/assets/images/2023/document-store-under-covers/img9.png "Results of find with new property")

If we want to update a property for just one document, we can use the value of the `_id` property.
```shell
db.my_data.modify("_id = '000063d936710000000000000002'").set("playsGolf", true)
```
The raw query MySQL uses to make this update will look like the following:
```sql
UPDATE `log_test`.`my_data` SET doc=JSON_SET(JSON_SET(doc,'$.playsGolf',TRUE),'$._id',JSON_EXTRACT(`doc`,'$._id')) WHERE (JSON_UNQUOTE(JSON_EXTRACT(doc,'$._id')) = '000063d936710000000000000002')
```
And we can see this update by once again running `db.my_data.find()` and seeing results similar to those below:
![Results of find with another new property](/assets/images/2023/document-store-under-covers/img10.png "Results of find with another new property")

### Deleting Documents
The last example is what MySQL uses under the hood to delete documents in a Document Store.
Let's run the command below to delete documents where the `playsGolf` property is `true` to see the resulting query.
```shell
db.my_data.remove('playsGolf = true')
```
The query would look like the following:
```sql
DELETE FROM `log_test`.`my_data` WHERE (JSON_EXTRACT(doc,'$.playsGolf') = TRUE)
```

## The Wrap-Up
MySQL Document Store uses a native MySQL database table to store JSON documents in a collection.
The CRUD operations for this table are abstracted behind a basic API.
MySQL converts calls to this API into raw SQL statements.
As we have shown, we can view the log file by enabling logging to see what these raw queries look like.
We can run any of these queries against the database and see the same results as if we used the CRUD API.

To learn more about MySQL Document Store, check out the [documentation](https://dev.mysql.com/doc/refman/8.0/en/document-store.html).

Also, check out the documentation for the [JSON functions](https://dev.mysql.com/doc/refman/5.7/en/json-function-reference.html) in MySQL to better understand some of the queries we showed.

Photo by [Joakim Honkasalo](https://unsplash.com/@jhonkasalo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/GZa4QFmv0Zg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
