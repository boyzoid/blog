---
title: Advanced Data Load with MySQL Shell
date: 2024-07-04T06:00:00
image: 2024/data-load-mysql-shell/header.jpg
tags: [ "MySQL", "MySQL-Shell" ]
series: mysql-shell-gems
description: using advanced options to load data with MySQL Shell
---

Over the last few years, I have become quite smitten with [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/). For those who may not be familiar with MySQL Shell, it is a new(ish) command line interface (CLI) for connecting to and managing MySQL instances. During a recent [episode](https://insidemysql.libsyn.com/mysql-shell-does-all-the-things) of [Inside MySQL: Sakila Speaks](https://insidemysql.libsyn.com/), Fred and I talked to Miguel Araujo about many of the helpful (and lesser known) features of MySQL Shell. This post is the ninth in a series about these "hidden gem" features.

## The Problem

There is no 'problem' for this post, but I wanted to keep the formatting I have used for other MySQL Shell Hidden Gems posts. I have also discussed dumping and loading data with MySQL Shell in previous posts, so today, I want to cover some of the options available when loading data using MySQL Shell.

## The Solution

Once again, not really a 'solution', but I want to stick to the formatting of related posts.

First, let's take a look at some of the options we can use when loading data. We can use these options as part of a call to `util.loadDump()`. This function's last (and optional) argument is the options configuration block in JSON format. For example, if we wanted to load data from a dump that was on our local system, we would use a command that resembles:

```shell
util.loadDump('/path/to/dump/folder/', {option1: 'option1 value', option2: 'option2 value'})
```

I will discuss only some options, those I find interesting and helpful.

### Enabling `local_infile`

Before running any of the data load commands, we need to ensure that the global system variable named `local_infile` is set to `ON`. To check if this variable has the correct value, run the SQL command:

```sql
show global variables like 'local_infile';
```

The output from this command might resemble the following:

```text
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| local_infile  | OFF   |
+---------------+-------+
```

If the result shows the value as 'OFF', we must change it. To change the value of this variable, run the following SQL command:

```sql
SET GLOBAL local_infile = 'ON';
```

After setting the variable, we should recheck the value by running:

```sql
show global variables like 'local_infile';
```

The value should now show as `ON`.

```text
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| local_infile  | ON    |
+---------------+-------+
```

### Dry Ryn

If we have a very large database dump or are moving data to a HeatWave MySQL instance, we may want to ensure everything will work as expected before we do the actual load. To do a load with this option, we add `dryRun: true`. For example:

```shell
util.loadDump('~/dumps/example1', {dryRun:true})
```

When I run this command against my local MySQL instance, I see the following results:

```text
Loading DDL and Data from '~/dumps/example1' using 4 threads.
Opening dump...
dryRun enabled, no changes will be made.
Target is MySQL 9.0.0. Dump was produced from MySQL 9.0.0
Scanning metadata - done       
Checking for pre-existing objects...
Executing common preamble SQL
Executing DDL - done         
Executing view DDL - done       
Starting data load
Executing common postamble SQL                                       
0% (0 bytes / 144.61 MB), 0.00 B/s (0.00 rows/s), 132 / 132 tables done
Recreating indexes - done 
No data loaded.
181 DDL files were executed in 0 sec.
Total duration: 0 sec
0 warnings were reported during the load.
```
As we can see, there were no warnings when loading this dump, and it should execute without issue on the MySQL instance we are connected to.

### Threading

I have talked about this before, but it bears repeating. MySQL Shell can do multi-threaded loads. This option makes the process of loading data faster. By default, MySQL Shell uses four threads. Here is the syntax:

```shell
util.loadDump('~/dumps/example2', {threads: 8})
```

The output from this command would resemble the text below.

```text
Loading DDL and Data from '~/dumps/example2' using 8 threads.
Opening dump...
Target is MySQL 9.0.0. Dump was produced from MySQL 9.0.0
Scanning metadata - done       
Checking for pre-existing objects...
Executing common preamble SQL
Executing DDL - done       
Executing view DDL - done       
Starting data load
2 thds loading | 100% (144.61 MB / 144.61 MB), 57.09 MB/s (255.48K rows/s), 130 / 132 tables done                 
Recreating indexes - done       
Executing common postamble SQL
139 chunks (745.78K rows, 144.61 MB) for 132 tables in 15 schemas were loaded in 2 sec (avg throughput 57.09 MB/s, 294.41K rows/s)
181 DDL files were executed in 0 sec.
Data load duration: 2 sec
2 indexes were recreated in 0 sec.
Total duration: 3 sec
0 warnings were reported during the load.
```

When watching the progress of the data load, we may see that the number of threads used is lower than the number we specify. While MySQL Shell will try to use the number of threads we specify, sometimes fewer threads are used. Also, don't think that more threads will always mean better performance. That may not be the case.

### Load Progress File

The `progressFile` option allows us to specify the location of a local progress state file for tracking load progress. If the dump file is local to the MySQl instance to which we are loading the data, this file is created automatically in the source directory for the dump. The name of the file will be in the format: `load-progress-<server-uuid>.json`.

The file output will resemble the following:

```text
{"op":"SERVER-UUID","done":true,"timestamp":1720014625787,"uuid":"207fe466-3940-11ef-8bc3-da561d907cbe"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625804,"schema":"json_demo"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625804,"schema":"test_schema"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625804,"schema":"knex_demo"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625804,"schema":"mysql_innodb_cluster_metadata"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625804,"schema":"doc-store-intro"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625804,"schema":"doc_store_demo"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625804,"schema":"node_demo"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625804,"schema":"mysql_shorts"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625809,"schema":"my_golf_league"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625809,"schema":"golf_league_manager"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625810,"schema":"testting_demo"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625811,"schema":"nosql_demo"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625812,"schema":"view-demo"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625813,"schema":"sql_template_tag_demo"}
{"op":"SCHEMA-DDL","done":false,"timestamp":1720014625814,"schema":"window-function-demo"}
{"op":"TABLE-DDL","done":false,"timestamp":1720014625815,"schema":"knex_demo","table":"knex_migrations_lock","_worker":5,"_srvthreads":1}
{"op":"TABLE-DDL","done":false,"timestamp":1720014625817,"schema":"json_demo","table":"season","_worker":2,"_srvthreads":1}...
```

### Skipping the Bin Log

The' skipBinLog' option can increase performance when loading a large data set. When set to `true`, this option tells MySQl Shell to issue a `SET sql_bin_log=0` statement before loading the data. This will only work for on-premise MySQL instances. If you set this option to `true` when loading data into a HeatWave MySQL instance, it will throw an error.

Here is an example of using this option:

```shell
 util.loadDump("~/dumps/example2", {skipBinLog:true})
```

The output for this command will be similar to what we saw in the threading example above.

### Reset Progress

Suppose I run the command `util.loadDump("~/dumps/example2", {skipBinLog: true})` again, I will see the following message:

```text
Loading DDL and Data from '~/dumps/example2' using 4 threads.
Opening dump...
Target is MySQL 9.0.0. Dump was produced from MySQL 9.0.0
NOTE: Load progress file detected. Load will be resumed from where it was left, assuming no external updates were made.
You may enable the 'resetProgress' option to discard progress for this MySQL instance and force it to be completely reloaded.
Scanning metadata - done       
Executing common preamble SQL
Executing DDL - done       
Executing view DDL - done       
Starting data load
100% (144.61 MB / 144.61 MB), 0.00 B/s (0.00 rows/s), 0 / 132 tables done
Executing common postamble SQL
Recreating indexes - done       
There was no remaining data left to be loaded.
132 DDL files were executed in 0 sec.
Total duration: 0 sec
0 warnings were reported during the load.
```

We see a message that a load progress file was detected, and the load will resume from where it left off. If there is an error or some other kind of disruption when we first try to load the data, the load will continue from that point. If the dump succeeded the first time, nothing will be executed.

We can use the `resetProgess` option to tell MySQL Shell to start the progress from the beginning of the data load. We must first remove all database objects created in the previous load attempt to use this option. These objects include schemas, tables, users, views, triggers, routines, and events. If we don't, we will get an error (unless we use the `ignoreExistingObjects` option...more on that in a bit.).

Here is an example of using this option:

```shell
util.loadDump("~/dumps/example2", {resetProgress:true})
```

And here is what the output will resemble if we do not remove any previously created objects.

```text
Loading DDL and Data from '~/dumps/example2' using 4 threads.
Opening dump...
Target is MySQL 9.0.0. Dump was produced from MySQL 9.0.0
NOTE: Load progress file detected for the instance but 'resetProgress' option was enabled. Load progress will be discarded, and the whole dump will be reloaded.
Scanning metadata - done       
Checking for pre-existing objects...
ERROR: Schema `test_schema` already contains a table named `test_collection`
ERROR: Schema `json_demo` already contains a table named `season`
ERROR: Schema `knex_demo` already contains a table named `knex_migrations`
ERROR: Schema `knex_demo` already contains a table named `knex_migrations_lock`
ERROR: Schema `knex_demo` already contains a table named `user`
ERROR: Schema `knex_demo` already contains a table named `user_type`
ERROR: Schema `doc-store-intro` already contains a table named `restaurant`
ERROR: Schema `doc_store_demo` already contains a table named `scores`
ERROR: Schema `node_demo` already contains a table named `scores`
ERROR: Schema `mysql_shorts` already contains a table named `collection_demo`
ERROR: Schema `mysql_shorts` already contains a table named `course`
ERROR: Schema `mysql_shorts` already contains a table named `csv_import`
ERROR: Schema `mysql_shorts` already contains a table named `games`
ERROR: Schema `mysql_shorts` already contains a table named `golfer`
ERROR: Schema `mysql_shorts` already contains a table named `golfer_score`
ERROR: Schema `mysql_shorts` already contains a table named `hole`
ERROR: Schema `mysql_shorts` already contains a table named `hole_group`
ERROR: Schema `mysql_shorts` already contains a table named `hole_score`
ERROR: Schema `mysql_shorts` already contains a table named `ipsum`
ERROR: Schema `mysql_shorts` already contains a table named `json_constraint_demo`
ERROR: Schema `mysql_shorts` already contains a table named `pets`
ERROR: Schema `mysql_shorts` already contains a table named `product`
ERROR: Schema `mysql_shorts` already contains a table named `product_color`
ERROR: Schema `mysql_shorts` already contains a table named `replica_demo`
ERROR: Schema `mysql_shorts` already contains a table named `restaurant`
ERROR: Schema `mysql_shorts` already contains a table named `sales`
ERROR: Schema `mysql_shorts` already contains a table named `sports_team_organization`
ERROR: Schema `mysql_shorts` already contains a table named `sports_team_organization_fan`
ERROR: Schema `mysql_shorts` already contains a table named `student`
ERROR: Schema `mysql_shorts` already contains a table named `user`
ERROR: Schema `mysql_shorts` already contains a table named `user_2`
ERROR: Schema `mysql_shorts` already contains a table named `user_3`
ERROR: Schema `mysql_shorts` already contains a table named `user_type`
ERROR: Schema `mysql_shorts` already contains a function named `multiply_ints`
ERROR: Schema `mysql_shorts` already contains a procedure named `job_title_count`
ERROR: Schema `sql_template_tag_demo` already contains a table named `user`
ERROR: Schema `window-function-demo` already contains a table named `player`
ERROR: One or more objects in the dump already exist in the destination database. You must either DROP these objects or exclude them from the load.
Util.loadDump: While 'Scanning metadata': Duplicate objects found in destination database (MYSQLSH 53021)
```

The output shows a list of items that have already been created.

### Ignoring Existing Objects

As I noted above, we can use the `ignoreExistingObjects` option to re-run a data load and not get any errors when we encounter an existing object. Here is a command that uses the `resetProgress` and `ignoreExistingObjects` options (after I dropped a few schemas loaded with the previous command).

```shell
 util.loadDump("~/dumps/example2", {resetProgress:true, ignoreExistingObjects:true})
```

The output of this command would look like the text below.

```text
Loading DDL and Data from '~/dumps/example2' using 4 threads.
Opening dump...
Target is MySQL 9.0.0. Dump was produced from MySQL 9.0.0
NOTE: Load progress file detected for the instance but 'resetProgress' option was enabled. Load progress will be discarded, and the whole dump will be reloaded.
Scanning metadata - done       
Checking for pre-existing objects...
NOTE: Schema `test_schema` already contains a table named `test_collection`
NOTE: Schema `json_demo` already contains a table named `season`
NOTE: Schema `knex_demo` already contains a table named `knex_migrations`
NOTE: Schema `knex_demo` already contains a table named `knex_migrations_lock`
NOTE: Schema `knex_demo` already contains a table named `user`
NOTE: Schema `knex_demo` already contains a table named `user_type`
NOTE: Schema `doc-store-intro` already contains a table named `restaurant`
NOTE: Schema `doc_store_demo` already contains a table named `scores`
NOTE: Schema `node_demo` already contains a table named `scores`
NOTE: Schema `node_demo` already contains a function named `JSON_ARRAY_AVG`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a table named `async_cluster_members`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a table named `async_cluster_views`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a table named `clusters`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a table named `clusterset_members`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a table named `clusterset_views`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a table named `clustersets`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a table named `instances`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a table named `router_rest_accounts`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a table named `routers`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a view named `v2_instances`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a view named `v2_ar_members`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a view named `v2_router_rest_accounts`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a view named `v2_cs_members`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a view named `v2_gr_clusters`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a view named `v2_routers`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a view named `v2_this_instance`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a view named `v2_cs_clustersets`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a view named `v2_clusters`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a view named `v2_ar_clusters`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a view named `v2_cs_router_options`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a view named `schema_version`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a procedure named `v2_cs_add_invalidated_member`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a procedure named `v2_cs_created`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a procedure named `v2_cs_member_added`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a procedure named `v2_cs_member_rejoined`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a procedure named `v2_cs_member_removed`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a procedure named `v2_cs_primary_changed`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a procedure named `v2_cs_primary_force_changed`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a procedure named `v2_set_global_router_option`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a procedure named `v2_set_routing_option`
NOTE: Schema `mysql_innodb_cluster_metadata` already contains a procedure named `_v2_begin_cs_change`
NOTE: Schema `testting_demo` already contains a table named `user`
NOTE: Schema `my_golf_league` already contains a table named `adonis_schema`
NOTE: Schema `my_golf_league` already contains a table named `adonis_schema_versions`
NOTE: Schema `my_golf_league` already contains a table named `league`
NOTE: Schema `my_golf_league` already contains a table named `pkmap`
NOTE: Schema `my_golf_league` already contains a table named `season`
NOTE: Schema `nosql_demo` already contains a table named `restaurant`
NOTE: Schema `sql_template_tag_demo` already contains a table named `user`
NOTE: Schema `window-function-demo` already contains a table named `player`
NOTE: One or more objects in the dump already exist in the destination database but will be ignored because the 'ignoreExistingObjects' option was enabled.
Executing common preamble SQL
Executing DDL - done           
Executing view DDL - done       
Starting data load
2 thds indexing / 100% (144.61 MB / 144.61 MB), 47.52 MB/s (236.10K rows/s), 132 / 132 tables done
Executing common postamble SQL
Recreating indexes - done       
139 chunks (745.78K rows, 144.61 MB) for 132 tables in 15 schemas were loaded in 3 sec (avg throughput 47.52 MB/s, 245.06K rows/s)
157 DDL files were executed in 0 sec.
Data load duration: 3 sec
2 indexes were recreated in 0 sec.
Total duration: 3 sec
35 rows were replaced
0 warnings were reported during the load.
```

The output will show what objects were skipped because they already exist.

### Loading From Oracle Cloud

One of my favorite features of MySQL Shell is the ability to load data from an Oracle Cloud storage bucket. There are several options available to us to take advantage of this feature.

This example assumes you have installed the [OCI CLI](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/cliconcepts.htm).

```shell
util.loadDump("example5", {osBucketName:"database_dumps")
```

Depending on how the OCI CLI is configured on your system, you may also need to include your bucket's `namespace`.

Here is the output from this command.

```text
Loading DDL and Data from OCI ObjectStorage bucket=database_dumps, prefix='example5' using 4 threads.
Opening dump...
Target is MySQL 9.0.0. Dump was produced from MySQL 9.0.0
Fetching dump data from remote location...
Listing files - done 
Scanning metadata - done           
Checking for pre-existing objects...
Executing common preamble SQL
Executing DDL - done           
Executing view DDL - done         
Starting data load
2 thds loading - 100% (144.61 MB / 144.61 MB), 85.27 KB/s (1.20K rows/s), 122 / 132 tables done
Recreating indexes - done       
Executing common postamble SQL
139 chunks (745.78K rows, 144.61 MB) for 132 tables in 15 schemas were loaded in 13 sec (avg throughput 10.37 MB/s, 53.47K rows/s)
181 DDL files were executed in 14 sec.
Data load duration: 13 sec
2 indexes were recreated in 0 sec.
Total duration: 33 sec
0 warnings were reported during the load.
```

This image shows the progress file created when we loaded the dump. It was added to our OCI bucket in a folder named 'example5'.

![Oracle Cloud Storage Bucket File List](/assets/images/2024/data-load-mysql-shell/img_01.png)

### Creating Invisible Primary Keys

The `createInvisiblePKs` option will add primary keys in invisible columns for every table in the dump that does not have a primary key defined. If the dump was created using the `createInvisiblePKs` option, the `createInvisiblePKs` option of the load is automatically set to `true`.

```shell
util.loadDump("~/dumps/example2", {createInvisblePKs: true})
```

## Wrap Up

The utilities in MySQL Shell for loading data from a MySQL database are an excellent combination of ease and power. We can use options to perform a dry run to ensure everything will run as expected, reset the progress of a load if it was interrupted or needs to be re-run, ignore any existing objects in the target MySQL instance, and load data from a dump stored in an OCI storage bucket. Check out the [MySQL Shell Load Documentation](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-load-dump.html) to learn more about the different load options available in MySQL Shell.

Photo by <a href="https://unsplash.com/@michaelfousert?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Michael Fousert</a> on <a href="https://unsplash.com/photos/yellow-and-black-truck-toy-Kv2hu25Rx2s?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  