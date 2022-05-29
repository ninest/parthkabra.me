---
title: IPPT Utils
description: A module to calculate IPPT scores
date: 2020-11-20
links:
  - icon: github
    href: https://github.com/ninest/ippt-utils
    title: GitHub
showContents: false
---

IPPT utils is a library containing functions to calculate SAF IPPT scores. I had originally created this library for my work in the [Singapore Armed Forces](/work/saf/).

The library contains functions to calculate age groups, pushup, situp, and IPPT scores:

```ts
import { getAgeGroup, getPushupScore, getSitupScore, getRunScore } from 'ippt-utils';
// Or
const { getAgeGroup, getPushupScore, getSitupScore, getRunScore } = require('ippt-utils');

const age = 22;
const ageGroup = getAgeGroup(age);
// => 2 (a 22-year old man is in the age group 2)

const pushupsDone = 31;
const pushupScore = getPushupScore(ageGroup, pushupsDone);
// => [17, 3] (for pushups, he got a score of 17
// and he needs to do three more pushup to get the next point)

const situpsDone = 37;
const situpScore = getSitupScore(ageGroup, situpsDone);
// => [19, 2] (for situps, he got a score of 19
// and he needs to do two more situps to get the next point)

// 10 min, 10 seconds
const runTime = 10 * 60 + 10; // in seconds
const runScore = getRunScore(ageGroup, runTime);
// => [40, 20] (score of 40 for run
// and he needs to reduce his time by 20 seconds for next point)

// Note that run times round up to the nearest 10 seconds, so a
// run time of 10 min 1 second is the same as 10 min 10 seconds
```

In addition, it also contains a helper function to calculate the entire IPPT score:

```ts
import { getAgeGroup, getIpptScore } from 'ippt-utils';

const age = 22;
const ageGroup = getAgeGroup(age); // age group 2

const pushupsDone = 31;
const situpsDone = 37;
const runTime = 10 * 60 + 10; // 10 min, 10 seconds

const result = getIpptScore(ageGroup, pushupsDone, situpsDone, runTime);
/* 
{
  pushups: { 
    score: 17, 
    next: 3  <-- 3 pushups more = 1 more point
  },
  situps: { 
    score: 19, 
    next: 2 
  },
  run: { 
    score: 40, 
    next: 20 
  },
  score: 76,
  ageGroup: 2,
  award: { 
    name: 'Silver', 
    cash: 300, 
    minScore: 75 
  }
}
*/

result.score;
// => 76

result.award.name;
// => 'Silver'
```