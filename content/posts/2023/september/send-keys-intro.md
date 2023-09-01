---
title: A Tool For Poor Typists - SendKeys
date: 2023-09-04T06:00:00
image: /assets/images/2023/send-keys-intro/header.jpg
tags: [ "Tools", "Node.js", "SendKeys" ]
---

Ask anyone who has had a conversation with me over IM or email, and they will tell you I am a horrible typist. I was never a great typist, but was much better in high school. After graduating, it would be about 13 years before I would need to type again. So, it was like learning all over again.

## The Problem

I have gotten better at typing, and usually, my issues stem from trying to type too fast. When writing blog posts or crafting presentations, I have the luxury of tools like built-in spell checkers or  [Grammarly](https://app.grammarly.com/) to help me catch issues before they "go live". However, about 8 months ago, I started producing a [series of short instructional videos](https://www.youtube.com/playlist?list=PLWx5a9Tn2EvG4C90YFJ9eU61IpALeE0SN) for work. I quickly realized that I needed to figure out a way to make capturing my typing easier. I was making so many typos that recording my code samples would take way too long. Then a [good friend](https://recursive.codes/) introduced me to [SendKeys](https://github.com/socsieng/sendkeys).

## The Solution

SendKeys is a library that runs on Mac OS (Sorry, Windows users) and allows you to programmatically send keystrokes to apps running on your computer. This was the help I needed. However, I found it cumbersome to set up the commands for SendKeys and then run them while trying to do screen recordings. After some digging around, I discovered that SendKeys has a Mode module. I decided to write a wrapper in Node.js, using Express, so I can run my commands from a web browser. I am now making the project known to the public to help all the other poor typists.

## Getting the Code

Getting the code is easy. Head to the [GitHub repo](https://github.com/boyzoid/send-keys-node) and clone it.

### Install the Dependencies

Once you have cloned the project, navigate to the project directory and run the command:

```shell
npm install
```

Now, we can get started with setting up a command set.

## Building a Command Set

Create a JSON file in the `command-sets` directory to create a command set. It does not matter what it is named.

The contents of this file should match the structure in the `command-set.json.template` file.

```javascript
{
  "name": "Command Set template",
  "commands": [
    {
      "title": "List Folder",
      "string": "ls<c:return>",
      "target": "terminal",
      "delay": 0.1,
      "initialDelay": 0.25
    },
    {
      "title": "Clear Console",
      "string": "clear<c:return>",
      "target": "terminal",
      "delay": 0.1,
      "initialDelay": 0.25
    }
  ]
}
```

* The `name` property differentiates one script from another in the web interface.
* The `commands` property is an array of commands we can execute.
  * The `title` property is the title of the command.
  * The `string` property contains the keystroke definitions sent using `SendKeys`.
  * The `target` property is the app receiving the keystrokes.
  * The `delay` property is the time between keystrokes (in seconds).
  * The `initialDelay` property is how long `SendKeys` should delay before sending the keystrokes.

Here is a command set I used for my most recent video.

```javascript
{
  "name": "Date Functions",
  "commands": [
    {
      "title": "First Query",
      "string": "<c:l:control>select\n    now(),\n    curdate(),\n    curtime();<p:2><c:return>",
      "target": "Tabby",
      "delay": 0.05
    },
    {
      "title": "Date Add/Sub",
      "string": "<c:l:control>select\n    date_add(now(), interval 5 day) date_add,\n    date_sub(now(), interval 5 month) date_sub;<p:2><c:return>",
      "target": "Tabby",
      "delay": 0.05
    },
    {
      "title": "Date Add/Sub Reverse",
      "string": "<c:l:control>select\n    date_add(now(), interval -2 week) date_add,\n    date_sub(now(), interval -2 year) date_sub;<p:2><c:return>",
      "target": "Tabby",
      "delay": 0.05
    }
  ]
}
```

You can see that my `target` for each of these is [Tabby](https://tabby.sh/) - a multi-platform, tabbed terminal. You will also notice that some blocks are wrapped in `< >` inside the' string' property. These blocks are instructions for `SendKeys`. For example, `<:c:l:contro;>` would be the same as typing `control + l`. Head to the [documentation](https://github.com/socsieng/sendkeys#key-codes-and-modifier-keys) to learn more about these key codes and modifier keys.

I should point out that for the code above, I also run these commands in Tabby after starting [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/).

## Starting The App

With a command set defined, let's start the app.

You can use the following command to start the app:

```shell
npm run start
```

However, if you need to tweak your command sets, it might be easier to use:

```shell
npm run monitor
```

This will run the app and refresh the Node side whenever a file changes. You still need to refresh the web page.

## The Web Interface

With the app started, navigate to `https://localhost:3000` to see the user interface.

Here is the UI for the command set from my last video.

![SendKeys via Node User Interface](/assets/images/2023/send-keys-intro/image_01.png)

The drop-down at the top will contain references to each command set you have defined in the `command-sets` directory.

Each command is listed with the `title`, `target`, `initialDelay`, and `delay`. Lastly, each command has a button to run that command. Take a look below to see what the output looks like in Tabby. The delay before the query results are shown is a result of adding a 2-second pause before 'pressing' return. This syntax is `<p:2><c:return>`.

<video width="694" height="284" controls autoplay loop style="margin: 0 auto">
<source src="/assets/images/2023/send-keys-intro/image_02.mp4" type="video/mp4">
Your browser does not support the video tag.
</video>

## The Wrap-Up

To recap, I could be a better typist, and sometimes I need to capture video of my typing. Due to my less-than-stellar typing abilities, this would often take a long time to accomplish without having any typos. Thanks to SendKeys and this Node app I wrote, it has become much easier and faster to get my recordings done.


Photo by <a href="https://unsplash.com/@patrickian4?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Patrick Fore</a> on <a href="https://unsplash.com/photos/0gkw_9fy0eQ?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
  