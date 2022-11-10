---
title: Contemplations
description: Thoughts for projects and ideas
date: 2021-04-03
# icon: brain
---

Below are some of the reasons why I would like to pursue computer science with focus on data science, machine learning, design, and architecture.

## DitchIT

My aim is to use collaborative crowd-sourcing to bring together communities, corporations, and the government to address the pothole problem and optimize the use of limited resources.

import { images } from './posts/blog/contemplations/assets';

<Image {...images.ditchit} />

### Data collection

Geolocation, accelerometer, and gyroscope data will be collected via numerous mobile or embedded devices such as:

1. Car tires with embedded accelerometers and gyroscopes
2. Cars with embedded GPS for geolocation data
3. Smartphones with accelerometers, gyroscopes, and GPS

Data will be collected through the gyroscope and accelerometer.

### Database and API

The data collected above will be saved in a common data store. Machine learning and analytics will be run on this data and will be made available via an API. A database such as Firebase Cloud Firestore can be leveraged as a data store

### Model

Machine learning and analytics to answer questions such as below:

1. Which are the most commonly hit potholes: useful for prioritization of fixes
2. A list of potholes near me: to overlay in a navigation map to avoid pothole-ridden roads
3. A list of recurring potholes: to indicate sub-optimal quality of prior fixes

This machine analytics portion is what I am focusing on now. I am trying to strengthen my knowledge data sciences and machine learning through online courses to be able to build the model. I am open to collaboration and partnerships on this front, and this project.

### App

Using data from the API, I would like to build an app that shows up-to-date information on potholes and the state of roads. This app can be used by anyone, including government authorities.

## NextBus SG generalizing

To build a common backend infrastructure to support the app in any country. As long as the data can be normalized into the existing format, the app will be usable automatically in that country.
