---
title: Connecting MySQL Shell Over SSH
date: 2022-09-12T06:00:00
image: /assets/images/2022/ssh.jpg
tags: ["MySQL", "MySQL-Shell", "SSH"]
---
As I mentioned in my [last post](/posts/2022/september/mysql-shell-alias/), I have become quite smitten with [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/). Until recently, I have only used MySQL Shell to connect to a local instance of MySQL running on my development machine.

I recently needed to connect to a MySQL database on a Compute Instance in [OCI](https://www.oracle.com/cloud/). I wanted to use MySQL Shell but realized I needed to connect to the database using SSH. Fortunately, there is a way to tell MySQL Shell to connect using SSH.

**Note:** This post assumes you already have SSH access set up for your remote server using a private key.

First, open MySQL Shell by running this command from a command prompt:

```shell
mysqlsh
```

This will start MySQL Shell in JS mode. You should see something similar to the image below.

![MySQL Shell JS Mode](/assets/images/2022/mysql-shell-ssh/img1.png "MySQL Shell JS Mode")

Now that we are in Js mode of MySQL Shell, we use the `shell.connect()` command to connect to a MySQL server tunneled through an SSH connection.

```shell
shell.connect({uri : "mysql://{user}:{password}!363@127.0.0.1:3306", ssh : "{ssh user}@{remote server}:22", "ssh-identity-file":"{absolute path to SSH key}" })
```

Let's break down the different bits of information we are using.

* `{user}` - The MySQL user we want to connect to our server with
* `{password}` - The password for the above user. We can omit this, and we will be prompted to enter the password.
* `{ssh user}` - The user we want to connect to SSH with.
* `{remote server}` - The server IP or domain address for our remote server.
* `{absolute path to SSH key}` - The absolute path to our SSH private key file.

**Note:** If you are on Windows, you will need to use a forward slash (`/`) as your path delimiter instead of a backslash (`\`). For example:

```shell
C:/Users/Dan/.ssh/my-ssh-key
```

Once we run the `shell.connect()`, you will see a message that we are connected.

![MySQL Shell SSH Connected](/assets/images/2022/mysql-shell-ssh/img2.png "MySQL Shell SSH Connected")

You can see that we are using a `Classic Session`.
This is because we specified port 3306 in our connection string.
For this connection, we are not using the [X Protocol](https://dev.mysql.com/doc/internals/en/x-protocol.html), which means we will not be able to interact with a [MySQL Document Store](https://www.mysql.com/products/enterprise/document_store.html) with this connection.
If you want to use the X Protocol, which uses port 33060, you may need to open up ports on your server's firewall.

Also, note that we are still in JS mode.
To switch to SQL mode, enter the following command:

```shell
\sql
```

We will then see this prompt:

![MySQL SheSQL Mode](/assets/images/2022/mysql-shell-ssh/img3.png "MySQL ShellSQL Mode")

Now that we are in SQL mode, we can run SQL commands against the remote database.

Once we are done with our session, we can disconnect from MySQL Shell and close the SSH connection. To do this, we run the following command:

```shell
\quit
```

We can now see that our connection is closed.

![MySQL Shell Connection Closed](/assets/images/2022/mysql-shell-ssh/img4.png "MySQL Shell Connection Closed")

As you can see, it is not that difficult to use MySQL Shell over a secured connection using SSH.

Photo by [FLY:D](https://unsplash.com/@flyd2069?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/internet-security?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
