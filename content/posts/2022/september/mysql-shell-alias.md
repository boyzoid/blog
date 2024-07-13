---
title: MySQL Shell Alias For PowerShell
date: 2022-09-09T06:00:00
image: 2022/mysql-alias.jpg
tags: ["MySQL", "MySQL-Shell", "PowerShell"]
---

Yesterday, my colleague, [Fred (AKA LeFred)](https://lefred.be/), shared a [blog post](https://lefred.be/content/always-use-mysql-shell/) that discusses setting up aliases that allow us to run [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) when we enter `mysql` at a command prompt.

Since I also use Windows regularly, I wanted to share how you can set up those same aliases in [Windows PowerShell](https://docs.microsoft.com/en-us/powershell/).

We need to update our profile script to create permanent aliases in PowerShell. To determine where this file is located, open a PowerShell window and enter:

```powershell
$profile
```

You should see text that looks like this:

```text
C:\Users\{username}\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
```

`{username}` will be the user currently logged in.

Once we have this file path, open that file in a text editor and add the following lines:

```powershell
Function myshell{ mysqlsh --sql mysqlx://localhost }
Function myshellx{ mysqlsh --js mysqlx://localhost}

Set-Alias -Name mysql -Value myshell
Set-Alias -Name mysqlx -Value myshellx
```
Breaking these down, we see that running `mysql` from a PowerShell prompt will run `mysqlsh` in 'SQL mode', and running `mysqlx` will run `mysqlsh` in 'JS Mode'. In both cases, it will attempt to connect to MySQL on the local system.

As Fred noted, by default MySQL Shell will try to log in to the MySQL server with the user running the command. If you want to use a different user, `my_user` for example, you could modify the function definitions to look like this:

```powershell
Function myshell{ mysqlsh --sql mysqlx://my_user@localhost }
Function myshellx{ mysqlsh --js mysqlx://my_user@localhost}
```
I have my local development environment set up for MySQL with a user that matches the username of my Windows user, so I can use the first examples.

Make sure you have saved your changes, and then from a PowerShell prompt, run:

```powershell
. $profile
```

This will reload our profile and pull in our new aliases.

Now, when we run the `mysql` command in PowerShell, we will see the following results:

![MySQL Shell SQL mode example]({{ "2022/mysql-shell-alias/mysql.png" | imgurl }}  "MySQL Shell SQL Mode Example")

If we want to start MySQL Shell in JS mode, we use the `mysqlx` command.

![MySQL Shell JS mode example]({{ "2022/mysql-shell-alias/mysqlx.png" | imgurl }}  "MySQL Shell JS Mode Example")

I am a big fan of MySQL Shell, and these aliases allow me to open MySQL Shell in the mode I want much quicker.

Photo by [Stéphan Valentin](https://unsplash.com/@valentinsteph?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/power-shell?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
