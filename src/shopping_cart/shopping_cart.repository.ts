import { sleep } from "../core/utils";
import { mockedShopItems } from "../mocks/items";

export class ShoppingCartRepository {
  async findItemsBySkus(skus: string[]) {
    await sleep(500);
    return mockedShopItems.filter(({ sku }) => skus.includes(sku));
  }
}
