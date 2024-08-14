---
title: Customizing The MySQL Shell Prompt
date: 2024-08-15T06:00:00
image: 2024/customize-mysql-shell-prompt/header.jpg
image-path: 2024/customize-mysql-shell-prompt/
tags: [ "MySQL", "MySQL-Shell" ]
series: mysql-shell-gems
description: Learn how to customize the MySQL Shell
---

The style and format of the prompt in [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/) can be customized to meet the desires of the person using it. We can configure the prompt to display different or trimmed-down information about our database connection and what mode we are using. This post will show how to add a visual cue to let you know when you are connected to a production database.

## The Setup

Since you are reading about customizing MySQL Shell, you should already have it installed. If you don't, [download](https://dev.mysql.com/downloads/shell/) and install it before you continue.

## Prompt Theme Files

The easiest way to customize the MySQL Shell prompt is to copy an existing prompt theme file. Several prompt files are included with MySQL Shell. These files are located in the following directories:

* **Windows** - ` %programfiles%\MySQL\MySQL Shell 8.0\share\mysqlsh\prompt\`
* **MacOs** - `/usr/local/mysql-shell/share/mysqlsh/prompt/`
* **Linux** - `/usr/share/mysqlsh/prompt/`

The list of files in these folders will resemble:

```text
README.prompt
prompt_16.json
prompt_256.json
prompt_256inv.json
prompt_256pl+aw.json
prompt_256pl.json
prompt_classic.json
prompt_dbl_256.json
prompt_dbl_256pl+aw.json
prompt_dbl_256pl.json
prompt_nocolor.json
```

For information on what the different files include, check out `README.prompt`.

We copy the prompt file we want to use as our base to the following locations:

* **Windows** - `%AppData%\Roaming\MySQL\mysqlsh\`
* **MacOS & Linux** - `~/.mysqlsh/`

I will use the `prompt_256pl.json` for this demo because I like the Powerline font aesthetic. Here is what the default JSON looks like.

```json
{
  "desc": "256/24bit color terminal theme with MySQL prefix, default schema, host:port, ssl, + indicator for X protocol, active mode. Requires Powerline patched font.",
  "classes": {
    "SQL": {
      "fg": "15",
      "bg": "166"
    },
    "JS": {
      "fg": "0",
      "bg": "221"
    },
    "Py": {
      "fg": "15",
      "bg": "25"
    },
    "schema": {
      "text": "%schema%"
    },
    "noschema": {
      "text": ""
    },
    "disconnected": {},
    "hostx": {
      "text": "%transport%+"
    },
    "hostc": {
      "text": "%transport%"
    },
    "SSLhostx": {
      "text": "%transport%+ \ue0a2"
    },
    "SSLhostc": {
      "text": "%transport% \ue0a2"
    },
    "ctrx": {
      "text": "",
      "bg": 38,
      "fg": 15
    },
    "ctrx.": {
      "text": " - ",
      "bg": 242,
      "fg": 15
    },
    "ctrx*": {
      "text": " \u2605 ",
      "bg": 38,
      "fg": 15
    },
    "ctrx^": {
      "text": " \u2606 ",
      "bg": 38,
      "fg": 15
    },
    "ctrx*.": {
      "text": " \u2605 ",
      "bg": 38,
      "fg": 15
    },
    "ctrx^.": {
      "text": " \u2606 ",
      "bg": 38,
      "fg": 15
    },
    "production": {
      "text": " PRODUCTION ",
      "bg": "red",
      "fg": "white"
    }
  },
  "variables": {
    "is_production": {
      "match": {
        "pattern": "*;%host%;*",
        "value": ";%env:PRODUCTION_SERVERS%;"
      },
      "if_true": "production",
      "if_false": ""
    },
    "target": {
      "match": {
        "pattern": "%socket%",
        "value": ""
      },
      "if_true": "%host%:%port%",
      "if_false": "localhost"
    },
    "transport": {
      "match": {
        "pattern": "%ssh_host%",
        "value": ""
      },
      "if_true": "%target%",
      "if_false": "%ssh_host% \u2192 %target%"
    }
  },
  "symbols": {
    "separator": "\ue0b0",
    "separator2": "\ue0b1",
    "ellipsis": "\u2026"
  },
  "prompt": {
    "text": "\ue0b0 ",
    "cont_text": "%linectx%\ue0b0 ",
    "bg": "0"
  },
  "segments": [
    {
      "classes": [
        "disconnected%host%",
        "%is_production%"
      ]
    },
    {
      "text": " My",
      "bg": 254,
      "fg": 23
    },
    {
      "separator": "",
      "text": "SQL ",
      "bg": 254,
      "fg": 166
    },
    {
      "classes": [
        "disconnected%host%",
        "%ssl%host%session%"
      ],
      "shrink": "truncate_on_dot",
      "bg": 237,
      "fg": 15,
      "weight": 10,
      "padding": 1
    },
    {
      "classes": [
        "noschema%schema%",
        "schema"
      ],
      "bg": 242,
      "fg": 15,
      "shrink": "ellipsize",
      "weight": -1,
      "padding": 1
    },
    {
      "classes": [
        "%session%trx%trx%%autocommit%"
      ],
      "weight": -1
    },
    {
      "classes": [
        "%Mode%"
      ],
      "text": "%Mode%",
      "padding": 1
    }
  ]
}
```

If MySQL Shell is already open, we must restart it to add the theme. When we start MySQL Shell with this file as it is, we will see the following:

![MySQL Shell default Look]({% imgPath image-path, "img_01.png" %} "MySQL Shell default look")

Here is what it looks like when I connect to a MySQL instance, in this case, over SSH.

![MySQL Shell look with connection]({% imgPath image-path, "img_02.png" %} "MySQL Shell look with connection")

## Prompt Background Color

When I used this prompt theme, I first noticed that the prompt's background was a different color from the background of my terminal.

![Mismatched colors of prompt and terminal background]({% imgPath image-path, "img_03.png" %} "This makes me all twitchy.")

This color difference makes me all twitchy. Since I am not using black as the background color for my terminal, I need to change the background color of the prompt. Yes, I could change the background of my terminal to black, but then you wouldn't learn how to change the prompt background.

The block of JSON that manages the background color of the prompt (and should be around line 102) is:

```json
  "prompt": {
    "text": "\ue0b0 ",
    "cont_text": "%linectx%\ue0b0 ",
    "bg": "0"
  }
