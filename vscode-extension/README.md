# CodeCell preview

CodeCell is a text format for creating tables with data and formulas, which is
very useful for viewing and editing files in a plain text editor and storing
them using version control systems. The format consists of commands, each of
which is an assignment consisting of a left part (cell selector) and a right
part (values or formulas), separated by a colon. All cells and ranges of cells
are defined using selectors, and values can be numbers, strings or formulas.
In addition, you can add comments by starting them with the hash symbol #.

Simple codecell code:

```codecell raw
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