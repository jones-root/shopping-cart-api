import { IShoppingCartItem } from "../shopping_cart";

export interface IGetShoppingCartTotalResponseDto {
  notFoundSkus: string[];
  totalPrice: number;
  appliedPromotions: number;
  appliedPromotionDescriptions: string[];
  resultingCart: IShoppingCartItem[];
}
