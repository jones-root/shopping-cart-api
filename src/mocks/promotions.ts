import { IPromotion, PromotionTypeEnum } from "../promotion/promotion.model.js";

export const mockedPromotions: IPromotion[] = [
  {
    type: PromotionTypeEnum.BUY_X_FOR_Y,
    sku: "120P90",
    targetQuantity: 3,
    forThePriceOf: 2,
    description: "Buy 3 Google Homes for the price of 2",
  },
];
