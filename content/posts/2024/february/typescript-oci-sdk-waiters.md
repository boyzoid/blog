---
title: Waiters - Using the Oracle Cloud TypeScript SDK Part 3
date: 2024-02-19T06:00:00
image: 2024/typescript-oci-sdk-waiters/header.jpg
tags: [ "MySQL", "MySQL-HeatWave", "OCI", "SDK" ]
related:
  - /posts/2024/february/typescript-oci-sdk-list/
  - /posts/2024/february/typescript-oci-sdk-manage-instance/
  - /posts/2024/february/typescript-oci-sdk-backup-list/
  - /posts/2024/march/typescript-oci-backup-create/
  - /posts/2024/march/typescript-oci-backup-update/
  - /posts/2024/april/typescript-oci-ref-list/

---
This post is the third in a series that will demonstrate how to view and manage MySQL HeatWave instances in [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) (OCI). Oracle offers several [SDKs](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdks.htm) that can be used to view and manage resources in OCI. In this post, we will discuss how to leverage the [TypeScript/JavaScript SDK](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/typescriptsdk.htm#SDK_for_TypeScript_and_JavaScript) to use waiters to asynchronously handle when [MySQL HeatWave](https://www.oracle.com/mysql/) instance reaches a given lifecycle state.

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

Before diving into the code, let's talk about waiters and what they can do for us.

Here is an explanation from the [OCI TypeScript SDK Documentation](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/typescriptsdkconcepts.htm#typescriptsdkconcepts_topic_Polling_with_Waiters).

>The OCI SDK for TypeScript offers waiters that allow your code to wait until a specific resource reaches a desired state. A waiter will wait until the desired state is reached or a timeout is exceeded. Waiters abstract the polling logic you would otherwise have to write into an easy-to-use single-method call.

Put more simply, waiters are a built-in way to do polling. This process allows us to handle long-running processes asynchronously when they are completed.

### The Code

Rather than break down each bit of code a little at a time, here is all the code you will need for this demo. I will break down the new pieces below.

Create a file named `inhdex.mjs` and paste in the following code.

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

    const dbStartRequest = {
        dbSystemId: result.dbSystem.id
    };
    const startData = await systemClient.startDbSystem(dbStartRequest)

    console.log(startData)
  
    // add waiter
    const waiterConfiguration = {
        terminationStrategy: new common.MaxTimeTerminationStrategy(3600),
        delayStrategy: new common.ExponentialBackoffDelayStrategy(30)
    }
    const dbSystemWaiter = new mysql.DbSystemWaiter(systemClient, waiterConfiguration)
    const waiterRequest = {
      dbSystemId: result.dbSystem.id,
      opcRequestId: startData.opcRequestId
    }
    dbSystemWaiter.forDbSystem(waiterRequest, 'ACIVE')
        .then(response => {
            console.log(`Instance id: ${result.dbSystem.id} is now ${response.dbSystem.lifecycleState}!`)
        })
}

main()
```

If you followed [my last post](/posts/2024/february/typescript-oci-sdk-manage-instance/), this is the same code we used to start a MySQL HeatWave instance with the code added to create a waiter. In a nutshell, this code will start an `INACTIVE` instance and then output the waiter response to the console when the instance is in an `ACTIVE` state.

### Waiter Config

We can see that we have a small config object for the waiter.

```javascript
const waiterConfiguration = {
    terminationStrategy: new common.MaxTimeTerminationStrategy(3600),
    delayStrategy: new common.ExponentialBackoffDelayStrategy(30)
}
```
The `terminationStrategy` is how long the waiter will wait before it throws an error. In our case, we set it to 3,600 seconds (1 hour). The `delayStrategy` defines how we handle request retries.

Then, we create an instance of `dbSystemWaiter` using the `dbSystemClient` and the `waiterConfiguration`.

```javascript
const dbSystemWaiter = new mysql.DbSystemWaiter(systemClient, waiterConfiguration)
```

Now that we have an instance of a waiter, we need to tell it to start doing some work.

First, we do a little more config.

```javascript
const waiterRequest = {
      dbSystemId: result.dbSystem.id,
      opcRequestId: startData.opcRequestId
    }
```

The `dbSystemId` is the ID of the MySQL HeatWave instance we want to start. We use the value returned from our call to `getDbSystem()`.

The `opcRequestId` is returned from our call to `startDbSyatem()`.

Finally, we create the waiter and set up a promise to run some code when the waiter returns.

```javascript
dbSystemWaiter.forDbSystem(waiterRequest, 'ACTIVE')
    .then(response => {
        console.log(`Instance id: ${result.dbSystem.id} is now ${response.dbSystem.lifecycleState}!`)
    })
```

In this code snippet, we create a waiter for a DB System by passing in the `waiterRequest` config and the string `ACTIVE`. This config means that the promise will execute when the instance reaches the `ACTIVE` state. In our case, we are simply logging some information to the console.

## Run The Code

To run the code, use the following command:

```shell
node index.mjs
```

In the console, we will see the instance information, followed by the result from our call to start the MySQL HeatWave instance. We will then see some console messages about the waiter checking on the status of the instance. Once the instance is started, you should see something that looks like the text below:

```text
...
Calling operation DbSystemClient#getDbSystem.
Retry policy to use: MaximumNumberAttempts=7, MaxSleepBetween=30, ExponentialBackoffBase=2
Total Latency for this API call is: 189 ms
Instance id: ocid1.mysqldbsystem.oc1.iad.more_text is now ACTIVE!

```

## The Wrap-Up

We can asynchronously handle long-running processes in the OCI SDK by using waiters. This functionality can be helpful if you build an app that allows basic management of MySQL HeatWave instances. Waiters can make it easier to send the updated state of an instance to a client (through web sockets, for instance). In future posts, I'll discuss other parts of the OCI TypeScript SDK that handle listing and managing backups, replicas, and replication channels.

Photo by <a href="https://unsplash.com/@k8townsend?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Kate Townsend</a> on <a href="https://unsplash.com/photos/waiter-serving-beverages-hEC6zxdFF0M?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
