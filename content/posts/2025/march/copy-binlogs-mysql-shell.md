---
title: Doing a 'Incremental' Dump With MySQL Shell
date: 2025-03-27T06:00:00
image: 2025/copy-binlogs-mysql-shell/header.jpg
tags: [ "MySQL", "MySQL-Shell" ]
series: mysql-shell-gems
description: Using MySQL shell, we can perform what can be considered an incremental dump of our data. This post will show you how to do this.
---

In previous posts, I discussed how to use [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) to [dump](/posts/2024/july/data-dump-mysql-shell/) and [load](/posts/2024/july/data-load-mysql-shell/) data using a multithreaded process. When using `util.dumpInstance()`, we create a dump of all the data and schema changes, even those that have already been dumped previously. But what if we only want to dump the data and schema changes that have occurred since the last dump? In this post, we will demonstrate how to use MySQL Shell and `util.dumpBinlogs()` to achieve this.

## The Setup

For this demo, I created two [MySQL Sandboxes](/posts/2024/june/mysql-shell-sandboxes) running on ports 2319 and 2320. I ran the following commands on the instance running on port 2319 to create a new schema and table and added some data to the table.

```sql

create schema demo;

create table demo.progress
(
    id    int auto_increment
        primary key,
    name  varchar(50) not null,
    score int         not null
);

insert into demo.progress(name, score)
values('Sullivan', 99479),
      ('Randall', 99351),
      ('Sanderson', 58986);
```
As we can see, this is a basic table with just three columns.

After executing these scripts, I ran `util.dumpInstance('~/dumps/binlog_setup)` which saved the dump to the `dumps/binlog_setup` directory under my home folder.

I switched the sandbox instance on port 2320 and executed `util.loadDump('~/dumps/binlog_setup')` to load the dump into this sandbox.

Both instances are now in sync.

In MySQL systems with large datasets or complex schemas, moving data from one instance to another can be time-consuming.

## Adding Data & Schema Changes

Let's make some data and schema changes to the instance running on port 2319.

```sql
insert into demo.progress(name, score)
values('Lucky', 68245),
      ('Peterson', 67236);

create schema demo2
```

## Dumping the Binlogs

Now that we have changed our data and schema, we can dump the binlogs using `util.dumpBinlogs()`. Here is the syntax we can use.

```shell
util.dumpBinlogs('~/dumps/binlog_dump', {since:'~/dumps/binlog_setup'})
```

This command tells MySQL Shell to dump the binlogs to the `dumps/binlog_dump` directory under my home folder. The `since` option tells MySQL Shell to only dump the binlogs that have occurred since the last dump. In this case, the last dump was saved in the `dumps/binlog_setup` directory. This location is the dump that was created when I ran `util.dumpInstance('~/dumps/binlog_setup)`. The value of `since` can be the result of a previous call to `util.dumpInstance()` or `util.dumpBinlogs()`.

## Loading the Binlogs

With our changes dumped, we can now load the binlogs into the instance running on port 2320. Here is the syntax we can use.

```shell
util.loadBinlogs('~/dumps/binlog_dump', {ignoreGtidGap:true})
```

This command tells MySQL Shell to load the binlogs from the `dumps/binlog_dump` directory under my home folder. The `ignoreGtidGap` option tells MySQL Shell to ignore any GTID gaps between the source and target instances. I am unsure why I was getting an error about gaps in the GTID sequence (that may be a post for another day), but using this option allowed me to get past that issue.

## Checking For Changes

With the binlogs loaded, we can now check that the data and schema changes were applied correctly. First, let's check the schema changes by running the following command.

```sql
show schemas;
```

The results should resemble the text below.

```text
+--------------------+
| Database           |
+--------------------+
| demo               |
| demo2              |
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
```

Notice how `demo2` is now listed as a schema.

Next, running the following command will check that our data changes were applied correctly.

```sql
select * from demo.progress;
```

The query result indicates that the records for Lucky and Peterson have been successfully added to the table.

```text
+----+-----------+-------+
| id | name      | score |
+----+-----------+-------+
|  1 | Sullivan  | 99479 |
|  2 | Randall   | 99351 |
|  3 | Sanderson | 58986 |
|  4 | Luckey    | 68245 |
|  5 | Peterson  | 67236 |
+----+-----------+-------+
```

## Wrap Up

MySQL Shell is a powerful tool that enables us to quickly dump and load data. When we use `util.dumpInstance()` and `util.loadInstance()`, we dump and load all data and schema changes, even if they have been previously dumped. In contrast, when we use `util.dumpBinlogs()` and `util.loadBinlogs()`, we can perform an incremental dump of our data. This approach is particularly useful for managing large datasets or complex database schemas, allowing us to apply changes more efficiently and with less overhead.

Photo by <a href="https://unsplash.com/@tcdinger?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Timo C. Dinger</a> on <a href="https://unsplash.com/photos/brown-and-black-wood-logs-Oo3L5fL1lBU?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>