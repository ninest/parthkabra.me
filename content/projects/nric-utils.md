---
title: NRIC Utils
description: A module to validate and mask Singapore NRICs 
date: 2020-11-20
links:
  - source: github
    href: https://github.com/ninest/nric-utils
    title: GitHub
showContents: false
---

NRIC utils is a library containing functions to validate and mask Singapore NRICs. I had originally created this library for my work in the [Singapore Armed Forces](/work/saf/).

The library contains functions to validate and mask Singapore NRICs:

```ts
const { maskNric, validateNric } = require('nric-utils');
// Or
import { maskNric, validateNric } from 'nric-utils';

const nric = 'S0000002G';

validateNric(nric); 
// => true

maskNric('S0000002G'); 
// => 002G

/* 
Pass in true to maskNric to also include the first letter:
*/
maskNric('S0000002G', true); 
// => S002G
```