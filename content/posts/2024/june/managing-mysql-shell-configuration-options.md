---
title: Managing MySQL Shell Configuration Options
date: 2024-06-13T06:00:00
image: /assets/images/2024/managing-mysql-shell-configuration-options/header.png
tags: [ "MySQL", "MySQL-Shell" ]
related:
  - /posts/2024/may/mysql-shell-run-scripts/
  - /posts/2024/may/mysql-shell-system-commands/
  - /posts/2024/may/getting-help-mysql-shell/
  - /posts/2024/june/mysql-shell-sandboxes/
  - /posts/2024/june/server-upgrade-check-mysql-shell/
  - /posts/2024/june/connection-status-mysql-shell/
  - /posts/2024/july/data-dump-load-mysql-shell/

---

Over the last few years, I have become quite smitten with [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/). For those who may not be familiar with MySQL Shell, it is a new(ish) command line interface (CLI) for connecting to and managing MySQL instances. During a recent [episode](https://insidemysql.libsyn.com/mysql-shell-does-all-the-things) of [Inside MySQL: Sakila Speaks](https://insidemysql.libsyn.com/), Fred and I talked to Miguel Araujo about many of the helpful (and lesser known) features of MySQL Shell. This post is the seventh in a series about these "hidden gem" features.

## The Problem

As with any tool, the out-of-the-box configuration for MySQL Shell might not fit the needs or desires of every user in every situation. We need a way to easily view, update, and persist (if necessary) changes to the default configuration.

## The Solution

If you have been reading my other posts about some hidden gems in MySQL Shell, you have already figured out we have a command to help us manage our MySQL Shell configuration. That command is `\option`.

### Listing Options

We can list the options available to us by using the command:

```shell
\option -l
```

In version 8.4 of MySQL Shell, the output from this command will resemble the following:

```text
autocomplete.nameCache          true
batchContinueOnError            false
connectTimeout                  10
credentialStore.excludeFilters  []
credentialStore.helper          default
credentialStore.savePasswords   always
dba.connectTimeout              5
dba.connectivityChecks          true
dba.gtidWaitTimeout             60
dba.logSql                      0
dba.restartWaitTimeout          60
defaultCompress                 false
defaultMode                     none
devapi.dbObjectHandles          true
history.autoSave                true
history.maxSize                 1000
history.sql.ignorePattern       *IDENTIFIED*:*PASSWORD*
history.sql.syslog              false
interactive                     true
logFile                         /path/to/stuff/.mysqlsh/mysqlsh.log
logLevel                        5
logSql                          error
logSql.ignorePattern            *SELECT*:SHOW*
logSql.ignorePatternUnsafe      *IDENTIFIED*:*PASSWORD*
mysqlPluginDir                  /path/to/other/stuff/lib/mysql/plugins
oci.configFile                  /path/to/stuff/.oci/config
oci.profile                     DEFAULT
outputFormat                    table
pager                           ""
passwordsFromStdin              false
resultFormat                    table
sandboxDir                      /path/to/stuff/mysql-sandboxes
showColumnTypeInfo              false
showWarnings                    true
ssh.bufferSize                  10240
ssh.configFile                  ""
useWizards                      true
verbose                         0
```

**Since I have already updated some of these options, your values may differ.**

Check out the [documentation](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-configuring-options.html) for more details on these options and possible values.

### Updating the Configuration

The syntax for updating configuration values is as follows:

```shell
\option {option name} {value}
```

Or

```shell
\option {option name=value}
```

Let's assume that we need to change the value of the `verbose` from `0` to `4` while troubleshooting an issue. We can change this value by executing the command:

```shell
\option verbose=4
```

When we run `\option -l` again, we will see the value of `verbose` was updated to `4`.

```text
autocomplete.nameCache          true
batchContinueOnError            false
connectTimeout                  10
credentialStore.excludeFilters  []
credentialStore.helper          default
credentialStore.savePasswords   always
dba.connectTimeout              5
dba.connectivityChecks          true
dba.gtidWaitTimeout             60
dba.logSql                      0
dba.restartWaitTimeout          60
defaultCompress                 false
defaultMode                     none
devapi.dbObjectHandles          true
history.autoSave                true
history.maxSize                 1000
history.sql.ignorePattern       *IDENTIFIED*:*PASSWORD*
history.sql.syslog              false
interactive                     true
logFile                         /path/to/stuff/.mysqlsh/mysqlsh.log
logLevel                        5
logSql                          error
logSql.ignorePattern            *SELECT*:SHOW*
logSql.ignorePatternUnsafe      *IDENTIFIED*:*PASSWORD*
mysqlPluginDir                  /path/to/other/stuff/lib/mysql/plugins
oci.configFile                  /path/to/stuff/.oci/config
oci.profile                     DEFAULT
outputFormat                    table
pager                           ""
passwordsFromStdin              false
resultFormat                    table
sandboxDir                      /path/to/stuff/mysql-sandboxes
showColumnTypeInfo              false
showWarnings                    true
ssh.bufferSize                  10240
ssh.configFile                  ""
useWizards                      true
verbose                         4
```

When we update configuration values using this command syntax, the value is only updated for the session. If we were to quit MySQL Shell and start it again, the' verbose' value would revert to `0`.

### Persisting an Update

Until version 8.4 of MySQL Shell, it wou8ld start in JavaScript by default. As of version 8.4, MySQL Shell starts in SQL mode. I use JavaScript mode more frequently, so I want to update my configuration to set the value of the `defaultMode` option to `js` and have this change persist across sessions. The syntax to save the configuration update to the local config file so it can persist across sessions is:

```shell
\option --persist {option name=value}
```

So, to update the `defaultMode` value and have it saved to the local configuration file, we would use this command:

```shell
\option --persist defaultMode=js
```

Let's verify the change by running `\option -l`.

```text
autocomplete.nameCache          true
batchContinueOnError            false
connectTimeout                  10
credentialStore.excludeFilters  []
credentialStore.helper          default
credentialStore.savePasswords   always
dba.connectTimeout              5
dba.connectivityChecks          true
dba.gtidWaitTimeout             60
dba.logSql                      0
dba.restartWaitTimeout          60
defaultCompress                 false
defaultMode                     js
devapi.dbObjectHandles          true
history.autoSave                true
history.maxSize                 1000
history.sql.ignorePattern       *IDENTIFIED*:*PASSWORD*
history.sql.syslog              false
interactive                     true
logFile                         /path/to/stuff/.mysqlsh/mysqlsh.log
logLevel                        5
logSql                          error
logSql.ignorePattern            *SELECT*:SHOW*
logSql.ignorePatternUnsafe      *IDENTIFIED*:*PASSWORD*
mysqlPluginDir                  /path/to/other/stuff/lib/mysql/plugins
oci.configFile                  /path/to/stuff/.oci/config
oci.profile                     DEFAULT
outputFormat                    table
pager                           ""
passwordsFromStdin              false
resultFormat                    table
sandboxDir                      /path/to/stuff/mysql-sandboxes
showColumnTypeInfo              false
showWarnings                    true
ssh.bufferSize                  10240
ssh.configFile                  ""
useWizards                      true
verbose                         0
```
### Checking Source of Values

We can view where the value got its value by using the follwoing command:

```shell
\option -l --show-origin
```

The output will resemble the text below.

```text
autocomplete.nameCache          true (Compiled default)
batchContinueOnError            false (Compiled default)
connectTimeout                  10 (Compiled default)
credentialStore.excludeFilters  [] (Compiled default)
credentialStore.helper          default (Compiled default)
credentialStore.savePasswords   always (Configuration file)
dba.connectTimeout              5 (Compiled default)
dba.connectivityChecks          true (Compiled default)
dba.gtidWaitTimeout             60 (Compiled default)
dba.logSql                      0 (Compiled default)
dba.restartWaitTimeout          60 (Compiled default)
defaultCompress                 false (Compiled default)
defaultMode                     js (Configuration file)
devapi.dbObjectHandles          true (Compiled default)
history.autoSave                true (Configuration file)
history.maxSize                 1000 (Compiled default)
history.sql.ignorePattern       *IDENTIFIED*:*PASSWORD* (Compiled default)
history.sql.syslog              false (Compiled default)
interactive                     true (Compiled default)
logFile                         /path/to/stuff/.mysqlsh/mysqlsh.log (Compiled default)
logLevel                        5 (Compiled default)
logSql                          error (Compiled default)
logSql.ignorePattern            *SELECT*:SHOW* (Compiled default)
logSql.ignorePatternUnsafe      *IDENTIFIED*:*PASSWORD* (Compiled default)
mysqlPluginDir                  /path/to/other/stuff/lib/mysql/plugins (Compiled default)
oci.configFile                  /path/to/stuff/.oci/config (Compiled default)
oci.profile                     DEFAULT (Compiled default)
outputFormat                    table (Compiled default)
pager                           "" (Environment variable)
passwordsFromStdin              false (Compiled default)
resultFormat                    table (Compiled default)
sandboxDir                      /path/to/stuff/mysql-sandboxes (Compiled default)
showColumnTypeInfo              false (Compiled default)
showWarnings                    true (Compiled default)
ssh.bufferSize                  10240 (Compiled default)
ssh.configFile                  "" (Compiled default)
useWizards                      true (Compiled default)
verbose                         0 (Compiled default)
```

We can see that many of the values are `Compiled default`, some are `Configuration file`, and one is `Environment variable`. Note that the value of `defaultMode` shows the value came from the configuration file. This message is because I restarted MySQL Shell after changing the value to `js`. If I had not restarted MySQl Shell, it would show the origin as `User defined`. Any value that we change but do not persist will also show as `User defined`.

### Revert to Default Values

If we made a configuration change and wanted to revert the value to the default, we would use the following syntax to revert an option to its default value.

```shell
\option --unset {option name}
```

or

```shell
\option --unset --persist {option name}
```

Both of these commands will revert the option's value to the default for the current session. The second example will remove the option value from the MySQL Shell configuration file.

To revert the `defaultMode` to the default value and remove this from the configuration file, we run the command:

```shell
\option --unset --persist defaultMode
```

When we run `\option -l --show-origin`, we will see output similar to:

```text
autocomplete.nameCache          true (Compiled default)
 batchContinueOnError            false (Compiled default)
 connectTimeout                  10 (Compiled default)
 credentialStore.excludeFilters  [] (Compiled default)
 credentialStore.helper          default (Compiled default)
 credentialStore.savePasswords   always (Configuration file)
 dba.connectTimeout              5 (Compiled default)
 dba.connectivityChecks          true (Compiled default)
 dba.gtidWaitTimeout             60 (Compiled default)
 dba.logSql                      0 (Compiled default)
 dba.restartWaitTimeout          60 (Compiled default)
 defaultCompress                 false (Compiled default)
 defaultMode                     none (Compiled default)
 devapi.dbObjectHandles          true (Compiled default)
 history.autoSave                true (Configuration file)
 history.maxSize                 1000 (Compiled default)
 history.sql.ignorePattern       *IDENTIFIED*:*PASSWORD* (Compiled default)
 history.sql.syslog              false (Compiled default)
 interactive                     true (Compiled default)
 logFile                         /path/to/stuff/.mysqlsh/mysqlsh.log (Compiled default)
 logLevel                        5 (Compiled default)
 logSql                          error (Compiled default)
 logSql.ignorePattern            *SELECT*:SHOW* (Compiled default)
 logSql.ignorePatternUnsafe      *IDENTIFIED*:*PASSWORD* (Compiled default)
 mysqlPluginDir                  /path/to/other/stuff/lib/mysql/plugins (Compiled default)
 oci.configFile                  /path/to/stuff/.oci/config (Compiled default)
 oci.profile                     DEFAULT (Compiled default)
 outputFormat                    table (Compiled default)
 pager                           "" (Environment variable)
 passwordsFromStdin              false (Compiled default)
 resultFormat                    table (Compiled default)
 sandboxDir                      /path/to/stuff/mysql-sandboxes (Compiled default)
 showColumnTypeInfo              false (Compiled default)
 showWarnings                    true (Compiled default)
 ssh.bufferSize                  10240 (Compiled default)
 ssh.configFile                  "" (Compiled default)
 useWizards                      true (Compiled default)
 verbose                         0 (Compiled default)
```

The value of `defaultMode` is now `none` and we can see that value was a compiled default value.

## Wrap-Up

MySQL Shell has multiple configuration options to fit different situations and different user preferences. Using the `\option` command, we can view and manage these configuration values. We can even persist these values across MySQL Shell sessions. If you want to learn more about updating the configuration for MySQL Shell, head on over to the [documentation](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-configuring-options.html).

Image by <a href="https://pixabay.com/users/toufik_ntizi-2076208/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1331578">Toufik</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1331578">Pixabay</a>