---
title: Creating Aliases In MySQL Shell
date: 2022-10-17T06:00:00
image: /assets/images/2022/customize-mysql-shell/header.jpg
tags: ["MySQL", "MySQL-Shell"]
---
[MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) is a powerful way to connect to and manage [MySQL](https://www.mysql.com/) instances. Connections can even be made to servers that are behind an SSH connection. In this post, we will discuss how to extend and customize MySQL Shell so that it is easier to initiate those connections.

## The Problem

If you are like me, you use aliases in whatever shell environment you use. For example, I have aliases defined that allow me to easily connect to my Compute instances in [OCI](https://www.oracle.com/cloud/).
I have an alias that will pull down a copy of the production database for a personal project to my local environment and restore it to my dev database.
As I noted in this [post](/posts/2022/september/mysql-shell-alias/), I even have some to allow me to connect to MySQL Shell using the `mysql` command.

There are two reasons why I prefer to use aliases.

1. I have difficulty remembering the exact syntax of the commands I want to run.
2. I am a poor typist.

In another [post](/posts/2022/september/mysql-shell-ssh/), I talked about how we can connect to MySQL instances over SSH, and I already have aliases in place to connect to the servers I need most from a shell prompt.
However, I wanted a solution that would allow me to easily switch servers using MySQL Shell rather than quit and reconnect using a different alias.
Thankfully, MySQL Shell allows developers to extend the shell and add customized functionality.

## The Setup

Like most shell environments, MySQL Shell allows us to configure commands that can be run whenever it is started.
In MySQL Shell, these start-up scripts are executed when MySQL Shell loads for the first time.

Any code we want to execute when we start MySQL Shell mode must be placed in a file named `mysqlshrc.js` or `mysqlshrc.py`.
This file can be placed in any one of the following:

1. In the platform-specific configuration path
    * Windows: `%PROGRAMDATA%\MySQL\mysqlsh\mysqlshrc.js` (or `mysqlshrc.py`)
    * Unix: `/etc/mysql/mysqlsh/mysqlshrc.js` (or `mysqlshrc.py`)
2. In the `share/mysql` directory of the MySQL Shell home folder. The home folder defaults to the MySQL Shell `bin` parent directory.
    * Windows: `%MYSQLSH_HOME%\share\mysqlsh\mysqlshrc.js` (or `mysqlshrc.py`)
    * Unix: `$MYSQLSH_HOME/share/mysqlsh/mysqlshrc.js` (or `mysqlshrc.py`)
3. In the folder containing the `mysqlsh` binary, but only if the MySQL Shell home is not defined or cannot be identified by MySQL Shell in the standard location.
    * Windows: `<mysqlsh binary path>\mysqlshrc.js` (or `mysqlshrc.py`)
    * Unix: `<mysqlsh binary path>/mysqlshrc.js` (or `mysqlshrc.py`)
4. In the MySQL Shell user configuration path, which is defined by the environment variable named `MYSQLSH_USER_CONFIG_HOME`
    * Windows: `%MYSQLSH_USER_CONFIG_HOME%\mysqlshrc.js` (or `mysqlshrc.py`)
    * Unix: `$MYSQLSH_USER_CONFIG_HOME//mysqlshrc.js` (or `mysqlshrc.py`)
5. In the platform-specific location for user configuration, only if the path described in item 4 is not defined.
    * Windows: `%APPDATA%\MySQL\mysqlsh\mysqlshrc.js` (or `mysqlshrc.py`)
    * Unix: ` $HOME/.mysqlsh/mysqlshrc.js` (or `mysqlshrc.py`)

To get started with this example, create a file named `mysqlshrc.js` in your preferred location from the above list.
In my environment, I opted for item 2.

To test that MySQL Shell is reading this file correctly, add the following line to the file:
```javascript
print('\nMySQL Shell Start-up command\n\n')
```

Save the file and start MySQL Shell (or restart it if you have it running).
Once MySQL Shell loads, we should see something like this:

![MySQL Shell start up command](/assets/images/2022/customize-mysql-shell/img1.png "MySQL Shell start up command")

As you can see, the text we passed to `print()` was output to the screen.

## Extending MySQL Shell

Now that we know MySQL Shell is reading our start-up script let's start extending the shell to add our 'aliases'.

Here is all the code we need to set up an alias to connect to our production database from within MySQL Shell.

```javascript
function connectProduction() {
    print("Connecting to the Production DB\n\n")
    shell.connect({uri : "mysqlx://{user}:{password}@{MySQL server address}:33060", ssh : "{SSH user}@{SSH address}", "ssh-identity-file":"{path to SSH key}" })
}

var object = shell.createExtensionObject()

shell.addExtensionObjectMember(object, "prod", connectProduction,
    {
    brief:"Connects to production db"
    }
 );

shell.registerGlobal("c", object, {brief:"Connection Tools",})
```

Here is what the values above represent:
* `{user}` - The username used to access our MySQL server
* `{password}` - The password for the user above.
* `{MySQL server aqddress}` - The IP address or domain name of our MySQL server
    * If we are SSH-ing into the server running MySQL, this will be `127.0.0.1`
    * If we are NOT SSH-ing into the server running MySQL, we would put the private IP address for our MySQL server here.
* `{SSH user}` - The user we use to connect to the server running SSH.
* `{SSH address}` - The address of our server running SSH.
* `{path to SSH key}` - The path to your SSH key file

Before we break down this code, save `mysqlshrc.js` and restart MySQL Shell.

When MySQL Shell has restarted, enter the following command:
```javascript
c.prod()
```

If the command runs successfully, you should see output similar to the one below:
![MySQL Shell connect to production](/assets/images/2022/customize-mysql-shell/img2.png "MySQL Shell connect to production")

In the image above, item 1 is the message we pass to `print()`.
Item 2 indicates we are making a connection using the X-Protocol to `{MySQL Server Address}`.
Item 3 shows that we are making a connection over SSH to `{SSH address}`
Lastly, item 4 displays the connection information.

_(Your command line likely looks different from what is shown above because I have customized my prompt.
Check out [this video](https://www.youtube.com/watch?v=bY8zWm1RG9s) from my colleague [Fred Descamps](https://lefred.be/) on customizing the MySQL Shell prompt.)_

## Code Breakdown

Ok, so let's break down that code into more easily digestible chunks.

### Function definition

The first thing we do is define a function that will do all the work for us.
```javascript
function connectProduction() {
    print("Connecting to the Production DB\n\n")
    shell.connect({uri : "mysqlx://{user}:{password}@{MySQL server address}:33060", ssh : "{SSH user}@{SSH address}", "ssh-identity-file":"{path to SSH key}" })
}
```
Our function first does output the text 'Connecting to the Production DB' surrounded by line breaks so it is easier to read.

All the work, though, is done by the second line of code. This tells the `shell` to connect to the MySQL Server using SSH.

### Create the Extension Object

Next, we create a shell extension object using the following:
```javascript
var object = shell.createExtensionObject()
```

This object is used to extend MySQL Shell.

### Add a Member

Then, we add a member to the extension object.
```javascript
shell.addExtensionObjectMember(object, "prod", connectProduction,
    {
    brief:"Connects to production db"
    }
 );
```

The arguments we pass to `addExtensionObjectMember()` are:
* The extension object we created earlier. In our case, it is a variable named `object`
* A string used to identify the member we are adding.
* A function that will be run when we call the member. _NOTE: there are no parentheses_
* A JSON object that describes the member. In our case, we are just using `brief`.

### Register a Global Object

Lastly, we add everything we have done to the global scope in MySQL Shell.
```javascript
shell.registerGlobal("c", object, {brief:"Connection Tools",})
```

The arguments we pass to `registerGlobal()` are:
* A string that will identify the object in the global scope. In our case, `c`.
* The extension object we created and added members to.
* A JSON object that describes the new global object. Again, we are only using `brief`.

When we register this global object, we will have an object named `c` available to us from within the MySQL Shell.
While we wrote this start-up script in JavaScript, because we added the extension as a global object, we can call `c.prod()` while in Python mode.

![MySQL Shell connect to production in Python mode](/assets/images/2022/customize-mysql-shell/img3.png "MySQL Shell connect to production in Python mode")

### Adding More Members

If we want to add another member to the same global object that connects to a different server,  we will do the following:
* Add a new function definition.
    * Include the connection information for the additional server.
* Call `shell.addExtensionObjectMember()` and add the new member that uses the new function.

## Wrap up

MySQL Shell is an easy-to-use tool for connecting to and managing MySQL instances.
The shell can also be extended using JavaScript or Python.
One use of this extensibility is creating global objects that allow us to connect to different servers without remembering usernames, passwords, server addresses, etc.
I will be sure to share other valuable ways to extend MySQL Shell.

Photo by [Kat Med](https://unsplash.com/@katmed?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/shell?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
