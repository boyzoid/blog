---
title: Creating a MySQL HeatWave Configuration with the OCI CLI
date: 2024-04-18T06:00:00
image: 2024/oci-cli-create-configuration/header.jpg
tags: [ "MySQL", "MySQL-HeatWave", "OCI", "CLI" ]
related:
  - /posts/2024/april/oci-cli-create-heatwave-instance/
  - /posts/2024/april/oci-cli-heatwave-list-update/
  - /posts/2024/april/oci-cli-backup-create-restore/
  - /posts/2024/april/oci-cli-create-replica/
  - /posts/2024/april/oci-cli-create-channel/
---

This is the fifth post in a series dedicated to showing how to use the [OCI CLI](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/cliconcepts.htm) to manage [MySQL HeatWave](https://www.oracle.com/mysql/) resources. This post will discuss how to create a configuration for MySQL HeatWave instances and how to create a new instance using this configuration.

## Prerequisites

Before you can run any of the examples below, you need to install the OCI CLI. If you do not have the CLI installed, follow the instructions [here](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) to install and configure the CLI.


## Creating a Configuration

Configurations are helpful when you want to quickly spin up multiple instances with the same shape and system variables. There are many default configurations, but you may need to create a custom configuration to meet your needs.

### Generating Command JSON

As we have done throughout this series, we are first going to generate a template JSON file to create our new configuration. The command to create this JSON file is:

```commandline
oci mysql configuration create --generate-full-command-json-input > config-create.json
```

When this command completes, the file named `config-create.json` will resemble the following:

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
  "initVariables": {
    "lowerCaseTableNames": "string"
  },
  "maxWaitSeconds": 0,
  "parentConfigurationId": "string",
  "shapeName": "string",
  "variables": {
    "autocommit": true,
    "bigTables": true,
    "binlogExpireLogsSeconds": 0,
    "binlogRowMetadata": "string",
    "binlogRowValueOptions": "string",
    "binlogTransactionCompression": true,
    "completionType": "string",
    "connectTimeout": 0,
    "connectionMemoryChunkSize": 0,
    "connectionMemoryLimit": 0,
    "cteMaxRecursionDepth": 0,
    "defaultAuthenticationPlugin": "string",
    "foreignKeyChecks": true,
    "generatedRandomPasswordLength": 0,
    "globalConnectionMemoryLimit": 0,
    "globalConnectionMemoryTracking": true,
    "groupReplicationConsistency": "string",
    "informationSchemaStatsExpiry": 0,
    "innodbBufferPoolDumpPct": 0,
    "innodbBufferPoolInstances": 0,
    "innodbBufferPoolSize": 0,
    "innodbDdlBufferSize": 0,
    "innodbDdlThreads": 0,
    "innodbFtEnableStopword": true,
    "innodbFtMaxTokenSize": 0,
    "innodbFtMinTokenSize": 0,
    "innodbFtNumWordOptimize": 0,
    "innodbFtResultCacheLimit": 0,
    "innodbFtServerStopwordTable": "string",
    "innodbLockWaitTimeout": 0,
    "innodbLogWriterThreads": true,
    "innodbMaxPurgeLag": 0,
    "innodbMaxPurgeLagDelay": 0,
    "innodbStatsPersistentSamplePages": 0,
    "innodbStatsTransientSamplePages": 0,
    "interactiveTimeout": 0,
    "localInfile": true,
    "mandatoryRoles": "string",
    "maxAllowedPacket": 0,
    "maxBinlogCacheSize": 0,
    "maxConnectErrors": 0,
    "maxConnections": 0,
    "maxExecutionTime": 0,
    "maxHeapTableSize": 0,
    "maxPreparedStmtCount": 0,
    "mysqlFirewallMode": true,
    "mysqlZstdDefaultCompressionLevel": 0,
    "mysqlxConnectTimeout": 0,
    "mysqlxDeflateDefaultCompressionLevel": 0,
    "mysqlxDeflateMaxClientCompressionLevel": 0,
    "mysqlxDocumentIdUniquePrefix": 0,
    "mysqlxEnableHelloNotice": true,
    "mysqlxIdleWorkerThreadTimeout": 0,
    "mysqlxInteractiveTimeout": 0,
    "mysqlxLz4DefaultCompressionLevel": 0,
    "mysqlxLz4MaxClientCompressionLevel": 0,
    "mysqlxMaxAllowedPacket": 0,
    "mysqlxMinWorkerThreads": 0,
    "mysqlxReadTimeout": 0,
    "mysqlxWaitTimeout": 0,
    "mysqlxWriteTimeout": 0,
    "mysqlxZstdDefaultCompressionLevel": 0,
    "mysqlxZstdMaxClientCompressionLevel": 0,
    "netReadTimeout": 0,
    "netWriteTimeout": 0,
    "parserMaxMemSize": 0,
    "queryAllocBlockSize": 0,
    "queryPreallocSize": 0,
    "regexpTimeLimit": 0,
    "sortBufferSize": 0,
    "sqlMode": "string",
    "sqlRequirePrimaryKey": true,
    "sqlWarnings": true,
    "threadPoolDedicatedListeners": true,
    "threadPoolMaxTransactionsLimit": 0,
    "timeZone": "string",
    "tmpTableSize": 0,
    "transactionIsolation": "string",
    "waitTimeout": 0
  },
  "waitForState": [
    "ACCEPTED|IN_PROGRESS|FAILED|SUCCEEDED|CANCELING|CANCELED"
  ],
  "waitIntervalSeconds": 0
}
```

The `variables` property on this JSON file contains system variables that will be set when an instance is created using this configuration. I will modify this file to only include the properties we use for this demo. The updated file is:

```json
{
  "compartment-id": "ocid1.compartment.oc1.{more text}",
  "description": "A Demo configuration create with the OCI CLI",
  "displayName": "OCI CLI Configuration Demo",
  "shapeName": "MySQL.8",
  "variables": {
    "sqlMode": "STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION "
  }
}
```

In this configuration file, we specify the `compartmetnId` of the compartment where the configuration will reside. We also specify a `description`, `displayName`, and `shape`. Under the `variables` property, we specify a value for `sqlMode`. Any instance we create using this configuration will have the same `sqlMode`.

### Run the Command

To create a new configuration using this JSON config file, we run the command:

```commandline
oci mysql configuration create --from-json file://{path to file}
```

After the command completes, we will see an output similar to the following:

```json
{
  "data": {
    "compartment-id": "ocid1.compartment.oc1.{more text}",
    "defined-tags": {
      "Oracle-Recommended-Tags": {
        "ResourceOwner": "default/sstroz"
      },
      "Oracle-Tags": {
        "CreatedBy": "default/sstroz",
        "CreatedOn": "2024-04-17T13:27:43.977Z"
      }
    },
    "description": "A Demo configuration create with the OCI CLI",
    "display-name": "OCI CLI Configuration Demo",
    "freeform-tags": {},
    "id": "ocid1.mysqlconfiguration.oc1.{more text}",
    "init-variables": {
      "lower-case-table-names": "CASE_SENSITIVE"
    },
    "lifecycle-state": "ACTIVE",
    "parent-configuration-id": "ocid1.mysqlconfiguration.oc1.{more text}",
    "shape-name": "MySQL.8",
    "time-created": "2024-04-17T13:27:44.026000+00:00",
    "time-updated": "2024-04-17T13:27:44.026000+00:00",
    "type": "CUSTOM",
    "variables": {
      "autocommit": null,
      "big-tables": null,
      "binlog-expire-logs-seconds": 3600,
      "binlog-row-metadata": null,
      "binlog-row-value-options": "PARTIAL_JSON",
      "binlog-transaction-compression": null,
      "completion-type": null,
      "connect-timeout": null,
      "connection-memory-chunk-size": null,
      "connection-memory-limit": null,
      "cte-max-recursion-depth": null,
      "default-authentication-plugin": null,
      "foreign-key-checks": null,
      "generated-random-password-length": null,
      "global-connection-memory-limit": null,
      "global-connection-memory-tracking": null,
      "group-replication-consistency": "BEFORE_ON_PRIMARY_FAILOVER",
      "information-schema-stats-expiry": null,
      "innodb-buffer-pool-dump-pct": null,
      "innodb-buffer-pool-instances": 4,
      "innodb-buffer-pool-size": 51539607552,
      "innodb-ddl-buffer-size": null,
      "innodb-ddl-threads": null,
      "innodb-ft-enable-stopword": null,
      "innodb-ft-max-token-size": null,
      "innodb-ft-min-token-size": null,
      "innodb-ft-num-word-optimize": null,
      "innodb-ft-result-cache-limit": 33554432,
      "innodb-ft-server-stopword-table": null,
      "innodb-lock-wait-timeout": null,
      "innodb-log-writer-threads": null,
      "innodb-max-purge-lag": null,
      "innodb-max-purge-lag-delay": 300000,
      "innodb-stats-persistent-sample-pages": null,
      "innodb-stats-transient-sample-pages": null,
      "interactive-timeout": null,
      "local-infile": true,
      "mandatory-roles": "public",
      "max-allowed-packet": null,
      "max-binlog-cache-size": 4294967296,
      "max-connect-errors": null,
      "max-connections": 4000,
      "max-execution-time": null,
      "max-heap-table-size": null,
      "max-prepared-stmt-count": null,
      "mysql-firewall-mode": null,
      "mysql-zstd-default-compression-level": null,
      "mysqlx-connect-timeout": null,
      "mysqlx-deflate-default-compression-level": null,
      "mysqlx-deflate-max-client-compression-level": null,
      "mysqlx-document-id-unique-prefix": null,
      "mysqlx-enable-hello-notice": null,
      "mysqlx-idle-worker-thread-timeout": null,
      "mysqlx-interactive-timeout": null,
      "mysqlx-lz4-default-compression-level": null,
      "mysqlx-lz4-max-client-compression-level": null,
      "mysqlx-max-allowed-packet": null,
      "mysqlx-min-worker-threads": null,
      "mysqlx-read-timeout": null,
      "mysqlx-wait-timeout": null,
      "mysqlx-write-timeout": null,
      "mysqlx-zstd-default-compression-level": null,
      "mysqlx-zstd-max-client-compression-level": null,
      "net-read-timeout": null,
      "net-write-timeout": null,
      "parser-max-mem-size": null,
      "query-alloc-block-size": null,
      "query-prealloc-size": null,
      "regexp-time-limit": null,
      "sort-buffer-size": null,
      "sql-mode": "STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION ",
      "sql-require-primary-key": null,
      "sql-warnings": null,
      "thread-pool-dedicated-listeners": null,
      "thread-pool-max-transactions-limit": null,
      "time-zone": "UTC",
      "tmp-table-size": null,
      "transaction-isolation": null,
      "wait-timeout": null
    }
  },
  "etag": "4df39f8{more text}"
}
```

When we look at the `variables` property of this JSON, we can see that even though we only specify the `sqlMode` variable, defaults are set for the other variables. Also, note that the value of the `type` property is `CUSTOM`.

### Listing Custom Configurations

There are many default MySQl HetWave configurations, and we discussed listing configuration in [this post](/posts/2024/april/oci-cli-create-heatwave-instance/#configurations). To see a list of all your custom configurations, run the following command:

```commandline
oci mysql configuration list --compartment-id {compartment ID} --type custom
```

We will see the configuration we created if we have no other custom configurations.

```json
{
  "data": [
    {
      "compartment-id": "ocid1.compartment.oc1.{more text}",
      "defined-tags": {
        "Oracle-Recommended-Tags": {
          "ResourceOwner": "default/sstroz"
        },
        "Oracle-Tags": {
          "CreatedBy": "default/sstroz",
          "CreatedOn": "2024-04-17T13:27:43.977Z"
        }
      },
      "description": "A Demo configuration create with the OCI CLI",
      "display-name": "OCI CLI Configuration Demo",
      "freeform-tags": {},
      "id": "ocid1.mysqlconfiguration.oc1.{more text}",
      "lifecycle-state": "ACTIVE",
      "shape-name": "MySQL.8",
      "time-created": "2024-04-17T13:27:44.026000+00:00",
      "time-updated": "2024-04-17T13:27:44.026000+00:00",
      "type": "CUSTOM"
    }
  ]
}
```

## Using the Configuration

Once we create our configuration, we can use it to create new MySQL HeatWave instances. First, let's generate a JSON file we can use to create a HeatWave instance.

```commandline
oci mysql db-system create --generate-full-command-json-input  > create-from-config.json 
```

The `create-from-config.json` file will resemble:

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

As we have done before, we will update this file to use only the properties we want for this demo.

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
  "configurationId": "ocid1.mysqlconfiguration.oc1.{more text}",
  "crashRecovery": "ENABLED",
  "dataStorageSizeInGbs": 50,
  "databaseManagement": "DISABLED",
  "description": "A HeatWave instance created with the OCI CLI using a configuration",
  "displayName": "OCI CLI Demo from Config",
  "isHighlyAvailable": false,
  "mysqlVersion": "8.3.0",
  "shapeName": "MySQL.8",
  "subnetId": "ocid1.subnet.oc1.{more text}",
  "waitForState": ["SUCCEEDED"]
}
```

When this new instance is created, the values of the items in the `variables` property will be set by specifying the' configurationId'. In our case, it will set `sqlMode` to `STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION` and use default values for the other variables.

Check out [this post](/posts/2024/april/oci-cli-create-heatwave-instance/) for more information on creating MySQL HeatWave instances.

## Wrap-up

Configurations can be used to set system/global variables on a MySQL HeatWave instance when it is created. By creating a custom configuration and using it to create new HeatWave instances, we can ensure that every instance we create is configured the same way without updating any system/global variables manually. In a future post, we will discuss creating inbound replication channels using the OCI CLI.

Photo by <a href="https://unsplash.com/@flowforfrank?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Ferenc Almasi</a> on <a href="https://unsplash.com/photos/a-computer-screen-with-a-bunch-of-text-on-it-oCm8nPkE40k?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
