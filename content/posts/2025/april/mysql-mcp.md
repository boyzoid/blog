---
title: Connecting a MySQL Database to an AI Client Using MCP
date: 2025-04-09T06:00:00
image: 2025/mysql-mcp/header.jpg
tags: [ "MySQL", "AI", "MCP" ]
image-path: 2025/mysql-mcp/
series: mysql-ai-mcp
description: In this post, we discuss creating a Model Context Protocol (MCP) server that allows an AI client to interact with a MySQL database.
---

For quite some time, AI has been all the rage. Last year, we saw the introduction of the Model Context Protocol (MCP). MCP servers allow AI clients like ChatGPT and Claude to interact with external systems, such as databases, APIs, and other services. This post will show you how to create a Model Context Protocol (MCP) server that allows an AI client to interact with a MySQL database.

## What is MCP?

Before we get started, let's take a moment to understand MCP. The Model Context Protocol (MCP) is a protocol that allows AI clients to interact with external systems in a structured way. It allows AI clients to send requests to external systems and receive responses in a standardized format.

MCP can also provide large language models (LLMs) with a more specific context for your organization or project. For example, by connecting an AI client to a MySQL database, we can use the client to analyze the data structure and provide insights and recommendations based on the data.

Several different pieces can make up an MCP server. This post will focus on creating a "tool" that allows the AI client to query a MySQL database. The [documentation](https://modelcontextprotocol.io/docs/concepts/tools) provides more details about tools. In future posts, I will cover additional functionality such as [resources](https://modelcontextprotocol.io/docs/concepts/resources) and [prompts](https://modelcontextprotocol.io/docs/concepts/prompts). For more information, check out this [link](https://modelcontextprotocol.io/).

## The Setup

The database I am going to use for this demo is one I use to manage a golf league. I restored a backup of this database to a [MySQL sandbox](/posts/2024/june/mysql-shell-sandboxes/) I created for this demo. I also sanitized the user data to remove personal information and replaced it with fake data (except for mine).

Several SDKs are available to build an MCP server. For this demo, we will use the [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk).

You can use any AI client that supports MCP, but I will use Claude Desktop for this demo. To follow along, you can download the [Claude Desktop](https://claude.ai/download) application.

## Setting up the NodeJS Application

Rather than listing each of the modules I installed to build this MCP server, I will provide the contents of my `packages.json` file.

```json
{
  "name": "mcp-mysql-server",
  "version": "0.0.1",
  "description": "MCP server connecting to MySQL database for data analysis",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "author": "Scott Stroz",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "dotenv": "^16.3.1",
    "mysql2": "^3.6.0",
    "node-sql-parser": "^5.3.8",
    "zod": "^3.24.2"
  }
}
```

The modules we will be using are:
- `@modelcontextprotocol/sdk`: The Model Context Protocol SDK for building the MCP server.
- `dotenv`: A module for loading environment variables from a `.env` file.
- `mysql2`: A MySQL client for Node.js that supports promises and async/await.
- `node-sql-parser`: A SQL parser for Node.js that can parse SQL queries and return an abstract syntax tree (AST).
- `zod`: A TypeScript-first schema declaration and validation library.

If you want to follow along, create a new directory, copy the JSON above into a file named `package.json`, and run the following command to install the dependencies:

```shell
npm install
```

## Building The MCP Server

With Node set up, we can start building the MCP server. Create a new file named `index.js` and copy the following code into it (don't worry, I go into more detail for each section below):

```javascript
import {McpServer, ResourceTemplate} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import SqlParser from 'node-sql-parser';
import dotenv from 'dotenv'
import mysql from "mysql2/promise";
import {z} from "zod";

// Load environment variables
dotenv.config();

// Database connection configuration
const dbConfig = {
    host: process.env.MYSQL_DB_HOST || 'localhost',
    user: process.env.MYSQL_DB_USER || 'root',
    password: process.env.MYSQL_DB_PASSWORD || '',
    database: process.env.MYSQL_DB_NAME || 'mysql',
    port: process.env.MYSQL_DB_PORT ? parseInt(process.env.MYSQL_DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Create a connection pool
const pool = await mysql.createPool(dbConfig)

const parser = new SqlParser.Parser()

// Initialize the server
const server = new McpServer(
    {
        id: 'golf_league_sage',
        name: 'Golf League Sage',
        description: 'MySQL MCP server for Golf League Manager',
        version: '0.0.1'
    },
    {
        capabilities: {
            tools: {}
        }
    }
)

server.tool(
    "execute_query",
    {sql: z.string().describe("MySQL query to execute")},
    async ({sql}) => {
        try {
            return await executeQuery(sql)
        }
        catch (e) {
            console.error(e)
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Error executing query',
                    },
                ],
                isError: true,
            };
        }
    }
)

const executeQuery = async (sql)=>{
    const queryTypes = await getQueryTypes(sql)
    const isMutatableQuery = queryTypes.some(type => ['insert', 'update', 'delete', 'drop', 'truncate', 'rename'].includes(type))
    if(isMutatableQuery){
        return {
            content: [
                {
                    type: 'text',
                    text: 'Error: Only SELECT, SHOW, or DESCRIBE statements are allowed.',
                },
            ],
            isError: true,
        };
    }
    else{
        const conn = await pool.getConnection()
        await conn.query('SET SESSION TRANSACTION READ ONLY')
        await conn.beginTransaction()
        try{
            const [rows] = await conn.query(sql)
            await conn.rollback()
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(rows, null, 2),
                    },
                ],
                isError: false,
            }
        }
        catch(e){
            await conn.rollback()
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Error executing query',
                    },
                ],
                isError: true,
            }
        }
        finally {
            if(conn){
                conn.release()
            }
        }
    }
}

const getQueryTypes = async (sql) => {
    try{
        const ast = parser.astify(sql, {database: 'mysql'})
        const statements = Array.isArray(ast) ? ast : [ast]
        return statements.map(stmt => stmt.type?.toLowerCase() ?? 'unknown');
    }
    catch(e){
        throw new Error(`Parsing failed: ${e.message}`);
    }
}

async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

runServer().catch(console.error);
```

### Importing the Required Modules

The first block of code should be self-explanatory. We import the required modules and load the environment variables from the `.env` file.

```javascript
import {McpServer, ResourceTemplate} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import SqlParser from 'node-sql-parser';
import dotenv from 'dotenv'
import mysql from "mysql2/promise";
import {z} from "zod";

// Load environment variables
dotenv.config();
```

### Database Connection Configuration

Next, we need to configure the database connection. We are using the `mysql2` module to create a connection pool. The connection pool allows us to reuse database connections, improving performance.

```javascript
// Database connection configuration
const dbConfig = {
    host: process.env.MYSQL_DB_HOST || 'localhost',
    user: process.env.MYSQL_DB_USER || 'root',
    password: process.env.MYSQL_DB_PASSWORD || '',
    database: process.env.MYSQL_DB_NAME || 'mysql',
    port: process.env.MYSQL_DB_PORT ? parseInt(process.env.MYSQL_DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
}
// Create a connection pool
const pool = await mysql.createPool(dbConfig)

const parser = new SqlParser.Parser()
```

The connection information, host, user, password, database, and port name are provided as environment variables. The remaining configuration options define the connection pool. Next, we create a connection pool using the `mysql.createPool()` method. Finally, we create an instance of the SQL parser that we will use in a bit to parse a SQL query.

### Initialize the MCP Server

Next, we need to initialize the MCP server. We create a new instance of the `McpServer` class and pass it to the server configuration.

```javascript
// Initialize the server
const server = new McpServer(
    {
        id: 'golf_league_sage',
        name: 'Golf League Sage',
        description: 'MySQL MCP server for Golf League Manager',
        version: '0.0.1'
    }
)
```

### Creating the Tool

In the next bit of code, we create a tool that will be used to execute SQL queries. The tool is defined using the `server.tool()` method. The first argument is the tool's name, and the second specifies the parameters the tool expects. We use Zod to verify that the value passed as `sql` is a string (we'll validate it as a query in a bit). The third argument is the function that is called when the tool is executed.

```javascript
server.tool(
    "execute_query",
    {sql: z.string().describe("MySQL query to execute")},
    async ({sql}) => {
        try {
            return await executeQuery(sql)
        }
        catch (e) {
            console.error(e)
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Error executing query',
                    },
                ],
                isError: true,
            };
        }
    }
)
```

Breaking down the function executed when the tool is invoked, we see that the `sql` parameter is passed to the `executeQuery()` function. If an error occurs, we catch it and return an error message. The return values from a tool must adhere to a specific format. The `content` property is an array of objects that define the content to be returned. The `isError` property is a boolean that indicates whether an error occurred.

### Executing the Query

The `executeQuery()` function is where the magic happens. The first thing we do is check the type of query that was passed to the function. We use the `getQueryTypes()` function to parse the query and return an abstract syntax tree (AST). We then check if the query is mutating (e.g., `INSERT`, `UPDATE`, `DELETE`, etc.). If it is, we return an error message.

If it is not a mutating query, we create a new connection to the database and execute the query. We first use the `conn.query()` method to set the session transaction to `READ ONLY`. This step is another safeguard to protect from running a query that can change the schema, update data, or delete data. Next, we begin a new transaction. Next, we execute the query and return the results. If an error occurs, we catch it and return an error message. In our `finally` block, we release the connection back to the pool.

```javascript
const executeQuery = async (sql)=>{
    const queryTypes = await getQueryTypes(sql)
    const isMutatableQuery = queryTypes.some(type => ['insert', 'update', 'delete', 'drop', 'truncate', 'rename'].includes(type))
    if(isMutatableQuery){
        return {
            content: [
                {
                    type: 'text',
                    text: 'Error: Only SELECT, SHOW, or DESCRIBE statements are allowed.',
                },
            ],
            isError: true,
        };
    }
    else{
        const conn = await pool.getConnection()
        await conn.query('SET SESSION TRANSACTION READ ONLY')
        await conn.beginTransaction()
        try{
            const [rows] = await conn.query(sql)
            await conn.rollback()
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(rows, null, 2),
                    },
                ],
                isError: false,
            }
        }
        catch(e){
            await conn.rollback()
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Error executing query',
                    },
                ],
                isError: true,
            }
        }
        finally {
            if(conn){
                conn.release()
            }
        }
    }
}
```

### Parsing the Query

The next bit of code is responsible for parsing the SQL query. We use the `node-sql-parser` module to parse the SQL query and return an AST. The `getQueryTypes()` function takes a SQL query as input and returns an array of query types. If the parsing fails, we throw an error with the message.

```javascript
const getQueryTypes = async (sql) => {
    try{
        const ast = parser.astify(sql, {database: 'mysql'})
        const statements = Array.isArray(ast) ? ast : [ast]
        return statements.map(stmt => stmt.type?.toLowerCase() ?? 'unknown');
    }
    catch(e){
        throw new Error(`Parsing failed: ${e.message}`);
    }
}
```

### Starting the Server

Finally, we need to run the server. We create a new instance of the `StdioServerTransport` class and pass it to the `server.connect()` method. This method starts the server and listens for incoming requests.

```javascript
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

runServer().catch(console.error);
```

## Testing the MCP Server

There are a few ways we can test whether the MCP server is functioning as we expect. One is to create an MCP client, which I will cover in another post. Another is to use the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector). The MCO inspector is a browser-based tool that can help us test our MCP server.

To start the inspector, run the following command in a terminal window:

```shell
npx @modelcontextprotocol/inspector node index.js
```

When prompted, install the necessary packages.

![MCP Inspector start up script]({% imgPath image-path, "img_1.png" %} "MCP Inspector start up script")

Open a browser and navigate to the URL provided in the terminal window. You will see a screen similar to the image below. Before we can run any tests, we need to add some environment variables. Click the 'Environment Variables' button to open the environment variables panel.

![MCP Inspector environment variables]({% imgPath image-path, "img_6.png" %} "MCP Inspector environment variables")

With the environment variables panel open, click the 'Add Environment Variable' button (1) to add the environment variables. You will need to add environment variables for `MYSQL_DB_HOST` (2), `MYSQL_DB_USER` (3), `MYSQL_DB_PASSWORD` (4), `MYSQL_DB_NAME` (5), and `MYSQL_DB_PORT` (6).

![MCP Inspector add environment variables]({% imgPath image-path, "img_5.png" %} "MCP Inspector add environment variables")

With our environment variables defined, we can now connect to our MCP server by clicking the 'Connect' button.

![MCP Inspector web interface]({% imgPath image-path, "img_2.png" %} "MCP Inspector web interface")

Once connected, click the 'List Tools' button (1) to see the list of tools available. You should see the `execute_query` tool (2) we created earlier.

![MCP Inspector List Tools]({% imgPath image-path, "img_3.png" %} "MCP Inspector List Tools")

Next, click the tool named `execute_query` (1) to see its details. You should see the parameters we defined for the tool, where I entered `show tables` (2). Click the "Execute" button (3) to execute the tool.

![MCP Inspector invoke tool]({% imgPath image-path, "img_4.png" %} "MCP Inspector invoke tool")

If everything is working correctly, you should see the query results in the 'Tool Result' panel.

![MCP Inspector tool result]({% imgPath image-path, "img_7.png" %} "MCP Inspector tool result")

## Hooking it Up to Claude

Now that we know our MCP server is working as expected, we can hook it up to Claude. We need to add the MCP server to the `claude_desktop_config.json` file to do this. The configuration file is typically located at:

- **macOS:** ~/Library/Application Support/Claude/claude_desktop_config.json
- **Windows:** %APPDATA%\Claude\claude_desktop_config.json

The contents of my version of this file are below.

```json
{
  "mcpServers": {
    "golf_league_sage": {
      "command": "/path/to/node",
      "args": ["/path/to/index.js"],
      "env": {
        "MYSQL_DB_HOST": "127.0.0.1",
        "MYSQL_DB_PORT": "4487",
        "MYSQL_DB_USER": "root",
        "MYSQL_DB_PASSWORD": "some_other_password",
        "MYSQL_DB_NAME": "golf_league_manager"
      }
    }
  }
}
```

The `mcpServers` property is an object that contains the configuration for the MCP server. My MCP server is named `golf_league_sage`. The `command` property is the path to the Node.js executable and the `args` property is an array of arguments to pass to the Node.js executable. In this instance, we pass the path to `index.js` in. The `env` property is an object that contains the environment variables needed to connect to MySQL.

Save the file and restart Claude. If you do not see any error messages, you should be good to go. The tools connected to Claude can be seen by clicking the Tools button.

![Claude MCP tools]({% imgPath image-path, "img_8.png" %} "Claude MCP tools")

This will open a window and list all the tools connected to Claude. You should see the `execute_query` tool we created earlier.

![Claude MCP tools list]({% imgPath image-path, "img_9.png" %} "Claude MCP tools list")

## Let Claude Do Its Thing

You can start asking Claude questions about your database. For example, I asked Clause, "What can you tell me about the golf league database?". You know Claude starts using the tool when you see this pop-up:

![Claude MCP tool in use]({% imgPath image-path, "img_10.png" %} "Claude MCP tool in use")

Click 'Allow for this Chat' to allow Claude to use the tool. You may see Claude trying different queries to get the necessary information. Once it has the information, it will display the results in the chat window.

Here is what Claude had to say about my database:

>Based on the exploration of the database, here's what I can tell you about the golf league database:
Golf League Database Overview
This is a comprehensive golf league management system with the following key components:
>1. League and Season Structure

>The database manages multiple golf leagues (currently includes "Locust Hill Summer Golf League" and "Frederick County Public Schools Golf League")
Each league can have multiple seasons (like "Summer 2018", "Fall 2023")
Seasons have configurable parameters like fees, points systems, handicap rules, and team structures

>2. User Management

> - The system has 614 registered users (golfers)
> - Users have profiles with contact information, handicaps, and payment status
> - Users can be assigned roles and participate in different leagues/seasons


>3. Team Structure

> - There are 857 teams in the database
> - Teams are organized into divisions
> - Teams have names, points, and ratings
> - Teams can use substitute players (with configurable rules)

> 4. Match System

> - The database contains 6,729 matches
> - Matches are between home and away teams
> - Scoring is tracked by holes and total match points
> - System accommodates various match types and scoring systems

>5. Course Management

> - Multiple golf courses are tracked (Glade Valley, Musket Ridge, Clustered Spires, Locust Hill)
> - Courses have complete address and contact information
> - Individual holes are tracked with par, handicap, and grouping information

>6. Additional Features

> - Handicap tracking and history
> - Contest scoring for special events
> - Substitution tracking and rules
> - Weekly schedules and scoring
> - Comments and news items
> - Payment tracking

>The database is well-structured for managing all aspects of golf league operations, including scheduling, scoring, player management, and season organization. The relational structure allows for complex queries about player performance, team standings, and match history.

As you can see, Claude provided a detailed overview of the database and its structure. But, it is not just the structure that we can ask Claude about. To have some fun and test Claude's abilities, I asked, "Based on past performance, what do you predict Scott Stroz will shoot in the first match of the 2025 season?" Here is the response I received:

>Based on the data I've gathered, I can now make a prediction for what Scott Stroz might shoot in the first match of 2025. Here's my analysis:
>Scott Stroz has a consistent playing history in the golf league at Locust Hill Golf Course.

>Looking at his recent performance:

>First Match Performance Pattern:

> - First match of Summer 2024: 45
> - First match of Summer 2023: 57
> - First match of Summer 2022: 52
> - First match of Summer 2021: 57
> - First match of Summer 2020: 54
> - Average first match score: 51 (approximately)

>Recent Performance Trends:

> - 2024 season average: 48.06
> - 2023 season average: 47.58
> - 2022 season average: 46.87
> - 2021 season average: 46.94
> - 2020 season average: 46.62

>Current Form (Most Recent Matches in 2024):

>Latest scores: 46, 43, 44, 45, 56
>Current handicap: Started at 7-8 and ended the 2024 season at 8

>Historical Pattern:

> - Scott typically scores higher (worse) in his first match of the season compared to his season average
> - The difference is approximately 3-5 strokes above his season average
> - His 2024 performances showed some inconsistency (scores ranging from 43 to 56)

>Based on these factors, my prediction for Scott Stroz's score in the first match of 2025:
>Prediction: 51

>This prediction accounts for:

> - His historical tendency to score higher in season-opening matches
> - His recent scoring trends showing a slight increase in average scores (2024 average was higher than previous years)
> - The typical "rust factor" that affects most golfers in their first competitive round of a new season
> - His consistent handicap of 7-8, suggesting his skill level remains relatively stable

>Keep in mind this is an estimate based on historical patterns, and actual performance could vary due to factors like weather conditions, course setup, and Scott's off-season practice regimen.

This is pretty impressive! *(what Claude did, not my golf scores)* Claude was able to analyze the data and provide a prediction based on past performance. What impressed me the most was that I had not provided *any* information about my database schema. Claude identified the tables necessary to query the database to get the required data and then analyzed that data. I also like that Claude threw in a disclaimer at the end.

As much as I hate to admit it, Claude was spot on with the prediction. I shot a 51 in the first match of the season. I have asked Claude many other questions about the data, and the accuracy has been astounding.

## A Word of Caution

This has been a fun exercise, but I want to caution you about using this in a production environment. ***The code provided is for demonstration purposes only and should not be used in a production environment.***

One reason this demo can cause issues is that Claude shows the queries it is running in the chat window. This can be a security risk, as it can expose sensitive information about your database schema and data.

That said, I think this is a great way to help developers become familiar with the database schema and data when they first join a project.

## Wrap Up

AI tools like Claude can make life easier for us. However, without domain-specific context, the results can often be wrong. Using an MCP server can provide that domain-specific context to the AI client. This allows us to use the AI client to provide more accurate results for our specific use case. I'll cover other MCP features, such as resources and prompts, in future posts, but for now, I am going to analyze my golf game a little more.


Photo by <a href="https://unsplash.com/@steve_j?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Steve Johnson</a> on <a href="https://unsplash.com/photos/a-computer-circuit-board-with-a-brain-on-it-_0iV9LmPDn0?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>