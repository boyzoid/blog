---
title: Backing up and Restoring a MySQL HeatWave Instance with the OCI CLI
date: 2024-04-12T06:00:00
image: 2024/oci-cli-backup-create-restore/header.jpg
tags: [ "MySQL", "MySQL-HeatWave", "OCI", "CLI" ]
related:
  - /posts/2024/april/oci-cli-create-heatwave-instance/
  - /posts/2024/april/oci-cli-heatwave-list-update/
  - /posts/2024/april/oci-cli-create-replica/
  - /posts/2024/april/oci-cli-create-configuration/
  - /posts/2024/april/oci-cli-create-channel/
---

This is the third post in a series dedicated to showing how to use the [OCI CLI](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/cliconcepts.htm) to manage [MySQL HeatWave](https://www.oracle.com/mysql/) resources. In this post, we will discuss how to create a backup of a MySQL HeatWave instance and create a new MySQL HeatWave instance from that backup.

## Prerequisites

Before you can run any of the examples below, you need to install the OCI CLI. If you do not have the CLI installed, follow the instructions [here](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) to install and configure the CLI.

## Creating the Backup

### Generating Command JSON

As we did in [this post](/posts/2024/april/oci-cli-create-heatwave-instance/#generate-command-json), we are first going to create a JSON file of all the possible options for creating a backup. The command to create this JSON file is:

```commandline
oci mysql backup create --generate-full-command-json-input > backup-create.json
```

The file `backup-create.json` will resemble:

```json
{
  "backupType": "FULL|INCREMENTAL",
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
  "maxWaitSeconds": 0,
  "retentionInDays": 0,
  "waitForState": [
    "ACCEPTED|IN_PROGRESS|FAILED|SUCCEEDED|CANCELING|CANCELED"
  ],
  "waitIntervalSeconds": 0
}
```

I will update this file only to contain the information we want to create a new backup.

```json
{
  "backupType": "INCREMENTAL",
  "dbSystemId": "ocid1.mysqldbsystem.oc1{more text}",
  "displayName": "OCI CLI Backup Demo",
  "retentionInDays": 42,
  "waitForState": ["SUCCEEDED"]
}

```

Here, we set `backupType` as `INCREMENTAL`, `displayName` as `OCI CLI Backup Demo`, and `retentionInDays` as `42`. The `dbSystemId` is the OCID of the MySQL HeatWave instance we wish to back up. Lastly, we tell the CLI to wait until the command state is `SUCCEEDED` before returning any information. The command may return as `SUCCEEDED` before the backup is completed.

### Run the Command

To create a new backup using this JSON config file, we run the command:

```commandline
oci mysql backup create --from-json file://{path to file}
```

When we run this command, we will see the following text in the command/terminal window:

```text
Action completed. Waiting until the work request has entered state: ('SUCCEEDED',)
```

Once the command has reached a state of `SUCCEEDED`, we will see more information about the backup:

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

## Restoring a Backup

To create a new MySQl HeatWave instance from this backup (or any other backup), we use the `oci mysql db-system clone` command.

### Generating Command JSON

Let's take another look at the commands available when creating a MySQL HeatWave instance by running the command:"

```commandline
oci mysql db-system clone --generate-full-command-json-input > backup-restore.json
```

The file `backup-restore.json` will look like the following:

```json
{
  "data": {
    "compartment-id": "ocid1.compartment.oc1.{more text}",
    "id": "ocid1.mysqlworkrequest.oc1.{more text}",
    "operation-type": "CREATE_REPLICA",
    "percent-complete": 100.0,
    "resources": [
      {
        "action-type": "CREATED",
        "entity-type": "mysqlreplica",
        "entity-uri": "/replicas/ocid1.mysqlreplica.oc1.{more text}",
        "identifier": "ocid1.mysqlreplica.oc1.{more text}"
      },
      {
        "action-type": "UPDATED",
        "entity-type": "mysqldbsystem",
        "entity-uri": "/dbSystems/ocid1.mysqldbsystem.oc1.{more text}",
        "identifier": "ocid1.mysqldbsystem.oc1.{more text}"
      }
    ],
    "status": "SUCCEEDED",
    "time-accepted": "2024-04-10T15:08:57.173000+00:00",
    "time-finished": "2024-04-10T15:27:37.825000+00:00",
    "time-started": "2024-04-10T15:09:05.201000+00:00"
  }
}
```

Once again, I will trim this down to include only the properties we will use. Here is what my new file looks like.

```json
{
  "availabilityDomain": "mMVr:US-ASHBURN-AD-2",
  "compartmentId": "ocid1.compartment.oc1.{more text}",
  "description": "A HeatWave instance created from a backup with the OCI CLI",
  "displayName": "OCI CLI Restore Backup Demo",
  "shapeName": "VM.Standard.E2.1",
  "sourceBackupId": "ocid1.mysqlbackup.oc1.{more text}",
  "subnetId": "ocid1.subnet.oc1.{more text}",
  "waitForState": ["SUCCEEDED"]
}
```

### Run the Command

To create a new backup using this JSON config file, we run the command:

```commandline
oci mysql db-system clone --from-json file://{path to file}
```

When we run this command, we will see the following text in the command/terminal window:

```text
Action completed. Waiting until the work request has entered state: ('SUCCEEDED',)
```

Once the command has reached a state of `SUCCEEDED`, we will see more information about the new MySQL HeatWave instance:

```json
{
  "data": {
    "compartment-id": "ocid1.compartment.oc1.{more text}",
    "id": "ocid1.mysqlworkrequest.oc1.{more text}",
    "operation-type": "CREATE_DBSYSTEM",
    "percent-complete": 100.0,
    "resources": [
      {
        "action-type": "CREATED",
        "entity-type": "mysqldbsystem",
        "entity-uri": "/dbSystems/ocid1.mysqldbsystem.oc1.{more text}",
        "identifier": "ocid1.mysqldbsystem.oc1.{more text}"
      },
      {
        "action-type": "RELATED",
        "entity-type": "mysqlbackup",
        "entity-uri": "/backups/ocid1.mysqlbackup.oc1.{more text}",
        "identifier": "ocid1.mysqlbackup.oc1.{more text}"
      }
    ],
    "status": "SUCCEEDED",
    "time-accepted": "2024-04-08T19:36:52.170000+00:00",
    "time-finished": "2024-04-08T19:53:49.413000+00:00",
    "time-started": "2024-04-08T19:37:18.101000+00:00"
  }
}
```

Remember, the command may return as a `SUCCEEDED` state before the new instance is available. Once the instance shows as `ACTIVE,` you can start using it.

## Wrap-up

The OCI CLI gives us tools to manage MySQL HeatWave instances, including manually creating a backup and restoring any backup to a new MySQL HeatWave instance. Additional commands allow us to update information about a backup and manage replicas and replication channels. We will cover some of this functionality in future posts.

Photo by <a href="https://unsplash.com/@kylebushnell?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Kyle Bushnell</a> on <a href="https://unsplash.com/photos/a-fire-truck-with-lights-on-driving-down-a-street-urPZrzHUFB0?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
