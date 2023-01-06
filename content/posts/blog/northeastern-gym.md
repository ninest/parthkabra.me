---
title: The Northeastern Gym
description: Escaping the crowd
date: 2023-01-10
draft: true
---

My university has two gyms, both of which are usually crowded. One of the gyms is pretty big, but because our university over-enrolled, all machines are taken.

There are some times when the gym is less crowded, for example, at 9 AM when most students are working or in class, and around 7 PM. But this changes semester by semester, and it's hard to find these times.

What if we could see how many people are currently at the gym? Good thing we can!

![Connect2Concepts](/images/blog/northeastern-gym-time/c2c.png)

The only issue is that we can only see the live timings. It's difficult to use this to plan out the best times to go to the gym.

This gave me an idea: why not scrape this data, save it, and display it in a calendar-heatmap grid? That way, we can try and find the times of week with the least crowd. Sort of like GitHub's commit graph:

{% div className="max-w-[25ch]" %}
  ![Commit graph](/images/blog/northeastern-gym-time/commit-graph.png)
{% /div %}

Track the progress of [this project](https://github.com/husker-nu/gymtime)!
