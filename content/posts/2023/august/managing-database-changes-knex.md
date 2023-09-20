---
title: Managing MySQL Database Changes with Knex
date: 2023-08-31T06:00:00
image: /assets/images/2023/managing-database-changes-knex/header.jpeg
tags: [ "MySQL", "Node.js", "Migrations" ]
related:
  - /posts/2023/september/mysql-testing-knex-testcontainers/
---

As all developers know, one of the most critical parts of any project is tracking database changes (or migrations). These changes will likely need to be applied in a particular order, and they need to be applied to every environment in the development workflow. We should also be able to roll back these changes should things not go as expected. [Knex](https://knexjs.org/) (pronounced like `konnex`) can help us manage these migrations, roll back changes, and assist in applying them to different environments.

## The Problem

We needed to manage database changes on every project I have worked on. I've used several libraries for this and even worked on one project where we rolled a homegrown solution (yeah, I know...yikes). Managing database changes can be challenging, especially when there are multiple developers on the project and/or you are working on a new project where database changes tend to be commonplace. A DBA would be available to help manage these changes in an ideal world. Only some projects have this luxury, though, and developers are often tasked with managing these changes independently. This is where libraries like Knex come into play.

## The Solution

There are many libraries like Knex in various languages - Knex is primarily targeted at a [Node.js](https://nodejs.org/) environment. I like Knex because I find the [API](https://knexjs.org/guide/) to be intuitive and not only can it be used to manage [migrations](https://knexjs.org/guide/migrations.html), but you can also use Knex to [seed](https://knexjs.org/guide/migrations.html#seed-files) your database with data (which is very handy when you are writing tests). You can also use Knex in your application code for [CRUD operations](https://knexjs.org/guide/query-builder.html). I'll cover this in a future post. This post will discuss how to use the Knex CLI to manage migrations and data seeding.

## Before We Begin

Before we start, let's run down the list of things you need to follow along with the examples below.

* You need to have access to a MySQL instance.
  * Create a table for our database changes - we will use one named `knex_demo` in the example below.
* You need to have version 12 (or higher) of Node.
* [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) (or some other CLI) to run SQL commands to see how our database is modified.
* You don't need an IDE, but it will make things easier.

## Creating the Project

We are going to start with an empty project. First, let's create a directory for the project.

```shell
mkdir knex_demo
```

Now, we need to navigate into the new directory:

```shell
cd knex_demo
```

Once we are in our project directory, we initialize our Node application using the following command:

```shell
▶ npm init -y 
```

When that command has been completed, we should have a file named `package.json` in our project that contains output similar to what is below:

```javascript
{
  "name": "knex_demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

Next, we install Knex using this command:

```shell
npm install knex
```

Lastly, we need to install the `mysql2` node package that Knex will use to connect to MySQL.

```shell
npm install mysql2
```

When we are done with our setup, the `package.json` file should look similar to the following:

```javascript
{
  "name": "knex_demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "knex": "^2.5.1",
    "mysql2": "^3.6.0"
  }
}
```

## Setting Up a Knexfile

When using the CLI, we can set up a file named `knexfile.js` to manage configuration information for different environments. We can have Knex create a `knexfile` that we can modify to fit our needs. To create that file, run the command:

```shell
knex init
```

Now, open `knexfile.js` and update to include your connection information. Here is what mine looks like:

```javascript
// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'mysql2',
    connection: {
      database: 'knex_demo',
      user:     'knex_demo',
      password: 'knexDemo'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'mysql2',
    connection: {
      database: 'knex_demo',
      user:     'knex_demo',
      password: 'knexDemo'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql2',
    connection: {
      database: 'knex_demo',
      user:     'knex_demo',
      password: 'knexDemo'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
```

Note that I use the same database name, username, and password for each environment. In the real world, though, we might use different user names and would absolutely use different passwords for each environment. Something else to look at is the `migrations` configuration block. This includes the name of the database table Knex will use to track changes.

Visit the `knexfile.js` [documentation](https://knexjs.org/guide/migrations.html#knexfile-js) for more information on configuration options.

## Creating a Migration

Now that we have Knex installed and our database connections configured let's create a migration file. We want to add tables containing user information - `user` and `user_type`. To do this, we would use the following command:

```shell
knex migrate:make user_tables
```

This command will do two things.

1. If there is no directory named `migrations`, it will create one.
2. It will create a migration file whose name will begin with timestamp data and end with `user_tables`.

The contents of the new file will look like:

```javascript
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
```

We can see that two functions, named `up` and `down` respectively, are created. When a migration is run, the `up()` function is called. So, inside this function, we would add the code that defines our database changes. The `down()` function is called when we want to roll back the migration. So, inside this function, we would add code that reverses the changes made in `up()`. Each function accepts a single argument named `knex`, an instance of Knex we can use to make API calls to manipulate the database.

### Defining Our Changes

Inside of `up()`, we use the Knex API to define our database changes. To add the tables we need, add the following code to `up()`.

```javascript
return knex.schema
    .createTable('user_type', (table)=>{
        table.increments('id');
        table.string('name', 25).notNullable();
        table.unique(['name'], {indexName: 'user_type_name_idx', useConstraint:true})
    })
    .createTable('user', (table)=>{
        table.increments('id');
        table.string('first_name', 100).notNullable();
        table.string('last_name', 100).notNullable();
        table.string('email', 100).notNullable();
        table.integer('user_type_id').unsigned();
        table.foreign('user_type_id').references('user_type.id');
    })
```

It seems odd that the code starts with a `return` statement, but that is what Knex expects. We also see that there is some method chaining going on.

#### The `user_type` Table

We first call `createTable()` and pass a string, which is the table's name - in this case, `user_type`, and a callback function to define the columns we want in the table. This callback function accepts an instance of the table as an argument.

The first line of code, `table.increments('id');`, defines a column named `id` as an unsigned integer, sets it as the primary key, and makes it an auto-incrementing column.

The following line of code, `table.string('name', 25).notNullable();`, defines a column named `name` as the `varchar` datatype with a length of 25 characters. This also defines the column as not being nullable.

The last line of code in the `user_type` block defines a unique constraint on the `name` column.

#### The `user` Table

After we have finished defining the `user_type` table, we call `createTable()` again to create the `user` table. The first few lines of this definition are similar to what we have seen already, But the fifth line, `table.integer('user_type_id').unsigned();`, uses a different data type. It defines the column named `user_type_id` as an unsigned integer. The last line of code, `table.foreign('user_type_id').references('user_type.id');`, defines a foreign key relationship between the `user_type_id` column and the `id` column of the `user_type` table.

## Defining the Rollback

As I mentioned, in the `down()` function, we add code that will roll back changes made in the `up()` function. If we roll back these migrations for this demo, we want to remove the two tables we created. In an actual project, the code in `down()` may be a lot more complex.

Add the following code to the `down()` method to define our rollback operation.

```javascript
return knex.schema
    .dropTable('user')
    .dropTable('user_type')
```

We can see that we have two calls to `dropTable()` - one to drop the `user` table and one to drop the `user_type` table.

If you feel more comfortable using SQL to handle these operations, you can use the `raw()` method of the `knex` object to execute raw SQL commands. For more information on the API for defining a database schema, check out the `Schema Builder` [documentation](https://knexjs.org/guide/schema-builder.html).

## Running the Migrations

With our database connection configured and our migration defined, let's run it and see what happens. The command to run the latest migrations is:

```shell
knex migrate:latest
```

This command will run any migrations that still need to be run. If this is your first time running migrations, it will also create two tables used to manage migrations.

### Dissecting the Tables

Open up MySQL Shell, connect to the database you created for this demo, and switch to `SQL` mode. Now, run the command:

```sql
show tables;
```

The output from this query should look like this:

```text
+----------------------+
| Tables_in_knex_demo  |
+----------------------+
| knex_migrations      |
| knex_migrations_lock |
| user                 |
| user_type            |
+----------------------+
```

We can see that the tables we defined, `user` and `user_type`, now exist, and there are two other tables, `knex_migrations`, and `knex_migrations_lock`  - these tables are used to handle migrations, and the names are based on the value used in the `migrations` block of `knexfile.js`.

Let's take a look at the `user` table.

```sql
describe `user`;
```

We can see our table definition as below:

```sql
+--------------+--------------+------+-----+---------+----------------+
| Field        | Type         | Null | Key | Default | Extra          |
+--------------+--------------+------+-----+---------+----------------+
| id           | int unsigned | NO   | PRI | NULL    | auto_increment |
| first_name   | varchar(100) | NO   |     | NULL    |                |
| last_name    | varchar(100) | NO   |     | NULL    |                |
| email        | varchar(100) | NO   |     | NULL    |                |
| user_type_id | int unsigned | YES  | MUL | NULL    |                |
+--------------+--------------+------+-----+---------+----------------+
```

Note that `id` is defined as our auto-incrementing primary key, and the other columns are defined based on how we defined them in our migration. We can also see the keys defined in this table by running:

```sql
show keys from `user`\G
```

The results are:

```text
*************************** 1. row ***************************
        Table: user
   Non_unique: 0
     Key_name: PRIMARY
 Seq_in_index: 1
  Column_name: id
    Collation: A
  Cardinality: 0
     Sub_part: NULL
       Packed: NULL
         Null: 
   Index_type: BTREE
      Comment: 
Index_comment: 
      Visible: YES
   Expression: NULL
*************************** 2. row ***************************
        Table: user
   Non_unique: 1
     Key_name: user_user_type_id_foreign
 Seq_in_index: 1
  Column_name: user_type_id
    Collation: A
  Cardinality: 0
     Sub_part: NULL
       Packed: NULL
         Null: YES
   Index_type: BTREE
      Comment: 
Index_comment: 
      Visible: YES
   Expression: NULL
```

We have two keys defined - the primary key and the foreign key pointing to the `user_type.id` column.

Let's take a look at the `user_type` table definition using:

```sql
describe user_type;
```

After running this command, the output will resemble:

```text
+-------+--------------+------+-----+---------+----------------+
| Field | Type         | Null | Key | Default | Extra          |
+-------+--------------+------+-----+---------+----------------+
| id    | int unsigned | NO   | PRI | NULL    | auto_increment |
| name  | varchar(25)  | YES  | UNI | NULL    |                |
+-------+--------------+------+-----+---------+----------------+
```

We can see that the `name` column has a unique constraint defined.

You can run similar commands against the `knex_migrations` tables to learn more about their structure.

For more information about migrations in Knex, see the [documentation](https://knexjs.org/guide/migrations.html).

## Rolling Back Migrations

There may come a time when we need to roll back a migration. To roll back the latest migrations that have been run, use the command:

```shell
knex migrate:rollback
```

Remember, when we defined our `down()` function, we said we wanted to drop the `user` and `user_type` tables? We can see these tables no longer exist in the database by running this SQL command in MySQL Shell:

```sql
show tables;
```

The result will look like the following:

```text
+----------------------+
| Tables_in_knex_demo  |
+----------------------+
| knex_migrations      |
| knex_migrations_lock |
+----------------------+
```

*Before you move forward with the examples below, rerun the migration to create the `user` and `user_type` tables.*

## Seeding Data

We can also use Knex to seed data in our database. This could be handy when running tests or when we must populate a table after it is created. We can create a new seed file with the Knex CLI by running the following command:

```shell
knex seed:make user_data
```

This command will create a directory named `seeds` if one does not exist and a file called `user_data` into that directory. By default, the file will have the following content:

```javascript
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('table_name').del()
  await knex('table_name').insert([
    {id: 1, colName: 'rowValue1'},
    {id: 2, colName: 'rowValue2'},
    {id: 3, colName: 'rowValue3'}
  ]);
};
```

Let's fix the default code before we explain what is going on. Update the `seed()` function, so it looks like the following:

```javascript
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
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

The first two lines will delete all data in the `user` and `user_type` tables. The following command will insert three rows into the `user_type` table. The last command will insert three rows into the `user` table.

The `insert()` method can take an array of JSON objects or a single JSON object as an argument. The keys of the JSON objects must match the names of the columns to which the data will be inserted.

For more information about the Knex `Query Builder`, visit the [documentation](https://knexjs.org/guide/query-builder.html).

### Running the Seed

To run the seed, we use the command:

```shell
knex seed:run
```

This will execute all the files in the `seeds` directory. To check the results, head back over to MySQL Shell and run the query:

```sql
select * from user_type;
```

This will show the user types we added.

```text
+----+---------+
| id | name    |
+----+---------+
|  1 | User    |
|  2 | Admin   |
|  3 | GodMode |
+----+---------+
```

To see the users we added, run this query:

```sql
select * from user;
```

The output will show the users that we added.

```text
+----+------------+-----------+-----------------+--------------+
| id | first_name | last_name | email           | user_type_id |
+----+------------+-----------+-----------------+--------------+
|  1 | Scott      | Stroz     | scott@test.com  |            3 |
|  2 | Fred       | Descamps  | lefred@test.com |            1 |
|  3 | Lenka      | Kasparova | lenka@test.com  |            2 |
+----+------------+-----------+-----------------+--------------+
```

## The Wrap-Up

The most significant advantage of using a library like Knex for managing database migrations is that the migration definition files can be added to version control. Therefore, there is less ramp-up time when a new developer joins the project. It also ensures that all developers are using the same schema. Another significant advantage is that running the migrations can be included in automated testing or continuous integration workflows, so changes will be consistently applied as code gets elevated to different environments.

Happy coding!!

Photo by <a href="https://unsplash.com/@jannerboy62?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Nick Fewings</a> on <a href="https://unsplash.com/photos/J54DjpXYJuE?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  