```

The `bg` property controls the background color of the prompt. In this case, it is set to `0`, which is black. I could do trial and error to find a color close to the background color, but if I did it that way, I would need to change the color again if I ever chose a different background color for my terminal. So, the easy way to address this color difference is to remove that setting. I changed the `prompt` block to:

```json
"prompt": {
    "text": "\ue0b0 ",
    "cont_text": "%linectx%\ue0b0 "
  }
```

When I restart MySQL Shell, we can see that the background color for the prompt now matches the terminal background.

![Prompt and terminal colors match]({% imgPath image-path, "img_04.png" %} "Twitch is gone.")

If I change my terminal theme, I will not need to change the prompt background again. Take a look below.

![Prompt and terminal colors match]({% imgPath image-path, "img_05.png" %} "Prompt matches terminal with new theme.")

## Update Prompt Text

The next thing that bothers me is that the host information is a bit long because it includes the SSH host and then the database host. I prefer shorter prompt text, so we are going to shorten this. The block of JSON we will modify to accomplish this is around line 94 in the `transport` variable definition.

```json
"transport": {
      "match": {
        "pattern": "%ssh_host%",
        "value": ""
      },
      "if_true": "%target%",
      "if_false": "%ssh_host% \u2192 %target%"
    }
```

This block tells MySQL Shell that if the value of `%ssh_host%` is an empty string, set the value of the variable named `transport` to the value of the `%target%` variable—which will usually be the `host` and `port` separated by a colon (`:`).

If the value of `%ssh_host%` is any value other than an empty string, the value of `transport` is set to the value of `%ssh_host%`, followed by a character value for a right arrow, and ending with the value of the `%target%` variable.

For my purposes, the port number is not necessary. I am also not a fan of the extra spaces around the arrow. To fix this, I change the `if_false` line to the following:

```json
"if_false": "%ssh_host%\u2192%host%"
```

When I restart MySQL Shell and connect to the database again, the prompt looks like the image below. Note that the port is no longer shown, and the spaces around the arrow have been removed.

![Shortened MySQL Shell prompt]({% imgPath image-path, "img_06.png" %} "Shortened MySQL Shell prompt")

## Visual Cue For Production

I often have multiple database connections running at the same time. Because of this, I want to add a visual cue to let me know when I am connected to the production database. We already have a variable named `is_production` in our JSON. The definition for this variable is around line 72 and looks like the JSON below.

```json
"is_production": {
      "match": {
        "pattern": "*;%host%;*",
        "value": ";%env:PRODUCTION_SERVERS%;"
      },
      "if_true": "production",
      "if_false": ""
    }
