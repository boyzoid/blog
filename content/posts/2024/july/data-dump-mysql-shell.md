---
title: Advanced Data Dump with MySQL Shell
date: 2024-07-02T06:00:00
image: /assets/images/2024/data-dump-mysql-shell/header.jpg
tags: [ "MySQL", "MySQL-Shell" ]
related:
  - /posts/2024/may/mysql-shell-run-scripts/
  - /posts/2024/may/mysql-shell-system-commands/
  - /posts/2024/may/getting-help-mysql-shell/
  - /posts/2024/june/mysql-shell-sandboxes/
  - /posts/2024/june/server-upgrade-check-mysql-shell/
  - /posts/2024/june/connection-status-mysql-shell/
  - /posts/2024/june/managing-mysql-shell-configuration-options/

---

Over the last few years, I have become quite smitten with [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/). For those who may not be familiar with MySQL Shell, it is a new(ish) command line interface (CLI) for connecting to and managing MySQL instances. During a recent [episode](https://insidemysql.libsyn.com/mysql-shell-does-all-the-things) of [Inside MySQL: Sakila Speaks](https://insidemysql.libsyn.com/), Fred and I talked to Miguel Araujo about many of the helpful (and lesser known) features of MySQL Shell. This post is the eighth in a series about these "hidden gem" features.

## The Problem

There is no 'problem' for this post, but I wanted to keep the formatting I have used for other MySQL Shell Hidden Gems posts. I have also talked about dumping and loading data with MySQL Shell in previous posts, so today, I want to cover some of the options available when dumping data using MySQL Shell.

## The Solution

Once again, not really a 'solution', but I want to stick to the formatting of related posts.

### Dumping Options

First, let's take a look at some of the options we can use when dumping data. We can use these options regardless of the function used (`util.dumpInstance()`, `util.dumpSchemas()`, or `util.dumptables()`). The last (and optional) argument for each function is the options configuration block in JSON format. For example, if we wanted to dump our entire instance with options, we would use a command that resembles:

```shell
util.dumpInstance('/path/to/dump/folder/', {option1: 'option1 value', option2: 'option2 value'})
```

I will discuss only some options, just those I find interesting and helpful.

### Dry Ryn

If we have a database that haas a lot of data, we may want to do a dry run before running the dump to ensure everything will go as expected. To do a dump with this option, we add `dryRun: true`. For example:

```shell
util.dumpInstance('~/dumps/example1', {dryRun:true})
```

When I run this command against my local MySQL instance, I see the following results:

```text
dryRun enabled, no locks will be acquired and no files will be created.
Acquiring global read lock
Global read lock acquired
Initializing - done 
15 out of 19 schemas will be dumped and within them 132 tables, 17 views, 15 routines, 6 triggers.
3 out of 6 users will be dumped.
Gathering information - done 
All transactions have been started
Locking instance for backup
Global read lock has been released
Writing global DDL files
Writing users DDL
Writing DDL - done         
Starting data dump
0% (0 rows / ~735.43K rows), 0.00 rows/s, 0.00 B/s uncompressed, 0.00 B/s compressed
```
First, note that we see a message that no files will be created - which is good because we want to avoid creating files when doing a dry run.

Next, look for the line that tells us how many schemas will be dumped. Note that we are not dumping all the schemas, this is because `util.dumpInstance()` does nto dump any system tables.

The rest of the output details the processes that will take place during the dump. If our data had any issues, we would see them in this output.

### Threading

I have talked about this before, but it bears repeating. MySQL Shell can do multi-threaded dumps. This option makes the process of dumping data faster. By default, MySQL Shell uses four threads. Here is the syntax:

```shell
util.dumpInstance('~/dumps/example2', {threads: 8})
```

The output from this command would resemble the text below.

```text
Acquiring global read lock
Global read lock acquired
Initializing - done 
15 out of 19 schemas will be dumped and within them 132 tables, 17 views, 15 routines, 6 triggers.
3 out of 6 users will be dumped.
Gathering information - done 
All transactions have been started
Locking instance for backup
Global read lock has been released
Writing global DDL files
Writing users DDL
Running data dump using 8 threads.
NOTE: Progress information uses estimated values and may not be accurate.
Writing schema metadata - done         
Writing DDL - done           
Writing table metadata - done           
Starting data dump
1 thds dumping \ 101% (745.78K rows / ~735.44K rows), 0.00 rows/s, 0.00 B/s uncompressed, 0.00 B/s compressed
Dump duration: 00:00:00s
Total duration: 00:00:00s
Schemas dumped: 15
Tables dumped: 132
Uncompressed data size: 144.61 MB
Compressed data size: 14.27 MB
Compression ratio: 10.1
Rows written: 745780
Bytes written: 14.27 MB
Average uncompressed throughput: 144.61 MB/s
Average compressed throughput: 14.27 MB/s
```

The number of threads specified might not be how many are used when dumping data. Fewer threads may be used if there is a limited amount of data or fewer tables. Also, don't think that more threads will always mean better performance. That may not be the case.

### Filtering Dumped Data

If we do not want to dump all our data, we can filter what data is dumped using the `where` option. This option is handy when you want to eliminate older data from a dump or only need or want a subset of the data.

Please take a look at a table dump in my database.

```shell
util.dumpTables('mysql_shorts', ['games'], '~/dumps/example3')
```

This command tells MySQL Shell to dump the entire' games' table in the 'mysql-shorts' schema.

Here is the output from that command.

```text
Acquiring global read lock
Global read lock acquired
Initializing - done 
1 tables and 0 views will be dumped.
Gathering information - done 
All transactions have been started
Locking instance for backup
Global read lock has been released
Writing global DDL files
Running data dump using 4 threads.
NOTE: Progress information uses estimated values and may not be accurate.
Writing schema metadata - done       
Writing DDL - done 
Writing table metadata - done 
Starting data dump
100% (40 rows / ~40 rows), 0.00 rows/s, 0.00 B/s uncompressed, 0.00 B/s compressed
Dump duration: 00:00:00s
Total duration: 00:00:00s
Schemas dumped: 1
Tables dumped: 1
Uncompressed data size: 483 bytes
Compressed data size: 227 bytes
Compression ratio: 2.1
Rows written: 40
Bytes written: 227 bytes
Average uncompressed throughput: 483.00 B/s
Average compressed throughput: 227.00 B/s
```

This output shows that 40 rows were written to the dump.

Here is an example of dumping only the rows in the `games` table where the score was greater than or equal to 90.

```shell
util.dumpTables('mysql_shorts', ['games'], '~/dumps/example4', {where: {"mysql_shorts.games": "score >= 90"}})
```

The `where` option is a JSON object where each key in the object is the name of a column, and the value of that key is the condition we want to use for our filter. Here is the output from that command:

```text
Acquiring global read lock
Global read lock acquired
Initializing - done 
1 tables and 0 views will be dumped.
Gathering information - done 
All transactions have been started
Locking instance for backup
Global read lock has been released
Writing global DDL files
Running data dump using 4 threads.
NOTE: Progress information uses estimated values and may not be accurate.
Writing schema metadata - done       
Writing DDL - done       
Writing table metadata - done 
Starting data dump
35% (14 rows / ~40 rows), 0.00 rows/s, 0.00 B/s uncompressed, 0.00 B/s compressed
Dump duration: 00:00:00s
Total duration: 00:00:00s
Schemas dumped: 1
Tables dumped: 1
Uncompressed data size: 175 bytes
Compressed data size: 115 bytes
Compression ratio: 1.5
Rows written: 14
Bytes written: 115 bytes
Average uncompressed throughput: 175.00 B/s
Average compressed throughput: 115.00 B/s
```

This output shows that only 14 rows were written to the dump.

### Dumping to Oracle Cloud

One of my favorite features of MySQL Shell is the ability to dump to an Oracle Cloud storage bucket. There are several options available to us to take advantage of this feature.

This example assumes you have installed the [OCI CLI](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/cliconcepts.htm).

```shell
util.dumpInstance("example5", {osBucketName:"database_dumps"})
```

Depending on how the OCI CLI is configured on your system, you may also need to include your bucket's `namespace`.

Here is the output from this command.

```text
Acquiring global read lock
Global read lock acquired
Initializing - done 
15 out of 19 schemas will be dumped and within them 132 tables, 17 views, 15 routines, 6 triggers.
3 out of 6 users will be dumped.
Gathering information - done 
All transactions have been started
Locking instance for backup
Global read lock has been released
Writing global DDL files
Writing users DDL
Running data dump using 4 threads.
NOTE: Progress information uses estimated values and may not be accurate.
Writing schema metadata - done         
Writing DDL - done           
Writing table metadata - done           
Starting data dump
101% (745.78K rows / ~735.44K rows), 162.92K rows/s, 31.23 MB/s uncompressed, 3.08 MB/s compressed                 
Dump duration: 00:00:10s
Total duration: 00:00:10s
Schemas dumped: 15
Tables dumped: 132
Uncompressed data size: 144.61 MB
Compressed data size: 14.27 MB
Compression ratio: 10.1
Rows written: 745780
Bytes written: 14.27 MB
Average uncompressed throughput: 14.39 MB/s
Average compressed throughput: 1.42 MB/s
```

This image shows the files we created in the `database_dumps` bucket in my OCI account.

![Oracle Cloud Storgae Bucket File List](/assets/images/2024/data-dump-mysql-shell/img_01.png)

### Ensuring HeatWave Compatability

If we are going to load our data into a HeatWave MySQL instance, we need to ensure that there are no issues with our database and table structure. We use the `ocimds` options to enable these compatibility checks.

```shell
util.dumpSchemas(['mysql_shorts'], '~/dumps/example6', {ocimds:true})
```

If you have no compatability issues, the dump will proceed as usual. If you do have compatability issues, your output may look like the following:


```text
Acquiring global read lock
Global read lock acquired
Initializing - done 
1 schemas will be dumped and within them 24 tables, 0 views, 2 routines.
Gathering information - done 
All transactions have been started
Locking instance for backup
Global read lock has been released
NOTE: When migrating to MySQL HeatWave Service, please always use the latest available version of MySQL Shell.
Checking for compatibility with MySQL HeatWave Service 9.0.0
Checking for potential upgrade issues.
NOTE: The value of 'targetVersion' option (9.0.0) is not greater than current version of the server (9.0.0), skipping upgrade compatibility checks
NOTE: Database `mysql_shorts` had unsupported ENCRYPTION option commented out
WARNING: One or more DDL statements contain DEFINER clause but user information is not included in the dump. Loading will fail if accounts set as definers do not already exist in the target DB System instance.
WARNING: Function `mysql_shorts`.`multiply_ints` - definition uses DEFINER clause set to user `scott`@`localhost` which can only be executed by this user or a user with SET_ANY_DEFINER, SET_USER_ID or SUPER privileges
WARNING: Function `mysql_shorts`.`multiply_ints` - definition does not use SQL SECURITY INVOKER characteristic, which is mandatory when the DEFINER clause is omitted or removed
WARNING: Procedure `mysql_shorts`.`job_title_count` - definition uses DEFINER clause set to user `scott`@`localhost` which can only be executed by this user or a user with SET_ANY_DEFINER, SET_USER_ID or SUPER privileges
WARNING: Procedure `mysql_shorts`.`job_title_count` - definition does not use SQL SECURITY INVOKER characteristic, which is mandatory when the DEFINER clause is omitted or removed
ERROR: Table `mysql_shorts`.`user_2` does not have a Primary Key, which is required for High Availability in MySQL HeatWave Service
ERROR: Table `mysql_shorts`.`games` does not have a Primary Key, which is required for High Availability in MySQL HeatWave Service

NOTE: One or more objects with the DEFINER clause were found.

      The 'targetVersion' option was not set and compatibility was checked with the MySQL HeatWave Service 9.0.0.
      Loading the dump will fail if it is loaded into an DB System instance that does not support the SET_ANY_DEFINER privilege, which was introduced in 8.2.0.


ERROR: One or more tables without Primary Keys were found.

       MySQL HeatWave Service High Availability (MySQL HeatWave Service HA) requires Primary Keys to be present in all tables.
       To continue with the dump you must do one of the following:

       * Create PRIMARY keys (regular or invisible) in all tables before dumping them.
         MySQL 8.0.23 supports the creation of invisible columns to allow creating Primary Key columns with no impact to applications. For more details, see https://dev.mysql.com/doc/refman/en/invisible-columns.html.
         This is considered a best practice for both performance and usability and will work seamlessly with MySQL HeatWave Service.

       * Add the "create_invisible_pks" to the "compatibility" option.
         The dump will proceed and loader will automatically add Primary Keys to tables that don't have them when loading into MySQL HeatWave Service.
         This will make it possible to enable HA in MySQL HeatWave Service without application impact and without changes to the source database.
         Inbound Replication into a DB System HA instance will also be possible, as long as the instance has version 8.0.32 or newer. For more information, see https://docs.oracle.com/en-us/iaas/mysql-database/doc/creating-replication-channel.html.

       * Add the "ignore_missing_pks" to the "compatibility" option.
         This will disable this check and the dump will be produced normally, Primary Keys will not be added automatically.
         It will not be possible to load the dump in an HA enabled DB System instance.

Compatibility issues with MySQL HeatWave Service 9.0.0 were found. Please use the 'compatibility' option to apply compatibility adaptations to the dumped DDL.
Validating MySQL HeatWave Service compatibility - done        
Util.dumpSchemas: While 'Validating MySQL HeatWave Service compatibility': Compatibility issues were found (MYSQLSH 52004)
```

This output references several different issues, including issues with `DEFINER` clauses, missing primary keys, and missing `SQL SECURITY INVOKER` when defining some stored programs. Fortunately, the output gives us suggestions on how to ensure compatibility. Some suggestions include changing the DDL or adding the `compatibility` option.

Using these suggestions, we can rewrite our command using the `compatibility` option.

```shell
util.dumpSchemas(['mysql_shorts'], '~/dumps/example6', {ocimds:true, compatibility:['create_invisible_pks', 'strip_definers']})
```

The output form this command shows the following:

```text
NOTE: The 'targetVersion' option is set to 9.0.0. This version supports the SET_ANY_DEFINER privilege, using the 'strip_definers' compatibility option is unnecessary.
Acquiring global read lock
Global read lock acquired
Initializing - done 
1 schemas will be dumped and within them 24 tables, 0 views, 2 routines.
Gathering information - done 
All transactions have been started
Locking instance for backup
Global read lock has been released
NOTE: When migrating to MySQL HeatWave Service, please always use the latest available version of MySQL Shell.
Checking for compatibility with MySQL HeatWave Service 9.0.0
Checking for potential upgrade issues.
NOTE: The value of 'targetVersion' option (9.0.0) is not greater than current version of the server (9.0.0), skipping upgrade compatibility checks
NOTE: Database `mysql_shorts` had unsupported ENCRYPTION option commented out
NOTE: Function `mysql_shorts`.`multiply_ints` had definer clause removed
NOTE: Function `mysql_shorts`.`multiply_ints` had SQL SECURITY characteristic set to INVOKER
NOTE: Procedure `mysql_shorts`.`job_title_count` had definer clause removed
NOTE: Procedure `mysql_shorts`.`job_title_count` had SQL SECURITY characteristic set to INVOKER
NOTE: Table `mysql_shorts`.`user_2` does not have a Primary Key, this will be fixed when the dump is loaded
NOTE: Table `mysql_shorts`.`games` does not have a Primary Key, this will be fixed when the dump is loaded

NOTE: One or more tables without Primary Keys were found.

      Missing Primary Keys will be created automatically when this dump is loaded.
      This will make it possible to enable High Availability in MySQL HeatWave Service DB System instance without application impact and without changes to the source database.
      Inbound Replication into a DB System HA instance will also be possible, as long as the instance has version 8.0.32 or newer. For more information, see https://docs.oracle.com/en-us/iaas/mysql-database/doc/creating-replication-channel.html.

Compatibility issues with MySQL HeatWave Service 9.0.0 were found and repaired. Please review the changes made before loading them.
Validating MySQL HeatWave Service compatibility - done        
Writing global DDL files
Running data dump using 4 threads.
NOTE: Progress information uses estimated values and may not be accurate.
Writing schema metadata - done       
Writing DDL - done 
Writing table metadata - done 
Starting data dump
100% (212.40K rows / ~210.74K rows), 0.00 rows/s, 0.00 B/s uncompressed, 0.00 B/s compressed
Dump duration: 00:00:00s
Total duration: 00:00:00s
Schemas dumped: 1
Tables dumped: 24
Uncompressed data size: 25.69 MB
Compressed data size: 3.12 MB
Compression ratio: 8.2
Rows written: 212395
Bytes written: 3.12 MB
Average uncompressed throughput: 25.69 MB/s
Average compressed throughput: 3.12 MB/s
```

This output shows what changes will be made to the schemas when the dump is created. These changes include adding invisble primary keys to several tables, removing the definer from some objects, and setting the `SQl SECURITY characteristic` to `INVOKER` on others.

By setting these configuration options, we ensure that compatibility will be maintained when we load this data into a HeatWave MySQL instance.

## Wrap Up

The utilities in MySQL Shell for dumping data from a MySQL database are an excellent combination of ease and power. We can use options to limit the data we want to dump, specify an OCU bucket to dump the data into, ensure HeatWave compatibility, and perform a dry run of our dump process. Check out the [MySQL Shell Dump Documentation](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-dump-instance-schema.html) to learn more about the different dump commands and other options available in MySQL Shell.

Photo by <a href="https://unsplash.com/@michaelfousert?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Michael Fousert</a> on <a href="https://unsplash.com/photos/yellow-and-black-truck-toy-Kv2hu25Rx2s?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  