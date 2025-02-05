import { IShopItemsDto } from "./dtos/get_shopping_cart_total.dto";
import { ShoppingCartRepository } from "./shopping_cart.repository";
import { IGetShoppingCartTotalResponseDto } from "./dtos/get_shopping_cart_total_response.dto";

export class ShoppingCartService {
  constructor(
    private readonly shoppingCartRepository: ShoppingCartRepository
  ) {}

  async getTotal(
    dto: IShopItemsDto
  ): Promise<IGetShoppingCartTotalResponseDto> {
    const items = await this.shoppingCartRepository.findItemsBySkus(
      dto.items.map(({ sku }) => sku)
    );

    // TODO Find out what to do if an item is not found or it was found but not with the required quantity
    // For now, the code will consider valid what was found on the database and "fix it" for the user.
    // This is useful because whenever a user makes this request with a stale shopping cart, it will be automatically updated
    const notFoundSkus = dto.items
      .filter((item) => !items.some(({ sku }) => item.sku === sku))
      .map(({ sku }) => sku);

    // Interpret promotions

    return { notFoundSkus };
  }
}
