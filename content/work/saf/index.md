---
title: Singapore Armed Forces
description: National Service, Software Developer
startDate: 2019-10-02
endDate: 2021-08-01
location: Singapore
website: https://www.mindef.gov.sg/web/portal/mindef/home
projects:
  - title: MT-RAC+
    source: website
    href: https://mtrac.ternary.digital/login
  - title: IPPT Utils
    source: self
    href: /project/ippt-utils
  - title: NRIC Utils
    source: self
    href: /project/nric-utils
  - title: HLS App
    source: website
    href: https://hls-app.pages.dev
---

In the second year of my compulsory National Service at Singapore, I worked as a software developer. Most of my friends had a typical military roles such as supply assistant, transport operator (_driver_), or infantry, but I was more fortunate to be selected for a role related to my future career. In this time, developed and rolled out multiple modules and apps for the Singapore Armed Forces such as

- iTrust
- MT-RAC+
- [NRIC utils](/mini-project/nric-utils)
- [IPPT utils](/mini-project/ippt-utils)
- IPPT App
- HLS App

For the first few weeks of my role, I was working on my own, after which I worked on projects with another serviceman. I was excited to collaborate because I could finally put my git skills, including branches and pull requests, to good use.

## iTrust

iTrust was the first project we worked on, a management application for transport companies in the army. Our tech stack was VueJS, NuxtJS, and Firebase. While NuxtJS was a great framework with amazing developer experience, we ran into various problems with getting server-side rendering for authenticated to work. Furthermore, the app contained various long forms which had to be validated prior to submission. It had become increasingly tedious to debug and test.

## MT-RAC Plus

<Alert>

MT-RAC Plus (Military Transport Risk Assessment Checklist Plus) is an application that digitalizes checklists for drivers in the army. Its aims were to reduce the amount of paper wastage and make the process of getting approval from officers and commanders easier.

</Alert>

### Tech stack

Prior to starting this project, we decided to use a slightly different tech stack. Rather than VueJS and NuxtJS, we decided that it was appropriate to use only VueJS as all of the website's pages were only accessible through authentication. In addition, we used ExpressJS as the backend rather than [NuxtJS's API routes](https://nuxtjs.org/docs/configuration-glossary/configuration-servermiddleware/). This allowed us to completely separate the frontend from the backend in a monorepo setup. While the frontend and backend were separated, we did have some shared code (schemas, types, and interfaces) which we kept in a `shared` package.

On the frontend, we decided to use a forms library ([`vue-formulate`](https://vueformulate.com/)) along with a data validation library ([`yup`](https://github.com/jquense/yup)). This greatly improved our productivity as validation and testing of forms was made simple.

For styling, we started out with plan CSS, but quickly decided to use [TailwindCSS](https://tailwindcss.com/) instead. This was definitely one of the better decisions as it allowed us quickly style components with the utility classes. My favorite part of this was that we did not have to constantly switch between `.css` and `.vue` files to style the application.

Our project supervisors had mentioned that this project had to be up and running within 2 months. While this was a deadline, our tech stack had helped us quickly prototype and deliver updates fast.

### UI

The UI had to be very simple as it was competing against pen and paper. I do think that the interface achieved the purpose of being simple: there are no unnecessary colors. In fact, if you use the application, you will realize that the interface is very "forgettable". This is indeed by design.

import { images } from './work/saf/assets';

<div className="flex space-x-base md:w-4/6 m-auto">
  <Image {...images.mtracLogin} border />
  <Image {...images.mtracCreate} border />
</div>

### Database

We used PostgreSQL and Prisma, a database ORM. According to me, Prisma's biggest feature is its automatic type generation, which greatly enhanced our productivity.

### Offline

Training exercises often take place outfield where there is limited cell service and connectivity, so our website would not work. However, if we wanted to completely eliminate the wastage of paper, we had to think of a solution.

We decided to make MT-RAC Plus a **progressive web app**. It can work offline, but with limited function. When the user opens the app with no internet connection, they can still create MT-RAC forms and schedule them to be submitted. Once they are back online, the scheduled forms are submitted.

### Current status

Looking back at the code in around 1 or 2 years, I can see that although we had done extensive planning, it has still unfortunately become messy with a lot of spaghetti! One reason for this was the constant new features we had to work on. For instance, 2 weeks after the first release, we were tasked with adding a feedback and ratings system, similar to that in taxi-hailing apps like Uber or Grab. Working on such features in limited time meant that we had limited time to refactor and think about architecture.

If I were to work on this project again, I would certainly look into domain-driven development or the hexagonal architecture for larger applications.

## HLS App

<Alert>
Some companies in the army complete HLS (Healthy Life Style) a few times a week. It is a physical training conduct.

The HLS App serves as a music and recordings app for these conducts.
</Alert>

Thrice a week, certain companies in our battalion would have HLS conducts. In these conducts, one of the commanders would read out the exercises and count. Similarly, For the run, they would read out timings such as "20 minutes remaining" or "5 minutes remaining"

<div className="flex space-x-base md:w-4/6 m-auto">
  <Image {...images.hlsZero} border />
  <Image {...images.hlsOne} border />
</div>

I had first worked with audio and recordings with [Holt Soundboard](/project/ninenine). This project, however, was more challenging as it involved overlaying audio and creating an interface for controlling music.

I also learned about the [Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API), which I used to keep the screen awake while audio is playing. However, certain browsers (older browsers or desktop browsers) do not support this API, so I ensured that the user is notified about it:

<div className="w-4/6 md:w-3/6 max-w-3xl">
<Image {...images.hlsWL} />
</div>

## IPPT App

<Alert>
IPPT (Individual Physical Proficiency Test) is the fitness test for the Singapore Army. It consists of three stations: situps, pushups, and 2.4 km (1.5 mi) running.

The aim of the IPPT app is to record and store IPPT station results and allow servicemen to view their scores.
</Alert>

For this application, we created an NPM package [`ippt-utils`](/project/ippt-utils) which is used to calculate IPPT scores based on the serviceman's age, number of situps, pushups, and running time.

We did not get enough time to finish creating this app, but the module we created will certainly help the next team that takes over.
