---
title: Updating a MySQL HeatWave Backup - Using the Oracle Cloud TypeScript SDK Part 6
date: 2024-04-02T06:00:00
image: 2024/typescript-oci-sdk-backup-update/header.jpg
tags: [ "MySQL", "MySQL-HeatWave", "OCI", "SDK" ]
related:
  - /posts/2024/february/typescript-oci-sdk-list/
  - /posts/2024/february/typescript-oci-sdk-manage-instance/
  - /posts/2024/february/typescript-oci-sdk-waiters/
  - /posts/2024/february/typescript-oci-backup-list/
  - /posts/2024/march/typescript-oci-backup-create/
  - /posts/2024/april/typescript-oci-ref-list/

---
This post is the sixth in a series that will demonstrate how to view and manage MySQL HeatWave instances in [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) (OCI). Oracle offers several [SDKs](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdks.htm) that can be used to view and manage resources in OCI. In this post, we will discuss how to leverage the [TypeScript/JavaScript SDK](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/typescriptsdk.htm#SDK_for_TypeScript_and_JavaScript) to programmatically update data of a backup of a  [MySQL HeatWave](https://www.oracle.com/mysql/) instance.

## Prerequisites

To use the OCI SDKs, you need credentials for an OCI account with the proper permissions. While it is not necessary to install the OCI CLI, following the instructions at [this post](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) will create the same files we will need to use the SDK...with the added advantage of installing the CLI.

To follow along with this demo, you should also have [Node.js](https://nodejs.org) installed. I am using version 21.5.0.

## Creating the Node App

Before we can access the SDK, we need to take care of some setup and config.

### Initialize the Node App

Create a directory to hold your code, open a terminal/command window, and `cd` into that new folder. To initialize a Node app, run the following command:

```shell
npm init
```

You will be prompted for information about the project. For this demo, feel free to accept all the default values.

When the `init` script is complete, you should see a file named `package.json` in your directory. Here is what mine looks like.

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

Next, we will install the node modules we will need. You can install these modules using the command:

```shell
npm install oci-mysql bunyan dotenv
```

This command will install the `oci-mysql`, `dotenv`, and `express` modules.

The `oci-mysql` module contains the parts of the SDK specific to MySQL HeatWave instances. It also includes dependencies on other modules, such as `oci-common`.

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

    const updateBackupDetails = {
        displayName: "Updated Backup Demo",
        description: "This is a backup we updated using the OCI SDK",
        retentionInDays: 365,

    };

    const updateBackupRequest = {
        backupId: "ocid1.mysqlbackup.oc1.{more text}}",
        updateBackupDetails: updateBackupDetails
    }

    const result = await backupClient.updateBackup(updateBackupRequest)
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

Now that we have our `backupClient`, we must build the config block to specify options about our backup.

```javascript
const updateBackupDetails = {
    displayName: "Updated Backup Demo",
    description: "This is a backup we updated using the OCI SDK",
    retentionInDays: 365,

};

const updateBackupRequest = {
    backupId: "ocid1.mysqlbackup.oc1.{more text}",
    updateBackupDetails: updateBackupDetails
}
```

In the JSON object named `updateBackupDetails`, we set new values for `displayName`, `description`, and `retentionDays`. We then use this object in the request details config block named `updateBackupRequest`. We must also pass the `backupId` for the backup we wish to update.

We update our backup by calling `updateBackup()` on our `backupClient` and pass in the config values we just discussed. We then log the result of this call to the console.

```javascript
const result = await backupClient.updateBackup(updateBackupRequest)
console.log(result)
```

## Running the Code

### Before
Before we run the code, let's look at the backup details page in OCI for the backup we want to update. We can see that the backup name is 'TEST API Backup' (1), and the 'Retention Days' value is set to 42 (2).

![Backup Details Page]({{ "2024/typescript-oci-sdk-backup-update/img_1.png" | imgurl }})

To run the code, open a terminal/command window in the project folder and run the command:

```shell
node index.mjs
```

In the console, you will almost immediately see the output of our call to `creeateBackup()`. Mine resembles the output below.

```json
{
  backup: {
    id: "ocid1.mysqlbackup.oc1.{more text}",
    displayName: "Updated Backup Demo",
    description: "This is a backup we updated using the OCI SDK",
    compartmentId: "ocid1.compartment.oc1{more text}",
    timeCreated: "2024-03-12T13:18:04.929Z",
    timeUpdated: "2024-03-12T13:20:29.267Z",
    lifecycleState: "ACTIVE",
    lifecycleDetails: null,
    backupType: "FULL",
    creationType: "MANUAL",
    dbSystemId: "ocid1.mysqldbsystem.oc1.{more text}",
    dbSystemSnapshot: {
      id: "ocid1.mysqldbsystem.oc1.{more text}",
      displayName: "mysql_shorts",
      description: "A description of this database.",
      compartmentId: "ocid1.compartment.oc1{more text}",
      subnetId: "ocid1.subnet.oc1.{more text}}",
      availabilityDomain: "mMVr:US-ASHBURN-AD-1",
      faultDomain: "FAULT-DOMAIN-1",
      shapeName: "MySQL.VM.Standard.E4.1.8GB",
      mysqlVersion: "8.3.0",
      adminUsername: "sstroz",
      backupPolicy: [Object],
      configurationId: "ocid1.mysqlconfiguration.oc1{more text}",
      dataStorageSizeInGBs: 50,
      dataStorage: null,
      hostnameLabel: null,
      ipAddress: "10.0.1.246",
      port: 3306,
      portX: 33060,
      isHighlyAvailable: false,
      endpoints: [Array],
      maintenance: [Object],
      deletionPolicy: [Object],
      freeformTags: [Object],
      definedTags: [Object],
      crashRecovery: "ENABLED",
      databaseManagement: "ENABLED",
      secureConnections: [Object],
      region: "us-ashburn-1"
    },
    backupSizeInGBs: 1,
    retentionDays: 365,
    retentionInDays: 365,
    sizeInMBs: 241,
    dataStorageSizeInGBs: 50,
    mysqlVersion: "8.3.0",
    shapeName: "MySQL.VM.Standard.E4.1.8GB",
    freeformTags: { Template: "Development or testing" },
    definedTags: { "Oracle-Recommended-Tags": [Object], "Oracle-Tags": [Object] },
    immediateSourceBackupId: null,
    originalSourceBackupId: null,
    timeCopyCreated: null
  },
  opcRequestId: "1F516160F024-11EE-8432-{more text}"
}
```
### After

If we go back and look at the backup Details page in OCI, we will see that the backup name (1) and retention days (2) have been updated.

![Backup Details Page 2]({{ "2024/typescript-oci-sdk-backup-update/img_2.png" | imgurl }})

## The Wrap-Up

As we can see, the TypeScript/JavaScript OCI SDK allows us to update information about a backup of a MySQL HeatWave instance. In my last post in this series, I will discuss how to retrieve lists of reference data used when managing MySQL HeatWave instances using the OCI SDK.

Photo by <a href="https://unsplash.com/@markuswinkler?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Markus Winkler</a> on <a href="https://unsplash.com/photos/white-printer-paper-on-green-typewriter-cxoR55-bels?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
  
