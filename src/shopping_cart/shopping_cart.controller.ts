import { FastifyRequest } from "fastify";
import { ShoppingCartService } from "./shopping_cart.service.js";
import { IShopItemsDto } from "./dtos/get_shopping_cart_total.dto.js";
import { IGetShoppingCartTotalResponseDto } from "./dtos/get_shopping_cart_total_response.dto.js";

export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  async getTotal(
    request: FastifyRequest
  ): Promise<IGetShoppingCartTotalResponseDto> {
    const payload: IShopItemsDto = <any>request.body;
    return this.shoppingCartService.getTotal(payload);
  }
}
