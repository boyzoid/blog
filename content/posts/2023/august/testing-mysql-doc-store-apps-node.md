---
title: Writing Tests For MySQL Document Store Apps with Node
date: 2023-08-23T06:00:00
image: /assets/images/2023/testing-mysql-doc-store-apps-node/header.jpg
tags: [ "MySQL", "MySQL-Document-Store", "Node.js", "TDD", "Better-Tests", "Testcontainers" ]
related:
    -/posts/2023/august/testing-mysql-apps-node/

---
In a [previous post](/posts/2023/august/testing-mysql-apps-node/), I talked about how we can use [Testcontainers](https://testcontainers.com/) to help make it easier to write tests for Node applications that interact with a MySQL database. In this post, we are going to discuss how we can write tests for Node applications that interact with [MySQL Document Store](https://www.mysql.com/products/enterprise/document_store.html) - again using the [MySQL Module](https://testcontainers.com/modules/mysql/) for Testcontainers.

## The Issues

Writing tests for code that interacts with a database can be challenging. Developers should use a separate database for testing their code. Setting up a separate database can be time-consuming, create difficulties in managing database schema and data changes, or is not feasible due to data sensitivity. Testcontainers help make this process more streamlined.

Since MySQL Document Store is built on top of MySQL, we can use Testcontainers to make writing tests for applications that interact with MySQL Document Store less challenging.

## I'm Sorry, Test...what?

That is a great question! The 'official' description from the Testcontainers website states:

> Testcontainers is an open-source framework for providing throwaway, lightweight instances of databases, message brokers, web browsers, or anything that can run in a Docker container.

Testcontainers allow developers to spin up Docker images for testing purposes. The framework can be used for a variety of scenarios. Still, we will focus on using Testcontainers for testing interaction with MySQL Document Store. For this post, we are using the [Node MySQL module](https://node.testcontainers.org/) using the built-in [Node Test Runner](https://nodejs.org/api/test.html).

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
cd Test-Containers/Node/Node_Test_Runner_Doc_Store
```

Lastly, we need to install all the Node dependencies by running the following:

```shell
npm install
```

### Code Overview

We should now have a directory structure that looks like the following:

![Project Directory Structure](/assets/images/2023/testing-mysql-doc-store-apps-node/image_01.png)

Let's talk about some of these files/directories.

* The `repository` directory holds the files responsible for interacting with the MySQL Document Store.
  * In this demo, we have only a single file named `restaurant-repository.js` that interacts with the `restaurant` document collection.
* The `setup` directory contains files that will be run each time we spin up our tests.
  * I named the single file in this directory `document_store.js` because it is used to execute code that sets up our Document Store collection. It is also used for code used to test that our repository methods function as expected.
In a future post, I plan on integrating database migration scripts to show how we can track database changes more easily.
* The `test` directory holds all of our test files - or file in this case.
  * A single file named `restaurant-repository.test.js` contains our tests for the restaurant repository.
  * By naming the directory `test`, the Node Test Runner detects that test files are in this directory.
* The `utils` directory contains files with code I would reuse often.
  * The `testUtils.js` file contains code I often use when running tests - such as methods that will generate a random string of a given length, a random integer in a given range, and a test `restaurant` JSON object.

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

Since it is the focus of this demo, let's look at `restaurant-repository.test.js` first.

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
import { docStoreSetup } from "../setup/document_store.js";
import { testUtils } from "../utils/testUtils.js";
import RestaurantRepo from "../repository/restaurant-repository.js";
```

These import the `docStoreSetup` module to set up our database schema when we run the tests, our `testUtils` module with helper methods for running tests, and our `RestaurantRepo`. We will go into more detail on each of these soon.

We then specify our test suite using `test()`. We can nest sub-suites of tests using `test()` inside this suite. We also initialize some variables that will be used in our tests.

```javascript
test('Testing Restaurant Repository, async (t) => {
let container;
let restaurantRepo;
```

Since much of the X DevAPI database interaction is asynchronous, we use `async` in the test definition. Also, note that we pass an argument named `t` into the callback function.

When setting up a test suite, we can define code that gets run before the suite is run. In Node Test Runner, we define this code inside `before()`. Anything in this block is run at the start of the test suite. We use `before()` in this example to set up our `container` and create an instance of `RestaurantRepo`. Finally, we execute some code in the `docStoreSetup` module to set up our database.

```javascript
before(async ()=>{
    container = await new MySqlContainer().withExposedPorts(3306, 33060).start();  
    restaurantRepo = new RestaurantRepo(
        container.getUsername(),
        container.getUserPassword(),
        container.getHost(),
        container.getMappedPort(33060),
        container.getDatabase()
        )
    await docStoreSetup.createTestCollection(restaurantRepo); 
})
```

When we create our container, we use the `withExposedPorts()` method because the X DevAPI connector for Node must have access to port 33060 as well as port 3306. Testcontainers maps these ports in the container to ports on our local system when this container is spun up.

When we create an instance of `RestaurantRepo`, we pass in connection information - `username`, `password`, `host`, `port number`, and `database name`. These are all provided by the connector. We use `container.getMappedPort(33060)` for the port number. This will map the local system port to port 33060 on the container.

The last task we perform in `before` is to call `docStoreSetup.createTestCollection()` to execute API commands that set up our Document Store collection. Notice that we pass the `restaurantRepo` as an argument to `createTestCollection()`.

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

1. The name of the test. This should be descriptive but not overly verbose, as reading it in the output could be challenging.
2. A callback function that does the actual testing. Note we add `t` to this function just like we did for `test()`.

On the first line of our test, we use functionality built into our container to run a simple query. On the second line, we use `assert.equal()` to verify that the query results match what we expect. The test would fail if the call to `assert.equal()` returned `false`.

Our second test uses our instance of `RestaurantRepo` to add a document to the `restaurant` collection and verify that the document was added correctly.

```javascript
await t.test('Should create restaurant', async(t)=>{
    const test_restaurant = testUtils.createTestRestaurant();
    const result = await restaurantRepo.addRestaurant(test_restaurant);
    const testData = await docStoreSetup.getById(await restaurantRepo, test_restaurant._id);
    assert.equal(result, true);
    assert.equal(testData.length, 1);
    assert.equal(testData[0]._id, test_restaurant._id)
})
```

In the first line, we use `testUtils.createTestRestaurant()` to create a JSON object representing our new `restaurant` document. As we will see, this method uses some of the other 'helper' methods in `testUtils`. We pass this JSON object into the `restaurantRepo.addRestaurant()` method. After we have created the document and persisted it in our collection, we must check that it was added correctly. In this example, we use `docStoreSetup.getById()` and pass our instance of `RestaurantRepo` and the `_id` property of our test object. We will take a closer look at this code shortly.

We have three assertions:

1. We check that the value returned from `restaurantRepo.addRestaurant()` is `true`.
2. We check that only one item is returned from our call to `docStoreSetup.getById()`.
3. We check that the value of the `_id` property of the single elemment in the `testData` array is equal to the `_id` property of our generated document.

I prefer to test code in small units. If I am testing one particular method, which calls other methods, I will mock those other methods (and test them separately). I also like to separate the logic/code I use to test data from the logic/code that performs the action being tested. I could have added a method to `restaurantRepo` that gets a document based on the `_id`, but we are not testing a single method at a time. Mocking would not work here either because we must check that the data was persisted in the database.

### The Repository

Now that we have broken down our test, let's look at `RestaurantRepo`.

At the top of that file, we have `imports` for the X DevAPI.  

```javascript
import * as mysqlx from '@mysql/xdevapi'
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

The private variables are named `#connectionUrl` and `#pool`. These are used to set up the MySQL connection string and the connection pool.

Our constructor expects arguments for the `dbUser`, `dbPassword`, `dbHost`, `dbPort`, and `schemaName`. These values are used to build out our connection string.

Note that we use `mysqlx` as the protocol in the connection string. This is because we need to connect over the X Protocol to use the X DevAPI.

Next, we set up a connection pool by calling `mysqlx.getClient()` and passing in `#connectionUrl` and a configuration block for the connection pool.

We need to use a database session every time we interact with the database, so we add a helper method to grab a session from the connection pool.

```javascript
async getSession(){
    return await this.#pool.getSession()
}
```

There are two other methods in `RestaurantRepo`. It uses the X Dev API to add a document to our collection. Let's take a look.

```javascript
async addRestaurant(restaurant) {
    let success = true;
    const session = await this.getSession();
    const schema = await session.getDefaultSchema();
    const collection = schema.getCollection('restaurant');
    try{
        await collection.add(restaurant).execute();
    }
    catch(e){
        success = false
    }
    session.close();
    return success;
}
```

In `addRestaurant`, we expect a JSON object named `restaurant` First, we grab a session from the connection pool. Then we call `session.getDefaultSchema()` to get a reference to the `schema` we want to use. Since we used the schema name in the connection string, this is the schema returned.

Next, we get the collection named `restaurant` from the schema.

Once we have the `collection`, we call `collection.add()` and pass in our JSON object. Using method chaining, we also call `execute()` to persist our document. This is wrapped in a `try/catch` to return a value that indicates if the document was stored without issue.

The last thing we do is close the session. When we do this, the session is returned to the connection pool.

### Document Store Setup

As I mentioned, I have a code that runs when the test suite starts that sets up our Document Store collection. We are going to take a look at that code now.

First, the `createTestCollection()` method.

```javascript
async createTestCollection(repo) {
    const session = await repo.getSession();
    const schema = await session.getDefaultSchema();
    await schema.createCollection('restaurant');
    session.close();
}
```

The `createTestCollection()` method expects a `RestaurantRepo` instance as an argument. We call `repo.getSession()` to get a session from the connection pool. We then call `session.getDefaultSchema()` to get the default schema. Lastly, we call `schema.createCollection()` and pass the string `restaurant` to create a collection named `restaurant`.

We use the `getByID()` method as part of our test to get a document by the value passed.

```javascript
async getById(repo, id){
    const session = await repo.getSession();
    const schema = await session.getDefaultSchema();
    const collection = await schema.getCollection('restaurant')
    const results = await collection.find("_id = :idParam").bind("idParam", id).execute();
    const data = results.fetchAll();
    session.close();
    return data;

}
```

First, use the `repo` argument to get a session from the connection pool. We then get the default schema from the session and the collection from the schema. Once we have the collection, we call `collection.find()` and pass in an argument that states we want to find the document with the `_id` property that matches the passed in `id` value. Using method chaining, we call `bind()` to handle the `idParam` parameter and call `execute()`. We set the return value using `results.fetchAll()` and close the session.

Yes, we are just using the same API that we would use in `RestaurantRepo`, but as I noted above, I prefer to have this kind of code/logic separate from the code we are testing. Also, there is no need to format any of this data because it is already being returned as JSON.

### Testing Utilities

When I write tests, I prefer not to use hard-coded values. Instead, I like using randomly created values (when I can) to test database inserts, etc. I handle this by creating an easy-to-use library of helper methods for generating test data. In this example, that `testUtils`. For this example, three methods each return a different kind of value.

First, we have `generateString()`. I use this kind of method frequently when writing tests.

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

Next, we have `getRandomInteger()`, which returns a random number between `min` and `max`.

```javascript
getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

Lastly, we have a method that generates a `restaurant` document with random values.

```javascript
createTestRestaurant(){
    const rest = {};
    rest._id = testUtils.generateString(32);
    rest.name = testUtils.generateString(10);
    rest.avgScore = this.getRandomInteger(10,100);

    return rest;
}
```

In this method, I use `generateString()` and `getRandomInteger()` to populate property values in a test `restaurant` JSON object.

## Running the Tests

I hope you are still with me because we are now ready to run our tests.

You can run the tests using a few different methods. The easiest is to execute the following command in a command/terminal window:

```javascript
node --test
```

It may take a while to complete the first time you run these tests. That is because the Docker images need to be fetched. You should see an output that resembles the image below when the tests are conducted.

![Test result output](/assets/images/2023/testing-mysql-doc-store-apps-node/image_02.png)

We can tell the Node test Runner to watch a directory for changes and run the tests when a file is saved by using the command:

```javascript
node --test --watch ./test
```

Alternatively, for this project, you can run the following:

```javascript
npm run test
```

The result for each of these will look similar to this screenshot:

![Test result with --watch](/assets/images/2023/testing-mysql-doc-store-apps-node/image_03.png)

If a change is made to any of the files used in the tests, the test suite(s) will be re-run.

## The Wrap-up

When using the X DevAPI to interact with MySQL Document Store, we never directly interact with the database server. However, we still need access to a MySQL database to effectively test the application code responsible for interacting with the X DevAPI. Using Testcontainers, we can spin up a database on the fly to make writing and running tests easier.

Photo by <a href="https://unsplash.com/@_louisreed?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Louis Reed</a> on <a href="https://unsplash.com/photos/pwcKF7L4-no?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
