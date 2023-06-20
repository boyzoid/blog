---
title: Moving MySQL Databases from AWS to OCI Using MySQL Shell
date: 2023-06-21T06:00:00
image: /assets/images/2023/mysql-shell-dump-aws-to-oci/header.jpg
tags: [ "MySQL", "MySQL-Shell", "Oracle-Cloud-Infrastructure" ]

---

In previous posts, we talked about how we can use [MySQL Shell to dump and load databases](posts/2023/may/mysql-shell-threaded-dump/) and how we can dump data to and from [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) (OCI) buckets. In this post, we are going to show how you can use [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) to dump data from a MySQL RDS database to an S3 bucket and then load that data to a [MySQL HeatWave Database](https://www.mysql.com/cloud/) instance running in OCI - and with only two commands.

## Prerequisites

There are a few things we will need before we can get started.

1. An OCI account. If you do not have one, you can sign up for an account [here](https://www.oracle.com/cloud/free/).
2. A [MySQL HeatWave Database](https://www.mysql.com/cloud/) instance.
3. The [OCI Command Line Interface](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) (CLI) installed and configured for your OCI user.
   * This is used when we load the data from AWS to our MySQL HeatWave DDatabase instance.
4. [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) installed on the system from which you will run the commands.
5. An AWS account with the following:
   * An RDS MySQL database that will be dumped.
   * An S3 bucket where we can dump the database.
6. The [AWS CLI](https://aws.amazon.com/cli/) installed and configured for your AWS user above.

## Dumping the Database

The command for dumping an RDS MySQL database is the same as we used in previous posts.
The differences will come in the `options` object as we want to dump the data into an S3 bucket.

To get started, connect your MySQL Shell instance to your RDS MySQL Database:

```shell
mysqlsh {user name}@{database server}
```

Where `{user name}` is a database user and `{database server}` is the IP address or domain name of your database server.
If you have not used MySQL Shell to connect to this instance in the past (or if you did not have MySQL Shell 'remember' the password), you will be asked to provide your password.
Once you are connected, your screen should look like the image below:

![MySQL Shell Connection](/assets/images/2023/mysql-shell-dump-aws-to-oci/image01.png "MySQL Shell Connection")

For the sake of simplicity, in this post, I am connecting to an RDS MySQL instance that is publicly accessible and using an alias in my `HOSTS` file.
It would be best if you connected to your RDS MySQL Instance however you normally would and ***exercise extreme care in having a database instance exposed to the world.***

Once we are connected to our RDS database, we will dump our chosen schema(s) using the following command:

```shell
util.dumpSchemas(["my_database"], "my-database-dump", {s3BucketName: "sstroz-mysql-shell-dumps", threads:8, ocimds:true, compatibility: ["strip_definers"]})
```

Our first argument here is an array of schema names we want to dump.
The second argument is the name of the folder that will be created in our S3 bucket.
The third argument is the options JSON object.
Let's break down what the different arguments represent:
* `s3BucketName` - The name of the S3 bucket to where we will dump our data.
* `threads` - The number of threads we want to use to perform the dump. The default is 4.
* `ocimds` - Since we will eventually load this database into a MySQL HeatWave instance in OCI, we set this to true. By setting it to true, MySQL Shell will perform compatibility checks to ensure the database can run in OCI.
* `compatibility` - When we dump MySQL databases, we can specify options to determine the database's compatibility. In this example, we use the `strip_definers` compatibility option. This option removes `definer` for stored procedures, user-defined functions, etc., from the dump. When the data is loaded, the `definer` will be the user that MySQL Shell is connected as.

Depending on the size of your database, this process may take a while.
When the process completes, you should see output similar to the following:

```text
NOTE: Backup lock is not available to the account 'the_user'@'%' and DDL changes will not be blocked. The dump may fail with an error if schema changes are made while dumping.
Acquiring global read lock
WARNING: The current user lacks privileges to acquire a global read lock using 'FLUSH TABLES WITH READ LOCK'. Falling back to LOCK TABLES...
Table locks acquired
Initializing - done 
1 schemas will be dumped and within them 7 tables, 0 views.
Gathering information - done 
All transactions have been started
Global read lock has been released
Checking for compatibility with MySQL Database Service 8.0.33
NOTE: Database `my_database` had unsupported ENCRYPTION option commented out
Compatibility issues with MySQL Database Service 8.0.33 were found and repaired. Please review the changes made before loading them.
Validating MDS compatibility - done       
Writing global DDL files
Running data dump using 8 threads.
NOTE: Progress information uses estimated values and may not be accurate.
Writing schema metadata - done       
Writing DDL - done       
NOTE: Backup lock is not available to the account 'sstroz'@'%' and DDL changes were not blocked. The DDL is consistent, the world may resume now.
Writing table metadata - done       
Starting data dump
...
101% (136.38K rows / ~134.72K rows), 58.09K rows/s, 10.73 MB/s uncompressed, 2.56 MB/s compressed
Dump duration: 00:00:02s                                                                         
Total duration: 00:00:05s                                                                        
Schemas dumped: 1                                                                                
Tables dumped: 7                                                                                 
Uncompressed data size: 22.85 MB                                                                 
Compressed data size: 5.44 MB                                                                    
Compression ratio: 4.2                                                                           
Rows written: 136382                                                                             
Bytes written: 5.44 MB                                                                           
Average uncompressed throughput: 8.48 MB/s                                                       
Average compressed throughput: 2.02 MB/s
```

We can check the files that are dumped into S3 by running a command similar to:

```shell
aws s3 ls s3://sstroz-mysql-shell-dumps/my-database-dump/ --recursive --human-readable --summarize
```

***Note:** Make sure you update the S3 path above to match your bucket and folder name.*

When this command completes, you should see an output similar to the one below:

```text
2023-06-16 13:30:48  719 Bytes my-database-dump/@.done.json
2023-06-16 13:30:45 1008 Bytes my-database-dump/@.json
2023-06-16 13:30:46  242 Bytes my-database-dump/@.post.sql
2023-06-16 13:30:45  242 Bytes my-database-dump/@.sql
2023-06-16 13:33:36    3.4 KiB my-database-dump/load-progress.d2289553-f576-11ed-8e08-020017219a59.json
2023-06-16 13:30:46  672 Bytes my-database-dump/my_database.json
2023-06-16 13:30:46  605 Bytes my-database-dump/my_database.sql
...
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
util.loadDump("my-database-dump", {s3BucketName:"sstroz-mysql-shell-dumps", threads:8})
```

The first argument, `my-database-dump`, is the name of the folder in S3 that was created when we did the dump.
The second argument in the options JSON object contains two properties:
* `s3BucketName` - The name of the bucket where we dumped the data.
* `threads` - The number of threads we want to use. Again, the default is 4.

If the database is large, this process will take a while.
Once the process is completed, we will see information about the load process that is similar to the text below:

```text
Loading DDL and Data from AWS S3 bucket=sstroz-mysql-shell-dumps, prefix='my-database-dump' using 8 threads.
Opening dump...
Target is MySQL 8.0.33-u3-cloud (MySQL Database Service). Dump was produced from MySQL 8.0.33
Fetching dump data from remote location...
Listing files - done 
Scanning metadata - done       
Checking for pre-existing objects...
Executing common preamble SQL
Executing DDL - done       
Executing view DDL - done       
Starting data load
1 thds loading \ 100% (22.85 MB / 22.85 MB), 9.01 MB/s, 6 / 7 tables done 
Recreating indexes - done       
Executing common postamble SQL                                           
7 chunks (136.38K rows, 22.85 MB) for 7 tables in 1 schemas were loaded in 5 sec (avg throughput 9.01 MB/s)
0 warnings were reported during the load.
```

As long as there are no errors, we can start using this new database running in OCI.

## The Wrap-Up

MySQL Shell is a powerful tool for managing MySQL database instances, including dumping and loading data to and from cloud storage buckets.
By leveraging this power and ease of use, we can use just two commands to move databases from AWS to OCI.

Photo by <a href="https://unsplash.com/de/@handiworknyc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Handiwork NYC</a> on <a href="https://unsplash.com/photos/x6pnKtPZ-8s?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
