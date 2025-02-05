import "./dotenv.js";
import { createServer } from "./server_config.js";
import shippingCartRoutes from "./shopping_cart/shopping_cart.routes.js";

const port = Number(process.env.PORT) || 3000;
const app = createServer();

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
