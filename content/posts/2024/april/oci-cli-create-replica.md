---
title: Creating a MySQL HeatWave Read Replica with the OCI CLI
date: 2024-04-16T06:00:00
image: /assets/images/2024/oci-cli-create-replica/header.jpg
tags: [ "MySQL", "MySQL-HeatWave", "OCI", "CLI" ]
related:
  - /posts/2024/april/oci-cli-create-heatwave-instance/
  - /posts/2024/april/oci-cli-heatwave-list-update/
  - /posts/2024/april/oci-cli-backup-create-restore/
  - /posts/2024/april/oci-cli-create-configuration/
  - /posts/2024/april/oci-cli-create-channel/
---

This is the fourth post in a series dedicated to showing how to use the [OCI CLI](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/cliconcepts.htm) to manage [MySQL HeatWave](https://www.oracle.com/mysql/) resources. This post will discuss how to create a read replica of a MySQL HeatWave instance.

## Prerequisites

Before you can run any of the examples below, you need to install the OCI CLI. If you do not have the CLI installed, follow the instructions [here](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) to install and configure the CLI.

## Creating a Replica

### What is a Read Replica?

A 'read replica' is a copy of a database where data can only be read. This means we can only run `SELECT` queries and not `INSERT`, `UPDATE`, or `DELETE` queries. Read replicas are useful with databases with a lot of data or many `write` or `read` operations. The primary instance can handle' write' operations more efficiently by sending `read` queries to a separate database instance.

### Generating Command JSON

***NOTE:** With MySQL HeatWave, we can only create a replica of shapes with at least 8 ECPUs or 4 OCPUs. In our previous demos, we used smaller shapes. For this demo, I created a new MySQL HeatWave instance using the ` MySQL.8` shape that has 8 ECPUs and will use that instance as the source database system.*

As we did in [this post](/posts/2024/april/oci-cli-create-heatwave-instance/#generate-command-json), we are first going to create a JSON file of all the possible options for creating a replica. The command to create this JSON file is:

```commandline
oci mysql replica create --generate-full-command-json-input > replica-create.json
```

The file `replica-create.json` will resemble:

```json
{
  "dbSystemId": "string",
  "definedTags": {
    "tagNamespace1": {
      "tagKey1": "tagValue1",
      "tagKey2": "tagValue2"
    },
    "tagNamespace2": {
      "tagKey1": "tagValue1",
      "tagKey2": "tagValue2"
    }
  },
  "description": "string",
  "displayName": "string",
  "freeformTags": {
    "tagKey1": "tagValue1",
    "tagKey2": "tagValue2"
  },
  "isDeleteProtected": true,
  "maxWaitSeconds": 0,
  "replicaOverrides": {
    "configurationId": "string",
    "mysqlVersion": "string",
    "shapeName": "string"
  },
  "waitForState": [
    "ACCEPTED|IN_PROGRESS|FAILED|SUCCEEDED|CANCELING|CANCELED"
  ],
  "waitIntervalSeconds": 0
}
```

An interesting part of this config is the following block:

```json
"replicaOverrides": {
    "configurationId": "string",
    "mysqlVersion": "string",
    "shapeName": "string"
}
```

These values allow us to create a read replica with a different configuration, shape, or MySQL version from the primary or source HeatWave instance.

After updating this file to include only the information we need to create a replica, it looks like the following:

```json
{
  "dbSystemId": "ocid1.mysqldbsystem.oc1.{more text}",
  "description": "A MySQL HeatWave read replica created with OCI CLI",
  "displayName": "OCI CLI Demo Replica",
  "isDeleteProtected": true,
  "waitForState": ["SUCCEEDED"]
}
```

We set the `dbSystemId` property to the OCID for the HeatWave instance we want to replicate and give the new instance a `description` and `displayName`. We set the `isDeleteProtected` property to true, and lastly, we tell the CLI to wait until the command state is `SUCCEEDED` before returning any information. The command may return as `SUCCEEDED` before the replica is fully provisioned.

### Run the Command

To create a new replica using this JSON config file, we run the command:

```commandline
oci mysql replica create --from-json file://{path to file}
```

When we run this command, we will see the following text in the command/terminal window:

```text
Action completed. Waiting until the work request has entered state: ('SUCCEEDED',)
```

Once the command has reached a state of `SUCCEEDED`, we will see more information about the replica:

```json
{
  "data": {
    "compartment-id": "ocid1.compartment.oc1.{more text}",
    "id": "ocid1.mysqlworkrequest.oc1.{more text}",
    "operation-type": "CREATE_BACKUP",
    "percent-complete": 100.0,
    "resources": [
      {
        "action-type": "RELATED",
        "entity-type": "mysqldbsystem",
        "entity-uri": "/dbSystems/ocid1.mysqldbsystem.oc1.{more text}",
        "identifier": "ocid1.mysqldbsystem.oc1.{more text}"
      },
      {
        "action-type": "CREATED",
        "entity-type": "mysqlbackup",
        "entity-uri": "/backups/ocid1.mysqlbackup.oc1.{more text}",
        "identifier": "ocid1.mysqlbackup.oc1.{more text}"
      }
    ],
    "status": "SUCCEEDED",
    "time-accepted": "2024-04-08T16:46:59.557000+00:00",
    "time-finished": "2024-04-08T16:48:29.876000+00:00",
    "time-started": "2024-04-08T16:47:06.897000+00:00"
  }
}
```

Remember, the command may return as a `SUCCEEDED` state before the replica is available. Once the replica shows as `ACTIVE,` you can start using it.

## Wrap-up

Read replicas can help the performance of a database by shifting `read` operations to a replica of the database. The results of any `write` operations are automatically updated on the read replica and can be applied in near real-time. Using the OCI CLI, we can create a read replica with the same shape, MySQL version, or configuration as the primary MySQL HeatWave instance or modify any of these properties on the replica. In future posts, we will discuss managing configurations and replication channels.

Photo by <a href="https://unsplash.com/@martzzl?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Marcel Strauß</a> on <a href="https://unsplash.com/photos/white-clouds-in-blue-sky---O3nODu2KQ?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
