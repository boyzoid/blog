---
title: MySQL Shell Table Export Utility
date: 2024-07-25T06:00:00
image: 2024/mysql-shell-table-export/header.jpg
tags: [ "MySQL", "MySQL-Shell" ]
series: mysql-shell-gems
description: How to use the MySQL Shell Table Export Utility
---

We already discussed how we can use [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) to [dump](/posts/2024/july/data-dump-mysql-shell/) and [load](/posts/2024/july/data-load-mysql-shell/) data using a multithreaded process. In this post, we will discuss ways we can export data from a table into different formats.

## Table Export Utility

In the global `util` object in MySQL Shell, there is a method we can use to export table data to various formats (tab-delimited, comma-delimited, etc.). This method is `exportTable()`. The `exportTable()` method takes three arguments:

1. The table we want to export.
2. The path to the file where the data will be saved.
3. Am options JSON object (optional)

## Running the Utility

Let's look at a basic command for dumping a table named `mysql_shorts.games`.

```shell
util.exportTable('mysql_shorts.games', '~/dumps/games.txt')
```

The output I see in the console is:

```text
Initializing - done 
Gathering information - done 
Running data dump using 1 thread.
NOTE: Progress information uses estimated values and may not be accurate.
Starting data dump
100% (40 rows / ~40 rows), 0.00 rows/s, 0.00 B/s
Dump duration: 00:00:00s
Total duration: 00:00:00s
Data size: 483 bytes
Rows written: 40
Bytes written: 483 bytes
Average throughput: 483.00 B/s

The dump can be loaded using:
util.importTable("~/dumps/games.txt", {
    "characterSet": "utf8mb4",
    "schema": "mysql_shorts",
    "table": "games"
})
```

As you can see, we get information about the number of rows exported, the data throughput, and the time it took. MySQL Shell even gives us a command to import this table data (we will talk about that utility in an upcoming post).

By default, table data is exported in tab-delimited format, with text not enclosed in quotes (`"`). The content of `games.txt` looks like the text below.

```text
1   Scott  92
2   Fred   78
3   Heather    75
4   Lenka  84
5   Scott  83
6   Fred   77
7   Heather    85
8   Lenka  91
9   Scott  89
10  Fred   77
11  Heather    81
12  Lenka  84
13  Scott  76
14  Fred   97
15  Heather    90
16  Lenka  95
17  Scott  77
18  Fred   75
19  Heather    100
20  Lenka  91
21  Scott  94
22  Fred   82
23  Heather    88
24  Lenka  80
25  Scott  98
26  Fred   86
27  Heather    89
28  Lenka  84
29  Scott  79
30  Fred   80
31  Heather    85
32  Lenka  95
33  Scott  94
34  Fred   78
35  Heather    100
36  Lenka  93
37  Scott  86
38  Fred   80
39  Heather    90
40  Lenka  76
```

## CSV Dialect

If we want to export the table data in a comma-delimited format, we will use the `dialect` option as part of our third argument.

```shell
util.exportTable('mysql_shorts.games', 
  '~/dumps/games.csv', 
  {dialect: 'csv'})
```

When I run this command, I see the following output in the console.

```text
Initializing - done 
Gathering information - done 
Running data dump using 1 thread.
NOTE: Progress information uses estimated values and may not be accurate.
Starting data dump
100% (40 rows / ~40 rows), 0.00 rows/s, 0.00 B/s
Dump duration: 00:00:00s
Total duration: 00:00:00s
Data size: 603 bytes
Rows written: 40
Bytes written: 603 bytes
Average throughput: 603.00 B/s

The dump can be loaded using:
util.importTable("~/dumps/games.csv", {
    "characterSet": "utf8mb4",
    "dialect": "csv",
    "schema": "mysql_shorts",
    "table": "games"
})
```

I like how the example command to import this data now includes the `dialect` property.

The content of the file looks like the following:

```text
1,"Scott",92
2,"Fred",78
3,"Heather",75
4,"Lenka",84
5,"Scott",83
6,"Fred",77
7,"Heather",85
8,"Lenka",91
9,"Scott",89
10,"Fred",77
11,"Heather",81
12,"Lenka",84
13,"Scott",76
14,"Fred",97
15,"Heather",90
16,"Lenka",95
17,"Scott",77
18,"Fred",75
19,"Heather",100
20,"Lenka",91
21,"Scott",94
22,"Fred",82
23,"Heather",88
24,"Lenka",80
25,"Scott",98
26,"Fred",86
27,"Heather",89
28,"Lenka",84
29,"Scott",79
30,"Fred",80
31,"Heather",85
32,"Lenka",95
33,"Scott",94
34,"Fred",78
35,"Heather",100
36,"Lenka",93
37,"Scott",86
38,"Fred",80
39,"Heather",90
40,"Lenka",76
```

Commas separate the fields, and the text values are enclosed in quotes (`"`).


## Filtering Data

We can use the `where` option to export a subset of the data in a table. Here is how we can filter the exported data to only include scores less than `80`.

```shell
util.exportTable('mysql_shorts.games', 
  '~/dumps/games_bad.csv', 
  {dialect: 'csv', 
  where: "score < 80"})
```

The content of the file `games_bad.csv` is:

```text
2,"Fred",78
3,"Heather",75
6,"Fred",77
10,"Fred",77
13,"Scott",76
17,"Scott",77
18,"Fred",75
29,"Scott",79
34,"Fred",78
40,"Lenka",76
```

## Wrap Up

The methods to handle multithreaded dumps and loads of data are robust and easy to use. However, there may be a need to export data from a table in a more human-readable format or in a format that can be used by other processes (such as Excel). In this case, the MySQL Shell Table Export Utility may be the best tool for the job. To learn more about the options available, including exporting data to [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/), AWS, or Azure storage buckets, check out the [Table Export Utility documentation](https://dev.mysql.com/doc/mysql-shell/9.0/en/mysql-shell-utilities-table-export.html).

Photo by <a href="https://unsplash.com/@andylid0?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Andy Li</a> on <a href="https://unsplash.com/photos/cargo-ships-docked-at-the-pier-during-day-CpsTAUPoScw?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  