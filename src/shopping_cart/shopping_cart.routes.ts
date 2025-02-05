import { FastifyInstance } from "fastify";
import { ShoppingCartController } from "./shopping_cart.controller.js";
import { ShoppingCartService } from "./shopping_cart.service.js";
import { GetShoppingCartTotal } from "./dtos/get_shopping_cart_total.dto.js";
import { ShoppingCartRepository } from "./shopping_cart.repository.js";

// TODO Refactor using typedi or fastify-decorators for specialized dependency injection handling
const shoppingCartRepository = new ShoppingCartRepository();
const shoppingCartService = new ShoppingCartService(shoppingCartRepository);
const shoppingCartController = new ShoppingCartController(shoppingCartService);

export default function (fastify: FastifyInstance) {
  // Get total price and info associated with the shopping cart
  // This endpoint could refer to a existing shopping cart entity or a browser cached version of it when the user is not logged in
  // TODO Allow schema validation of query string and apply GET http verb for this endpoint
  fastify.post(
    "/",
    { schema: { body: GetShoppingCartTotal } },
    async (request, reply) => {
      const data = await shoppingCartController.getTotal(request);
      reply.send(data);
    }
  );
}
