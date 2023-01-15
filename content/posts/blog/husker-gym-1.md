---
title: Husker Gym 1
description: Creating a website to help find the best time to go to the gym
date: 2023-01-15
showContents: false
---

My aim was to create a website that can answer these questions about Northeastern's gyms:

- At what times is the gym usually crowded?
- How many people are currently in the gym?
- Is the gym going to get more crowded in the next hour or two?
- On average, how crowded is the gym at 5 PM on Sunday?
- Is 5 PM usually a good time to go to the gym?
- Is 5 PM (on Monday) usually a good time to go to the gym?

The project will be divided into two parts: a web scraper, and a website. There will also be a database containing records of the number of people in a gym at a specified times.

## Database

The database has three tables: `Gym`, `Section`, and `Record`. Each gym at Northeastern has one or more sections. Each section has multiple records. A record has the following data:

- Section
- Time
- Number of people in this section at this time

I used PlanetScale for the database. It provides free databases with generous usage limits. The only issue was that it [does not support foreign keys](https://planetscale.com/docs/learn/operating-without-foreign-key-constraints), but this was an easy fix.

## Web scraper

This part was fairly simple. No issues in scraping the [website displaying the live counts](https://connect2concepts.com/connect2/?type=circle&key=2A2BE0D8-DF10-4A48-BEDD-B3BC0CD628E7).

I used Python and BeautifulSoup for this part. A GitHub action runs every 30 minutes. Upon scraping the data, records are added to the database.

## Website

I will use nextjs, and a graph/visualization library to display the data. While D3 exists, there are many simpler libraries like Nivo, Chartjs, Recharts, etc that should make it easier to display complex charts.