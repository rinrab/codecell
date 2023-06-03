# CodeCell preview

Simple codecell code:

```
A1: 2
B1-F1: =A1 + 1
A2-F2: 1
A3-F6: =A2 * A$1
```

This formula contains only 4 lines (with out comments) and it will render next
table:

| *   |A   |B   |C    |D    |E     |F     |
|-----|---:|---:|----:|----:|-----:|-----:|
|**1**|   2|   3|    4|    5|     6|     7|
|**2**|   1|   1|    1|    1|     1|     1|
|**3**|   2|   3|    4|    5|     6|     7|
|**4**|   4|   9|   16|   25|    36|    49|
|**5**|   8|  27|   64|  125|   216|   343|
|**6**|  16|  81|  256|  625|  1296|  2401|

You can inject it into markdown
```` markdown
# Title

This is a simple markdown with codecell table.

## Table

``` codecell
A1: 2
B1-F1: =A1 + 1
A2-F2: 1
A3-F6: =A2 * A$1
```

## Description

CodeCell code will replace with table.
````
