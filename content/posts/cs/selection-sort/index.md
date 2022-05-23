---
title: Selection Sort
description: Selection sort in pseudocode and Python
date: 2021-06-11
---

import { Mermaid } from "@/components/Mermaid"

export const sortedClassDef = `classDef sorted fill:#bbf;`
export const swappingClassDef = `classDef swapping fill:#bfb;`

## Steps

- Loop through the array
- Find the smallest element in the unsorted portion of the array
- Swap the smallest element with the first element in the unsorted portion of the array

*The sorted portion of the array is on the left side while the unsorted portion is on the right. In the diagrams below, the <span className="underline decoration-[#bbf]">blue boxes</span> represent the **sorted** elements of the array, while the white boxes represent the **unsorted** elements. Elements that are going to be swapped are shown in  <span className="underline decoration-[#bfb]">green boxes</span>.*


On every iteration, an element from the unsorted portion is added to the sorted portion. For example, if we start with this array:

<Mermaid code={`graph LR
  3 --- 5 --- 2 --- 1 --- 9 --- 6
`}/>

At this stage, the unsorted array is the *entire array*. The smallest element found is `1`, so swap that with the *first element of the unsorted array*.

<Mermaid code={`graph LR
  ${swappingClassDef}
  3:::swapping --- 5 --- 2 --- 1:::swapping --- 9 --- 6
`}/>

So after the first iteration, only the first element is sorted:



<Mermaid code={`graph LR
  ${sortedClassDef}
  1:::sorted --- 5 --- 2 --- 3 --- 9 --- 6
`}/>

Now loop through the *unsorted array* (the items after the first element, which is now sorted). In the unsorted array, swap the smallest item with the first item

<Mermaid code={`graph LR
  ${sortedClassDef}
  ${swappingClassDef}
  1:::sorted --- 5:::swapping --- 2:::swapping --- 3 --- 9 --- 6
`}/>

After the second iteration, the first two elements are sorted, as another element from the unsorted portion is added to the sorted portion:

<Mermaid code={`graph LR
  ${sortedClassDef}
  1:::sorted --- 2:::sorted --- 5 --- 3 --- 9 --- 6
`}/>

This continues `n - 1` times, where `n` is the length of the list. 






Third iteration:

<Mermaid code={`graph LR
  ${sortedClassDef}
  ${swappingClassDef}
  1:::sorted --- 2:::sorted --- 5:::swapping --- 3:::swapping --- 9 --- 6
`}/>

<Mermaid code={`graph LR
  ${sortedClassDef}
  1:::sorted --- 2:::sorted --- 3:::sorted --- 5 --- 9 --- 6
`}/>

Fourth iteration:

<Mermaid code={`graph LR
  ${sortedClassDef}
  ${swappingClassDef}
  1:::sorted --- 2:::sorted --- 3:::sorted --- 5:::swapping --- 9 --- 6
`}/>

<Mermaid code={`graph LR
  ${sortedClassDef}
  1:::sorted --- 2:::sorted --- 3:::sorted --- 5:::sorted --- 9 --- 6
`}/>

Fifth iteration:

<Mermaid code={`graph LR
  ${sortedClassDef}
  ${swappingClassDef}
  1:::sorted --- 2:::sorted --- 3:::sorted --- 5:::sorted --- 9:::swapping --- 6:::swapping
`}/>

<Mermaid code={`graph LR
  ${sortedClassDef}
  ${swappingClassDef}
  1:::sorted --- 2:::sorted --- 3:::sorted --- 5:::sorted --- 6:::sorted --- 9:::sorted
`}/>

Note that it runs `n - 1` times, since the last element is already sorted.



## Pseudocode

```python
function selection_sort(list):
  n = list.length

  for i from 0 to n-1:
    # Initialize smallest element to first one
    smallest_index = 1

    # Traverse through the unsorted list to find the 
    # smallest element
    for j from i to n:
      if collection[j] < collection[smallest_index]:
        smallest_index = j
    
    # Swap smallest element with first element of 
    # unsorted list
    swap(collection[smallest_index], collection[i])
  
  return collection
```

## Python

While the pseudocode will produce expected results, there is a simple optimization we can make. 
- `smallest_index` is already given an initial value of `i`, so there is no need to start at `i` in the inner for loop. Even if `i` happens to be the smallest value, `smallest_index` is already set to `i`.
- We only need to swap `collection[smallest_index]` and `collection[i]` if `i` is not equal to `smallest_index`.

```py
def selection_sort(collection):
  length = len(collection)

    for i in range(length - 1):
        smallest_index = i
        for j in range(i + 1, length):
            if collection[j] < collection[smallest_index]:
                smallest_index = j

        if smallest_index != i:
            collection[smallest_index], collection[i] = (
                collection[i],
                collection[smallest_index],
            )

    return collection
```

To debug, I am going to run the following and print the list at every iteration:

```py
selection_sort([3, 5, 2, 1, 9, 6])
```

The output is 

```py
[3, 5, 2, 1, 9, 6]
[1, 5, 2, 3, 9, 6]
[1, 2, 5, 3, 9, 6]
[1, 2, 3, 5, 9, 6]
[1, 2, 3, 5, 9, 6]
[1, 2, 3, 5, 6, 9]
[1, 2, 3, 5, 6, 9]
```

## Time complexity

The worst-case scenario is $O(n^2)$ since there is a nested loop.

The first iteration has `n` swaps, the second has `n - 1`, the third has `n - 2`, and so on, so


$$ n + (n - 1) + (n - 2) + (n - 3) + ... + 1 = \cfrac{n^2}{2} + \cfrac{n}{2} $$





Since $n^2$ is the highest magnitude, the time complexity is $O(n^2)$.

The best case scenario is also $\Omega{(n^2)}$ since selection sort will **not** exit if the list is already sorted.
