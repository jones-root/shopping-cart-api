import { FastifyInstance } from "fastify";
import { GetShoppingCartTotal } from "./dtos/get_shopping_cart_total.dto.js";
import { shoppingCartController } from "../main.js";

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
