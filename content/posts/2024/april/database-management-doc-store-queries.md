---
title: Viewing MySQL Document Store Queries in HeatWave Using Database Management
date: 2024-04-30T06:00:00
image: 2024/database-management-doc-store-queries/header.jpg
tags: [ "MySQL", "MySQL-HeatWave", "MySQL-Document-Store", "Database-Management", "Oracle-Cloud" ]
related:
  - /posts/2023/march/document-store-queries-mds/
---

In a [post](/posts/2023/march/document-store-queries-mds/) from last year, I talked about how we can view the SQL queries that are run whenever we use the [MySQL Document Store](https://www.mysql.com/products/enterprise/document_store.html) API to return JSON documents. If you did not know, when using the Document Store API, the commands are translated into SQL and executed against the database. Sometimes, it is helpful to view the queries to understand how the data is retrieved or manipulated.  Now that Database Management in [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) is available for [MySQL HeatWave](https://www.mysql.com/cloud/) instances, I discovered a slightly easier method for viewing these queries.

## Getting to Database Management

Let's talk about how you can view queries that were run against a MySQL HeatWave instance.

Log in to Oracle Cloud and click the hamburger menu.

![Oracle CLoud Hamburger Menu](/assets/images/2024/database-management-doc-store-queries/img_01.png)

In the search box that pops up, enter `database management` (1) and click the "MySQL HeatWave Database Management" link (2).

![Oracle CLoud Search Bar](/assets/images/2024/database-management-doc-store-queries/img_02.png)

This link will cover the "MySQL HeatWave fleet summary" page for the chosen compartment. On this page, you can view information about all the MySQL HeatWave instances in the compartment. You can also view a list of instances. In this case, we have a single instance used for [MySQL Shorts](https://www.youtube.com/playlist?list=PLWx5a9Tn2EvG4C90YFJ9eU61IpALeE0SN) demos. From this list, click the instance against which you will run Document Store commands. For this post, we will use the "MySQL Shorts" instance.

![Database Management MySQL HeatWave Fleet Summary](/assets/images/2024/database-management-doc-store-queries/img_03.png)

On the "MySQL Database Details" page, click the "Performance Hub" button.

![MySQL Database details page](/assets/images/2024/database-management-doc-store-queries/img_04.png)

On the "Performance Hub" page, you can see information about the chosen MySQL HeatWave instance. At the bottom of the page, you can see a list of queries executed against the instance. By default, the queries are sorted by 'Average statement latency'.

![Default sort order for performance hub](/assets/images/2024/database-management-doc-store-queries/img_05.png)

To see the most recent queries more easily, click the dropdown box (1) and select "Last seen" (2).

![Changing query sort order](/assets/images/2024/database-management-doc-store-queries/img_06.png)

We will now see the list of queries sorted by when they were executed in descending order (with the most recent queries on top).

![Sort order updated](/assets/images/2024/database-management-doc-store-queries/img_07.png)

## Running a Basic `find()` Command

We are going to connect to the same MySQL HeatWave instance using [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) and run the following command against a collection named `restaurant` in my database.

```shell
db.restaurant.find()
```

After running this command, the results will be in the console. When the command has been completed, head back to the Performance Hub for the instance we are using and click the "Refresh" button in the upper right corner.

![performacne Hub refresh button](/assets/images/2024/database-management-doc-store-queries/img_08.png)

When the data refreshes, we will see an item in the list that looks like the following.

![Sorted query list](/assets/images/2024/database-management-doc-store-queries/img_09.png)

If we click on the link for the query, a modal window will open up and show details about the query.

![Query Details](/assets/images/2024/database-management-doc-store-queries/img_10.png)

## More Complex Example

Let's try a more complex example. The Document Store command below will generate a slightly more involved query.

```shell
db.restaurant.find("cuisine = 'Pizza'").fields(['name', 'borough']).sort('name')
```

This command will fetch documents where the `cuisine` property is "pizza", but it only returns the `name` and `borough` properties and sorts the results by the `name` property.

After running this command, jump back to the "Performance Hub" and click "Refresh". We should see a query that resembles the following:

![Sorted Query list - new](/assets/images/2024/database-management-doc-store-queries/img_11.png)

When we click the link and look at the details, we will see something that resembles the following:

![Complex Query Details](/assets/images/2024/database-management-doc-store-queries/img_12.png)

Note that we do not see the full query. Rather, some of the values are parameterized (`?`). It would be nice if we could see what the parameter values were, but we can easily plug them in from our command if we want to execute the query manually. This method is a little better than the previous method I discussed because you can compare multiple queries more easily.

## Wrap-Up

The new Database management for MySQL HeatWave instances allows us to view details of queries executed against a specific HeatWave instance. Using this method, we can easily look at and compare queries generated when running MySQL Document Store commands. While more complex queries may have parameters listed in the query details instead of the values used, it is easier to see recent queries and compare their structure to other queries.

Photo by [Tima Miroshnichenko](https://www.pexels.com/photo/a-girl-sitting-in-front-of-a-table-between-database-wooden-drawer-6549629/)