```

The default definition looks for an environment variable named `PRODUCTION_SERVERS` to see if the value matches that of the `%host%` variable. If it does, the value of `is_production` is set to `production`. If it does not match, that value of `is_production` is set to an empty string.

Instead of setting an environment variable, I will hardcode the values for this demo.

Also, because I am using SSH to connect to my production server, I will change the pattern to use the `%ssh_host%` variable. My changes are reflected in the JSON below.

```json
"is_production": {
      "match": {
        "pattern": "%ssh_host%",
        "value": "gl-db-server"
      },
      "if_true": "production",
      "if_false": ""
    }
```

If the SSH host is `gl-db-server`, we should see a segment on the prompt indicating we are connected to a production server.

![Production segment in MySQL Shell prompt]({% imgPath image-path, "img_07.png" %} "Production segment in MySQL Shell prompt")

## Change Class Values

This prompt is better, but the text color is supposed to be white. I am not sure why it is not, but I think it is because of accessibility, and the colors do not have enough contrast. To change the colors of the `production` label, we look at the `production` class that is around line 65.

```json
"production": {
      "text": " PRODUCTION ",
      "bg": "red",
      "fg": "white"
    }
```

I will change the `bg` and `fg` colors to have more contrast. I will also change the value of `text` to `PROD` rather than `PRODUCTION` because we just regained some real estate on the prompt, and now we lost some of it again. My new block of JSON looks like this:

```json
"production": {
    "text": " PROD ",
    "bg": 124,
    "fg": 15
}
```

I restart MySQL Shell and reconnect to see the changes.

![High contrast production segment in MySQL Shell prompt]({% imgPath image-path, "img_08.png" %} "High contrast production segment in MySQL Shell prompt")

## Moving a Segment

In our prompt, the parts that show different information are called 'segments'. We can add, remove, and move segments in the theme. I want to move the `PROD` label toward the end of the prompt to catch my eye easier.

In our JSON file, the segments are defined with an array of JSON objects like the text below.

```json
"segments": [
    {
      "classes": [
        "disconnected%host%",
        "%is_production%"
      ]
    },
    {
      "text": " My",
      "bg": 254,
      "fg": 23
    },
    {
      "separator": "",
      "text": "SQL ",
      "bg": 254,
      "fg": 166
    },
    {
      "classes": [
        "disconnected%host%",
        "%ssl%host%session%"
      ],
      "shrink": "truncate_on_dot",
      "bg": 237,
      "fg": 15,
      "weight": 10,
      "padding": 1
    },
    {
      "classes": [
        "noschema%schema%",
        "schema"
      ],
      "bg": 242,
      "fg": 15,
      "shrink": "ellipsize",
      "weight": -1,
      "padding": 1
    },
    {
      "classes": [
        "%session%trx%trx%%autocommit%"
      ],
      "weight": -1
    },
    {
      "classes": [
        "%Mode%"
      ],
      "text": "%Mode%",
      "padding": 1
    }
  ]
