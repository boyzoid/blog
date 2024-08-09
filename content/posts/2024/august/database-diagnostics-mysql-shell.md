---
title: Using MySQL Shell to Get MySQL Diagnostic Information
date: 2024-08-09T06:00:00
image: 2024/database-diagnostics-mysql-shell/header.jpg
image-path: 2024/database-diagnostics-mysql-shell/
tags: [ "MySQL", "MySQL-Shell" ]
series: mysql-shell-gems
description: Learn how to get comprehensive diagnostic data from a MySQL database using MySQL Shell.
---

Collecting comprehensive diagnostic information can be daunting. Knowing what queries to run to get the needed data is more of an art form than anything else. Fortunately, for those not that artistically inclined, [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) makes it easier to get this information. Let's take a look.

## The Setup

Before we can get started, we need to connect to a MySQL instance. For this demo, I am using a production MySQL database for a web application I wrote to help me manage a golf league.

When I first tried to get diagnostic information, I received a message that I needed to change two global variables: `slow_query_log` needed to be set to `ON`, and `log_output` needed to be set to `TABLE`. Your mileage may vary.

## The Command

The MySQL Shell command we run to gather the diagnostic information is `util.debug.collectDiagnostics()`. This method accepts two arguments.

1. The path to where the data file will be saved.
    * This argument is required.
    * This is the path on the machine running MySQL Shell, not on the server we are connected to.
    * If you provide a path, a file will be created with a name similar to: `mysql-diagnostics-<timestamp info>.zip`.
    * You will need to use an absolute path here. You will receive an error if you use a path similar to `~/path/to/folder`.
        * This is a known issue and has been reported.
2. An options JSON object.
    * This argument is optional.

The command I ran against my MySQL instance was:

```shell
util.debug.collectDiagnostics("/users/my_user/diag/", {slowQueries: true, })
```

When completed, this command will create a file named `mysql-diagnostics-<timestamp info>.zip` in the `diag` folder under my user's home directory. The data collected will also include information about slow-running queries.

The output to the console after this command was finished is the following text:

```text
Collecting diagnostics information from mysql://golfLeagueManager@127.0.0.1:3306/golf_league_manager...
Copying shell log file...
 - Gathering schema tables without a PK...
 - Gathering schema routine size...
 - Gathering schema table count...
 - Gathering schema unused indexes...
 - Gathering error_log
 - Gathering slow queries in 95 pctile...
 - Gathering slow queries summary by rows examined...
 - Gathering slow_log...
 - Gathering performance_schema.host_cache...
 - Gathering performance_schema.persisted_variables...
 - Gathering performance_schema.replication_applier_configuration...
 - Gathering performance_schema.replication_applier_filters...
 - Gathering performance_schema.replication_applier_global_filters...
 - Gathering performance_schema.replication_applier_status...
 - Gathering performance_schema.replication_applier_status_by_coordinator...
 - Gathering performance_schema.replication_applier_status_by_worker...
 - Gathering performance_schema.replication_asynchronous_connection_failover...
 - Gathering performance_schema.replication_asynchronous_connection_failover_managed...
 - Gathering performance_schema.replication_connection_configuration...
 - Gathering performance_schema.replication_connection_status...
 - Gathering performance_schema.replication_group_member_stats...
 - Gathering performance_schema.replication_group_members...
 - Gathering global variables...
 - Gathering XA RECOVER CONVERT xid...
 - Gathering SHOW BINARY LOGS...
 - Gathering SHOW REPLICAS...
 - Gathering SHOW BINARY LOG STATUS...
 - Gathering SHOW REPLICA STATUS...
 - Gathering replication master_info...
 - Gathering replication relay_log_info...
 - Gathering pfs actors...
 - Gathering pfs objects...
 - Gathering pfs consumers...
 - Gathering pfs instruments...
 - Gathering pfs threads...
 - Gathering performance_schema.metadata_locks...
 - Gathering performance_schema.threads...
 - Gathering sys.schema_table_lock_waits...
 - Gathering sys.session_ssl_status...
 - Gathering sys.session...
 - Gathering sys.processlist...
 - Gathering performance_schema.events_waits_current...
 - Gathering information_schema.innodb_trx...
 - Gathering information_schema.innodb_metrics...
 - Gathering sys.memory_by_host_by_current_bytes...
 - Gathering sys.memory_by_thread_by_current_bytes...
 - Gathering sys.memory_by_user_by_current_bytes...
 - Gathering sys.memory_global_by_current_bytes...
 - Gathering SHOW GLOBAL STATUS...
 - Gathering SHOW ENGINE INNODB STATUS...
 - Gathering SHOW ENGINE PERFORMANCE_SCHEMA STATUS...
 - Gathering SHOW FULL PROCESSLIST...
 - Gathering SHOW OPEN TABLES...

Diagnostics information was written to /users/my_user/diag/mysql-diagnostics-20240809-095357.zip
```

