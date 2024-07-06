---
title: Server Upgrade Checks with MySQL Shell
date: 2024-06-06T06:00:00
image: /assets/images/2024/server-upgrade-check-mysql-shell/header.jpg
tags: [ "MySQL", "MySQL-Shell" ]
related:
series: mysql-shell-gems
---

Over the last few years, I have become quite smitten with [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/). For those who may not be familiar with MySQL Shell, it is a new(ish) command line interface (CLI) for connecting to and managing MySQL instances. During a recent [episode](https://insidemysql.libsyn.com/mysql-shell-does-all-the-things) of [Inside MySQL: Sakila Speaks](https://insidemysql.libsyn.com/), Fred and I talked to Miguel Araujo about many of the helpful (and lesser known) features of MySQL Shell. This post is the fifth in a series about these "hidden gem" features.

## The Problem

Compatibility concerns can often be the driving force behind deciding not to upgrade to a newer version of MySQL. Wouldn't it be helpful if there was a tool that could look at our existing database and check if there are any issues with updating to a newer version? MySQL Shell has you covered.

## The Solution

The global `util` object in MySQL Shell has a method named `checkForServerUpgrade()` that can check a current database and find any potential issue with upgrading to a newer version of MySQL.

The most straightforward syntax to check for upgrade compatability issues is the following command:

```shell
util.checkForServerUpgrade()
```

When this command is run, it will complete an upgrade check on the database instance MySQL Shell is connected to against the version of MySQL Shell being used to run the check (in my case, I am using version 8.4). In my case, I am checking a database running MySQL 8.0.37 for compatibility issues upgrading to MySQL 8.4. Here are the results of this check:

```text
The MySQL server at 127.0.0.1:3306, version 8.0.37 - MySQL Community Server -
GPL, will now be checked for compatibility issues for upgrade to MySQL 8.4.0.
To check for a different target server version, use the targetVersion option.

1) Removed system variables (removedSysVars)
  No issues found

2) System variables with new default values (sysVarsNewDefaults)
  Warning: Following system variables that are not defined in your
    configuration file will have new default values. Please review if you rely on
    their current values and if so define them before performing upgrade.
  More information:
    https://dev.mysql.com/blog-archive/new-defaults-in-mysql-8-0/

  binlog_transaction_dependency_tracking - default value will change from
    COMMIT_ORDER to WRITESET.
  group_replication_consistency - default value will change from EVENTUAL to
    BEFORE_ON_PRIMARY_FAILOVER.
  group_replication_exit_state_action - default value will change from
    READ_ONLY to OFFLINE_MODE.
  innodb_adaptive_hash_index - default value will change from ON to OFF.
  innodb_buffer_pool_in_core_file - default value will change from ON to OFF.
  innodb_buffer_pool_instances - default value will change from 8 (or 1 if
    innodb_buffer_pool_size < 1GB) to MAX(1, #vcpu/4).
  innodb_change_buffering - default value will change from all to none.
  innodb_doublewrite_files - default value will change from
    innodb_buffer_pool_instances * 2 to 2.
  innodb_doublewrite_pages - default value will change from
    innodb_write_io_threads to 128.
  innodb_flush_method - default value will change from fsynch (unix) or
    unbuffered (windows) to O_DIRECT.
  innodb_io_capacity - default value will change from 200 to 10000.
  innodb_io_capacity_max - default value will change from 200 to 2 x
    innodb_io_capacity.
  innodb_log_buffer_size - default value will change from 16777216 (16MB) to
    67108864 (64MB).
  innodb_log_writer_threads - default value will change from ON to OFF ( if
    #vcpu <= 32 ).
  innodb_numa_interleave - default value will change from OFF to ON.
  innodb_page_cleaners - default value will change from 4 to
    innodb_buffer_pool_instances.
  innodb_parallel_read_threads - default value will change from 4 to
    MAX(#vcpu/8, 4).
  innodb_purge_threads - default value will change from 4 to 1 ( if #vcpu <= 16
    ).
  innodb_read_io_threads - default value will change from 4 to MAX(#vcpu/2, 4).
  innodb_redo_log_capacity - default value will change from 104857600 (100MB)
    to MIN ( #vcpu/2, 16 )GB.

3) Issues reported by 'check table x for upgrade' command (checkTableCommand)
  No issues found

4) Check for deprecated or invalid user authentication methods.
(authMethodUsage)
  Warning: The following users are using the 'mysql_native_password'
  authentication method which is deprecated as of MySQL 8.0.0 and will be
  removed in a future release.
  Consider switching the users to a different authentication method (i.e.
  caching_sha2_password).

  - someDBUser@%

  More information:
    https://dev.mysql.com/doc/refman/8.0/en/caching-sha2-pluggable-authentication.html


5) Check for deprecated or removed plugin usage. (pluginUsage)
  No issues found

6) Check for deprecated or invalid default authentication methods in system
variables. (deprecatedDefaultAuth)
  No issues found

7) Check for deprecated or invalid authentication methods in use by MySQL
Router internal accounts. (deprecatedRouterAuthMethod)
  No issues found

8) Checks for errors in column definitions (columnDefinition)
  No issues found

9) Check for allowed values in System Variables. (sysvarAllowedValues)
  No issues found

10) Checks for user privileges that will be removed (invalidPrivileges)
  Verifies for users containing grants to be removed, since privileges are
    removed as part of the upgrade, raises a NOTICE to inform the user about
    users that will be losing invalid privileges

  'someDBUser'@'%' - The user 'someDBUser'@'%' has the following
    privileges that will be removed as part of the upgrade process: SET_USER_ID
  'root'@'localhost' - The user 'root'@'localhost' has the following privileges
    that will be removed as part of the upgrade process: SET_USER_ID

11) Checks for partitions by key using columns with prefix key indexes
(partitionsWithPrefixKeys)
  No issues found

Errors:   0
Warnings: 21
Notices:  2

NOTE: No fatal errors were found that would prevent an upgrade, but some potential issues were detected. Please ensure that the reported issues are not significant before upgrading.
```

These results show no show-stopping compatibility issues, and most of the output involves details about updates to system variables. Given these results, upgrading to MySQL 8.4 should be possible without changing the existing database.

Check out the [documentation](https://dev.mysql.com/doc/mysql-shell/8.4/en/mysql-shell-utilities-upgrade.html#mysql-utilities-upgrade-checks) for more information on what is checked when we run `util.checkForServerUpgrade()`.

## Checking Other Systems

With MySQL Shell, we can check other systems when running `util.checkForServerUpgrade()`. The syntax for connecting to another system to run the check resembles the following command:

```shell
util.checkForServerUpgrade('user@example.com:3306', {"password":"password"})
```

## Method Options

There are other options available to check server compatibility. These options include:

* **`targetVersion`** - The MySQl version to which the upgrade will be checked.
* **`include`** - A comma separated list of checks to be run.
* **`exclude`** - A comma delimited list of checks to exclude.

For more information on the available options, run the command:

```shell
\? util.checkForServerUpgrade
```

## Wrap-Up

Identifying compatibility issues when upgrading to a newer version of MySQL can be daunting and time-consuming. Addressing those issues can be even more daunting and time-consuming. Using `util.checkForServerUpgrade()` in MySQL Shell, we are able to quickly identify any issues and verify that they have been addressed before moving forward with a system upgrade.

Photo by <a href="https://unsplash.com/@impulsq?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Online Marketing</a> on <a href="https://unsplash.com/photos/doctor-holding-red-stethoscope-hIgeoQjS_iE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  