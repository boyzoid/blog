---
title: Extending MySQL Shell with Plugins
date: 2024-08-29T06:00:00
image: 2024/extending-mysql-shell-plugins/header.jpg
image-path: 2024/extending-mysql-shell-plugins/
tags: [ "MySQL", "MySQL-Shell" ]
series: mysql-shell-gems
description: Learn how to extend MySQL Shell with plugins.
---

[MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) offers a wide variety of tools to manage our MySQL instances. With all those tools, though, we may want functionality that would be helpful and pertain to just your situation. Thankfully, the MySQL Shell team made it possible to extend MySQL Shell and add functionality. In this post, we will explore the use of plugins.

## The Problem

This post will address the problem I mentioned in a [previous post](/posts/2024/august/extending-mysql-startup-scripts).

I have two 'issues' that are specific to a web application I wrote to manage my golf league.

1. The production database is a [HeatWave MySQL](https://www.oracle.com/mysql/) instance. To connect, I first need to SSH into a compute instance and then connect to the MySQL instance.
2. I often need to pull data from production into the database running on my laptop to address issues or develop new functionality.

The problem with both of these is that I need to remember (and type) more than I want every time I connect to the production database or pull the data down. This includes the syntax for each command and the different values for the SSH server, key file, etc.

In the previous solution, I have values for the database user, database host, SSH user, SSH host, etc. This solution works because I am the only person who uses the database. But what if others on the project needed database access, and I wanted to share the files that make it easier? I would use a plugin instead of a startup script in that case.

## Plugins

Since MySQL Shell 8.0.17, we have been able to extend MySQL Shell with user-defined functions that are loaded at startup. We can write plugins in JavaScript or Python, and the functions they contain can be used in either mode in MySQl Shell.

Plugins are in a directory placed in a specific directory on your system. This directory is located in different locations depending on your operating system.

**Windows**

* ` %AppData%\MySQL\mysqlsh\plugins`

**Unix(Mac Os)/Linux**

* `~/.mysqlsh/plugins`

Each plugin must contain a file named `init.js` or `init.py`. When writing plugin code, we have access to all the top-level objects such as `shell`, `dba`, `util`, etc. We will reproduce the functionality we discussed with startup scripts for this demo. As you will see, I made a few changes to accommodate the plugin being shared and keep sensitive information out of the file.

## My Solution

Below is the solution I came up with for this demo. I will go over each pertinent section individually.

```javascript
const object = shell.createExtensionObject()

shell.addExtensionObjectMember(object, "connect", ()=>{
           print("Connecting to the Golf League Production DB in HeatWave\n\n")
           const user = os.getenv('PROD_USER')
           const dbHost = os.getenv('PROD_HOST')
           const dbSchema = os.getenv('PROD_SCHEMA')
           const sshUser = os.getenv('PROD_SSH_USER')
           const sshHost  = os.getenv('PROD_SSH_HOST')
           const identityFile = os.getenv('PROD_IDENT_FILE')

           if(!user || !dbHost || !dbSchema || !sshUser || !sshHost ||  !identityFile){
              print('ENVIRONMENT VARIABLEs ARE NOT DEFINED.\n\n')
              print('Check that the following variables are defined:\n\nPROD_USER\n' +
                      'PROD_HOST\n' +
                      'PROD_SCHEMA\n' +
                      'PROD_SSH_USER\n' +
                      'PROD_SSH_HOST\n' +
                      'PROD_IDENT_FILE\n\n')
           }
           else{
              shell.connect(
                      {
                         uri : `mysqlx://${user}@${dbHost}/${dbSchema}`,
                         ssh : `${sshUser}@${sshHost}`,
                         "ssh-identity-file": `${identityFile}` })
           }
        },

        {
           brief:"Connects to golf league production db",
           details: ["Connects to golf league production db"],

        }
);

shell.addExtensionObjectMember(object, "pull", ()=>{
           print("Pulling Production database to localhost\n\n")
           const user = os.getenv('PROD_USER')
           const dbHost = os.getenv('PROD_HOST')
           const dbSchema = os.getenv('PROD_SCHEMA')
           const sshUser = os.getenv('PROD_SSH_USER')
           const sshHost  = os.getenv('PROD_SSH_HOST')
           const identityFile = os.getenv('PROD_IDENT_FILE')
           const targetUser = os.getenv('TARGET_USER')
           const targetHost = os.getenv('TARGET_HOST')
           if(!user || !dbHost || !dbSchema || !sshUser || !sshHost ||  !identityFile || !targetUser || !targetHost){
              print('ENVIRONMENT VARIABLEs ARE NOT DEFINED.\n\n')
              print('Check that the following variables are defined:\n\nPROD_USER\n' +
                      'PROD_HOST\n' +
                      'PROD_SCHEMA\n' +
                      'PROD_SSH_USER\n' +
                      'PROD_SSH_HOST\n' +
                      'PROD_IDENT_FILE\n' +
                      'TARGET_USER\n' +
                      'TARGET_HOST\n\n')
           }
           else{
              shell.connect(
                      {
                         uri : `mysqlx://${user}@${dbHost}/${dbSchema}`,
                         ssh : `${sshUser}@${sshHost}`,
                         "ssh-identity-file": `${identityFile}`
                      }
              )
              util.copySchemas([dbSchema],
                      `${targetUser}@${targetHost}`,
                      {
                         threads: 8,
                         sessionInitSql:[
                            `drop schema if exists ${dbSchema}`
                         ],
                         compatibility: [
                            'strip_definers',
                            'strip_restricted_grants'
                         ]
                      })
              shell.connect(`mysqlx://${targetUser}@${targetHost}/${dbSchema}`)
              print("\n\nDone!")
           }
        },
        {
           brief:"Pulls the dataabse from production and restores to localhost.",
           details: ["Pulls the dataabse from production and restores to localhost."],

        }
);

