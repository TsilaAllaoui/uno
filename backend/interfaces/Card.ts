export type UnoNumberValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export enum UnoCardColor{
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
  Yellow = 'yellow',
  WildColor = 'wild',
  Unknown = "Unknown"
}

export enum UnoCardValue{ 
  Skip = 'skip', 
  Reverse = 'reverse',
  DrawTwo = 'drawTwo',
  DrawFour= 'DrawFour',
  Wild = "wildColor",
  Unknown = "Unknown"
}

export interface UnoCard {
  color: UnoCardColor
  value: UnoNumberValue | UnoCardValue;
}