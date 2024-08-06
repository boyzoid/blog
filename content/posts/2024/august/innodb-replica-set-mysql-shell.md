---
title: Create an InnoDB Replica Set With MySQL Shell
date: 2024-08-06T06:00:00
image: 2024/innodb-replica-set-mysql-shell/header.jpg
tags: [ "MySQL", "MySQL-Shell" ]
series: mysql-shell-gems
description: Using MySQL shell, we can create an InnoDB replica set using two commands.
---

Using [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/), we can quickly and easily create an InnoDB replica set. With as little as two commands, we can create a replica set, add a secondary instance, and clone data from our primary instance to a secondary instance. In this post, we will demonstrate how to accomplish this.

## The Setup

Before building this example, I deployed two [MySQL sandbox instances](/posts/2024/june/mysql-shell-sandboxes/) that use ports 5555 and 5556. The instance running on port 5555 will be our primary instance, and the one on port 5556 will be our secondary instance. I loaded a schema named [`mysql_shorts`](https://www.youtube.com/playlist?list=PLWx5a9Tn2EvG4C90YFJ9eU61IpALeE0SN) into the instance on port 5555, so we have data to replicate.

To show the schemas on each instance, we run the command:

```sql
show schemas;
```

On the instance running on port 5555, I see the following results:

```text
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| mysql_shorts       |
| performance_schema |
| sys                |
+--------------------+
```

On the instance running on port 5556, I see the following results:

```text
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
```

Note that these results are the same, except the `mysql_shorts` schema exists in the first instance but not the second.

## Create Replica Set

To create a replica set, we connect to the instance on port 5555 using MySQL Shell and run the following command in JavaScript mode.

```javascript
var rs = dba.createReplicaSet("demo_set")
```

This command will set the value of `rs` to the new replica set that is created. When this command completes, we will see output similar to the text below.

```text
A new replicaset with instance '127.0.0.1:5555' will be created.

* Checking MySQL instance at 127.0.0.1:5555

This instance reports its own address as 127.0.0.1:5555
127.0.0.1:5555: Instance configuration is suitable.

* Checking connectivity and SSL configuration...
* Updating metadata...

ReplicaSet object successfully created for 127.0.0.1:5555.
Use rs.addInstance() to add more asynchronously replicated instances to this replicaset and rs.status() to check its status.

<ReplicaSet:demo_set>
```

### Check the Status

We can check the status of our new replica set by running the command below.

```javascript
rs.status()
```

The output for this command will display the status of our replica set as a JSON object.

```json
{
    "replicaSet": {
        "name": "demo_set", 
        "primary": "127.0.0.1:5555", 
        "status": "AVAILABLE", 
        "statusText": "All instances available.", 
        "topology": {
            "127.0.0.1:5555": {
                "address": "127.0.0.1:5555", 
                "instanceRole": "PRIMARY", 
                "mode": "R/W", 
                "status": "ONLINE"
            }
        }, 
        "type": "ASYNC"
    }
}
```

We can see only a single instance as part of the replica set named `demo_set`.

## Add a Secondary Instance

The next step in creating an InnoDB replica set is to add one or more secondary instances. We will add a single secondary instance. While still connected to our primary instance with MySQL Shell, we run the following command:

```javascript
rs.addInstance('root@localhost:5556')
```

This command calls the `addInstance()` method on our new replica set object, `rs`. When we call this method, we pass a single argument: the connection string to the instance we wish to add. In this case, we want to connect to an instance on our local system on port 5556 using the user `root`.

**Note:** *I am using the `root` user in this example for ease of use. In an actual production system, you should avoid using a `root` for any processes, including replication.*

You will be asked to select a recovery method when this command is run. I chose `Clone` in this example because it is the easiest way to move data from the primary to a secondary instance.

The output from running this command will resemble the text below.

```text
Adding instance to the replicaset...

* Performing validation checks

This instance reports its own address as 127.0.0.1:5556
127.0.0.1:5556: Instance configuration is suitable.

* Checking async replication topology...

* Checking connectivity and SSL configuration...

* Checking transaction state of the instance...

NOTE: The target instance '127.0.0.1:5556' has not been pre-provisioned (GTID set is empty). The Shell is unable to decide whether replication can completely recover its state.
The safest and most convenient way to provision a new instance is through automatic clone provisioning, which will completely overwrite the state of '127.0.0.1:5556' with a physical snapshot from an existing replicaset member. To use this method by default, set the 'recoveryMethod' option to 'clone'.

WARNING: It should be safe to rely on replication to incrementally recover the state of the new instance if you are sure all updates ever executed in the replicaset were done with GTIDs enabled, there are no purged transactions and the new instance contains the same GTID set as the replicaset or a subset of it. To use this method by default, set the 'recoveryMethod' option to 'incremental'.


Please select a recovery method [C]lone/[I]ncremental recovery/[A]bort (default Clone): Clone
* Updating topology
Monitoring Clone based state recovery of the new member. Press ^C to abort the operation.
Clone based state recovery is now in progress.

NOTE: A server restart is expected to happen as part of the clone process. If the
server does not support the RESTART command or does not come back after a
while, you may need to manually start it back.

* Waiting for clone to finish...
NOTE: 127.0.0.1:5556 is being cloned from 127.0.0.1:5555
** Stage DROP DATA: Completed
** Clone Transfer  
    FILE COPY  ############################################################  100%  Completed
    PAGE COPY  ############################################################  100%  Completed
    REDO COPY  ############################################################  100%  Completed
* Clone process has finished: 166.11 MB transferred in about 1 second (~166.11 MB/s)

** Changing replication source of 127.0.0.1:5556 to 127.0.0.1:5555
** Waiting for new instance to synchronize with PRIMARY...
** Transactions replicated  ############################################################  100% 


The instance '127.0.0.1:5556' was added to the replicaset and is replicating from 127.0.0.1:5555.

* Waiting for instance '127.0.0.1:5556' to synchronize the Metadata updates with the PRIMARY...
** Transactions replicated  ############################################################  100%
```

The messages we receive show the progress of the replication and that the instance on port 5556 was added to the replica set and is replication from the instance on port 5556.

### Check the Status

With a secondary instance added to our replica set. Let's take a look at the status of our replica set by running the command below:

```javascript
rs.status()
```

The status of our replica set now shows the newly added secondary node.

```json
{
    "replicaSet": {
        "name": "demo_set", 
        "primary": "127.0.0.1:5555", 
        "status": "AVAILABLE", 
        "statusText": "All instances available.", 
        "topology": {
            "127.0.0.1:5555": {
                "address": "127.0.0.1:5555", 
                "instanceRole": "PRIMARY", 
                "mode": "R/W", 
                "status": "ONLINE"
            }, 
            "127.0.0.1:5556": {
                "address": "127.0.0.1:5556", 
                "instanceRole": "SECONDARY", 
                "mode": "R/O", 
                "replication": {
                    "applierStatus": "APPLIED_ALL", 
                    "applierThreadState": "Waiting for an event from Coordinator", 
                    "applierWorkerThreads": 4, 
                    "receiverStatus": "ON", 
                    "receiverThreadState": "Waiting for source to send event", 
                    "replicationLag": null, 
                    "replicationSsl": "TLS_AES_128_GCM_SHA256 TLSv1.3", 
                    "replicationSslMode": "REQUIRED"
                }, 
                "status": "ONLINE"
            }
        }, 
        "type": "ASYNC"
    }
}
```

## Checking Our Work

Now that our replica set is running, let's check to ensure it works as expected.

### Secondary Schemas

To see the schemas now on the secondary instance (the one on port 5556), we connect to that instance with MySQL Shell and run the following command:

```sql
show schemas;
```

The results of this command resemble the text below.

```text
+-------------------------------+
| Database                      |
+-------------------------------+
| information_schema            |
| mysql                         |
| mysql_innodb_cluster_metadata |
| mysql_shorts                  |
| performance_schema            |
| sys                           |
+-------------------------------+
```

There are now two new schemas.

* `mysql_shorts` - The schema copied from our primary instance.
* `mysql_innodb_cluster_metadata` - A schema that is used to manage replication.

### Insert Row Into Primary

We will insert a row of data into a table named `user` in the `mysql_shorts` schema. This table has four columns.

* `id` - The primary key of the table.
* `first_name` - The user's first name.
* `last_name` - The user's last name.
* `email` - The user's email address.

We connect to the primary instance (on port 5555) using MySQL Shell and run the following query:

```sql
insert into 
    mysql_shorts.user(
    first_name, 
    last_name, 
    email
    ) 
values (
    'Skippy', 
    'Dinglehoffer', 
    'skip@dingle.com'
       );
```

To verify the row was added as we expected, we run the following query:

```sql
select * from mysql_shorts.user order by id desc limit 5;
```

The result of this query is:

```text
+------+------------+--------------+---------------------------+
| id   | first_name | last_name    | email                     |
+------+------------+--------------+---------------------------+
| 1001 | Skippy     | Dinglehoffer | skip@dingle.com           |
| 1000 | Sharline   | Argile       | sargilerr@weather.com     |
|  999 | Gus        | Smerdon      | gsmerdonrq@csmonitor.com  |
|  998 | Matthias   | Lomen        | mlomenrp@seattletimes.com |
|  997 | Liv        | Balsom       | lbalsomro@hostgator.com   |
+------+------------+--------------+---------------------------+
```

We can see that the user Skippy Dinglehoffer was added to the table on the primary instance.

### Check the Replica

To see if the replication works as it should, we connect to the secondary instance (the one on port 5556) using MySQL Shell and execute the same query as above.

```sql
select * from mysql_shorts.user order by id desc limit 5;
```

The output from this query will match the output from the query when run on the primary instance.

````text
+------+------------+--------------+---------------------------+
| id   | first_name | last_name    | email                     |
+------+------------+--------------+---------------------------+
| 1001 | Skippy     | Dinglehoffer | skip@dingle.com           |
| 1000 | Sharline   | Argile       | sargilerr@weather.com     |
|  999 | Gus        | Smerdon      | gsmerdonrq@csmonitor.com  |
|  998 | Matthias   | Lomen        | mlomenrp@seattletimes.com |
|  997 | Liv        | Balsom       | lbalsomro@hostgator.com   |
+------+------------+--------------+---------------------------+
````

The fact that the user we added to the primary instance is now on the secondary instance tells us that the replication is working as expected.

### Check read Only on Secondary

When creating a replica set the way we did, all secondary instances are created as `read-only`. This means that we cannot insert data directly into any secondary instance.

We can check this by trying to insert a row of data into the `mysql_shorts.user` table by running the following query.

```sql
insert into 
    mysql_shorts.user(
    first_name, 
    last_name, 
    email
    ) 
values (
    'Skippy', 
    'Danglehoffer', 
    'skip@dangle.com'
       );
```

We should get the following message to let us know the secondary instance is indeed `read-only`.

```text
ERROR: 1290 (HY000): The MySQL server is running with the --super-read-only option so it cannot execute this statement
```

## Wrap Up

Using MySQL Shell, we can quickly and easily create InnoDB replica sets. With just a few commands, we can create an InnoDB replica set and add secondary instances to it. We can also test the commands to create an InnoDB replica set using MySQL sandbox instances and MySQL Shell. For more information on replica sets, check out the [documentation](https://dev.mysql.com/doc/refman/8.4/en/mysql-innodb-replicaset-introduction.html).


Image by <a href="https://pixabay.com/users/ar130405-423602/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=2082634">ar130405</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=2082634">Pixabay</a>