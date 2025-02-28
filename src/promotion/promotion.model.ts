import { IShoppingCartItem } from "../shopping_cart/shopping_cart.js";

export enum PromotionTypeEnum {
  BUY_X_FOR_Y = "BUY_X_FOR_Y",
  EACH_SALE_OF_X_COMES_WITH_AN_Y = "EACH_SALE_OF_X_COMES_WITH_AN_Y",
  BUY_X_OR_MORE_TO_GET_A_DISCOUNT_ON_ALL = "BUY_X_OR_MORE_TO_GET_A_DISCOUNT_ON_ALL",
}

export type PromotionFunction = (
  options: Omit<IPromotion, "type"> & {
    item: IShoppingCartItem;
    resultingCart: IShoppingCartItem[];
  }
) => {
  didApply: boolean;

  /** Used to sync a raw constructed items with the database */
  needsSync?: string[];
};

export interface IPromotion {
  type: PromotionTypeEnum;
  sku: string;
  targetQuantity?: number;
  forThePriceOf?: number;
  freeSku?: string;
  discount?: number;
  minQuantity?: number;
  description?: string;
}
