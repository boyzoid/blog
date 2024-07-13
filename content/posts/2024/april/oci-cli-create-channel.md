---
title: Creating a MySQL HeatWave Replication Channel with the OCI CLI
date: 2024-04-26T06:00:00
image: 2024/oci-cli-create-channel/header.jpg
tags: [ "MySQL", "MySQL-HeatWave", "OCI", "CLI" ]
related:
  - /posts/2024/april/oci-cli-create-heatwave-instance/
  - /posts/2024/april/oci-cli-heatwave-list-update/
  - /posts/2024/april/oci-cli-backup-create-restore/
  - /posts/2024/april/oci-cli-create-replica/
  - /posts/2024/april/oci-cli-create-configuration/
---

This is the sixth (and final) post in a series dedicated to showing how to use the [OCI CLI](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/cliconcepts.htm) to manage [MySQL HeatWave](https://www.oracle.com/mysql/) resources. This post will discuss how to create a MySQL HeatWave inbound replication channel.

## Prerequisites

Before you can run any of the examples below, you need to install the OCI CLI. If you do not have the CLI installed, follow the instructions [here](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) to install and configure the CLI.

## Creating Inbound Replication Channel

A description of an inbound replication channel can be found on the [Overview of Inbound Replication page](https://docs.oracle.com/en-us/iaas/mysql-database/doc/overview-inbound-replication.html):

> Inbound replication uses a replication channel configured in MySQL HeatWave Service to copy transactions from another location to a DB system. The channel connects the source (a MySQL instance or another DB system) to the replica (a DB system), and copies data from the source to the replica.

The `source` can be another HeatWave or external MySQL instance. For replication to work, the `replica` must be able to communicate with the `source`. Because the replication is asynchronous, the `replica` need not always be connected to the `source`. When a connection between the `source` and the `replica` is re-established, the replica will get any new updates since they were last connected.

### Setting up the Source

Our `source` needs some configuration to facilitate replication. For more details, check out this [link](https://docs.oracle.com/en-us/iaas/mysql-database/doc/source-configuration.html).

While it is not required, enabling GTID on the source is recommended, which makes setting up and maintaining the replica easier.

If GTID is not enabled on the `source`, run the following commands:

```mysql
SET @@GLOBAL.enforce_gtid_consistency = ON;
```

Next, check the value of `gtid_mode` by running:

```mysql
select @@GLOBAL.gtid_mode;
```

If any value other than `ON` is returned, we must run at least one more command.

If `gtid_mode` is `OFF`, run the command:

```mysql
SET @@GLOBAL.gtid_mode = OFF_PERMISSIVE;
```

If `gtid_mode` value is `OFF_PERMISSIVE` (or you just ran the command above), run the command:

```mysql
SET @@GLOBAL.gtid_mode = ON_PERMISSIVE;
```

If `gtid_mode` value is `ON_PERMISSIVE` (or you just ran the command above), run the command:

```mysql
SET @@GLOBAL.gtid_mode = ON;
```

With `gtid_mode` now set to `ON`, we are ready to set up the channel.

### Generating Command JSON

As we have done throughout this series, we will first generate a template JSON file to create our new configuration. The command to create this JSON file is:

```commandline
oci mysql channel create-from-mysql --generate-full-command-json-input > channel-create.json
```

When this command completes, the file named `channel-create.json` will resemble the following:

```json
{
  "compartmentId": "string",
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
  "isEnabled": true,
  "maxWaitSeconds": 0,
  "sourceAnonymousTransactionsHandling": [
    "This parameter should actually be a JSON object rather than an array - pick one of the following object variants to use",
    {
      "lastConfiguredLogFilename": "string",
      "lastConfiguredLogOffset": 0,
      "policy": "ASSIGN_MANUAL_UUID",
      "uuid": "string"
    },
    {
      "lastConfiguredLogFilename": "string",
      "lastConfiguredLogOffset": 0,
      "policy": "ASSIGN_TARGET_UUID"
    },
    {
      "policy": "ERROR_ON_ANONYMOUS"
    }
  ],
  "sourceHostname": "string",
  "sourcePassword": "string",
  "sourcePort": 0,
  "sourceSslCaCertificate": [
    "This parameter should actually be a JSON object rather than an array - pick one of the following object variants to use",
    {
      "certificateType": "PEM",
      "contents": "string"
    }
  ],
  "sourceSslMode": "string",
  "sourceUsername": "string",
  "targetApplierUsername": "string",
  "targetChannelName": "string",
  "targetDbSystemId": "string",
  "targetDelayInSeconds": 0,
  "targetFilters": [
    {
      "type": "string",
      "value": "string"
    },
    {
      "type": "string",
      "value": "string"
    }
  ],
  "targetTablesWithoutPrimaryKeyHandling": "string",
  "waitForState": [
    "ACCEPTED|IN_PROGRESS|FAILED|SUCCEEDED|CANCELING|CANCELED"
  ],
  "waitIntervalSeconds": 0
}
```

As with other demos in this series, I will trim down this JSON to include only the values we will use.

```json
{
  "compartmentId": "ocid1.compartment.oc1.{more text}",
  "description": "OCI CLI Inbound replication demo",
  "displayName": "OCI CLI Channel Demo",
  "isEnabled": true,
  "sourceHostname": "{host name or IP address}",
  "sourcePassword": "myPassword",
  "sourcePort": 3306,
  "sourceSslMode": "required",
  "sourceUsername": "myUser",
  "targetDbSystemId": "ocid1.mysqldbsystem.oc1.{more text}",
  "waitForState": ["SUCCEEDED"]
}
```

We provide the `compartmentId` for the compartment where the channel will be created. We give the channel a `description` and `displayName` and ensure `enabled` is set to `true`. We provide information for the source, such as `sourceHostname`, `sourceUsername`, `sourcePassword`, `sourcePort`, and `sourceSslMode`. We also specify the `targetDbSystemID`, the OCID for the MySQL HeatWave instance that will serve as the replica. Lastly, we tell the CLI to wait until the command reaches a state of `SUCCEEDED` before returning any information.

### Run the Command

To create a new replication channel using this JSON config file, we run the command:

```commandline
oci mysql channel create-from-mysql --from-json file://{path to file}
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
    "operation-type": "CREATE_CHANNEL",
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
        "entity-type": "mysqlchannel",
        "entity-uri": "/channels/ocid1.mysqlchannel.oc1.{more text}",
        "identifier": "ocid1.mysqlchannel.oc1.{more text}"
      }
    ],
    "status": "SUCCEEDED",
    "time-accepted": "2024-04-24T13:21:20.278000+00:00",
    "time-finished": "2024-04-24T13:23:03.226000+00:00",
    "time-started": "2024-04-24T13:21:39.569000+00:00"
  }
}
```

Remember that the command may be in a `SUCCEEDED` state before the replication channel is available. It is also possible that after the channel is created, it shows as `NEEDS ATTENTION` in the OCI web interface. If this is the case, please check out [this post](https://blogs.oracle.com/mysql/post/mysql-heatwave-database-service-inbound-replication-channel-troubleshooting-guide) for help with troubleshooting.

## Wrap-up

As we have seen in this series, the OCI CLI is a powerful tool we have at our disposal to manage MySQL HeatWave resources. We can create new HeatWave instances, back up and restore instances, and create read replicas, configurations, & inbound replication channels. While researching and writing this series, I discovered that the OCI CLI has become my preferred way to manage HeatWave resources. For me, using JSON to configure resources is faster and easier than using the Oracle Cloud web interface.

Image by <a href="https://pixabay.com/users/coolvid-shows-18646168/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=6212090">CoolVid-Shows</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=6212090">Pixabay</a>