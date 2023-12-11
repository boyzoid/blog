---
title: Parameterizing MySQL Queries in Node
date: 2023-12-12T06:00:00
image: /assets/images/2023/parameterizing-mysql-node/header.jpg
tags: [ "MySQL", "Node.js", "Best-Practices" ]
---

There are very few absolutes in software development. One of these would be "***NEVER** trust user input*". You should never run a database query involving user input without validating, sanitizing, and parameterizing the user-provided values. If you neglect to handle user input correctly, specifically parameterizing the data, your application will be vulnerable to attack from nefarious people. In this post, we will discuss how to parameterize user input in a [Node.js](https://nodejs.org/en) application and how to use the [SQL Template Tag](https://github.com/blakeembrey/sql-template-tag) module to make the process easier.

## The Problem

When user data is not parameterized before being used in a database query, your database is vulnerable to attack from [SQL injection](https://owasp.org/www-community/attacks/SQL_Injection). Using SQL injection, a hacker can gain access to your database server and cause irreparable harm. In a nutshell, SQL injection can occur when characters are passed as part of the user input that trick the database into running other commands.

When we parameterize a database query, we use placeholders in a query instead of constant values. We then pass the values that will be used with these placeholders. By using parameters, we are telling MySQL the values should be treated as specific data types and not part of a command that should be executed. Parameterized queries can mitigate the risk of SQL injection.



## Getting the Code

This post will show how you can use parameterized queries in a Node application using the [`mysql2` Node module](https://www.npmjs.com/package/mysql2). We will also show how to use the SQL Template Tag module to make managing parameters easier.

You can clone the code from this [GitHub Repo](https://github.com/boyzoid/sql-template-tag-demo) to follow along.

The command to clone the repo from the command line over SSH is:

```shell
git clone git@github.com:boyzoid/sql-template-tag-demo.git
```

Next, Change the directory for this demo.

```shell
cd sql-template-tag-demo
```

With the repo cloned, we need to install all the Node dependencies by running the following:

```shell
npm install
```

Run the SQL queries in `/data/users.sql` on a MySQL instance.

Copy the `.env.template` file to `.env` and then update the values to match the connection information to the MYSQL instance you used above. The environment variables we use are:

* `PORT` - The port on which the Node application will run.
* `DB_HOST` - The IP or domain address of the MySQL server.
* `DB_PORT` - The port used to connect to the MySQL server.
* `DB_USER` - The MySQL user account under which we will run the queries.
* `DB_PASSWORD` - The password for the MySQL user account above.
* `DB_SCHEMA` - The database schema we will use in the examples below.

Lastly, we can start our application by running the command:

```shell
node src
```

We can test that the application is working as expected by making a `GET` HTTP request to `http://localhost:{PORT}` where `{PORT}` is the value of the `PORT` environment variable. You should see the following response:

```json
{
   "message": "Main endpoint"
}
```

## Code Overview

This repo has four code examples of how to handle user input. The application uses Express to define several API endpoints executing our code.

Let's do a high-altitude overview of the code in `/src/index.js`.

### Import Modules

```javascript
import express from 'express'
import sql from 'sql-template-tag'
import mysql from 'mysql2'
import * as dotenv from 'dotenv'
```

The code above will import the necessary modules into our application.

### Read Environment Variables

```javascript
//Init environment variables
dotenv.config()
```

This line of code will read the environment variables that define the database connection information and the port on which the Express application will be available.

### Create MySQL Connection

```javascript
//Create a connection to MySQL
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_SCHEMA,
    namedPlaceholders: true
});
```

In this code block, we are creating a connection to the MySQL server using the environment variables specified above.

### Set up Express

```javascript
// Define Express app
const app = express()
app.use(express.json())
```

This code will initialize the Express app.

### Start Express

```javascript
app.listen(process.env.PORT, () => {
    console.log('listening on port ' + process.env.PORT)
});
```

This event handler starts the application and tells Express on which port to listen for requests.

### Define the Routes

```javascript
//Routes

// Default route
app.get('/', (req, res) => {
    let msg = {message: 'Main endpoint'}
    res.send(msg)
});

app.get('/unsafe/:id', (req, res) => {
    // THIS IS VERY BAD - DON'T EVER WRITE A QUERY LIKE THIS
    const query = 'SELECT * FROM user WHERE id = ' + req.params.id
    connection.query(query, (err, results) => {
        res.send({
            _sql: query,
            results: results
        })
    })
})

app.get('/safe/:id', (req, res) => {
    // THIS IS THE WAY - the query is parameterized
    const query = 'SELECT * FROM user WHERE id = ?'
    const values = [req.params.id]
    connection.query(query, values, (err, results) => {
        res.send({
            _sql: query,
            _values: values,
            results: results
        })
    })
})

app.get('/named/:id', (req, res) => {
    // THIS IS THE WAY - the query is parameterized
    const query = 'SELECT * FROM user WHERE id = :id'
    const values = {id:req.params.id}
    connection.query(query, values, (err, results) => {
        res.send({
            _sql: query,
            _values: values,
            results: results
        })
    })
})

app.get('/easier/:id', (req, res) => {
    // This is easier. By using sql-template-tag and template literals
    // the query and params are generated in one statement.
    const query = sql`SELECT * FROM user WHERE id = ${req.params.id}`
    connection.query(query, (err, results) => {
        res.send({
            _sql: query.sql,
            _values: query.values,
            results: results,
        })
    })
})
```

The code defines five routes for our Express app. The first is mapped to `/` and returns a simple message. This route tests that the Express app is working as expected. I will go over the other four routes in depth below.

## Code Deep Dive

Let's look at the code we will use for our examples.

### The Bad

The first route we will look at is the `unsafe` route.

```javascript
app.get('/unsafe/:id', (req, res) => {
    // THIS IS VERY BAD - DON'T EVER WRITE A QUERY LIKE THIS
    const query = 'SELECT * FROM user WHERE id = ' + req.params.id
    connection.query(query, (err, results) => {
        res.send({
            _sql: query,
            results: results
        })
    })
})
```

The route definition is for a `GET` request to `/unsafe` where a parameter named `id` is required. So our request URL would look like `http://localhost:3000/unsafe/63`.

With this code, we create a variable named `query` that contains the query we wish to run and appends the `id` parameter to the end of the query. Because we append the user input to the end of the query, it is **NOT** parameterized and is susceptible to SQL injection.

Next, we call the `query()` method on the `connection` object and pass the query. In the callback of `connection.query()`, we set values in the `res` (response) object. These values will be returned as part of the response.

When we make a request to `http://localhost:3000/unsafe/63`, we will see the following response.

```json
{
   "_sql": "SELECT * FROM user WHERE id = 63",
   "results": [
      {
         "id": 63,
         "first_name": "Ringo",
         "last_name": "Paolotto",
         "email": "rpaolotto1q@arstechnica.com"
      }
   ]
}
```
We can see that the value of `_sql` is just a string with the `id` parameter added.

### The Good

To help mitigate attacks from SQL injection, we should rewrite the query above to use parameters. The following endpoint, named `safe,` shows how to parameterize this query.

```javascript
app.get('/safe/:id', (req, res) => {
    // THIS IS THE WAY - the query is parameterized
    const query = 'SELECT * FROM user WHERE id = ?'
    const values = [req.params.id]
    connection.query(query, values, (err, results) => {
        res.send({
            _sql: query,
            _values: values,
            results: results
        })
    })
})
```

The first difference is that instead of using `req.params.id` in the query string, we use a question mark, a placeholder that tells MySQL we will be using a parameter here.

Next, you will note that we create a variable named `values,` which is an array with a single element that contains the value of `req.params.id`. We then pass this variable to `connection.query()`, and the values defined will be used to determine the parameter values.

When we use parameters with this syntax, the length of the `values` array must be, at least, the same number of placeholders. The first placeholder will use the first parameter, and so on.

When we make a request to `http://localhost:3000/safe/63`, we will see the following response.

```json
{
   "_sql": "SELECT * FROM user WHERE id = ?",
   "_values": [
      "63"
   ],
   "results": [
      {
         "id": 63,
         "first_name": "Ringo",
         "last_name": "Paolotto",
         "email": "rpaolotto1q@arstechnica.com"
      }
   ]
}
```

### The Named

If we had a lot of placeholders, using the above syntax can lead to difficulty in determining which values are for which placeholder. Fortunately, the `mysql2` module supports named parameters. Named parameters are turned off by default. We turned them on when we created the `connection` object by passing `namedParamters: true` as part of the connection config.

When using named parameters, the code for the query would look like this:

```javascript
app.get('/named/:id', (req, res) => {
    // THIS IS THE WAY - the query is parameterized
    const query = 'SELECT * FROM user WHERE id = :id'
    const values = {id:req.params.id}
    connection.query(query, values, (err, results) => {
        res.send({
            _sql: query,
            _values: values,
            results: results
        })
    })
})
```

Here, we use the placeholder `:id` installed of `?` in the query and use an object with matching keys for the values instead of an array. I prefer to use named parameters for a few reasons:

1. It is easier to read.
2. Knowing which values are being used for which placeholders is easier.
3. You can reuse placeholders without needing to add another value.
4. You can add placeholders and values more easily.

When we make a request to `http://localhost:3000/named/63`, we will see the following response.

```json
{
   "_sql": "SELECT * FROM user WHERE id = :id",
   "_values": {
      "id": "63"
   },
   "results": [
      {
         "id": 63,
         "first_name": "Ringo",
         "last_name": "Paolotto",
         "email": "rpaolotto1q@arstechnica.com"
      }
   ]
}
```

### An Easier Way

For queries with very few parameters, either of the examples we just showed should be easy to manage. But, if you have a large query that uses a lot of different parameters, it can still be unwieldy to manage the placeholders and the values. With the help of SQl Template Tag, we can use template literals to define the placeholders and the values in a single statement. Let's look at the code for the `easier` endpoint.

```javascript
app.get('/easier/:id', (req, res) => {
    // This is easier. By using sql-template-tag and template literals
    // the query and params are generated in one statement.
    const query = sql`SELECT * FROM user WHERE id = ${req.params.id}`
    connection.query(query, (err, results) => {
        res.send({
            _sql: query.sql,
            _values: query.values,
            results: results,
        })
    })
})
```

You can see that we create a variable named `query` and use the syntax ``sql`SELECT * FROM user WHERE id = ${req.params.id}` `` which contains a template literal for the variable `req.params.id`. The SQL Template Tag module then takes that variable and creates placeholders and a value array to use in the parameterized query. We can see these in the `query.sql` and `query.values` properties that are part of the response.

When we make a request to `http://localhost:3000/easier/63`, we will see the following response.

```json
{
   "_sql": "SELECT * FROM user WHERE id = ?",
   "_values": [
      "63"
   ],
   "results": [
      {
         "id": 63,
         "first_name": "Ringo",
         "last_name": "Paolotto",
         "email": "rpaolotto1q@arstechnica.com"
      }
   ]
}
```

Note that the query string contains a single placeholder, and the values array contains the value we pass as the `id`.

## Wrap-up

When writing database queries that include user input, we must ensure we parameterize the input to help mitigate an SQL injection attack. When we parameterize a query in a Node application, we can use unnamed placeholders, where we use `?` as the placeholder and pass an array of values to be used. If there are multiple placeholders or the same value may be used numerous times, we use named placeholders and pass an object with keys that match the parameter names. The [SQL Template Tag](https://github.com/blakeembrey/sql-template-tag) module helps with this process by allowing us to create a parameterized query string and the value array in a single statement using template literals.

Photo by <a href="https://unsplash.com/@casparrubin?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Caspar Camille Rubin</a> on <a href="https://unsplash.com/photos/macbook-pro-with-images-of-computer-language-codes-fPkvU7RDmCo?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