## The Information

After running this command, this is the file I saw in the `diag` folder:

![Diagnostic file information]({% imgPath image-path, "img_01.png" %} "Diagnostic file information")

I have to admit, I was surprised at the size of the zipped file (just over 10MB). Even though the database has been used for over a decade, it does not contain a lot of data.

### The Files

Here is the list of files included in the .zip file.

```text
0.SHOW_BINARY_LOGS.tsv
0.SHOW_BINARY_LOGS.yaml
0.SHOW_BINARY_LOG_STATUS.tsv
0.SHOW_BINARY_LOG_STATUS.yaml
0.SHOW_ENGINE_INNODB_STATUS.tsv
0.SHOW_ENGINE_INNODB_STATUS.yaml
0.SHOW_ENGINE_PERFORMANCE_SCHEMA_STATUS.tsv
0.SHOW_ENGINE_PERFORMANCE_SCHEMA_STATUS.yaml
0.SHOW_FULL_PROCESSLIST.tsv
0.SHOW_FULL_PROCESSLIST.yaml
0.SHOW_GLOBAL_STATUS.tsv
0.SHOW_GLOBAL_STATUS.yaml
0.SHOW_OPEN_TABLES.tsv
0.SHOW_OPEN_TABLES.yaml
0.SHOW_REPLICAS.tsv
0.SHOW_REPLICAS.yaml
0.SHOW_REPLICA_STATUS.tsv
0.SHOW_REPLICA_STATUS.yaml
0.XA_RECOVER_CONVERT_xid.tsv
0.XA_RECOVER_CONVERT_xid.yaml
0.error_log.tsv
0.global_variables.tsv
0.global_variables.yaml
0.information_schema.innodb_metrics.tsv
0.information_schema.innodb_metrics.yaml
0.information_schema.innodb_trx.tsv
0.information_schema.innodb_trx.yaml
0.instance
0.metrics.tsv
0.performance_schema.events_waits_current.tsv
0.performance_schema.events_waits_current.yaml
0.performance_schema.host_cache.tsv
0.performance_schema.host_cache.yaml
0.performance_schema.metadata_locks.tsv
0.performance_schema.metadata_locks.yaml
0.performance_schema.persisted_variables.tsv
0.performance_schema.persisted_variables.yaml
0.performance_schema.replication_applier_configuration.tsv
0.performance_schema.replication_applier_configuration.yaml
0.performance_schema.replication_applier_filters.tsv
0.performance_schema.replication_applier_filters.yaml
0.performance_schema.replication_applier_global_filters.tsv
0.performance_schema.replication_applier_global_filters.yaml
0.performance_schema.replication_applier_status.tsv
0.performance_schema.replication_applier_status.yaml
0.performance_schema.replication_applier_status_by_coordinator.tsv
0.performance_schema.replication_applier_status_by_coordinator.yaml
0.performance_schema.replication_applier_status_by_worker.tsv
0.performance_schema.replication_applier_status_by_worker.yaml
0.performance_schema.replication_asynchronous_connection_failover.tsv
0.performance_schema.replication_asynchronous_connection_failover.yaml
0.performance_schema.replication_asynchronous_connection_failover_managed.tsv
0.performance_schema.replication_asynchronous_connection_failover_managed.yaml
0.performance_schema.replication_connection_configuration.tsv
0.performance_schema.replication_connection_configuration.yaml
0.performance_schema.replication_connection_status.tsv
0.performance_schema.replication_connection_status.yaml
0.performance_schema.replication_group_member_stats.tsv
0.performance_schema.replication_group_member_stats.yaml
0.performance_schema.replication_group_members.tsv
0.performance_schema.replication_group_members.yaml
0.performance_schema.threads.tsv
0.performance_schema.threads.yaml
0.pfs_actors.tsv
0.pfs_actors.yaml
0.pfs_consumers.tsv
0.pfs_consumers.yaml
0.pfs_instruments.tsv
0.pfs_instruments.yaml
0.pfs_objects.tsv
0.pfs_objects.yaml
0.pfs_threads.tsv
0.pfs_threads.yaml
0.replication_master_info.tsv
0.replication_master_info.yaml
0.replication_relay_log_info.tsv
0.replication_relay_log_info.yaml
0.slow_log.tsv
0.slow_log.yaml
0.slow_queries_in_95_pctile.tsv
0.slow_queries_in_95_pctile.yaml
0.slow_queries_summary_by_rows_examined.tsv
0.slow_queries_summary_by_rows_examined.yaml
0.sys.memory_by_host_by_current_bytes.tsv
0.sys.memory_by_host_by_current_bytes.yaml
0.sys.memory_by_thread_by_current_bytes.tsv
0.sys.memory_by_thread_by_current_bytes.yaml
0.sys.memory_by_user_by_current_bytes.tsv
0.sys.memory_by_user_by_current_bytes.yaml
0.sys.memory_global_by_current_bytes.tsv
0.sys.memory_global_by_current_bytes.yaml
0.sys.processlist.tsv
0.sys.processlist.yaml
0.sys.schema_table_lock_waits.tsv
0.sys.schema_table_lock_waits.yaml
0.sys.session.tsv
0.sys.session.yaml
0.sys.session_ssl_status.tsv
0.sys.session_ssl_status.yaml
0.uri
mysql-diagnostics-20240809-095357.iml
mysqlsh.log
schema_routine_size.tsv
schema_routine_size.yaml
schema_table_count.tsv
schema_table_count.yaml
schema_tables_without_a_PK.tsv
schema_tables_without_a_PK.yaml
schema_unused_indexes.tsv
schema_unused_indexes.yaml
shell_info.yaml
```

