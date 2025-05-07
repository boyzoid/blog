---
title: AI Features Available in HeatWave Always Free Tier
date: 2025-05-08T06:00:00
image: 2025/heatwave-always-free-ai/header.jpg
tags: [ "MySQL", "AI", "HeatWave" ]
image-path: 2025/heatwave-always-free-ai/
series: heatwave-mysql
description: In this post, we discuss some of the AI features available in the Always Free tier of HeatWave in Oracle Cloud.
---

Earlier this week, we released a [Episode #89](https://www.youtube.com/watch?v=MCunWV6EWoA&list=PLWx5a9Tn2EvG4C90YFJ9eU61IpALeE0SN&index=89) of [MySQL Shorts](https://www.youtube.com/playlist?list=PLWx5a9Tn2EvG4C90YFJ9eU61IpALeE0SN) that focussed on some [machine learning features](https://www.oracle.com/heatwave/features/#automl) available in [HeatWave](https://www.oracle.com/heatwave/). I am excited to share that features demoed in that video are also available in the [Always Free tier](https://www.oracle.com/cloud/free/) of HeatWave!

## Some Background

When I was putting together the demos for Episode 89, I was using a beefy [HeatWave MySQL](https://www.oracle.com/mysql/) instance, with an equally powerful [HeatWave Cluster](https://docs.oracle.com/en-us/iaas/mysql-database/doc/heatwave.html) instance. The MySQL instance was based on the 'MySQL.64' shape that included 64 ECPUs and 512 GB of memory. The HeatWave cluster was based on the 'HeatWave.512GB' shape that included 512 GB of memory. With this powerful setup, I could run the demos without any issues.

A few weeks ago, during [MySQL Summit 2025](https://www.mysql.com/news-and-events/events/mysql-summit-2025.html), it was discussed that many of the AI features available in HeatWave are also available in the Always Free tier. I decided to test this and see if I could run the same demos on the Always Free tier. I was pleasantly surprised with the results.

## Running the Demos

To test the capabilities of the Always Free tier, I created an Always Free instance of HeatWave MySQL with the 'MySQL.free' shape that included 1 ECPU and 8 GB of memory. I also created a HeatWave cluster with the 'HeatWave.fee' shape that includes 16 GB of memory. As you can see, this setup is much less potent than the one I used for the demos in Episode 89.

For the Always Free tier test, I used the same exact data set and executed the same stored procedures I used in the video. As expected, there was some performance degradation, but the results were still impressive. Look at the table below for a comparison of the two setups.

| Step                        | Beefy Setup | Always Free Setup |
|-----------------------------|-------------|-------------------|
| Train Model (11,465 rows)   | 2m 2s       | 12m 58s           |
| Predict scores (4,915 rows) | 8.4s        | 30s               |

I knew the Always Free tier would take longer to train the model and perform the predictions, but the times were much faster than expected. The training time was about 6 times longer, and the prediction time was approximately 3.5 times longer than the more powerful setup. That's not too shabby, considering how many more resources the beefy setup has.

## Be Warned

The Always Free instance of HeatWave MySQL I used for these tests is also used for a personal website. When the model was being trained, the website responded slowly. I recommend not running any other workloads on an Always Free instance while training the model. The same goes for the prediction step. If you use the Always Free instance for other workloads, I recommend running the model training and predictions during off hours.

## Wrap Up

If you want to test out the machine learning features available in HeatWave, you can test many of them using an Always Free instance of HeatWave MySQL. The performance will be a little slower, but you can get an idea of the functionality without opening your wallet. You can get started with the Always Free tier by signing up for an [Oracle Cloud account](https://www.oracle.com/cloud/free/).

Photo by <a href="https://unsplash.com/@growtika?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Growtika</a> on <a href="https://unsplash.com/photos/a-computer-generated-image-of-a-network-and-a-laptop-f0JGorLOkw0?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>