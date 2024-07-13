---
title: Running MySQL Tests With GitHub Actions
date: 2023-10-04T06:00:00
image: 2023/github-actions-mysql-tests/header.jpg
tags: [ "MySQL", "Node.js", "TDD", "Better-Tests", "Testcontainers", "Knex", "GitHub-Actions" ]
related:
- /posts/2023/august/testing-mysql-apps-node/
- /posts/2023/august/testing-mysql-doc-store-apps-node/
- /posts/2023/august/managing-database-changes-knex/
- /posts/2023/september/mysql-testing-knex-testcontainers/
---

Recently, I have been talking about how to write and run tests for [Node.js](https://nodejs.org/en) code that interacts with a [MySQL](https://www.mysql.com/) database. These posts have included details on how to use third-party libraries such as [Testcontainers](https://testcontainers.com/) to run the tests in a clean database and [Knex](https://knexjs.org/) to manage database changes. Today, I will discuss how to automate running these tests using GitHub Actions when code is pushed to a repository.

## The Problem

We can write comprehensive tests that verify that code is doing what we expect to do, but if those tests are not run on a consistent basis, they lose their value.
While developers should be writing, updating, and running tests whenever they update code - and especially before those code changes are pushed out to a code repository - the truth is, we don't always follow those rules.
Sometimes, we need to implement a quick fix because of a critical bug, and testing may go to the wayside while trying to fix the issue.
Sometimes we are just lazy.
Sometimes, we may forget.
This can cause unnecessary downtime due to untested code making it to production and wreaking havoc.

## The Solution

Running tests should be a part of any continuous integration (CI) or continuous deployment (CD) workflow. We can manage this by using [GitHub Actions](https://github.com/features/actions). GitHub Actions allows us to automate our workflows to build, test, and deploy our code whenever there are changes to a repository - a push to a repo, a pull request being created, issues being filed, etc.

In this post, we will focus on the `push` event. In other words, we will configure GitHub Actions to run our tests whenever code is pushed to a particular branch.

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

Lastly, if you want to run the tests locally, run the following command:

```shell
npm install
```

The directory structure should resemble the image below when done with these steps.

![Directory Structure]({{ "2023/github-actions-mysql-tests/img_01.png" | imgurl }})

## Code Overview

I am not going to rehash the details of the Node.js code or how the tests are structured in this post. You can check out the [code overview](/posts/2023/september/mysql-testing-knex-testcontainers/#code-overview) and [deep dive](http://localhost:8181/posts/2023/september/mysql-testing-knex-testcontainers/#deep-dive-into-the-code) in a previous post.

I will talk about what is different in this code. Specifically, the `.github/workflows/node.test.yml` file.

## Defining Workflows

When using GitHub Actions, we define a workflow by creating a folder with the path `.github/workflows/file_name.yml`. In our case, the file is named `node.test.yml`. You can have multiple workflows in a given project that each perform different actions when different events are fired.

Here is what our workflow looks like. We will break this down section by section.

```yaml
name: Node.js Tests

on:
  push:
    branches: [ "main" ]

jobs:
  build:
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
```

### `name`

The `name` property is pretty easy to figure out. It is the name of our workflow.

### `on`

The `on` property defines what action will prompt the workflow to be executed. Here we are using `push` and the sub-property `["main"]` to indicate we want this workflow to be executed when a `push` is made to the branch named `main`. Note the `branches` value is an array, so we could add other branches to this value.

### `jobs`

Next, we use the `jobs` property to define what gets executed when the workflow is processed. Here we have a single `job` named `build`.

#### `runs-on`

The `runs-on` property defines the type of machine to run the job on. Here, we are using a GitHub-hosted runner with the latest version of Ubuntu.

#### `strategy.matrix`

Using the `strategy.matrix` property, we can set variables in a single job that will create multiple job runs based on the combination of those variables. Using a matrix, we can test our code on different language or operating system versions. In our case, we are running our tests using version `20.x` of Node.js.

#### `steps`

Next, we have the `steps` property, an array of processes we want to perform in our job. Some of these steps use pre-defined actions that are available through GitHub Actions.

1. The first step uses the pre-defined action named `checkout`. This step does what you think it does. It checks out the code from GitHub to the runner. In this case, it checks out the `main` branch.
2. The next step is named `Use Node.js ${{ matrix.node-version }}` and also uses a pre-defined action. This action is named `actions/setup-node@v3`. This action uses the values from `strategy.matrix` to set up the specified version(s) of Node.
3. The third step runs the command `npm ci`, which will install all the dependencies defined in our `package.json` file.
4. The fourth step runs the command `npm test`, the command we use to run our tests.

## Enabling the Workflow

The way we enable each workflow we define is pretty simple. We commit the YAML file(s) and then push these changes to the remote repo on GitHub. GitHub takes over from there.

## Running the Workflow

Our workflow will be run anytime code is checked into the `main` branch in our repository. You can view the progress of a running workflow or the history of workflows on the 'Actions' tab in GitHub.

![GitHub Actions Menu Link]({{ "2023/github-actions-mysql-tests/img_02.png" | imgurl }})

On the `Actions` page, we will see a list of all the workflows that have been run. We will see the commit message used when the code was pushed (1), the workflow name (2), the commit ID (3), and the person who committed the code (4).

![GitHub Actions List]({{ "2023/github-actions-mysql-tests/img_03.png" | imgurl }})

We can see details about the run if we click the commit message. We can see the status (1), how long the run took (2), and details about the workflow itself (3).

![GitHub Actions Workflow Information]({{ "2023/github-actions-mysql-tests/img_04.png" | imgurl }})

If we click the `1 Job completed` link, we will see a list of jobs that were completed. In our case, we will see one named 'build 20.x'. When we click the `build 20.x` link, we can see fine details about the workflow.

![GitHub Actions Workflow Run Details]({{ "2023/github-actions-mysql-tests/img_05.png" | imgurl }})

This view lists everything done when running the workflow, including setting up and breaking down the runner. Since we are concerned about the tests running successfully, we should focus on the details under `Run npm test`.

```text
> github_actions_testcontainers@1.0.0 test
> node --test

TAP version 13
# Subtest: Testing Application
    # Subtest: Container should be running
    ok 1 - Container should be running
      ---
      duration_ms: 89265.867539
      ...
    # Subtest: Testing Migration
        # Subtest: User table exists
        ok 1 - User table exists
          ---
          duration_ms: 7.070651
          ...
        # Subtest: User Type table exists
        ok 2 - User Type table exists
          ---
          duration_ms: 4.415232
          ...
        1..2
    ok 2 - Testing Migration
      ---
      duration_ms: 12.363089
      ...
    # Subtest: Testing Seed
        # Subtest: User data exists
        ok 1 - User data exists
          ---
          duration_ms: 15.890114
          ...
        # Subtest: User Type data exists
        ok 2 - User Type data exists
          ---
          duration_ms: 25.731585
          ...
        1..2
    ok 3 - Testing Seed
      ---
      duration_ms: 42.748207
      ...
    # Subtest: Testing User Repo
        # Subtest: Can add user
        ok 1 - Can add user
          ---
          duration_ms: 23.006665
          ...
        1..1
    ok 4 - Testing User Repo
      ---
      duration_ms: 24.088673
      ...
    1..4
ok 1 - Testing Application
  ---
  duration_ms: 89618.999211
  ...
1..1
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 90219.293716
```

The information above shows the individual output from running each of our tests and a summary at the end. We can see that 10 tests were run, and 10 passed. If any tests fail, we will see indications of that in the `Actions` tab and an email will be sent.

Here is what the details look like in the GitHub web interface.

![GitHub Actions Workflow Failure]({{ "2023/github-actions-mysql-tests/img_06.png" | imgurl }})

When we click through and look at the details of the job, we will see the following:

```text
> github_actions_testcontainers@1.0.0 test
> node --test

TAP version 13
# Subtest: Testing Application
    # Subtest: Container should be running
    ok 1 - Container should be running
      ---
      duration_ms: 24339.372971
      ...
    # Subtest: Testing Migration
        # Subtest: User table exists
        ok 1 - User table exists
          ---
          duration_ms: 4.348173
          ...
        # Subtest: User Type table exists
        ok 2 - User Type table exists
          ---
          duration_ms: 2.615384
          ...
        1..2
    ok 2 - Testing Migration
      ---
      duration_ms: 7.682252
      ...
    # Subtest: Testing Seed
        # Subtest: User data exists
        ok 1 - User data exists
          ---
          duration_ms: 5.204167
          ...
        # Subtest: User Type data exists
        ok 2 - User Type data exists
          ---
          duration_ms: 8.624846
          ...
        1..2
    ok 3 - Testing Seed
      ---
      duration_ms: 14.590808
      ...
    # Subtest: Testing User Repo
        # Subtest: Can add user
        not ok 1 - Can add user
          ---
          duration_ms: 12.525421
          location: 'file:///home/runner/work/github_actions_testcontainers/github_actions_testcontainers/test/knex-demo.test.js:63:17'
          failureType: 'testCodeFailure'
          error: |-
            Expected values to be strictly equal:
            
            3 !== 4
            
          code: 'ERR_ASSERTION'
          name: 'AssertionError'
          expected: 4
          actual: 3
          operator: 'strictEqual'
          stack: |-
            TestContext.<anonymous> (file:///home/runner/work/github_actions_testcontainers/github_actions_testcontainers/test/knex-demo.test.js:74:20)
            process.processTicksAndRejections (node:internal/process/task_queues:95:5)
            async Test.run (node:internal/test_runner/test:632:9)
            async TestContext.<anonymous> (file:///home/runner/work/github_actions_testcontainers/github_actions_testcontainers/test/knex-demo.test.js:63:9)
            async Test.run (node:internal/test_runner/test:632:9)
            async TestContext.<anonymous> (file:///home/runner/work/github_actions_testcontainers/github_actions_testcontainers/test/knex-demo.test.js:58:5)
            async Test.run (node:internal/test_runner/test:632:9)
            async startSubtest (node:internal/test_runner/harness:208:3)
          ...
        1..1
    not ok 4 - Testing User Repo
      ---
      duration_ms: 13.361816
      location: 'file:///home/runner/work/github_actions_testcontainers/github_actions_testcontainers/test/knex-demo.test.js:58:13'
      failureType: 'subtestsFailed'
      error: '1 subtest failed'
      code: 'ERR_TEST_FAILURE'
      stack: |-
        async TestContext.<anonymous> (file:///home/runner/work/github_actions_testcontainers/github_actions_testcontainers/test/knex-demo.test.js:58:5)
      ...
    1..4
not ok 1 - Testing Application
  ---
  duration_ms: 24628.972343
  location: 'file:///home/runner/work/github_actions_testcontainers/github_actions_testcontainers/test/knex-demo.test.js:8:1'
  failureType: 'subtestsFailed'
  error: '1 subtest failed'
  code: 'ERR_TEST_FAILURE'
  ...
1..1
# tests 10
# suites 0
# pass 7
# fail 3
# cancelled 0
# skipped 0
# todo 0
# duration_ms 25010.234841
Error: Process completed with exit code 1.
```

Note that it shows 10 tests were run, 7 passed, and 3 failed.

If you have been following along in this series, remember that our tests used Testcontainers as the source for our MySQL database. You might have noticed that we did not accommodate this in our code or YAML file. This is because, by default, the GitHub-hosted runners already have Docker running, so we do need to take any special steps to get our tests to run correctly.

## The Wrap-Up

CI/CD workflows allow for automated code builds and deployment. Part of those processes should be running tests to verify the code is functioning as expected. With GitHub actions, we can set up workflows to not only build and deploy but to run tests as well. Using GitHub Actions allows us to run our tests using the same process and even the same command to run our tests every time code is pushed to our repo.

Photo by <a href="https://unsplash.com/@jakobowens1?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Jakob Owens</a> on <a href="https://unsplash.com/photos/CiUR8zISX60?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
