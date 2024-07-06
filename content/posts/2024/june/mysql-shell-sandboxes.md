---
title: Sandboxes in MySQL Shell
date: 2024-06-04T06:00:00
image: /assets/images/2024/mysql-shell-sandboxes/header.jpg
tags: [ "MySQL", "MySQL-Shell" ]
series: mysql-shell-gems
---

Over the last few years, I have become quite smitten with [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/). For those who may not be familiar with MySQL Shell, it is a new(ish) command line interface (CLI) for connecting to and managing MySQL instances. During a recent [episode](https://insidemysql.libsyn.com/mysql-shell-does-all-the-things) of [Inside MySQL: Sakila Speaks](https://insidemysql.libsyn.com/), Fred and I talked to Miguel Araujo about many of the helpful (and lesser known) features of MySQL Shell. This post is the fourth in a series about these "hidden gem" features.

## The Problem

Sometimes, we might need additional instances of MySQL running to test configurations for read replicas, InnoDB clustering, InnoDB cluster sets, etc. In the past, this might have involved spinning up new instances of MySQL on other systems in your environment, which can be time-consuming and expensive. MySQL Shell has a feature that can make this easier, less time-consuming, and less expensive.

## The Solution

MySQL Shell allows us to spin up MySQL Sandbox instances on our local machines. We can then use these instances to test and verify the architecture setup before deploying them to production. Creating a new instance is as easy as running a single command.

## Creating a Sandbox

*A version of MySQL must be running on the local system to run sandbox instances*

To create a sandbox instance, make sure you are in JavaScript mode and run the command:

```shell
dba.deploySandboxInstance({port number})
```

The value of `{port number}` is the port we want the sandbox instance to run. For example, if we're going to run a sandbox instance on port `3336`, we would run the command:

```shell
dba.deploySandboxInstance(3336)
```

When we run this command, we will be asked to provide a password for the `root` user. Once the instance is up and running, we will see a message that it has been successfully deployed and started.

![Messages from creating a sandbox instance](/assets/images/2024/mysql-shell-sandboxes/img_01.png)

By default, any sandbox instances will be created in a directory named `mysql-sandboxes` in the home directory of the user who ran the command.

### Connecting to Our New Sandbox

We can use the following command to connect to our new instance.

```shell
\c root@localhost:3336
```

When we execute this command, we will be prompted to provide the password for the `root` user. Once we provide the password, we will be connected to the new instance.

![Connecting to the new sandbox instance](/assets/images/2024/mysql-shell-sandboxes/img_02.png)

### Configuration Options

When we deploy a new sandbox instance, we can provide options for the sandbox when we call `deploySandBoxInstance()`. Here are some of the options we can use.

* **`password`** - The password for the root user on the new instance
* **`sandboxDir`** - The path to a directory where we want the new instance to be created
* **`portx`** - The port to use for the X-Protocol. By default, this value will be calculated as 10 times the value of the provided port number.

If you want to see more information about these options, run the command:

```shell
\? dba.deploySandboxInstance
```

## Sandbox Management

There are other commands we can use to help us manage sandbox instances.

### Stopping an Instance

We can use `dba.stopSandboxInstance({port number})` to stop an instance gracefully. The value of `{port number}` is the port number the instance runs on. To stop the instance we created above, run the command:

```shell
dba.stopSandboxInstance(3336)
```

When we stop a sandbox instance, we will be asked for the `root` password.

### Starting an Instance

We can use `dba.startSandboxInstance({port number})` to start a previously deployed instance. The value of `{port number}` is the port number the instance was initially deployed on. To start the instance we created above, run the command:

```shell
dba.startSandboxInstance(3336)
```

### Killing an Instance

We can use `dba.killSandboxInstance({port number})` to stop an instance without doing so gracefully. This process can be useful in mimicking unexpected halts of the system. The value of `{port number}` is the port number the instance runs on. To kill the instance we created above, run the command:

```shell
dba.killSandboxInstance(3336)
```

### Deleting an Instance

We can use `dba.deleteSandboxInstance({port number})` to delete a sandbox instance. The value of `{port number}` is the port number the instance runs on. To delete the instance we created above, run the command:

```shell
dba.deleteSandboxInstance(3336)
```

A sandbox instance must be stopped or killed before we can delete it.

### Wrap-Up

MySQL sandbox instances can make testing the development and deployment of various MySQL architectures much easier and less time-consuming. MySQL Shell allows us to manage these instances through easy-to-use commands. To learn more about sandboxes and how we can use them for setting up MySQL architectures, check out the [documentation](https://dev.mysql.com/doc/mysql-shell/8.0/en/admin-api-sandboxes.html).

Photo by <a href="https://unsplash.com/@markusspiske?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Markus Spiske</a> on <a href="https://unsplash.com/photos/green-and-black-tractor-toy-KU3lOAiP-tQ?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  