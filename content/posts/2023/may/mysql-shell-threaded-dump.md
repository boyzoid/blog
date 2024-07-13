---
title: Multithreaded Data Dumps With MySQL Shell
date: 2023-05-22T06:00:00
image: 2023/mysql-shell-threaded-dump/header.jpeg
tags: [ "MySQL", "MySQL-Shell" ]

---

[MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) is a powerful command line interface for connecting to and managing [MySQL](https://www.mysql.com/) instances. One feature of MySQL Shell's [Admin API]() is being able to dump specific tables (or a subset of data in a table), dump one or more complete schemas, or dump an entire database instance and then restore those dumps as needed. It has the added benefit of doing this in a multithreaded process to make it more efficient.

***NOTE:*** To follow along with these demos, you will need to have [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-install.html) installed.

## Dump/Load Methods

For years, you could only dump data from a database using `mysqldump`.
With the [util](https://dev.mysql.com/doc/dev/mysqlsh-api-javascript/8.0/group__util.html) object in MySQL Shell, we have three different ways we can dump data.
* Dump individual tables (or a subset of data from those tables) using `util.dumpTables()`
* Dump one or more entire schemas using `util.dumpSchemas()`
* Dump the entire database instance using `util.dumpInstance()`

### Dump Table Data

First, Let's take the more granular option and show some examples of using `util.dumpTables()`.
The syntax for dumping tables is

```shell
util.dumpTables(schema, tables, outputUrl[, options])
```
Where `schema` is the schema where our tables reside, `tables` is an array of table names we want to dump, `outputUrl` is the path to where the dump files will be exported, and `options` is the optional configuration data about the dump.

We can dump a single table using this example:

```shell
util.dumpTables('sakila', ['actor'], '~/sakila-table-dump')
```

In this example, we are dumping all the rows from the `actor` table in the `sakila` schema to a folder named `sakila-table-dump` in our user's root directory.

After we run this command, we will see information in the console about the dump.

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
100% (200 rows / ~200 rows), 0.00 rows/s, 0.00 B/s uncompressed, 0.00 B/s compressed
Dump duration: 00:00:00s                                                            
Total duration: 00:00:00s                                                           
Schemas dumped: 1                                                                   
Tables dumped: 1                                                                    
Uncompressed data size: 7.40 KB                                                     
Compressed data size: 1.91 KB                                                       
Compression ratio: 3.9                                                              
Rows written: 200                                                                   
Bytes written: 1.91 KB                                                              
Average uncompressed throughput: 7.40 KB/s                                          
Average compressed throughput: 1.91 KB/s  
```
If we look in the directory we specified, we will see files that look like the following image:

![Table Dump FIles](/assets/images/2023/mysql-shell-threaded-dump/img_01.png "Table dump files")

Whenever we dump data, by default, MySQL Shell will use four threads to perform the action.
If we want to use 8 threads, we will use the following call:

```shell
util.dumpTables('sakila', ['actor'], '~/sakila-table-dump', {threads: 8})
```

Another option we can use when using `util.dumpTables()` is defining what data we want to dump.
This filtering can be accomplished using the `where` property of the options JSON object.
In this example, we are dumping data from the `film` table, but only films with a title that begins with the letter 'A'.

```shell
util.dumpTables('sakila', ['film'], '~/sakila-table-dump', {where: {"sakila.film":"title like 'A%'"}})
```

The directory we specify for the output of our dump needs to be empty.
If it is not, you will receive an error similar to:

```text
Util.dumpTables: Cannot proceed with the dump, the specified directory '~/sakila-table-dump' already exists at the target location ~/sakila-table-dump and is not empty. (ArgumentError)
```

### Load Table Data

Regardless of whether we use `util.dumpTables()`, `util.dumpSchemas()`, or `util.dumpInstance()` to dump our database data, we use `util.loadDump()` to load that data into a database.
The arguments we pass are slightly different depending on how the data was dumped.

To load the data from any of the examples above, we use the following command:

```shell
util.loadDump('~/sakila-table-dump', {schema: 'sakila-2', threads:8})
```

This command will load the data into a new schema named `sakila-2` and use 8 threads to complete the process.
If the specified schema does not exist, it will be created when the data is loaded.
If the table already exists in the specified schema, you will see an error similar to the message below:

```text
Loading DDL and Data from '~/sakila-table-dump' using 8 threads.
Opening dump...
Target is MySQL 8.0.33. Dump was produced from MySQL 8.0.33
Scanning metadata - done       
Checking for pre-existing objects...
ERROR: Schema `sakila-2` already contains a table named film
ERROR: One or more objects in the dump already exist in the destination database. You must either DROP these objects or exclude them from the load.
Util.loadDump: While 'Scanning metadata': Duplicate objects found in destination database (MYSQLSH 53021)
```
### Dump Schema Data

We can also dump one or more schemas simultaneously using `util.dumpSchemas()`.
The arguments are similar to what we used above.

```shell
util.dumpSchemas(schemas, outputUrl[, options])
```

`Schemas` is an array of schemas to include in the dump, `outpurUrl` is the path to the folder where the files will be output, and `options` is an optional argument of configuration information about the dump.

To dump the entire `sakila` schema, we would use this command:

```shell
util.dumpSchemas(['sakila'], '~/sakila-schema-dump', {threads: 8})
```

When the command finishes, we will see information similar to the following:

```text
Acquiring global read lock
Global read lock acquired
Initializing - done 
1 schemas will be dumped and within them 16 tables, 7 views, 6 routines, 6 triggers.
Gathering information - done 
All transactions have been started
Locking instance for backup
Global read lock has been released
Writing global DDL files
Running data dump using 8 threads.
NOTE: Progress information uses estimated values and may not be accurate.
Writing schema metadata - done       
Writing DDL - done         
Writing table metadata - done         
Starting data dump
101% (47.27K rows / ~46.41K rows), 0.00 rows/s, 0.00 B/s uncompressed, 0.00 B/s compressed
Dump duration: 00:00:00s                                                                  
Total duration: 00:00:00s                                                                 
Schemas dumped: 1                                                                         
Tables dumped: 16                                                                         
Uncompressed data size: 3.03 MB                                                           
Compressed data size: 715.34 KB                                                           
Compression ratio: 4.2                                                                    
Rows written: 47268                                                                       
Bytes written: 715.34 KB                                                                  
Average uncompressed throughput: 3.03 MB/s                                                
Average compressed throughput: 715.34 KB/s 
```

### Load Schema Data

We would use the following call `util.loadDump()` to load our schema dump to a new schema.

```shell
util.loadDump('~/sakila-schema-dump', {schema: 'sakila-3', threads: 8})
```

In this example, we are loading the dump into the same MySQL instance as the original schema.
If we are loading the data into a different instance, we can leave off `{schema: 'sakila-3'}` and the data will be loaded into a schema with the same name as the source schema.

### Dumping Multiple Schemas

If we want to dump multiple schemas, we will use a command similar to:

```shell
util.dumpSchemas(['sakila', 'test-schema'], '~/multi-schema-dump', {threasds: 8})
```

We see output that looks like the text below.

```text
Acquiring global read lock
Global read lock acquired
Initializing - done 
2 schemas will be dumped and within them 18 tables, 7 views, 6 routines, 6 triggers.
Gathering information - done 
All transactions have been started
Locking instance for backup
Global read lock has been released
Writing global DDL files
Running data dump using 8 threads.
NOTE: Progress information uses estimated values and may not be accurate.
Writing schema metadata - done       
Writing DDL - done         
Writing table metadata - done         
Starting data dump
8 thds chunking, 0 dumping - 0% (0 rows / ~46.41K rows), 0.00 rows/s, 0.00 B/s uncompressed, 0.00 B/s co6 thds chunking, 0 dumping - 101% (47.27K rows / ~46.41K rows), 0.00 rows/s, 0.00 B/s uncompressed, 0.00                                                                                                        101% (47.27K rows / ~46.41K rows), 0.00 rows/s, 0.00 B/s uncompressed, 0.00 B/s compressed
Dump duration: 00:00:01s                                                                  
Total duration: 00:00:01s                                                                 
Schemas dumped: 2                                                                         
Tables dumped: 18                                                                         
Uncompressed data size: 3.03 MB                                                           
Compressed data size: 715.89 KB                                                           
Compression ratio: 4.2                                                                    
Rows written: 47270                                                                       
Bytes written: 715.89 KB                                                                  
Average uncompressed throughput: 1.81 MB/s                                                
Average compressed throughput: 427.61 KB/s    
```

### Loading Multiple Schemas

To load the data from a multi-schema dump, we would use a command similar to this:

```shell
util.loadDump('~/multi-schema-dump')
```

The `schema` option is only available when loading data from a single schema.
We need to ensure that the target instance does not have the same schemas or tables in those schemas.
If there are duplicates, this process will throw an error.
When the load completes successfully, the output will resemble the following:

```text
Opening dump...
Target is MySQL 8.0.33. Dump was produced from MySQL 8.0.33
NOTE: Load progress file detected. Load will be resumed from where it was left, assuming no external updates were made.
You may enable the 'resetProgress' option to discard progress for this MySQL instance and force it to be completely reloaded.
Scanning metadata - done       
Executing common preamble SQL
NOTE: [Worker003] Error processing table `sakila`.`staff`, will retry after delay: MySQL Error 1213 (40001): Deadlock found when trying to get lock; try restarting transaction
Executing DDL - done         
Executing view DDL - done       
Starting data load
1 thds indexing / 100% (3.03 MB / 3.03 MB), 0.00 B/s, 63 / 63 tables and partitions done
Executing common postamble SQL                                                          
Recreating indexes - done       
63 chunks (47.27K rows, 3.03 MB) for 18 tables in 2 schemas were loaded in 1 sec (avg throughput 3.03 MB/s)
0 warnings were reported during the load.
```

### Dump Instance Data

If we need to dump every schema on a MySQL instance, we could list them all in a call to `util.dumpSchemas()`.
But, an easier way to accomplish this is with `util.dumpInstance()`.
This method will dump all the schemas on an instance, but it will **NOT** include the MySQL system tables (`information_schema`, `performance_schema`, etc.).

To dump all the schemas in an instance, we would use something akin to:

```shell
util.dumpInstance('~/instance-dump', {threads:8})
```

The output for running this command on my local instance of MySQL is:

```text
Acquiring global read lock
Global read lock acquired
Initializing - done 
9 out of 13 schemas will be dumped and within them 88 tables, 14 views, 14 routines, 12 triggers.
5 out of 8 users will be dumped.
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
3 thds dumping - 78% (384.72K rows / ~488.91K rows), 0.00 rows/s, 0.00 B/s uncompressed, 0.00 B/s compre                                                                                                        
100% (493.67K rows / ~488.91K rows), 0.00 rows/s, 0.00 B/s uncompressed, 0.00 B/s compressed
Dump duration: 00:00:03s                                                                    
Total duration: 00:00:03s                                                                   
Schemas dumped: 9                                                                           
Tables dumped: 88                                                                           
Uncompressed data size: 89.97 MB                                                            
Compressed data size: 12.54 MB                                                              
Compression ratio: 7.2                                                                      
Rows written: 493666                                                                        
Bytes written: 12.54 MB                                                                     
Average uncompressed throughput: 24.97 MB/s                                                 
Average compressed throughput: 3.48 MB/s       
```

To load this data into another instance of MySQL, we run the command:

```shell
util.loadDump('~/instance-dump', {threads: 8})
```

Running this command to load the dump from my local instance shows the following messages:

```text
Loading DDL and Data from '~/instance-dump' using 8 threads.
Opening dump...
Target is MySQL 8.0.33. Dump was produced from MySQL 8.0.33
NOTE: Load progress file detected. Load will be resumed from where it was left, assuming no external updates were made.
You may enable the 'resetProgress' option to discard progress for this MySQL instance and force it to be completely reloaded.
Scanning metadata - done       
Executing common preamble SQL
NOTE: [Worker005] Error processing table `sakila-3`.`staff`, will retry after delay: MySQL Error 1213 (40001): Deadlock found when trying to get lock; try restarting transaction
Executing DDL - done           
Executing view DDL - done       
Starting data load
2 thds loading - 3 thds indexing / 99% (89.97 MB / 89.97 MB), 29.66 MB/s, 131 / 133 tables and partition 
Executing common postamble SQL                                                              
100% (89.97 MB / 89.97 MB), 29.66 MB/s, 133 / 133 tables and partitions done                
Recreating indexes - done 
136 chunks (493.67K rows, 89.97 MB) for 88 tables in 9 schemas were loaded in 4 sec (avg throughput 26.31 MB/s)
0 warnings were reported during the load.
```

## Dump/Load Options

Besides the options we discussed, there are quite a few that help us tailor the dumping and loading of data.
Perhaps the most intriguing options are ones that allow us to dump and load data directly to an [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) (OCI) storage bucket, an Amazon AWS S3 compatible service, or Microsoft Azure Blob Storage.
For more information about these options and others, check out the documentation at the links below.

* [MySQL Shell Dump Utiliyt](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-dump-instance-schema.html)
* [MySQL Shell Load Utility](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-load-dump.html)

## The Wrap-Up

Using a multithreaded process, MySQL Shell allows us to dump and load data faster than `mysqldump`.
The data dump and load utilities give us options to be very granular in the data we dump and load.
These options also allow us to dump data to and load data from multiple cloud platforms.

Photo by <a href="https://unsplash.com/@hjrc33?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Héctor J. Rivas</a> on <a href="https://unsplash.com/photos/Nh6NsnqYVsI?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
