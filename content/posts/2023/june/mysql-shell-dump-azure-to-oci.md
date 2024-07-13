---
title: Moving MySQL Databases from Azure to OCI Using MySQL Shell
date: 2023-06-30T06:00:00
image: 2023/mysql-shell-dump-azure-to-oci/header.jpg
tags: [ "MySQL", "MySQL-Shell", "Oracle-Cloud-Infrastructure" ]

---

In a [recent post](posts/2023/june/mysql-shell-dump-azure-to-oci/) I talked about how we can move data from MySQL running in AWS to a [MySQL HeatWave Database](https://www.mysql.com/cloud/) instance running in [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) (OCI) with just two commands using [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/). In this post, I will show how we can use a similar process to move data from Microsoft Azure to OCI.

## Prerequisites

There are a few things we will need before we can get started.

1. An OCI account. If you do not have one, you can sign up for an account [here](https://www.oracle.com/cloud/free/).
2. A [MySQL HeatWave Database](https://www.mysql.com/cloud/) instance.
3. The [OCI Command Line Interface](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) (CLI) installed and configured for your OCI user.
   * This is used when we load the data from Azure to our MySQL HeatWave Database instance.
4. [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) installed on the system from which you will run the commands.
5. An Azure account with the following:
   * An Azure MySQL database that will be dumped.
   * An Azure storage account
   * An Azure blob storage container where we can dump the database.
6. The [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed and configured for your Azure user above.
   * In this demo, I configured the Azure CLI to use an [SAS Token](https://learn.microsoft.com/en-us/azure/cognitive-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers).

## Dumping the Database

The command for dumping an Azure MySQL database is the same as we used in previous posts.
The differences will come in the `options` object as we want to dump the data into an Azure storage container.

To get started, connect your MySQL Shell instance to your RDS MySQL Database:

```shell
mysqlsh {user name}@{database server}
```

Where `{user name}` is a database user and `{database server}` is your database server's IP address or domain name.
If you have not used MySQL Shell to connect to this instance in the past (or if you did not have MySQL Shell 'remember' the password), you will be asked to provide your password.
Once you are connected, your screen should look like the image below:

![MySQL Shell Connection]({{ "2023/mysql-shell-dump-azure-to-oci/image01.png" | imgurl }}  "MySQL Shell Connection")

For the sake of simplicity, in this post, I am connecting to an Azure MySQL instance that is publicly accessible (that is why I blurred out the domain name).
It would be best to connect to your RDS MySQL Instance however you normally would and ***exercise extreme care in having a database instance exposed to the world.***

Once we are connected to our Azure database, we will dump our chosen schema(s) using the following command:

```shell
util.dumpSchemas(["my_database"], "my-database-dump", {azureStorageAccount: "shelldemo", azureContainerName: "db-dumps", threads:8, ocimds: true, compatibility: ["strip_definers"]})
```

Our first argument is an array of schema names we want to dump.
The second argument is the name of the folder that will be created in our storage container.
The third argument is the options JSON object.
Let's break down what the different arguments represent:
* `azureStorageAccount` - The name of the storage account that manages the storage container.
* `azureContainerName` - The name of the storage container where the data will be dumped.
* `threads` - The number of threads we want to use to perform the dump. The default is 4.
* `ocimds` - Since we will eventually load this database into a MySQL HeatWave instance in OCI, we set this to true. By setting it to true, MySQL Shell will perform compatibility checks to ensure the database can run in OCI.
* `compatibility` - When we dump MySQL databases, we can specify options to determine the database's compatibility. In this example, we use the `strip_definers` compatibility option. This option removes `definer` for stored procedures, user-defined functions, etc., from the dump. When the data is loaded, the `definer` will be the user that MySQL Shell is connected as.

Depending on the size of your database, this process may take a while.
When the process completes, you should see output similar to the following:

```text
NOTE: Backup lock is not available to the account 'sstroz'@'%' and DDL changes will not be blocked. The dump may fail with an error if schema changes are made while dumping.
Acquiring global read lock
Global read lock acquired
Initializing - done 
1 schemas will be dumped and within them 8 tables, 0 views.
Gathering information - done 
All transactions have been started
Global read lock has been released
Writing global DDL files
Running data dump using 8 threads.
NOTE: Progress information uses estimated values and may not be accurate.
Writing schema metadata - done       
Writing DDL - done       
Writing table metadata - done       
Starting data dump
...
101% (137.38K rows / ~135.94K rows), 0.00 rows/s, 0.00 B/s uncompressed, 0.00 B/s compressed
Dump duration: 00:00:00s                                                                    
Total duration: 00:00:02s                                                                   
Schemas dumped: 1                                                                           
Tables dumped: 8                                                                            
Uncompressed data size: 22.90 MB                                                            
Compressed data size: 5.47 MB                                                               
Compression ratio: 4.2                                                                      
Rows written: 137382                                                                        
Bytes written: 5.47 MB                                                                      
Average uncompressed throughput: 22.90 MB/s                                                 
Average compressed throughput: 5.47 MB/s
```

The options JSON object we used here will also work if you are using `util.dumpTables()` or `util.dumpInstance`.

Now that we have our database dumped, we can restore this data to our MySQL HeatWave instance.

## Loading the Database into OCI

Now we need to connect MySQL Shell to our MySQL HeatWave instance.
There are several ways to connect to a MySQL HeatWave instance. I am using a VPN connection set up following the instructions [here](/posts/2023/april/mysql-database-access-openvpn/).

Again, we connect to our MySQL instance using a command similar to:

```shell
mysqlsh {user name}@{database server}
```

Where `{user name}` is a database user and `{database server}` is your database server's IP address or domain name.
If you have not used MySQL Shell to connect to this instance in the past (or if you did not have MySQL Shell 'remember' the password), you will be asked to provide your password.

Once connected to MySQL in OCI, we run the following command:

```shell
util.loadDump("my-database-dump", {azureStorageAccount: "shelldemo", azureContainerName: "db-dumps", threads:8})
```

The first argument, `my-database-dump`, is the name of the folder in our Azure storage container that was created when we did the dump.
The second argument in the options JSON object contains two properties:
* `azureStorageAccount` - The name of the storage account that manages the storage container.
* `azureContainerName` - The name of the storage container where the data will be dumped.
* `threads` - The number of threads we want to use. Again, the default is 4.

If the database is large, this process will take a while.
Once the process is completed, we will see information about the load process that is similar to the text below:

```text
Loading DDL and Data from Azure Container=db-dumps, prefix='my-database-dump' using 8 threads.
Opening dump...
Target is MySQL 8.0.33-u3-cloud (MySQL Database Service). Dump was produced from MySQL 8.0.32
Fetching dump data from remote location...
Listing files - done 
Scanning metadata - done       
Checking for pre-existing objects...
Executing common preamble SQL
Executing DDL - done       
Executing view DDL - done       
Starting data load
1 thds loading \ 100% (22.85 MB / 22.85 MB), 10.28 MB/s, 5 / 6 tables done
Executing common postamble SQL                                            
Recreating indexes - done       
6 chunks (136.37K rows, 22.85 MB) for 6 tables in 1 schemas were loaded in 4 sec (avg throughput 9.99 MB/s)
0 warnings were reported during the load. 
```

As long as there are no errors, we can start using this new database running in OCI.

## The Wrap-Up

MySQL Shell is a powerful tool for managing MySQL database instances, including dumping and loading data to and from cloud storage buckets.
By leveraging this power and ease of use, we can use just two commands to move databases from Azure to OCI.

Photo by <a href="https://unsplash.com/@robinson?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Robinson Greig</a> on <a href="https://unsplash.com/photos/HrnAxAUwle8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
