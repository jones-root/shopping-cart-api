import { FastifyInstance } from "fastify";
import { ShoppingCartController } from "./shopping_cart.controller";
import { ShoppingCartService } from "./shopping_cart.service";
import { ShopItemsDto } from "./dtos/shop_items.dto";

const shoppingCartService = new ShoppingCartService();
const shoppingCartController = new ShoppingCartController(shoppingCartService);

export default function (fastify: FastifyInstance) {
  fastify.post(
    "/",
    { schema: { body: ShopItemsDto } },
    async (request, reply) => {
      await shoppingCartController.dummy(request);
      reply.send({ ok: true });
    }
  );
}
