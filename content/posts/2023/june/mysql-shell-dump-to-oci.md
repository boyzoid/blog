---
title: Using MySQL Shell to Dump Data To And Read Data From OCI Storage Buckets
date: 2023-06-08T06:00:00
image: /assets/images/2023/mysql-shell-dump-to-oci/header.jpeg
tags: [ "MySQL", "MySQL-Shell" ]

---
In a [previous post](posts/2023/may/mysql-shell-threaded-dump/), we discussed how you could use [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) to dump and load data using a multithreaded process. At the end of the post, I mentioned it was possible to dump data to and load data from cloud services such as [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) (OCI). In this post, I will show you how to perform these data dumps and loads using OCI Storage Buckets.

## Prerequisites

Before we get started, there are a few things we need.

1. An OCI account. If you do not have one, you can sign up for an account [here](https://www.oracle.com/cloud/free/).
2. The [OCI Command Line Interface](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) (CLI) installed and configured for your OCI user.
   * When we are dumping data to OCI Buckets, the OCI CLI config is used to provide authentication.
3. A database you want to dump data from. In this demo, we use the [Airports sample database](https://dev.mysql.com/doc/airportdb/en/).
4. MySQL Shell installed.

## Create a Storage Bucket

Before we dump database data to OCI, we first need to create a storage bucket in OCI.

To do this, log in to your OCI account and click the "hamburger" menu icon.

![OCI Hamburger Menu](/assets/images/2023/mysql-shell-dump-to-oci/image01.png "OCI Hamburger Menu")

Enter " buckets " In the search form and then click the "Buckets" link.

![OCI Buckets Link](/assets/images/2023/mysql-shell-dump-to-oci/image02.png "OCI Buckets Link")

Once on the main Buckets page, click the "Create Bucket" button.

![Create Buckets Button](/assets/images/2023/mysql-shell-dump-to-oci/image03.png "Create Buckets Button")

In the "Create Bucket" form, enter a name for the new bucket (1).
In this example, I used "database_dumps".
We can accept the default values for the other fields and click the "Create" button (2).

![Create Bucket Form](/assets/images/2023/mysql-shell-dump-to-oci/image04.png "Create Bucket Form")

When the new bucket is created, it will appear in the list of buckets in our compartment.
Click the link for our new bucket to view the details.

![New Bucket Link](/assets/images/2023/mysql-shell-dump-to-oci/image05.png "New Bucket Link")

On the details page for our new bucket, take note of the "Namespace" value.
We will need this when we run the commands to dump and load our database data.

![Bucket Details](/assets/images/2023/mysql-shell-dump-to-oci/image06.png "Bucket Details")

## Connect to a MySQL Instance

We need to connect MySQL Shell to a MySQL instance to dump our database.
We accomplish this by using a command similar to the following:

```shell
mysqlsh {user}@{server}
```

In this command, `{user]` is the MySQL user we want to connect as, and `{server}` is the IP or domain address of the MySQL instance.
For this demonstration, I am connecting to a [MySQL HeatWave Instance](https://www.mysql.com/cloud/) in OCI, but you do not need to use a MySQL HeatWave instance to dump data to OCI.

## Dump the Data

Now that we are connected run the following command to see the schemas on our MySQL Instance:

```shell
session.getSchemas()
```

The output from this command will look similar to the text below:

```text
[
    <Schema:airportdb>, 
    <Schema:information_schema>, 
    <Schema:mysql>, 
    <Schema:performance_schema>, 
    <Schema:sys>
]
```

We want to dump the data from the `airportdb` database, so we use this command:

```shell
util.dumpSchemas(["airportdb"], "airport_dump", {osBucketName:"database_dumps", osNamespace:"{namespace value}", ocimds: true})
```

Be sure to enter the namespace value for your bucket (and the bucket name if you chose a different name).

In this example, we set the `ocimds` value to `true`.
Setting this option to `true` verifies the source database is compatible with MySQL HeatWave.

When the command completes, we will see output that provides information about the dump.

```text
Acquiring global read lock
Global read lock acquired
Initializing - done 
1 schemas will be dumped and within them 14 tables, 0 views.
Gathering information - done 
All transactions have been started
Locking instance for backup
Global read lock has been released
Checking for compatibility with MySQL Database Service 8.0.33
NOTE: Database `airportdb` had unsupported ENCRYPTION option commented out
Compatibility issues with MySQL Database Service 8.0.33 were found and repaired. Please review the changes made before loading them.
Validating MDS compatibility - done        
Writing global DDL files
Running data dump using 4 threads.
NOTE: Progress information uses estimated values and may not be accurate.
Writing schema metadata - done       
Writing DDL - done         
Writing table metadata - done         
Starting data dump
110% (19.38M rows / ~17.46M rows), 548.97K rows/s, 17.63 MB/s uncompressed, 4.41 MB/s compressed                            
Dump duration: 00:00:34s                                                                        
Total duration: 00:00:35s                                                                       
Schemas dumped: 1                                                                               
Tables dumped: 14                                                                               
Uncompressed data size: 673.93 MB                                                               
Compressed data size: 218.77 MB                                                                 
Compression ratio: 3.1                                                                          
Rows written: 19378298                                                                          
Bytes written: 218.77 MB                                                                        
Average uncompressed throughput: 19.42 MB/s                                                     
Average compressed throughput: 6.30 MB/s 
```

## Check the Bucket

Now that we have created our dump let's check our storage bucket.

Return to the OCI web interface and navigate to the bucket we created earlier.
If we look in the "Objects" section of the Bucket Details page, we will see a folder named "airport_dump".
If we expand this folder, we will see the files created when we performed the data dump.

![Data Dump Files](/assets/images/2023/mysql-shell-dump-to-oci/image07.png "Data Dump Files")

## Load the Data

Now that we have a data dump in OCI, we can load that data into a MySQL Instance.
In this example, we will load the data into the same instance but use a different schema name.
Here is the command to load this dump.

```shell
util.loadDump("airport_dump", {schema: "airportdb_2", osBucketName:"database_dumps", osNamespace:"{namespace value"})
```

The first argument, `airport_dump`, is the folder's name that was created in our bucket.
Remember to use the `namespace` value for your bucket.

Loading this data will likely take longer than dumping it.
When the command is complete, we will see output that provides information about the load.

```text
Loading DDL and Data from OCI ObjectStorage bucket=database_dumps, prefix='airport_dump' using 4 threads.
Opening dump...
Target is MySQL 8.0.33-u2-cloud (MySQL Database Service). Dump was produced from MySQL 8.0.33-u2-cloud
Fetching dump data from remote location...
Listing files - done 
Scanning metadata - done         
Checking for pre-existing objects...
Executing common preamble SQL
Executing DDL - done         
Executing view DDL - done       
Starting data load
2 thds loading | 100% (673.93 MB / 673.93 MB), 2.13 MB/s, 14 / 14 tables done
Recreating indexes - done       
Executing common postamble SQL                                               
39 chunks (19.38M rows, 673.93 MB) for 14 tables in 1 schemas were loaded in 2 min 2 sec (avg throughput 5.85 MB/s)
0 warnings were reported during the load.
```

## Wrap Up

Using MySQL Shell, we can not only use a multithreaded process to dump and load data, but we can also store the dump files in (and read them from) OCI Storage Buckets.
While we only showed the use of `util.dumpSchemas()` in this post, the same options for storing the files in OCI are available with `util.dumpInstance()` and `util.dumpTables()`.
See the documentation for more information on options for [dumping data to](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-dump-instance-schema.html#mysql-shell-utilities-dump-opt-mds-oci) and [loading data from](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-load-dump.html#mysql-shell-utilities-load-dump-opt-mds-oci) OCI.

If you want to learn how you can use this process in an OCI Function, check out this [post](https://blogs.oracle.com/mysql/post/using-oci-serverless-functions-and-api-gateways-to-create-logical-dumps-of-a-mysql-database-service-with-mysql-shell) by my colleague [Fred](https://blogs.oracle.com/authors/frederic-descamps).

Photo by <a href="https://unsplash.com/ko/@sixteenmilesout?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Sixteen Miles Out</a> on <a href="https://unsplash.com/photos/lthWC8oevDg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  
  
