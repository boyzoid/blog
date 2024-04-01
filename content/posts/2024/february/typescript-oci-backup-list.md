---
title: Using the Oracle Cloud TypeScript SDK Part 4 - Listing MySQL HeatWave Backups
date: 2024-02-26T06:00:00
image: /assets/images/2024/typescript-oci-sdk-backup-list/header.jpg
tags: [ "MySQL", "MySQL-HeatWave", "OCI", "SDK" ]
related:
  - /posts/2024/february/typescript-oci-sdk-list/
  - /posts/2024/february/typescript-oci-sdk-manage-instance/
  - /posts/2024/february/typescript-oci-sdk-waiters/
  - /posts/2024/march/typescript-oci-backup-create/
  - /posts/2024/march/typescript-oci-backup-update/

---
This post is the fourth in a series that will demonstrate how to view and manage MySQL HeatWave instances in [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) (OCI). Oracle offers several [SDKs](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdks.htm) that can be used to view and manage resources in OCI. In this post, we will discuss how to leverage the [TypeScript/JavaScript SDK](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/typescriptsdk.htm#SDK_for_TypeScript_and_JavaScript) to retrieve a list of [MySQL HeatWave](https://www.oracle.com/mysql/) backups for a given compartment and how to narrow that list down to show only backups for a specific instance.

## Prerequisites

To use the OCI SDKs, you need credentials for an OCI account with the proper permissions. While it is not necessary to install the OCI CLI, following the instructions at [this post](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) will create the same files we will need to use the SDK...with the added advantage of installing the CLI.

To follow along with this demo, you should also have [Node.js](https://nodejs.org) installed. I am using version 21.5.0.

## Creating the Node App

Before we dive into accessing the SDK, there is some setup and config we need to take care of.

### Initialize the Node App

Create a directory to hold your code, open a terminal/command window, and `cd` into that new folder. To initialize a Node app, run the following command:

```shell
npm init
```

You will be prompted for information about the project. For this demo, feel free to accept all the default values.

When the `init` script completes, you should see a file named `package.json` in your directory. Here is what mine looks like.

```json
{
  "name": "oci-demo",
  "version": "0.0.1",
  "description": "A demo of using the OIC SDK for TypeScript",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Scott Stroz",
  "license": "MIT"
}
```

### Install the Necessary Modules

Next, we install the Node modules we will need. You can install these modules using the command:

```shell
npm install oci-mysql bunyan dotenv
```

This command will install the `oci-mysql`, `dotenv`, and `express` modules.

The `oci-mysql` module contains the parts of the SDK that are specific to MySQL HeatWave instances. This module includes dependencies to other modules such as `oci-common`.

The `bunyan` module is a JSON logging library for Node.js. I had to add this because I was getting errors while trying to run the code for this demo. I guess that there is a missing dependency somewhere. Installing `bunyan` separately addressed my issues.

The `dotenv` module allows us to use environment variables for information we will use in our demo.

### Set up `.env`

In this example, we only need one environment variable, the OCID of the compartment we will use. Create a file named `.env` and then add a variable named `COMPARTMENT_ID` and give it the value of the compartment you want to use. It should look like the text below.

```dotenv
COMPARTMENT_ID=ocid1.compartment.oc1..a{more text here}
```

## Using the SDK

Rather than break down each bit of code a little at a time, here is all the code you will need for this demo. I will break down the new pieces below.

### The Code

Create a file named `index.mjs` and paste in the following code.

```javascript
import common from 'oci-common'
import * as mysql from 'oci-mysql'
import * as dotenv from 'dotenv'

dotenv.config()

const main = async () =>{
    const provider = new common.ConfigFileAuthenticationDetailsProvider()
    const backupClient = new mysql.DbBackupsClient({ authenticationDetailsProvider: provider })

    const backupListConfig = {
        compartmentId: process.env.COMPARTMENT_ID,
        limit: 100,
        sortBy: mysql.requests.ListBackupsRequest.SortBy.DisplayName,
        sortOrder: mysql.requests.ListBackupsRequest.SortOrder.Asc,
        lifecycleState: mysql.models.Backup.LifecycleState.Active,
    }

    const result = await backupClient.listBackups(backupListConfig)

    console.log(result)
}

main()
```

### The Breakdown

At the top of the file, we import the necessary modules, `oci-common`, `oci-mysl`, and `dotenv`. We then call `dotenv.config()` to grab the environment variables.

Next, we create a function named `main()`, and inside that function, we create an instance of `ConfigFileAuthenticationDetailsProvider()` called `provider`. This provider reads the OCI config file created when we installed the OCI CLI. By default, the provider uses the config file located at `~/.oci/config` and the `DEFAULT` config block if more than one block is specified.

```javascript
const provider = new common.ConfigFileAuthenticationDetailsProvider()
```

Once we have an authentication provider, we need to create an instance of `mysql.DbBackupsClient()`, named `backupClient`, and pass this provider as part of a config block.

```javascript
const backupClient = new mysql.DbBackupsClient({ authenticationDetailsProvider: provider })
```

Now that we have our `backupClient`, we must build the config block to retrieve the list of backups for the compartment.

```javascript
const backupListConfig = {
    compartmentId: process.env.COMPARTMENT_ID,
    limit: 100,
    sortBy: mysql.requests.ListBackupsRequest.SortBy.DisplayName,
    sortOrder: mysql.requests.ListBackupsRequest.SortOrder.Asc,
    lifecycleState: mysql.models.Backup.LifecycleState.Active,
}
```

In this config block, we set the `compartmentId` from our environment variable, limit the results to 100 items, sort by the backup's display name in ascending order, and only return backups with a lifecycle state of `ACTIVE`.

We retrieve the list of backups by calling `backupClient.listBackups()`, passing in `backupListConfig`, and logging the results to the console.

```javascript
const result = await backupClient.listBackups(backupListConfig)

console.log(result)
```

## Running the Code

To run the code, open a terminal/command window in the project folder and run the command:

```shell
node index.mjs
```

In the console, you will see the output of our call to `listBackups()`. Mine resembles the output below.

```javascript
{
  items: [
      {
          id: 'ocid1.mysqlbackup.oc1.morte-text',
          displayName: 'mysqlbackup20240216140030',
          description: null,
          timeCreated: '2024-02-16T14:00:30.028Z',
          lifecycleState: 'ACTIVE',
          backupType: 'INCREMENTAL',
          creationType: 'AUTOMATIC',
          dbSystemId: 'ocid1.mysqldbsystem.oc1.more-text',
          compartmentId: 'ocid1.compartment.oc1..more-text',
          sizeInMBs: 27,
          dataStorageSizeInGBs: 50,
          backupSizeInGBs: 1,
          retentionDays: 7,
          retentionInDays: 7,
          mysqlVersion: '8.3.0',
          shapeName: 'MySQL.VM.Standard.E4.1.8GB',
          freeformTags: [Object],
          definedTags: [Object],
          immediateSourceBackupId: null,
          originalSourceBackupId: null,
          timeCopyCreated: null,
          dbSystemSnapshotSummary: [Object]
      },

  ],
  opcRequestId: 'B4474140CAA4-11EE-more-text'
}
```

As you can see, we can retrieve a lot of data about our MySQL HeatWave backups. The properties that interested me the most are:
* `timeCreated` - This is the date and time the backup was created.
* `backupType` - This shows whether the backup is a `FULL` or `INCREMENTAL` backup.
* `dbSystemId` - This is the OCID of the MySQl HeatWave instance to which the backup is tied.
* `mysqlVersion` - This tells us what version of MySQL was running on the instance when the backup was taken.

There is also information about whether the backup was `AUTOMATIC` or `MANUAL`, the backup size (`sizeInMBs`), and the retention policy (`retentionDays`).

In my case, I have 20+ backups from various MySQL HeatWave instances. If we wanted to show only the backups for a specific instance, we could use the `dbSystemId` value in `backupListConfig`. Here is what it would look like:

```javascript
const backupListConfig = {
    compartmentId: process.env.COMPARTMENT_ID,
    limit: 100,
    sortBy: mysql.requests.ListBackupsRequest.SortBy.DisplayName,
    sortOrder: mysql.requests.ListBackupsRequest.SortOrder.Asc,
    lifecycleState: mysql.models.Backup.LifecycleState.Active,
    dbSystemId: '{the dbSystemId}'
}
```

When we run this code, our list of backups will be limited to backups for the provided `dbSystemId`.

## The Wrap-Up

As we can see, the TypeScript/JavaScript OCI SDK allows us to view information about our MySQL HeatWave instances - including details about backups of our instances. In future posts, I'll discuss creating a backup and updating backup data using the OCI SDK.

Photo by <a href="https://unsplash.com/@jandira_sonnendeck?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Jandira Sonnendeck</a> on <a href="https://unsplash.com/photos/a-close-up-of-a-disc-with-a-toothbrush-on-top-of-it-AcW1ZwD-qC0?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