Even when you consider that each file is duplicated (one in yaml format and one in tab-separated format), that is a lot of information gathered with just a single command. We can see files for global variables, replication information, memory usage, binary log status, slow query information (because we asked for it), and a slew of other data.

## Taking a Look at the Data

Let's take a look at the contents of some of these files.

### Global Variables

I am going to start with `0.global_variables.tsv`. Here is the top of that file (I am not going to show the entire file because it is pretty long).

```text
# Query:
#   SELECT g.variable_name name, g.variable_value value /*!80000, i.variable_source source*/
#               FROM performance_schema.global_variables g
#               /*!80000 JOIN performance_schema.variables_info i ON g.variable_name = i.variable_name */
#               ORDER BY name
#
# Started: 2024-08-09T09:53:58.252547
# Execution Time: 0.0100 sec
#
# name  value  source
activate_all_roles_on_login OFF    COMPILED
admin_address      COMPILED
admin_port  33062  COMPILED
admin_ssl_ca       COMPILED
admin_ssl_capath       COMPILED
admin_ssl_cert     COMPILED
admin_ssl_cipher       COMPILED
admin_ssl_crl      COMPILED
admin_ssl_crlpath      COMPILED
admin_ssl_key      COMPILED
admin_tls_ciphersuites     COMPILED
admin_tls_version   TLSv1.2,TLSv1.3    COMPILED
authentication_policy   *,,    COMPILED
```

The complete file lists all the global variables for my server.

When I first opened this file, I was pleased to see that the query run to get this information is included at the top of the file. This way, if I need to make any changes to my system, I can check those changes by running the query rather than rerunning the entire diagnostic collection.

I think the yaml files are easier to read. Here are the same variables as above, but in yaml format.

