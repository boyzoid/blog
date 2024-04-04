---
title: Retrieving Reference Lists - Using the Oracle Cloud TypeScript SDK Part 7
date: 2024-04-04T06:00:00
image: /assets/images/2024/typescript-oci-sdk-ref-lists/header.jpg
tags: [ "MySQL", "MySQL-HeatWave", "OCI", "SDK" ]
related:
  - /posts/2024/february/typescript-oci-sdk-list/
  - /posts/2024/february/typescript-oci-sdk-manage-instance/
  - /posts/2024/february/typescript-oci-sdk-waiters/
  - /posts/2024/february/typescript-oci-backup-list/
  - /posts/2024/march/typescript-oci-backup-create/
  - /posts/2024/april/typescript-oci-backup-update/

---
This post is the last in a series that will demonstrate how to view and manage MySQL HeatWave instances in [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) (OCI). Oracle offers several [SDKs](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdks.htm) that can be used to view and manage resources in OCI. In this post, we will discuss how to leverage the [TypeScript/JavaScript SDK](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/typescriptsdk.htm#SDK_for_TypeScript_and_JavaScript) to programmatically retrieve reference data that may be needed to manage MySQL HeatWave instances using the SDK.

## Prerequisites

To use the OCI SDKs, you need credentials for an OCI account with the proper permissions. While it is not necessary to install the OCI CLI, following the instructions at [this post](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) will create the same files we will need to use the SDK...with the added advantage of installing the CLI.

To follow along with this demo, you should also have [Node.js](https://nodejs.org) installed. I am using version 21.5.0.

## Creating the Node App

Before we can access the SDK, we must set up and configure it.

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
    const refClient = new mysql.MysqlaasClient({ authenticationDetailsProvider: provider })

    const requestConfig = {
        compartmentId: process.env.COMPARTMENT_ID
    }
    
    const configs = await refClient.listConfigurations(requestConfig)
    const shapes = await refClient.listShapes(requestConfig)
    const versions = await refClient.listVersions(requestConfig)

    console.log({configLength: configs.items.length, firstConfig: configs.items[0]})
    console.log({shapeLength: shapes.items.length, firstShape: shapes.items[0]})
    console.log({versionLength: versions.items.length, versions: versions.items})
    for(let item of versions.items){
        console.log(item)
    }
}

main()
```

### The Breakdown

At the top of the file, we import the necessary modules, `oci-common`, `oci-mysl`, and `dotenv`. We then call `dotenv.config()` to grab the environment variables.

Next, we create a function named `main()`, and inside that function, we create an instance of `ConfigFileAuthenticationDetailsProvider()` called `provider`. This provider reads the OCI config file created when we installed the OCI CLI. By default, the provider uses the config file located at `~/.oci/config` and the `DEFAULT` config block if more than one block is specified.

```javascript
const provider = new common.ConfigFileAuthenticationDetailsProvider()
```

Once we have an authentication provider, we need to create an instance of `mysql..MysqlaasClient()`, named `refClient`, and pass this provider as part of a config block.

```javascript
const refClient = new mysql.MysqlaasClient({ authenticationDetailsProvider: provider })
```

Now that we have our `refClient`, we must build the config block to specify options for our request. In this case, we only use the `compartmentId` property and set the value to the `COMPARTMENT_ID` environment variable.

```javascript
const requestConfig = {
    compartmentId: process.env.COMPARTMENT_ID
}
```

In the next block of code, we call several SDK methods to get lists of configurations, shapes, and versions that MySQL HeatWave supports. The information returned from these requests can be used when managing MySQL HeatWave instances. For instance, when creating a MySQL HeatWave instance, we would use the `name` property of a `shape` to set the instance's shape or the `version` property of a specific version to set the MySQL version of the instance.

```javascript
const configs = await refClient.listConfigurations(requestConfig)
const shapes = await refClient.listShapes(requestConfig)
const versions = await refClient.listVersions(requestConfig)
```

Lastly, we dump some of the information that is returned. For the `configs` and `shapes`, we dump the number of each and then the value of the first item in the returned array. For `versions`, we dump not only the entire result (because there are only two items in the array) but also drill down to all the available versions under each `versionFamily`.

```javascript
console.log({configLength: configs.items.length, firstConfig: configs.items[0]})
console.log({shapeLength: shapes.items.length, firstShape: shapes.items[0]})
console.log({versionLength: versions.items.length, versions: versions.items})
for(let item of versions.items){
    console.log(item)
}
```

## Running the Code

To run the code, open a terminal/command window in the project folder and run the command:

```shell
node index.mjs
```

In the console, you will see the results of the dumps from above.

### Configurations

We can see that there are 107 different configurations.

```json
{
  "configLength": 107,
  "firstConfig": {
    "id": "ocid1.mysqlconfiguration.oc1.{more text}",
    "compartmentId": null,
    "description": "Default standalone configuration for the BM.Standard.E2.64 MySQL shape",
    "displayName": "BM.Standard.E2.64.Standalone",
    "shapeName": "BM.Standard.E2.64",
    "type": "DEFAULT",
    "lifecycleState": "ACTIVE",
    "applicationProgress": null,
    "timeCreated": "2018-09-21T10:00:00.000Z",
    "timeUpdated": null,
    "freeformTags": null,
    "definedTags": null
  }
}
```

### Shapes

We can see there are 55 different shapes.

```json
{
  "shapeLength": 55,
  "firstShape": {
    "name": "VM.Standard.E2.1",
    "cpuCoreCount": 1,
    "memorySizeInGBs": 8,
    "isSupportedFor": [ "DBSYSTEM" ]
  }
}
```

### Versions

We can see that there are two different version families.

```json
{
  "versionLength": 2,
  "versions": [
    { "versionFamily": "8.0", "versions": [Array] },
    { "versionFamily": "8 - Innovation", "versions": [Array] }
  ]
}
```

### Version Details

We can see the different versions available in each version family.

```json
{
  "versionFamily": "8.0",
  "versions": [
    { "version": "8.0.32", "description": "8.0.32" },
    { "version": "8.0.33", "description": "8.0.33" },
    { "version": "8.0.34", "description": "8.0.34" },
    { "version": "8.0.35", "description": "8.0.35" },
    { "version": "8.0.36", "description": "8.0.36" }
  ]
}

```
```json
{
  "versionFamily": "8 - Innovation",
  "versions": [
    { "version": "8.2.0", "description": "8.2.0" },
    {
      "version": "8.2.0-HeatWave-Preview",
      "description": "8.2.0 HeatWave Preview"
    },
    { "version": "8.3.0", "description": "8.3.0" },
    {
      "version": "8.3.0-HeatWave-Preview",
      "description": "8.3.0 HeatWave Preview"
    },
    {
      "version": "8.4.0-HeatWave-Preview",
      "description": "8.4.0 HeatWave Preview"
    }
  ]
}
```

## The Wrap-Up

As shown throughout this series, we can manage MySQl HeatWave instances using the OCI SKDs. This post shows how to retrieve some of the reference data that can be used to define the properties of MySQL HeatWave instances. Be sure to check out the [documentation of the TypeScript SDK](https://docs.oracle.com/en-us/iaas/tools/typescript/2.83.0/modules/_mysql_index_.html) to see all the available functionality.

Photo by <a href="https://unsplash.com/@tobben63?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Torbjørn Helgesen</a> on <a href="https://unsplash.com/photos/a-notepad-with-a-green-pen-sitting-on-top-of-it-C4FbCe4L_pw?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>