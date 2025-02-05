import { sleep } from "../core/utils/index.js";
import { mockedShopItems } from "../mocks/items.js";

export class ShoppingCartRepository {
  async findItemsBySkus(skus: string[]) {
    await sleep(500);
    return mockedShopItems.filter(({ sku }) => skus.includes(sku));
  }
}
