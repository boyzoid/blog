---
title: Listing and Updating MySQL HeatWave Instances with the OCI CLI
date: 2024-04-10T06:00:00
image: /assets/images/2024/oci-cli-heatwave-list-update/header.jpg
tags: [ "MySQL", "MySQL-HeatWave", "OCI", "CLI" ]
related:
  - /posts/2024/april/oci-cli-create-heatwave-instance/
  - /posts/2024/april/oci-cli-backup-create-restore/
  - /posts/2024/april/oci-cli-create-replica/
  - /posts/2024/april/oci-cli-create-configuration/
  - /posts/2024/april/oci-cli-create-channel/
---

This is the second post in a series dedicated to showing how to use the [OCI CLI](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/cliconcepts.htm) to manage [MySQL HeatWave](https://www.oracle.com/mysql/) resources. In this post we will discuss how to list MySQL HeatWaves instances in a compartment and how to update some of the information pertaining to the instance.

## Prerequisites

Before you can run any of the examples below, you need to install the OCI CLI. If you do not have the CLI installed, follow the instructions [here](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) to install and configure the CLI.

***Note:** Many examples require a parameter named `--compartment-id`. Because I am part of a tenancy shared by many colleagues, I must ensure I only ever touch resources in my 'sandbox'. To make this easier, I followed the instructions [here](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliconfigure.htm#Configuring_the_CLI) to set up default values for the CLI - including the `compartment-id` for my 'sandbox'.*

## Listing HeatWave Instances

The command to list MySQL HeatWave instances follows similar syntax to the examples we discussed in a [previous post](/posts/2024/april/oci-cli-create-heatwave-instance/). In this example, we are going to list the instances that are in an `ACTIVE` state (mostly because I have a LOT of instances in this compartment that were kind of 'throw away' and they will all be returned if I don;t filter the list). The command to run is:"

```commandline
oci mysql db-system list --compartment-id {compartment Id} --lifecycle-state Active
```

Here is the output when I run this command:

```json
{
  "data": [
    {
      "availability-domain": "mMVr:US-ASHBURN-AD-1",
      "backup-policy": {
        "defined-tags": null,
        "freeform-tags": null,
        "is-enabled": true,
        "pitr-policy": {
          "is-enabled": true
        },
        "retention-in-days": 14,
        "window-start-time": "11:02"
      },
      "compartment-id": "ocid1.compartment.oc1.{more text}",
      "crash-recovery": "ENABLED",
      "current-placement": {
        "availability-domain": "mMVr:US-ASHBURN-AD-1",
        "fault-domain": "FAULT-DOMAIN-1"
      },
      "database-management": "ENABLED",
      "defined-tags": {
        "Oracle-Recommended-Tags": {
          "ResourceOwner": "default/sstroz"
        },
        "Oracle-Tags": {
          "CreatedBy": "default/sstroz",
          "CreatedOn": "2024-04-03T14:38:30.692Z"
        }
      },
      "deletion-policy": {
        "automatic-backup-retention": "DELETE",
        "final-backup": "SKIP_FINAL_BACKUP",
        "is-delete-protected": false
      },
      "description": "A HeatWave instance created with the OCI CLI",
      "display-name": "OCI CLI Demo",
      "endpoints": [
        {
          "hostname": null,
          "ip-address": "10.0.1.170",
          "modes": [
            "READ",
            "WRITE"
          ],
          "port": 3306,
          "port-x": 33060,
          "resource-id": "ocid1.mysqlinstance.oc1.{more text}",
          "resource-type": "DBSYSTEM",
          "status": "ACTIVE",
          "status-details": null
        }
      ],
      "fault-domain": "FAULT-DOMAIN-1",
      "freeform-tags": {},
      "heat-wave-cluster": null,
      "id": "ocid1.mysqldbsystem.oc1.{more text}",
      "is-heat-wave-cluster-attached": false,
      "is-highly-available": false,
      "lifecycle-state": "ACTIVE",
      "mysql-version": "8.3.0",
      "shape-name": "VM.Standard.E2.1",
      "time-created": "2024-04-03T14:38:31.457000+00:00",
      "time-updated": "2024-04-04T17:54:55.978000+00:00"
    }
  ]
}
```

You can see from the `name` and `description` properties, this is the instance we created in [Part 1](/posts/2024/april/oci-cli-create-heatwave-instance/) of this series.

Check out the [db-system list documentation](https://docs.oracle.com/en-us/iaas/tools/oci-cli/3.38.0/oci_cli_docs/cmdref/mysql/db-system/list.html) to learn about other options.

## Getting More Instance Details

When we retrieve a list of MySQL HeatWave instances, we can see a lot of information about the instance, but this is not all the information available to us. Run the following command using  the `id` property of a MySQL Hw=eatWave instance to see more detailed information about the instance.

```commandline
oci mysql db-system get --db-system-id {Db system Id}
```

When I run this command with the `id` for the instance above, this is the information I receive.

```json
{
  "data": {
    "availability-domain": "mMVr:US-ASHBURN-AD-1",
    "backup-policy": {
      "defined-tags": null,
      "freeform-tags": null,
      "is-enabled": true,
      "pitr-policy": {
        "is-enabled": true
      },
      "retention-in-days": 14,
      "window-start-time": "11:02"
    },
    "channels": [],
    "compartment-id": "ocid1.compartment.oc1.{more text}",
    "configuration-id": "ocid1.mysqlconfiguration.oc1.{more text}",
    "crash-recovery": "ENABLED",
    "current-placement": {
      "availability-domain": "mMVr:US-ASHBURN-AD-1",
      "fault-domain": "FAULT-DOMAIN-1"
    },
    "data-storage-size-in-gbs": 50,
    "database-management": "ENABLED",
    "defined-tags": {
      "Oracle-Recommended-Tags": {
        "ResourceOwner": "default/sstroz"
      },
      "Oracle-Tags": {
        "CreatedBy": "default/sstroz",
        "CreatedOn": "2024-04-03T14:38:30.692Z"
      }
    },
    "deletion-policy": {
      "automatic-backup-retention": "DELETE",
      "final-backup": "SKIP_FINAL_BACKUP",
      "is-delete-protected": false
    },
    "description": "A HeatWave instance created with the OCI CLI",
    "display-name": "OCI CLI Demo",
    "endpoints": [
      {
        "hostname": null,
        "ip-address": "10.0.1.170",
        "modes": [
          "READ",
          "WRITE"
        ],
        "port": 3306,
        "port-x": 33060,
        "resource-id": "ocid1.mysqlinstance.oc1.{more text}",
        "resource-type": "DBSYSTEM",
        "status": "ACTIVE",
        "status-details": null
      }
    ],
    "fault-domain": "FAULT-DOMAIN-1",
    "freeform-tags": {},
    "heat-wave-cluster": null,
    "hostname-label": null,
    "id": "ocid1.mysqldbsystem.oc1.{more text}",
    "ip-address": "10.0.1.170",
    "is-heat-wave-cluster-attached": false,
    "is-highly-available": false,
    "lifecycle-details": "",
    "lifecycle-state": "ACTIVE",
    "maintenance": {
      "window-start-time": "TUESDAY 11:06"
    },
    "mysql-version": "8.3.0",
    "point-in-time-recovery-details": {
      "time-earliest-recovery-point": "2024-04-03T14:51:18+00:00",
      "time-latest-recovery-point": "2024-04-04T18:41:42+00:00"
    },
    "port": 3306,
    "port-x": 33060,
    "secure-connections": {
      "certificate-generation-type": "SYSTEM",
      "certificate-id": null
    },
    "shape-name": "VM.Standard.E2.1",
    "source": null,
    "subnet-id": "ocid1.subnet.oc1.{more text}",
    "time-created": "2024-04-03T14:38:31.457000+00:00",
    "time-updated": "2024-04-04T17:54:55.978000+00:00"
  },
  "etag": "9c3f8f4031{more text}"
}
```

Some of the information we can now see includes `data-storage-size-in-gbs`, `maintenance`, and `point-in-time-recovery-details`. We also see the `port` and `portx` are also available off the root of the JSON object.

## Updating Instance Details

I am going to use the same process to update this instance as I did to create it. I am first going to run a command the will generate a JSON template for all the properties we can update and export it to a JSON file.

```commandline
oci mysql db-system update --generate-full-command-json-input > update-heatwave.json
```

When we look at the content of `update-heatwave.json` we will see the following:

```json
{
  "adminPassword": "string",
  "adminUsername": "string",
  "availabilityDomain": "string",
  "backupPolicy": {
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
    "freeformTags": {
      "tagKey1": "tagValue1",
      "tagKey2": "tagValue2"
    },
    "isEnabled": true,
    "pitrPolicy": {
      "isEnabled": true
    },
    "retentionInDays": 0,
    "windowStartTime": "string"
  },
  "configurationId": "string",
  "crashRecovery": "ENABLED|DISABLED",
  "dataStorageSizeInGbs": 0,
  "databaseManagement": "ENABLED|DISABLED",
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
  "deletionPolicy": {
    "automaticBackupRetention": "string",
    "finalBackup": "string",
    "isDeleteProtected": true
  },
  "description": "string",
  "displayName": "string",
  "faultDomain": "string",
  "force": true,
  "freeformTags": {
    "tagKey1": "tagValue1",
    "tagKey2": "tagValue2"
  },
  "hostnameLabel": "string",
  "ifMatch": "string",
  "ipAddress": "string",
  "isHighlyAvailable": true,
  "maintenance": {
    "windowStartTime": "string"
  },
  "maxWaitSeconds": 0,
  "mysqlVersion": "string",
  "port": 0,
  "portX": 0,
  "secureConnections": {
    "certificateGenerationType": "string",
    "certificateId": "string"
  },
  "shapeName": "string",
  "subnetId": "string",
  "waitForState": [
    "ACCEPTED|IN_PROGRESS|FAILED|SUCCEEDED|CANCELING|CANCELED"
  ],
  "waitIntervalSeconds": 0
}
```

I am going to modify this file so that we are only updating a single property. There are some properties that musty be updated separate form other properties - `backupPolicy.retentionInDays` is one of those properties.

```json
{
  "backupPolicy": {
    "retentionInDays": 20
  },
  "dbSystemId": "ocid1.mysqldbsystem.oc1.{more text}"
}
```

We are going to update the `backupPolicy.retentionInDays` to 20 and pass in the `dbSystemId` for the instance we wnt to update.

To make these changes, we run the command:

```commandline
oci mysql db-system update --from-json file://{path to JSON file}
```

You will be prompted to confirm any changes to `backup-policy`, `maintenance`, `freeform-tags`, `defined-tags`, `deletion-policy`, or `secure-connections`. 

```text
WARNING: Updates to backup-policy and maintenance and freeform-tags and defined-tags and deletion-policy and secure-connections will replace any existing values. Are you sure you want to continue? [y/N]: 
```

Type `y` and then press `enter` to process the udpates.

Now, let's check that the updates were applied and get the MySQL HeatWave instance details one more time.

```commandline
oci mysql db-system get --db-system-id {Db system Id}
```

The details now resemble:

```json
{
  "data": {
    "availability-domain": "mMVr:US-ASHBURN-AD-1",
    "backup-policy": {
      "defined-tags": null,
      "freeform-tags": null,
      "is-enabled": true,
      "pitr-policy": {
        "is-enabled": true
      },
      "retention-in-days": 20,
      "window-start-time": "11:02"
    },
    ...
  }
}
```

The `backupPolicy.retentionInDays` property is now `20`. Some changes, like updating the `backupPolicy.retentionInDays` property will take place immediately, but others, such as `shape` will be asynchronous because a new system needs to be provisioned.

Check out the [db-system udpate documentation](https://docs.oracle.com/en-us/iaas/tools/oci-cli/3.38.0/oci_cli_docs/cmdref/mysql/db-system/update.html) to learn about other options.

## Wrap-up

The OCI CLI allows us to not only list MySQL HeatWave instances, but also to retrieve more detailed information about a specific instance and update properties on that instance. By using the `--generate-full-command-json-input` option of the `update` command, we can create a JSON file that shows what properties can be updated and the data structure and data types that are expected. In a future post, we will demonstrate how to create a backup and how to restore that backup to a new MySQL HeatWave instance.

Photo by <a href="https://unsplash.com/@glenncarstenspeters?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Glenn Carstens-Peters</a> on <a href="https://unsplash.com/photos/person-writing-bucket-list-on-book-RLw-UC03Gwc?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  