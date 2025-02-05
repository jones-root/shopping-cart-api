export interface IShopItem {
  sku: string; // unique within retail store
  name: string;
  price: number; // cents
}

export interface IShoppingCartItem extends IShopItem {
  quantity: number;
  promotionPrice?: number;
  totalPrice?: number;
}
