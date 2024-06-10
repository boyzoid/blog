---
title: Executing System Commands in MySQL Shell
date: 2024-05-28T06:00:00
image: /assets/images/2024/mysql-shell-system-commands/header.jpg
tags: [ "MySQL", "MySQL-Shell" ]
related:
  - /posts/2024/may/mysql-shell-run-scripts/
  - /posts/2024/may/getting-help-mysql-shell/
  - /posts/2024/june/mysql-shell-sandboxes/
  - /posts/2024/june/server-upgrade-check-mysql-shell/
  - /posts/2024/june/connection-status-mysql-shell/
  - /posts/2024/june/managing-mysql-shell-configuration-options/

---

Over the last few years, I have become quite smitten with [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/). For those who may not be familiar with MySQL Shell, it is a new(ish) command line interface (CLI) for connecting to and managing MySQL instances. During a recent [episode](https://insidemysql.libsyn.com/mysql-shell-does-all-the-things) of [Inside MySQL: Sakila Speaks](https://insidemysql.libsyn.com/), Fred and I talked to Miguel Araujo about many of the helpful (and lesser known) features of MySQL Shell. This post is the second in a series about these "hidden gem" features.

## The Problem

When working in MySQL Shell, I often need to run system commands for various reasons. I usually opened another tab in my terminal interface to run the needed command. That was until Miguel mentioned a feature of MySQL Shell that allows us to run system commands inside MySQL Shell.

## The Solution

The `\system` (or `\!`) command in MySQL Shell allows us to run system commands without leaving MySQl Shell to do so.

### Listing Files

Here is an example. In a [previous post](/posts/2024/may/mysql-shell-run-scripts/), I discussed being able to run external scripts in MySQL Shell. Let's say we created a script but cannot recall the name. If we know what directory the files are in, we can run an `ls` command directly in MySQL Shell.

```shell
\system ls -la ~/projects/shell_scripts
```

The result of this command would look like:

![Result of listing files in a directory](/assets/images/2024/mysql-shell-system-commands/img_01.png)

Something to note is that MySQL Shell's "current directory" is the directory we were in when we started MySQL Shell. For example, I could run the following command to get the same result if I was already in the `~/projects/shell_scripts` directory and ran the `mysqlsh` command.

```shell
\! ls -la
```

### Editing Files

Let's assume we are connected to a remote server and must edit one of the files in the `shell_scripts` directory. We can open the file in an editor right in MySQL Shell. Here is how to open the file `demo2.js` using Nano.

```shell
\! nano demo2.js
```

This command opens the file `demo2.js` in Nano.

![JavaScript code displayed in Nano](/assets/images/2024/mysql-shell-system-commands/img_03.png)

After editing the file and closing Nano, we are brought back to the MySQL Shell interface.

<div><img src="/assets/images/2024/mysql-shell-system-commands/img_02.gif" alt="Animated image of opening a file in nano"></div>

### Using `sudo`

If there is a command that you would typically use `sudo` to run, no worries. You add `sudo` to the command; if necessary, you will be asked to provide a password.

```shell
\! sudo ls /
```

## Wrap-Up

MySQL Shell has many features that help make our lives easier. Running system commands, even those needing `sudo`, without having to leave MySQL Shell can save a lot of time. This behavior is one of those features you appreciate the more you use it.


Photo by [Sora Shimazaki](https://www.pexels.com/photo/crop-cyber-spy-hacking-system-while-typing-on-laptop-5935794/).