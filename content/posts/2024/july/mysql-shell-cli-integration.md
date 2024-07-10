---
title: MySQL Shell CLI Integration
date: 2024-07-09T06:00:00
image: /assets/images/2024/mysql-shell-cli-integration/header.jpg
tags: [ "MySQL", "MySQL-Shell" ]
series: mysql-shell-gems
description: Integrating MySQl Shell commands into a scripted process.
---

Over the last few years, I have become quite smitten with [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/). For those who may not be familiar with MySQL Shell, it is a new(ish) command line interface (CLI) for connecting to and managing MySQL instances. During a recent [episode](https://insidemysql.libsyn.com/mysql-shell-does-all-the-things) of [Inside MySQL: Sakila Speaks](https://insidemysql.libsyn.com/), Fred and I talked to Miguel Araujo about many of the helpful (and lesser known) features of MySQL Shell. This post is the tenth in a series about these "hidden gem" features.

## The Problem

I am going to share a problem I had that I wanted to use MySQL Shell to solve. I manage a golf league, and quite a few years ago, I wrote a web application to help me set up schedules, enter scores, etc. When troubleshooting an issue or adding new functionality, I prefer using the latest and most up-to-date data. So, I needed an easy way to pull data from the production server and restore it to the MySQL instance running on my laptop. I had an old shell script that used `mysqldump` to grab the data and the `mysql` command to import it. It worked, but I wanted to see if I could duplicate those tasks using MySQL Shell.

## The Solution

Before I explain everything I need to do, let me share the contents of the shell script, and then I will proceed step-by-step.

```shell
#!/bin/sh

rm -R ~/dumps/league_prod

mysqlsh --ssh ssh_user@gl-db-server --ssh-identity-file ~/.ssh/my_server myuser@localhost:3306 -- util dumpSchemas  golf_league_schema  --output-url ~/dumps/league_prod

mysqlsh scott@localhost -- util loadDump ~/dumps/league_prod --sessionInitSql 'drop schema if exists golf_league_manager' --skipBinLog true
```

In this example, I have MySQL 9.0 Community running on a remote Linux-based server.

### Clearing the Deck

Whenever we dump data using `util.dumpTables()`, `util.dumpSchemas()`, or `util.dumpInstance()`, the local directory we specify the dump should be put in must be empty—we can't do another dump in the same directory. I took the easy way out and decided to hard code the name of the directory in my script, `~/dumps/league_prod`.

With this in mind, I knew I needed to delete the `~/dumps/league_prod` folder before I tried to dump the data from production. For this reason, the first command in my script is:

```shell
rm -R ~/dumps/league_prod
```

### Grabbing Data From Production

Now that I have cleared out the directory where I want to store my dump, we can get down to grabbing the data from the remote server. Because I want to do this as part of a script that requires no interaction, I want to start MySQL Shell and do the dump in one single command rather than connecting to the server and then running `util.dumpSchemas()` from the Shell interface.

Fortunately, we can run MySQL Shell commands as part of a script or other CLI process. The syntax is a little different than if we were running the commands in the MySQL Shell interface.

Here is the command that will handle our dump.

```shell
mysqlsh --ssh ssh_user@gl-db-server --ssh-identity-file ~/.ssh/my_server myuser@localhost:3306 -- util dumpSchemas  golf_league_schema  --output-url ~/dumps/league_prod
```

There is a lot going on here, so I will address each item in the command one by one.

* `mysqlsh` - This part of the command tells my system to run the `mysqlsh` executable.
* `--ssh opc@gl-db-server` - This section of the command tells MySQL Shell to make an SSH connection with the user name `ssh_user` to the domain `gl-db-server` (which is an alias I have in my `hosts` file that points to the Ip address of my server)
* `--ssh-identity-file ~/.ssh/my_server` - This part of the command tells MySQL Shell where the private key is for connecting to `gl-db-server` over SSH.
* `--` - The purpose of this double dash is to tell MySQL Shell that we are done providing Shell options and that what follows needs to be passed to the command line integration.
    * The syntax for providing commands this way follows this syntax: `mysqlsh [options] -- [shell_object]+ object_method [arguments]`
* `util` - This part of the command tells MySQL Shell that we want to use the `util` global object.
* `dumpSchemas` - This section tells MySQL Shell that we want to run the `dumpSchemas()` method of the `util` object.
* `golf_league_schema` - This text Signifies the single schema we want to dump.
* `--output-url ~/dumps/league_prod` - Lastly, we specify the `output-url` for the dump. This directory is the same one we deleted above.
    * Note: This directory is on the machine where the script will be run (my laptop) and not on the remote server.

#### Getting Help

In a [previous post](/posts/2024/may/getting-help-mysql-shell/), I discussed the robust 'help' system in MySQL Shell. You will be happy to learn that this help system extends to using the commands above. To access Help for running commands this way, run the following at a command prompt:

```shell
mysqlsh -- --help
```

The output from this command will resemble the text below:

```text
The following objects provide command line operations:

   cluster
      Represents an InnoDB Cluster.

   clusterset
      Represents an InnoDB ClusterSet.

   dba
      InnoDB Cluster, ReplicaSet, and ClusterSet management functions.

   rs
      Represents an InnoDB ReplicaSet.

   shell
      Gives access to general purpose functions and properties.

   util
      Global object that groups miscellaneous tools like upgrade checker and
      JSON import.

```

This output contains a list of objects available when using MySQL Shell as part of a command-line operation.

To get more info about the `util` object, we would use the following command:

```shell
mysqlsh -- util --help
```

The output of this command will tell us what methods we can use through the command line.

```text
The following object provides command line operations at 'util':

   debug
      Debugging and diagnostic utilities.

The following operations are available at 'util':

   check-for-server-upgrade
      Performs series of tests on specified MySQL server to check if the
      upgrade process will succeed.

   copy-instance
      Copies a source instance to the target instance. Requires an open global
      Shell session to the source instance, if there is none, an exception is
      raised.

   copy-schemas
      Copies schemas from the source instance to the target instance. Requires
      an open global Shell session to the source instance, if there is none, an
      exception is raised.

   copy-tables
      Copies tables and views from schema in the source instance to the target
      instance. Requires an open global Shell session to the source instance,
      if there is none, an exception is raised.

   dump-instance
      Dumps the whole database to files in the output directory.

   dump-schemas
      Dumps the specified schemas to the files in the output directory.

   dump-tables
      Dumps the specified tables or views from the given schema to the files in
      the target directory.

   export-table
      Exports the specified table to the data dump file.

   import-json
      Import JSON documents from file to collection or table in MySQL Server
      using X Protocol session.

   import-table
      Import table dump stored in files to target table using LOAD DATA LOCAL
      INFILE calls in parallel connections.

   load-dump
      Loads database dumps created by MySQL Shell.
```

Lastly, if we want to get information about using `dumpSchemas()`, we would run the command:

```shell
mysqlsh -- util dumpSchemas --help
```

The (lengthy) output from this command will resemble the following:

```text
NAME
      dump-schemas - Dumps the specified schemas to the files in the output
                     directory.

SYNTAX
      util dump-schemas <schemas> --outputUrl=<str> [<options>]

WHERE
      schemas: List of schemas to be dumped.

OPTIONS
--outputUrl=<str>
            Target directory to store the dump files.

--maxRate=<str>
            Limit data read throughput to maximum rate, measured in bytes per
            second per thread. Use maxRate="0" to set no limit. Default: "0".

--showProgress=<bool>
            Enable or disable dump progress information. Default: true if
            stdout is a TTY device, false otherwise.

--compression=<str>
            Compression used when writing the data dump files, one of: "none",
            "gzip", "zstd". Compression level may be specified as
            "gzip;level=8" or "zstd;level=8". Default: "zstd;level=1".

--defaultCharacterSet=<str>
            Character set used for the dump. Default: "utf8mb4".

--dialect=<str>
            Setup fields and lines options that matches specific data file
            format. Can be used as base dialect and customized with
            fieldsTerminatedBy, fieldsEnclosedBy, fieldsEscapedBy,
            fieldsOptionallyEnclosed and linesTerminatedBy options. Must be one
            of the following values: default, csv, tsv or csv-unix. Default:
            "default".

--fieldsTerminatedBy=<str>
            This option has the same meaning as the corresponding clause for
            SELECT ... INTO OUTFILE. Default: "\t".

--fieldsEnclosedBy=<str>
            This option has the same meaning as the corresponding clause for
            SELECT ... INTO OUTFILE. Default: ''.

--fieldsOptionallyEnclosed=<bool>
            Set to true if the input values are not necessarily enclosed within
            quotation marks specified by fieldsEnclosedBy option. Set to false
            if all fields are quoted by character specified by fieldsEnclosedBy
            option. Default: false.

--fieldsEscapedBy=<str>
            This option has the same meaning as the corresponding clause for
            SELECT ... INTO OUTFILE. Default: '\'.

--linesTerminatedBy=<str>
            This option has the same meaning as the corresponding clause for
            SELECT ... INTO OUTFILE. See Section 13.2.10.1, "SELECT ... INTO
            Statement". Default: "\n".

--chunking=<bool>
            Enable chunking of the tables. Default: true.

--bytesPerChunk=<str>
            Sets average estimated number of bytes to be written to each chunk
            file, enables chunking. Default: "64M".

--threads=<uint>
            Use N threads to dump data chunks from the server. Default: 4.

--triggers=<bool>
            Include triggers for each dumped table. Default: true.

--tzUtc=<bool>
            Convert TIMESTAMP data to UTC. Default: true.

--ddlOnly=<bool>
            Only dump Data Definition Language (DDL) from the database.
            Default: false.

--dataOnly=<bool>
            Only dump data from the database. Default: false.

--dryRun=<bool>
            Print information about what would be dumped, but do not dump
            anything. If ocimds is enabled, also checks for compatibility
            issues with MySQL HeatWave Service. Default: false.

--consistent=<bool>
            Enable or disable consistent data dumps. When enabled, produces a
            transactionally consistent dump at a specific point in time.
            Default: true.

--skipConsistencyChecks=<bool>
            Skips additional consistency checks which are executed when running
            consistent dumps and i.e. backup lock cannot not be acquired.
            Default: false.

--ocimds=<bool>
            Enable checks for compatibility with MySQL HeatWave Service.
            Default: false.

--compatibility=<str list>
            Apply MySQL HeatWave Service compatibility modifications when
            writing dump files. Supported values: "create_invisible_pks",
            "force_innodb", "force_non_standard_fks", "ignore_missing_pks",
            "ignore_wildcard_grants", "skip_invalid_accounts",
            "strip_definers", "strip_invalid_grants",
            "strip_restricted_grants", "strip_tablespaces". Default: empty.

--targetVersion=<str>
            Specifies version of the destination MySQL server. Default: current
            version of Shell.

--skipUpgradeChecks=<bool>
            Do not execute the upgrade check utility. Compatibility issues
            related to MySQL version upgrades will not be checked. Use this
            option only when executing the Upgrade Checker separately. Default:
            false.

--excludeTriggers=<str list>
            List of triggers to be excluded from the dump in the format of
            schema.table (all triggers from the specified table) or
            schema.table.trigger (the individual trigger). Default: empty.

--includeTriggers=<str list>
            List of triggers to be included in the dump in the format of
            schema.table (all triggers from the specified table) or
            schema.table.trigger (the individual trigger). Default: empty.

--where=<key>[:<type>]=<value>
            A key-value pair of a table name in the format of schema.table and
            a valid SQL condition expression used to filter the data being
            exported. Default: not set.

--partitions=<key>[:<type>]=<value>
            A key-value pair of a table name in the format of schema.table and
            a list of valid partition names used to limit the data export to
            just the specified partitions. Default: not set.

--checksum=<bool>
            Compute and include checksum of the dumped data. Default: false.

--osBucketName=<str>
            Use specified OCI bucket for the location of the dump. Default: not
            set.

--osNamespace=<str>
            Specifies the namespace where the bucket is located, if not given
            it will be obtained using the tenancy id on the OCI configuration.
            Default: not set.

--ociConfigFile=<str>
            Use the specified OCI configuration file instead of the one at the
            default location. Default: not set.

--ociProfile=<str>
            Use the specified OCI profile instead of the default one. Default:
            not set.

--ociAuth=<str>
            Use the specified authentication method when connecting to the OCI.
            Allowed values: api_key (used when not explicitly set),
            instance_principal, resource_principal, security_token. Default:
            not set.

--s3BucketName=<str>
            Name of the AWS S3 bucket to use. The bucket must already exist.
            Default: not set.

--s3CredentialsFile=<str>
            Use the specified AWS credentials file. Default: not set.

--s3ConfigFile=<str>
            Use the specified AWS config file. Default: not set.

--s3Profile=<str>
            Use the specified AWS profile. Default: not set.

--s3Region=<str>
            Use the specified AWS region. Default: not set.

--s3EndpointOverride=<str>
            Use the specified AWS S3 API endpoint instead of the default one.
            Default: not set.

--azureContainerName=<str>
            Name of the Azure container to use. The container must already
            exist. Default: not set.

--azureConfigFile=<str>
            Use the specified Azure configuration file instead of the one at
            the default location. Default: not set.

--azureStorageAccount=<str>
            The account to be used for the operation. Default: not set.

--azureStorageSasToken=<str>
            Azure Shared Access Signature (SAS) token, to be used for the
            authentication of the operation, instead of a key. Default: not
            set.

--excludeTables=<str list>
            List of tables or views to be excluded from the dump in the format
            of schema.table. Default: empty.

--includeTables=<str list>
            List of tables or views to be included in the dump in the format of
            schema.table. Default: empty.

--events=<bool>
            Include events from each dumped schema. Default: true.

--excludeEvents=<str list>
            List of events to be excluded from the dump in the format of
            schema.event. Default: empty.

--includeEvents=<str list>
            List of events to be included in the dump in the format of
            schema.event. Default: empty.

--routines=<bool>
            Include functions and stored procedures for each dumped schema.
            Default: true.

--excludeRoutines=<str list>
            List of routines to be excluded from the dump in the format of
            schema.routine. Default: empty.

--includeRoutines=<str list>
            List of routines to be included in the dump in the format of
            schema.routine. Default: empty.
```

This output was very enlightening regarding how the command should be formatted, what options are available, and how those options should be provided.

In our example, we are only dumping a single schema, `golf_league_schema`, and saving the output to `~/dumps/league_prod`.

### Loading Data to Local Instance

Now that the data from production has been dumped into a directory on my local system, I need to load that data into the MySQL instance on my local system. Here is the command to handle that:

```shell
mysqlsh scott@localhost -- util loadDump ~/dumps/league_prod --sessionInitSql 'drop schema if exists golf_league_schema' --skipBinLog true
```

This command looks different than the first command. Let's break this down.

* `mysqlsh` - This part of the command tells my system to run the `mysqlsh` executable.
* `scott@localhost`—Since I do not need to connect over SSH, I am using a user named `scott` to connect to an instance running on `localhost`.
* `--` - The purpose of this double dash is to tell MySQL Shell that we are done providing Shell options and that what follows needs to be passed to the command line integration.
    * The syntax for providing commands this way follows this syntax: `mysqlsh [options] -- [shell_object]+ object_method [arguments]`
* `util` - This part of the command tells MySQL Shell that we want to use the `util` global object.
* `loadDump` - This section tells MySQL Shell that we want to run the `loadDump()` method of the `util` object.
* `~/dumps/league_prod` - This part of the command is the path to the directory that contains the dump.
* `--sessionInitSql 'drop schema if exists golf_league_manager'` - An option we have available when loading data from a dump is to run SQL statements before the load process begins. In this case, we use `sessioninitSql` to drop the `golf_league_schema` schema before loading the dump.
* `--skipBinLog true` - The `skipBinLog` option lets us turn off the bin log when importing a database dump. With large datasets, this can improve the performance of the load.

If you would like to get more information about these options or learn about how to pass other options when running `loadDump()` as part of a script or from the command line, use the following command:

```shell
mysqlsh -- util loadDump --help
```

### User Credentials

You may have noticed that I have not provided any user credentials for either of these connections. That is because my instance of MySQL Shell is configured to always save user credentials when I connect to a MySQL instance. One benefit of saving passwords in MySQL Shell is that when I run commands as part of a script, I do not need to include (or provide) the passwords as part of the process.


### The Results

When I run the script above, here is the output I see in my console:

```text
Opening SSH tunnel to gl-db-server:22...

Existing SSH tunnel found, connecting...
Acquiring global read lock
Global read lock acquired
Existing SSH tunnel found, connecting...
Existing SSH tunnel found, connecting...
Existing SSH tunnel found, connecting...
Existing SSH tunnel found, connecting...
Initializing - done 
1 schemas will be dumped and within them 41 tables, 3 views, 1 event, 1 routine, 3 triggers.
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
101% (232.31K rows / ~229.64K rows), 118.38K rows/s, 46.84 MB/s uncompressed, 5.18 MB/s compressed                
Dump duration: 00:00:01s
Total duration: 00:00:03s
Schemas dumped: 1
Tables dumped: 41
Uncompressed data size: 34.15 MB
Compressed data size: 3.47 MB
Compression ratio: 9.8
Rows written: 232311
Bytes written: 3.47 MB
Average uncompressed throughput: 17.44 MB/s
Average compressed throughput: 1.77 MB/s

Loading DDL and Data from '/Users/sstroz/dumps/league_prod' using 4 threads.
Opening dump...
Target is MySQL 9.0.0. Dump was produced from MySQL 9.0.0
Scanning metadata - done       
Checking for pre-existing objects...
Executing common preamble SQL
Executing DDL - done       
Executing view DDL - done       
Starting data load
1 thds loading - 100% (34.15 MB / 34.15 MB), 16.87 MB/s (93.20K rows/s), 40 / 41 tables done
Executing common postamble SQL
Recreating indexes - done       
41 chunks (232.31K rows, 34.15 MB) for 41 tables in 1 schemas were loaded in 2 sec (avg throughput 16.86 MB/s, 114.67K rows/s)
48 DDL files were executed in 0 sec.
Data load duration: 2 sec
1 indexes were recreated in 0 sec.
Total duration: 2 sec
0 warnings were reported during the load.
```

## Wrap Up

Like `mysqldump` and `mysql` executables, MySQL Shell allows us to run commands as part of a scripted process. Because of the way I have MySQL Shell configured, I do not need to provide any passwords when I run this script (nor do I need to include them in the script itself). If you want to learn more about how to integrate MySQL Shell commands into a command line or scripted process, head on over to the [documentation](https://dev.mysql.com/doc/mysql-shell/8.0/en/command-line-integration-overview.html).

Photo by <a href="https://unsplash.com/@christinhumephoto?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Christin Hume</a> on <a href="https://unsplash.com/photos/person-sitting-front-of-laptop-mfB1B1s4sMc?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
    