```yaml
# Query:
#   SELECT g.variable_name name, g.variable_value value /*!80000, i.variable_source source*/
#               FROM performance_schema.global_variables g
#               /*!80000 JOIN performance_schema.variables_info i ON g.variable_name = i.variable_name */
#               ORDER BY name
#
# Started: 2024-08-09T09:53:58.252547
# Execution Time: 0.0100 sec
#
name: activate_all_roles_on_login
source: COMPILED
value: 'OFF'
---
name: admin_address
source: COMPILED
value: ''
---
name: admin_port
source: COMPILED
value: '33062'
---
name: admin_ssl_ca
source: COMPILED
value: ''
---
name: admin_ssl_capath
source: COMPILED
value: ''
---
name: admin_ssl_cert
source: COMPILED
value: ''
---
name: admin_ssl_cipher
source: COMPILED
value: ''
---
name: admin_ssl_crl
source: COMPILED
value: ''
---
name: admin_ssl_crlpath
source: COMPILED
value: ''
---
name: admin_ssl_key
source: COMPILED
value: ''
---
name: admin_tls_ciphersuites
source: COMPILED
value: ''
---
name: admin_tls_version
source: COMPILED
value: TLSv1.2,TLSv1.3
---
name: authentication_policy
source: COMPILED
value: '*,,'
---
```

### Binary Log Status

Some files may contain little data, but that does not mean the data is less critical. Let's take a look at `0.SHOW_BINARY_LOG_STATUS.tsv`.

```text
# Query:
#   SHOW BINARY LOG STATUS
#
# Started: 2024-08-09T09:53:58.388165
# Execution Time: 0.0049 sec
#
# File  Position   Binlog_Do_DB   Binlog_Ignore_DB   Executed_Gtid_Set
binlog.000003   43276198
```

And here is the yaml version.

```yaml
# Query:
#   SHOW BINARY LOG STATUS
#
# Started: 2024-08-09T09:53:58.388165
# Execution Time: 0.0049 sec
#
Binlog_Do_DB: ''
Binlog_Ignore_DB: ''
Executed_Gtid_Set: ''
File: binlog.000003
Position: 43276198
```

These files both show us the name of the current bin log and the position in the file that references the last committed transaction.

### Memory Usage

Several files relate to memory usage. Let's look at `0.sys.memory_by_user_by_current_bytes.tsv,` which shows memory usage by each database user.

```text
# Query:
#   select * from sys.memory_by_user_by_current_bytes
#
# Started: 2024-08-09T09:53:59.067596
# Execution Time: 0.0102 sec
#
# user  current_count_used current_allocated  current_avg_alloc  current_max_alloc  total_allocated
my_db_user  725    2.24 MiB   3.16 KiB   1.00 MiB   76.98 GiB
background  7586   2.12 MiB    292 bytes 799.49 KiB 7.23 GiB
event_scheduler 1597   270.67 KiB  173 bytes 74.47 KiB  1.01 GiB
root    0     0 bytes    0 bytes    0 bytes 12.41 GiB
```

We can see that the user named `db_user` utilizes the most memory. This is likely because it is the only defined user that does any read or write operations on the database. Because I don't use `root` unless absolutely necessary (I can't even recall the last time I logged in as `root`), that user is not currently using any resources.

Once again, I find the yaml file much easier to read. Here is what the contents of that file look like.

```yaml
# Query:
#   select * from sys.memory_by_user_by_current_bytes
#
# Started: 2024-08-09T09:53:59.067596
# Execution Time: 0.0102 sec
#
current_allocated: 2.24 MiB
current_avg_alloc: 3.16 KiB
current_count_used: '725'
current_max_alloc: 1.00 MiB
total_allocated: 76.98 GiB
user: my_db_user
---
current_allocated: 2.12 MiB
current_avg_alloc: ' 292 bytes'
current_count_used: '7586'
current_max_alloc: 799.49 KiB
total_allocated: 7.23 GiB
user: background
---
current_allocated: 270.67 KiB
current_avg_alloc: ' 173 bytes'
current_count_used: '1597'
current_max_alloc: 74.47 KiB
total_allocated: 1.01 GiB
user: event_scheduler
---
current_allocated: '   0 bytes'
current_avg_alloc: '   0 bytes'
current_count_used: '0'
current_max_alloc: '   0 bytes'
total_allocated: 12.41 GiB
user: root
```

### Slow Queries

