---
title: Copy Data Directly To A MySQL Instance With MySQL Shell
date: 2024-08-01T06:00:00
image: 2024/copy-data-mysql-shell/header2.jpg
tags: [ "MySQL", "MySQL-Shell" ]
series: mysql-shell-gems
description: Using MySQL shell, we can copy tables, schemas, or an entire instance to a new MySQL instance.
---

In previous posts, I talked about how we can use [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) to [dump](/posts/2024/july/data-dump-mysql-shell/) and [load](/posts/2024/july/data-load-mysql-shell/) data using a multithreaded process and also how to [export table data](/posts/2024/july/mysql-shell-table-export/) in different formats that can then be imported to a new MySQL instance. This post will discuss how we can copy data directly to another MySQL instance without performing separate dump and load operations.

## The Setup

Before starting this demo, I created three new sandbox instances (on ports 4444, 4445, and 4446) using the process outlined in [this post](/posts/2024/mysql-shell-sandboxes/). After each sandbox instance was created, I connected to each of them and ran the following SQL command:

```sql
set global local_infile = 'ON';
```

If we do not set `local_infile` to `ON`, we cannot move our data.

## Copying Table Data

If we only need to copy a few tables, we would use the `util.copyTables()` method. This method takes four arguments.

1. The name of the schema from which tables will be copied.
2. A list of tables from the schema we wish to copy.
3. The connection information for the new MySQL instance.
4. An options JSON object.

The fourth argument is optional, and we won't discuss any options in this post. For more information about the available options, head on over to the [documentation](https://dev.mysql.com/doc/mysql-shell/9.0/en/mysql-shell-utils-copy.html#mysql-shell-utilities-copy-opt-control).

For this example, I am using the following command:

```shell
util.copyTables('mysql_shorts', ['ipsum'], 'root@localhost:4444')
```

This command specifies that we are copying the `ipsum` table in the `mysql_shorts` schema to a new instance running on port 4444 on my local machine. If we wanted to copy more than one table, we would add more table names to the array, which is the second argument.

When I run this command, I see the following output in the console:

```text
Copying DDL and Data from in-memory FS, source: sstroz-mac:3306, target: 127.0.0.1:4444.
SRC: Acquiring global read lock
SRC: Global read lock acquired
Initializing - done 
SRC: 1 tables and 0 views will be dumped.
Gathering information - done 
SRC: All transactions have been started
SRC: Locking instance for backup
SRC: Global read lock has been released
SRC: Writing global DDL files
SRC: Running data dump using 4 threads.
NOTE: SRC: Progress information uses estimated values and may not be accurate.
TGT: Opening dump...
NOTE: TGT: Dump is still ongoing, data will be loaded as it becomes available.
TGT: Target is MySQL 9.0.0. Dump was produced from MySQL 9.0.0
TGT: Scanning metadata...
TGT: Scanning metadata - done
TGT: Checking for pre-existing objects...
TGT: Executing common preamble SQL
TGT: Executing DDL...
TGT: Executing DDL - done
TGT: Executing view DDL...
TGT: Executing view DDL - done
TGT: Loading data...
TGT: Starting data load
Writing schema metadata - done       
Writing DDL - done 
Writing table metadata - done 
SRC: Starting data dump
100% (15 rows / ~15 rows), 0.00 rows/s, 0.00 B/s
SRC: Dump duration: 00:00:00s
SRC: Total duration: 00:00:00s
SRC: Schemas dumped: 1
SRC: Tables dumped: 1
SRC: Data size: 19.41 KB
SRC: Rows written: 15
SRC: Bytes written: 19.41 KB
SRC: Average throughput: 19.41 KB/s
TGT: Executing common postamble SQL
100% (19.41 KB / 19.41 KB), 0.00 B/s (0.00 rows/s), 1 / 1 tables done
Recreating indexes - done 
TGT: 1 chunks (15 rows, 19.41 KB) for 1 tables in 1 schemas were loaded in 0 sec (avg throughput 19.41 KB/s, 15.00 rows/s)
TGT: 2 DDL files were executed in 0 sec.
TGT: Data load duration: 0 sec
TGT: Total duration: 0 sec
TGT: 0 warnings were reported during the load.

---
Dump_metadata:
  Binlog_file: binlog.000002
  Binlog_position: 750469876
  Executed_GTID_set: ''
```

After the table is copied, we can verify the new table exists on the new instance. Using MySQl Shell, I connect to the new instance and then run the SQL command:

```sql
show schemas;
```

The result of this query is:

```text
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| mysql_shorts       |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.0013 sec)
```

This output looks good as the `mysql_shorts` schema now exists in the new instance. To check if the table was copied, we run the following command:

```sql
show tables from mysql_shorts;
```

The results of this query are:

```text
+------------------------+
| Tables_in_mysql_shorts |
+------------------------+
| ipsum                  |
+------------------------+
1 row in set (0.0016 sec)
```

