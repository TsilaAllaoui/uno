import { UnoCard, UnoCardColor, UnoCardValue, UnoNumberValue } from "./interfaces/Card";

export const generateUnoCards = (): UnoCard[] => {
  const cards: UnoCard[] = [];

  // Generate cards for each color and value combination
  Object.values(UnoCardColor).forEach((color) => {
    if (color !== UnoCardColor.Unknown) { // Skip Unknown color
      // Generate number cards (0-9)
      if (color != UnoCardColor.WildColor) {
          for (let value = 0; value <= 9; value++) {
            cards.push({ color, value: value as UnoNumberValue });
          }
      }

      // Generate special cards (Skip, Reverse, DrawTwo, WildColor, DrawFour)
      Object.values(UnoCardValue).forEach((specialValue) => {
        if (specialValue !== UnoCardValue.Unknown) { // Skip Unknown value
          // Handle special case for Wild card
          if (specialValue === UnoCardValue.Wild) {
            cards.push({ color: UnoCardColor.WildColor, value: specialValue });
          } else if (color == UnoCardColor.WildColor) {
            cards.push({color, value: UnoCardValue.Wild})
          } else {
            cards.push({ color, value: specialValue });
          }
        }
      });
    }
  });

  return cards;
};

export const getRandomCards = (cards: UnoCard[]): UnoCard[] => {
  const randomCards: UnoCard[] = [];

  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * cards.length);
    const removedCard = cards.splice(randomIndex, 1)[0];
    randomCards.push(removedCard);
  }

  return randomCards;
};