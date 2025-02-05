import { IPromotion } from "../core/promotions/promotion.model";

export const promotions: IPromotion[] = [
  {
    buy: { sku: "120P90", eq: 3 }, // Each 3 sales of X, you get it fot the price 2 Xs (considering each multiple e.g. get 6 for the price of 4)
    for: 2,
    description: "Buy 3 Google Homes for the price of 2",
  },
  {
    buy: { sku: "43N23P" }, // Each sale of X, you receive a free Y
    free: { sku: "344222" },
    description: "Each sale of a MacBook Pro comes with a free Raspberry Pi",
  },
  {
    buy: { sku: "A304SD", gte: 3 }, // Buy 3 or more Xs and get a 10% discount of all Xs
    discount: { sku: "A304SD", percentage: 10 },
    description:
      "Buying more than 3 Alexa Speakers will have a 10% discount on all Alexa speakers",
  },
];
