import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ShoppingCartController } from "./shopping_cart.controller";
import { ShoppingCartService } from "./shopping_cart.service";

const shoppingCartService = new ShoppingCartService();
const shoppingCartController = new ShoppingCartController(shoppingCartService);

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: (err?: Error) => void
) {
  fastify.get("/", async (request, reply) => {
    await shoppingCartController.dummy(request);
    reply.send({ ok: true });
  });

  done();
}
