# CodeCell
CodeCell - это текстовый формат для содания таблиц с данными и формулами.
Очень ползен для того чтобы смотреть и редактировать файл в обычном текстовом
редакторе и хрония с использованием систем контроля версий

## Структура
Формат CodeCell состоит из из команд. Каждая команда - это присвоение состоящие
из левой части (Cell Selector) и правой (values или формул). Символом между левой и правой
частями является двоедочие `:`. Концом выражения конец строки. Values можно
перечеслять через запятую `,`, тогда каждое следющее значение будет справа от
предыдущего.

Следующий код записывает в ячейку `A1` цифру `3`, а в `A2` значение `A1`
умноженное на 2

```python
A1: 2
A2: =A1 * 2
```

### Cell selector
Cell selector - это ссылка на ячейку которая формируется из колонки и строчки.
Колонка - это один символ в верхнем регистре (ввод его в нижнем регистре
явлется ошибкой), колонки нумируются в алфафитном порядке (`A` - 1st,
`B` - 2nd, ..., `Z` - 26th). Максимальное количество ячеек - 26.
Строчка - это цифра в промежутке [1, ∞]. Определяющая номер строчке
соответсвенно номеру. Cell selector выглядет следующим образом: `D21` где
`D` - это колонка номер 4, а `21` - это строчка равная соответственно 21.
соответсвенно cell selector `D21` - это ссылка на 4 колонку 21 строчки.

### Range cell selector
Range cell selector можно испольсовать в тех же местах что и просто cell
selector. Это ссылка на множество ячеек разделенное при помощи дефиса `-` в 
случае если она в левой части выражения, или двоеточия `:` если встречается в
правой части выражения. Range cell selector включает все ячейки включая
крайние. Выглядет это следующем оразом: `B2-F10` этот пример выделяет все между
[B2, F10]. Каждая из чатстей, на которые разделенно вырожение - это cell
selector. 

Если range cell selector находится в левой части выражения, то все ссылки на 
ячейки правой части будут сдвигатся влево, вниз. Например в вырожение `A2-B2: =A1` 
для элмента `A2` формула будет `=A1`, а для ячейки `B2`. Ссылки на ячейки
сдвинутся в право а 1, формула превратится в `=B2`. Чтобы cell selector не менялся
при сдвиге, можно зафиксировать ось символом `$`. В следующем примере
`A2-B3: =A$1` задаются 4 ячейки. Формула будет менятся следующем образом:

| Левая часть | Правая часть |
|-------------|--------------|
| A2 | =A1 |
| B2 | =B1 |
| A3 | =A1 |
| B3 | =B1 |

Строчка везде будет равна одному значению хотя range selector сдвигается вниз.

### Values
Values может быть одним из следующих типов
* Number - it's just number like `123`, `3.14`
* String - value, can be just writen `abc`, can contains a space
  `This is the CodeCell example!`, and can be in the quota 
  `"This string is in the qouta, thats why we can use the comma an special simbols:)"`
* Expression - all expressions starts with equal `=` simbol, simple expression:
  `=(2+2)*2`, it can contains reference to other cell using cell selector:
  `=(A1+A2+A3)/3` and it can contais formulas and range cell selectors like
  `=ROUND(MEDIAN(A1:A3), 3)` (this expression will calculate medium value of
  A1, A2 and A3 then round it and keep 3 letters after comma).

### Comments
This format allow to add comments to your code. Just add hash before comment
string: 
```python
# My best comment example

# This code will initialize numbers:
# 1 to A cell
# 2 to A2 cell 
# 3 to A3 cell
A1: 1, 2, 3

# Set A2 to sum of A1:C1 cels
A2: =SUM(A1:C1)
```

## Examples
Look at some my examples to understand CodeCell well.

### Calculate power

```python
# This code will show power of numbers
# from 2 to 7

# Initialize base
# Set 1st row to numbers from 2 to 7
A1: 2
B1-F1: =A1 + 1

# Set first row to 1 (n ^ 0)
A2-F2: 1

# Selector 'A2' will transform (for C4
# cell in left part A2 will turn into C3)
# A$1: in this example '&' fixs row, thats
# why for right cells column will change
# but in lower cells it won't change.
A3-F6: =A2 * A$1
```

#### No comment code

```python
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

## Shoping list

Using tables for making shoping list is very popular. Thats why I made this
example.

PS: In this example we'll write formulas at first and link to contant wich placed
lower.

```python
# Fill "full price" column
D2-D6: =B2*C2 

# Calculate sum of all things
C7: "SUM:", =SUM(D2:D6)

# To copy-paste string
A7: ="We need $" & D7 & " to buy those things"

# Data
A1:    "Thing", "Price", "Count", "Full price"
--:   "Banana",    0.99,      51
--:    "Apple",    0.49,      10
--:   "Orange",    2.00,      32
--:  "Charger",   19.90,       1
--:      "Pen",    2.00,    =5*3
```

| *   |A                                    |B     |C     |D         |
|-----|------------------------------------:|-----:|-----:|---------:|
|**1**|Thing                                |Price |Count |Full price|
|**2**|Banana                               |  0.99|    51|     50.49|
|**3**|Apple                                |  0.49|    10|       4.9|
|**4**|Orange                               |     2|    32|        64|
|**5**|Charger                              |  19.9|     1|      19.9|
|**6**|Pen                                  |     2|    15|        30|
|**7**|We need $169.29 to buy those things  |      |SUM:  |    169.29|


PS: I use python syntax highlighter in this markdown documentation due to same comment and quota syntax