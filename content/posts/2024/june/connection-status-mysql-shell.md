---
title: MySQL Connection Status with MySQL Shell
date: 2024-06-11T06:00:00
image: /assets/images/2024/connection-status-mysql-shell/header.jpg
tags: [ "MySQL", "MySQL-Shell" ]
series: mysql-shell-gems

---

Over the last few years, I have become quite smitten with [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/). For those who may not be familiar with MySQL Shell, it is a new(ish) command line interface (CLI) for connecting to and managing MySQL instances. During a recent [episode](https://insidemysql.libsyn.com/mysql-shell-does-all-the-things) of [Inside MySQL: Sakila Speaks](https://insidemysql.libsyn.com/), Fred and I talked to Miguel Araujo about many of the helpful (and lesser known) features of MySQL Shell. This post is the sixth in a series about these "hidden gem" features.

In the last few posts, I have started by defining a 'problem' that MySQL Shell can help us solve. The feature we will discuss today is not really meant to solve a specific problem but rather to give us information about the state of the current MySQL connection being used with MySQL Shell.

## Starting MySQL Shell

I am going to start with a basic example. To follow along, start MySQL Shell using the following command:

```shell
mysqlsh
```

### Getting the Status

This command will start MySQL Shell but will not be connected to a MySQL Instance. We can look at the current status by using the command:

```shell
\status
```

The output form this command should resemble the test below.

```text
MySQL Shell version 8.4.0

Not Connected.
```

This output shows the current version of MySQL and a message that we are not connected to a MySQL Instance. This message makes sense since we have yet to connect to a database.

## Connecting to MySQL

I will connect to my local instance using the command below:

```shell
\c scott@localhost
```

Since I have told MySQL Shell to retain the password for this connection, I have not been asked to provide one. The output from this command is:

```text
Creating a session to 'scott@localhost'
Fetching global names for auto-completion... Press ^C to stop.
Your MySQL connection id is 75 (X protocol)
Server version: 8.4.0 MySQL Community Server - GPL
No default schema selected; type \use <schema> to set one.
```

### Checking Status Again

If we run the `\status` command now that we are connected to a database, the output will resemble:

```text
MySQL Shell version 8.4.0

Connection Id:                75
Default schema:               
Current schema:               
Current user:                 scott@localhost
SSL:                          Cipher in use: TLS_AES_128_GCM_SHA256 TLSv1.3
Using delimiter:              ;
Server version:               8.4.0 MySQL Community Server - GPL
Protocol version:             X protocol
Client library:               8.4.0
Connection:                   localhost via TCP/IP
TCP port:                     33060
Server characterset:          utf8mb4
Schema characterset:          utf8mb4
Client characterset:          utf8mb4
Conn. characterset:           utf8mb4
Result characterset:          utf8mb4
Compression:                  Enabled (DEFLATE_STREAM)
Uptime:                       8 days 22 hours 53 min 27.0000 sec
```

Some interesting information is presented to us. You can see the instance's uptime, what is currently being used as the delimiter, and other helpful information. I once changed the delimiter to create a stored function and forgot to change it back to `;`. The next day, I spent more time than I should have needed to determine why none of my queries were working. After using `\status`, it became immediately apparent what the issue was.

## Specify Database to Use

I am going to tell MySQL to use the `mysql_shorts` database by running the command:

```shell
\u mysql_shorts
```

### Checking Status One More Time

When we run `\status` again, the `current schema` value shows `mysql_shorts`.

```text
MySQL Shell version 8.4.0

Connection Id:                75
Default schema:               
Current schema:               mysql_shorts
Current user:                 scott@localhost
SSL:                          Cipher in use: TLS_AES_128_GCM_SHA256 TLSv1.3
Using delimiter:              ;
Server version:               8.4.0 MySQL Community Server - GPL
Protocol version:             X protocol
Client library:               8.4.0
Connection:                   localhost via TCP/IP
TCP port:                     33060
Server characterset:          utf8mb4
Schema characterset:          utf8mb4
Client characterset:          utf8mb4
Conn. characterset:           utf8mb4
Result characterset:          utf8mb4
Compression:                  Enabled (DEFLATE_STREAM)
Uptime:                       8 days 23 hours 41.0000 sec
```

## Wrap-Up

MySQL Shell provides a quick way to check the status of a connection to a MySQL instance. The `\status` command can be used to verify a connection is currently in use or to check the current user or delimiter used for the connection. This command can also help identify potential issues with character sets.


Photo by <a href="https://unsplash.com/@sigmund?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">rivage</a> on <a href="https://unsplash.com/photos/analog-watch-at-1-00-TnEe6BdBC2M?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  