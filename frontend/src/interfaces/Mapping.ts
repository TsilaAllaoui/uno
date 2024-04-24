import { UnoCardColor, UnoCardValue } from "./ICard";

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

export const reverseValueMapper = new Map<UnoCardValue, string>([
    [UnoCardValue.Skip, 'skip'],
    [UnoCardValue.Reverse, 'reverse'],
    [UnoCardValue.DrawTwo, 'drawTwo'],
    [UnoCardValue.DrawFour, 'drawFour'],
    [UnoCardValue.Wild, 'wildColor'],
    [UnoCardValue.Unknown, 'unknown']
]);