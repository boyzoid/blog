---
title: Testing MySQL Applications With Node.js and Testcontainers
date: 2023-08-11T06:00:00
image: /assets/images/2023/testing-mysql-apps-node/header.jpg
tags: [ "MySQL", "Node.js", "TDD", "Better-Tests", "Testcontainers" ]

---
Over the years, I have become obsessed with writing code tests. One big pain point with writing tests is testing code that interacts with a database. In this post, we are going to talk about some of the difficulties that may be encountered when writing tests for database interaction and how we can use [Testcontainers](https://testcontainers.com/) to mitigate those issues.

## The Issues

On one project I worked, the development team (about 15 of us) shared a `dev` database...yeah, I know...ew.

There are quite a few issues with this setup when writing tests for code that will interact with a database.

* Running tests that insert data would cause those test inserts to be visible to every other developer.
  * This could lead developers to think there are issues with their code, as they may see unexpected results.
* A developer working on a new DDL script could 'break' the database for everyone else.
  * This happened more times than I care to remember.

The solution put into place before I joined the project was only marginally better - we ran all of our tests for database interactivity against an H2 database. While this addressed many issues we encountered, it caused other issues. For example, the version of H2 we were using did not support stored procedures or custom/stored functions. So, if we needed to write a new stored procedure or custom/stored function, we could only test that a particular error was thrown by the testing framework.

It would have made everyone's life easier if we ran our tests against the same database system the project used. For various reasons, standing up copies of the database in our development environment was not an option. So, we were left with the less-than-ideal architecture that had been cobbled together over a few iterations of the codebase.

## A Solution

If I had known about Testcontainers at the time, I would have lobbied to allow us time to implement a testing architecture that would make everyone's lives easier. So, what is Testcontainers? The 'official' description from the website states:

> Testcontainers is an open-source framework for providing throwaway, lightweight instances of databases, message brokers, web browsers, or just about anything that can run in a Docker container.

More simply, Testcontainers allows developers to spin up Docker images for testing purposes. The framework can be used for a variety of scenarios. Still, we will focus on using Testcontainers for testing interaction with MySQL. For this post, we are using the [Node MySQL module](https://node.testcontainers.org/) using the built-in [Node Test Runner](https://nodejs.org/api/test.html).

## Before We Get Started

Before we get started, you need to have the following installed:

* Node - I am using version 20.5.1. There are some issues with earlier versions of Node Test Runner, so your mileage may vary.
* Docker - Or a Docker equivalent such as Rancher or Podman. I am using Rancher on my machine.
  * Check out the [documentation](https://node.testcontainers.org/supported-container-runtimes/) on setting up other container runtimes.
* An IDE
* Git - This will be the best way to get the demo up and running quickly.

## Getting the Code

To get the code in this demo, head over to [this GitHub repo](https://github.com/boyzoid/Test-Containers) and clone it. Right now, there is only a single demo. I plan to expand these demos to include other test runners (such as Jest or Mocha) and languages (such as Java).

The command to clone the repo from the command line over SSH is:

```shell
git clone git@github.com:boyzoid/Test-Containers.git
```

Next, Change the directory for this demo.

```shell
cd Test-Containers/Node/Node_Test_Runner
```

Lastly, we need to install all the Node dependencies by running the following:

```shell
npm install
```

### Code Overview

We should now have a directory structure that looks like the following:

![Project Directory Structure](/assets/images/2023/testing-mysql-apps-node/image_01.png)

Let's talk about some of these files/directories.

* The `repository` directory holds the files responsible for interacting with the database.
  * In this demo, we have only a single file named `user-repository.js` that is used to interact with the `user` table.
* The `setup` directory contains files that will be run each time we spin up our tests.
  * I named the single file in this directory `ddl.js` because it is used to run SQL commands that will set up our database schema.
In a future post, I plan on integrating database migration scripts to show how we can track database changes more easily.
* The `test` directory holds all of our test files - or file in this case.
  * There is a single file named `user-repository.test.js` that contains our tests for the user repository.
  * By naming the directory `test`, the Node Test Runner detects that test files are in this directory.
* The `utils` directory contains files with code I would reuse often.
  * The `testUtils.js` file contains code I would often use when running tests - such as a method that will generate a random string of a given length.
  * The `dataUtils.js` file contains code used to massage the data. In this case, there is a single method that takes a result set from a query to a MySQL database and converts it to JSON.

If you take a peak inside `package.json`, you will see the following:

```json
 "dependencies": {
    "@mysql/xdevapi": "^8.0.33"
  },
  "devDependencies": {
    "testcontainers": "^9.9.1"
  }
```

These dependencies show what modules are used for this demo. We can see we are using the [X DevAPI](https://dev.mysql.com/doc/dev/connector-nodejs/latest/) - which is the Oracle-supported connector (SDK) for interacting with MySQL in a Node application. Under the `devDependencies`, we specify the `testcontainers` module.

## Deeper Dive Into The Code

Let's take a deeper dive into the different pieces of this code.

### The Tests

Since it is the focus of this demo, let's look at `user-repository.test.js` first.

The file starts off with a few `import` statements.

```javascript
import { test, before, after } from 'node:test';
import { strict as assert } from 'node:assert';
```

These statements import modules from the Node tests Runner. The second one sets up `assert` to use a strict comparison by default. We'll see more about this in a little bit.

Next, we import the testcontainers module.

```javascript
import {MySqlContainer} from "testcontainers";
```

Lastly, we import the project-specific code.

```javascript
import { ddl } from "../setup/ddl.js";
import { testUtils } from "../utils/testUtils.js";
import UserRepo from "../repository/user-repository.js";
```

These import the `ddl` module to set up our database schema when we run the tests, our `testUtils` module with helper methods for running tests, and our `UserRepo`. We will go into more detail on each of these soon.

We then specify our test suite using `test()`. We can nest sub-suites of tests using `test()` inside this suite. We also initialize some variables that will be used in our tests.

```javascript
test('Testing User Repository, async (t) => {
let container;
let userRepo;
```

Since much of the X DevAPI database interaction is asynchronous, we use `async` in the test definition. Also, not that we pass an argument named `t` into the callback function.

When setting up a test suite, we can define code that gets run before the suite is run. In Node Test Runner, we define this code inside `before()`. Anything in this block is run at the start of the test suite. We use `before()` in this example to set up our `container` and create an instance of `UserRepo`. Finally, we execute some code in the `ddl` module to set up our database.

```javascript
before(async ()=>{
        container = await new MySqlContainer().withExposedPorts(3306, 33060).start();  
        userRepo = new UserRepo(
            container.getUsername(),
            container.getUserPassword(),
            container.getHost(),
            container.getMappedPort(33060),
            container.getDatabase()
            )
        await ddl.createUserTable(await userRepo.getSession()); 
    })
```

When we create our container, we use the `withExposedPorts()` method because the X DevAPI connector for Node must have access to port 33060 as well as port 3306. Testcontainers handles mapping these ports in the container to ports on our local system when this container is spun up.

When we create an instance of `UserRepo`, we pass in connection information - `username`, `password`, `host`, `port number`, and `database name`. These are all provided by the connector. Note that we use `container.getMappedPort(33060)` for the port number. This will give the local system port mapped to port 33060 on the container.

The last task we perform in `before` is to call `ddl.createUserTable()` to run the SQL query to create our `user` table and pass in the result of `userRepo.getSession()`.

In a test suite, we use `after()` to define code that runs after all the tests in the suite have been executed. In our example, we want to stop the container after all the tests run. The code for this would be:

```javascript
after(async ()=>{
    await container.stop();
})
```

Our test suite has two tests defined. Let's look at the first one, designed to test that the container is running and we can connect to it.

```javascript
await t.test('Container should be running', async (t)=>{
    const queryResult = await container.executeQuery("SELECT 1 as res");
    assert.equal(queryResult,"res\n1\n" )
});
```

We define individual tests using the `t.test()` method. This takes two arguments:

1. The name of the test. This should be descriptive but not overly verbose, as it could be challenging to read.
2. A callback function that does the actual testing. Note we add `t` to this function just like we did for `test()`.

On the first line of our test, we use functionality built into our container to run a simple query. On the second line, we use `assert.equal()` to verify that the query results match what we expect. The test would fail if the call to `assert.equal()` returned `false`.

Our second test uses our instance of `UserRepo` to add a user to the `user` table and test that the value was added correctly.

```javascript
await t.test('Should create user', async(t)=>{
        const name = testUtils.generateString(50);
        await userRepo.createUser({name: name});
        const queryResult = await userRepo.getUserByName(name);
        assert.equal(1, queryResult.length);
        assert.equal(name, queryResult[0].name);
    })
```

In the first line, we use `testUtils.generateString()` to create a random string that will be used as the `name` for our new user. We pass this value as part of a JSON object into the `userRepo.createUser()` method. After we have created a user, we need to check that it was added correctly. In this example, we use `userRepo.getUserByName()` and pass our randomly generated string.

We have two assertions:

1. We check that only 1 row is returned.
2. We check that the value of the `name` property of the array's first (and only) row is equal to the value of the `name` variable we generated.

Usually, I would not use other code in `UserRepo` to test the functionality of a method in `UserRepo`, but I did this to make it easier to follow. I plan to put out other blog posts for rules I like to follow concerning this behavior.

### The Repository

Now that we have broken down our test let's look at `UserRepo`.

At the top of that file, we have `imports` for the X DevAPI and our `dataUtils`.  

```javascript
import * as mysqlx from '@mysql/xdevapi'
import dataUtils from '../utils/dataUtils.js'
```

We define this module as a class that can be instantiated elsewhere. We also define a few private variables and a `constructor` to set up variables when the class is instantiated.

```javascript
export default class UserRepo{
    #connectionUrl
    #pool
    constructor(dbUser, dbPassword, dbHost, dbPort, schemaName) {
        this.#connectionUrl =
            `mysqlx://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${schemaName}`
        this.#pool = mysqlx.getClient(this.#connectionUrl, {
            pooling: {
                enabled: true,
                maxSize: 10,
                maxIdleTime: 20000,
                queueTimeout: 5000
            }
        })
    }
```

The private variables are named `#connectionUrl` and `#pool`. These are used to set up the MySQL connection string and the connection pool, respectively.

In our constructor, we expect arguments for the `dbUser`, `dbPassword`, `dbHost`, `dbPort`, and `schemaName`. These values are used to build out our connection string.

Note that we use `mysqlx` as the protocol in the connection string. This is because we need to connect over the X Protocol to use the X DevAPI.

Next, we set up a connection pool by calling `mysqlx.getClient()` and passing in `#connectionUrl` and a configuration block for the connection pool.

We need to use a database session every time we interact with the database, so we add a helper method to grab a session from the connection pool.

```javascript
async getSession(){
    return await this.#pool.getSession()
}
```

There are two other methods in `UserRepo`. Each uses the X Dev API to insert and select data from our database. Let's take a look.

```javascript
async createUser(user) {
    const session = await this.getSession();
    const db = session.getSchema();
    const table = db.getTable('user');
    table.insert(['name'])
        .values(user.name)
        .execute();
    session.close();
}
```

In `createUser`, we expect a JSON object with a `name` property. First, we grab a session from the connection pool. Then we call `session.getSchema()` to get a reference to the `schema` we want to use. Since we used the schema name in the connection string, this will return the default schema.

Next, we get a reference to the `table` into which we wish to insert data.

Once we have the `table`, we call `table.insert()` and pass in the columns we want to insert into. In this case, we are just inserting into the `name` column. As you will see soon, there is an `id` column that is a primary key, but it is an `auto increment` column. We use method chaining to call `values()` and pass in the value we want to use and then call `execute()`. This code will be turned into an `INSERT` statement and be executed against the database.

The last thing we do is close the session. When we do this, the session is returned to the connection pool.

The other method in `UserRepo` is `getUserByName()`, which is defined as:

```javascript
async getUserByName(name) {
    let ret = [];
    const session = await this.getSession();
    const db = session.getSchema();
    const table = db.getTable('user');
    const rows = await table.select(['id', 'name'])
        .where('name = :nameParam')
        .bind('nameParam', name)
        .execute();
    const data = rows.toArray();
    const columns = rows.getColumns()
    ret = dataUtils.formatData( data, columns )
    session.close();
    return ret;
}
```

Breaking this down, we see that, again, we first get a session from the connection pool and get references to the `schema` and `table`. We use `table.select()` and pass in an array of column names. Here we want to return `id` and `name`. Using method chaining, we then call `where()` and pass in a `WHERE` condition for our query. We use `:nameParam` to parameterize the input and `bind()` to set the parameter's value. And we then call `execute()`.

The result of the call to `execute()` is set into a variable named `rows`. We call `rows.toArray()` to turn our result set into an array (which is actually a two-dimensional array). Currently, the column names are not returned in the results set, but we can get that information from `rows.getColumns()`. We then call `dataUtils.formatData()` and pass in the array of data, and the column information, and it will return a JSON object where the properties match the column names.

We then close the session and return the value returned from `dataUtils.formatData()`.

### The Data Utilities

Let's look at the code since we were talking about `dataUtils`. Over time, I might have more functionality in this file, but for now, it is just `formatData()`.

```javascript
formatData(data, columns){
    let ret = [];
    data.forEach((row) =>{
        let obj = {};
        row.forEach((item,i)=>{
            obj[columns[i].getColumnLabel()] = item;
        })
        ret.push(obj)
    })
    return ret;
}
```

As I mentioned, the data in array form is a two-dimensional array where each element in the main array is an array of values from the database. The values that make up the `columns` argument are also in an array, and the order of the column names matches the order of the values. This means we can loop over the data array, and when looping over each element in the sub-array, we can use the same array index to get the column name. Here I use `getColumnLabel()` to get the column names. There is also a method named `getColumnName()`, but you should be careful using this if there is a column alias in the call to `select()` because `getColumnName()` returns the actual database column name. In contrast, `getColumnLabel()` will return the defined alias.

As we can see, this code creates a JSON array of objects where each object's property matches the name of the database column (or alias) in the query. While this fits our needs here, `formatData()` would likely need to be updated if we needed nested objects in our results.

### DDL Setup

As I mentioned, I have a code that runs when the test suite starts that sets up our database. We are going to take a look at that code now.

```javascript
async createUserTable(session) {
    const sql = "CREATE TABLE IF NOT EXISTS `user` (id INT NOT NULL AUTO_INCREMENT, name VARCHAR(100) NOT NULL, PRIMARY KEY (id))";
    const query = await session.sql(sql).execute();
    session.close();
}
```

The `createUserTable()` method expects a session from the connection pool. We create a SQL string that creates a table named `user` and defines the two columns. We then `session.sql()` and pass in this string and then call `execute()`. This is the syntax we would use to run regular queries if we did not want to use the X DevAPI for our CRUD operations.

Once again, we need to close the session.

As an application gets more complex, a formal system of tracking schema changes might become necessary. I plan on covering this topic in a future blog post.

### Testing Utilities

When I write tests, I prefer not to use hard-coded values. Instead, I like using randomly created values (when I can) to test database inserts, etc. One way I handle this is by creating an easy-to-use library of helper methods for generating test data. In this example, that `testUtils`. For this example, I have a single method that returns a random string of the given length.

```javascript
generateString(length){
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
```

In the past, I have also had the need to generate random numbers, a random number in a given range, create an array of an arbitrary length, etc. I would add these methods to `testUtils` so they can be reused easily.

## Running the Tests

I hope you are still with me because we are now ready to run our tests.

You can run the tests using a few different methods. The easiest is to execute the following command in a command/terminal window:

```javascript
node --test
```

It may take a while to complete the first time you run these tests. That is because the Docker images need to be fetched. When the tests are completed, you should see an output that resembles the image below.

![Test result output](/assets/images/2023/testing-mysql-apps-node/image_02.png)

We can tell the Node test Runner to watch a directory for changes and run the tests when a file is saved by using the command:

```javascript
node --test --watch ./test
```

Alternatively, for this project, you can run the following:

```javascript
npm run test
```

The result for each of these will look similar to this screenshot:

![Test result with --watch](/assets/images/2023/testing-mysql-apps-node/image_03.png)

Now, if a change is made to any of the files used in the tests, the test suite(s) will be re-run.

## The Wrap-up

One of the most essential parts of writing code is reliably testing to ensure the code is doing what it is intended to do. When you have code interacting with a database, it can be difficult to effectively test that code. The Testcontainers framework gives developers a tool to make it easier to reliably test that database interactivity.

Image by <a href="https://pixabay.com/users/darkostojanovic-638422/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=563423">Darko Stojanovic</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=563423">Pixabay</a>
