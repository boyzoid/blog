---
title: Integrating DB Migrations Into Your MySQL Tests
date: 2023-09-21T06:00:00
image: 2023/mysql-testing-knex-testcontainers/header.jpg
tags: [ "MySQL", "Node.js", "TDD", "Better-Tests", "Testcontainers", "Knex" ]
related:
- /posts/2023/august/testing-mysql-apps-node/
- /posts/2023/august/testing-mysql-doc-store-apps-node/
- /posts/2023/august/managing-database-changes-knex/
- /posts/2023/october/github-actions-mysql-tests.md
---

In previous posts, I discussed how we can use [Testcontainers](https://testcontainers.com/) to more easily test [code that interacts with a MySQL Database](/posts/2023/august/testing-mysql-apps-node/) and [code that interacts with MySQL Document Store](/posts/2023/august/testing-mysql-doc-store-apps-node/). In yet another post, I demonstrated [how to manage database migrations](/posts/2023/august/managing-database-changes-knex/) using [Knex](https://knexjs.org/). This post will show how we can leverage Knex to incorporate database migrations into our testing workflow.

## The Issues

Writing tests for code that interacts with a database can sometimes be challenging. When running tests for code that interacts with a database, the test should be run against a database in isolation. Setting up a separate database can be time-consuming, create difficulties managing database migrations (schema and data changes), or not feasible due to data sensitivity. Testcontainers make this process easier.

In the previous posts about Testcontainers, we had scripts that ran before the test suite to set up the database schema. These were intended to be executed only when the tests were run. But what if we wanted to incorporate database migrations into our tests to allow us to verify the changes and use that same process to push the changes to production? Knex has us covered there.

For this post, we use the [Node MySQL module](https://node.testcontainers.org/) for Testcontainers and Knex 2.5.1. We also use the built-in [Node Test Runner](https://nodejs.org/api/test.html).

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

Next, change the directory for this demo.

```shell
cd Test-Containers/Node/knex_demo
```

Lastly, we need to install all the Node dependencies by running the following:

```shell
npm install
```

## Code Overview

We should see a directory structure that looks like the image below.

![File Structure]({{ "2023/mysql-testing-knex-testcontainers/image_01.png" | imgurl }})

Let's talk about some of these files and directories.

* The `migrations` directory contains migration files that Knex will apply to the database. This directory contains a single file named `20230828154731_user_table.js` and is responsible for creating two tables.
* The `repository` directory holds the application file responsible for interacting with our MySQL database. In this demo, we have only a single file named `user-repository.js` that interacts with the `user` table.
* The `seeds` directory contains files that Knex can use to insert data into our database. The file named `user_data.js` handles inserting data into the `user_type` and `user` tables.
* The `test` directory holds our test files - or file in this case.
    * A single file named `knex-demo.test.js` contains our tests for the `user` table.
    * By naming this directory `test`, the Node test Runner detects that test files are in this directory.
* The `utils` directory contains files with code I would reuse often.
    * The `dbUtils.js` file contains a class that instantiates an instance of Knex and has helper methods for running our tests.
    * The `testUtils.js` file contains code that helps generate data for our tests.

If you take a look at `package.json`, you will see the following:

```json
"dependencies": {
    "knex": "^2.5.1",
    "mysql2": "^3.6.0"
},
"devDependencies": {
  "testcontainers": "^9.9.1"
}
```

These dependencies indicate what modules are used for this demo. We can see that the `mysql2` connector for MySQL is being used for this demo instead of the X DevAPI we used in other examples. We are also including `knex` and `testcontainers` is added under `devDependencies`.

## Deep Dive Into the Code

Let's take a detailed look at the essential parts of the code.

### The Tests

Since this post focuses on running tests, let's start by looking at the `knex-demo.test.js` file.

At the top of the file, the first two imports are used to import modules from the Node Test Runner.

```javascript
import { test, before, after } from 'node:test';
import { strict as assert } from 'node:assert';
```

The second `import` sets up `assert` to use a strict comparison by default. We will see more about that soon.

Next, we import the testcontainers module.

```javascript
import {MySqlContainer} from "testcontainers";
```

Lastly, we import the project-specific code.

```javascript
import DbUtils from "../utils/dbUtils.js";
import testUtils from "../utils/testUtils.js";
import UserRepo from "../repository/user-repository.js";
```

These import our `DBUtils`, `testUtils`, and `UserRepo` modules. We will talk about each of these in more detail below.

With our imports done, we define our test suite using `test()`. We can specify sub-suites of tests by using `test()` inside of this suite. We also initialize some variables that will be used in our tests.

```javascript
test('Testing Application', async (t) => {
    let container;
    let dbUtils;
```

Note that we pass a variable, `t`, into the callback function.

When we define a test suite, we can also define blocks of code that get executed before the test suite is run. In Node test Runner, we define this code inside `before()`. Any code in this block is run at the beginning of the test suite. Here is what our `before()` looks like.

```javascript
before(async ()=>{
    container = await new MySqlContainer().start();  
    dbUtils = new DbUtils(
        container.getUsername(),
        container.getUserPassword(),
        container.getHost(),
        container.getPort(),
        container.getDatabase()
    )
    await dbUtils.runLatestMigration();
    await dbUtils.runSeed();
})
```

The first thing we do is to create an instance of a `MySQLContainer`. This container will be used with all of our tests. We also create an instance of `DBUtils` and pass in the username, password, host, port, and database information from the container. This information will be used to create our database connection with Knex.

At the end of our `before()` block, we make calls to the `runLatestMigration()` and `runSeed()` methods to create our schema and populate the tables with data.

In a test suite, we can specify code executed after all the tests run. This code is defined in `after()`. For this example, we want to kill the Knex connection and stop the container after the tests are run. The code for this looks like:

```javascript
after(async ()=>{
    await dbUtils.killKnex();
    await container.stop();
})
```

Next, we start defining our tests. The first check is that the container is running and that we can connect to it.

```javascript
await t.test('Container should be running', async (t)=>{
    const queryResult = await container.executeQuery("SELECT 1 as res");
    assert.equal(queryResult,"res\n1\n", 'Container is not running.' )
});
```

We define this test using the `t.test()` method. This method takes two arguments.

1. The name of the test. The name should be descriptive but not overly verbose, as it could be challenging to read in the console output - especially when you use sub-suites.
2. A callback function that does the actual testing. Note we add `t` to this function just like we did for `test()`.

On the first line of our test, we use functionality built into our container to run a simple query. On the second line, we use `assert.equal()` to verify that the query results match what we expect. The test would fail if the call to `assert.equal()` returned `false`.

Our next block of tests creates a sub-suite of tests designed to test that the migrations are completed as expected.

```javascript
await t.test('Testing Migration', async(t)=>{
    await t.test('User table exists', async (t)=>{
        const exists = await dbUtils.tableExists('user');
        assert(exists, 'USER table does not exist');
    })
    await t.test('User Type table exists', async (t)=>{
        const exists = await dbUtils.tableExists('user_type');
        assert(exists, 'USER_TYPE  table does not');
    })
})
```

Each test uses a helper method named `tableExists()` in `dbUtils` to check if the table was created. We pass a second argument to `assert()`, a custom error message that will be displayed if either of these tests do not pass.

After this sub-suite, we define another. This time, we want to test that the seed process worked as expected.

```javascript
await t.test('Testing Seed', async(t)=>{
    await t.test('User data exists', async (t)=>{
        const count = await dbUtils.rowCount('user');
        assert(count != 0, 'USER data does not exist.');
    })
    await t.test('User Type data exists', async (t)=>{
        const count = await dbUtils.rowCount('user_type');
        assert(count != 0, 'USER_TYPE data does not exist');
    })
})
```

These tests are very similar to the tests for migrations, but they use a different helper method, `dbUtils`. The `rowCount()` function returns the number of rows in the given table, and we test to ensure the value is greater than 0.

Our last block of code for running tests is another sub-suite. This one is responsible for running all tests for the `UserRepo`.

```javascript
await t.test("Testing User Repo", async(t)=>{
    let userRepo;
    before(async ()=>{
        userRepo = new UserRepo(dbUtils.getKnex())
    })
    await t.test('Can add user', async(t)=>{
        const preTestCount = await dbUtils.rowCount('user');
        const user = {
            user_type_id : await dbUtils.getRandomColumnValue('user_type', 'id'),
            first_name : testUtils.generateString(10),
            last_name : testUtils.generateString(10),
            email : testUtils.generateString(10)
        }
        const result = await userRepo.addUser(user);
        const postTestCount = await dbUtils.rowCount('user');
        const newUser = await dbUtils.getById(result, 'user', 'id');
        assert.equal(preTestCount + 1, postTestCount);
        assert.equal(user.first_name, newUser.first_name);
        assert.equal(user.last_name, newUser.last_name);
        assert.equal(user.email, newUser.email);
        assert.equal(user.user_type_id, newUser.user_type_id);
    })
})
```

There is a lot to digest here, so let's break this down bit by bit.

First, we initialize a variable named `userRepo`. This will allow the variable to be used in all the tests in our sub-suite.

```javascript
let userRepo;
```

Next, we define code that is run before this sub-suite. In this example, create a new instance of `UserRepo` and pass in the Knex instance from `dbUtils`.

```javascript
before(async ()=>{
    userRepo = new UserRepo(dbUtils.getKnex())
})
```

We then define our tests for adding a user to the database.

```javascript
await t.test('Can add user', async(t)=>{
    const preTestCount = await dbUtils.rowCount('user');
    const user = {
        user_type_id : await dbUtils.getRandomColumnValue('user_type', 'id'),
        first_name : testUtils.generateString(10),
        last_name : testUtils.generateString(10),
        email : testUtils.generateString(10)
    }
    const result = await userRepo.addUser(user);
    const postTestCount = await dbUtils.rowCount('user');
    const newUser = await dbUtils.getById(result, 'user', 'id');
    assert.equal(preTestCount + 1, postTestCount);
    assert.equal(user.first_name, newUser.first_name);
    assert.equal(user.last_name, newUser.last_name);
    assert.equal(user.email, newUser.email);
    assert.equal(user.user_type_id, newUser.user_type_id);
})
```

Let's break down each of these steps.

1. We get the row count of the `user` table BEFORE adding a new user.
2. We define a test user.
    1. We use a helper method on `dbUtils` to get a random value from the `user_type` table.
    2. We use a helper method on `testUtils` to generate a random string for our test user's `first_name`, `last_name`, and `email` properties.
3. We pass our test user to the `addUser()` method of `userRepo`.
    1. This method will return the `id` of the new user.
4. We get the row count of the `user` table AFTER we try adding a new user.
5. We use a helper method on `dbUtils` called `getById()` which will return a user based on the `id` that is passed.
6. We test that `pretestCount` + 1 equals the `postTestCount`.
7. We test that the properties on the `newUser` (which we retrieved from the database) match the properties on the test user.

Some may think this is overkill and that testing each property is unnecessary. I respectfully disagree. The idea behind these tests is to ensure that the `addUser()` method on the `userRepo` stores the data as we expect. The only way to ensure this is to test each value we expect to be persisted in the database.

### The Migrations

We will inspect our one migration file now that we have looked at the tests. This file has two functions, `up()` and `down()`. Anything in the `up()` function will get executed when the migration is run. Anything in the `down()` function gets run when a migration gets rolled back.

Inside the `up()` function, we have code that creates two tables - `user_type` and `user` - but it shows two different ways to create the table using Knex.

```javascript
export async function up(knex) {
  const user_type_sql = `CREATE TABLE user_type (
    id int unsigned NOT NULL AUTO_INCREMENT, 
    name varchar(25) DEFAULT NULL, 
    PRIMARY KEY (id), 
    UNIQUE KEY user_type_name_idx (name) )`;
  await knex.raw(user_type_sql);
  
  return knex.schema
    .createTable('user', (table)=>{
        table.increments('id');
        table.string('first_name', 100).notNullable();
        table.string('last_name', 100).notNullable();
        table.string('email', 100).notNullable();
        table.integer('user_type_id').unsigned();
        table.foreign('user_type_id').references('user_type.id');
    })
};
```

When we create the `user_type` table, we use raw SQL to create the table. We create a string that contains the SQL we want to execute and pass it to `knex.raw()`. When we create the `user` table, we use the Knex API to define the table and the columns.

The `down()` function contains code that reverses what we did in `up()`. It drops the `user` and `user_type` tables.

```javascript
export function down(knex) {
  return knex.schema
    .dropTable('user')
    .dropTable('user_type')
};
```

These changes will be tracked in the `knex_migrations` database table we defined in `knexfile.js`.

If we use the Knex CLI to create a new migration, the file name begins with a timestamp of when the file was created. This helps Knex know what the latest migrations are.

### The Seeds

Let's move on to the code that populates our database when we start our tests. The `user_data.js` file in the `seeds` directory looks like this:

```javascript
export async function seed (knex) {
  await knex('user').del();
  await knex('user_type').del();
  await knex('user_type').insert([
    {id: 1, name: 'User'},
    {id: 2, name: 'Admin'},
    {id: 3, name: 'GodMode'}
  ]);
  await knex('user').insert([
    {id: 1, first_name: 'Scott', last_name: 'Stroz', email: 'scott@test.com', user_type_id: 3},
    {id: 2, first_name: 'Fred', last_name: 'Descamps', email: 'lefred@test.com', user_type_id: 1},
    {id: 3, first_name: 'Lenka', last_name: 'Kasparova', email: 'lenka@test.com', user_type_id: 2}
  ])
};
```

There is a single function named `seed()`. In this function, we make calls to the Knex API.

1. We call `del()` to delete values in the `user` table.
2. We call `del()` to delete values in the `user_type` table.
3. We call `insert()` to insert three rows into the `user_type` table.
4. We call `insert()` to insert three rows into the `user` table.

When using `insert()`, we can pass in JSON objects representing our data, but we must ensure the key names match the column names in the table.

### User Repository

Next up, we look at `user-repository.js`. This class is pretty streamlined.

```javascript
export default class UserRepo{
    #myKnex
    constructor(knex) {
        this.#myKnex = knex
    }

    async addUser(user){
        const result = await this.#myKnex('user').insert(user);
        return result[0];
    }
}
```

Our constructor expects one argument that is an instance of Knex and sets it to a private variable named `#knex`.

The single method of this class is `addUser()`. It expects a user JSON object to be passed and then calls `insert()` to persist that object to the database. The `insert()` method returns a data structure that includes the is of the newly inserted user. We return that value.

### Test Utils

The `testUtils.js` file contains one function that generates a random string of the given length.

```javascript
const testUtils = {
    generateString(length){
        const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

export default testUtils;
```

### DB Utils

The `dbUtils.js` file contains a class that does much of the heavy lifting for our tests. Let's break it down into more manageable chunks.

```javascript
constructor(dbUser, dbPassword, dbHost, dbPort, schemaName) {
    const config = {
        client: 'mysql2',
        connection: {
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPassword,
            database: schemaName
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }
    this.#myKnex = new knex(config);
}
```

Our constructor expects arguments for our database connection. We use these arguments to create the config for our Knex instance. Note that we specify the table name that will be used to track the migration progress.

Next, we have some of our helper methods.

```javascript
getKnex(){
    return this.#myKnex;
}
```

The `getKnex()` method returns the `knex`1 instance. We use this when we instantiate the `userRepo` in our tests.

```javascript
async runLatestMigration(){
    await this.#myKnex.migrate.latest();
}
```

The `runLatestMigration()` method uses the Knex API to run the latest migrations.

```javascript
async runSeed(){
    await this.#myKnex.seed.run();
}
```

The `runSeed()` method uses the Knex API to run the seeds.

```javascript
async tableExists(name){
    return await this.#myKnex.schema.hasTable(name);
}
```

The `tableExists()` method expects one argument, the name of the table to check. It uses the Knex API to check if a table exists.

```javascript
async rowCount(tableName){
    const result = await this.#myKnex(tableName).count('id as count');
    return result[0].count;
}
```

The `rowCount()` method expects one argument: the table name whose records we wish to count. It uses the Knex API to return the number of rows in the table and puts that value into a result named 'count',

```javascript
async getRandomColumnValue( tableName, columnName ){
    const result = await this.#myKnex.raw(`select ${columnName} as val from ${tableName} order by rand() limit 1`);
    return result[0][0].val;
}
```

The `getRandomColumnValue()` expects two arguments - the table name and the column name we wish to return. It uses the Knex API to run a raw SQL query that returns the value of the passed column from a random row in the database.

```javascript
async getById(id, tableName, columnName){
    const result = await this.#myKnex.raw(`select * from ${tableName} where ${columnName} = ${id}`);
    return result[0][0];
}
```

The `getByID()` method expects three arguments - the id value we want to return, the table from which we want to return the row, and the name of the column that contains the id value.

```javascript
async killKnex(){
    await this.#myKnex.destroy();
}
```

The `killKnex()` method destroys the Knex connection. We call this in the `after()` method of our tests. We need to do this so that the connection is released and the test suite can be completed when we use `node --test` to run our tests.

## Running the Tests

I hope you are still with me because we are now ready to run our tests.

You can run the tests using a few different methods. The easiest is to execute the following command in a command/terminal window:

```javascript
node --test
```

It may take a while to complete the first time you run these tests. That is because the Docker images need to be fetched. You should see an output that resembles the image below when the tests are conducted.

![Test result output]({{ "2023/mysql-testing-knex-testcontainers/image_02.png" | imgurl }})

We can tell the Node test Runner to watch a directory for changes and run the tests when a file is saved by using the command:

```javascript
node --test --watch ./test
```

Alternatively, for this project, you can run the following:

```javascript
npm run test
```

The result for each of these will look similar to this screenshot:

![Test result with --watch]({{ "2023/mysql-testing-knex-testcontainers/image_03.png" | imgurl }})

If a change is made to any of the files used in the tests, the test suite(s) will be re-run.

## The Wrap-Up

Knex allows us to integrate MySQL migration management into our continuous integration workflows. It also allows us to process these migrations into our testing process - and even test them themselves. All of these tests can be run without the need to stand up a separate database using Testcontainers.

Photo by <a href="https://unsplash.com/@nci?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">National Cancer Institute</a> on <a href="https://unsplash.com/photos/tV-RX0beDp8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
