---
title: NextBus SG
description: Bus timings in a simplified manner
createdAt: '2020-03-01'
updatedAt: '2023-12-18'
featured: true
---

Links: [GitHub](https://github.com/ninest/nextbussg), [Play Store](https://play.google.com/store/apps/details?id=com.themindstorm.nextbussg), [Website](https://nextbus.now.sh)

I was never happy with the bus apps I used. All I needed was a list of bus timings in a simple interface. Since none of the existing solutions filled my needs, I decided to work on my own.

![NextBus SG bus timings](/images/projects/nextbussg/nextbus-main.png)

All other solutions required too many interactions, and it always used to take me a minute or more to find what I was looking for. It was quite frustrating to me that there was nothing that could get you the information you want at your fingertips.

```component:alert
variant: default
title: "Achievements"
---
My code received rave reviews by the [Learn Flutter Code](https://www.youtube.com/watch?v=IoueVJmXvsc) YouTube channel for the UI design and backend.

The project has 80+ stars on GitHub.
```

## Problems solved by NextBus SG

My app provides the key functionalities of a public transport app in a simplified yet powerful manner. While it looks simple, it comes with features no other bus app currently has.

1. **View timings and crowd of the next three buses:** Each bus timing is color-coded based on the crowd.
1. **Rename bus stop:** Sometimes bus stop names don’t make much sense to us humans. For instance, what’s the difference between *Bedok Station Exit A* and *Bedok Station Exit B*? We don’t have to remember, because they can be changed to *Opposite Bedok Mall* and *Bedok Mall*.
1. **Dark MRT map:** While all apps have the MRT map, none have a dark map.
1. **Minimalist, clutter-free interface:** NextBus SG shows you only the information you need – nothing more, nothing less.

![NextBus SG dark transit map](/images/projects/nextbussg/nextbus-alt.png)

## Technologies

I chose **Flutter** for its ease of use, great developer experience, and platform-agnostic development. I was able to release the app for iOS and Android rapidly.

**DataMall** and **Gov.SG** provide free APIs for public transport, bus timings, and other related data in Singapore.

The app is easily extensible to other countries because of the mini-backend it works off of.

## Next steps

I’m currently awaiting more feedback in order to improve the app further.
