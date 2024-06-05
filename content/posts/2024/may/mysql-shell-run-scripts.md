---
title: Running External Scripts in MySQL Shell
date: 2024-05-23T06:00:00
image: /assets/images/2024/mysql-shell-run-scripts/header.jpg
tags: [ "MySQL", "MySQL-Shell" ]
related:
  - /posts/2024/may/mysql-shell-system-commands/
  - /posts/2024/may/getting-help-mysql-shell/
  - /posts/2024/june/mysql-shell-sandboxes/
  - /posts/2024/june/server-upgrade-check-mysql-shell/
---

Over the last few years, I have become quite smitten with [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/). For those who may not be familiar with MySQL Shell, it is a new(ish) command line interface (CLI) for connecting to and managing MySQL instances. During a recent [episode](https://insidemysql.libsyn.com/mysql-shell-does-all-the-things) of [Inside MySQL: Sakila Speaks](https://insidemysql.libsyn.com/), Fred and I talked to Miguel Araujo about many of the helpful (and lesser known) features of MySQL Shell. This post is the first in a series about these "hidden gem" features.

## The Problem

I like using CLI tools. Unfortunately, I am a poor typist, and as a result, I often mistype commands. These typos are not a huge issue because most commands are short and easy to correct. When working in MySQl Shell, however, commands can be longer and more involved. An example would be running commands for [MySQL Document Store](https://www.mysql.com/products/enterprise/document_store.html).

Take a look at this command:

```shell
db.scores.find("year(date) = 2023").fields(['lastName', 'firstName', 'round(avg(score), 2) as avg', 'count(score) as numberOfRounds']).groupBy(['lastName', 'firstName']).sort(['lastName', 'firstName'])
```

When I run this command in MYSQl Shell, it looks like this:

![MySQl Document Store Command](/assets/images/2024/mysql-shell-run-scripts/img_01.png)

It is difficult for me to find a typo in non-formatted text with random line breaks. The first hidden gem we will discuss is MySQL Shell's ability to execute commands from external files. This allows us to edit the files in an IDE or other editor and run the commands in MySQL Shell.

MySQL Shell supports external scripts in JavaScript, Python, and SQL. For this post, we will demonstrate using an external JavaScript file.

## External JavaScript File

I have a file named `demo1.js` that contains the following code:

```javascript
db.scores.find("year(date) = 2023").fields(['lastName', 'firstName', 'round(avg(score), 2) as avg', 'count(score) as numberOfRounds']).groupBy(['lastName', 'firstName']).sort(['lastName', 'firstName'])
```

To run this script inside of MySQL Shell, we use the `\source` (or `\.`) command and pass the file path.

```shell
\. ~/projects/shell_scripts/demo1.js
```

I have some of the same issues in this format because this command is long(ish) and all on one line. I added some line breaks to make it easier to read and edit. I saved the following as `demo2.js`.

```javascript
db.scores.
find("year(date) = 2023")
.fields([
    'lastName',
    'firstName',
    'round(avg(score), 2) as avg',
    'count(score) as numberOfRounds'
])
.groupBy([
    'lastName',
    'firstName'
])
.sort([
    'lastName',
    'firstName'
])
```

This format is much easier to read. I can have my calls to other methods and elements within the arrays all on separate lines. As the image below shows, I also get the added benefit of syntax highlighting from my IDE.

![Formatted Document Store Code](/assets/images/2024/mysql-shell-run-scripts/img_02.png)

Take note of the first two lines. Specifically, notice that the `.` before the `find()` method is on the line above. If we move that down to the same line as `find()`, MySQl Shell will throw an error. For me, this is not ideal, but it is much nicer than:

![MySQl Document Store Command](/assets/images/2024/mysql-shell-run-scripts/img_01.png)

To run this external script, we use the command:

```shell
\. ~/projects/shell_scripts/demo2.js
```

Another advantage of having scripts like this in external files is that they can be added to source control for easy use by other developers.

## Wrap-Up

MySQl Shell offers many features to help make life easier for developers and DBAs. One of these features is the ability to execute external JavaScript, Python, and SQL scripts. We need to be careful with the spacing and formatting of the code in these external scripts, but the formatting is easier to read and edit than having the commands run on a single line with random line breaks. Check out the [documentation](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-commands.html) for more information on using `\source` (or `\.`) in MySQL Shell.

Photo by <a href="https://unsplash.com/@katmed?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Kat Med</a> on <a href="https://unsplash.com/photos/white-and-brown-seashell-on-brown-wooden-table-OLWNdnjCXsQ?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
 