Since we specifically asked for slow query data, let's examine one of the slow query files. Here are the contents of `0.slow_queries_in_95_pctile.tsv`.

```text
# Query:
#   SELECT DIGEST, substr(DIGEST_TEXT, 1, 50), COUNT_STAR, SUM_ROWS_EXAMINED, SUM_ROWS_SENT, round(SUM_ROWS_SENT/SUM_ROWS_EXAMINED, 5) ratio FROM performance_schema.events_statements_summary_by_digest where DIGEST_TEXT like 'select%' and (SUM_ROWS_SENT/SUM_ROWS_EXAMINED) < .5 ORDER BY SUM_ROWS_EXAMINED/SUM_ROWS_SENT desc limit 20
#
# Started: 2024-08-09T09:53:58.118170
# Execution Time: 0.0142 sec
#
# DIGEST    substr(DIGEST_TEXT, 1, 50) COUNT_STAR SUM_ROWS_EXAMINED  SUM_ROWS_SENT  ratio
e4651f6b5088748ce1023c151   SELECT ( SELECT COUNT ( `mrh` . `score` ) FROM `ma 2  2801588    2  0.0000
251d5e4fe1f4ae855c156c9dc   SELECT ( SELECT COUNT ( `mrh` . `score` ) FROM `ma 740    728029115  740    0.0000
1af7c4e865a71bc17194c2ff3   SELECT DISTINCTROW `t` . `id` `teamid` FROM `team` 6  3606908    6  0.0000
50c8ff309af18cf64c6891391   SELECT ( SELECT COUNT ( `mrh` . `score` ) FROM `ma 211    28111768   211    0.0000
457c87a65271caa7673015854   SELECT DISTINCTROW `concat` ( `u` . `firstName` ,  2  624724 10 0.0000
5872d26e9c861fe4b890f1706   SELECT `h` . `number` , `h` . `par` , AVG ( CASE W 4  2367448    72 0.0000
aa82179f2b7820ec7e073a0bd   SELECT `h` . `number` , `m` . `datePlayed` , `conc 213    30731988   1704   0.0001
f354a030bb8eedcc7bf12c6f1   SELECT SUM ( CASE WHEN `match0_` . `hometeamId` =  264    4748832    264    0.0001
354003ae085979c9939b8125f   SELECT ( SELECT COUNT ( `mrh` . `score` ) FROM `ma 211    2139541    211    0.0001
f354068ea3bc9cf3ae09e724e   SELECT `mr` . `score` - `mr` . `handicap` `score`  740    28920334   3559   0.0001
79646e8a4b0fb1569508e8497   SELECT DISTINCTROW `mr` . `score` `score` , `m` . 2  91162  20 0.0002
4130fa152d490e4e31aab9f1b   SELECT DISTINCTROW `mr` . `score` - `mr` . `handic 2  91162  20 0.0002
4269116398b6c366722d8075a   SELECT `mr` . `score` , `DATE_FORMAT` ( `m` . `dat 740    15530542   3559   0.0002
9908e99c3924647a6d8e0665a   SELECT COUNT ( * ) AS `col_0_0_` FROM `login_attem 120    353762 120    0.0003
2dc085027dc47d76e0f2d27e7   SELECT `u` . `full_name` , `gs` . `golfer_id` `id` 402    1115283    402    0.0004
7e4ae601e10d06aa56843671a   SELECT COUNT ( * ) AS `col_0_0_` FROM `login_attem 2  5543   2  0.0004
5f7077e441cadcace2e154b54   SELECT `h` . `number` , `h` . `par` , AVG ( CASE W 2  82892  36 0.0004
d7f2a4c4fa9c98c475d5de9ad   SELECT `h` . `number` , `h` . `par` , AVG ( CASE W 2  82892  36 0.0004
4f20adb6f7fd8603bd5aff769   SELECT COUNT ( DISTINCTROW `user1_` . `id` ) AS `c 2  4397   2  0.0005
e38ec7bca0dc715113e556fed   SELECT `h` . `number` , `h` . `par` , AVG ( CASE W 422    12355884   7596   0.0006
```

For longer queries, we will not see the entire query, but we get enough that we should be able to identify the query in our code. Here is the yaml version so you can see the data more easily.

```yaml
# Query:
#   SELECT DIGEST, substr(DIGEST_TEXT, 1, 50), COUNT_STAR, SUM_ROWS_EXAMINED, SUM_ROWS_SENT, round(SUM_ROWS_SENT/SUM_ROWS_EXAMINED, 5) ratio FROM performance_schema.events_statements_summary_by_digest where DIGEST_TEXT like 'select%' and (SUM_ROWS_SENT/SUM_ROWS_EXAMINED) < .5 ORDER BY SUM_ROWS_EXAMINED/SUM_ROWS_SENT desc limit 20
#
# Started: 2024-08-09T09:53:58.118170
# Execution Time: 0.0142 sec
#
COUNT_STAR: 2
DIGEST: e4651f6b5088748ce1023c151
SUM_ROWS_EXAMINED: 2801588
SUM_ROWS_SENT: 2
ratio: '0.0000'
substr(DIGEST_TEXT, 1, 50): SELECT ( SELECT COUNT ( `mrh` . `score` ) FROM `ma
---
COUNT_STAR: 740
DIGEST: 251d5e4fe1f4ae855c156c9dc
SUM_ROWS_EXAMINED: 728029115
SUM_ROWS_SENT: 740
ratio: '0.0000'
substr(DIGEST_TEXT, 1, 50): SELECT ( SELECT COUNT ( `mrh` . `score` ) FROM `ma
---
COUNT_STAR: 6
DIGEST: 1af7c4e865a71bc17194c2ff3
SUM_ROWS_EXAMINED: 3606908
SUM_ROWS_SENT: 6
ratio: '0.0000'
substr(DIGEST_TEXT, 1, 50): SELECT DISTINCTROW `t` . `id` `teamid` FROM `team`
---
COUNT_STAR: 211
DIGEST: 50c8ff309af18cf64c6891391
SUM_ROWS_EXAMINED: 28111768
SUM_ROWS_SENT: 211
ratio: '0.0000'
substr(DIGEST_TEXT, 1, 50): SELECT ( SELECT COUNT ( `mrh` . `score` ) FROM `ma
---
COUNT_STAR: 2
DIGEST: 457c87a65271caa7673015854
SUM_ROWS_EXAMINED: 624724
SUM_ROWS_SENT: 10
ratio: '0.0000'
substr(DIGEST_TEXT, 1, 50): 'SELECT DISTINCTROW `concat` ( `u` . `firstName` , '
---
COUNT_STAR: 4
DIGEST: 5872d26e9c861fe4b890f1706
SUM_ROWS_EXAMINED: 2367448
SUM_ROWS_SENT: 72
ratio: '0.0000'
substr(DIGEST_TEXT, 1, 50): SELECT `h` . `number` , `h` . `par` , AVG ( CASE W
---
COUNT_STAR: 213
DIGEST: aa82179f2b7820ec7e073a0bd
SUM_ROWS_EXAMINED: 30731988
SUM_ROWS_SENT: 1704
ratio: '0.0001'
substr(DIGEST_TEXT, 1, 50): SELECT `h` . `number` , `m` . `datePlayed` , `conc
---
COUNT_STAR: 264
DIGEST: f354a030bb8eedcc7bf12c6f1
SUM_ROWS_EXAMINED: 4748832
SUM_ROWS_SENT: 264
ratio: '0.0001'
substr(DIGEST_TEXT, 1, 50): 'SELECT SUM ( CASE WHEN `match0_` . `hometeamId` = '
---
COUNT_STAR: 211
DIGEST: 354003ae085979c9939b8125f
SUM_ROWS_EXAMINED: 2139541
SUM_ROWS_SENT: 211
ratio: '0.0001'
substr(DIGEST_TEXT, 1, 50): SELECT ( SELECT COUNT ( `mrh` . `score` ) FROM `ma
---
COUNT_STAR: 740
DIGEST: f354068ea3bc9cf3ae09e724e
SUM_ROWS_EXAMINED: 28920334
SUM_ROWS_SENT: 3559
ratio: '0.0001'
substr(DIGEST_TEXT, 1, 50): 'SELECT `mr` . `score` - `mr` . `handicap` `score` '
---
COUNT_STAR: 2
DIGEST: 79646e8a4b0fb1569508e8497
SUM_ROWS_EXAMINED: 91162
SUM_ROWS_SENT: 20
ratio: '0.0002'
substr(DIGEST_TEXT, 1, 50): 'SELECT DISTINCTROW `mr` . `score` `score` , `m` . '
---
COUNT_STAR: 2
DIGEST: 4130fa152d490e4e31aab9f1b
SUM_ROWS_EXAMINED: 91162
SUM_ROWS_SENT: 20
ratio: '0.0002'
substr(DIGEST_TEXT, 1, 50): SELECT DISTINCTROW `mr` . `score` - `mr` . `handic
---
COUNT_STAR: 740
DIGEST: 4269116398b6c366722d8075a
SUM_ROWS_EXAMINED: 15530542
SUM_ROWS_SENT: 3559
ratio: '0.0002'
substr(DIGEST_TEXT, 1, 50): SELECT `mr` . `score` , `DATE_FORMAT` ( `m` . `dat
---
COUNT_STAR: 120
DIGEST: 9908e99c3924647a6d8e0665a
SUM_ROWS_EXAMINED: 353762
SUM_ROWS_SENT: 120
ratio: '0.0003'
substr(DIGEST_TEXT, 1, 50): SELECT COUNT ( * ) AS `col_0_0_` FROM `login_attem
---
COUNT_STAR: 402
DIGEST: 2dc085027dc47d76e0f2d27e7
SUM_ROWS_EXAMINED: 1115283
SUM_ROWS_SENT: 402
ratio: '0.0004'
substr(DIGEST_TEXT, 1, 50): SELECT `u` . `full_name` , `gs` . `golfer_id` `id`
---
COUNT_STAR: 2
DIGEST: 7e4ae601e10d06aa56843671a
SUM_ROWS_EXAMINED: 5543
SUM_ROWS_SENT: 2
ratio: '0.0004'
substr(DIGEST_TEXT, 1, 50): SELECT COUNT ( * ) AS `col_0_0_` FROM `login_attem
---
COUNT_STAR: 2
DIGEST: 5f7077e441cadcace2e154b54
SUM_ROWS_EXAMINED: 82892
SUM_ROWS_SENT: 36
ratio: '0.0004'
substr(DIGEST_TEXT, 1, 50): SELECT `h` . `number` , `h` . `par` , AVG ( CASE W
---
COUNT_STAR: 2
DIGEST: d7f2a4c4fa9c98c475d5de9ad
SUM_ROWS_EXAMINED: 82892
SUM_ROWS_SENT: 36
ratio: '0.0004'
substr(DIGEST_TEXT, 1, 50): SELECT `h` . `number` , `h` . `par` , AVG ( CASE W
---
COUNT_STAR: 2
DIGEST: 4f20adb6f7fd8603bd5aff769
SUM_ROWS_EXAMINED: 4397
SUM_ROWS_SENT: 2
ratio: '0.0005'
substr(DIGEST_TEXT, 1, 50): SELECT COUNT ( DISTINCTROW `user1_` . `id` ) AS `c
---
COUNT_STAR: 422
DIGEST: e38ec7bca0dc715113e556fed
SUM_ROWS_EXAMINED: 12355884
SUM_ROWS_SENT: 7596
ratio: '0.0006'
substr(DIGEST_TEXT, 1, 50): SELECT `h` . `number` , `h` . `par` , AVG ( CASE W
```

What stands out to me is how many rows are examined in some of these queries compared to how many are returned. I need to investigate further and tweak the queries or the schema to make it more performant.

## The Wrap-Up

With MySQL, we can gather copious amounts of information about our database server and our schemas. We would typically run multiple queries to collect this information. Using MySQL Shell, we can get more diagnostic information than we likely need with a single command. This information is provided in a tab-separated format and in yaml format. To learn more about gathering diagnostic information or the options available when running `util.debug.collectDiagnostics()`, check out the [documentation](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-debug-diagnostics.html).

Photo by <a href="https://unsplash.com/@nci?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">National Cancer Institute</a> on <a href="https://unsplash.com/photos/person-in-blue-long-sleeve-shirt-holding-blue-plastic-toy-W6yy0wYV-hk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  