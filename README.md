# CodeCell

## What is it

CodeCell is a text format for creating tables with data and formulas, which is
very useful for viewing and editing files in a plain text editor and storing
them using version control systems. The format consists of commands, each of
which is an assignment consisting of a left part (cell selector) and a right
part (values or formulas), separated by a colon. All cells and ranges of cells
are defined using selectors, and values can be numbers, strings or formulas.
In addition, you can add comments by starting them with the hash symbol #.

### CodeCell example

```codecell raw
A1: 1, 2, 3
--: =A1 * 4, =A2 * A1 + 1, 10
```

It'll render next table

| *     |    A |    B |    C |
| ----- | ---: | ---: | ---: |
| **1** |    1 |    2 |    3 |
| **2** |    4 |    5 |   10 |

For details see: [spec](/docs/spec.md)

## For developers

1. Install vscode
2. Install nodejs
3. Get working copy from https://github.com/rinrab/codecell
4. Open working copy in vscode
5. Open terminal using ctrl+` or View > Terminal
6. Run command `npm run init`. It'll install all needed packages and build project
7. To build full project enter `npm run build` or press ctrl+shift+b and select `npm: build`
8. To start watch typescript press ctrl+shift+b and select project
   {core | tests | www | vscode-extension}
9. Start coding!!!

### vscode extension

1. Open /vscode-extension in vscode
2. Press F5 to run extension