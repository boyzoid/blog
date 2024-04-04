---
title: Managing MySQL HeatWave Instances - Using the Oracle Cloud TypeScript SDK Part 2
date: 2024-02-16T06:00:00
image: /assets/images/2024/typescript-oci-sdk-manage-instance/header.jpg
tags: [ "MySQL", "MySQL-HeatWave", "OCI", "SDK" ]
related:
  - /posts/2024/february/typescript-oci-sdk-list/
  - /posts/2024/february/typescript-oci-sdk-waiters/
  - /posts/2024/february/typescript-oci-sdk-backup-list/
  - /posts/2024/march/typescript-oci-backup-create/
  - /posts/2024/march/typescript-oci-backup-update/
  - /posts/2024/april/typescript-oci-ref-list/

---
This post is the second in a series that will demonstrate how to view and manage MySQL HeatWave instances in [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) (OCI). Oracle offers several [SDKs](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdks.htm) that can be used to view and manage resources in OCI. In this post, we will discuss how to leverage the [TypeScript/JavaScript SDK](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/typescriptsdk.htm#SDK_for_TypeScript_and_JavaScript) to retrieve information about a single [MySQL HeatWave](https://www.oracle.com/mysql/) instance and how we can start and stop the instance programmatically.

## Prerequisites

As I noted in [this post](/posts/2024/february/typescript-oci-sdk-list/), to use the OCI SDKs, you need credentials for an OCI account with the proper permissions. While it is not necessary to install the OCI CLI, following the instructions at [this page](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) will create the same files we will need to use the SDK...with the added advantage of installing the CLI.

To follow along with this demo, you should also have [Node.js](https://nodejs.org) installed. I am using version 21.5.0.

## Creating the Node App

Before we dive into accessing the SDK, there are some setup and configurations we need to take care of.

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

In this example, we only need one environment variable, the OCID of the MySQL HeatWave instance we want to view and manage. Create a file named `.env` and then add a variable named `INSTANCE_ID` and give it the value of the MySQL HeatWave instance you want to use. It should look like the text below.

```dotenv
INSTANCE_ID=ocid1.mysqldbsystem.oc1.{more text here}
```

## Using the SDK

### Getting Instance Data

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

We use `async` here because some calls we will make using the SDK are asynchronous.

Next, we need to create an authentication provider. In this demo, we will use a provider that reads the OCI config file created when we installed the OCI CLI. By default, the provider uses the config file located at `~/.oci/config` and the `DEFAULT` config block if more than one block is specified. Add the following code to the `main()` function.

```javascript
const provider = new common.ConfigFileAuthenticationDetailsProvider()
```

Once we have our authentication details provider, we create an instance of the MySQL `DbSystemClient`. Add the code below under the code we just added to `main()`.

```javascript
const systemClient = new mysql.DbSystemClient({ authenticationDetailsProvider: provider })
```

Next, we set a config object using the environment variable we specified earlier, call the SDK to get the MySQL HeatWave instance details, and log it to the console.

```javascript
const systemConfig = {
    dbSystemId: process.env.INSTANCE_ID
}

const result = await systemClient.getDbSystem({dbSystemId: systemId})
console.log(result)
```

Here is what the complete script looks like.

```javascript
import common from 'oci-common'
import * as mysql from 'oci-mysql'
import * as dotenv from 'dotenv'

dotenv.config()

const main = async () =>{
    const provider = new common.ConfigFileAuthenticationDetailsProvider()
    const systemClient = new mysql.DbSystemClient({ authenticationDetailsProvider: provider })

    const systemConfig = {
        dbSystemId: process.env.INSTANCE_ID
    }

    const result = await systemClient.getDbSystem(systemConfig)
    console.log(result)
}

main()
```

To run this script, use the following command":

```shell
node index.mjs
```

You should see output in the console similar to the text below:

```javascript
{
  dbSystem: {
    id: 'ocid1.mysqldbsystem.oc1.more_text',
    displayName: 'OCISDK_INSTANCE',
    description: null,
    compartmentId: 'ocid1.compartment.oc1.more_text',
    subnetId: 'ocid1.subnet.oc1.more_text',
    isHighlyAvailable: false,
    currentPlacement: {
      availabilityDomain: 'mMVr:US-ASHBURN-AD-1',
      faultDomain: 'FAULT-DOMAIN-1'
    },
    isHeatWaveClusterAttached: false,
    heatWaveCluster: undefined,
    availabilityDomain: 'mMVr:US-ASHBURN-AD-1',
    faultDomain: 'FAULT-DOMAIN-1',
    availabilityPolicy: { isHighlyAvailable: false },
    shapeName: 'MySQL.VM.Standard.E3.1.8GB',
    mysqlVersion: '8.0.33',
    backupPolicy: {
      isEnabled: true,
      window: '05:33',
      windowStartTime: '05:33',
      retentionDays: 7,
      retentionInDays: 7,
      freeformTags: null,
      definedTags: null,
      pitrPolicy: [Object]
    },
    source: undefined,
    configurationId: 'ocid1.mysqlconfiguration.oc1.more_text',
    configurationRevisionId: null,
    dataStorageSizeInGBs: 512,
    hostnameLabel: null,
    ipAddress: '10.0.1.158',
    port: 3306,
    portX: 33060,
    endpoints: [ [Object] ],
    channels: [],
    lifecycleState: 'ACTIVE',
    lifecycleDetails: null,
    maintenance: { windowStartTime: 'MONDAY 10:45' },
    deletionPolicy: {
      automaticBackupRetention: 'RETAIN',
      finalBackup: 'REQUIRE_FINAL_BACKUP',
      isDeleteProtected: true
    },
    timeCreated: '2023-07-12T13:40:41.844Z',
    timeUpdated: '2024-02-14T17:43:03.989Z',
    freeformTags: { Template: 'Production' },
    definedTags: { 'Oracle-Recommended-Tags': [Object], 'Oracle-Tags': [Object] },
    crashRecovery: 'ENABLED',
    pointInTimeRecoveryDetails: {
      timeEarliestRecoveryPoint: '2024-02-08T05:34:15.000Z',
      timeLatestRecoveryPoint: '2024-02-14T18:27:27.000Z'
    },
    databaseManagement: 'DISABLED',
    secureConnections: { certificateId: null, certificateGenerationType: 'SYSTEM' }
  },
  etag: 'b5b11d30more_tyext',
  opcRequestId: 'FAB89E90CB66-11EE-89D5-more-text'
}
```

### Stopping an Active Instance

In this example, we can see that the `lifecycleState` property is `ACTIVE`. This status means that the MySQL HeatWave instance is up and running. Let's look at how we can stop this instance using the SDK.

Add the following code after the `console.log()`. Make sure you paste it inside of the `main()` function.

```javascript
const stopDbSystemDetails = {
    shutdownType: mysql.models.InnoDbShutdownMode.Immediate
};
const dbStopRequest = {
    dbSystemId: request.dbSystem.id,
    stopDbSystemDetails: stopDbSystemDetails
};
const stopData = await systemClient.stopDbSystem(dbStopRequest)

console.log(stopData)
```

We have two different config objects we create. The first, `stopDbSystemDetails` contains a single property named `shutdownType` with a value equal to a static value in `mysql.models.InnoDbShutdownMode`. This value tells the MySQL HeatWave instance to shut down immediately.

The next config object, named `dbStopRequest` has two properties.

* `dbSystemId` - The `id` value from the instance data we retrieved above. We can also use `process.env.instance` to set the system ID.
* stopDbSystemDetails - The `stopDbSystemDetails` config object we just created.

Lastly, we call the `stopDbSystem()` method on our `systemClient` pass in the `dbStopRequest` config object and log that result to the console.

After running `node index.mjs` again, and look at the console; we should now see the instance data and information about the request to stop the MySQL HeatWave instance.

```javascript
{
  opcRequestId: 'E0341BA1CB69-11EE-BEA4-more-text',
  opcWorkRequestId: 'ocid1.mysqlworkrequest.oc1.more_text
}
```

We can check the status of our instance shutdown in a few ways.

* Check the instance status in the Oracle Cloud Interface
* Comment out the code that uses the SDK to stop the instance and dumps the result
* User a `waiter` to watch for the `INACTIVE` state (We will cover this one in a future post)

If you follow the second option, you will see that the `lifecycleState` will initially return as `UPDATING` and after the instance is shutdown it will return as `INACTIVE`.

Our MySQL HeatWave instance is now stopped.

### Starting an Inactive Instance

With this instance now stopped, let's look at the code needed to start it. First, remove or comment out the following code. Make sure you keep the code that retrieves the system details.

```javascript
const stopDbSystemDetails = {
    shutdownType: mysql.models.InnoDbShutdownMode.Immediate
};
const dbStopRequest = {
    dbSystemId: result.dbSystem.id,
    stopDbSystemDetails: stopDbSystemDetails
};
const stopData = await systemClient.stopDbSystem(dbStopRequest)

console.log(stopData)
```
Now, add the following code:

```javascript
const dbStartRequest = {
   dbSystemId: result.dbSystem.id
};
const startData = await systemClient.startDbSystem(dbStartRequest)

console.log(startData)
```

We have one config object, `dbStartRequest`, that contains a single property named `dbSystemId` and has the `id` value from the instance data we retrieved above.

We then call the `startDbSystem()` method of our `systemClient` and pass in this config object.

If we run `node index.mjs` again, we will see data similar to:

```javascript
{
  opcRequestId: '3A15FC91CB6C-11EE-more-text',
  opcWorkRequestId: 'ocid1.mysqlworkrequest.oc1.more_text'
}
```

Again, we can check the status using any of the above methods. The `lifecycleState` value will initially be `UPDATING`. After the MySQL HeatWave instance has started, it will return `ACTIVE`.

## The Wrap-Up

As we can see, the TypeScript/JavaScript OCI SDK allows us to view information about our MySQL HeatWave instances. The SDK also allows us to start and stop existing instances. There are also SDK endpoints to create and delete MySQ: HeatWave instances. In future posts, I will discuss `waiters` and how they can capture when an instance becomes a particular state and how to list and manage backups, replicas, and replication channels.

Photo by [Erik Mclean](https://www.pexels.com/photo/engine-start-round-button-of-modern-car-5688466/)
