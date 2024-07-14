---
title: Database Migrations with Lucid ORM
date: 2024-07-12T06:00:00
image: 2024/database-migrations-with-lucid/header.jpg
tags: ["AdonisJs", "Lucid"]
series: golf-league-rewrite
description: Performing database migrations with Lucid.

---

I am rewriting an old web application to use [AdonisJS](https://adonisjs.com/). In my [last post](/posts/2024/july/hello-adonis/), I discussed some features of AdonisJS and initialized a new application. In today's post, I will discuss my first foray into using database migrations with [Lucid ORM](https://lucid.adonisjs.com/docs/introduction).

## The Problem

Over the years, as I added new features or needed to accommodate new rules, I often had to make database changes that were less than ideal or overly complex. With this rewrite, I will correct some of those issues and move the data to a new database. With 15+ years of data, this could be a daunting task, but I am sure I can make it work.

## The Solution

Fortunately, Lucid ORM, a project built on top of Knex and managed by the AdonisJS group, offers database migrations. Database migrations are a process of tracking and managing database changes. In the new application, these will be written in TypeScript and managed via the command line.

## Creating a Migration

In my application, the top-level object is a `league`. Almost every bit of data is tied to a league in one way or another. This table seemed like a logical place to start, not only because I can't do anything else without a league but because the `league` table is pretty simple.

This brings us to the first 'What was I thinking?' moment. When I started writing the application, I had not thought of any other league using the software. However, I had a few people reach out to me about using the software for their leagues. I had columns in the database to the file location of a header graphic because I (incorrectly) thought it would be a good idea for each league to have its look and feel - including a header graphic (News Flash: It wasn't). Each league could also have its own domain (and domain used for development) - which was also stored in the database. Because each league could have its own look and feel, I also stored the name of the CSS file to use for the league.

I have decided to eliminate the ability for each league to style its own site. It was difficult to set up and even more difficult to manage. So, the `league` table is getting pared down to just a few columns: `id`, `name`, `enabled`, `created_at`, `updated_at`, and `current_season_id`.

To create a migration, we use a command with the following syntax:

```shell
node ace make:migration {table name}
```

The command to create the `league` table is:

```shell
node ace make:migration league
```

This command will create a file in the `database/migrations` folder at the root of the project. The file name will include a timestamp with the table's name. Here is the file that was created for my `league` table.

![File structure of a database migration]({{ "2024/database-migrations-with-lucid/img_01.png" | imgurl }})

### Knicker Twisting Time

In my [first post](/posts/2024/july/hello-adonis/#hello%2C-adonisjs!), I pointed out that AdonisJS considers itself to be 'opinionated', and sometimes this got my knickers in a twist. Well, creating the migration file was the first time that happened.

Can you see what caused me such angst? Look again...

![File structure of a database migration]({{ "2024/database-migrations-with-lucid/img_01.png" | imgurl }})

I used `league` in the command, but the file name includes `leagues`.

Now, people prefer to name things in different ways - not just in databases, but variables, functions, etc. I like singular table names, but others prefer plural ones. What I don't get is why the AdonisJS folks went out of their way to force people to use plural names for database objects (as we will see shortly, it is not just in the file name this is done).

At the very least, this command should have used the name I gave it and not changed it. For model objects, there is a way you can specify a naming strategy (more on that in a future post), but I could not find a way to force migrations to use the singular form instead of the plural form. This forced naming strategy bothered me so much that I almost abandoned using AdonisJS. After some soul-searching, I realized it was not that big of a deal and easily corrected it.

## Migration File Content

When we open a newly created migration file, we will see the following code:

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
protected tableName = 'leagues'

async up() {
this.schema.createTable(this.tableName, (table) => {
table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
}

async down() {
this.schema.dropTable(this.tableName)
}
}
```

Lets breakdown this file a little bit at a time.

First, this part made me all twitchy...

```typescript
protected tableName = 'leagues'
```

As you can see, AdonisJS took it upon itself to change the table's name to the plural version. It was easy enough to change it to the singular form.

Next, we see a function named `up()`.

```typescript
 async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }
```

This function defines the table using Lucid's [schema builder API](https://lucid.adonisjs.com/docs/schema-builder). As we can see, it creates three columns for us - `id`, `created_at`, and `updated_at`. To define the table structure I want for the new `league` table, I modify this function to look like the following:

```typescript
 async up() {
    this.schema.createTable(this.tableName, (table) => {
        table.increments('id')
        table.string('name', 50).notNullable()
        table.boolean('enabled').defaultTo(true)
        table.timestamps(true, true)
    })
  }
```

We added two columns, `name` and `enabled`. The `name` column will be a `varchar(50)` and not nullable. The `enabled` column will be created as a `tinyint(1)` data type and default to `true`.

We also added a shortcut for specifying the `created_at` and `updated_at` columns. These two columns will be created using `table.timestamps()`. Making the first argument `true` will use the data type `timestamp` instead of `datetime`. Using `true` for the second argument will set the default value of each of these columns to `CURRENT_TIMESTAMP`.

The second function on this page is called `down()`. The generated code includes a call to drop the table. For now, we do not need to change this function.

```typescript
public async down () {
this.schema.dropTable(this.tableName)
}
```

## Running a Migration

To run this migration, we use the command:

```shell
node ace migration:run
```

When we run migrations, the code in the `up()` function is executed.

The output from this command will resemble:

```text
[ info ] Upgrading migrations version from "1" to "2"
❯ migrated database/migrations/1720368972662_create_leagues_table

Migrated in 123 ms
```

If we look at our database structure, we will see that there are now three tables:

![Database structure]({{ "2024/database-migrations-with-lucid/img_02.png" | imgurl }})

Lucid uses two of the created tables to track what migrations have been run and what version the schema is at.

Look at the structure of the `league` table and see how the columns match up to our code above.

Since defining the `league` table was relatively easy, I decided to also add a migration for the `season` table. Each league can have multiple seasons, each with its own set of rules and configuration data.

Here are the contents of the migration file for the `season` table.

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'season'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50).notNullable()
      table.text('rules')
      table.integer('league_id').unsigned().notNullable().references('id').inTable('league').onDelete('CASCADE')
      table.date('start_date')
      table.boolean('rules_published').defaultTo(false)
      table.integer('scoring_id').notNullable()
      table.boolean('registration_open').notNullable()
      table.string('registration_token', 50).notNullable()
      table.boolean('is_current_season').defaultTo(false)
      table.json('settings').notNullable()
      table.timestamps(true, true)
    })
    this.schema.alterTable('league', (table) =>{
      table.integer('current_season_id').unsigned().references('id').inTable('season')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
```

In the `up()` function, we created the `season` table, but we also added a new column named `current_season_id` to the `league` table and defined a foreign key relation to the `id` column of the `season` table.

## Rolling Back Migrations

There may come a time when you need to roll back a migration. When we roll back a migration, the code in the `down()` function is executed. To roll back the latest batch of changes, we would run the command:

```shell
node ace migration:rollback
```

You may want to avoid rolling back migrations in production as they might have unwanted effects. For example, we are dropping the table in the `down()` function for our `league` table. We can all agree that dropping tables in production is not a very good idea. 


## Wrap Up

Database migrations are a powerful tool for developers to track and manage database schema changes. Lucid ORM uses APIs to allow us to create tables and define columns - including foreign key relationships. If you head on over to the [Lucid ORM documentation](https://lucid.adonisjs.com/docs/introduction) you can find more detailed information about [migrations](https://lucid.adonisjs.com/docs/migrations) and the [schema builder](https://lucid.adonisjs.com/docs/schema-builder) and [table builder](https://lucid.adonisjs.com/docs/table-builder) APIs.