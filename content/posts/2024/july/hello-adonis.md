---
title: Hello, Adonis!
date: 2024-07-10T06:00:00
image: /assets/images/2024/hello-adonis/header.jpg
tags: [ "AdonisJs", "Vue", "Lucid", "Inertia", "EdgeJS" ]
series: golf-league-rewrite

---

For those who do not know me very well, I am an avid golfer. I have managed a local golf league for the last 15 years. During that time, the league has become so popular that we had to split the league in two and have half of the golfers play on Tuesday night and the other half on Thursday. Quite a few years ago, I wrote a web application to help me manage the league. The web app started showing its age, and I decided it was time to rewrite it from scratch. I also decided to bring you all along for the ride.

## The Problem

The web app is old. It still works, but it runs on an older tech stack. The code was originally written in [ColdFusion] (https://www.adobe.com/products/coldfusion-family.html) using [FW/1] (https://framework-one.github.io/), and it runs on [Lucee] (https://www.lucee.org/). It also uses Bootstrap 3 for the UI. Lastly, because I often had to add features or address issues quickly, the database schema needs some attention, too. Merely fixing these issues was not enough, I needed a complete rebuild.

I will not lie; this is not the first time I have decided to rewrite the app. Each of those other attempts got derailed for one reason or another. I figured talking about the process and decisions I have made would keep me on track.

## The Solution

Two people I respect immensely (and consider my best friends) are [Ray Camden](https://www.raymondcamden.com/) and [Todd Sharp](https://recursive.codes/). We often share new products, libraries, modules, etc. In the last few years, I have become a big fan of [Node.js](https://nodejs.org/en) and started looking for a solution in that space. A while back, one of them mentioned [AdonisJS](https://adonisjs.com/), which looked appealing. I played around with AdonisJS for a little while and enjoyed it. I made a mental note that when I finally rewrote the golf league application, I would give it a closer look.

## Hello, AdonisJs!

This past weekend, I decided to start the rewrite, and one of the first things I did was look at AdonisJS again. I was impressed with how much it has evolved and opted to use it for the rebuild. 

Let's take a high-altitude overview of what you can do.

First, let's see what AdonisJS has to say about itself.

> AdonisJS is not yet another micro-framework or a wrapper on top of everything that already exists. Instead, we have written AdonisJS from scratch to be simple, elegant, and opinionated.

***Note*: That 'opinionated' part has already gotten my knickers in a twist a few times—more on that in future posts.**

The way I would describe AdonisJS is "Express on steroids". Out of the box, it includes everything I would need to add to Express - including database support. When I installed everything, I felt a bit overwhelmed. I had a general idea of how Adonis handled requests and used the [Lucid ORM](https://lucid.adonisjs.com/docs/introduction) for database interactivity, but there is so much more. You can set up the latest version of AdonisJS to easily incorporate with a new [Vue](https://vuejs.org/) or [React](https://react.dev/) app. Many of these features are part of additional libraries you can use with Adonis. These include - [Vite](https://vitejs.dev/), [EdgeJS](https://edgejs.dev/docs/introduction), and [Inertia](https://inertiajs.com/).

## Installation

I followed the [documentation](https://docs.adonisjs.com/guides/getting-started/installation) to get AdonisJS Installed. Reading about the options, I used the following command to get started:

```shell
npm init adonisjs@latest my_golf_league -- --db=mysql -K=inertia --adapter=vue --no-ssr
```

Let's break this down:

* `npm init adonisjs@latest my_golf_league` - Installs and initializes an AdonisJS app in a folder named `my_golf_league`.
* `--` - Tells Node to pass the following arguments to the process that builds the app.
* `--db=mysql` - Configures the database connection to use MySQL.
* `-K=inertia` - Tells AdonisJS to configure the app to use Inertia.
* `-adapter=vue` - Specifies that we want to use the Vue adapter with Inertia.
* `--no-ssr` - Configures the app so it does not use server-side rendering.

During the installation, I was asked to choose what "authentication guard" I wanted to use. The choices were:

* **Session** - Stores information about the logged-in user in the session store.
* **Access Tokens** - Uses cryptographically secure tokens issued after a successful login.
* **Basic Auth** - An implementation of the HTP authentication framework where the client passes user credentials as a base64 encoded string as a header in every request.

For reasons I can't quantify, I chose `session`.

When the installation was complete, I followed the instructions on the screen:

```shell
cd golf_league_manager
npm run dev
```
And...I got an error about missing environment variables for the database.

![AdonisJS database error](/assets/images/2024/hello-adonis/img_02.png)

I realized I had not updated the `.env` file to include connection information to my local instance of MySQL. I opened the file, made the necessary changes, and tried starting the app again.

This time, I saw a message in the console that the server started, and I could access the site at `http://localhost:3333`. Here is what I saw when I visited that URL.

![AdonisJS Welcome screen](/assets/images/2024/hello-adonis/img_01.png)

This feels like a good place to stop. I loved how easy it was to install AdonisJS and that it handled configuring all the related libraries. Let's hope my happiness continues!

## Wrap Up

After years of threatening to do so, I am finally rewriting the web application I wrote to manage my golf league. I decided to use AdonisJS on the backend (the front end is still up in the air) and share my experiences exploring AdonisJS and its related libraries. In future posts, I will discuss database migrations, Lucid object models, and using Inertia to hook into a Vue application.