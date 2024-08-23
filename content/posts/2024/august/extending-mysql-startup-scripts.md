---
title: Extending MySQL Shell with Startup Scripts
date: 2024-08-23T06:00:00
image: 2024/extending-mysql-startup-scripts/header.jpg
image-path: 2024/extending-mysql-startup-scripts/
tags: [ "MySQL", "MySQL-Shell" ]
series: mysql-shell-gems
description: Learn how to extend MySQL Shell with startup scripts.
---

[MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) offers a wide variety of tools to manage our MySQL instances. With all those tools, though, we may want functionality that would be helpful and pertain to just your situation. Thankfully, the MySQL Shell team made it possible to extend MySQL Shell and add functionality. In this post, we will explore the use of startup scripts.

## The Problem

I have two 'issues' that are specific to a web application I wrote to manage my golf league.

1. The production database is a [HeatWave MySQL](https://www.oracle.com/mysql/) instance and in order to connect, I first need to SSH into a compute instance and then connect to the MySQL instance.
2. I often need to pull data from production into the database that is running on my laptop. I need to do this to address issues or work on new functionality.

The problem for both of these is that I need to remember (and type) more than I want every time I need to connect to the production database or need to pull the data down. This includes the syntax for each command and the different values for the SSH server, key file, etc.

When I have problems specific to my project or environment, I prefer using startup scripts rather than plugins to add that functionality.

## Startup Scripts

Startup scripts are scripts written in JavaScript or Python that are executed whenever MYSQL Shell enters the corresponding language mode. These scripts can be used to:

* Add additional search paths for Python or JavaScript modules.
* Define global functions or variables.
* Perform other initialization through JavaScript or Python.

MySQL Shell will load files named `mysqlshrc.js` or `mysqlshrc.py` if the exist in one of the following directories.

**Windows**

* `%PROGRAMDATA%\MySQL\mysqlsh\`
* `%MYSQLSH_HOME%\share\mysqlsh\`
* `<mysqlsh binary path>\`
* `%MYSQLSH_USER_CONFIG_HOME%\`
* `%APPDATA%\MySQL\mysqlsh\`

**Unix(Mac Os)/Linux**

* `/etc/mysql/mysqlsh/`
* ` $MYSQLSH_HOME/share/mysqlsh/`
* `<mysqlsh binary path>/`
* `$MYSQLSH_USER_CONFIG_HOME/`
* `$HOME/.mysqlsh/`

Whenever I do customizations like we will be showing, I keep files in my home directory whenever possible. Keeping that in mind (and because I use a Mac), I will put a file named `myslshrc.js` in the `$HOME/.mysqlsh/` directory for this demo.

## My Solution

I am sure there are other ways I can address my two 'problems' above, but here is the solution I came up with.

```javascript
const object = shell.createExtensionObject()

shell.addExtensionObjectMember(object, "connect", ()=>{
    print("Connecting to the Golf League Production DB in HeatWave\n\n")
    shell.connect(
        {
            "uri" : "mysqlx://<user>>@<MySQL Server>/<db-schema>", 
            "ssh" : "<SSh user>@<SSH Server>", 
            "ssh-identity-file":"/path/to/private/key" 
        })
    },
    {
        brief:"Connects to golf league production db",
        details: ["Connects to golf league production db"],
    }
);

shell.addExtensionObjectMember(object, "pull", ()=>{
    print("Pulling Production dataabse to localhost\n\n")
    prod.connect()
    util.copySchemas(['<db-schema>'], 
        'scott@localhost', 
        {
            threads: 8, 
            sessionInitSql:[
                'drop schema if exists <db-schema>'
            ],
            compatibility: [
                'strip_definers'
            ]
        })
    shell.connect('mysqlx://scott@localhost/<db-schema>')
    print("\n\nDone!")
        
    },
    {
        brief:"Pulls the dataabse from production and restores to localhost.",
        details: ["Pulls the dataabse from production and restores to localhost."],
    }
);

shell.registerGlobal("prod", object, {brief:"Production Tools",})
```

Let's break down this script into more easily digestible pieces.

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
        shell.connect(
                {
                   "uri" : "mysqlx://<user>>@<MySQL Server>/<db-schema>",
                   "ssh" : "<SSh user>@<SSH Server>",
                   "ssh-identity-file":"/path/to/private/key"
                })
     },
     {
        brief:"Connects to golf league production db",
        details: ["Connects to golf league production db"],
     }
);
```

In the body of our function, we run two commands. The first, `print()`, will output the text 'Connecting to the Golf League Production DB in HeatWave' to the console. The second command, `shell.connect()` will connect to my MySQL instance using an SSH connection using the `uri `, `ssh`, and `ssh-identity-file` values.


### Pulling Data Down From Production

In the next block of code, we create another extension object member. The arguments for this member are:

1. The object to which we are adding the member to.
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
     prod.connect()
     util.copySchemas(['<db-schema>'],
             'scott@localhost',
             {
                threads: 8,
                sessionInitSql:[
                   'drop schema if exists <db-schema>'
                ],
                compatibility: [
                   'strip_definers'
                ]
             })
     shell.connect('mysqlx://scott@localhost/<db-schema>')
     print("\n\nDone!")

  },
  {
     brief:"Pulls the dataabse from production and restores to localhost.",
     details: ["Pulls the dataabse from production and restores to localhost."],
  }
);
```

We have four commands inside the body of our function that defines the `pull()` member.

The first command calls `print()` to output the text 'Pulling Production database to localhost' to the console. The next command calls `prod.connect()`, which is what we created above (more on the syntax for this command below). This command will connect MySQL Shell to the production MySQL instance.

Once we are connected to the production database, we call `util.copySchemas()` to copy the data from the production instance to my local MySQL instance. Two options I would like to discuss here are `sessionInitSql` and `compatibility`. The array's value (or values) in `sessionInitSql` are SQL commands we want MySQL Shell to execute on the target when we pull down the data. In this case, we want to drop the database schema on the target to avoid errors when copying the data. The `compatibility` property value tells MySQL Shell to remove the definers for views and stored procedures or functions. When these objects are recreated on the target instance, the user we define to connect to the target instance will become the definer.

After the database schema is copied, we connect to the MySQL instance on my local machine. I added this step because I often want to start interacting with the database once I have copied it from production.

The last command in our function is another call to `print()` to output a message that the process is complete.

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

Whenever we make changes to `mysqlshrc.js` (or `mysalshrc.py`) we need to restart MySQL Shell before we can use the objects that are defined. After stating MySQL Shell, I can connect to my production instance using the command:

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

MySQL Shell is chock full of features but can't cover every use case. Fortunately, the MySQL Shell team gave us several ways to extend the functionality of MySQL Shell. By using startup scripts, we can add custom functionality to MySQL Shell. With this functionality, we can create methods that allow us to perform multistep operations in a single command. Out startup scripts can be written in JavaScript or Python. Head on over to the [documentation](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-creating-startup-scripts.html) to learn more about creating and using startup scripts to customize and extend MySQL Shell.


Photo by <a href="https://unsplash.com/@katya?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Katya Ross</a> on <a href="https://unsplash.com/photos/gray-metal-extension-ladder-on-body-of-water-leaning-on-soil-surface-iKCrbEHYIp4?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  