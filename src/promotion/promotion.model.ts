import { IShoppingCartItem } from "../shopping_cart/shopping_cart";

export enum PromotionTypeEnum {
  BUY_X_FOR_Y = "BUY_X_FOR_Y",
  EACH_SALE_OF_X_COMES_WITH_AN_Y = "EACH_SALE_OF_X_COMES_WITH_AN_Y",
  BUY_MORE_THAN_X_TO_GET_A_DISCOUNT_ON_ALL = "BUY_MORE_THAN_X_TO_GET_A_DISCOUNT_ON_ALL",
}

export interface IPromotionFunction {
  create: (...args: any) => (item: IShoppingCartItem) => {
    didApply: boolean;
  };
}

export interface IPromotion {
  type: PromotionTypeEnum;
  sku: string;
  targetQuantity?: number;
  forThePriceOf?: number;
  description?: string;
}
