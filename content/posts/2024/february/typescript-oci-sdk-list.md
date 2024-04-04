---
title: Listing MySQL HeatWave Instances - Using the Oracle Cloud TypeScript SDK Part 1
date: 2024-02-14T06:00:00
image: /assets/images/2024/typescript-oci-sdk-list/header.jpg
tags: [ "MySQL", "MySQL-HeatWave", "OCI", "SDK" ]
related:
  - /posts/2024/february/typescript-oci-sdk-manage-instance/
  - /posts/2024/february/typescript-oci-sdk-waiters/
  - /posts/2024/february/typescript-oci-sdk-backup-list/
  - /posts/2024/march/typescript-oci-backup-create/
  - /posts/2024/march/typescript-oci-backup-update/
  - /posts/2024/april/typescript-oci-ref-list/

---
This post is the first in a series that will demonstrate how to view and manage MySQL HeatWave instances in [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) (OCI). Oracle offers several [SDKs](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdks.htm) that can be used to view and manage resources in OCI. In this post, we will discuss how to leverage the [TypeScript/JavaScript SDK](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/typescriptsdk.htm#SDK_for_TypeScript_and_JavaScript) to retrieve a list of [MySQL HeatWave](https://www.oracle.com/mysql/) instances for a given compartment.

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

The `oci-mysql` module contains the parts of the SDK that are specific to MySQL HeatWave instances. This includes dependencies to other modules such as `oci-common`.

The `bunyan` module is a JSON logging library for Node.js. I had to add this because I was getting errors while trying to run the code for this demo. I guess that there is a missing dependency somewhere. Installing `bunyan` separately addressed my issues.

The `dotenv` module allows us to use environment variables for information we will use in our demo.

### Set up `.env`

In this example, we only need one environment variable, the OCID of the compartment we will use. Create a file named `.env` and then add a variable named `COMPARTMENT_ID` and give it the value of the compartment you want to use. It should look like the text below.

```dotenv
COMPARTMENT_ID=ocid1.compartment.oc1..a{more text here}
```

## Using the SDK

To get started using the SDK, let's create a file named `index.mjs` in the root of our project. We are using the `.mjs` file extension because I prefer to use `import` statements, and by using `.mjs`, we can do that with no other configuration. We could use `.js`, but then we need to update `package.json` to include `"type": "module"`.

At the top of the file, we must import the modules we will use. After we `import` the `dotenv` module, we call `dotenv.config()` to grab the environment variables.

```javascript
import common from 'oci-common'
import * as mysql from 'oci-mysql'
import * as dotenv from 'dotenv'

dotenv.config()
```

Let's create a function named `main()` that we will run when the script loads.

```javascript
const main = async () => {
    
}
```

We use `async` here because some to the calls we will make using the SDK are asynchronous.

Next, we need to create an authentication provider. In this demo we will use a provider that reads the OCI config file created when we installed the OCI CLI. By default, the provider uses the config file located at `~/.oci/config` and the `DEFAULT` config block if more than one block is specified. Add the following code to the `main()` function.

```javascript
const provider = new common.ConfigFileAuthenticationDetailsProvider()
```

Once we have our authentication details provider, we create an instance of the MySQL `DbSystemClient`. Add the code below under the code we just added to `main()`.

```javascript
const systemClient = new mysql.DbSystemClient({ authenticationDetailsProvider: provider })
```

Now, we grab the `COMPARTMENT_ID` variable from the environment. Add the following code to the bottom of the `main()` function.

```javascript
const compartmentId = process.env.COMPARTMENT_ID
```
Continuing in the `main()` function, we must create a configuration object for our request to list MySQL HeatWave Systems.

```javascript
const systemListConfig = {
    compartmentId: compartmentId,
    limit: 5,
    sortBy: mysql.requests.ListDbSystemsRequest.SortBy.DisplayName,
    sortOrder: mysql.requests.ListDbSystemsRequest.SortOrder.Asc,
}
```

Let's break down the properties of this object:

* `compartmentId` - is the OCID of the compartment we want to list MySQL HeatWave instances from.
* `limit` - is the maximum number of systems that will be returned. In this demo we limit it to 5.
* `sortBy` - is the property by which the result will be sorted. Here, we are sorting by the `displayName` property.
* `sortOrder` - is the direction we want to sort. This example shows we are sorting ascending.

We are now ready to call the SDK to get the list of MySQL HeatWave instances. That is handled by the code below.

```javascript
const result = await systemClient.listDbSystems(systemListConfig)
```

To view the list of systems, we can do a `console.log()` of the `result` variable.

```javascript
console.log(result)
```

Lastly, add a call to `main()` at the bottom of the file.

```javascript
main()
```

When we are done with this file, it should look like the code below:

```javascript
import common from 'oci-common'
import * as mysql from 'oci-mysql'
import * as dotenv from 'dotenv'

dotenv.config()

const main = async () =>{
    const provider = new common.ConfigFileAuthenticationDetailsProvider()
    const systemClient = new mysql.DbSystemClient({ authenticationDetailsProvider: provider })
    const compartmentId = process.env.COMPARTMENT_ID

    const systemListConfig = {
        compartmentId: compartmentId,
        limit: 100,
        sortBy: mysql.requests.ListDbSystemsRequest.SortBy.DisplayName,
        sortOrder: mysql.requests.ListDbSystemsRequest.SortOrder.Asc,
    }

    const result = await systemClient.listDbSystems(systemListConfig)
    console.log(result)
}

main()
```

## Running the Code

To run the code, open a terminal/command window in the project folder and run the command:

```shell
node index.mjs
```

In the console, you will see the output of our call to `listDbSystems()`. Mine resembles the output below.

```javascript
{
  items: [
    {
      id: 'ocid1.mysqldbsystem.oc1.{more text}',
      displayName: 'OCI-SDK-Demos',
      description: 'A HeatWave instance to demonstrate the SDK',
      compartmentId: 'ocid1.compartment.oc1..{more text}',
      isHighlyAvailable: false,
      currentPlacement: [Object],
      isHeatWaveClusterAttached: false,
      heatWaveCluster: undefined,
      availabilityDomain: 'mMVr:US-ASHBURN-AD-2',
      faultDomain: 'FAULT-DOMAIN-2',
      availabilityPolicy: [Object],
      endpoints: [Array],
      lifecycleState: 'ACTIVE',
      mysqlVersion: '8.0.35',
      timeCreated: '2024-01-09T19:45:05.250Z',
      timeUpdated: '2024-01-18T17:43:34.382Z',
      deletionPolicy: [Object],
      freeformTags: [Object],
      definedTags: [Object],
      backupPolicy: [Object],
      shapeName: 'MySQL.VM.Standard.E4.1.8GB',
      crashRecovery: 'ENABLED',
      databaseManagement: 'ENABLED'
    }
  ],
  opcRequestId: 'B4474140CAA4-11EE-8901-5F5511ACB/BC7C95DED0AAB03E11A5B376FBD778F0/8473630587AC860F42CD44E00F92F361'
}
```

As you can see, we can retrieve a lot of data about our MySQL HeatWave instances. The properties that interested me the most are:
* `lifecycleState` - This indicates the state of the instance. Values can be `ACTIVE`, `INACTIVE`, `UPDATING`, or `DELETED`. There other states, but those are the ones you will see most often.
* `id` - This is the id of the instance. If we wanted to get information about just this instance, we would use a different endpoint in the SDK and pass this value. We can also programmatically use this value to start, stop, or delete an instance.
* `mysqlVersion` - This indicates what version of MySQL is used by this instance.
* `shapeName` - This tells us what shape the instance was based on.

There is also information about where the instance resides (`currentPlacement`), the deletion and backup policies (`deletionPolicy` and `backupPolicy` respectively), and whether crash recovery (`crashRecovery`) and database management (`databaseManagement`) are enabled or not.

## The Wrap-Up

As we can see, the TypeScript/JavaScript OCI SDK allows us to view information about our MySQL HeatWave instances. In future posts, we will discuss starting and stopping MySQL HeatWave instances and viewing/managing backups, replicas, and replication channels.

Photo by <a href="https://unsplash.com/@kellysikkema?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Kelly Sikkema</a> on <a href="https://unsplash.com/photos/six-white-sticky-notes--1_RZL8BGBM?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>