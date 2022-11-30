---
title: MySQL 8.0.31 Introduces INTERSECT and EXCEPT
date: 2022-11-10T06:00:00
image: /assets/images/2022/intersect-except/header.jpg
tags: ["MySQL"]
---
With the recent release of MySQL [8.0.31](https://dev.mysql.com/doc/relnotes/mysql/8.0/en/news-8-0-31.html), the MySQL Team added the [`INTERSECT`](https://dev.mysql.com/doc/refman/8.0/en/intersect.html) and [`EXCEPT`](https://dev.mysql.com/doc/refman/8.0/en/except.html) operators. Both of these operators are related to the [`UNION`](https://dev.mysql.com/doc/refman/8.0/en/union.html) operator but both return vastly different result sets.

## Set Up
For all the demos in this post, we will be using the data from the following table definition.

```SQL
CREATE TABLE `mysql_demos`.`friends` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `dogs` INT NULL,
  `cats` INT NULL,
  PRIMARY KEY (`id`));
```

Photo by [Denys Nevozhai](https://unsplash.com/@dnevozhai?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/intersect-except?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
