import { IPromotion, PromotionTypeEnum } from "../promotion/promotion.model.js";

export const mockedPromotions: IPromotion[] = [
  {
    type: PromotionTypeEnum.BUY_X_FOR_Y,
    sku: "120P90",
    targetQuantity: 3,
    forThePriceOf: 2,
    description: "Buy 3 Google Homes for the price of 2",
  },
  {
    type: PromotionTypeEnum.EACH_SALE_OF_X_COMES_WITH_AN_Y,
    sku: "43N23P",
    freeSku: "344222",
    description: "Each sale of a MacBook Pro comes with a free Raspberry Pi",
  },
  {
    type: PromotionTypeEnum.BUY_MORE_THAN_X_TO_GET_A_DISCOUNT_ON_ALL,
    sku: "A304SD",
    minQuantity: 3,
    discount: 10,
    description:
      "Buying 3 Alexa Speakers or more will have a 10% discount on all Alexa speakers",
  },
];
