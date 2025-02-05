export interface IShopItem {
  sku: string; // unique within retail store
  name: string;
  price: number; // cents
}

export interface IShoppingCartItem extends IShopItem {
  quantity: number;
  totalPrice: number;

  /**
   * If `null` or `undefined`, it means there is no promotion for the item.
   *
   * If it is any other number value, it means the item given for tha price (even if it is `0`).
   * */
  promotionPrice?: number | null;
}
