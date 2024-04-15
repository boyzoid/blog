---
title: Creating a MySQL HeatWave Instance With the OCI CLI
date: 2024-04-08T06:00:00
image: /assets/images/2024/oci-cli-create-heatwave-instance/header.jpg
tags: [ "MySQL", "MySQL-HeatWave", "OCI", "CLI" ]
related:
  - /posts/2024/april/oci-cli-heatwave-list-update/
  - /posts/2024/april/oci-cli-backup-create-restore/
  - /posts/2024/april/oci-cli-create-replica/
---

In a [previous series](/posts/2024/february/typescript-oci-sdk-list/), we discussed how we can leverage the [TypeScript/JavaScript SDK](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/typescriptsdk.htm#SDK_for_TypeScript_and_JavaScript) for [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) (OCI) to manage MySQL HeatWave instances. This new series demonstrates how to use the [OCI CLI](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/cliconcepts.htm) to complete similar tasks. In this post, we will show how to create a MySQL HeatWave instance and retrieve reference information that can help create this new instance.

## Prerequisites

Before you can run any of the examples below, you need to install the OCI CLI. If you do not have the CLI installed, follow the instructions [here](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) to install and configure the CLI.

***Note:** Many examples require a parameter named `--compartment-id`. Because I am part of a tenancy shared by many colleagues, I must ensure I only ever touch resources in my 'sandbox'. To make this easier, I followed the instructions [here](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliconfigure.htm#Configuring_the_CLI) to set up default values for the CLI - including the `compartment-id` for my 'sandbox'.*

## Listing Reference Data

In my previous series, I put this part at the end, but I think it is better to talk about the 'reference data' in the beginning. When we manage MySQL HeatWave instances, we need to provide specific values for some parameters—three that come to mind are `configuration`, `shape`, and `version`. When we provide these values, they need to be valid options. This section will show you how to get a list of all the valid options for each.

### Configurations

To make provisioning MySQL HeatWave instances easier and more consistent, we can use a `configuration` when creating an instance. The list of configurations we retrieve contains default and custom configurations we may create. The list of items that is returned is sorted by:

* Shape name - ascending
* `DEFAULT` before `CUSTOM`
* Display name - ascending

To see the complete list of configurations, use the following command.

```commandline
oci mysql configuration list --all --compartment-id {compartment Id}
```

The result will look similar to the text below.

```json
{
  "data": [
    {
      "compartment-id": null,
      "defined-tags": null,
      "description": "Default standalone configuration for the BM.Standard.E2.64 MySQL shape",
      "display-name": "BM.Standard.E2.64.Standalone",
      "freeform-tags": null,
      "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaah6o6qu3gdbxnqg6aw56amnosmnaycusttaa7abyq2tdgpgubvsgh",
      "lifecycle-state": "ACTIVE",
      "shape-name": "BM.Standard.E2.64",
      "time-created": "2018-09-21T10:00:00+00:00",
      "time-updated": null,
      "type": "DEFAULT"
    },
    {
      "compartment-id": null,
      "defined-tags": null,
      "description": "Default standalone configuration for the VM.Standard.E2.1 MySQL shape",
      "display-name": "VM.Standard.E2.1.Standalone",
      "freeform-tags": null,
      "id": "ocid1.mysqlconfiguration.oc1..aaaaaaaah6o6qu3gdbxnqg6aw56amnosmnaycusttaa7abyq2tdgpgubvsgi",
      "lifecycle-state": "ACTIVE",
      "shape-name": "VM.Standard.E2.1",
      "time-created": "2018-09-21T10:00:00+00:00",
      "time-updated": null,
      "type": "DEFAULT"
    }
    ...
  ]
}
```
If we use a configuration when creating a new instance, we would use the value of the `id` property.

Check out the [configuration list documentation](https://docs.oracle.com/en-us/iaas/tools/oci-cli/3.38.0/oci_cli_docs/cmdref/mysql/configuration/list.html) to learn about other options.

### Shapes

Every MySQL HeatWave instance must have a defined `shape. ' This value can be defined in a configuration like we see above or provided as a separate parameter when creating a MySQL HeatWave instance. To see the list of valid shapes, we would use the command:

```commandline
oci mysql shape list --compartment-id {compartment Id}
```

The output from this command should resemble this text:

```json
{
  "data": [
    {
      "cpu-core-count": 1,
      "is-supported-for": [
        "DBSYSTEM"
      ],
      "memory-size-in-gbs": 8,
      "name": "VM.Standard.E2.1"
    },
    {
      "cpu-core-count": 2,
      "is-supported-for": [
        "DBSYSTEM"
      ],
      "memory-size-in-gbs": 16,
      "name": "VM.Standard.E2.2"
    },
    ...
  ]
}
```
When we specify a `shape` when creating a new MySQL HeatWave instance, we use the value of the `name` property.

Check out the [shape list documentation](https://docs.oracle.com/en-us/iaas/tools/oci-cli/3.38.0/oci_cli_docs/cmdref/mysql/shape/list.html) to learn about other options.

### Versions

When creating a new MySQL HeatWave instance, the latest version available will be used if a version is not specified. To retrieve a list of valid versions, use the following command:

```commandline
oci mysql version list --compartment-id {compartment Id}
```

The output from this command will resemble:

```json
{
  "data": [
    {
      "version-family": "8.0",
      "versions": [
        {
          "description": "8.0.32",
          "version": "8.0.32"
        },
        {
          "description": "8.0.33",
          "version": "8.0.33"
        },
        {
          "description": "8.0.34",
          "version": "8.0.34"
        },
        {
          "description": "8.0.35",
          "version": "8.0.35"
        },
        {
          "description": "8.0.36",
          "version": "8.0.36"
        }
      ]
    },
    {
      "version-family": "8 - Innovation",
      "versions": [
        {
          "description": "8.2.0",
          "version": "8.2.0"
        },
        {
          "description": "8.2.0 HeatWave Preview",
          "version": "8.2.0-HeatWave-Preview"
        },
        {
          "description": "8.3.0",
          "version": "8.3.0"
        },
        {
          "description": "8.3.0 HeatWave Preview",
          "version": "8.3.0-HeatWave-Preview"
        },
        {
          "description": "8.4.0 HeatWave Preview",
          "version": "8.4.0-HeatWave-Preview"
        }
      ]
    }
  ]
}
```

Note that there are two different version families - one for `8.0` and one for `8 - Innovation`. When specifying the version when creating a new instance, we would use the value of the `version` property.

Check out the [version list documentation](https://docs.oracle.com/en-us/iaas/tools/oci-cli/3.38.0/oci_cli_docs/cmdref/mysql/version/list.html) to learn about other options.

### Subnets

Another piece of information we need when creating a MySQL HeatWave instance is the subnet where it will be created. To see the list of available subnets in your compartment, use the following command:

```commandline
oci network subnet list --all --compartment-id {compartment Id}
```

The result will resemble the text below.

```json
{
  "data": [
    {
      "availability-domain": null,
      "cidr-block": "10.0.0.0/24",
      "compartment-id": "ocid1.compartment.oc1.{more text}",
      "defined-tags": {
        "Oracle-Recommended-Tags": {
          "ResourceOwner": "default/sstroz"
        },
        "Oracle-Tags": {
          "CreatedBy": "default/sstroz",
          "CreatedOn": "2023-10-05T16:32:06.583Z"
        }
      },
      "dhcp-options-id": "ocid1.dhcpoptions.oc1.{more text}",
      "display-name": "public subnet-MySQL-CLI-Demo",
      "dns-label": "sub10051632010",
      "freeform-tags": {
        "VCN": "VCN-2023-10-05T16:31:34"
      },
      "id": "ocid1.subnet.oc1.{more text}",
      "ipv6-cidr-block": null,
      "ipv6-cidr-blocks": null,
      "ipv6-virtual-router-ip": null,
      "lifecycle-state": "AVAILABLE",
      "prohibit-internet-ingress": false,
      "prohibit-public-ip-on-vnic": false,
      "route-table-id": "ocid1.routetable.oc1.{more text}",
      "security-list-ids": [
        "ocid1.securitylist.oc1.{more text}"
      ],
      "subnet-domain-name": "sub10051632010.mysqlopenvpndem.oraclevcn.com",
      "time-created": "2023-10-05T16:32:07.196000+00:00",
      "vcn-id": "ocid1.vcn.oc1.{more text}",
      "virtual-router-ip": "10.0.0.1",
      "virtual-router-mac": "00:00:17:28:44:8E"
    },
    {
      "availability-domain": null,
      "cidr-block": "10.0.1.0/24",
      "compartment-id": "ocid1.compartment.oc1.{more text}",
      "defined-tags": {
        "Oracle-Recommended-Tags": {
          "ResourceOwner": "default/sstroz"
        },
        "Oracle-Tags": {
          "CreatedBy": "default/sstroz",
          "CreatedOn": "2023-10-05T16:32:06.616Z"
        }
      },
      "dhcp-options-id": "ocid1.dhcpoptions.oc1.{more text}",
      "display-name": "private subnet-MySQL-CLI-Demo",
      "dns-label": "sub10051632011",
      "freeform-tags": {
        "VCN": "VCN-2023-10-05T16:31:34"
      },
      "id": "ocid1.subnet.oc1.{more text}",
      "ipv6-cidr-block": null,
      "ipv6-cidr-blocks": null,
      "ipv6-virtual-router-ip": null,
      "lifecycle-state": "AVAILABLE",
      "prohibit-internet-ingress": true,
      "prohibit-public-ip-on-vnic": true,
      "route-table-id": "ocid1.routetable.oc1.iad.{more text}",
      "security-list-ids": [
        "ocid1.securitylist.oc1.{more text}"
      ],
      "subnet-domain-name": "sub10051632011.mysqlopenvpndem.oraclevcn.com",
      "time-created": "2023-10-05T16:32:06.669000+00:00",
      "vcn-id": "ocid1.vcn.oc1.{more text}",
      "virtual-router-ip": "10.0.1.1",
      "virtual-router-mac": "00:00:17:28:44:8E"
    }
  ]
}
```

When creating a MySQL HeatWave instance, we use the value of the `id` property as the `subnet-id`.

Check out the [subnet list documentation](https://docs.oracle.com/en-us/iaas/tools/oci-cli/3.38.0/oci_cli_docs/cmdref/network/subnet/list.html) to learn about other options.

### Availability Domains

One last piece of information we need is the availability domain where the MySQol HetWave instance will be deployed. We can get a list of availability domains by running the command:

```commandline
oci iam availability-domain list
```

The list will resemble the following:

```json
{
  "data": [
    {
      "compartment-id": "ocid1.compartment.oci.{more text}",
      "id": "ocid1.availabilitydomain.oc1..aaaaaaaaztunlny6ae4yw2vghp5go2zceaonwp6wiioe3tnh2vlaxjjl2n3a",
      "name": "mMVr:US-ASHBURN-AD-1"
    },
    {
      "compartment-id": "ocid1.compartment.oci.{more text}",
      "id": "ocid1.availabilitydomain.oc1..aaaaaaaauvt2n7pijol7uqgdnnsoojcukrijtmcltvfwxazmitk235wyohta",
      "name": "mMVr:US-ASHBURN-AD-2"
    },
    {
      "compartment-id": "ocid1.compartment.oci.{more text}",
      "id": "ocid1.availabilitydomain.oc1..aaaaaaaatrwxaogr7dl4yschqtrmqrdv6uzis3mgbnomiagqrfhcb7mxsfdq",
      "name": "mMVr:US-ASHBURN-AD-3"
    }
  ]
}
```

When specifying an availability domain when creating a new MySQL HeatWave instance, we would use the value of the `name` property.

Check out the [availability-domain list documentation](https://docs.oracle.com/en-us/iaas/tools/oci-cli/3.38.0/oci_cli_docs/cmdref/iam/availability-domain/list.html) to learn about other options.


## Creating the Instance

There are quite a few options when creating a new MySQL HeatWave instance. If you don't believe me, go check out the [documentation](https://docs.oracle.com/en-us/iaas/tools/oci-cli/3.38.0/oci_cli_docs/cmdref/mysql/db-system/create.html) for creating a new MySQL `db-system`.

I am a poor typist, and when a command has many parameters, and some of them have very long values, I often need help identifying typos. There is also an issue with running the command more than once. Yes, you can cycle through the command history, but this could also be difficult if there were typos in previous attempts to run the command.

There is a feature of the OCI CLI that was explicitly designed for people like me. Many commands have an option named `--from-json` where you can specify a JSON file containing the instance's configuration information. Another nifty feature is generating a sample JSON file for commands with the `--from-json` option.

### Generate Command JSON

To generate a JSON file that contains all the possible options we can use when creating a MySQL HeatWave instance, we use the following command:

```commandline
oci mysql db-system create --generate-full-command-json-input  > heatwave-create.json 
```

This command will create a file named `heatwave-create.json` in the directory where we executed the command. The content of the file will resemble:

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
  "compartmentId": "string",
  "configurationId": "string",
  "crashRecovery": "ENABLED|DISABLED",
  "dataStorageSizeInGbs": 0,
  "databaseManagement": "ENABLED|DISABLED",
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
  "freeformTags": {
    "tagKey1": "tagValue1",
    "tagKey2": "tagValue2"
  },
  "hostnameLabel": "string",
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
  "source": [
    "This parameter should actually be a JSON object rather than an array - pick one of the following object variants to use",
    {
      "backupId": "string",
      "sourceType": "BACKUP"
    },
    {
      "sourceType": "NONE"
    },
    {
      "dbSystemId": "string",
      "recoveryPoint": "2017-01-01T00:00:00+00:00",
      "sourceType": "PITR"
    },
    {
      "sourceType": "IMPORTURL",
      "sourceUrl": "string"
    }
  ],
  "subnetId": "string",
  "waitForState": [
    "ACCEPTED|IN_PROGRESS|FAILED|SUCCEEDED|CANCELING|CANCELED"
  ],
  "waitIntervalSeconds": 0
}
```

### Set Our Option Values

I will trim this file down to just the required fields and some other helpful ones and provide values for them. My file looks like this:

```json
{
  "adminPassword": "MySQL8IsGre@t!!",
  "adminUsername": "admin",
  "availabilityDomain": "mMVr:US-ASHBURN-AD-1",
  "backupPolicy": {
    "isEnabled": true,
    "pitrPolicy": {
      "isEnabled": true
    },
    "retentionInDays": 14
  },
  "compartmentId": "ocid1.compartment.oc1.{more text}",
  "crashRecovery": "ENABLED",
  "dataStorageSizeInGbs": 50,
  "databaseManagement": "ENABLED",
  "description": "A HeatWave instance created with the OCI CLI",
  "displayName": "OCI CLI Demo",
  "isHighlyAvailable": false,
  "mysqlVersion": "8.3.0",
  "shapeName": "VM.Standard.E2.1",
  "subnetId": "ocid1.subnet.oc1.{more text}",
  "waitForState": ["SUCCEEDED"]
}
```

Let's look at what options we are setting:

* The `adminPassword` and `adminUsername` are the password and username for a MySQL admin (not `root`) user when the instance is created.
* We specify the `availabilityDomain`.
* We enable the `backupPolicy` and also turn on 'point-in-time' recovery (`pitrPolicy`) and set the `retentionPeriod` for the backups to 14 days.
* We set the `compartmentId`.
* We enable `crashRecovery`.
* We set the `dataStorageSizeInGbs` to 50 (the lowest possible value for a MySQL HeatWave instance).
* We enable `databaseManagement`.
* We set the instance's `description` and `displayName`.
* We set `isHighlyAvailable` to `false`.
* We set the `mysqlVersion` to `8.3.0`.
* We set the `shapeName` to `VM.Standard.E2.1`
* We specify the `subnetId` where the instance will reside.
* We set the `waitForState` option to `"SUCCEEDED"`.
  * This will cause the command to wait until it reaches a state of `SUCCEEDED`.

*If any values specified in this JSON file are also specified when the `create` command is executed, the values in the command will override the values in the JSOn file.*

### Running the Command

Now that our options are configured in our JSON file, let's create a new MySQL HeatWave instance. We use the following command to create a new instance using the JSON file we generated (and modified) earlier.

```commandline
oci mysql db-system create --from-json file://{path to JSON file}
```
When we run this command, we should see the following text letting us know that the command has entered a state of `SUCCEEDED`.

```text
Action completed. Waiting until the work request has entered state: ('SUCCEEDED',)
```

While waiting for the instance to be created, we can log in to Oracle Cloud and check the progress. You can see our new instance is being created.

![Oracle Cloud MySQl Database System Progress](/assets/images/2024/oci-cli-create-heatwave-instance/img_01.png)

The command may return as `SUCCEEDED` before the instance is available. When the command is successful, we will see the output in the terminal similar to the text below:

```json
{
  "data": {
    "compartment-id": "ocid1.compartment.oc1.{more text}",
    "id": "ocid1.mysqlworkrequest.oc1.{more text}",
    "operation-type": "CREATE_DBSYSTEM",
    "percent-complete": 100.0,
    "resources": [
      {
        "action-type": "IN_PROGRESS",
        "entity-type": "mysqldbsystem",
        "entity-uri": "/dbSystems/ocid1.mysqldbsystem.oc1.{more text",
        "identifier": "ocid1.mysqldbsystem.oc1.{more text}"
      }
    ],
    "status": "SUCCEEDED",
    "time-accepted": "2024-04-03T14:38:31.457000+00:00",
    "time-finished": "2024-04-03T14:54:16.559000+00:00",
    "time-started": "2024-04-03T14:38:56.940000+00:00"
  }
}
```

You will see the following when the instance is fully available in Oracle Cloud.

![Oracle Cloud MySQl Database System Active](/assets/images/2024/oci-cli-create-heatwave-instance/img_02.png)

## Wrap-up

These few examples show that the OCI CLI offers extensive functionality for managing Oracle Cloud resources, including MySQL HeatWave instances. In future posts, I will explore the functionality for managing MySQL HeatWave resources.

Photo by <a href="https://unsplash.com/@jakewalker?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Jake Walker</a> on <a href="https://unsplash.com/photos/black-flat-screen-computer-monitor-MPKQiDpMyqU?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