We can see that the table `ipsum` now exists in the new instance.

## Copying Schemas

If we want to copy one or more schemas, we use the `util.copySchemas()` method. This method accepts three arguments.

1. A list of schemas that we wish to copy.
2. The connection information for the new MySQL instance.
3. An options JSON object.

The options argument is optional as with `util.copyTables()`.

To copy the entire `mysql_shorts` schema, we would use the command:

```shell
util.copySchemas(['mysql_shorts'], 'root@localhost:4445')
```

Note that this is a different instance using port 4445 instead of port 4444. If we wanted to copy multiple schemas, we would add items to the array in the first argument.

The console output from running this command looks like this:

```text
Copying DDL and Data from in-memory FS, source: sstroz-mac:3306, target: 127.0.0.1:4445.
SRC: Acquiring global read lock
SRC: Global read lock acquired
Initializing - done 
SRC: 1 schemas will be dumped and within them 24 tables, 0 views, 2 routines.
Gathering information - done 
SRC: All transactions have been started
SRC: Locking instance for backup
SRC: Global read lock has been released
SRC: Writing global DDL files
SRC: Running data dump using 4 threads.
NOTE: SRC: Progress information uses estimated values and may not be accurate.
TGT: Opening dump...
NOTE: TGT: Dump is still ongoing, data will be loaded as it becomes available.
TGT: Target is MySQL 9.0.0. Dump was produced from MySQL 9.0.0
TGT: Scanning metadata...
TGT: Scanning metadata - done
TGT: Checking for pre-existing objects...
TGT: Executing common preamble SQL
TGT: Executing DDL...
TGT: Executing DDL - done
TGT: Executing view DDL...
TGT: Executing view DDL - done
TGT: Loading data...
TGT: Starting data load
Writing schema metadata - done       
Writing DDL - done         
Writing table metadata - done         
SRC: Starting data dump
1 thds dumping | 100% (212.40K rows / ~210.74K rows), 0.00 rows/s, 49.64 MB/s
SRC: Dump duration: 00:00:00s
SRC: Total duration: 00:00:00s
SRC: Schemas dumped: 1
SRC: Tables dumped: 24
SRC: Data size: 25.69 MB
SRC: Rows written: 212395
SRC: Bytes written: 25.69 MB
SRC: Average throughput: 25.69 MB/s
1 thds loading | 100% (25.69 MB / 25.69 MB), 25.26 MB/s (222.66K rows/s), 23 / 24 tables done                
Recreating indexes - done       
TGT: Executing common postamble SQL
TGT: 26 chunks (212.40K rows, 25.69 MB) for 24 tables in 1 schemas were loaded in 1 sec (avg throughput 25.25 MB/s, 208.77K rows/s)
TGT: 25 DDL files were executed in 0 sec.
TGT: Data load duration: 1 sec
TGT: Total duration: 1 sec
TGT: 0 warnings were reported during the load.

---
Dump_metadata:
  Binlog_file: binlog.000002
  Binlog_position: 750469876
  Executed_GTID_set: ''
```

We can check this by connecting to this new instance of MySQL and running the query:

```text
show schemas;
```

The output from this query resembles the following:

```text
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| mysql_shorts       |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.0011 sec)
```

We see that the `mysql_shorts` schema was created. Now let's see what tables exist in the new schema by running the query:

```sql
show tables from mysql_shorts
```

The results of this query are:

```text
+------------------------------+
| Tables_in_mysql_shorts       |
+------------------------------+
| collection_demo              |
| course                       |
| csv_import                   |
| games                        |
| golfer                       |
| golfer_score                 |
| hole                         |
| hole_group                   |
| hole_score                   |
| ipsum                        |
| json_constraint_demo         |
| pets                         |
| product                      |
| product_color                |
| replica_demo                 |
| restaurant                   |
| sales                        |
| sports_team_organization     |
| sports_team_organization_fan |
| student                      |
| user                         |
| user_2                       |
| user_3                       |
| user_type                    |
+------------------------------+
24 rows in set (0.0018 sec)
```

We can see that all the tables in the `mysql_shorts` schema were copied over to the new MySQL instance.

## Copying A Complete Instance

We use the `util.copyInstance()` method to copy an entire MySQL instance to a new one. This method accepts two arguments.

1. The connection information for the new MySQL instance.
2. An options JSON object.

The `options` argument is optional, as with the other examples above.

When we copy an entire instance, all the schemas are copied *except* the system schemas, such as `information_schema`, `mysql`, `performance_schema`, and `sys`.

To copy my entire local instance to the third sandbox instance, I would use the following command:

```shell
util.copyInstance('root@localhost:4446')
```

The console output from this command resembles:

