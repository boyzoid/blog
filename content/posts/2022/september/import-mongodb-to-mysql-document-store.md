---
title: Import a MongoDB Into MySQL Document Store with MySQL Shell
date: 2022-09-22T06:00:00
image: /assets/images/2022/mongo-to-doc-store.jpg
tags: ["MySQL", "MySQL-Shell", "MySQL-Document-Store", "MongoDB", "NoSQL"]
---
Photo by [Wesley Tingey](https://unsplash.com/@wesleyphotography?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/documents?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

[MySQL Document Store](https://www.mysql.com/products/enterprise/document_store.html) is a "NoSQL" database built on top of [MySQL](https://www.mysql.com/).
The [X Dev API](https://dev.mysql.com/doc/x-devapi-userguide/en/) provides basic CRUD operations that allow developers to manage JSON document collections.
In this post, we will talk about how we can import an existing MongoDB into MySQL Document Store using [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/).

## Before We Get Started

To follow along with the examples, you will need to have access to the following:

* A MongoDB database
* A MySQL Instance

You will also need to have the following installed:

* [Mongo Database Tools](https://www.mongodb.com/try/download/database-tools?tck=docs_databasetools)
* [MySQL Shell](https://dev.mysql.com/downloads/shell/)

## Exporting a MongoDB Database

The first step in this process is exporting the MongoDB data into a JSON file.
In this example, I am using MongoDB running locally with a schema named 'demo' and a collection named 'restaurants'.
This collection is populated with the standard '[restaurant](https://github.com/ozlerhakan/mongodb-json-files/blob/master/datasets/restaurant.json)' sample data.

To export this data, we run the following from a command prompt:

```shell
mongoexport --db demo --collection restaurants --out restaurants.json
```

We should see the following result:
![MongoDB Export Results](/assets/images/2022/mongo-import/img1.png "MongoDB Export Results")

The file `restaurants.json` will contain all the records from the `restaurants` collection.
Being the curious sort that I am, I looked at this file and was surprised to find that the file did NOT contain an array of JSON objects.
Instead, it was simply a list of JSON objects with each object separated by a line break.

```json
{"_id":{"$oid":"55f14312c7447c3da7051b26"},"URL":"http://www.just-eat.co.uk/restaurants-cn-chinese-cardiff/menu","address":"228 City Road","address line 2":"Cardiff","name":".CN Chinese","outcode":"CF24","postcode":"3JH","rating":5,"type_of_food":"Chinese"}
{"_id":{"$oid":"55f14312c7447c3da7051b27"},"URL":"http://www.just-eat.co.uk/restaurants-atthai-ss9/menu","address":"376 Rayleigh Road","address line 2":"Essex","name":"@ Thai","outcode":"SS9","postcode":"5PT","rating":5.5,"type_of_food":"Thai"}
{"_id":{"$oid":"55f14312c7447c3da7051b28"},"URL":"http://www.just-eat.co.uk/restaurants-atthairestaurant/menu","address":"30 Greyhound Road Hammersmith","address line 2":"London","name":"@ Thai Restaurant","outcode":"W6","postcode":"8NX","rating":4.5,"type_of_food":"Thai"}
{"_id":{"$oid":"55f14312c7447c3da7051b29"},"URL":"http://www.just-eat.co.uk/restaurants-atthairestaurant/menu","address":"30 Greyhound Road Hammersmith","address line 2":"London","name":"@ Thai Restaurant","outcode":"W6","postcode":"8NX","rating":4.5,"type_of_food":"Thai"}
{"_id":{"$oid":"55f14312c7447c3da7051b2a"},"URL":"http://www.just-eat.co.uk/restaurants-indiancom-ch4/menu","address":"9 Broughton Hall Road","address line 2":"Broughton","name":"@Indian.com","outcode":"CH4","postcode":"0QR","rating":6,"type_of_food":"Curry"}
{"_id":{"$oid":"55f14312c7447c3da7051b2b"},"URL":"http://www.just-eat.co.uk/restaurants-007takeaway-s65/menu","address":"6 Drummond Street","address line 2":"Rotherham","name":"007 Takeaway","outcode":"S65","postcode":"1HY","rating":6,"type_of_food":"Pizza"}
```  

## Connecting to MySQL Shell

For the rest of this post, we will be using MySQL Shell. So, let's fire it up by running this command:

```shell
mysqlsh
```

We should see something similar to this image:
![MySQL Shell Start up](/assets/images/2022/mongo-import/img2.png "MySQL Shell Start up")

Now, we need to connect to our MySQL Instance by running the following command:

```shell
\c mysqlx://{user}:{password}@{server addresss}
```

Where `{user}` is our MySQL username, `{password}` is the password for this user, and `{server address}` is the IP address or domain name of the server to which we are connecting.

When the connection is successful, we will see the following:
![MySQL Shell Connection](/assets/images/2022/mongo-import/img3.png "MySQL Shell Connection")

**Note:** In my example, I am using a user (not `root`) that does not need a password when connecting to `localhost`.

## Creating a Schema

Before we import our data, we must create the schema where the data will reside. We create a schema by using this command:
```javascript
session.createSchema('import_demo')
```
When a schema is created successfully, we will see it echoed below our command, as in the picture below.
![MySQL Shell Create Schema](/assets/images/2022/mongo-import/img4.png "MySQL Shell Create Schema")

## Importing The Data
Now that we have our schema defined, we can import our data. MySQL Shell comes with several utilities, one of which is `importJson()`.
This utility method is used to import JSON data in the format of the file we exported from MongoDB.
Here is the command we need to run:
```javascript
util.importJson('{absolute path to file}', {schema: '{schema name}', collection: '{collection name}', convertBsonOid: true})
```
Where `{absolute path to file}` is the absolute path to the file we wish to import, `{schema name}` is the name of the schema to which we will import the data, and `{collection name}` is the name of the new collection.
Notice that this collection need not exist already.
If it does not exist, the utility will create it.

**Note:** When using Windows, you need to use `/` as the path delimiter instead of `\`. If you do not, you will receive an error that the file cannot be found.

The last item we pass is in `convertBsonOid`. By default, MongoDB will export the document in the following format:
```json
{
  "_id":{"$oid":"55f14312c7447c3da7051b26"}
}
```
This data type is incompatible with MySQL Document Store as the `_id` field in MySQL Document Store is` varbinary(32)`.
When we set `convertBsonOid` to true, the import will translate the value of `$oid` to `varbinary(32)`.

When the import is successful, we will see output that resembles:
![MySQL Shell Import Success](/assets/images/2022/mongo-import/img5.png "MySQL Shell Import Success")
We can see that the import was successful and that we imported 2548 documents in 0.2612 seconds.

## Checking the Import
Now that we have our data imported, we can use the MySQL Document Store CRUD API.
Before we start doing more advanced queries, we should ensure the data was imported the data as we expected.

Let's start by telling MySQL Shell to use the new schema by running the following command:
```javascript
\u import_demo
```

### Set the Schema to Use
We should see a message similar to the following:
![MySQL Shell Use Schema](/assets/images/2022/mongo-import/img6.png "MySQL Shell Use Schema")

Here, we can see that once we have specified a schema, we can refer to the schema using `db`.

### Running a Query

Now that we have specified a schema, we can query the Document Store using syntax similar to the following:
```javascript
db.{collection name}.find()
```
Where `{collection name}` is the name of the collection we want to query.
When we use `find()` by itself, it will return EVERY document in the collection.
If we wanted to find the first two restaurants sorted by name, we would use the command below:
```javascript
db.restaurants.find().sort('name asc').limit(2)
```
As you can see, we are sorting by the `name` property of the document and telling the Document Store that we only want the first two results.

Running this command will render the following results:
```json
{
    "URL": "http://www.just-eat.co.uk/restaurants-cn-chinese-cardiff/menu",
    "_id": "55f14312c7447c3da7051b26",
    "name": ".CN Chinese",
    "rating": 5,
    "address": "228 City Road",
    "outcode": "CF24",
    "postcode": "3JH",
    "type_of_food": "Chinese",
    "address line 2": "Cardiff"
}
{
    "URL": "http://www.just-eat.co.uk/restaurants-007takeaway-s65/menu",
    "_id": "55f14312c7447c3da7051b2b",
    "name": "007 Takeaway",
    "rating": 6,
    "address": "6 Drummond Street",
    "outcode": "S65",
    "postcode": "1HY",
    "type_of_food": "Pizza",
    "address line 2": "Rotherham"
}
```
One of the things we can see here is that each document has an `_id` property. So, looking at the `_id` for the first result, you will notice it matches the `id.$oid` property from our source data.

## Under The Covers
Remember earlier when I said MySQL Document Store was "built on top of MySQL"? Would you like to know what that means?
Simply put, it means that the underlying structure of a Document Store schema and collection is a MySQL database and table.
This structure means we can use SQL to retrieve data from these tables and look at the underlying table structures.

Before we close down MySQL Shell, let's look at the table structure created when we create a new collection.
First, we need to switch MySQL Shell over to `SQL mode` by running this command:
```javascript
\sql
```
This command will switch MySQL Shell to `SQL Mode`  - where we can run SQL queries. As long as you have set the schema in `JS Mode`, it will be set in `SQL Mode`, as the image below shows.
![MySQL Shell SQL Mode](/assets/images/2022/mongo-import/img7.png "MySQL Shell SQL Mode")

Now that we are in SQL mode, we can run this command to see the table structure for the `restaurants` collection.
```sql
describe restaurants;
```
The results of this query are below:
![MySQL Shell Restaurants Structure](/assets/images/2022/mongo-import/img8.png "MySQL Shell Restaurants Structure")

You can see there are three columns:
* `doc` - which is of type `json` and contains the JSON documents we imported.
* `_id` - which is of type `varbinary(32)` and contains the values that the import utility converted from the `_id.$oid` property of our source data
* `_json_schema` - which is also of type `json`  and contains information used to validate the JSON schema stored in the `doc` column.

Upon looking at that last column you may be saying...'*Wait...what?*'
While one advantage of JSON document storage is the fact it can be schemaless, there may be times when you need to validate the schema.
For example, we may have a property that should be required or should only be an array. Then, we can use the `_json_schema` column to define that validation and enforce that schema.
I plan on covering how to set up schema validation for MySQL Document Store in a future post.

## Wrap Up
MySQL Document Store offers all the advantages of a "NoSQL" solution with the bonus of the benefits of a relational database.
By using the import functionality of MySQL Shell, we can quickly import data from an existing MongoDB database and start querying our data using the CRUD API or by using raw SQL commands.
In future posts, I plan on showing more detailed examples of how we can leverage the power of SQL with our "NoSQL" data. 
