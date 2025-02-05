import "./dotenv.js";
import { PromotionRepository } from "./promotion/promotion.repository.js";
import { PromotionService } from "./promotion/promotions.service.js";
import { createServer } from "./server_config.js";
import { ShoppingCartController } from "./shopping_cart/shopping_cart.controller.js";
import { ShoppingCartRepository } from "./shopping_cart/shopping_cart.repository.js";
import shippingCartRoutes from "./shopping_cart/shopping_cart.routes.js";
import { ShoppingCartService } from "./shopping_cart/shopping_cart.service.js";

const port = Number(process.env.PORT) || 3000;
const app = createServer();

// TODO Refactor using typedi or fastify-decorators for specialized dependency injection handling

const shoppingCartRepository = new ShoppingCartRepository();
const promotionRepository = new PromotionRepository();
const promotionService = new PromotionService(
  promotionRepository,
  shoppingCartRepository
);

const shoppingCartService = new ShoppingCartService(
  shoppingCartRepository,
  promotionService
);
export const shoppingCartController = new ShoppingCartController(
  shoppingCartService
);

app.get("/", (request, reply) => {
  reply.send({ timestamp: new Date(), env: process.env.NODE_ENV });
});

app.register(shippingCartRoutes, { prefix: "shopping_cart" });

app.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
