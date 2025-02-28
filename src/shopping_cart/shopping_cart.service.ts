import { IGetShoppingCartTotal } from "./dtos/get_shopping_cart_total.dto.js";
import { ShoppingCartRepository } from "./shopping_cart.repository.js";
import { IGetShoppingCartTotalResponseDto } from "./dtos/get_shopping_cart_total_response.dto.js";
import { PromotionService } from "../promotion/promotions.service.js";
import { IShoppingCartItem } from "./shopping_cart.js";

export class ShoppingCartService {
  constructor(
    private readonly shoppingCartRepository: ShoppingCartRepository,
    private readonly promotionService: PromotionService
  ) {}

  async getTotal(
    dto: IGetShoppingCartTotal
  ): Promise<IGetShoppingCartTotalResponseDto> {
    const items = await this.shoppingCartRepository.findItemsBySkus(
      dto.items.map(({ sku }) => sku)
    );

    const notFoundSkus = dto.items
      .filter((item) => !items.some(({ sku }) => item.sku === sku))
      .map(({ sku }) => sku);

    const shoppingCartItems: IShoppingCartItem[] = items.map((item) => {
      const foundCartItem = dto.items.find(({ sku }) => sku === item.sku)!;
      return {
        ...item,
        quantity: foundCartItem.quantity,
        totalPrice: foundCartItem.quantity * item.price,
        promotionPrice: null,
      };
    });

    // Interpret shopping cart for promotions
    const promotionsResult = await this.promotionService.interpret(
      shoppingCartItems
    );

    return { notFoundSkus, ...promotionsResult };
  }
}