```text
Copying DDL, Data and Users from in-memory FS, source: sstroz-mac:3306, target: 127.0.0.1:4446.
SRC: Acquiring global read lock
SRC: Global read lock acquired
Initializing - done 
SRC: 17 out of 21 schemas will be dumped and within them 164 tables, 21 views, 2 events, 17 routines, 112 triggers.
SRC: 8 out of 11 users will be dumped.
Gathering information - done 
SRC: All transactions have been started
SRC: Locking instance for backup
SRC: Global read lock has been released
SRC: Writing global DDL files
SRC: Writing users DDL
SRC: Running data dump using 4 threads.
NOTE: SRC: Progress information uses estimated values and may not be accurate.
TGT: Opening dump...
NOTE: TGT: Dump is still ongoing, data will be loaded as it becomes available.
TGT: Target is MySQL 9.0.0. Dump was produced from MySQL 9.0.0
TGT: Scanning metadata...
TGT: Scanning metadata - done
TGT: Checking for pre-existing objects...
TGT: Executing common preamble SQL
TGT: Executing DDL...
Writing schema metadata - done         
Writing DDL - done           
Writing table metadata - done           
SRC: Starting data dump
NOTE: SRC: Table statistics not available for `mysql_rest_service_metadata`.`mrs_role`, chunking operation may be not optimal. Please consider running 'ANALYZE TABLE `mysql_rest_service_metadata`.`mrs_role`;' first.
NOTE: SRC: Table statistics not available for `mysql_rest_service_metadata`.`mrs_privilege`, chunking operation may be not optimal. Please consider running 'ANALYZE TABLE `mysql_rest_service_metadata`.`mrs_privilege`;' first.
NOTE: SRC: Table statistics not available for `mysql_rest_service_metadata`.`audit_log`, chunking operation may be not optimal. Please consider running 'ANALYZE TABLE `mysql_rest_service_metadata`.`audit_log`;' first.
TGT: Executing DDL - done                                           
TGT: Executing user accounts SQL...                                
NOTE: TGT: Skipping CREATE/ALTER USER statements for user 'root'@'localhost'
NOTE: TGT: Skipping GRANT/REVOKE statements for user 'root'@'localhost'
TGT: Executing view DDL...                                         
TGT: Executing view DDL - done                                     
TGT: Loading data...                                               
TGT: Starting data load                                            
1 thds dumping - 101% (767.49K rows / ~755.40K rows), 151.94K rows/s, 39.95 MB/s
SRC: Dump duration: 00:00:05s
SRC: Total duration: 00:00:05s
SRC: Schemas dumped: 17
SRC: Tables dumped: 164
SRC: Data size: 171.40 MB
SRC: Rows written: 767492
SRC: Bytes written: 171.40 MB
SRC: Average throughput: 32.84 MB/s
2 thds loading | 100% (171.40 MB / 171.40 MB), 37.67 MB/s (144.27K rows/s), 162 / 164 tables done
Recreating indexes - done       
TGT: Executing common postamble SQL
TGT: 170 chunks (767.49K rows, 171.40 MB) for 164 tables in 17 schemas were loaded in 4 sec (avg throughput 37.66 MB/s, 168.64K rows/s)
TGT: 223 DDL files were executed in 0 sec.
TGT: 7 accounts were loaded
TGT: Data load duration: 4 sec
TGT: 2 indexes were recreated in 0 sec.
TGT: Total duration: 6 sec
TGT: 0 warnings were reported during the load.

---
Dump_metadata:
  Binlog_file: binlog.000002
  Binlog_position: 750469876
  Executed_GTID_set: ''
```

When the instance copying is complete, we can verify the schemas were copied by connecting to the new instance and running the query:

```sql
show schemas;
```

The results of this query are:

```text
+-------------------------------+
| Database                      |
+-------------------------------+
| ai_demo                       |
| doc-store-intro               |
| doc_store_demo                |
| golf_league_manager           |
| information_schema            |
| json_demo                     |
| knex_demo                     |
| my_golf_league                |
| mysql                         |
| mysql_innodb_cluster_metadata |
| mysql_rest_service_metadata   |
| mysql_shorts                  |
| node_demo                     |
| nosql_demo                    |
| performance_schema            |
| sql_template_tag_demo         |
| sys                           |
| test_schema                   |
| testting_demo                 |
| view-demo                     |
| window-function-demo          |
+-------------------------------+
21 rows in set (0.0013 sec)
```

As we can see, all the non-system schemas were copied to the new instance.

## Wrap Up

MySQL Shell offers various ways to copy or move data from one instance to another. Some of these require two steps - one that dumps or exports the data and one that loads or imports the data. Using the `copy` methods in the `util` object, we can copy data from one MySQL instance to another in a single command/step. To get more information about the commands we discussed, head on over to the [documentation](https://dev.mysql.com/doc/mysql-shell/9.0/en/mysql-shell-utils-copy.html).

Image by <a href="https://pixabay.com/users/manuelwagner0-875119/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=686304">manuelwagner0</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=686304">Pixabay</a>