```

To move the production, we first remove `"%is_production%"` from the `classes` property in the first element of the `segments` array. This segment should now look like the following:

```json
{
  "classes": [
    "disconnected%host%"
  ]
}
```

Next, we create a new JSON object before the last segment with an element in the `classes` array with a `%Mode%` value. We create a `classes` property as an array and add `%is_production%` as an element. The last three elements of `segments` should resemble the JSON below.

```json
 {
  "classes": [
    "%session%trx%trx%%autocommit%"
  ],
  "weight": -1
},
{
  "classes": [
    "%is_production%"
  ]
},
{
  "classes": [
    "%Mode%"
  ],
  "text": "%Mode%",
  "padding": 1
}
```

When we restart MySQL Shell and reconnect, the `PROD` label is closer to the prompt's end, making it more easily visible.

![Properly positioned high contrast production segment in MySQL Shell prompt]({% imgPath image-path, "img_09.png" %} "Properly positioned high contrast production segment in MySQL Shell prompt")

## README.prompt

The `README.prompt` file contains a lot of information about customizing our prompt. I am including the contents of that file below so that you (and I) have a reference that might be easier to locate.

```text
You can customize your prompt by copying over and editing one of the JSON
files in the shell user folder:

Linux and OSX: ~/.mysqlsh/prompt.json
Windows: %AppData%\MySQL\mysqlsh\prompt.json

From the sample prompts, files ending with _nocolor don't use any colors or
text attributes.

Those ending with _16 use 16/8 color ANSI colors and attributes.

_256 use 256 indexed colors which will work in most modern terminals, like
most Linux terminals, macOS an Windows 10.

_256pl will, in addition to the above, use special Unicode characters in the
prompt. You need to use a font patched for the Powerline statusline plugin
for it to be displayed correctly (you can find it easily by searching for
powerline fonts).

_256pl+aw uses some special icon characters from fonts patched with
"powerline" and "awesome symbol" characters, for example:
SourceCodePro+Powerline+Awesome+Regular.ttf

_dbl themes use one line for information display and a separate line for
the input prompt itself, allowing more information and typed text to fit
at the same time.

File Format
===========