shell.registerGlobal("prod", object, {brief:"Production Tools",})
```

### Create an Extension Object

First, we create an extension object using `shell.createExtensionObject()` and assign it to a variable named `object`.

```javascript
const object = shell.createExtensionObject()
```

### Add Member to Connect to Production Server

Next, we add an extension object member to our created extension object. When we add the extension object member, we pass in 4 arguments.

1. The object to which we are adding the member.
   * In this case we pass `object`.
2. The name of the member we are adding.
   * For this demo, we are using the text `connect`.
   * The member name will become a method on the shell object we create.
3. A function to run when the member method is called.
   * We can pass arguments to this function but do not need to do so for this demo.
4. A `definition` JSON object.
   * The definition includes properties named `brief` and `details`. The former is a description of the member and the latter is what is provided when we use MySQL Shell's `\help` command.

```javascript
shell.addExtensionObjectMember(object, "connect", ()=>{
           print("Connecting to the Golf League Production DB in HeatWave\n\n")
           const user = os.getenv('PROD_USER')
           const dbHost = os.getenv('PROD_HOST')
           const dbSchema = os.getenv('PROD_SCHEMA')
           const sshUser = os.getenv('PROD_SSH_USER')
           const sshHost  = os.getenv('PROD_SSH_HOST')
           const identityFile = os.getenv('PROD_IDENT_FILE')

           if(!user || !dbHost || !dbSchema || !sshUser || !sshHost ||  !identityFile){
              print('ENVIRONMENT VARIABLE ARE NOT DEFINED.\n\n')
              print('Check that the follwoing variables are defined:\n\nPROD_USER\n' +
                      'PROD_HOST\n' +
                      'PROD_SCHEMA\n' +
                      'PROD_SSH_USER\n' +
                      'PROD_SSH_HOST\n' +
                      'PROD_IDENT_FILE\n\n')
           }
           else{
              shell.connect(
                      {
                         uri : `mysqlx://${user}@${dbHost}/${dbSchema}`,
                         ssh : `${sshUser}@${sshHost}`,
                         "ssh-identity-file": `${identityFile}` })
           }
        },

        {
           brief:"Connects to golf league production db",
           details: ["Connects to golf league production db"],

        }
);
```

In the body of our function, we have a few commands. The first, `print()`, will output the text 'Connecting to the Golf League Production DB in HeatWave' to the console. The next block of code grabs values from system environment variables using `os.getenv()`. I added this level of abstraction to keep sensitive information out of the file so it can be more easily shared. The variables that are defined are:

* `PROD_USER` - The database user we log in as.
* `PROD_HOST` - The hostname or address of the production server.
* `PROD_SCHEMA` - The database schema we will connect to.
* `PROD_SSH_USER` - The SSH user we use to connect to the SSH host.
* `PROD_SSH_HOST` - The hostname or address of the SSH server.
* `PROD_IDENTITY_FILE` - The private key file used to connect the SSH user to the SSH host.

Once we grab all the environment variables, we do some error handling. We check that all of the variables have a value. If an environment variable is not defined, `os.getenv()` will return `NULL`. If one or more values are not defined, we display a message that the environment variables must be defined and list the expected ones.

If all the variables are defined, we run the command, `shell.connect()` to connect to the MySQL instance using an SSH connection using the `uri `, `ssh`, and `ssh-identity-file` values.

### Pulling Data Down From Production

In the next block of code, we create another extension object member. The arguments for this member are:

1. The object to which we are adding the member.
   * Again, we pass `object`.
2. The name of the member we are adding.
   * For this demo, we are using the text `pull`.
   * The member name will become a method on the shell object we create.
3. A function to run when the member method is called.
4. A `definition` JSON object.
   * The definition includes properties named `brief` and `details`. The former describes the member, and the latter is what is provided when we use MySQL Shell's `\help` command.

```javascript
shell.addExtensionObjectMember(object, "pull", ()=>{
           print("Pulling Production database to localhost\n\n")
           const user = os.getenv('PROD_USER')
           const dbHost = os.getenv('PROD_HOST')
           const dbSchema = os.getenv('PROD_SCHEMA')
           const sshUser = os.getenv('PROD_SSH_USER')
           const sshHost  = os.getenv('PROD_SSH_HOST')
           const identityFile = os.getenv('PROD_IDENT_FILE')
           const targetUser = os.getenv('TARGET_USER')
           const targetHost = os.getenv('TARGET_HOST')
           if(!user || !dbHost || !dbSchema || !sshUser || !sshHost ||  !identityFile || !targetUser || !targetHost){
              print('ENVIRONMENT VARIABLEs ARE NOT DEFINED.\n\n')
              print('Check that the following variables are defined:\n\nPROD_USER\n' +
                      'PROD_HOST\n' +
                      'PROD_SCHEMA\n' +
                      'PROD_SSH_USER\n' +
                      'PROD_SSH_HOST\n' +
                      'PROD_IDENT_FILE\n' +
                      'TARGET_USER\n' +
                      'TARGET_HOST\n\n')
           }
           else{
              shell.connect(
                      {
                         uri : `mysqlx://${user}@${dbHost}/${dbSchema}`,
                         ssh : `${sshUser}@${sshHost}`,
                         "ssh-identity-file": `${identityFile}`
                      }
              )
              util.copySchemas([dbSchema],
                      `${targetUser}@${targetHost}`,
                      {
                         threads: 8,
                         sessionInitSql:[
                            `drop schema if exists ${dbSchema}`
                         ],
                         compatibility: [
                            'strip_definers',
                            'strip_restricted_grants'
                         ]
                      })
              shell.connect(`mysqlx://${targetUser}@${targetHost}/${dbSchema}`)
              print("\n\nDone!")
           }
        },
        {
           brief:"Pulls the dataabse from production and restores to localhost.",
           details: ["Pulls the dataabse from production and restores to localhost."],

        }
);
```

In the body of our function, we have some duplicate code. This duplicate code gets environment variables for our connections. In this method, we are getting the values we retrieved in the `connect()` method above and two others, `TARGET_USER` and `TARGET_HOST`. These are the database user and database host where we will copy our data. Once again, we have some error handling to catch if any of these values are not defined. We need to reproduce the connection code because the object we are creating, `prod`, is not available inside of our object members.

Once we are connected to the production database, we call `util.copySchemas()` to copy the data from the production instance to my local MySQL instance using the values from the environment variables. Two options I would like to discuss here are `sessionInitSql` and `compatibility`. The array's value (or values) in `sessionInitSql` are SQL commands we want MySQL Shell to execute on the target when we pull down the data. In this case, we want to drop the database schema on the target to avoid errors when copying the data. The `compatibility` property value tells MySQL Shell to remove the definers for views and stored procedures or functions. When these objects are recreated on the target instance, the user we define to connect to the target instance will become the definer.

After the database schema is copied, we connect to the MySQL instance on my local machine, using values from our environment variables. I added this step because I often want to start interacting with the database after copying it from production.

The last command in our function is another call to `print()`, which outputs a message indicating that the process is complete.

### Register the Extension Object

In order to use the members we just defined, we need to register our object globally. We accomplish this by running the following command:

```javascript
shell.registerGlobal("prod", object, {brief:"Production Tools",})
```

The three arguments we pass are as follows:

1. A string for the name of the object. In this case, we use `prod`.
2. The object that we want to register. We use the object we created in the first line of code (and subsequently added members to)
3. A JSON object that defines the object.

## Running the Commands

Whenever we make code changes in any plugin, we need to restart MySQL Shell to pick up any changes. After stating MySQL Shell, I can connect to my production instance using the command:

```shell
prod.connect()
```

We defined the global object as `prod` and the member we added to connect to production is called as a method of `prod`. Here is what the output of this command looks like.

![Result of calling prod.connect()]({% imgPath image-path, "img_01.png" %} "Result of calling prod.connect()")

To copy the data from production to my local instance, we run the command:

```shell
prod.pull()
```

When we created the member to handle this action, we named it `pull`, so we used that name as a method on our extension object.

![Result of calling prod.pull()]({% imgPath image-path, "img_02.png" %} "Result of calling prod.pull()")

## Wrap Up

MySQL Shell is chock full of features but can't cover every use case. Fortunately, the MySQL Shell team gave us several ways to extend the functionality of MySQL Shell. By using plugins, we can add custom functionality to MySQL Shell that is easily shareable among multiple developers. With this functionality, we can create methods that allow us to perform multistep operations in a single command and use values stored as environment variables to keep sensitive information, such as login credentials, out of shared files. Our plugins can be written in JavaScript or Python. Head on over to the [documentation](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-plugins.html) to learn more about creating and using plugins to customize and extend MySQL Shell.

Photo by <a href="https://unsplash.com/@kierinsightarchives?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Kier in Sight Archives</a> on <a href="https://unsplash.com/photos/white-usb-cable-on-white-surface-7d8pxcMVl7A?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
  