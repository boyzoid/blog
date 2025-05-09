---
title: Without Good Data, AI is Useless
date: 2025-05-12T06:00:00
image: 2025/ai-needs-good-data/header.jpg
tags: [ "MySQL", "AI", "HeatWave" ]
image-path: 2025/ai-needs-good-data/
description: In this post, we discuss the importance of using good data when training AU models.
---

Last week, we released a [Episode #89](https://www.youtube.com/watch?v=MCunWV6EWoA&list=PLWx5a9Tn2EvG4C90YFJ9eU61IpALeE0SN&index=89) of [MySQL Shorts](https://www.youtube.com/playlist?list=PLWx5a9Tn2EvG4C90YFJ9eU61IpALeE0SN) that focussed on some [machine learning features](https://www.oracle.com/heatwave/features/#automl) available in [HeatWave](https://www.oracle.com/heatwave/). In today's post, I will discuss some things I learned about good vs. bad data when I was training the AI models for this episode.

## The Setup

When training the models for Episode 89, I used a dataset generated from data used to manage a golf league. The dataset included information about the golfers, their scores, and the courses they played. Some datasets included information about weather conditions. The data also went back to 2013.

This data was used to train a model that could predict a golfer's score based on their previous scores and the course they were playing. I went through several iterations of the dataset to get the model trained to a point where it was producing good results. Because golf is so unpredictable - the same golfer on the same day, at the same course,  in the same weather conditions can shoot vastly different scores - I considered getting within 5 strokes of the actual score a good result. Data scientists may not agree...But I am not a data scientist. I am a developer trying to learn how to use AI to solve problems.

For this post, I will show the results from five different models I trained using five different datasets. The datasets were generated from the same source data, but some data was added or omitted to produce the optimal results.

## The Data

The data I used for each iteration was divided into 3 different tables. The tables were:

1. `golf_train`—This table contained the data used to train the model. The columns in each iteration were slightly different. One column common to all the iterations was `score`, which contained the golfer's score for the given round of golf. Each iteration contained 11,465 rows of data.
2. `golf_test` - This table contained the data used to test the model. The columns in this table were the same as those in the `golf_train` table, but the data was different, and the value of the `score` column was `null`. Each iteration contained 4,914 rows of data.
3. `golf_scores`—This table contained the data used to help evaluate the model. It contained the actual scores for the golfers in the `golf_test` table.

## The Steps

I used the same steps for each of the five datasets when training the model, running predictions, and evaluating the results. The steps were:

1. Train the model with the data in the `golf_train` using the [`sys.ml_train()`](https://dev.mysql.com/doc/heatwave/en/mys-hwaml-ml-train.html) stored procedure.
2. Load the newly created model using the [`sys.ml_model_load()`](https://dev.mysql.com/doc/heatwave/en/mys-hwaml-ml-model-load.html) stored procedure.
3. Run predictions with the data in the `golf_test` table using the [`sys.ml_predict_table()`](https://dev.mysql.com/doc/heatwave/en/mys-hwaml-ml-predict-table.html) stored procedure, which exported the data to a new table named `golf_predict`.
4. Run the following query to evaluate the results of the predictions:

```sql
select 
    distinct abs(round(gp.prediction,0)-gs.score) diff,                 
    count(*) count 
from golf_predict gp 
    join golf_scores gs on gp.id = gs.id 
group by diff 
order by diff;
```
This query returns the unique differences between the predicted and actual scores and the number of times those differences occurred.

## Iteration 1

At first, I seemed to hit a home run with my first dataset because the results were spot on. Here are the results of the test query:

```text
+------+-------+
| diff | count |
+------+-------+
|    0 |  4910 |
|    1 |     3 |
|    2 |     1 |
+------+-------+
```

This model correctly predicted 4,910 of the 4,914 scores. And it predicted 100% of the scores within 5 strokes of the actual score. I was ecstatic! I thought I had found the holy grail of golf predictions.

But when I shared the results with my [younger son](https://www.linkedin.com/in/ryanstroz/), my enthusiasm quickly waned. He pointed out that the model seems to have figured out a pattern or a 'formula' to predict the scores and that the model was "overfitting" the data.

It turns out he was correct. Let's examine the columns in the `golf_train` table to see how.

```text
+-----------------+---------------+
| Field           | Type          |
+-----------------+---------------+
| id              | int           |
| golfer_name     | varchar(100)  |
| match_date      | date          |
| scheduled_date  | varchar(10)   |
| score           | int           |
| net_score       | int           |
| handicap        | int           |
| course_name     | varchar(75)   |
| hole_group_name | varchar(75)   |
| slope           | decimal(10,2) |
| rating          | decimal(10,2) |
| team_name       | varchar(50)   |
| week_name       | varchar(75)   |
| division_name   | varchar(50)   |
| season_name     | varchar(50)   |
| league_name     | varchar(50)   |
+-----------------+---------------+
```

You may have figured out what is wrong with this dataset if you are a golfer.

This iteration of the `golf_train` table contained the `score`, the `net_score`, and the golfer's `handicap`. When you add the `net_score` and the `handicap`, you get the `score`. So, the model could predict the score by adding the `net_score` and the `handicap` together.

This was not a good model.

## Iteration 2

In the second iteration, I removed the `net_score` and the `handicap` columns from the `golf_train` table and used this new configuration to train the model. Here are the columns I used in this iteration of `golf_train`:

```text
+-----------------+---------------+
| Field           | Type          |
+-----------------+---------------+
| id              | int           |
| golfer_name     | varchar(100)  |
| match_date      | date          |
| scheduled_date  | varchar(10)   |
| score           | int           |
| course_name     | varchar(75)   |
| hole_group_name | varchar(75)   |
| slope           | decimal(10,2) |
| rating          | decimal(10,2) |
| team_name       | varchar(50)   |
| week_name       | varchar(75)   |
| division_name   | varchar(50)   |
| season_name     | varchar(50)   |
| league_name     | varchar(50)   |
+-----------------+---------------+
```

And here are the results of the test query above:

```text
+------+-------+
| diff | count |
+------+-------+
|    0 |   446 |
|    1 |   931 |
|    2 |   817 |
|    3 |   769 |
|    4 |   598 |
|    5 |   457 |
|    6 |   324 |
|    7 |   214 |
|    8 |   126 |
|    9 |    92 |
|   10 |    62 |
|   11 |    30 |
|   12 |    21 |
|   13 |    11 |
|   14 |     3 |
|   15 |     2 |
|   16 |     5 |
|   17 |     3 |
|   18 |     1 |
|   19 |     1 |
|   20 |     1 |
+------+-------+
```

As we can see, the results are much more disparate. The model correctly predicted 446 of the 4,914 scores and predicted 4,018 (82%) of the scores within 5 strokes of the actual score. This was a much better model. But was it ideal?

At this point, I decided to dig deeper into the model. To get a better understanding of how the model was working, I ran the [`sys.ml_explain_table()`](https://dev.mysql.com/doc/heatwave/en/mys-hwaml-ml-explain-table.html) stored procedure to get a better understanding of how the model was making its predictions. In the table produced by `ml_explain_table()`, I noticed that the data in the `team_name` column was often used to make predictions. This set off alarms in my head because the teams in my golf league are made up of two golfers. By using `team_name`, it is possible that the model was predicting a score of one teammate based on the score history of the other teammate.

Even though the results were more in line with what I was expecting, this was likely not a good model.

## Iteration 3

For the third iteration, I removed the `team_name` column from the `golf_train` table and used this new configuration to train the model. Here are the columns I used in this iteration of `golf_train`:

```text
+-----------------+---------------+
| Field           | Type          |
+-----------------+---------------+
| id              | int           |
| golfer_name     | varchar(100)  |
| match_date      | date          |
| scheduled_date  | varchar(10)   |
| score           | int           |
| course_name     | varchar(75)   |
| hole_group_name | varchar(75)   |
| slope           | decimal(10,2) |
| rating          | decimal(10,2) |
| week_name       | varchar(75)   |
| division_name   | varchar(50)   |
| season_name     | varchar(50)   |
| league_name     | varchar(50)   |
+-----------------+---------------+
```

AND here are the results of the test query above:

```text
+------+-------+
| diff | count |
+------+-------+
|    0 |   325 |
|    1 |   612 |
|    2 |   581 |
|    3 |   577 |
|    4 |   550 |
|    5 |   473 |
|    6 |   454 |
|    7 |   370 |
|    8 |   312 |
|    9 |   233 |
|   10 |   152 |
|   11 |   118 |
|   12 |    69 |
|   13 |    41 |
|   14 |    23 |
|   15 |    13 |
|   16 |     6 |
|   17 |     2 |
|   18 |     3 |
+------+-------+
```

The model correctly predicted 325 of the 4,914 scores and predicted 3,118 (63%) of the scores within 5 strokes of the actual score. Given that the accuracy of the model was lower than that of the previous interaction, I was not sure if this model was better or not.

Based on the other iterations I'll discuss below, this model was not as good as the previous one.

## Iteration 4

One thing that can affect a golfer's performance on the golf course is the weather. So, for the fourth iteration, I added some columns to the `golf_train` table that contained weather data. I added `temperature`, `conditions` (clear, cloudy, rainy, etc.), `wind_speed`, and `humidity`. Here are the columns I used in this iteration of `golf_train`:

```text
+-----------------+---------------+
| Field           | Type          |
+-----------------+---------------+
| id              | int           |
| golfer_name     | varchar(100)  |
| match_date      | date          |
| scheduled_date  | varchar(10)   |
| score           | int           |
| course_name     | varchar(75)   |
| hole_group_name | varchar(75)   |
| slope           | decimal(10,2) |
| rating          | decimal(10,2) |
| week_name       | varchar(75)   |
| division_name   | varchar(50)   |
| season_name     | varchar(50)   |
| league_name     | varchar(50)   |
| temperature     | int           |
| conditions      | varchar(50)   |
| wind_speed      | int           |
| humidity        | int           |
+-----------------+---------------+
```

And here are the results of the test query:

```text
+------+-------+
| diff | count |
+------+-------+
|    0 |   325 |
|    1 |   610 |
|    2 |   589 |
|    3 |   573 |
|    4 |   556 |
|    5 |   464 |
|    6 |   458 |
|    7 |   369 |
|    8 |   313 |
|    9 |   230 |
|   10 |   154 |
|   11 |   116 |
|   12 |    69 |
|   13 |    41 |
|   14 |    23 |
|   15 |    13 |
|   16 |     6 |
|   17 |     2 |
|   18 |     3 |
+------+-------+
```

I was stunned to see that by adding the weather conditions. The model's accuracy not only didn't improve, but it didn't change at all. The accuracy was still at 63%.

While doing the analysis for this blog post, I realized that this model was still not ideal, even though it was the one I used for the demo in Episode 89.

## Iteration 5

I was starting to lose hope that I could find a more ideal model than Iteration 2, which may have been using data attributed to one golfer to predict scores for another. Then I realized that nothing in the data I was using indicated the golfer's ability. A golfer may get better or worse over time, and there was no data the model could use to determine this. Fortunately, the source data I used to generate the datasets did have something we can use - the golfer's handicap when the round of golf was played.

For those who may not know, a golfer's handicap measures their ability. The lower the handicap, the better the golfer. So, I added a column to the `golf_train` table that contained the golfer's handicap when they played the golf round. For this example, I decided to leave the weather information intact. Here are the columns I used in this iteration of `golf_train`:

```text
+-----------------+---------------+
| Field           | Type          |
+-----------------+---------------+
| id              | int           |
| golfer_name     | varchar(100)  |
| match_date      | date          |
| scheduled_date  | varchar(10)   |
| score           | int           |
| handicap        | int           |
| course_name     | varchar(75)   |
| hole_group_name | varchar(75)   |
| slope           | decimal(10,2) |
| rating          | decimal(10,2) |
| week_name       | varchar(75)   |
| division_name   | varchar(50)   |
| season_name     | varchar(50)   |
| league_name     | varchar(50)   |
| temperature     | int           |
| conditions      | varchar(50)   |
| wind_speed      | int           |
| humidity        | int           |
+-----------------+---------------+
```
And here are the results of the test query:

```text
+------+-------+
| diff | count |
+------+-------+
|    0 |   531 |
|    1 |   959 |
|    2 |   903 |
|    3 |   756 |
|    4 |   574 |
|    5 |   395 |
|    6 |   313 |
|    7 |   197 |
|    8 |   126 |
|    9 |    61 |
|   10 |    41 |
|   11 |    28 |
|   12 |    16 |
|   13 |     9 |
|   14 |     3 |
|   15 |     1 |
|   18 |     1 |
+------+-------+
```

The model correctly predicted 531 of the 4,914 scores and predicted 4,118 (84%) of the scores within 5 strokes of the actual score. The number of unique differences was the same as Iteration 4, but the number of times the higher discrepancies occurred was lower in this iteration. This iteration had higher accuracy than Iteration 2 and was a more ideal model.

## Wrap Up

This was a delightful exercise. It was challenging to consider what data would help the model make better predictions and what data would not. I also learned a lot about using the machine learning features in HeatWave.

I imagine a data scientist could create a better dataset to train the model. However, as I noted above, I am a developer trying to learn how to use AI to solve problems, not a data scientist.

One thing you should take away from this post is that training your model using good data is essential. As I often hear in my line of work, "garbage in, garbage out." You need to use good data to get the best results from your model.

Oh, and also, I would question the results if they seem too good to be true.

Photo by <a href="https://unsplash.com/@fabioha?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">fabio</a> on <a href="https://unsplash.com/photos/geometric-shape-digital-wallpaper-oyXis2kALVg?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
      