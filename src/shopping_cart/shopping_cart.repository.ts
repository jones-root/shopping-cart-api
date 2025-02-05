import { sleep } from "../core/utils";
import { shopItems } from "../mocks/items";

export class ShoppingCartRepository {
  async findItemsBySkus(skus: string[]) {
    await sleep(500);
    return shopItems.filter(({ sku }) => skus.includes(sku));
  }
}
