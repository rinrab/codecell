# CodeCell

CodeCell is a plain text format for creating tables with data and formulas, which is
very useful for viewing and editing files in a plain text editor and storing
them using version control systems. The format consists of commands, each of
which is an assignment consisting of a left part (cell selector) and a right
part (values or formulas), separated by a colon. All cells and ranges of cells
are defined using selectors, and values can be numbers, strings or formulas.
In addition, you can add comments by starting them with the hash symbol #.

## Structure
The CodeCell format consists of commands, where each command is an assignment
consisting of a left part (Cell Selector) and a right part (values or formulas),
separated by a colon. The delimiter between the left and right parts is a colon
":" and the end of each expression is the end of the line. Values can be listed
separated by commas ",", so that each subsequent value will be to the right of
the previous one.

