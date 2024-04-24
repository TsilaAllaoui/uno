import { UnoCardColor, UnoCardValue, UnoNumberValue } from "./Card";

export const colorMapper = new Map<string, UnoCardColor>([
    ['red', UnoCardColor.Red],
    ['blue', UnoCardColor.Blue],
    ['yellow', UnoCardColor.Yellow],
    ['green', UnoCardColor.Green],
    ['wild', UnoCardColor.WildColor],
    ['unknown', UnoCardColor.Unknown]
]);

export const valueMapper = new Map<string, UnoCardValue>([
  ['skip' , UnoCardValue.Skip],
  ['reverse' , UnoCardValue.Reverse],
  ['drawTwo' , UnoCardValue.DrawTwo],
  ['drawFour',UnoCardValue.DrawFour],
  ['wildColor',UnoCardValue.Wild],
  ['unknown', UnoCardValue.Unknown]
])


export const reverseColorMapper = new Map<UnoCardColor, string>([
    [UnoCardColor.Red, 'red'],
    [UnoCardColor.Blue, 'blue'],
    [UnoCardColor.Yellow, 'yellow'],
    [UnoCardColor.Green, 'green'],
    [UnoCardColor.WildColor, 'wild'],
    [UnoCardColor.Unknown, 'unknown']
]);

export const reverseValueMapper = new Map<UnoCardValue | UnoNumberValue, string>([
    [UnoCardValue.Skip, 'skip'],
    [UnoCardValue.Reverse, 'reverse'],
    [UnoCardValue.DrawTwo, 'drawTwo'],
    [UnoCardValue.DrawFour, 'drawFour'],
    [UnoCardValue.Wild, 'wildColor'],
    [UnoCardValue.Unknown, 'unknown'],
    [0, "0"],
    [1, "1"],
    [2, "2"],
    [3, "3"],
    [4, "4"],
    [5, "5"],
    [6, "6"],
    [7, "7"],
    [8, "8"],
    [9, "9"],
]);