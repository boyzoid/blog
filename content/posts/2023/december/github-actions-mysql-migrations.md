---
title: Applying Database Migrations in MySQL HeatWave With GitHub Actions
date: 2023-12-03T06:00:00
image: 2023/github-actions-mysql-migrations/header.jpg
tags: [ "MySQL", "Node.js", "Database-Migrations", "Knex", "GitHub-Actions" ]
related:
- /posts/2023/august/testing-mysql-apps-node/
- /posts/2023/august/testing-mysql-doc-store-apps-node/
- /posts/2023/august/managing-database-changes-knex/
- /posts/2023/september/mysql-testing-knex-testcontainers/
- /posts/2023/october/github-actions-mysql-tests/
---

In a [previous post](/posts/2023/october/github-actions-mysql-tests/), I talked about how we can leverage [GitHub Actions](https://github.com/features/actions) to automate running tests whenever a commit is made to a specific branch of a GitHub repository. In this post, we will discuss one way we can harness GitHub Actions to apply database migration scripts to a [MySQL HeatWave Database Service](https://www.oracle.com/mysql/) instance running in [Oracle Cloud Infrastructure](https://www.oracle.com/cloud/) (OCI).

## The Problem

When using a continuous integration (CI)/continuous deployment (CD) pipeline, we need a way to apply any database changes needed to support code updates. In [Node.js](https://nodejs.org/) applications, we can use [Knex.js](https://knexjs.org/) to apply these changes and GitHub Actions to run them. There is one issue, however. By default, MySQL HeatWave instances are not open to the internet.

## The Solution

There are a few ways to get around these connectivity limitations. In this post, we will discuss using [OpenVPN](https://openvpn.net/) to set up a VPN connection to our MySQL HeatWave instance and apply the database changes all within GitHub Actions.

**Note:** *Before continuing, you will need to set up a MySQL HeatWave instance and an OpenVPN compute instance by following the steps in [this post](/posts/2023/april/mysql-database-access-openvpn/).*

## Prerequisites

Before continuing, make sure you have done the following:

* Follow the instructions in [this post](/posts/2023/april/mysql-database-access-openvpn/) to set up a MySQL HeatWave instance and configure OpenVPN to connect to the instance.

## Getting the Code

To get the code in this demo, head over to [this GitHub repo](https://github.com/boyzoid/github_actions_testcontainers) and clone it. This code is from the demo we discussed in this [post](/posts/2023/september/mysql-testing-knex-testcontainers/). I moved it to a separate repo to prevent these tests from running when I am working on different demos.

The command to clone the repo from the command line over SSH is:

```shell
git clone git@github.com:boyzoid/github_actions_testcontainers.git
```

Next, change the directory for this demo.

```shell
cd github_actions_testcontainers
```

Lastly, if you want to run the included tests locally, run the following command:

```shell
npm install
```

The directory structure should resemble the image below when done with these steps.

![Directory Structure](/assets/images/2023/github-actions-mysql-migrations/img_01.png)

## Code Overview

I will not rehash the details of the Node.js code or how the tests are structured in this post. You can check out the [code overview](/posts/2023/september/mysql-testing-knex-testcontainers/#code-overview) and [deep dive](http://localhost:8181/posts/2023/september/mysql-testing-knex-testcontainers/#deep-dive-into-the-code) in a previous post.

I will talk about what is different in this code. Specifically, the `.github/workflows/node.test.yml` file.

## Defining Workflows

When using GitHub Actions, we define a workflow by creating a folder with the path `.github/workflows/file_name.yml`. In our case, the file is named `node.test.yml`. You can have multiple workflows in a project, each performing different actions when different events are fired.

Here is what our workflow looks like. We will break this down section by section.

```yaml
name: Node.js Tests and Deployment

on:
  push:
    branches: [ "main" ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x]
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test

  migration:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20.x
      - run: npm ci
      - name: Install OpenVPN
        run: sudo apt install -y openvpn openvpn-systemd-resolved
      - name: Write VPn Config File
        env:
          MY_OVPN: ${{secrets.OVPN_FILE}}
          CI: true
        shell: bash
        run: echo "$MY_OVPN" >> .github/workflows/client.ovpn
      - name: Connect to VPN
        uses: kota65535/github-openvpn-connect-action@v2.1.0
        with:
          config_file: .github/workflows/client.ovpn
          username: ${{ secrets.OVPN_USERNAME }}
          password: ${{ secrets.OVPN_PASSWORD }}
      - name: Create .env file
        env:
          DB_USER: ${{secrets.DB_USER}}
          DB_PASSWORD: ${{secrets.DB_PASSWORD}}
          DB_HOST: ${{secrets.DB_HOST}}
          DB_PORT: ${{secrets.DB_PORT}}
          DB_SCHEMA: ${{secrets.DB_SCHEMA}}
        run: |
          touch .env
          echo DB_USER=${DB_USER} >> .env
          echo DB_PASSWORD=${DB_PASSWORD} >> .env
          echo DB_HOST=${DB_HOST} >> .env
          echo DB_PORT=${DB_PORT} >> .env
          echo DB_SCHEMA=${DB_SCHEMA} >> .env
      - name: Run Migrations
        run: node deploy/migrations.js
```

### `name`

The `name` property is pretty easy to figure out. It is the name of our workflow.

### `on`

The `on` property defines what action will prompt the workflow to be executed. Here we use `push` and the sub-property `["main"]` to indicate we want this workflow executed when a `push` is made to the branch named `main`. Note the `branches` value is an array so that we could add other branches to this value.

### `jobs`

Next, we use the `jobs` property to define what gets executed when the workflow is processed. Here we have two `jobs` named `test` and `migration`. You can review details of the `test` job [here](/posts/2023/october/github-actions-mysql-tests/#jobs. We will focus on the `migration` job below.

### `needs`

The `needs` property defines what jobs need to be completed without errors before we can run the current job. To run the `migration` job, the `test` job must first be completed without errors.

#### `runs-on`

The `runs-on` property defines the type of machine to run the job on. Here, we are using a GitHub-hosted runner with the latest version of Ubuntu.

#### `steps`

Next, we have the `steps` property, an array of processes we want to perform in our job. Some of these steps use pre-defined actions that are available through GitHub Actions.

1. The first step uses the pre-defined action named `checkout`. This step does what you think it does. It checks out the code from GitHub to the runner. In this case, it checks out the `main` branch.
2. The second step will install Node on the runner. In this case, the latest version of Node 20 will be used.
3. The next step executes a command, `npm ci` that will install the necessary packages on the runner.
4. The fourth step, 'Install OpenVPN', executes a command to install the OpenVPN client on the runner.
5. Next, we have a step that outputs the value of a GitHub Secret to an OpenVPN config file. This variable contains the exact content of the file I use on my local machine to connect to the VPN I use for accessing my MySQL HeatWave instances.
6. The sixth step uses the file we created in step 5 to connect to the VPN and uses the `OVPN_USERNAME` and `OVPN_PASSWORD` secrets as the username and password.
7. This step might seem a bit out of place, but because the runners used for GitHub actions don't support environment variables, we need to create a `.env` file with the connection information for our database. The user, password, host address, port, and schema are all stored in GitHub Secrets.
8. The final step is executing a Node command to run the migrations.

## Enabling the Workflow

The way we enable each workflow we define is pretty simple. We commit the YAML file(s) and then push these changes to the remote repo on GitHub. GitHub takes over from there.

## Running the Workflow

Our workflow will be run anytime code is checked into the `main` branch in our repository. You can view the progress of a running workflow or the history of workflows on the 'Actions' tab in GitHub.

![GitHub Actions Menu Link](/assets/images/2023/github-actions-mysql-migrations/img_02.png)

Here is the table structure for the `migration_demo` schema before we made any commits to the repo.

![Table Structure for migration_demo](/assets/images/2023/github-actions-mysql-migrations/img_03.png)

On the `Actions` page, we will see a list of all the workflows that have been run. We will see the commit message used when the code was pushed (1), the workflow name (2), the commit ID (3), and the person who committed the code (4).

![GitHub Actions List](/assets/images/2023/github-actions-mysql-migrations/img_04.png)

We can see details about the run if we click the commit message. We can see the status (1), how long the run took (2), and details about the workflow itself (3).

![GitHub Actions Workflow Information](/assets/images/2023/github-actions-mysql-migrations/img_05.png)

If we click on the `migration` job, we can see details about the steps in the job. This view is where you can find information about failures if any step fails.

![GitHub Actions Step Information](/assets/images/2023/github-actions-mysql-migrations/img_06.png)

Now that our jobs have been completed successfully, let's look at the table structure again.

![Table Structure for post-migration](/assets/images/2023/github-actions-mysql-migrations/img_07.png)

We see that there are now four tables. The two tables we defined in our migration script and two others that Knex uses to track which migrations have been processed.

## Wrap-up

Continuous integration and continuous deployment processes allow for seamless deployments of code. We can also automate applying database changes during these deployments by using CI/CD tools, such as GitHub Actions, in conjunction with database migration tools, such as Knex.

Photo by <a href="https://unsplash.com/@cgbriggs19?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Chris Briggs</a> on <a href="https://unsplash.com/photos/flock-of-birds-flying-under-blue-sky-during-daytime-V72Hk6LjjjI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
  