Prompt theme files can be configured in ~/.mysqlsh/prompt.json
The theme file is a JSON file with the following layout:

    {
      "segments" : [
        { "classes": ["class1", "class2", ...],
          "text": text,
          "fg": color,
          "bg": color,
          "bold": bool,
          "underline": bool,
          "separator": "char",
          "min_width": integer,
          "weight": integer,
          "shrink": "none"|"truncate_on_dot"|"ellipsize"
      ],
      "classes" : {
        "class1": {
          "text": text,
          "fg": color,
          "bg": color,
          "bold": bool,
          "underline": bool,
          "separator": "char",
          "min_width": integer
        }
      },
      "variables" : {
        "variable": variable_def
      },
      "prompt" : {
        "text": "> ",
        "cont_text": "-> ",
        "fg": "32"
      },
      "symbols" : {
        "ellipsis": "...",
        "separator": "-",
        "separator2": "-"
      }
    }


segment_array
-------------

A JSON array containing the definition of a prompt segment.
A segment looks like:

    {
      "classes" : ["someclass", "%variable%"],
      "text" : "Text:%variable%",
      "fg": "#ff2211;1;red",
      "bg": "#1122ff;2;blue",
      "weight": 12
    }

Or for a linebreak:

    {
        "break": true
    }

- the class list can be used for dynamically selecting
the content of a segment. The first class in the list that
exists will be applied. Variable substitution applies.

- weight tells which segments to hide when there's not enough
space in the screen to fit everything. Higher weight values are
hidden first.

- allowed attributes are:
   - bold  makes text bold
   - underline  makes text underlined
   - bg background color
   - fg foreground color
     fg and bg can contain one or more of the following, separated by a ;
     - a color name (black|red|green|yellow|blue|magenta|cyan|white),
       supported by most terminals
     - 0..255 color index, for terminals that support 256 colors,
       like most Linux terminals or Windows 10 and Terminal.app
     - a #rrggbb value, for terminals that support TrueColor colors,
     The right color type will be picked depending on what the terminal
     in use supports.
   - text text to display. May contain variables.
   - min_width Minimum to allow shrinking the segment to
   - separator Separator character, if overriding the default
   - padding Number of spaces to use for padding around the segment text
   - shrink one of none, truncate_on_dot and ellipsize. The method to truncate
     the text if they don't fit.

Supported variables are:
    %mode% - mode of the shell (sql, js, py)
    %Mode% - mode of the shell, capitalized (SQL, JS, Py)
    %uri% - URI of the connected session
    %user% - username of the connected session
    %host% - hostname of the connected session
    %ssh_host% - hostname of the SSH tunnel server or ""
    %port% - port or socket path of the connected session
    %schema% - default schema of the SQL session
    %ssl% - SSL if SSL is enabled for the connected session
    %time% - current time
    %date% - current date
    %env:varname% - environment variable
    %sysvar:varname% - global system variable queried from MySQL
    %Sysvar:varname% - same as above, but do not use cached value
    %sessvar:varname% - session variable queried from MySQL
    %Sessvar:varname% - same as above, but do not use cached value
    %status:varname% - status variable queried from MySQL
    %Status:varname% - same as above, but do not use cached value
    %sessstatus:varname% - session status variable queried from MySQL
        Variables queried from MySQL are cached when the shell is connected.
    %Sessstatus:varname% - same as above, but do not use cached value
    %linectx% - context for continued multi-line statements

    %trx% - set to '*' if in a trx, '^' if in a R/O transaction
    %autocommit% - set to '' (blank) if autocommit is enabled, '.' if disabled
    %slow_query% - set to '&' if the last query was flagged as slow

prompt
------

Details about the special prompt segment. The prompt segment
will normally display the string in "text", but if it's in a
line continuation (eg when you press enter after select without a ;),
it will show "cont_text". By default, the prompt string is "> "
and the continuation string is "-> ".

    "prompt": {
      "text" : "> ",        # string to show in prompt
      "cont_text": "-> ",   # string to show in prompt when editing a continued line
      "fg": "32"
    }

classes
-------

A JSON class_name : class_definition map, where class_definition can contain
any attribute that can appear in a segment definition.

    "classes" : {
        "redtext": {
            "fg": "red;1;#ff0000"
        }
    }

variables
---------

You can declare custom variables that can be used as any other variable.

Example:

    "variables" : {
        # set the is_production variable to "production"
        # if the %host% variable is contained in the PRODUCTION_SERVERS
        # environment variable, which is a list of hosts separated by ;
        "is_production": {
            "match" : {
                "pattern": "*;%host%;*",
                "value": ";%env:PRODUCTION_SERVERS%"
            },
            "if_true" : "production",
            "if_false" : ""
        }
    }

Variable values are evaluated once on connection and are cached.


symbols
-------

    {
      "separator": string,
      "separator2": string,
      "ellipsis": string
    }

- separator is the default segment separator character
- ellipsis is the character to append to a ellipsized text


```

## Wrap Up

Customizing the prompt in MySQL Shell can allow us to show information we want and hide information we don't want. We can also add visual cues to let us know when we are connected to production servers, and we can move the different segments so they fit our needs better. To learn more about customizing the prompt in MySQL Shell, check out the [documentation](https://dev.mysql.com/doc/mysql-shell/9.0/en/mysql-shell-prompt-themes.html) and also take a look at the contents of the `README.prompt` file.

Photo by <a href="https://unsplash.com/@anna60991?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Anna Ana</a> on <a href="https://unsplash.com/photos/brown-and-white-seashells-on-gray-and-black-stones-5sjTXsgV0oE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
  
  