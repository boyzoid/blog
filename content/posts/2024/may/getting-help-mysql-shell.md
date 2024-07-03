---
title: Getting Help in MySQL Shell
date: 2024-05-30T06:00:00
image: /assets/images/2024/getting-help-mysql-shell/header.jpg
tags: [ "MySQL", "MySQL-Shell" ]
related:
  - /posts/2024/may/mysql-shell-run-scripts/
  - /posts/2024/may/mysql-shell-system-commands/
  - /posts/2024/june/mysql-shell-sandboxes/
  - /posts/2024/june/server-upgrade-check-mysql-shell/
  - /posts/2024/june/connection-status-mysql-shell/
  - /posts/2024/june/managing-mysql-shell-configuration-options/
  - /posts/2024/july/data-dump-mysql-shell/
  - /posts/2024/july/data-load-mysql-shell/
---

Over the last few years, I have become quite smitten with [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/). For those who may not be familiar with MySQL Shell, it is a new(ish) command line interface (CLI) for connecting to and managing MySQL instances. During a recent [episode](https://insidemysql.libsyn.com/mysql-shell-does-all-the-things) of [Inside MySQL: Sakila Speaks](https://insidemysql.libsyn.com/), Fred and I talked to Miguel Araujo about many of the helpful (and lesser known) features of MySQL Shell. This post is the third in a series about these "hidden gem" features.

## The Problem

There are so many things we can do with MySQL Shell. With all the available features, it isn't easy to commit all the possible; commands and options to memory. Fortunately, MySQl Shell has our back.

## The Solution

The 'Help' system in MySQL Shell is quite comprehensive. Using the `\help` (or `\h` or `\?`) command, we can get details about MySQl Shell commands and options. I'll admit that the fact that there is a help system in MySQL Shell is not a hidden gem. However, the extensiveness of the help system qualifies as a hidden gem.

Open up MySQL Shell, connect to a MySQL instance, switch to SQL mode (using the command `\sql`), and run the following command:

```shell
\help
```

In the console, we should see something that resembles the text below:

```text
The Shell Help is organized in categories and topics. To get help for a
specific category or topic use: \? <pattern>

The <pattern> argument should be the name of a category or a topic.

The pattern is a filter to identify topics for which help is required, it can
use the following wildcards:

- ? matches any single character.
- * matches any character sequence.

The following are the main help categories:

 - Shell Commands Provides details about the available built-in shell commands.
 - SQL Syntax     Entry point to retrieve syntax help on SQL statements.

The available topics include:

- The available shell commands.
- Any word that is part of an SQL statement.
- Command Line - invoking built-in shell functions without entering interactive
  mode.

SHELL COMMANDS

The shell commands allow executing specific operations including updating the
shell configuration.

The following shell commands are available:

 - \                         Start multi-line input when in SQL mode.
 - \connect          (\c)    Connects the shell to a MySQL server and assigns
                             the global session.
 - \disconnect               Disconnects the global session.
 - \edit             (\e)    Launch a system editor to edit a command to be
                             executed.
 - \exit                     Exits the MySQL Shell, same as \quit.
 - \G                        Send command to mysql server, display result
                             vertically.
 - \g                        Send command to mysql server.
 - \help             (\?,\h) Prints help information about a specific topic.
 - \history                  View and edit command line history.
 - \js                       Switches to JavaScript processing mode.
 - \nopager                  Disables the current pager.
 - \nowarnings       (\w)    Don't show warnings after every statement.
 - \option                   Allows working with the available shell options.
 - \pager            (\P)    Sets the current pager.
 - \py                       Switches to Python processing mode.
 - \query_attributes         Defines query attributes that apply to the next
                             statement sent to the server for execution.
 - \quit             (\q)    Exits the MySQL Shell.
 - \reconnect                Reconnects the global session.
 - \rehash                   Refresh the autocompletion cache.
 - \show                     Executes the given report with provided options
                             and arguments.
 - \source           (\.)    Loads and executes a script from a file.
 - \sql                      Executes SQL statement or switches to SQL
                             processing mode when no statement is given.
 - \status           (\s)    Print information about the current global
                             session.
 - \system           (\!)    Execute a system shell command.
 - \use              (\u)    Sets the active schema.
 - \warnings         (\W)    Show warnings after every statement.
 - \watch                    Executes the given report with provided options
                             and arguments in a loop.

EXAMPLES
\? sql syntax
      Displays the main SQL help categories.

\? select
      Displays information about the SELECT SQL statement.
```

## SQL Syntax Example

Let's take a look at the first example that is provided and run the command:

```shell
\? sql syntax
```

We should see output in the console that resembles:

```text
Found several entries matching sql syntax

The following topics were found at the SQL Syntax category:

- Account Management
- Administration
- Components
- Compound Statements
- Contents
- Data Definition
- Data Manipulation
- Data Types
- Functions
- Geographic Features
- Help Metadata
- Language Structure
- Loadable Functions
- Plugins
- Prepared Statements
- Replication Statements
- Storage Engines
- Table Maintenance
- Transactions
- Utility

For help on a specific topic use: \? <topic>

e.g.: \? Account Management
```
### Data Types
Let's tak a look at what help is available for `Data Types` by using the command:

```shell
\? Data Types
```

In the console, we will see the following:

```text
Found several entries matching Data Types

The following topics were found at the SQL Syntax category:

- AUTO_INCREMENT
- BIGINT
- BINARY
- BIT
- BLOB
- BLOB DATA TYPE
- BOOLEAN
- CHAR
- CHAR BYTE
- DATE
- DATETIME
- DEC
- DECIMAL
- DOUBLE
- DOUBLE PRECISION
- ENUM
- FLOAT
- INT
- INTEGER
- LONGBLOB
- LONGTEXT
- MEDIUMBLOB
- MEDIUMINT
- MEDIUMTEXT
- SET DATA TYPE
- SMALLINT
- TEXT
- TIME
- TIMESTAMP
- TINYBLOB
- TINYINT
- TINYTEXT
- VARBINARY
- VARCHAR
- YEAR DATA TYPE

For help on a specific topic use: \? <topic>

e.g.: \? AUTO_INCREMENT
```

Here, we see another list of possible options.

#### Tinyint Example

Let's run the following command to get info on the `tinyint` data type:

```shell
\? tinyint
```

Now, we should see output like the text below:

```text
TINYINT[(M)] [UNSIGNED] [ZEROFILL]

A very small integer. The signed range is -128 to 127. The unsigned
range is 0 to 255.

URL: https://dev.mysql.com/doc/refman/8.3/en/numeric-type-syntax.html
```

I am a big fan of the URL being included when appropriate.

### SELECT Example

Use the following command for more information about the `select` clause.

```shell
\? select
```

This command gives the following output:

```text
Syntax:
SELECT
    [ALL | DISTINCT | DISTINCTROW ]
    [HIGH_PRIORITY]
    [STRAIGHT_JOIN]
    [SQL_SMALL_RESULT] [SQL_BIG_RESULT] [SQL_BUFFER_RESULT]
    [SQL_NO_CACHE] [SQL_CALC_FOUND_ROWS]
    select_expr [, select_expr] ...
    [into_option]
    [FROM table_references
      [PARTITION partition_list]]
    [WHERE where_condition]
    [GROUP BY {col_name | expr | position}, ... [WITH ROLLUP]]
    [HAVING where_condition]
    [WINDOW window_name AS (window_spec)
        [, window_name AS (window_spec)] ...]
    [ORDER BY {col_name | expr | position}
      [ASC | DESC], ... [WITH ROLLUP]]
    [LIMIT {[offset,] row_count | row_count OFFSET offset}]
    [into_option]
    [FOR {UPDATE | SHARE}
        [OF tbl_name [, tbl_name] ...]
        [NOWAIT | SKIP LOCKED]
      | LOCK IN SHARE MODE]
    [into_option]

into_option: {
    INTO OUTFILE 'file_name'
        [CHARACTER SET charset_name]
        export_options
  | INTO DUMPFILE 'file_name'
  | INTO var_name [, var_name] ...
}

SELECT is used to retrieve rows selected from one or more tables, and
can include UNION operations and subqueries. INTERSECT and EXCEPT
operations are also supported. The UNION, INTERSECT, and EXCEPT
operators are described in more detail later in this section. See also
https://dev.mysql.com/doc/refman/8.3/en/subqueries.html.

A SELECT statement can start with a WITH clause to define common table
expressions accessible within the SELECT. See
https://dev.mysql.com/doc/refman/8.3/en/with.html.

The most commonly used clauses of SELECT statements are these:

o Each select_expr indicates a column that you want to retrieve. There
  must be at least one select_expr.

o table_references indicates the table or tables from which to retrieve
  rows. Its syntax is described in [HELP JOIN].

o SELECT supports explicit partition selection using the PARTITION
  clause with a list of partitions or subpartitions (or both) following
  the name of the table in a table_reference (see [HELP JOIN]). In this
  case, rows are selected only from the partitions listed, and any
  other partitions of the table are ignored. For more information and
  examples, see
  https://dev.mysql.com/doc/refman/8.3/en/partitioning-selection.html.

o The WHERE clause, if given, indicates the condition or conditions
  that rows must satisfy to be selected. where_condition is an
  expression that evaluates to true for each row to be selected. The
  statement selects all rows if there is no WHERE clause.

  In the WHERE expression, you can use any of the functions and
  operators that MySQL supports, except for aggregate (group)
  functions. See
  https://dev.mysql.com/doc/refman/8.3/en/expressions.html, and
  https://dev.mysql.com/doc/refman/8.3/en/functions.html.

SELECT can also be used to retrieve rows computed without reference to
any table.

URL: https://dev.mysql.com/doc/refman/8.3/en/select.html
```

Note that this output demonstrates the syntax of `select` (including using `INTO`), mentions common table expressions (CTEs), offers more information on what is supported in a `select`, and provides the URL to the documentation.

## Mode Specific Help

Let's see how the help system differs depending on what mode we are using. Switch to JavaScript mode (using the `\js` command), and run the following command:

```shell
\?
```

The output in the console differs from when we ran the same command in `SQL` mode.

```text
The Shell Help is organized in categories and topics. To get help for a
specific category or topic use: \? <pattern>

The <pattern> argument should be the name of a category or a topic.

The pattern is a filter to identify topics for which help is required, it can
use the following wildcards:

- ? matches any single character.
- * matches any character sequence.

The following are the main help categories:

 - AdminAPI       The AdminAPI is an API that enables configuring and managing
                  InnoDB Clusters, ReplicaSets, ClusterSets, among other
                  things.
 - Shell Commands Provides details about the available built-in shell commands.
 - ShellAPI       Contains information about the shell and util global objects
                  as well as the mysql module that enables executing SQL on
                  MySQL Servers.
 - SQL Syntax     Entry point to retrieve syntax help on SQL statements.
 - X DevAPI       Details the mysqlx module as well as the capabilities of the
                  X DevAPI which enable working with MySQL as a Document Store

The available topics include:

- The dba global object and the classes available at the AdminAPI.
- The mysqlx module and the classes available at the X DevAPI.
- The mysql module and the global objects and classes available at the
  ShellAPI.
- The functions and properties of the classes exposed by the APIs.
- The available shell commands.
- Any word that is part of an SQL statement.
- Command Line - invoking built-in shell functions without entering interactive
  mode.

SHELL COMMANDS

The shell commands allow executing specific operations including updating the
shell configuration.

The following shell commands are available:

 - \                   Start multi-line input when in SQL mode.
 - \connect    (\c)    Connects the shell to a MySQL server and assigns the
                       global session.
 - \disconnect         Disconnects the global session.
 - \edit       (\e)    Launch a system editor to edit a command to be executed.
 - \exit               Exits the MySQL Shell, same as \quit.
 - \help       (\?,\h) Prints help information about a specific topic.
 - \history            View and edit command line history.
 - \js                 Switches to JavaScript processing mode.
 - \nopager            Disables the current pager.
 - \nowarnings (\w)    Don't show warnings after every statement.
 - \option             Allows working with the available shell options.
 - \pager      (\P)    Sets the current pager.
 - \py                 Switches to Python processing mode.
 - \quit       (\q)    Exits the MySQL Shell.
 - \reconnect          Reconnects the global session.
 - \rehash             Refresh the autocompletion cache.
 - \show               Executes the given report with provided options and
                       arguments.
 - \source     (\.)    Loads and executes a script from a file.
 - \sql                Executes SQL statement or switches to SQL processing
                       mode when no statement is given.
 - \status     (\s)    Print information about the current global session.
 - \system     (\!)    Execute a system shell command.
 - \use        (\u)    Sets the active schema.
 - \warnings   (\W)    Show warnings after every statement.
 - \watch              Executes the given report with provided options and
                       arguments in a loop.

GLOBAL OBJECTS

The following modules and objects are ready for use when the shell starts:

 - audit             Audit table management and utilities.
 - check             Check management and utilities.
 - collations        Collation utilities
 - config            MySQL configuration utility.
 - dba               Used for InnoDB Cluster, ReplicaSet, and ClusterSet
                     administration.
 - demo              A demo plugin that showcases the shell's plugin feature.
 - group_replication MySQL Group Replication management and utilities. A
                     collection of functions to handle MySQL Group Replication
                     without using MySQL InnoDB Cluster (no metadata)
 - heatwave_utils    Heatwave Utils
 - innodb            InnoDB management and utilities.
 - innodb_cluster    MySQL InnoDB Cluster management and utilities.
 - legacy_connect    Connect to MySQL like old days.
 - locks             Locks information utilities.
 - logs              MySQL Logs Utility.
 - maintenance       Server management and utilities.
 - mysql             Support for connecting to MySQL servers using the classic
                     MySQL protocol.
 - mysqlx            Used to work with X Protocol sessions using the MySQL X
                     DevAPI.
 - os                Gives access to functions which allow to interact with the
                     operating system.
 - plugins           Plugin to manage MySQL Shell plugins
 - profiling         Statement Profiling Object using Performance Schema.
 - proxysql          ProxySQL Object.
 - qep               Query Execution Plan utilities.
 - replication       Replication utilities.
 - router            MySQL Router Object.
 - sandboxes         MySQL Shell Sandboxes management.
 - scan              Scan data for viruses
 - schema_utils      Schema management and utilities.
 - security
 - session           Represents the currently open MySQL session.
 - shell             Gives access to general purpose functions and properties.
 - support           Getting Information useful for requesting help.
 - sys               Gives access to system specific parameters.
 - user              Junior DBA Wizard to manage users.
 - util              Global object that groups miscellaneous tools like upgrade
                     checker and JSON import.

For additional information on these global objects use: <object>.help()

EXAMPLES
\? AdminAPI
      Displays information about the AdminAPI.

\? \connect
      Displays usage details for the \connect command.

\? checkInstanceConfiguration
      Displays usage details for the dba.checkInstanceConfiguration function.

\? sql syntax
      Displays the main SQL help categories.
```

### MySQL Shell Utility Help

I use the dump and load features of MySQL Shell quite often. The functions that handle this functionality are part of the `util` global object in MySQL Shell. To see information about the `util` object, we run the command:

```shell
\? util
```

When we run this command, the console output should resemble the following:

```text
NAME
      util - Global object that groups miscellaneous tools like upgrade checker
             and JSON import.

DESCRIPTION
      Global object that groups miscellaneous tools like upgrade checker and
      JSON import.

PROPERTIES
      debug
            Debugging and diagnostic utilities.

FUNCTIONS
      checkForServerUpgrade([connectionData][, options])
            Performs series of tests on specified MySQL server to check if the
            upgrade process will succeed.

      copyInstance(connectionData[, options])
            Copies a source instance to the target instance. Requires an open
            global Shell session to the source instance, if there is none, an
            exception is raised.

      copySchemas(schemas, connectionData[, options])
            Copies schemas from the source instance to the target instance.
            Requires an open global Shell session to the source instance, if
            there is none, an exception is raised.

      copyTables(schema, tables, connectionData[, options])
            Copies tables and views from schema in the source instance to the
            target instance. Requires an open global Shell session to the
            source instance, if there is none, an exception is raised.

      dumpInstance(outputUrl[, options])
            Dumps the whole database to files in the output directory.

      dumpSchemas(schemas, outputUrl[, options])
            Dumps the specified schemas to the files in the output directory.

      dumpTables(schema, tables, outputUrl[, options])
            Dumps the specified tables or views from the given schema to the
            files in the target directory.

      exportTable(table, outputUrl[, options])
            Exports the specified table to the data dump file.

      help([member])
            Provides help about this object and it's members

      importJson(file[, options])
            Import JSON documents from file to collection or table in MySQL
            Server using X Protocol session.

      importTable(files[, options])
            Import table dump stored in files to target table using LOAD DATA
            LOCAL INFILE calls in parallel connections.

      loadDump(url[, options])
            Loads database dumps created by MySQL Shell.
```

### DumpSchemas Example

Let's assume we want to dump one or more schemas from our instance but cannot recall the syntax of the `dumpSchemas()` method. The command below will return details about `dumpSchemas()`.

```shell
\? dumpSchemas
```

The console will now show you everything you need to know about using `dumpSchemas()` - including details about all available options that can be provided in a JSON object.

```text
NAME
      dumpSchemas - Dumps the specified schemas to the files in the output
                    directory.

SYNTAX
      util.dumpSchemas(schemas, outputUrl[, options])

WHERE
      schemas: List of schemas to be dumped.
      outputUrl: Target directory to store the dump files.
      options: Dictionary with the dump options.

DESCRIPTION
      The schemas parameter cannot be an empty list.

      The outputUrl specifies where the dump is going to be stored.

      The value for this parameter can be either:

      - The path to the target location in a local filesystem or one of the
        supported cloud storage buckets
      - A Pre-Authenticated Request (PAR) to a bucket in OCI Object Storage

      By default, a local directory is used, and in this case outputUrl can be
      prefixed with file:// scheme. If a relative path is given, the absolute
      path is computed as relative to the current working directory. If the
      output directory does not exist but its parent does, it is created. If
      the output directory exists, it must be empty. All directories are
      created with the following access rights (on operating systems which
      support them): rwxr-x---. All files are created with the following access
      rights (on operating systems which support them): rw-r-----.

      For additional details on using PARs see the Dumping to OCI Object
      Storage using Pre-Authenticated Request (PAR) section.

      The following options are supported:

      - excludeTables: list of strings (default: empty) - List of tables or
        views to be excluded from the dump in the format of schema.table.
      - includeTables: list of strings (default: empty) - List of tables or
        views to be included in the dump in the format of schema.table.
      - ocimds: bool (default: false) - Enable checks for compatibility with
        MySQL HeatWave Service.
      - compatibility: list of strings (default: empty) - Apply MySQL HeatWave
        Service compatibility modifications when writing dump files. Supported
        values: "create_invisible_pks", "force_innodb", "ignore_missing_pks",
        "ignore_wildcard_grants", "skip_invalid_accounts", "strip_definers",
        "strip_invalid_grants", "strip_restricted_grants", "strip_tablespaces".
      - targetVersion: string (default: current version of Shell) - Specifies
        version of the destination MySQL server.
      - skipUpgradeChecks: bool (default: false) - Do not execute the upgrade
        check utility. Compatibility issues related to MySQL version upgrades
        will not be checked. Use this option only when executing the Upgrade
        Checker separately.
      - events: bool (default: true) - Include events from each dumped schema.
      - excludeEvents: list of strings (default: empty) - List of events to be
        excluded from the dump in the format of schema.event.
      - includeEvents: list of strings (default: empty) - List of events to be
        included in the dump in the format of schema.event.
      - routines: bool (default: true) - Include functions and stored
        procedures for each dumped schema.
      - excludeRoutines: list of strings (default: empty) - List of routines to
        be excluded from the dump in the format of schema.routine.
      - includeRoutines: list of strings (default: empty) - List of routines to
        be included in the dump in the format of schema.routine.
      - triggers: bool (default: true) - Include triggers for each dumped
        table.
      - excludeTriggers: list of strings (default: empty) - List of triggers to
        be excluded from the dump in the format of schema.table (all triggers
        from the specified table) or schema.table.trigger (the individual
        trigger).
      - includeTriggers: list of strings (default: empty) - List of triggers to
        be included in the dump in the format of schema.table (all triggers
        from the specified table) or schema.table.trigger (the individual
        trigger).
      - where: dictionary (default: not set) - A key-value pair of a table name
        in the format of schema.table and a valid SQL condition expression used
        to filter the data being exported.
      - partitions: dictionary (default: not set) - A key-value pair of a table
        name in the format of schema.table and a list of valid partition names
        used to limit the data export to just the specified partitions.
      - tzUtc: bool (default: true) - Convert TIMESTAMP data to UTC.
      - consistent: bool (default: true) - Enable or disable consistent data
        dumps. When enabled, produces a transactionally consistent dump at a
        specific point in time.
      - skipConsistencyChecks: bool (default: false) - Skips additional
        consistency checks which are executed when running consistent dumps and
        i.e. backup lock cannot not be acquired.
      - ddlOnly: bool (default: false) - Only dump Data Definition Language
        (DDL) from the database.
      - dataOnly: bool (default: false) - Only dump data from the database.
      - checksum: bool (default: false) - Compute and include checksum of the
        dumped data.
      - dryRun: bool (default: false) - Print information about what would be
        dumped, but do not dump anything. If ocimds is enabled, also checks for
        compatibility issues with MySQL HeatWave Service.
      - chunking: bool (default: true) - Enable chunking of the tables.
      - bytesPerChunk: string (default: "64M") - Sets average estimated number
        of bytes to be written to each chunk file, enables chunking.
      - threads: int (default: 4) - Use N threads to dump data chunks from the
        server.
      - fieldsTerminatedBy: string (default: "\t") - This option has the same
        meaning as the corresponding clause for SELECT ... INTO OUTFILE.
      - fieldsEnclosedBy: char (default: '') - This option has the same meaning
        as the corresponding clause for SELECT ... INTO OUTFILE.
      - fieldsEscapedBy: char (default: '\') - This option has the same meaning
        as the corresponding clause for SELECT ... INTO OUTFILE.
      - fieldsOptionallyEnclosed: bool (default: false) - Set to true if the
        input values are not necessarily enclosed within quotation marks
        specified by fieldsEnclosedBy option. Set to false if all fields are
        quoted by character specified by fieldsEnclosedBy option.
      - linesTerminatedBy: string (default: "\n") - This option has the same
        meaning as the corresponding clause for SELECT ... INTO OUTFILE. See
        Section 13.2.10.1, "SELECT ... INTO Statement".
      - dialect: enum (default: "default") - Setup fields and lines options
        that matches specific data file format. Can be used as base dialect and
        customized with fieldsTerminatedBy, fieldsEnclosedBy, fieldsEscapedBy,
        fieldsOptionallyEnclosed and linesTerminatedBy options. Must be one of
        the following values: default, csv, tsv or csv-unix.
      - maxRate: string (default: "0") - Limit data read throughput to maximum
        rate, measured in bytes per second per thread. Use maxRate="0" to set
        no limit.
      - showProgress: bool (default: true if stdout is a TTY device, false
        otherwise) - Enable or disable dump progress information.
      - defaultCharacterSet: string (default: "utf8mb4") - Character set used
        for the dump.
      - compression: string (default: "zstd;level=1") - Compression used when
        writing the data dump files, one of: "none", "gzip", "zstd".
        Compression level may be specified as "gzip;level=8" or "zstd;level=8".
      - osBucketName: string (default: not set) - Use specified OCI bucket for
        the location of the dump.
      - osNamespace: string (default: not set) - Specifies the namespace where
        the bucket is located, if not given it will be obtained using the
        tenancy id on the OCI configuration.
      - ociConfigFile: string (default: not set) - Use the specified OCI
        configuration file instead of the one at the default location.
      - ociProfile: string (default: not set) - Use the specified OCI profile
        instead of the default one.
      - s3BucketName: string (default: not set) - Name of the AWS S3 bucket to
        use. The bucket must already exist.
      - s3CredentialsFile: string (default: not set) - Use the specified AWS
        credentials file.
      - s3ConfigFile: string (default: not set) - Use the specified AWS config
        file.
      - s3Profile: string (default: not set) - Use the specified AWS profile.
      - s3Region: string (default: not set) - Use the specified AWS region.
      - s3EndpointOverride: string (default: not set) - Use the specified AWS
        S3 API endpoint instead of the default one.
      - azureContainerName: string (default: not set) - Name of the Azure
        container to use. The container must already exist.
      - azureConfigFile: string (default: not set) - Use the specified Azure
        configuration file instead of the one at the default location.
      - azureStorageAccount: string (default: not set) - The account to be used
        for the operation.
      - azureStorageSasToken: string (default: not set) - Azure Shared Access
        Signature (SAS) token, to be used for the authentication of the
        operation, instead of a key.

      Requirements

      - MySQL Server 5.7 or newer is required.
      - Size limit for individual files uploaded to the OCI or AWS S3 bucket is
        1.2 TiB.
      - Columns with data types which are not safe to be stored in text form
        (i.e. BLOB) are converted to Base64, hence the size of such columns
        cannot exceed approximately 0.74 * max_allowed_packet bytes, as
        configured through that system variable at the target server.
      - Schema object names must use latin1 or utf8 character set.
      - Only tables which use the InnoDB storage engine are guaranteed to be
        dumped with consistent data.

      Details

      This operation writes SQL files per each schema, table and view dumped,
      along with some global SQL files.

      Table data dumps are written to text files using the specified file
      format, optionally splitting them into multiple chunk files.

      Requires an open, global Shell session, and uses its connection options,
      such as compression, ssl-mode, etc., to establish additional connections.

      Data dumps cannot be created for the following tables:

      - mysql.apply_status
      - mysql.general_log
      - mysql.schema
      - mysql.slow_log

      Options

      The names given in the exclude{object}, include{object}, where or
      partitions options should be valid MySQL identifiers, quoted using
      backtick characters when required.

      If the exclude{object}, include{object}, where or partitions options
      contain an object which does not exist, or an object which belongs to a
      schema which does not exist, it is ignored.

      The tzUtc option allows dumping TIMESTAMP data when a server has data in
      different time zones or data is being moved between servers with
      different time zones.

      If the consistent option is set to true, a global read lock is set using
      the FLUSH TABLES WITH READ LOCK statement, all threads establish
      connections with the server and start transactions using:

      - SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ
      - START TRANSACTION WITH CONSISTENT SNAPSHOT

      Once all the threads start transactions, the instance is locked for
      backup and the global read lock is released.

      If the account used for the dump does not have enough privileges to
      execute FLUSH TABLES, LOCK TABLES will be used as a fallback instead. All
      tables being dumped, in addition to DDL and GRANT related tables in the
      mysql schema will be temporarily locked.

      The ddlOnly and dataOnly options cannot both be set to true at the same
      time.

      The chunking option causes the the data from each table to be split and
      written to multiple chunk files. If this option is set to false, table
      data is written to a single file.

      If the chunking option is set to true, but a table to be dumped cannot be
      chunked (for example if it does not contain a primary key or a unique
      index), data is dumped to multiple files using a single thread.

      The value of the threads option must be a positive number.

      The dialect option predefines the set of options fieldsTerminatedBy (FT),
      fieldsEnclosedBy (FE), fieldsOptionallyEnclosed (FOE), fieldsEscapedBy
      (FESC) and linesTerminatedBy (LT) in the following manner:

      - default: no quoting, tab-separated, LF line endings. (LT=<LF>,
        FESC='\', FT=<TAB>, FE=<empty>, FOE=false)
      - csv: optionally quoted, comma-separated, CRLF line endings.
        (LT=<CR><LF>, FESC='\', FT=",", FE='"', FOE=true)
      - tsv: optionally quoted, tab-separated, CRLF line endings. (LT=<CR><LF>,
        FESC='\', FT=<TAB>, FE='"', FOE=true)
      - csv-unix: fully quoted, comma-separated, LF line endings. (LT=<LF>,
        FESC='\', FT=",", FE='"', FOE=false)

      Both the bytesPerChunk and maxRate options support unit suffixes:

      - k - for kilobytes,
      - M - for Megabytes,
      - G - for Gigabytes,

      i.e. maxRate="2k" - limit throughput to 2000 bytes per second.

      The value of the bytesPerChunk option cannot be smaller than "128k".

      MySQL HeatWave Service Compatibility

      The MySQL HeatWave Service has a few security related restrictions that
      are not present in a regular, on-premise instance of MySQL. In order to
      make it easier to load existing databases into the Service, the dump
      commands in the MySQL Shell has options to detect potential issues and in
      some cases, to automatically adjust your schema definition to be
      compliant. For best results, always use the latest available version of
      MySQL Shell.

      The ocimds option, when set to true, will perform schema checks for most
      of these issues and abort the dump if any are found. The loadDump()
      command will also only allow loading dumps that have been created with
      the "ocimds" option enabled.

      Some issues found by the ocimds option may require you to manually make
      changes to your database schema before it can be loaded into the MySQL
      HeatWave Service. However, the compatibility option can be used to
      automatically modify the dumped schema SQL scripts, resolving some of
      these compatibility issues. You may pass one or more of the following
      values to the "compatibility" option.

      create_invisible_pks - Each table which does not have a Primary Key will
      have one created when the dump is loaded. The following Primary Key is
      added to the table:
      `my_row_id` BIGINT UNSIGNED AUTO_INCREMENT INVISIBLE PRIMARY KEY

      Dumps created with this value can be used with Inbound Replication into
      an MySQL HeatWave Service DB System instance with High Availability, as
      long as target instance has version 8.0.32 or newer. Mutually exclusive
      with the ignore_missing_pks value.

      force_innodb - The MySQL HeatWave Service requires use of the InnoDB
      storage engine. This option will modify the ENGINE= clause of CREATE
      TABLE statements that use incompatible storage engines and replace them
      with InnoDB. It will also remove the ROW_FORMAT=FIXED option, as it is
      not supported by the InnoDB storage engine.

      ignore_missing_pks - Ignore errors caused by tables which do not have
      Primary Keys. Dumps created with this value cannot be used in MySQL
      HeatWave Service DB System instance with High Availability. Mutually
      exclusive with the create_invisible_pks value.

      ignore_wildcard_grants - Ignore errors from grants on schemas with
      wildcards, which are interpreted differently in systems where
      partial_revokes system variable is enabled.

      skip_invalid_accounts - Skips accounts which do not have a password or
      use authentication methods (plugins) not supported by the MySQL HeatWave
      Service.

      strip_definers - This option should not be used if the destination MySQL
      HeatWave Service DB System instance has version 8.2.0 or newer. In such
      case, the administrator role is granted the SET_ANY_DEFINER privilege.
      Users which have this privilege are able to specify any valid
      authentication ID in the DEFINER clause.

      Strips the "DEFINER=account" clause from views, routines, events and
      triggers. The MySQL HeatWave Service requires special privileges to
      create these objects with a definer other than the user loading the
      schema. By stripping the DEFINER clause, these objects will be created
      with that default definer. Views and routines will additionally have
      their SQL SECURITY clause changed from DEFINER to INVOKER. If this
      characteristic is missing, SQL SECURITY INVOKER clause will be added.
      This ensures that the access permissions of the account querying or
      calling these are applied, instead of the user that created them. This
      should be sufficient for most users, but if your database security model
      requires that views and routines have more privileges than their invoker,
      you will need to manually modify the schema before loading it.

      Please refer to the MySQL manual for details about DEFINER and SQL
      SECURITY.

      strip_invalid_grants - Strips grant statements which would fail when
      users are loaded, i.e. grants referring to a specific routine which does
      not exist.

      strip_restricted_grants - Certain privileges are restricted in the MySQL
      HeatWave Service. Attempting to create users granting these privileges
      would fail, so this option allows dumped GRANT statements to be stripped
      of these privileges. If the destination MySQL version supports the
      SET_ANY_DEFINER privilege, the SET_USER_ID privilege is replaced with
      SET_ANY_DEFINER instead of being stripped.

      strip_tablespaces - Tablespaces have some restrictions in the MySQL
      HeatWave Service. If you'd like to have tables created in their default
      tablespaces, this option will strip the TABLESPACE= option from CREATE
      TABLE statements.

      Additionally, the following changes will always be made to DDL scripts
      when the ocimds option is enabled:

      - DATA DIRECTORY, INDEX DIRECTORY and ENCRYPTION options in CREATE TABLE
        statements will be commented out.

      In order to use Inbound Replication into an MySQL HeatWave Service DB
      System instance with High Availability where instance has version older
      than 8.0.32, all tables at the source server need to have Primary Keys.
      This needs to be fixed manually before running the dump. Starting with
      MySQL 8.0.23 invisible columns may be used to add Primary Keys without
      changing the schema compatibility, for more information see:
      https://dev.mysql.com/doc/refman/en/invisible-columns.html.

      In order to use Inbound Replication into an MySQL HeatWave Service DB
      System instance with High Availability, please see
      https://docs.oracle.com/en-us/iaas/mysql-database/doc/creating-replication-channel.html.

      In order to use MySQL HeatWave Service DB Service instance with High
      Availability, all tables must have a Primary Key. This can be fixed
      automatically using the create_invisible_pks compatibility value.

      Please refer to the MySQL HeatWave Service documentation for more
      information about restrictions and compatibility.

      Dumping to a Bucket in the OCI Object Storage

      There are 2 ways to create a dump in OCI Object Storage:

      - By using the standard client OCI configuration.
      - By using a Pre-Authenticated Request (PAR).

      Dumping to OCI Object Storage using the client OCI configuration

      The osBucketName option is used to indicate the connection is established
      using the locally configured OCI client profile.

      If the osBucketName option is used, the dump is stored in the specified
      OCI bucket, connection is established using the local OCI profile. The
      directory structure is simulated within the object name.

      The osNamespace, ociConfigFile and ociProfile options cannot be used if
      the osBucketName option is set to an empty string.

      The osNamespace option overrides the OCI namespace obtained based on the
      tenancy ID from the local OCI profile.

      Dumping to OCI Object Storage using Pre-Authenticated Request (PAR)

      When using a PAR to create a dump, no client OCI configuration is needed
      to perform the dump operation. A bucket or prefix PAR with the following
      access types is required to perform a dump with this method:

      - Permit object reads and writes.
      - Enable object listing.

      When using a bucket PAR, the generated PAR URL should be used as the
      output_url argument for the dump operation. i.e. the following is a
      bucket PAR to create dump at the root folder of the 'test' bucket: 

          https://*.objectstorage.*.oci.customer-oci.com/p/*/n/*/b/test/o/

      When using a prefix PAR, the output_url argument should contain the PAR
      URL itself and the prefix used to generate it. i.e. the following is a
      prefix PAR to create a dump at the 'dump' folder of the 'test' bucket.
      The PAR was created using 'dump' as prefix: 

          https://*.objectstorage.*.oci.customer-oci.com/p/*/n/*/b/test/o/dump/

      Note that both the bucket and the prefix PAR URLs must end with a slash,
      otherwise it will be considered invalid.

      When using a PAR, a temporary directory is created to be used as staging
      area; each file is initially buffered to disk and then sent to the target
      bucket, deleting it when it is transferred.

      This will be done on the system temporary directory, defined by any of
      the following environment variables:

      - POSIX: TMPDIR, TMP, TEMP, TEMPDIR. If none is defined, uses /tmp.
      - Windows: TMP, TEMP, USERPROFILE. If none is defined, uses the Windows
        directory.

      Enabling dump loading using pre-authenticated requests

      The loadDump utility supports loading a dump using a pre-authenticated
      request (PAR). The simplest way to do this is by providing a PAR to the
      location of the dump in a bucket, the PAR must be created with the
      following permissions:

      - Permits object reads
      - Enables object listing

      The generated URL can be used to load the dump, see \? loadDump for more
      details.

      Dumping to a Bucket in the AWS S3 Object Storage

      If the s3BucketName option is used, the dump is stored in the specified
      AWS S3 bucket. Connection is established using default local AWS
      configuration paths and profiles, unless overridden. The directory
      structure is simulated within the object name.

      The s3CredentialsFile, s3ConfigFile, s3Profile, s3Region and
      s3EndpointOverride options cannot be used if the s3BucketName option is
      not set or set to an empty string.

      All failed connections to AWS S3 are retried three times, with a 1 second
      delay between retries. If a failure occurs 10 minutes after the
      connection was created, the delay is changed to an exponential back-off
      strategy:

      - first delay: 3-6 seconds
      - second delay: 18-36 seconds
      - third delay: 40-80 seconds

      Handling of the AWS settings

      The AWS options are evaluated in the order of precedence, the first
      available value is used.

      1. Name of the AWS profile:

      - the s3Profile option
      - the AWS_PROFILE environment variable
      - the AWS_DEFAULT_PROFILE environment variable
      - the default value of default

      2. Location of the credentials file:

      - the s3CredentialsFile option
      - the AWS_SHARED_CREDENTIALS_FILE environment variable
      - the default value of ~/.aws/credentials

      3. Location of the config file:

      - the s3ConfigFile option
      - the AWS_CONFIG_FILE environment variable
      - the default value of ~/.aws/config

      4. Name of the AWS region:

      - the s3Region option
      - the AWS_REGION environment variable
      - the AWS_DEFAULT_REGION environment variable
      - the region setting from the config file for the specified profile
      - the default value of us-east-1

      5. URI of AWS S3 API endpoint

      - the s3EndpointOverride option
      - the default value of https://<s3BucketName>.s3.<region>.amazonaws.com

      The AWS credentials are fetched from the following providers, in the
      order of precedence:

      1. Environment variables:

      - AWS_ACCESS_KEY_ID
      - AWS_SECRET_ACCESS_KEY
      - AWS_SESSION_TOKEN

      2. Settings from the credentials file for the specified profile:

      - aws_access_key_id
      - aws_secret_access_key
      - aws_session_token

      3. Process specified by the credential_process setting from the config
         file for the specified profile:

      - AccessKeyId
      - SecretAccessKey
      - SessionToken

      4. Settings from the config file for the specified profile:

      - aws_access_key_id
      - aws_secret_access_key
      - aws_session_token

      The items specified above correspond to the following credentials:

      - the AWS access key
      - the secret key associated with the AWS access key
      - the AWS session token for the temporary security credentials

      The process/command line specified by the credential_process setting must
      write a JSON object to the standard output in the following form:
      {
        "Version": 1,
        "AccessKeyId": "AWS access key",
        "SecretAccessKey": "secret key associated with the AWS access key",
        "SessionToken": "temporary AWS session token, optional",
        "Expiration": "RFC3339 timestamp, optional"
      }

      The Expiration key, if given, specifies when the credentials are going to
      expire, they will be automatically refreshed before this happens.

      The following credential handling rules apply:

      - If the s3Profile option is set to a non-empty string, the environment
        variables are not used as a potential credential provider.
      - If either an access key or a secret key is available in a potential
        credential provider, it is selected as the credential provider.
      - If either the access key or the secret key is missing in the selected
        credential provider, an exception is thrown.
      - If the session token is missing in the selected credential provider, or
        if it is set to an empty string, it is not used to authenticate the
        user.

      Dumping to a Container in the Azure Blob Storage

      If the azureContainerName option is used, the dump is stored in the
      specified Azure container. Connection is established using the
      configuration at the local Azure configuration file.The directory
      structure is simulated within the blob name.

      The azureConfigFile option cannot be used if the azureContainerName
      option is not set or set to an empty string.

      Handling of the Azure settings

      1. The following settings are read from the storage section in the config
         file:

      - connection_string
      - account
      - key
      - sas_token

      Additionally, the connection options may be defined using the standard
      Azure environment variables:

      - AZURE_STORAGE_CONNECTION_STRING
      - AZURE_STORAGE_ACCOUNT
      - AZURE_STORAGE_KEY
      - AZURE_STORAGE_SAS_TOKEN

      The Azure configuration values are evaluated in the following precedence:

      - Options parameter - Environment Variables - Configuration File

      If a connection string is defined either case in the environment variable
      or the configuration option, the individual configuration values for
      account and key will be ignored.

      If a SAS Token is defined, it will be used for the authorization
      (ignoring any defined account key).

      The default Azure Blob Endpoint to be used in the operations is defined
      by:

      https://<account>.blob.core.windows.net

      Unless a different EndPoint is defined in the connection string.

EXCEPTIONS
      ArgumentError in the following scenarios:

      - If any of the input arguments contains an invalid value.

      RuntimeError in the following scenarios:

      - If there is no open global session.
      - If creating the output directory fails.
      - If creating or writing to the output file fails.
```

As we can see, this command returns quite a bit of information. The `help` includes syntax, a breakdown of all the arguments (including details on all the options), system requirements, and how to handle options for dumping data to AWS or Azure.

## Wrap-Up

Because of the sheer number of features in MySQL Shell, it is difficult to remember the exact syntax of many commands - especially when some commands have arguments consisting of JSON objects with numerous options. The help system in MySQL Shell is a comprehensive tool that allows us to retrieve information about the commands and options we wish to run. In many cases, the results form the help command include URLs to the MySQl Documentation that can provide even more information.

Photo by <a href="https://unsplash.com/@nikkotations?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">nikko macaspac</a> on <a href="https://unsplash.com/photos/photo-of-person-reach-out-above-the-water-6SNbWyFwuhk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  