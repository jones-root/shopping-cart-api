import { FastifyRequest } from "fastify";
import { ShoppingCartService } from "./shopping_cart.service";

export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  async dummy(request: FastifyRequest): Promise<void> {
    await this.shoppingCartService.dummy();
  }
}
